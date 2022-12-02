const Joi = require('joi');

const diseaseSchema = Joi.object({
    diseaseName: Joi.string().required(),
    history: Joi.string(),
    treatment: Joi.string(),
    overview: Joi.string(),
    symptoms: Joi.array(),
    specialistDoctor: Joi.array()
});

module.exports = diseaseSchema;