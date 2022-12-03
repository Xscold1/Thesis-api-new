const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Disease = sequelize.define("disease_infomation", {
    diseaseName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    history: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    overview: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    treatment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    specialist: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {freezeTableName: true})

module.exports = Disease;