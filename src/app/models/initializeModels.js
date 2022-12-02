//TODO: Our models tables are created in database when imported, so for now we will import our models
const Dataset = require('./dataset');
const SymptomCheckerLog = require('./symptomCheckerLog')
const User = require('./user');
const Status = require('./status')
const Doctor = require('./doctor');
const Address = require('./address');
const Hospital = require('./hospital');
const Affiliate = require('./affiliate');
const Schedule = require('./schedule');
const Facility = require('./facility');
const sequelize = require("../database");
function importModels() {
    sequelize.sync({ alter: true });
}



module.exports = importModels;