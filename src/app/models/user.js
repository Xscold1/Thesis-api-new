const { DataTypes } = require("sequelize");
const sequelize = require("../database");


const User = sequelize.define("User", {
    
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false

    },
    roleId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
} ,{timestamps: false}, {freezeTableName: true});

module.exports = User;
