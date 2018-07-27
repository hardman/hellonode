const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');

module.exports = sequelize.define('user', {
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true
    },
    uid: {
        type: Sequelize.STRING(50),
        unique: true
    },
    username:Sequelize.STRING(100),
    avatar: Sequelize.STRING(256),
    mobile: Sequelize.STRING(20),
    email: Sequelize.STRING(256),
    openid: Sequelize.STRING(256),
    createdAt: Sequelize.BIGINT,
    updatedAt: Sequelize.BIGINT
}, {
    timestamps: false
});
