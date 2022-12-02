
// const studentService = require("../../services/student/student");
const Dataset = require("../../models/dataset");
const {generateToken} = require('../../utils/token');

// Models
const User = require('../../models/user');
const Doctor = require('../../models/doctor');
const Hospital = require('../../models/hospital');
const Affiliate = require("../../models/affiliate");
const Schedule = require('../../models/schedule');
const { Op } = require("sequelize")

// Utils
const logger = require('../../utils/logger');
const { addDatasetSchema} = require('../../schemas/datasetSchema');

const CREATE_DOCTOR = async (req, res) => {
  console.log('req', req.file)
  try {
      const roleId = "2";
      const {firstName,lastName,specialization} = req.body
      let parsedData = JSON.parse(specialization)
      let arrayOfSpecialization = []
      for(data of parsedData){
        let specializationToUpper = data.charAt(0).toUpperCase() + data.slice(1)
        arrayOfSpecialization.push(specializationToUpper) 
      }
      const createDocotorProfile = await Doctor.create({
        firstName,
        lastName,
        specialization:JSON.stringify(arrayOfSpecialization),
        image_url: 'images/' + req.file.filename
      })

      const logObject = {
          status: 'SUCCESS',
          message: 'User successfully created',
          service: 'user.CREATE_USER',
          payload: 'No Payload'
      }

      logger.info(JSON.stringify(logObject));

      res.send({
          status: "OK",
          status_code: 200,
          response: {
              data: createDocotorProfile.dataValues.id
          }
      });
  } catch (error) {
      const logObject = {
          status: 'Internal Server Error',
          message: error.message,
          service: 'user.CREATE_USER',
          payload: 'No Payload'
      }

      logger.error(JSON.stringify(logObject));
      res.send({
        status: "FAILED",
          status_code: error.statusCode || 500,
          response: {
            message: error.message,
            service: 'user.CREATE_USER',
            payload: 'No Payload'
          }
      });
  }
};
const ADD_DATASET = async (req, res) => {
  try {
    const {userId} = req.authPayload;
    let cleanedBody = {};
    let token = generateToken({userId: 1}) // For testing
    
    try {
      cleanedBody = await addDatasetSchema.validateAsync(req.body);
    } catch (err) {
      const errorObject = {
        status_code: 400,
        message: err.details[0].message,
      };
      throw errorObject;
    }

    const { disease, symptoms, age, gender, additionalInfo } = cleanedBody;
    try {
      await Dataset.create({
        userId,
        age,
        gender,
        disease: disease,
        status: "AP",
        additionalInfo: JSON.stringify(additionalInfo),
        symptoms: JSON.stringify(symptoms),
      });
    } catch (err) {
      console.log('err: ', err)
      const errorObject = {
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      };
      throw errorObject;
    }

    res.send({
      status: "OK",
      status_code: 200,
    });
  
  } catch (err) {
    console.log('err: ', err)
    if (typeof err === "object") {
      res.send({
        ...err,
      });
    } else {
      res.send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
};
const DELETE_DOCTOR = async (req, res) => {
    try {
      const {id} = req.query;
      const findDoctorById = await Doctor.findOne({where: {id}});
      if(!findDoctorById){
        return res.send({
          status: "Not Found",
          status_code: 404,
          response:{
            message:"Doctor not found",
            service: "Doctor.deleteDoctor"
          }
        })
      }
      const deleteDoctor = await Doctor.destroy({where: {id}});
      res.send({
        status: "OK",
        status_code: 200,
        response:{
          message:"Doctor deleted successfully",
          service:"Doctor.deleteDoctor"
        }
      })
    } catch (err) {
      res.send({
        status:"Server Error",
        status_code: 500,
        response:{
          message: err.message,
          service: "Doctor.deleteDoctor",
        }
      })
    }
}
const UPDATE_DOCTOR = async (req, res) => {
  try {
    const {id} = req.query;
    const {firstName, lastName, specialization} = req.body
    const findDoctorById = await Doctor.findOne({id});

    if(!findDoctorById){
        return res.send({
          status: "Not Found",
          status_code: 404,
          response:{
            message:"Doctor not found",
            service: "Doctor.updateDoctor"
          }
        })
    }

    const updateDoctor = await Doctor.update({firstName, lastName, specialization, image_url: 'images/' + req.file.filename},{where: {id}});
    res.send({
      status: "OK",
      status_code: 200,
      response:{
        message:"Doctor Updated successfully",
        service:"Doctor.updateDoctor",
        data:{
          updateDoctor
        }
      }
    })
  } catch (err) {
     res.send({
        status:"Server Error",
        status_code: 500,
        response:{
          message: err.message,
          service: "Doctor.updateDoctor",
        }
      })
    }
}
const GET_DOCTOR_BY_NAME = async (req, res) => {
  try {
    const {lastName} = req.body;
    const findDoctorById = await Doctor.findOne({where:{lastName}});
    if(!findDoctorById){
      return res.send({
        status: "Not Found",
        status_code: 404,
        response:{
          message:"Doctor not found",
          service:"Doctor.GET_DOCTOR_BY_NAME"
        }
      })
    }
    res.send({
      status: "OK",
      status_code: 200,
      response:{
        data: {
          firstName: findDoctorById.firstName,
          lastName: findDoctorById.lastName,
          doctorResidencyAddress: findDoctorById.doctorResidencyAddress,
          doctorLicenseNumber: findDoctorById.doctorLicenseNumber,
          image_url: findDoctorById.image_url
        }
      }
    })
  } catch (err) {
    return res.send({
          status: "Server Error",
          status_code: 500,
          response:{
            message:err.messages,
            service:"Doctor.GET_DOCTOR_BY_NAME"
          }
        })
  }
}
const GET_DOCTOR_BY_ID = async(req, res)=>{
  try {
    const {id} = req.query
    const findById = await Doctor.findByPk(id)
    if(!findById){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"Doctor Does Not Exist",
          service:"Doctor.GET_DOCTOR_BY_ID"
        }
      })
    }
    const findAffiliateId = await Affiliate.findOne({where:{affiliateDoctorId:id}})
    const findHospitalByAffiliateId = await Hospital.findOne({where:{id:findAffiliateId.affiliateHospitalId}})
    res.send({
      status:"OK",
      status_code:200,
      response:{
        message:"Success",
        service:"Doctor.GET_DOCTOR_BY_ID",
        data:{
          id: findById.id,
          firstName: findById.firstName,
          lastName: findById.lastName,
          doctorLicenseNumber: findById.doctorLicenseNumber,
          specialization: findById.specialization,
          image_url: findById.image_url,
          hospitalId: findHospitalByAffiliateId.id
        }
      }
    })
  } catch (err) {
    res.send({
      status:"Server Error",
      status_code: 500,
      response:{
        message: err.message,
        service:"Doctor.GET_DOCTOR_BY_ID"
      }
    })
  }
}
const GET_ALL_DOCTOR = async (req, res) => {
  try {
    let findAllDoctor = await Doctor.findAll()
    findAllDoctor = findAllDoctor.map(e => {
      return {
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        doctorLicenseNumber: e.doctorLicenseNumber,
        specialization: e.specialization,
        image_url: e.image_url,
      }
    })
    for(const doctor of findAllDoctor){
      const affiliateInfo = await Affiliate.findAll({where:{affiliateDoctorId: doctor.id},raw:true, attributes: ['affiliateHospitalId'], });
      doctor.Affiliate = affiliateInfo
    }
    res.send({
      status:"OK",
      statusCode: 200,
      response:{
        message:"SUCCESS",
        service:"Doctor.GET_ALL_DOCTORS",
        data:findAllDoctor
      }
    })
  } catch (err) {
    res.send({
      status:"Server Error",
      status_code: 500,
      response:{
        message: err.message,
        service:"Doctor.GET_ALL_DOCTOR"
      }
    })
  }
}
const CREATE_AFFILIATION = async (req , res) => {
  try {
    const {doctorId} = req.params

    const {contactInfo, hospitalName, schedules} = req.body
    
    const findDoctorById = await Doctor.findOne({where: {id: doctorId}, raw:true})

    if(!findDoctorById) {
      return res.send({
        status:"400",
        statusCode:200,
        response:{
          message:"Doctor does not exist",
          service:"Doctor.addAffiliate"
        }
      })
    }

    const findHospitalByName = await Hospital.findOne({where:{hospitalName}})
    if(!findHospitalByName){
      return res.send({
        status:"FAILED",
        statusCode:400,
        response:{
          message:"Hospital do not exist",
          service:"Doctor.addAffiliate"
        }
      })
    }
    const insertInfo = {
      affiliateHospitalId: findHospitalByName.id,
      affiliateDoctorId: doctorId,
      contactInfo:contactInfo
    }
    const addAffiliate = await Affiliate.create(insertInfo)
    if(!addAffiliate){
      return res.send({
        status:"FAILED",
        statusCode:400,
        response:{
          message:"Failed to create affilation",
          service:"Doctor.createAffiliate"
        }
      })
    }

    for(const schedule of schedules){
      const addSchedule = await Schedule.create({
        day: schedule.day,
        time: schedule.time,
        AffiliateId: addAffiliate.id
      })
      if(!addSchedule){
        return res.send({
          status:"FAILED",
          statusCode:400,
          response:{
            message:"Failed to create schedule",
            service:"Doctor.createSchedule"
          }
        })
      }
    }
  
    res.send({
      status:"OK",
      statusCode:200,
      response:{
        message:"Success",
        service:"Doctor.createAffiliate"
      }
    })

  } catch (err) {
    console.log('err', err)
    res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:{...err},
        service:"Doctor.createAffiliate"
      }
    })
  }

}
const DELETE_AFFILIATION = async (req, res) =>{
  try {
    const {affiliateId} = req.params

    await Affiliate.destroy({where:{id: affiliateId}})

    res.send({
      status:"OK",
      statusCode:400,
      response:{
        message:"Successfully deleted",
        service:"Doctor.Delete Affiliate"
      }
    })
  } catch (err) {
    return res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:err.message,
        service:"Doctor.addAffiliate"
      }
    })
  }
}
const UPDATE_AFFILIATION = async (req, res) =>{
  try {
    const {affiliateId} = req.params

    const {contactInfo, hospitalName, schedules} = req.body

    const findHospitalRes = await Hospital.findOne({name:hospitalName})

    const updateAffiliate = await Affiliate.update({contactInfo}, {where:{id: Number(affiliateId)}})
    if(!updateAffiliate){
      return res.send({
        status:"FAILED",
        statusCode:400,
        response:{
          message:"Failed to create affilation",
          service:"Doctor.createAffiliate"
        }
      })
    }
    await Schedule.destroy({where: {AffiliateId: affiliateId}})
    for(const schedule of schedules){
      const addSchedule = await Schedule.create({
        day: schedule.day,
        time: schedule.time,
        AffiliateId: Number(affiliateId)
      })
      if(!addSchedule){
        return res.send({
          status:"FAILED",
          statusCode:400,
          response:{
            message:"Failed to create schedule",
            service:"Doctor.createSchedule"
          }
        })
      }
    }
  
    res.send({
      status:"OK",
      statusCode:200,
      response:{
        message:"Success",
        service:"Doctor.createAffiliate"
      }
    })

  } catch (err) {
    res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:{...err},
        service:"Doctor.createAffiliate"
      }
    })
  }
}
const GET_ALL_DOCTOR_AFFILIATIONS = async (req, res) =>{
  try {
    const {doctorId} = req.params
    let getAllAffiliates = await Affiliate.findAll({where:{affiliateDoctorId:doctorId},raw:true})
    // console.log('getAllAffiliates', getAllAffiliates)

    for(const affiliate of getAllAffiliates){
      // console.log('affiliate', affiliate)
      const hospital = await Hospital.findAll({where:{id: affiliate.affiliateHospitalId},raw:true, attributes: ['id', 'hospitalName', 'contactInfo', 'image_url'], });
      // console.log('hospital', hospital)

      affiliate.hospital = hospital
    }

    return res.send({
      status: "OK",
      statusCode:400,
      message: 'Successfully get all doctors affiliation',
      response: {
        data: getAllAffiliates
      }
    })
  } catch (err) {
    return res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:err.message,
        service:"Doctor.addAffiliate"
      }
    })
  }
}
const GET_ALL_AFFILIATION_INFO = async (req, res) =>{
  try {
    const {affiliationId} = req.params
    // console.log('affiliationId', affiliationId)
    let getAllAffiliates = await Affiliate.findOne({where:{id:affiliationId},raw:true})


    const hospital = await Hospital.findAll({where:{id: getAllAffiliates.affiliateHospitalId},raw:true, attributes: ['id', 'hospitalName', 'contactInfo'], });

    getAllAffiliates.hospital = hospital 
    getAllAffiliates.schedules = await Schedule.findAll({where:{AffiliateId: getAllAffiliates.id},raw:true, });

    return res.send({
      status: "OK",
      statusCode:200,
      message: 'Successfully get all doctors affiliation',
      response: {
        data: getAllAffiliates
      }
    })
  } catch (err) {
    return res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:err.message,
        service:"Doctor.addAffiliate"
      }
    })
  }
}
const GET_ALL_SPECIALIZATION = async(req, res)=>{
  try {
    let findAllDoctor = await Doctor.findAll({attributes:['specialization']})
    findAllDoctor = findAllDoctor.map(e => {
      return {
        specialization:e.specialization 
      }
    })
    //let parseData = findAllDoctor.map(e => JSON.parse(e.findAllDoctor))
    let arrayOfSpecialization = []
    for(data of findAllDoctor){
      if(data){
        if(arrayOfSpecialization[data] === undefined){
          if(!arrayOfSpecialization.includes(Object.values(data)[0].replace(/[^a-zA-Z ]/g, ""))){
            arrayOfSpecialization.push(Object.values(data)[0].replace(/[^a-zA-Z ]/g, "")) 
          }
        }
      }
    }
    res.send({
      status:"OK",
      status_code:200,
      response:{
        message:"Success",
        service:"Doctor.GET_ALL_SPECIALIZTION",
        data:arrayOfSpecialization
      }
    })
  } catch (err) {
    res.send({
      status:"FAILED",
      status_code:500,
      response:{
        message:"Server Error",
        service:err.message
      }
    })
  }
}
const GET_DOCTOR_BY_SPECIALIZATION = async (req, res)=>{
  try {
    const {specialization} = req.query
    if(!specialization){
      let getAllDoctor = await Doctor.findAll()
      if(!getAllDoctor){
        return res.send({
          status:"FAILED",
          status_code:400,
          response:{
            message:"There are no doctors Availalbe",
            service:"Doctor.GET_DOCTOR_BY_SPECIALIZATION"
          }
        })
      }
      getAllDoctor = getAllDoctor.map(e => {
        return {
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          doctorLicenseNumber: e.doctorLicenseNumber,
          specialization: e.specialization,
          image_url: e.image_url,
        }
      })
      for(const doctor of getAllDoctor){
        const affiliateInfo = await Affiliate.findAll({where:{affiliateDoctorId: doctor.id},raw:true, attributes: ['affiliateHospitalId'], });
        doctor.Affiliate = affiliateInfo
        
      }
      return res.send({
        status: "OK",
        statusCode:200,
        message: 'Successfully ',
        response: {
          data: getAllDoctor
        }
      })

    }
    let findDoctorBySpecialization = await Doctor.findAll({   
      where:{
        specialization:{
          [Op.like]:[`["${specialization}"]`]
        }
      }
    })
    if(!findDoctorBySpecialization){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"There are no doctors Availalbe",
          service:"Doctor.GET_DOCTOR_BY_SPECIALIZATION"
        }
      })
    }
    findDoctorBySpecialization = findDoctorBySpecialization.map(e => {
      return {
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        doctorLicenseNumber: e.doctorLicenseNumber,
        specialization: e.specialization,
        image_url: e.image_url,
      }
    })
    for(const doctor of findDoctorBySpecialization){
      const affiliateInfo = await Affiliate.findAll({where:{affiliateDoctorId: doctor.id},raw:true, attributes: ['affiliateHospitalId'], });
      doctor.Affiliate = affiliateInfo
    }
    res.send({
      status: "OK",
      statusCode:200,
      message: 'Successfully ',
      response: {
        data: findDoctorBySpecialization
      }
    })
  } catch (err) {
    return res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:err.message,
        service:"Doctor.GET_DOCTOR_BY_SPECIALIZATION"
      }
    })
  }
}
const GET_HOSPITAL_BY_AFFILIATATION = async (req, res)=>{
  try {
    const {affiliateDoctorId} = req.query
    const findHospitalByDoctorId = await Affiliate.findOne({where:{affiliateDoctorId}})
    if(!findHospitalByDoctorId){
      return res.send({
        status:"FAILED",
        statusCode:400,
        response:{
          message:"Affiliate Do not Exist",
          service:"Doctor.GET_HOSPITAL_BY_AFFILIATATION"
        }
      })
    }
    res.send({
        status:"OK",
        statusCode:200,
        response:{
          message:"Success",
          service:"Doctor.GET_HOSPITAL_BY_AFFILIATATION",
          data:{
            affiliateHospitalId: findHospitalByDoctorId.affiliateHospitalId
          }
        }
    })
  } catch (err) {
    return res.send({
      status:"Server Error",
      statusCode:500,
      response:{
        message:err.message,
        service:"Doctor.GET_DOCTOR_BY_SPECIALIZATION"
      }
    })
  }
}

module.exports = {
  ADD_DATASET,
  CREATE_DOCTOR,
  DELETE_DOCTOR,
  UPDATE_DOCTOR,
  GET_DOCTOR_BY_NAME,
  GET_ALL_DOCTOR,
  CREATE_AFFILIATION,
  UPDATE_AFFILIATION,
  DELETE_AFFILIATION,
  GET_ALL_DOCTOR_AFFILIATIONS,
  GET_ALL_AFFILIATION_INFO,
  GET_ALL_SPECIALIZATION,
  GET_DOCTOR_BY_ID,
  GET_DOCTOR_BY_SPECIALIZATION,
  GET_HOSPITAL_BY_AFFILIATATION
}
