const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Doctor = sequelize.define("Doctor", {

    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    doctorLicenseNumber:{
        type: DataTypes.STRING,
        allowNull: true
    },
    specialization:{
        type:DataTypes.STRING,
        allowNull:true
    }
});

module.exports = Doctor;

