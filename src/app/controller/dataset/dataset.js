// Packages
const axios = require("axios");
const Dataset = require("../../models/dataset");
const Address = require('../../models/address');
const mockDataset = require("./mock-dataset-format.json");
const {generateToken} = require('../../utils/token');
const GENDER_TO_INT = {
  M: 1,
  F: 2,
};
const { addDatasetSchema} = require('../../schemas/datasetSchema');
const CREATE = async (req, res) => {
  try {
    // If MOCK_DATASET we will use database datasets else we will use mock datasets
    if (process.env.MOCK_DATASET === "false") {
      let datasetFormat = {};
      let diseaseDatasetCount = {};
      let datasets = await Dataset.findAll({ where: { status: "AP" } });

      let additionalInfos = [];

      // Couting rows per disease
      for (const dataset of datasets) {
        const datasetValue = dataset.dataValues;
        if (diseaseDatasetCount[datasetValue.disease]) {
          diseaseDatasetCount[datasetValue.disease] += 1;
        } else {
          diseaseDatasetCount[datasetValue.disease] = 1;
        }
      }

      // Getting the lowest number of disease dataset
      const countArray = [];
      for (const diseaseCount of Object.keys(diseaseDatasetCount)) {
        countArray.push(diseaseDatasetCount[diseaseCount]);
      }
      const minimumValue = Math.min(...countArray);
      const dataToRemove = [];

      // Make the all the disease data have equal value, for example if the Pneumonia have 6 rows and we have 2 rows for Asthma ->
      // our minimum here is 2, with this we will filter our datasets and we will only 2 rows for Pneumonia, and 2 rows for Asthma, this is practice in Machine Learning
      for (const [index, dataset] of datasets.entries()) {
        const datasetValue = dataset.dataValues;

        if (diseaseDatasetCount[datasetValue.disease] > minimumValue) {
          diseaseDatasetCount[datasetValue.disease] -= 1;
          dataToRemove.push(datasetValue.id);
        }
      }

      // Filtering the data
      datasets = datasets.filter((dataset) => {
        return !dataToRemove.includes(dataset.id);
      });

      // Creation of dataset format, with filtered data
      for (const dataset of datasets) {
        const datasetValue = dataset.dataValues;
        const parseAdditionalinfo = JSON.parse(datasetValue.additionalInfo);

        // Retriving additional infos
        additionalInfos = [...additionalInfos, ...Object.keys(parseAdditionalinfo)]
        
        if (datasetFormat[datasetValue.disease]) {
          // Adding new colums in the disease and only retaining unique values
          datasetFormat[datasetValue.disease] = [
            ...new Set([
              ...datasetFormat[datasetValue.disease],
              ...JSON.parse(datasetValue.symptoms),
            ]),
          ];
        } else {
          // If there are no current entry for a disease this will just append the new data in the diease property
          datasetFormat[datasetValue.disease] = JSON.parse(
            datasetValue.symptoms
          );
        }
      }
    
      additionalInfos = [...new Set(additionalInfos)]

      // Create datasets CSV
      try {
        const createDatasetPayload = {
          input: JSON.stringify(datasetFormat),
          additionalInfo:  additionalInfos
        };

        const createDatasetResponse = await axios.post(
          `${process.env.MODEL_API_URL}/create-dataset`,
          createDatasetPayload
        );

      } catch (err) {
        const errorObject = {
          status: "External Server Error",
          status_code: 500,
          message: "Please contact administrator",
        };
        throw errorObject;
      }

      // Adding of datasets
      for (const dataset of datasets) {
        try {
          const datasetValue = dataset.dataValues;
          let urlPath = `${process.env.MODEL_API_URL}/add-dataset?inputDisease=${datasetValue.disease}`;

          if(dataset.age){
            urlPath += `&age=${datasetValue.age}`
          }

          if(dataset.gender){
            urlPath += `&gender=${GENDER_TO_INT[datasetValue.gender] ? GENDER_TO_INT[datasetValue.gender]: null}`
          }

          await axios.post(
           urlPath, {
              input: JSON.parse(datasetValue.symptoms),
              additionalInfo: JSON.parse(datasetValue.additionalInfo)
            });
        } catch (err) {
          const errorObject = {
            status: "External Server Error",
            status_code: 500,
            message: "Please contact administrator",
          };
          throw errorObject;
        }
      }

      // Create model
      await axios.get(`${process.env.MODEL_API_URL}/create-model`);

      // Create disease symptoms json file in the symptom checker api, that will be used for validation
      const diseaseSymptoms = await DISEASE_SYMPTOMS_LIST({datasets});
        const diseaseSymptomsPayload = {
          input: JSON.stringify(diseaseSymptoms),
        };

      
      await axios.post(`${process.env.MODEL_API_URL}/create_disease_symptoms`, diseaseSymptomsPayload);

    } else {
      // Create datasets with mockdata
      try {
        const createDatasetPayload = {
          
          input: JSON.stringify(mockDataset),
          additionalInfo: {}
        };

        const createDatasetRes = await axios.post(
          `${process.env.MODEL_API_URL}/create-dataset`,
          createDatasetPayload
        );
        // console.log('createDatasetRes', createDatasetRes)
        // Create model
        const createModelRes = await axios.get(`${process.env.MODEL_API_URL}/create-model`);

        // Create disease symptoms json file in the symptom checker api, that will be used for validation
        const diseaseSymptomsPayload = {
          input: JSON.stringify(mockDataset),
          
        };  
        await axios.post(`${process.env.MODEL_API_URL}/create_disease_symptoms`, diseaseSymptomsPayload);
      } catch (err) {
        console.log('err', err)
        const errorObject = {
          status: "External Server Error",
          status_code: 500,
          message: "Please contact administrator",
        };
        throw errorObject;
      }
    }

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully created dataset",
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

const GET_DATASETS = async (req, res) => {
  try {
    let datasets = await Dataset.findAll({ where: { status: "AP" } });

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully fetched datasets",
      data: {
        datasets,
      },
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
const DISEASE_SYMPTOMS = async (req, res) => {
  const {disease} = req.query;
  let data = null;

  try {
    // If MOCK_DATASET we will use database datasets else we will use mock datasets
    if (process.env.MOCK_DATASET === "false") {
      let datasetFormat = {};
      let diseaseDatasetCount = {};
      let datasets = await Dataset.findAll({ where: { status: "AP", disease: disease } });

      let additionalInfos = [];
  
      // Couting rows per disease
      for (const dataset of datasets) {
        const datasetValue = dataset.dataValues;
        if (diseaseDatasetCount[datasetValue.disease]) {
          diseaseDatasetCount[datasetValue.disease] += 1;
        } else {
          diseaseDatasetCount[datasetValue.disease] = 1;
        }
      }

      // Getting the lowest number of disease dataset
      const countArray = [];
      for (const diseaseCount of Object.keys(diseaseDatasetCount)) {
        countArray.push(diseaseDatasetCount[diseaseCount]);
      }
      const minimumValue = Math.min(...countArray);
      const dataToRemove = [];

      // Make the all the disease data have equal value, for example if the Pneumonia have 6 rows and we have 2 rows for Asthma ->
      // our minimum here is 2, with this we will filter our datasets and we will only 2 rows for Pneumonia, and 2 rows for Asthma, this is practice in Machine Learning
      for (const [index, dataset] of datasets.entries()) {
        const datasetValue = dataset.dataValues;

        if (diseaseDatasetCount[datasetValue.disease] > minimumValue) {
          diseaseDatasetCount[datasetValue.disease] -= 1;
          dataToRemove.push(datasetValue.id);
        }
      }

      // Filtering the data
      datasets = datasets.filter((dataset) => {
        return !dataToRemove.includes(dataset.id);
      });

      // Creation of dataset format, with filtered data
      for (const dataset of datasets) {
        const datasetValue = dataset.dataValues;
        const parseAdditionalinfo = JSON.parse(datasetValue.additionalInfo);

        // Retriving additional infos
        additionalInfos = [...additionalInfos, ...Object.keys(parseAdditionalinfo)]
        
        if (datasetFormat[datasetValue.disease]) {
          // Adding new colums in the disease and only retaining unique values
          datasetFormat[datasetValue.disease] = [
            ...new Set([
              ...datasetFormat[datasetValue.disease],
              ...JSON.parse(datasetValue.symptoms),
            ]),
          ];
        } else {
          // If there are no current entry for a disease this will just append the new data in the diease property
          datasetFormat[datasetValue.disease] = JSON.parse(
            datasetValue.symptoms
          );
        }
      }

      additionalInfos = [...new Set(additionalInfos)]

      data = datasetFormat

    } else {
      data = {[disease]: mockDataset[disease]}
    }
    
    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully created dataset",
      data: {
        result: data 
      }
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

const DISEASE_SYMPTOMS_LIST = async({datasets})=>{
  try {
    const datasetsAnalytics = {
      diseaseCommonSymptoms: {},
    }

    for(const dataset of datasets){
      const datasetValue = dataset.dataValues;
      const parsedSymptoms = JSON.parse(datasetValue.symptoms)
      // Disease common symptoms datasets
      for(const symptom of parsedSymptoms){
        const capitalizedSymptom = symptom.replace(/\b\w/g, l => l.toUpperCase())
        if(datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease] === undefined){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease] = {}
        }

        if(datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] === undefined){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] =1
        }else if (datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom]){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] +=1
        }
      }
    }
    
    const diseaseSypmtoms = {};
    
    for(const dat of Object.keys(datasetsAnalytics.diseaseCommonSymptoms)){
      diseaseSypmtoms[dat] = Object.keys(datasetsAnalytics.diseaseCommonSymptoms[dat])
    }
    return diseaseSypmtoms;
  
  } catch (err) {
    console.log('err', err)
  }
}

const UPDATE_DATASET = async (req, res) => {
  try {
    const {id, status} = req.body;

    await Dataset.update({status}, { where: { id: id } } );

    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully updated dataset"
    });
  } catch (err) {
    console.log("err", err);
    if (typeof err === "object") {
      res.send({
        status: "Internal Server Error",
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

const ADD_DATASET = async (req, res) => {
  try {
    const {userId} = req.authPayload;
    let cleanedBody = {};
    let token = generateToken({userId: 1}) // For testing
    
    try {
      cleanedBody = await addDatasetSchema.validateAsync(req.body);
    } catch (err) {
      const errorObject = {
        status_code: 400,
        message: err.details[0].message,
      };
      throw errorObject;
    }

    const { disease, symptoms, age, gender, additionalInfo, address } = cleanedBody;
    try {
      const createAddressRes = await Address.create(address);
      const convertToArray = Object.values(symptoms).map(trimmedSymptoms => trimmedSymptoms.toLowerCase().trim())
      const stringSymptoms = JSON.stringify(convertToArray)
      await Dataset.create({
        userId,
        age,
        gender,
        disease: disease.toLowerCase().trim(),
        status: "AP",
        additionalInfo: JSON.stringify(additionalInfo),
        symptoms: stringSymptoms,
        addressId: createAddressRes.dataValues.id
      });
      // Keep this log for refrence in querying
      //   const findLog = await Dataset.findAll({
      //     include: [
      //     {
      //         model: Address,
      //         required: false, // true = RIGHT JOIN, false = LEFT JOIN. https://stackoverflow.com/questions/27561915/how-can-i-use-left-join-with-sequelize
      //     },
      // ],})
        // console.log('findLog', findLog[0].toJSON())
    } catch (err) {
      console.log('err: ', err)
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
    });
  
  } catch (err) {
    console.log('err: ', err)
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



const TOTAL_NUMBER_OF_DATASETS = async (req, res) => {
  try {
    try {
      const totalDatasets = await Dataset.count();

      res.send({
        status: "OK",
        status_code: 200,
        response: {
          data: totalDatasets
        }
      });
    
    } catch (err) {
      const errorObject = {
        status_code: 400,
        message: err.details[0].message,
      };
      throw errorObject;
    }

   
  } catch (err) {
    console.log('err: ', err)
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

const NUMBER_OF_DATASETS_PER_DISEASE = async (req, res) => {
  try {
    try {
      const datasets = await Dataset.findAll({raw:true});
      // console.log('totalDatasets', totalDatasets)/
      const diseaseDatasetCount = {

      }

      for(const dataset of datasets){
        if(diseaseDatasetCount[dataset.disease] === undefined){
          diseaseDatasetCount[dataset.disease] = 1;
        }else if(diseaseDatasetCount[dataset.disease]){
          diseaseDatasetCount[dataset.disease] += 1;
        }
      }
      res.send({
        status: "OK",
        status_code: 200,
        response: {
          data: diseaseDatasetCount
        }
      });
    
    } catch (err) {
      const errorObject = {
        status_code: 400,
        message: err.details[0].message,
      };
      throw errorObject;
    }

  } catch (err) {
    console.log('err: ', err)
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

const DELETE_DATASET = async (req, res) => {
  try {
      const {datasetId} =req.params;
      await Dataset.destroy({where:{id:datasetId}});
      res.send({
        status: "OK",
        status_code: 200,
        message:'Successfully deleted dataset'
      });

  } catch (err) {
    console.log('err: ', err)
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


module.exports = {
  CREATE,
  GET_DATASETS,
  DISEASE_SYMPTOMS,
  UPDATE_DATASET,
  ADD_DATASET,
  TOTAL_NUMBER_OF_DATASETS,
  NUMBER_OF_DATASETS_PER_DISEASE,
  DELETE_DATASET
};
