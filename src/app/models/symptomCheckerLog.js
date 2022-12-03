const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Address = require('./address');

const SymptomCheckerLog = sequelize.define("SymptomCheckerLog", {
    
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
    prediction: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {freezeTableName: true});

Address.hasOne(SymptomCheckerLog, {
    foreignKey: 'addressId',
});
SymptomCheckerLog.belongsTo(Address, {
    foreignKey: 'addressId'
})

module.exports = SymptomCheckerLog;
