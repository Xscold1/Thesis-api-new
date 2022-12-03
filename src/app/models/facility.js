const DataTypes = require('sequelize')
const sequelize = require("../database");
const Hospital = require("./hospital")

const Facility = sequelize.define("facility", {
    facilityName:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {timestamps: false}, {freezeTableName: true})

Hospital.hasMany(Facility)
Facility.belongsTo(Hospital)

module.exports = Facility