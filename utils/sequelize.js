let mysqlConfig = {
    database: 'koaminigame',
    username: 'wanghy',
    password: 'wang@1234',
    host: 'localhost',
    port: 3306
}

const Sequelize = require('sequelize');

module.exports = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});