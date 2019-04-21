//道具
const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');
const Error = require('../utils/error');
const memcache = require('../utils/memcache');

//配置文件
//===============
/* 
create table if not exists toolconfigs(
    id int auto_increment primary key,
    toolid varchar(10) not null unique key,
    toolname varchar(32) not null,
    des varchar(256) not null
)
*/
let toolConfig = sequelize.define('toolconfig', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    toolid: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: true
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

toolConfig.sync();

//增加道具
let addToolConfig = async (toolid, name, des) => {
    try{
        return await toolConfig.create({
            toolid,
            toolname: name,
            des: des
        });
    }catch(e){
        
    }
}

//获取所有
let getAllToolConfigs = async () => {
    let allToolConfigs = null;
    const cacheKey = 'getAllToolConfigs';
    try{
        allToolConfigs = await memcache.get(cacheKey);
    }catch(e){
        //do nothing
    }
    if(!allToolConfigs){
        allToolConfigs = await toolConfig.findAll();
        if(Array.isArray(allToolConfigs) && allToolConfigs.length > 0){
            await memcache.set(cacheKey, allToolConfigs);
        }else{
            allToolConfigs = null;
        }
    }
    return allToolConfigs;
}

//初始化
let initTool = async () => {
    await addToolConfig('10001', '无敌', '使用后一定能够跳跃成功');
    await addToolConfig('10002', '生命', '跳跃失败后，使用道具后，能够继续游戏');
}

//道具信息
//===============
/*
create table if not exists toolinfos(
    id int auto_increment primary key,
    uid varchar(50) not null,
    toolid varchar(16) not null,
    count int default 0
)
*/
let toolInfo = sequelize.define('toolinfo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid:{
        type: Sequelize.STRING(50),
        allowNull: false
    },
    toolid: {
        type: Sequelize.STRING(16),
        allowNull: false
    },
    count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: false
});

toolInfo.belongsTo(toolConfig, {foreignKey: 'toolid', targetKey: 'toolid'});

toolInfo.sync();

//获取道具
let getTool = async (uid, toolid) => {
    let tool = await toolInfo.findOne({
        where: {
            uid,toolid
        },
        include: [
            {model: toolConfig, required: true}
        ]
    });

    return {
        toolid: tool.toolid,
        toolname: tool.toolconfig.toolname,
        des: tool.toolconfig.des,
        count: tool.count
    };
}

//添加道具
let addTool = async (uid, toolid, count) => {
    let tool = await getTool(uid, toolid);
    if(!tool){
        return await toolInfo.create({
            uid,toolid,count
        });
    }else{
        let updateRet = await toolInfo.update({
            count: tool.count + count
        },{
            where:{
                uid, toolid
            }
        });
        if(Array.isArray(updateRet) && updateRet.length > 0 && updateRet[0] > 0){
            return await getTool(uid, toolid);
        }else{
            throw new Error(Error.codes.server.invalidParams, '添加道具失败');
        }
    }
}

//获取全部道具
let getAllTools = async (uid) => {
    let tools = await toolInfo.findAll({
        where:{
            uid
        },
        include: [
            {model: toolConfig, required: true}
        ]
    });

    return tools.map((v) => {
        return {
            toolid: v.toolid,
            toolname: v.toolconfig.toolname,
            des: v.toolconfig.des,
            count: v.count
        }
    });
}

//使用道具
let useTool = async (uid, toolid, usecount) => {
    let tool = null;
    try{
        tool = await getTool(uid, toolid);
    }catch(e){
        //do nothing
    }

    if(!tool || tool.count < usecount){
        throw new Error(Error.codes.server.notEnough, '道具数量不足');
    }

    let updateRet = await toolInfo.update({
        count: tool.count - usecount
    }, {
        where: {
            uid: uid,
            toolid: toolid,
        }
    });
    if(Array.isArray(updateRet) && updateRet[0] == 1){
        return true;
    }else{
        return false;
    }
}

//测试道具
let test = async() => {
    console.log('测试开始');
    //初始化tool config
    await initTool();
    let toolCfgs = await getAllToolConfigs();
    if(!toolCfgs || toolCfgs.length != 2){
        throw new Error(-1, 'initTool 错误');
    }

    //增加道具
    await addTool("1", "10001", 1);
    await addTool("1", "10001", 4);
    let allTools = await toolInfo.findAll();
    if(!Array.isArray(allTools) || allTools.length != 1){
        throw new Error(-1, `addTool 错误1 count=${allTools ? allTools.length: 'no tools'}`);
    }

    let tool = await getTool("1", "10001");
    if(!tool || tool.count != 5){
        throw new Error(-1, `addTool 错误2 tool.count=${tool ? tool.count: 'no tool'}`);
    }

    //getAllTool

    allTools = await getAllTools("1");
    if(!Array.isArray(allTools) || allTools.length != 1){
        throw new Error(-1, 'no tools');
    } 

    //使用道具
    await useTool("1", "10001", 3);

    tool = await getTool("1", "10001");
    if(!tool || tool.count != 2){
        throw new Error(-1, 'useTool 错误1');
    }

    await useTool("1", "10001", 1);

    try{
        await useTool("1", "10001", 2);
    }catch(e){
        console.log('usetool test right');
    }

    tool = await getTool("1", "10001");
    if(tool.count != 1){
        throw new Error(-1, `useTool 错误 count=${tool.count}`);
    }

    console.log('测试完毕');
}

module.exports = {
    initTool,//初始化道具配置表
    addTool,//增加道具
    getTool,//获得道具
    getAllTools,//获得所有道具
    useTool,//使用道具,
    getAllToolConfigs,//道具配置
    test
}