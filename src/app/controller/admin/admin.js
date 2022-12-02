const Doctor = require('../../models/doctor')
const Hospital = require('../../models/hospital')
const SymptomCheckerLog = require('../../models/symptomCheckerLog')
const User = require('../../models/user')
const {addAdminSchema} = require('../../schemas/userSchema')

const ADD_ADMIN = async (req, res) => {
    try {
        const adminInfo = await addAdminSchema.validateAsync(req.body)
        const roleId = 1
        const checkSameEmail = await User.findOne({where:{email:adminInfo.email}})

        if(checkSameEmail){
            return res.send({
                status:"FAILED",
                status_code:400,
                respone:{
                    message:"Email is already used",
                    service:"Admin.addAdmin",
                }
            })
        }

        const createAdmin = await User.create({...adminInfo, roleId:roleId})

        if(!createAdmin){
            return res.send({
                status: "FAILED",
                status_code:400,
                respone:{
                    message:"Failed to create Admin",
                    service:"Admin.addAdmin"
                }
            })
        }
        
        res.send({
            status:"OK",
            status_code:200,
            respone:{
                message:"Admin Created",
                service:"Admin.addAdmin"
            }
        })
    } catch (err) {
       res.send({
        status:"Server Error",
        status_code:500,
        respone:{
            message:err.message,
            service:"Admin.addAdmin"
        }
       }) 
    }
}

const DELETE_ADMIN = async (req, res) => {
    try {
        const {id} = req.params
        const findAdminById = await User.findByPk(id)
        if(!findAdminById){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Admin Do not Exist",
                    service:"Admin.deleteAdmin"
                }
            })
        }
        const deleteAdmin = await User.destroy({where:{id}})
        if(!deleteAdmin){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Error in deleting admin",
                    service:"Admin.deleteAdmin"
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            respone:{
                message:"Success",
                service:"Admin.deleteAdmin"
            }
        })
    } catch (err) {
        res.send({
            status:"Server Error",
            status_code:500,
            respone:{
                message:err.message,
                service:"Admin.deleteAdmin"
            }
        })
    }
}

const UPDATE_ADMIN = async (req, res) =>{
    try {
        const {id} = req.params
        const updateInfo = req.body
        const checkAdminById = await User.findByPk(id)
        if(!checkAdminById){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Admin do not exist",
                }
            })
        }
        const updateAdmin = await User.update(updateInfo, {where:{id}})
        if(!updateAdmin){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Error in Updating admin",
                    service:"Admin.updateAdmin",
                    
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Successfully Updated",
                service:"Admin.updateAdmin",
                data:{
                    ...updateInfo
                }
            }
        })
    } catch (err) {
        res.send({
            status:"Server Error",
            status_code:500,
            respone:{
                message:err.message,
                service:"Admin.updateAdmin"
            }
        })
    }
}

const GET_ALL_ADMIN = async (req, res) =>{
    try {
        let getAllAdmin = await User.findAll({raw:true})
        getAllAdmin = getAllAdmin.map(e => {
            return {
                email: e.email,
                password: e.password
            }
        })
        res.send({
            status:"OK",
            status_code:200,
            respone:{
                message:"Success",
                service:"Admin.getAllAdmin",
                data:getAllAdmin
            }
        })
    } catch (err) {
        res.send({
            status:"Server Error",
            status_code:500,
            respone:{
                message:err.message,
                service:"Admin.getAllAdmin"
            }
        })
    }
}

const ADMIN_DASHBOARD = async (req, res) =>{
    try {
        const countAllHospital = await Hospital.count()
        const countAllDoctors = await Doctor.count()
        const countSymptomsCheckUsage = await SymptomCheckerLog.count()
        res.send({
            status:"OK",
            status_code:200,
            respone:{
                message:"Success",
                service:"admin.GetadminDashboard",
                data:{
                    hospitalCount:countAllHospital,
                    doctorsCount:countAllDoctors,
                    sypmtomsCheckerUsageCount:countSymptomsCheckUsage
                }
            }
        })
    } catch (error) {
        res.send({
            status:"Server Error",
            status_code:500,
            respone:{
                message:err.message,
                service:"Admin.getAllAdmin"
            }
        })
    }
}
module.exports = {
    ADD_ADMIN,
    DELETE_ADMIN,
    UPDATE_ADMIN,
    GET_ALL_ADMIN,
    ADMIN_DASHBOARD
}