//成就
const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');

const CLICK = 1;//点击
const EXPOSURE = 2;//曝光
const ACTION = 3;//行为

/*
create table if not exists datareports(
    id int auto_increment primary key unique,
    type tinyint not null,
    model varchar(32) not null,
    info varchar(32),
    ext varchar(256),
    createat bigint not null
)
*/
let datareportModel = sequelize.define('datareport', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    type:{//类型 1(click),2(exposure),3(action)
        type: Sequelize.TINYINT,
        allowNull: false
    },
    model:{//上报位置
        type: Sequelize.STRING(32),
        allowNull: false
    },
    info:{//主要信息
        type:Sequelize.STRING(32),
    },
    ext:{//额外信息
        type:Sequelize.STRING(256),
    },
    createat:{
        type: Sequelize.BIGINT,
        allowNull: false
    }
},{
    timestamps: false
})

datareportModel.sync();

let report = async function(type, model, info, ext, time){
    let object = await datareportModel.create({
        type, model, info, ext,
        createat: time ? time: Date.now()
    });
    console.log(`datareport.report object = ${object}`);
}

let reportMulti = async function(datas){
    let now = Date.now();
    datas.forEach((v) => {
        v.createat = v.time ? v.time: now;
        v.time = undefined;
    });
    let ret = await datareportModel.bulkCreate(datas);
    console.log(`datareport.reportMulti datas = ${ret}`);
}

module.exports = {
    report,
    reportMulti
}