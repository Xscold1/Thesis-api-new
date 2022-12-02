const Joi = require("joi");


const addAdminSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4).max(16),
})

const loginSchema = Joi.object({  
    email: Joi.string().required().email(),
    password: Joi.string().required(),
});

const doctorRegisterSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    specialization: Joi.string().required()
});

const patientRegisterSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    age: Joi.number().required(),
    sex: Joi.string().required()
});

module.exports = {
    loginSchema,
    doctorRegisterSchema,
    addAdminSchema,
    patientRegisterSchema
};
