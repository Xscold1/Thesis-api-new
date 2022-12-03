const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Status = sequelize.define("Status", {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status_long: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{ 
    timestamps: false,
    // createdAt: false,
    // updatedAt: false,
  }, {freezeTableName: true}
);

module.exports = Status;
