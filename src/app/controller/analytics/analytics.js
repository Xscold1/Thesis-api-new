//  Packages
const axios = require("axios");
const Address = require("../../models/address");
const Dataset = require("../../models/dataset");
const SymptomCheckerLog = require("../../models/symptomCheckerLog");
const moment = require("moment")
const {Op} = require("sequelize")

const {objectSorter} = require('../../utils/objects');

const GENDER = {
  M: 'male',
  F: 'female'
}

const SYMPTOM_CHECKER_ANALYTICS = async (req, res) => {
  try {
    // const {userId} = req.authPayload;
    let symptomCheckerLogs = await SymptomCheckerLog.findAll();

    const symptomCheckerAnalytics = {
      numberOfUsage: symptomCheckerLogs.length,
      gender: {},
      additionalInfo: {},
      symptoms: {},
      predictions: {}
    }
    for(const log of symptomCheckerLogs){
      const logValue = log.dataValues;
      const parsedData = JSON.parse(logValue.data)
      const parsedPrediction = parsedData.prediction ?  JSON.parse(parsedData.prediction) : null;

      // Get gender analytics
      if(symptomCheckerAnalytics.gender[GENDER[parsedData.gender]] === undefined){
        symptomCheckerAnalytics.gender[GENDER[parsedData.gender]] = 1
        
      }else if(symptomCheckerAnalytics.gender[GENDER[parsedData.gender]]){
        symptomCheckerAnalytics.gender[GENDER[parsedData.gender]] += 1
      }


      // Get additional info analytics
      for(const additionalInfo of Object.keys(parsedData.additionalInfo)){

        if(symptomCheckerAnalytics.additionalInfo[additionalInfo] === undefined){
          symptomCheckerAnalytics.additionalInfo[additionalInfo] = 1;
        }else if ( symptomCheckerAnalytics.additionalInfo[additionalInfo] ){
          symptomCheckerAnalytics.additionalInfo[additionalInfo] += 1;
        }
       
      }

      // Get symptoms analytics
      for(const symptom of parsedData.symptoms){
        const capitalizedSymptom = symptom.replace(/\b\w/g, l => l.toUpperCase())
        if(symptomCheckerAnalytics.symptoms[capitalizedSymptom] === undefined){
          symptomCheckerAnalytics.symptoms[capitalizedSymptom] = 1;
        }else if ( symptomCheckerAnalytics.symptoms[capitalizedSymptom] ){
          symptomCheckerAnalytics.symptoms[capitalizedSymptom] += 1;
        }
       
      }

      // Get predictions analytics
      if(parsedPrediction){
        for(const prediction of Object.keys(parsedPrediction)){
          const capitalizedPrediction = prediction.replace(/\b\w/g, l => l.toUpperCase())

          if(symptomCheckerAnalytics.predictions[capitalizedPrediction] === undefined){
            symptomCheckerAnalytics.predictions[capitalizedPrediction] = 1;
          }else if ( symptomCheckerAnalytics.predictions[capitalizedPrediction] ){
            symptomCheckerAnalytics.predictions[capitalizedPrediction] += 1;
          }
        }
      }else{
        if(symptomCheckerAnalytics.predictions['No disease matched'] === undefined){
          symptomCheckerAnalytics.predictions['No disease matched'] = 1;
        }else if ( symptomCheckerAnalytics.predictions['No disease matched'] ){
          symptomCheckerAnalytics.predictions['No disease matched'] += 1;
        }
       
      }
      
    }

    // Sort objects
    symptomCheckerAnalytics.symptoms = objectSorter({object: symptomCheckerAnalytics.symptoms, isAscending: false});
    symptomCheckerAnalytics.predictions = objectSorter({object: symptomCheckerAnalytics.predictions, isAscending: false});
    symptomCheckerAnalytics.additionalInfo = objectSorter({object: symptomCheckerAnalytics.additionalInfo, isAscending: false});
    symptomCheckerAnalytics.gender = objectSorter({object: symptomCheckerAnalytics.gender, isAscending: false});
    
    res.send({
      status: "OK",
      status_code: 200,
      data: {
        analytics: symptomCheckerAnalytics
      }
    });
  
  } catch (err) {
    console.log('err', err)
    if (typeof err === "object") {
      res.status(err.status_code || 500).send({
        ...err,
      });
    } else {
      res.status(500).send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
};
const DATASETS_ANALYTICS = async (req, res) => {
  try {
    let datasets = await Dataset.findAll();

    const datasetsAnalytics = {
      totalDatasets: datasets.length,
      diseasesDatasetCount: {},
      diseaseCommonSymptoms: {},
      diseaseToAge: {},
      diseaseToGender: {}
    }
    for(const dataset of datasets){
      const datasetValue = dataset.dataValues;
      const parsedSymptoms = JSON.parse(datasetValue.symptoms)
      if(datasetsAnalytics.diseasesDatasetCount[datasetValue.disease] === undefined){
        datasetsAnalytics.diseasesDatasetCount[datasetValue.disease] = 1
      }else if (datasetsAnalytics.diseasesDatasetCount[datasetValue.disease]){
        datasetsAnalytics.diseasesDatasetCount[datasetValue.disease] +=1
      }

      // Disease to age analytics
      if(datasetsAnalytics.diseaseToAge[datasetValue.disease] === undefined){
        datasetsAnalytics.diseaseToAge[datasetValue.disease] = {}
      }

      if(datasetValue.age){
        if(datasetsAnalytics.diseaseToAge[datasetValue.disease]['Age '+ datasetValue.age] === undefined){
          datasetsAnalytics.diseaseToAge[datasetValue.disease]['Age '+ datasetValue.age] = 1
        }else if (datasetsAnalytics.diseaseToAge[datasetValue.disease]['Age '+ datasetValue.age]){
          datasetsAnalytics.diseaseToAge[datasetValue.disease]['Age '+ datasetValue.age] +=1
        }
  
      }
      
     
      // Disease to gender analytics
      if(datasetsAnalytics.diseaseToGender[datasetValue.disease] === undefined){
        datasetsAnalytics.diseaseToGender[datasetValue.disease] = {}
      }
      if(datasetValue.gender){
        if(datasetsAnalytics.diseaseToGender[datasetValue.disease][datasetValue.gender] === undefined){
          datasetsAnalytics.diseaseToGender[datasetValue.disease][datasetValue.gender] = 1
        }else if (datasetsAnalytics.diseaseToGender[datasetValue.disease][datasetValue.gender]){
          datasetsAnalytics.diseaseToGender[datasetValue.disease][datasetValue.gender] +=1
        }
  
      }
      
      // Disease common symptoms datasets
      for(const symptom of parsedSymptoms){
        const capitalizedSymptom = symptom.replace(/\b\w/g, l => l.toUpperCase())
        if(datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease] === undefined){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease] = {}
        }

        if(datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] === undefined){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] = 1
        }else if (datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom]){
          datasetsAnalytics.diseaseCommonSymptoms[datasetValue.disease][capitalizedSymptom] +=1
        }
      }
    }
    
    // Sort data
    datasetsAnalytics.diseasesDatasetCount = objectSorter({object: datasetsAnalytics.diseasesDatasetCount, isAscending: false});
  
    // sort disease common symptoms
    for(const diseaseSymptom of Object.keys(datasetsAnalytics.diseaseCommonSymptoms)){
      datasetsAnalytics.diseaseCommonSymptoms[diseaseSymptom] = await objectSorter({object: datasetsAnalytics.diseaseCommonSymptoms[diseaseSymptom], isAscending: false});
      
    }

    // sort disease to age
    for(const diseaseSymptom of Object.keys(datasetsAnalytics.diseaseToAge)){
      datasetsAnalytics.diseaseToAge[diseaseSymptom] = await objectSorter({object: datasetsAnalytics.diseaseToAge[diseaseSymptom], isAscending: false});
    }

    // sort disease to gender
    for(const diseaseSymptom of Object.keys(datasetsAnalytics.diseaseToGender)){
      datasetsAnalytics.diseaseToGender[diseaseSymptom] = await objectSorter({object: datasetsAnalytics.diseaseToGender[diseaseSymptom], isAscending: false});
    }

    const diseaseSypmtoms = {};
    
    for(const dat of Object.keys(datasetsAnalytics.diseaseCommonSymptoms)){
      diseaseSypmtoms[dat] = Object.keys(datasetsAnalytics.diseaseCommonSymptoms[dat])
    }

    // Endpoint to update the status of the dataset
    res.send({
      status: "OK",
      status_code: 200,
      data: {
        analytics: datasetsAnalytics
      }
    });
  
  } catch (err) {
    console.log('err', err)
    if (typeof err === "object") {
      res.status(err.status_code || 500).send({
        ...err,
      });
    } else {
      res.status(500).send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
};
const VARIABLE_TO_DISEASE_RELATIONSHIP = async (req,res) =>{
  // relationship between age and disease
  // relationship between gender and disease
  // relationship between symptoms and disease
  const {variable, disease} = req.query;

  try {
    const variableToDiseaseRelantionshipResult = await axios.get(`${process.env.MODEL_API_URL}/variable-to-disease-relationship?variable=${variable}&disease=${disease}`,{})

    const {status, status_code, message, response} = variableToDiseaseRelantionshipResult.data;
    if(status_code === 200){
      res.send({
        status: "OK",
        status_code: 200,
        data: {
          result: Math.abs(response)
        }
      });
    } else {
      const errorObject = {
        status,
        status_code: status_code,
        message: message,
      };
      throw errorObject;
    }

  } catch(err){
    console.log('err', err)
    if (typeof err === "object") {
      res.status(err.status_code || 500).send({
        ...err,
      });
    } else {
      res.status(500).send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
}
const LIST_OF_VARIABLES = async (req,res) =>{
  try {
    let datasets = await Dataset.findAll({ where: { status: "AP" } });

    const symptom_additional_info = {
      'Cough': ['0-2 days','3-4 days','5-6 days', 'more than 1 week'],
      'Headache': ['0-7 hours', '8-15 hours', '16-23 hours', 'more than 1 day']
    };
    let variables = [];
    const additionalVariables = ['Age', 'Gender','Exercise','Posture', 'Smoker','UnhealthyDiet']
    for(const dataset of datasets){
      const datasetValue = dataset.dataValues;
      const parsedSymptoms = JSON.parse(datasetValue.symptoms)

      for(const symptom of parsedSymptoms){
        const capitalizedSymptom = symptom.replace(/\b\w/g, l => l.toUpperCase())

        if(symptom_additional_info[symptom]){
          for(const additionalInfoSymptom of symptom_additional_info[symptom]){
            variables.push(`${capitalizedSymptom} (${additionalInfoSymptom})`);
          }
        }else{
          variables.push(capitalizedSymptom);
        }
       
      }
    }

    variables = [...new Set(variables), ...additionalVariables];
    res.send({
      status: "OK",
      status_code: 200,
      message: "Successfully retrieved supported symptoms",
      response: variables
    });
  } catch(err){
    console.log('err', err)
    if (typeof err === "object") {
      res.status(err.status_code || 500).send({
        ...err,
      });
    } else {
      res.status(500).send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
}
const LIST_OF_DISEASES = async (req,res) =>{

  try {
    const getDatasetsRes = await Dataset.findAll({attributes:['disease'],group:['disease'],raw:true})
    let listOfDiseases = getDatasetsRes.map(dataset=> dataset.disease.replace(/\b\w/g, l => l.toUpperCase()))

      res.send({
        status: "OK",
        status_code: 200,
        data: listOfDiseases
      });

  } catch(err){
    console.log('err', err)
    if (typeof err === "object") {
      res.status(err.status_code || 500).send({
        ...err,
      });
    } else {
      res.status(500).send({
        status: "Internal Server Error",
        status_code: 500,
        message: "Please contact administrator",
      });
    }
  }
}
const GET_SC_CS_ANALYTICS_BY_LOCATION = async (req , res) =>{
  try {
    let {barangay, country, province, municipality, region, year, month} = req.query;
    if(!year){
      year = moment().year()
    }
    let isMonthProvided = false;
    if(!month){

      month = 'January';
    }else{
      isMonthProvided  = true;
      
    }
    const monthsLong = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };
    const startingDate = moment(`${year}-${monthsLong[month]}-01`).format('YYYY-MM-DD hh:mm:ss').toString()
    const query ={
      [Op.gt]: startingDate,
    }
    if(isMonthProvided){
      const daysInMonth = moment(`${year}-${monthsLong[month]}`).daysInMonth()

      query[Op.lt] = moment(`${year}-${monthsLong[month]}-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
      
    }else{
      const daysInMonth = moment(`${year}-12`).daysInMonth()

      query[Op.lt] = moment(`${year}-12-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
    }
    if(!barangay){
        let getSymptomsMunicipality = await SymptomCheckerLog.findAll({
          include: {
            model:Address,
            where: {
              country,
              province,
              municipality,
              region
            }
          },
          where:{
            createdAt: query
          },
          raw: true
        })
        if(!getSymptomsMunicipality){
          return res.send({
            status:"FAILED",
            status_code:400,
            response:{
              message:"Error in getting all sypmtons per barangay",
              service:"Logs.GET_SC_ANALYTICS_BY_LOCATION"
          }
        })
      }
      // map all the symptoms in findall
      getSymptomsMunicipality = getSymptomsMunicipality.map(e =>{
        return{
          symptoms: e.symptoms,
        }
      })
      // // parse all the symptoms to be iterable
      const listAllSymptoms = getSymptomsMunicipality.map(e =>JSON.parse(e.symptoms))
      // // this is where the data will be accepted
      let countAllSymptomsPerMunicipality = {
        disease: {}
      }
      // loop through all the symptoms to count all the datasets within the municipality
      for (data of listAllSymptoms){   
        for (element of data){
            if(countAllSymptomsPerMunicipality.disease[element] === undefined){
              countAllSymptomsPerMunicipality.disease[element] = 1
            }else if((countAllSymptomsPerMunicipality.disease[element])){
              countAllSymptomsPerMunicipality.disease[element] += 1
            }
        }
      }
      countAllSymptomsPerMunicipality.disease = objectSorter({object: countAllSymptomsPerMunicipality.disease, isAscending: false})
      // send all the data in ui
      return res.send({
        status:"OK",
        status_code:200,
        response:{
          message:"Success",
          service:"Logs.GET_SC_ANALYTICS_BY_LOCATION",
          data:countAllSymptomsPerMunicipality
        }
      })
    }
    // search all the address that has the specific barangay and map the id
    let searchAddress = await Address.findAll({where:{barangay}})
    searchAddress = searchAddress.map(e => e.id)
    let getSymptomsPerBarangay = await SymptomCheckerLog.findAll({
      include: {
        model:Address,
        where: {
          barangay
        }
      },
        where:{
            createdAt: query
          },
    })
    if(!getSymptomsPerBarangay){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"Error in getting all sypmtons per barangay",
          service:"Logs.GET_SC_ANALYTICS_BY_LOCATION"
      }
    })
  }
  // map all the sypmtoms and barangay inside the address
  getSymptomsPerBarangay = getSymptomsPerBarangay.map(e =>{
    return{
      symptoms: e.symptoms,
      barangay: e.Address.barangay
    }
  })
  //parse all the symptoms to use for count 
  const listAllSymptoms = getSymptomsPerBarangay.map(e =>JSON.parse(e.symptoms))
  let countAllSymptoms = {
    disease: {}
  }
  // loop through all the symptoms to count all the datasets within the barngay
  for (data of listAllSymptoms){
    for (element of data){
        if(countAllSymptoms.disease[element] === undefined){
          countAllSymptoms.disease[element] = 1
        }else if((countAllSymptoms.disease[element])){
          countAllSymptoms.disease[element] += 1
        }
    }
  }
  countAllSymptoms.disease = objectSorter({object: countAllSymptoms.disease, isAscending: false})
  res.send({
    status:"OK",
    status_code:200,
    response:{
      message:"Success",
      service:"Logs.GET_SC_ANALYTICS_BY_LOCATION",
      data:countAllSymptoms
    }
  })
  } catch (err) {
    res.send({
      status:err.message,
      status_code:500,
    })
  }
}
const GET_OVERVIEW_ANALYTICS_BY_LOCATION = async (req , res)=>{
  try {
     const {municipality, province, region, country} = req.query
     const findLogs = await SymptomCheckerLog.findAll({
      include:{
        model:Address,
        where:{
          municipality,
          province,
          region,
          country
        } 
      }
     })
     if(!findLogs){
      return res.send({
        status:"Failed",
        status_code:500,
        response:{
          message:"Logs doesn't exist",
          service:"analytics.GET_OVERVIEW_ANALYTICS_BY_LOCATION"
        }
      })
     }
     let sum  = 0
     const totalCount = {
      location:{},
      totalRespondents:{},
      mostRespondents:{}
     }
     for(data of findLogs){
      const countPerBarangay = data.Address.barangay
      
      if(totalCount.location[countPerBarangay] === undefined){
        totalCount.location[countPerBarangay] = 1
        
      }else if((totalCount.location[countPerBarangay])){
        totalCount.location[countPerBarangay] += 1
      }
    }
    //sort to get use the first index of the object as the highest respondents
    totalCount.location = objectSorter({object: totalCount.location, isAscending: false})
    totalCount.mostRespondents = (Object.keys(totalCount.location)[0])
    //to sum all total respondents
    for(const count of Object.values(totalCount.location)){
        sum = sum + count
    }
    totalCount.totalRespondents = sum

     res.send({
      status: "Succes",
      status_code: 200,
      response:{
        data:totalCount,
        service:"analytics.GET_OVERVIEW_ANALYTICS_BY_LOCATION"
      }
     })
  } catch (error) {
    res.send({
      status:"Failed",
      status_code:500,
      response:{
        message:error.message,
        service:"analytics.GET_OVERVIEW_ANALYTICS_BY_LOCATION"
      }
    })
  }
}
const GET_LIFESTYLE_ANALYTICS_BY_LOCATION = async (req, res) => {
  try {
    let {barangay, country, province, municipality, region, year, month} = req.query;
    if(!year){
      year = moment().year()
    }
    let isMonthProvided = false;
    if(!month){

      month = 'January';
    }else{
      isMonthProvided  = true;
    }
    const monthsLong = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };

    const startingDate = moment(`${year}-${monthsLong[month]}-01`).format('YYYY-MM-DD hh:mm:ss').toString()
    const query ={
      [Op.gt]: startingDate,
    }
    if(isMonthProvided){
      const daysInMonth = moment(`${year}-${monthsLong[month]}`).daysInMonth()

      query[Op.lt] = moment(`${year}-${monthsLong[month]}-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
      
    }else{
      const daysInMonth = moment(`${year}-12`).daysInMonth()

      query[Op.lt] = moment(`${year}-12-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
    }
    if(!barangay){
        let getLifeStyleByMunicipality = await SymptomCheckerLog.findAll({
          include: {
            model:Address,
            where: {
              country,
              province,
              municipality,
              region
            }
          },
          where:{
            createdAt: query
          },
          raw: true
        })
        if(!getLifeStyleByMunicipality){
          return res.send({
            status:"FAILED",
            status_code:400,
            response:{
              message:"Error in getting all Additional Info",
              service:"Logs.GET_LIFESTYLE_ANALYTICS_BY_LOCATION"
          }
        })
      }
      // map all the symptoms in findall
      getLifeStyleByMunicipality = getLifeStyleByMunicipality.map(e =>{
        
        return{
          additionalInfo: e.additionalInfo,
        }
      })
      // console.log('getLifeStyleByMunicipality', getLifeStyleByMunicipality)
      // // parse all the symptoms to be iterable
      let listLifeStyle = getLifeStyleByMunicipality.map(e =>JSON.parse(e.additionalInfo))
      // console.log('listLifeStyle', listLifeStyle)
      // // this is where the data will be accepted
      let lifeStyleLocation = {
        additionalInfo: {}
      }
      
    // loop through all the Lifestyle that has map and parsed
      for(data of listLifeStyle){
        // console.log('data', data)
        //iterate through the data object
        for(const key in data){
          if(data[key] === true){
            if(lifeStyleLocation.additionalInfo[key]=== undefined){
              lifeStyleLocation.additionalInfo[key] = 1
            }else if (lifeStyleLocation.additionalInfo[key]){
              lifeStyleLocation.additionalInfo[key] += 1
            }
          }
        }
      }
      lifeStyleLocation.additionalInfo = objectSorter({object: lifeStyleLocation.additionalInfo, isAscending: false})
      // send all the data in ui
      return res.send({
        status:"OK",
        status_code:200,
        response:{
          message:"Success",
          service:"Logs.GET_LIFESTYLE_ANALYTICS_BY_LOCATION",
          data:lifeStyleLocation
          
        }
      })
    }

    let getLifeStyleByBarangay = await SymptomCheckerLog.findAll({
      include: {
        model:Address,
        where: {
          barangay
        }
      },
        where:{
            createdAt: query
          },
    })
    if(!getLifeStyleByBarangay){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"Error in getting all sypmtons per barangay",
          service:"Logs.GET_LIFESTYLE_ANALYTICS_BY_LOCATION"
      }
    })
  }
  
  // map all the list of lifestyle and barangay
  getLifeStyleByBarangay = getLifeStyleByBarangay.map(e =>{
    return{
      additionalInfo: e.additionalInfo,
      barangay: e.Address.barangay
    }
  })
  
  //parse all the lifestyle info to be iterable 
  const listLifeStyle = getLifeStyleByBarangay.map(e =>JSON.parse(e.additionalInfo))
  let lifeStyleLocation = {
    additionalInfo: {}
  }
  for(data of listLifeStyle){
    for(const key in data){
      if(data[key] === true){
        if(lifeStyleLocation.additionalInfo[key]=== undefined){
          lifeStyleLocation.additionalInfo[key] = 1
        }else if (lifeStyleLocation.additionalInfo[key]){
          lifeStyleLocation.additionalInfo[key] += 1
        }
      }
    }
  }
  //console.log('barangay', lifeStyleLocation.prediction)
  lifeStyleLocation.additionalInfo = objectSorter({object: lifeStyleLocation.additionalInfo, isAscending: false})
  res.send({
    status:"OK",
    status_code:200,
    response:{
      message:"Success",
      service:"Logs.GET_LIFESTYLE_ANALYTICS_BY_LOCATION",
      data:lifeStyleLocation
    }
  })
  } catch (err) {
    res.send({
      status:"FAILED",
      status_code:500,
      response:{
        message:err.message,
        service:"Logs.GET_LIFESTYLE_ANALYTICS_BY_LOCATION"
      }
    })
  }
}
const GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION = async (req, res) => {
  try {
    let {barangay, country, province, municipality, region, year, month} = req.query;
    if(!year){
      year = moment().year()
    }
    let isMonthProvided = false;
    if(!month){
      month = 'January';
    }else{
      isMonthProvided  = true;
    }
    const monthsLong = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };

    const startingDate = moment(`${year}-${monthsLong[month]}-01`).format('YYYY-MM-DD hh:mm:ss').toString()
    const query ={
      [Op.gt]: startingDate,
    }
    if(isMonthProvided){
      const daysInMonth = moment(`${year}-${monthsLong[month]}`).daysInMonth()

      query[Op.lt] = moment(`${year}-${monthsLong[month]}-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
      
    }else{
      const daysInMonth = moment(`${year}-12`).daysInMonth()

      query[Op.lt] = moment(`${year}-12-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
    }
    if(!barangay){
        let getDiseasebyMunicipality = await SymptomCheckerLog.findAll({
          include: {
            model:Address,
            where: {
              country,
              province,
              municipality,
              region
            }
          },
          where:{
            createdAt: query
          },
          raw: true
        })
        if(!getDiseasebyMunicipality){
          return res.send({
            status:"FAILED",
            status_code:400,
            response:{
              message:"Error in getting all sypmtons per barangay",
              service:"Logs.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION"
          }
        })
      }
      // map all the disease predict in findall
      getDiseasebyMunicipality = getDiseasebyMunicipality.map(e =>{
        return{
          prediction: e.prediction,
        }
      })
      // // parse all the symptoms to be iterable
      const listAllDisease = getDiseasebyMunicipality.map(e =>JSON.parse(e.prediction))
      // // this is where the data will be accepted
      let highestDiseasePredictionPerMunicipality = {
        prediction: {}
      }
      
      // loop through all the prediction 
      for(data of listAllDisease){
        if(data){
          if(highestDiseasePredictionPerMunicipality.prediction[Object.keys(data)[0]]=== undefined){
            highestDiseasePredictionPerMunicipality.prediction[Object.keys(data)[0]] = 1
          }else if(highestDiseasePredictionPerMunicipality.prediction[(Object.keys(data)[0])]){
            highestDiseasePredictionPerMunicipality.prediction[Object.keys(data)[0]] += 1
          }
        }
        highestDiseasePredictionPerMunicipality.prediction = objectSorter({object: highestDiseasePredictionPerMunicipality.prediction, isAscending: false})
      }
      // send all the data in ui
      return res.send({
        status:"OK",
        status_code:200,
        response:{
          message:"Success",
          service:"Logs.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION",
          data:highestDiseasePredictionPerMunicipality
        }
      })
    }
    let getDiseasebyBarangay = await SymptomCheckerLog.findAll({
      include: {
        model:Address,
        where: {
          barangay
        }
      },
        where:{
            createdAt: query
          },
    })
    if(!getDiseasebyBarangay){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"Error in getting all sypmtons per barangay",
          service:"Logs.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION"
      }
    })
  }
  
  // map all the disease predict in findall
  getDiseasebyBarangay = getDiseasebyBarangay.map(e =>{
    return{
      prediction: e.prediction,
      barangay: e.Address.barangay
    }
  })
  //parse all the diseased predict to use for count 
  const listAllDisease = getDiseasebyBarangay.map(e =>JSON.parse(e.prediction))
  let highestDiseasePredictionPerBarangay = {
    prediction: {}
  }
  // loop through all the predict disease
    for(data of listAllDisease){
      if(highestDiseasePredictionPerBarangay.prediction[Object.keys(data)[0]]=== undefined){
        highestDiseasePredictionPerBarangay.prediction[Object.keys(data)[0]] = 1
      }else if(highestDiseasePredictionPerBarangay.prediction[(Object.keys(data)[0])]){
        highestDiseasePredictionPerBarangay.prediction[Object.keys(data)[0]] += 1
      }
  }
  highestDiseasePredictionPerBarangay.prediction = objectSorter({object: highestDiseasePredictionPerBarangay.prediction, isAscending: false})
  res.send({
    status:"OK",
    status_code:200,
    response:{
      message:"Success",
      service:"Logs.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION",
      data:highestDiseasePredictionPerBarangay
    }
  })
  } catch (err) {
    res.send({
      status:"FAILED",
      status_code:500,
      response:{
        message:err.message,
        service:"Logs.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION"
      }
    })
  }
}
const MOST_SYMPTOMS_HOTSPOT = async (req, res) =>{
  try {
    let {symptoms, month, year} = req.query
    if(!year){
      year = moment().year()
    }
    let isMonthProvided = false;
    if(!month){
      month = 'January';
    }else{
      isMonthProvided  = true;
    }
    const monthsLong = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };
    const startingDate = moment(`${year}-${monthsLong[month]}-01`).format('YYYY-MM-DD hh:mm:ss').toString()
    const query ={
      [Op.gt]: startingDate,
    }
    if(isMonthProvided){
      const daysInMonth = moment(`${year}-${monthsLong[month]}`).daysInMonth()

      query[Op.lt] = moment(`${year}-${monthsLong[month]}-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
      
    }else{
      const daysInMonth = moment(`${year}-12`).daysInMonth()

      query[Op.lt] = moment(`${year}-12-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
    }
    let getSymptomsMunicipality = await SymptomCheckerLog.findAll({
      where:{
        symptoms:{
          [Op.like]:[`%${symptoms}%`]
        },
        createdAt:query
      },
      include:{
        model:Address,
      }
    })
    if(!getSymptomsMunicipality){
      return res.send({
        status:"FAILED",
        status_code:400,
        response:{
          message:"No symptoms available"
        }
      })
    }
    getSymptomsMunicipality = getSymptomsMunicipality.map(e =>{
      return{
        barangay: e.Address.barangay,
      }
    })
    let hotSpots = {
      barangay:{},
    }
    for (data of getSymptomsMunicipality){
      if(data){
        if(hotSpots.barangay[Object.values(data)[0]] === undefined){
          hotSpots.barangay[Object.values(data)[0]] = 1
        }else if((hotSpots.barangay[Object.values(data)[0]])){
          hotSpots.barangay[Object.values(data)[0]] += 1
        }
      }
    }
    hotSpots.barangay = objectSorter({object: hotSpots.barangay, isAscending: false})
    // // send all the data in ui
    return res.send({
      status:"OK",
      status_code:200,
      response:{
        message:"Success",
        service:"Logs.GET_SC_ANALYTICS_BY_LOCATION",
        data:hotSpots
      }
    })
  } catch (err) {
    res.send({
      status:"FAILED",
      status_code:500,
      response:{
        message:err.message,
        service:"Logs.MOST_SYMPTOMS_HOTSPOT"
      }
    })
  }
}
const MOST_DISEASE_HOTSPOT = async (req, res) =>{
  try {
    let {disease, month, year} = req.query
    if(!year){
      year = moment().year()
    }
    let isMonthProvided = false;
    if(!month){
      month = 'January';
    }else{
      isMonthProvided  = true;
    }
    const monthsLong = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };
    const startingDate = moment(`${year}-${monthsLong[month]}-01`).format('YYYY-MM-DD hh:mm:ss').toString()
    const query ={
      [Op.gt]: startingDate,
    }
    if(isMonthProvided){
      const daysInMonth = moment(`${year}-${monthsLong[month]}`).daysInMonth()

      query[Op.lt] = moment(`${year}-${monthsLong[month]}-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
      
    }else{
      const daysInMonth = moment(`${year}-12`).daysInMonth()

      query[Op.lt] = moment(`${year}-12-${daysInMonth}`).format('YYYY-MM-DD hh:mm:ss').toString();
    }
    let findAll = await SymptomCheckerLog.findAll({
      where:{
        prediction:{
          [Op.like]: [`%${disease}%`]
        },
        createdAt:query
      },
      include:{
        model:Address
      }
    })
    findAll = findAll.map(e =>{
      return{
        barangay: e.Address.barangay
      }
    })
    let hotSpots = {
      barangay:{},
    }
    for (data of findAll){
      if(data){
        if(hotSpots.barangay[Object.values(data)[0]] === undefined){
          hotSpots.barangay[Object.values(data)[0]] = 1
        }else if((hotSpots.barangay[Object.values(data)[0]])){
          hotSpots.barangay[Object.values(data)[0]] += 1
        }
      }
    }
    hotSpots.barangay = objectSorter({object: hotSpots.barangay, isAscending: false})
    // // send all the data in ui
    return res.send({
      status:"OK",
      status_code:200,
      response:{
        message:"Success",
        service:"Logs.GET_SC_ANALYTICS_BY_LOCATION",
        data:hotSpots
      }
    })
  } catch (err) {
    res.send({
      status:"FAILED",
      status_code:500,
      response:{
        message:err.message,
        service:"Logs.MOST_DISEASE_HOTSPOT"
      }
    })
  }
}
module.exports = {
  SYMPTOM_CHECKER_ANALYTICS,
  DATASETS_ANALYTICS,
  VARIABLE_TO_DISEASE_RELATIONSHIP,
  LIST_OF_DISEASES,
  LIST_OF_VARIABLES,
  GET_SC_CS_ANALYTICS_BY_LOCATION,
  GET_OVERVIEW_ANALYTICS_BY_LOCATION,
  GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION,
  GET_LIFESTYLE_ANALYTICS_BY_LOCATION,
  MOST_SYMPTOMS_HOTSPOT,
  MOST_DISEASE_HOTSPOT
};
