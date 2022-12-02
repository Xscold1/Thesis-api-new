const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Address = require('./address');

const Dataset = sequelize.define("Dataset", {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    additionalInfo: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    disease: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
    { timestamps: true, });
    
Address.hasOne(Dataset, {
    foreignKey: 'addressId'
});
Dataset.belongsTo(Address, {
    foreignKey: 'addressId'
})

module.exports = Dataset;
