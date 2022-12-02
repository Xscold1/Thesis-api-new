const Joi = require("joi");

const addDatasetSchema = Joi.object({
    disease: Joi.string().required(),
    symptoms: Joi.array().required(),
    age: Joi.number().allow(null),
    gender: Joi.string().allow(null),
    additionalInfo: Joi.object(),
    address: Joi.object().allow(null),
})

module.exports = {  
    addDatasetSchema
};
