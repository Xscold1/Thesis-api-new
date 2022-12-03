const DataTypes = require('sequelize')
const sequelize = require('../database/index')

const Schedule = sequelize.define('chedule',{
    
    time:{
        type: DataTypes.STRING,
        allowNull:false
    },
    day:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {freezeTableName: true})
module.exports = Schedule