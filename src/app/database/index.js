const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    'defaultdb',
    'doadmin',
    'AVNS_OzFsjlpB7HISPFCGJWa',
    {
        logging: false,
        host: "thesis-db-do-user-12996373-0.b.db.ondigitalocean.com",
        dialect: "mysql",
        port:25060
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
