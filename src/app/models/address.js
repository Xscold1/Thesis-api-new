const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Hospital = require("./hospital")

const Address = sequelize.define("Address", {
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    province: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    municipality: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    barangay: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    longitude:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
    },
},{timestamps: true});

Address.hasOne(Hospital, {
    foreignKey: 'addressId',
    onDelete: "CASCADE",
    onUpdate:"CASCADE"
});

Hospital.belongsTo(Address, {
    foreignKey: 'addressId',
    onDelete: "CASCADE",
    onUpdate:"CASCADE",
    targetKey:"id"
})

module.exports = Address;
