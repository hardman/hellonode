
const config = require('./config');

const Sequelize = require('sequelize');

module.exports = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
    host: config.host,
    dialect: 'mysql',
    dialectOptions: {
        charset:"utf8",
        collate:"utf8"
    },
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});