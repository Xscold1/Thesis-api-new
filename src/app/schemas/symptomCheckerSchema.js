const Joi = require("joi");


const predictSchema = Joi.object({
    gender: Joi.string().allow(null),
    age: Joi.number().allow(null),
    address: Joi.object().allow(null),
    additionalInfo: Joi.object().required(),
    symptoms: Joi.array().required(),
})


module.exports = {  
    predictSchema
};
