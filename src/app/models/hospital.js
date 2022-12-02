const {DataTypes} = require("sequelize");
const sequelize = require("../database");
const Doctor = require("./doctor")
const Affiliate = require("./affiliate")
const Facility = require("./affiliate")


const Hospital = sequelize.define("Hospital", {
    overview:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    addressId:{
        type: DataTypes.INTEGER,
        foreignKey:true,
        primaryKey:false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hospitalName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactInfo:{
        type: DataTypes.STRING,
        allowNull: true,
    },

});




Hospital.belongsToMany(Doctor, {through: Affiliate, foreignKey: 'affiliateHospitalId'})
Doctor.belongsToMany(Hospital, {through: Affiliate, foreignKey: 'affiliateDoctorId'})

module.exports = Hospital