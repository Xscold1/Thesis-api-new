const joi = require('joi');

const hospitalSchema = joi.object({

    hospitalName: joi.string().required(),
    contactInfo: joi.string().required(),
    overview: joi.string().required()
})

module.exports = hospitalSchema
