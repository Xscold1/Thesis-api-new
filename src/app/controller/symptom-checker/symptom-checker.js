// Packages
const axios = require("axios");
const { predictSchema } = require("../../schemas/symptomCheckerSchema");
const SymptomCheckerLog = require("../../models/symptomCheckerLog");
const Dataset = require("../../models/dataset");
const Address = require('../../models/address');
const GENDER_TO_INT = {
  M: 1,
  F: 2,
};
const PREDICT = async (req, res) => {
  try {
    let prediction = null;
    let cleanedBody = {};
    try {
      cleanedBody = await predictSchema.validateAsync(req.body);
    } catch (err) {
      const errorObject = {
        status_code: 400,
        message: err.details[0].message,
      };
      
      throw errorObject;
    }
    const { gender, age, additionalInfo, symptoms, address } = cleanedBody;
    try {
      prediction = await axios.post(`${process.env.MODEL_API_URL}/predict`, {
        input: symptoms,
        gender: GENDER_TO_INT[gender],
        age
      });
    } catch (err) {
      const errorObject = {
        status: "External Server Error",
        status_code: 500,
        message: "Please contact administrator",
      };
      throw errorObject;
    }

    try {
      
      const createAddressRes = await Address.create(address);

      await SymptomCheckerLog.create({
        gender,
        age,
        additionalInfo: JSON.stringify(additionalInfo),
        symptoms: JSON.stringify(symptoms),
        prediction: prediction.data.response ? JSON.stringify(prediction.data.response) : null,
        addressId: createAddressRes.dataValues.id
      });
      // Keep this log for refrence in querying
      //   const findLog = await SymptomCheckerLog.findAll({
      //     include: [
      //     {
      //         model: Address,
      //         required: false, // true = RIGHT JOIN, false = LEFT JOIN. https://stackoverflow.com/questions/27561915/how-can-i-use-left-join-with-sequelize
      //     },
      // ],})
      //   console.log('findLog', findLog[0].toJSON())
    } catch (err) {
      console.log('err', err)
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
      response: {
        data: prediction.data,
      },
    });
  } catch (err) {
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

const GET_LOGS = async (req, res) => {
  try {

    const symptomCheckerLogs = await SymptomCheckerLog.findAll();
    res.send({
      status: "OK",
      status_code: 200,
      response: {
        data: symptomCheckerLogs,
      },
    });
  } catch (err) {
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

const GET_SUPPORTED_SYMPTOMS = async (req, res) => {
  try {
    let datasets = await Dataset.findAll({ where: { status: "AP" } });

    const symptom_additional_info = {
      'Cough': ['0-2 days','3-4 days','5-6 days', 'more than 1 week'],
      'Headache': ['0-7 hours', '8-15 hours', '16-23 hours', 'more than 1 day']
    };
    let symptoms = [];

    for(const dataset of datasets){
      const datasetValue = dataset.dataValues;
      const parsedSymptoms = JSON.parse(datasetValue.symptoms)

      for(const symptom of parsedSymptoms){
        const capitalizedSymptom = symptom.replace(/\b\w/g, l => l.toUpperCase())

        if(symptom_additional_info[symptom]){
          for(const additionalInfoSymptom of symptom_additional_info[symptom]){
            symptoms.push(`${capitalizedSymptom} (${additionalInfoSymptom})`);
          }
        }else{
          symptoms.push(capitalizedSymptom);
        }
       
       
      }
    }

    symptoms = [...new Set(symptoms)];

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully retrieved supported symptoms",
      response: symptoms
    });
  } catch (err) {
    console.log("err", err);
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

const GET_MODELS_ACCURACY = async (req, res) => {
  try {
    const modelsAccuracy = await axios.get(`${process.env.MODEL_API_URL}/models-accuracy`);

    // Do not forget to extract data from python API response
    const {response} = modelsAccuracy.data;

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully retrieved models accuracy",
      response: response
    });
  } catch (err) {
    console.log("err", err);
    if (typeof err === "object") {
      res.send({
        ...err,
      });
    } else {
      res.send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Interval Server Error",
      });
    }
  }
};

const SYMPTOM_ADDITIONAL_INFO = async (req, res) => {
  try {
    // Type days, hours
    const symptom_additional_info = {
      'Cough': ['0-2 days','3-4 days','5-6 days', 'more than 1 week'],
      'Headache': ['0-7 hours', '8-15 hours', '16-23 hours', 'more than 1 day']
    };

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully retrieved symptoms with additional info",
      response: symptom_additional_info
    });
  } catch (err) {
    console.log("err", err);
    if (typeof err === "object") {
      res.send({
        ...err,
      });
    } else {
      res.send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Interval Server Error",
      });
    }
  }
};

module.exports = {
  PREDICT,
  GET_LOGS,
  GET_SUPPORTED_SYMPTOMS,
  GET_MODELS_ACCURACY,
  SYMPTOM_ADDITIONAL_INFO
};
