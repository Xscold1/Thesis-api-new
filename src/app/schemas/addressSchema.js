const joi = require("joi")

const addressSchema = joi.object({
    country: joi.string().required(),
    province: joi.string().required(),
    municipality: joi.string().required(),
    zip: joi.string(),
    barangay: joi.string().required(),
    street: joi.string(),
    longitude: joi.string().required(),
    latitude: joi.string().required(),
    region: joi.string().required()
})

module.exports = addressSchema