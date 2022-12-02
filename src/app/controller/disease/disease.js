//utils
const Disease = require('../../models/disease');
const diseaseSchema = require('../../schemas/diseaseSchema');

// Constants
const { STATUS_CODES } = require('../../constants/status/http-codes');
const { ERROR_MSG }  = require('../../constants/status/error-messages');
const logger = require('../../utils/logger');


const ADD_DISEASE = async (req , res) => {
    try{
        const value = await diseaseSchema.validateAsync(req.body)
        const {diseaseName, history, overview, treatment, symptoms, specialistDoctor} = value;

        const checkSameDisease = await Disease.findOne({where:{diseaseName:diseaseName}})
        if (checkSameDisease) {
            return res.send({
                status: ERROR_MSG.EM100,
                status_code: STATUS_CODES.FAILED,
                respone:{
                    message: "disease already exists"
                }
            })
        }
        const addDisease = await Disease.create({diseaseName, history, overview, treatment, symptoms: JSON.stringify(symptoms), specialist: JSON.stringify(specialistDoctor)})
        const logObject = {
            status: 'SUCCESS',
            message: 'User successfully created',
            service: 'user.CREATE_USER',
            payload: 'No Payload'
        }
        logger.info(JSON.stringify(logObject));
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            response: {
                data: addDisease.id
            }
        });
    }catch (error) {
        console.log('error', error)
        const logObject = {
            status: 'FAILED',
            message: error.message,
            service: 'user.CREATE_USER',
            payload: 'No Payload'
        }
        logger.error(JSON.stringify(logObject));
        res.send({
            status: "FAILED",
            status_code: error.statusCode,
            response: {
              message: error.message,
              service: 'user.CREATE_USER',
              payload: 'No Payload'
            }
        });
    }
}
const DISEASE_INFORMATION = async (req, res) => {
    try{
        const {diseaseName} = req.query
        const findDisease = await Disease.findOne({ 
            where: {
                diseaseName: diseaseName
                }
            })
        if(!findDisease){
            return res.send({
                status: "FAILED",
                status_code: STATUS_CODES.NOT_FOUND,
                response: {
                    message: "no disease found"
                }
            })
        }
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            response: {
                data: {
                    diseaseName: findDisease.diseaseName,
                    history: findDisease.history,
                    overview: findDisease.overview,
                    treatment: findDisease.treatment,
                    specialists: JSON.parse(findDisease.specialist),
                    symptoms: findDisease.symptoms
                }
            }
        }); 
    }catch(error){
        const logObject = {
            status: 'FAILED',
            message: error.message,
            service: 'user.CREATE_USER',
            payload: 'No Payload'
        }
        logger.error(JSON.stringify(logObject));
        res.send({
            status: "FAILED",
            status_code: error.STATUS_CODES,
            response: {
              message: error.message,
              service: 'Disease.findDisease',
              payload: 'No Payload'
            }
        });
    }
}
const GET_ALL_DISEASE_INFORMATION = async (req, res) => {
    try{
        const findDisease = await Disease.findAll();
        if(!findDisease){
            return res.send({
                status: "FAILED",
                status_code: STATUS_CODES.NOT_FOUND,
                response: {
                    message: "no disease found"
                }
            })
        }
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            response: {
                data: findDisease
            }
        }); 
    }catch(error){
        const logObject = {
            status: 'FAILED',
            message: error.message,
            service: 'user.CREATE_USER',
            payload: 'No Payload'
        }
        logger.error(JSON.stringify(logObject));
        res.send({
            status: "FAILED",
            status_code: error.STATUS_CODES,
            response: {
              message: error.message,
              service: 'Disease.findDisease',
              payload: 'No Payload'
            }
        });
    }
}
const UPDATE_DISEASE_INFO = async (req, res) => {
    try{
        const {diseaseName} = req.query
        const {diseaseName: diseaseNameUpdate, history, overview, treatment, specialistDoctor, symptoms} = req.body
        const findDisease = await Disease.findOne({
            where: {diseaseName}
        })
        //check if there is a existing disease
        if(!findDisease){
            return res.send({
                status: "FAILED",
                status_code: STATUS_CODES.NOT_FOUND,
                response:{
                    message:"No Disease Found",
                    service:"Disease.findDisease",
                    payload:"No Payload"
                }
            }) 
        }
        const updateDisease = await Disease.update({
            diseaseName: diseaseNameUpdate,
            history,
            overview,
            treatment,
            specialist: JSON.stringify(specialistDoctor),
            symptoms: JSON.stringify(symptoms)
        },{
            where:  {diseaseName}
            
        })
        if(!updateDisease){
            return res.send({
                status: "FAILED",
                status_code: error.STATUS_CODES,
            })
        }
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            response:{
                message: "Update Successfully"
            }
        })
    }catch(err){
        res.send({
            status: "FAILED",
            status_code: STATUS_CODES.NOT_FOUND,
            response:{
                message: err.message,
                service:"Disease.updateDisease",
                payload:"No Payload"
            }
        }) 
    }   
}
const DELETE_DISEASE_INFO = async (req, res) => {
    try{
        const {diseaseName} = req.query
        const findDisease = await Disease.findOne({
            where: {diseaseName}
        })
        if(!findDisease){
            return res.send({
                status: "FAILED",
                status_code: STATUS_CODES.NOT_FOUND,
                response:{
                    message:"No Disease Found",
                    service:"Disease.findDisease",
                    payload:"No Payload"
                }
            }) 
        }
        const deleteDisease = await Disease.destroy({
            where: {diseaseName}
        })
        if(!deleteDisease){
            return res.send({
                status: "FAILED",
                status_code: STATUS_CODES.NOT_FOUND,
                response:{
                    message:"Error Deleting Disease",
                    service:"Disease.destroyDisease",
                    payload:"No Payload"
                }
            }) 
        }
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            response:{
                message: "Delete Successfully",
                service:"Disease.destroyDisease",
                payload:"No Payload"
            }
        })
    }catch(err){
        res.send({
            status: "FAILED",
            status_code: STATUS_CODES.NOT_FOUND,
            response:{
                message: err.message,
                service:"Disease.destroyDisease",
                payload:"No Payload"
            }
        }) 
    }   
}
module.exports = {
    ADD_DISEASE,
    DISEASE_INFORMATION,
    UPDATE_DISEASE_INFO,
    DELETE_DISEASE_INFO,
    GET_ALL_DISEASE_INFORMATION
}