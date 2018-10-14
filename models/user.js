const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');

module.exports = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uid: {
        type: Sequelize.STRING(50),
        unique: true
    },
    username:Sequelize.STRING(100),
    avatar: Sequelize.STRING(256),
    gender: Sequelize.TINYINT,
    language: Sequelize.STRING(16),
    city: Sequelize.STRING(32),
    province: Sequelize.STRING(32),
    country: Sequelize.STRING(32),
    createdat: Sequelize.BIGINT,
    updatedat: Sequelize.BIGINT,
    logintimes: Sequelize.INTEGER,
    wxopenid: Sequelize.STRING(256),
    device: Sequelize.STRING(50)
}, {
    timestamps: false
});
