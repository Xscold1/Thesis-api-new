const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'thesis-db',
    'root',
    'password',
    {
        logging: false,
        host: "localhost",
        dialect: "mysql",
        //port:25060
    });

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();

module.exports = sequelize;
