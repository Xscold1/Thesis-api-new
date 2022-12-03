const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const User = require('./user');

const Patient = sequelize.define("patient", {

    firstName:{
        type: DataTypes.STRING,
        allowNull:false,
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull:false,
    },
    age:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    sex:{
        type: DataTypes.STRING,
        allowNull:false,
    },
    address:{
        type: DataTypes.STRING,
        allowNull:false,
    }
}, {freezeTableName: true})

User.hasOne(Patient)
Patient.belongsTo(User)

module.exports = Patient;