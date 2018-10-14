
const config = require('./config');

const Sequelize = require('sequelize');

module.exports = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});