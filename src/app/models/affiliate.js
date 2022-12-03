const {DataTypes} = require("sequelize");
const sequelize = require("../database");
const Schedule = require("./schedule")
const Doctor = require("./doctor")
const Hospital = require("./hospital")

const Affiliate = sequelize.define("Affiliate", {
    id:{
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },

    contactInfo:{
        type: DataTypes.STRING,
        allowNull:true,
    }
} ,{
    freezeTableName: true
});



Affiliate.hasOne(Schedule,{ onDelete:"CASCADE", onUpdate:"CASCADE"})
Schedule.belongsTo(Affiliate,{onDelete:"CASCADE", onUpdate:"CASCADE"})


module.exports = Affiliate