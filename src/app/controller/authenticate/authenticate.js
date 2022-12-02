//utils
const Disease = require('../../models/disease');
const diseaseSchema = require('../../schemas/diseaseSchema');

// Constants
const { STATUS_CODES } = require('../../constants/status/http-codes');
const { ERROR_MSG }  = require('../../constants/status/error-messages');
const logger = require('../../utils/logger');


const AUTHENTICATE = async (req , res) => {
    try{
        res.send({
            status: "OK",
            status_code: STATUS_CODES.SUCCESS,
            message: 'Successfully Authenticated'
        });
    }catch (error) {
        res.send({
            status: "FAILED",
            status_code: error.statusCode || 500,
            response: {
              message: error.message || 'Please contact Administrator',
              payload: 'No Payload'
            }
        });
    }
}

module.exports = {
    AUTHENTICATE,
}