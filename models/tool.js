//道具
const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');
const Error = require('../utils/error');

//配置文件
//===============
let toolConfig = sequelize.define('toolconfig', {
    toolid: {
        type: Sequelize.STRING(16),
        primaryKey: true,
        autoIncrement: true,
        defaultValue: '1',
        allowNull: false
    },
    toolname: {
        type: Sequelize.STRING(32),
        allowNull: false
    },
    des: {
        type: Sequelize.STRING(256),
        allowNull: false
    }
}, {
    timestamps: false
});

//增加道具
let addToolConfig = async (id, name, des) => {
    return await toolConfig.create({
        toolid: id,
        toolname: name,
        des: des
    });
}

//初始化
let initTool = async () => {
    await addToolConfig('1', '无敌', '使用后一定能够跳跃成功');
    await addToolConfig('2', '生命', '跳跃失败后，使用道具后，能够继续游戏');
}

//道具信息
//===============
let toolInfo = sequelize.define('toolinfo', {
    uid:{
        type: Sequelize.STRING(50),
        unique: true
    },
    toolid: {
        type: Sequelize.STRING(16),
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: false
});

//添加道具
let addTool = async (uid, toolid, count) => {
    return await toolInfo.create({
        uid,toolid,count
    })
}

//获取道具
let getTool = async (uid, toolid) => {
    let tool = await toolInfo.findOne({
        where: {
            uid,toolid
        }
    });
    
    if(!tool) {
        throw 'no tool';
    }

    return tool;
}

//使用道具
let useTool = async (uid, toolid, usecount) => {
    let tool = null;
    try{
        tool = await getTool();
    }catch(e){
        //do nothing
    }

    if(!tool){
        throw new Error(Error.codes.server.notEnough, '道具数量不足');
    }

    return await toolInfo.update({
        count: usecount
    }, {
        where: {
            uid: uid,
            toolid: toolid,
        }
    })
}

module.exports = {
    initTool,//初始化道具配置表
    addTool,//增加道具
    getTool,//获得道具
    useTool//使用道具
}