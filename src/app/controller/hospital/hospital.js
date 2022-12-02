const Doctor = require("../../models/doctor")
const Address = require("../../models/address")
const Hospital = require("../../models/hospital")
const Facility = require("../../models/facility")
const hospitalSchema = require("../../schemas/hospitalSchema")
const addressSchema = require("../../schemas/addressSchema")
const Affiliate = require("../../models/affiliate")
const Schedule = require('../../models/schedule')

const ADD_HOSPITAL = async (req , res) =>{
    try{
        const hospital =  {
            hospitalName: req.body.hospitalName,
            contactInfo:  req.body.contactInfo,
            overview: req.body.overview
        }
        const address = {
            country: req.body.country,
            province: req.body.province,
            region: req.body.region,
            municipality: req.body.municipality,
            zip: req.body.zip,
            barangay: req.body.barangay,
            street: req.body.street,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        }
        const checkHospitalInput = await hospitalSchema.validateAsync(hospital)

        const checkAddressInput = await addressSchema.validateAsync(address)
        
        const checkSameHospital = await Hospital.findOne({where:{hospitalName: hospital.hospitalName}})
        
        if(checkSameHospital){
            return res.send({
                status: "OK",
                code: 400,
                response:{
                    message:"Hospital Already exists",
                    service:"Hospital.Addhospital",
                }
            })
        }
        const createAddress = await Address.create(checkAddressInput)
        const Addressid = createAddress.id
        if (!createAddress){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message:"ERROR IN CREATING HOSPITAL",
                    service:"hospital.AddHospital"
                }
            })
        }
        const createHospital = await Hospital.create({
            ...checkHospitalInput, 
            addressId:Addressid, 
            image_url:'images/' + req.file.filename
        })
        
        if (!createHospital){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message:"ERROR IN CREATING HOSPITAL",
                    service:"hospital.AddHospital"
                }
            })
        }
        res.send({
            status: "OK",
            status_code: 200,
            response:{
                message:"Success",
                service:"Hospital.Addhospital",
            }
        })
    }catch(err){
        res.send({
            status: "FALLED",
            statusCode: 500,
            response:{
                message: err.message,
                service: "Hospital.Addhospital"
            }
        })
    }
}
const DELETE_HOSPITAL = async (req, res) => {
    try {
        const id = req.query.id
        const deleteById = await Hospital.destroy({where:{id:id}})
        if(!deleteById){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message: "Hospital id does not exist",
                    service: "Hospital.deleteHospital",
                }
            })
        }
        res.send({
            status:"OK",
            statusCode:"200",
            response:{
                message: "Success",
                service: "Hospital.deleteHospital",
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            statusCode:500,
            response:{
                message: err.message,
                service: "Hospital.deleteHospital",
            }
        })
    }
}
const UPDATE_HOSPITAL = async (req, res) => {
    try {
        const id = req.query.id
        const hospitalInfoUpdate = {
            hospitalName:req.body.hospitalName,
            contactInfo:req.body.contactInfo,
            image_url: 'images/' + req.file.filename,
            overview: req.body.overview
        }
        const address = {
            country: req.body.country,
            province: req.body.province,
            municipality: req.body.municipality,
            zip: req.body.zip,
            region: req.body.region,
            barangay: req.body.barangay,
            street: req.body.street,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        }
        const checkById = await Hospital.findOne({where: {id: id}, include:{model:Address}})
        if(!checkById){
            return res.send({
                status:"FAILED",
                statusCode:"404",
                response:{
                    message: "Hospital does not exist",
                    service: "Hospital.updateHospital",
                }
            })
        }
        const updateHospital = await Hospital.update(hospitalInfoUpdate,{where:{id: id}})
        const updateHospitalAddress = await Address.update(address, {where:{id: checkById.addressId}})
        if(!updateHospital && !updateHospitalAddress){
            return res.send({
                status:"FAILED",
                statusCode:"404",
                response:{
                    message: "Error in updating Hospital info",
                    service: "Hospital.updateHospital",
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message: "Success",
                service: "Hospital.updateHospital",
                hospitalInfo:hospitalInfoUpdate,
                hospitalAddressInfo:address
            }
        })
        
    } catch (err) {
        res.send({
            status:"FAILED",
            status_code:500,
            response:{
                message: err.message,
                service: "Hospital.updateHospital",
            }
        })
    }
}
const GET_HOSPITAL_BY_NAME = async (req, res) => {
    try {
        const {id} = req.query
        const fetchHospital = await Hospital.findOne({
            where:{
                id:id
            },
            include:{
                model:Address,
            }
        })
        if(!fetchHospital){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message:"Hospital do not exist",
                    service:"Hospital.gethospitalById"
                }
            })
        }
        //to get all facility 
        let getAllFacility = await Facility.findAll({where:{HospitalId:fetchHospital.id}})
        getAllFacility = getAllFacility.map(e =>{ 
            return{
                facilityName: e.facilityName,
                image_url: e.image_url
            }
        })
        //to get all affiliated docotors
        let getAffiliateDoctor = await Affiliate.findAll({where:{affiliateHospitalId:fetchHospital.id}})
        
        // to iterate through the affiiate table and find all doctor id that has a relationship with the hospital id
        getAffiliateDoctor = getAffiliateDoctor.map(e => e.affiliateDoctorId)
        
        let getDoctorById = await Doctor.findAll({
            
            where:{
                id:getAffiliateDoctor
            },
            raw: true
        })

        // to map all the information of the doctor 
        getDoctorById = getDoctorById.map(e =>{   
            return{
                id: e.id,
                firstName: e.firstName,
                lastName: e.lastName,
                doctorResidencyAddress: e.doctorResidencyAddress,
                doctorLicenseNumber: e.doctorLicenseNumber,
                specialization: e.specialization,
                image_url: e.image_url
            }
        })
        for (const doctor of getDoctorById){
            const affiliate =  await Affiliate.findOne({where:{affiliateDoctorId: doctor.id, affiliateHospitalId: id},raw:true})

            doctor.schedule = await Schedule.findAll({where:{AffiliateId: affiliate.id},raw:true})
            
        }
        if(!fetchHospital){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message: "hospital doese not exist",
                    service: "Hospital.searchhospital",
                }
            })
        }
        res.send({
            status:"OK",
            statusCode:200,
            response:{
                message: "SUCCESS",
                service: "Hospital.searchhospital",
                data:{
                    Hospital_Data:{
                    HospitalName: fetchHospital.hospitalName,
                    overview: fetchHospital.overview,
                    barangay: fetchHospital.Address.barangay,
                    country: fetchHospital.Address.country,
                    province: fetchHospital.Address.province,
                    region: fetchHospital.Address.region,
                    municipality: fetchHospital.Address.municipality,
                    zip: fetchHospital.Address.zip,
                    street: fetchHospital.Address.street,
                    longitude: fetchHospital.Address.longitude,
                    latitude: fetchHospital.Address.latitude,
                    contactInfo: fetchHospital.contactInfo,
                    image_url: fetchHospital.image_url
                },
                    Doctor_Data:getDoctorById,
                    Facility_Data:getAllFacility
            }
                
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            statusCode:500,
            response:{
                message: err.message,
                service: "Hospital.searchhospital",
            }
        })
    }
}
const GET_ALL_HOSPITAL = async (req, res) => {
    try {
        let findAll = await Hospital.findAll({include:{model:Address}})
        if(!findAll){
            return res.send({
                status:"FAILED",
                statusCode:400,
                response:{
                    message: "there are no hospital to display",
                    service: "Hospital.getAllHospital",
                }
            })
        }
        findAll = findAll.map(e=>{
            return {
                id: e.id,
                hospitalName: e.hospitalName ? e.hospitalName : '',
                image_url: e.image_url ? e.image_url : '',
                barangay: e.Address ? e.Address.barangay : '',
                country: e.Address ? e.Address.country : '',
                province: e.Address ? e.Address.province : '',
                region: e.Address ? e.Address.region : '',
                municipality: e.Address ? e.Address.municipality : '',
                zip: e.Address ? e.Address.zip : '',
                street: e.Address ? e.Address.street : '',
                latitude: e.Address ? e.Address.latitude : '',
                longitude: e.Address ? e.Address.longitude : ''
            }
        })
        res.send({
            status:"OK",
            statusCode:200,
            response:{
                message: "SUCCESS",
                service: "Hospital.fetchAllHospital",
                data: findAll
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            statusCode:500,
            response:{
                message: err.message,
                service: "Hospital.updateHospital",
            }
        })
    }
}
const ADD_HOSPITAL_FACILITY = async (req, res) => {
    try {
        const {id} = req.params
        const info = req.body
        const findByPk = await Hospital.findByPk(id)
        if(!findByPk){
            return res.send({
                status:"FAILED",
                statusCode:"404",
                response:{
                    message: "Hospital does not exist",
                    service: "Hospital.AddFacility",
                }
            })
        }
        const addFacility = await Facility.create({facilityName:req.body.facilityName,image_url: 'images/' + req.file.filename, HospitalId:id})
        if(!addFacility){
            return res.send({
                status:"FAILED",
                statusCode:"404",
                response:{
                    message: "Failed to add Facility",
                    service: "Hospital.AddFacility",
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message: "Successfully added",
                service: "Hospital.addFacility",
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            status_code:500,
            response:{
                message: err.message,
                service: "Hospital.addFacility",
            }
        })
    }
}
const DELETE_HOSPITAL_FACILITY = async (req, res) => {
    try {
        const {facilityId} = req.params
        const info = req.body
        await Facility.destroy({where: {id:facilityId}})

        res.send({
            status:"OK",
            statusCode:200,
            response:{
                message: "Successfully deleted fcility",
                service: "Hospital.DELETE_HOSPITAL_FACILITY",
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            statusCode:500,
            response:{
                message: err.message,
                service: "Hospital.DELETE_HOSPITAL_FACILITY",
            }
        })
    }
}
const UPDATE_HOSPITAL_FACILITY = async (req, res) => {
    try {
        const {facilityId} = req.params
        console.log('facilityId', facilityId)
        const info = req.body

        const addFacility = await Facility.update({facilityName:info.facilityName},{where:{id: facilityId}})
        if(!addFacility){
            return res.send({
                status:"FAILED",
                statusCode:"404",
                response:{
                    message: "Failed to update Facility",
                    service: "Hospital.UPDATE_HOSPITAL_FACILITY",
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message: "Successfully updated facility",
                service: "Hospital.UPDATE_HOSPITAL_FACILITY",
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            status_code:500,
            response:{
                message: err.message,
                service: "Hospital.UPDATE_HOSPITAL_FACILITY",
            }
        })
    }
}
const GET_ALL_FACILITY_BY_HOSPITAL_ID = async (req, res) => {
    try {
        const {hospitalId} = req.params

        const info = req.body
        // console.log('info', info)

        const getHospitalFacities = await Facility.findAll({where:{HospitalId: hospitalId}})

        res.send({
            status:"OK",
            statusCode:200,
            response: {
                message: "Successfully get the HospitalFacities",
                data: getHospitalFacities
            }
        })
    } catch (err) {
        console.log('err', err)
        res.send({
            status:"FAILED",
            statusCode:500,
            response:{
                message: err.message,
                service: "Hospital.GET_ALL_FACILITY_BY_HOSPITAL_ID",
            }
        })
    }
}
const GET_HOSPITAL_BY_BARANGAY = async (req, res)=>{
    try {
       const {barangay, municipality} = req.body
       if(!barangay){
        let searchHospitalByMunicipality = await Hospital.findAll({
            
            include:{
                model:Address,
                where:{
                    municipality
                }
            }
        })
        console.log('searchHospitalByMunicipality', searchHospitalByMunicipality)
        if(!searchHospitalByMunicipality){
            return res.send({
                status:"FAILED",
                statusbar:400,
                response:{
                    message:"There are no hospital in this barangay",
                    service:"Hospital.searchHospitalByMunicipality"
                }
            })
        }
        searchHospitalByMunicipality = searchHospitalByMunicipality.map(e => {
            return{
                id: e.id,
                hospitalName: e.hospitalName ? e.hospitalName : '',
                barangay: e.Address ? e.Address.barangay : '',
                municipality: e.Address ? e.Address.municipality : '',
                province: e.Address ? e.Address.province : '',
                longitude: e.Address ? e.Address.longitude : '',
                latitude: e.Address ? e.Address.latitude : '',
                image_url: e.image_url ? e.image_url : '',
                contactInfo: e.contactInfo ? e.contactInfo : ''
            }
           })
           return res.send({
            status:"OK",
                status_code:200,
                response:{
                    message: "Success",
                    service: "Hospital.searchHospitalByMunicipality",
                    data:searchHospitalByMunicipality
                }
           })
       }
       let searchHospitalByBarangay = await Hospital.findAll({
        include:{
            model:Address,
            where:{
                barangay
            }
        }
    })
    if(!searchHospitalByBarangay){
        return res.send({
            status:"FAILED",
            status_code:400,
            response:{
                message:"There are no hospital in this barangay",
                service:"Hospital.searchHospitalByBarangay"
            }
        })
    }
       searchHospitalByBarangay = searchHospitalByBarangay.map(e => {
        return {
            id: e.id,
            hospitalName: e.hospitalName ? e.hospitalName : '',
            barangay: e.Address ? e.Address.barangay  : '',
            municipality: e.Address ? e.Address.municipality : '',
            province: e.Address ? e.Address.province : '',
            longitude: e.Address ? e.Address.longitude : '',
            latitude: e.Address ? e.Address.latitude : '',
            image_url: e.image_url ? e.image_url : '',
            contactInfo: e.contactInfo ? e.contactInfo : ''
        }
       })
       res.send({
        status:"OK",
            status_code:200,
            response:{
                message: "Success",
                service: "Hospital.searchHospitalByBarangay",
                data:searchHospitalByBarangay
            }
       })
    } catch (err) {
        res.send({
            status:"FAILED",
            status_code:500,
            response:{
                message: err.message,
                service: "Hospital.searchHospitalByBarangay",
            }
        })
    }
}
const GET_FACILITY_BY_ID = async (req, res)=>{
    try {
        const {id} = req.query
        const findByPk = await Facility.findByPk(id)
        if(!findByPk){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Facility Do Not Exist",
                    service:"Facility.GET_FACILITY_BY_ID"
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Success",
                service:"Facility.GET_FACILITY_BY_ID",
                data:{
                    facilityName: findByPk.facilityName,
                    image_url: findByPk.image_url
                }
            }
        })
    } catch (err) {
        res.send({
            status:"FAILED",
            status_code:500,
            response:{
                message: err.message,
                service: "Hospital.searchHospitalByBarangay",
            }
        })
    }
}
module.exports = {
    ADD_HOSPITAL,
    DELETE_HOSPITAL,
    UPDATE_HOSPITAL,
    GET_HOSPITAL_BY_NAME,
    GET_ALL_HOSPITAL,
    ADD_HOSPITAL_FACILITY,
    DELETE_HOSPITAL_FACILITY,
    UPDATE_HOSPITAL_FACILITY,
    GET_ALL_FACILITY_BY_HOSPITAL_ID,
    GET_HOSPITAL_BY_BARANGAY,
    GET_FACILITY_BY_ID
}