// Packages
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const path = require('path');

// Models
const User = require('../../models/user');
const Patient = require('../../models/patient');

// Utils
const logger = require('../../utils/logger');
const tokenization = require('../../utils/token');
const transactionHelper = require('../../utils/transaction');
const {patientRegisterSchema, loginSchema} = require('../../schemas/userSchema');
// Constants
const { SUCCESS_MSG } = require('../../constants/status/success-messages');
const { ERROR_MSG } = require('../../constants/status/success-messages');
const { STATUS_CODES } = require('../../constants/status/http-codes');
const { get } = require("http");

const LOGIN_USER = async (req, res) => {3
    try {
        const {email, password} = req.body
        const loginUsers = await User.findOne({where:{email}, include:{model:Patient}})
        if(loginUsers){
            const token = tokenization.generateToken({id:loginUsers.id, email})
            console.log(loginUsers.roleId)
            if(password === loginUsers.password) {
                if(loginUsers.roleId == 1){
                    res.send({
                        status: "OK",
                        status_code: 200,
                        response: {
                            data: {
                                message: "Successful Login as admin",
                                email:loginUsers.email,
                                roleId: loginUsers.id
                            },
                            token
                        }
                    });
                }else if(loginUsers.roleId == 3){
                    res.send({
                        status: "OK",
                        status_code: 200,
                        response: {
                            message: "Successful Login",
                            data: {
                                id: loginUsers.id,
                                firstName: loginUsers.Patient.firstName,
                                lastName: loginUsers.Patient.lastName,
                                age: loginUsers.Patient.age,
                                sex: loginUsers.Patient.sex,
                                address: loginUsers.Patient.address,
                                email:loginUsers.email,
                                roleId: loginUsers.roleId,
                            },
                            token
                        }
                    });
                }else{
                    res.send({
                        status: 'FAILED',
                        status_code: 400,
                        response: {
                            error: 'Cannot Identify Role'
                        }
                    });
                }
            }else {
                res.send({
                    status: 'Internal Server Error',
                    status_code: 401,
                    response: {
                        error: 'Password or email is incorrect'
                    }
                });
            }
        }else{
            res.send({
                status: 'Internal Server Error',
                status_code: 401,
                response: {
                    error: 'Password or email is incorrect'
                }
            });
        }
       
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 400,
            response: {
                error: err.message
            }
        });
    }
};
const REGISTER_USER = async (req, res) => {
    try {
        const {firstName, lastName, sex, age, address} = req.body
        const {email, password} = req.body
        await patientRegisterSchema.validateAsync({firstName, lastName, sex, age, address}) 
        const roleId = 3
        const checkSameEmail = await User.findOne({where:{email}})
        if(checkSameEmail){
            return res.send({
                status:'FAILED',
                status_code:400,
                response:{
                    message:"Email Already Exist",
                    service:"User.RegisterUser"
                }
            })
        }
        const registerEmail =  await User.create({email,password, roleId })
        if(!registerEmail){
            return res.send({
                status:'FAILED',
                status_code:500,
                response:{
                    message:"Failed in creating user",
                    service:"User.RegisterUser"
                }
            })
        }
        const registerPatient = await Patient.create({firstName, lastName, sex, age, address, UserId:registerEmail.id})
        if(!registerPatient){
            return res.send({
                status:'FAILED',
                status_code:500,
                response:{
                    message:"Failed in creating user",
                    service:"User.RegisterUser"
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Successfully Registered",
                sservice:"User.RegisterUser"
            }
        })
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        });
    }
}
const UPDATE_USER = async (req, res) =>{
    try {
        const {id} = req.query
        const updateUserInfo = {
            email: req.body.email,
            password: req.body.password,
        }
        const updatePatientInfo = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            sex: req.body.sex,
            address: req.body.address
        }
        const checkById = await User.findOne({where:{id}})
        if(!checkById){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"User Does Not Exist",
                    service: "User.pdateUser"
                }
            })
        }
        const updateInfo = await User.update(updateUserInfo,{where:{id:id}})
        if(!updateInfo){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Failed to update userInfo",
                    service: "User.pdateUser"
                }
            })
        }
        const updateProfile = await Patient.update(updatePatientInfo,{where:{UserId:checkById.id}})
        if(!updateProfile){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Failed to update Userprofile",
                    service: "User.pdateUser"
                }
            })
        }
        res.send({
            status:"SUCCES",
            status_code:200,
            response:{
                message:"Successfully Update",
                service:"User.updateUser"
            }
        })
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        });
    }
}
const DELETE_USER = async (req, res) =>{
    try {
        const {id} = req.query
        const findByPk = User.findByPk(id,{include:{model:Patient}})
        if(!findByPk){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"User does not exist",
                    service:"User.deleteUser"
                }
            })
        }
        const deleteUser = User.destroy({where:{id}, include:{model:Patient}})
        if(!deleteUser){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"Failed to delete User",
                    service:"User.deleteUser"
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Succesfully deleted user",
                service:"User.deleterUser"
            }
        })
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        }); 
    }
}
const SEARCH_USER_BY_NAME = async (req, res) =>{
    try {
        const {firstName} = req.query
        const findByName = await Patient.findOne({where:{firstName},include:{model:User}})
        if(!findByName){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"User Does Not Exist",
                    service:"User.searchUser"
                }
            })
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Success",
                service:"User.searchUser",
                data:{
                    id: findByName.User.id,
                    firstName: findByName.firstName,
                    lastName: findByName.lastName,
                    age: findByName.age,
                    sex: findByName.sex,
                    address: findByName.address,
                    email: findByName.User.email,
                }
            }
        })
    }
    catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        });
    }
}
const GET_USER_BY_ID = async (req, res) =>{
    try {
        const {id} = req.query
        const findById = await User.findOne({where:{id},include:{model:Patient}})
        if(!findById){
            res.send({
                status:"FAILED",
                status_code: 400,
                response: {
                    message:"User Doest Not Exist",
                    service:"User.getuserbyid"
                }
            });
        }
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Success",
                service:"User.searchUser",
                data:{
                    id:findById.id,
                    firstName: findById.Patient.firstName,
                    lastName: findById.Patient.lastName,
                    age: findById.Patient.age,
                    sex: findById.Patient.sex,
                    address: findById.Patient.address,
                    email: findById.email,
                    password:findById.password
                }
            }
        })
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        });
    }
}
const GET_ALL_USER = async (req, res) =>{
    try {
        let getAllUser = await User.findAll({where:{roleId:3},include:{model:Patient}})
        if(!getAllUser){
            return res.send({
                status:"FAILED",
                status_code:400,
                response:{
                    message:"There are no user in the system",
                    service:"User.getalluser"
                }
            })
        }
        getAllUser = getAllUser.map(e => {
            return{
                id: e.id,
                firstName: e.Patient.firstName,
                lastName: e.Patient.lastName,
                age: e.Patient.age,
                sex: e.Patient.sex,
                address: e.Patient.address,
                email: e.email
            }
        })
        res.send({
            status:"OK",
            status_code:200,
            response:{
                message:"Success",
                service:"User.getalluser",
                data:getAllUser
            }
        })
    } catch (err) {
        res.send({
            status: 'Internal Server Error',
            status_code: 500,
            response: {
                error: err.message
            }
        });
    }
}
module.exports = {
    LOGIN_USER,
    REGISTER_USER,
    UPDATE_USER,
    DELETE_USER,
    SEARCH_USER_BY_NAME,
    GET_USER_BY_ID,
    GET_ALL_USER
};
