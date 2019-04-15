//成就
const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');
const Error = require('../utils/error');
const memcache = require('../utils/memcache');

/*
create table if not exists achieveconfigs(
    achieveid varchar(10) primary key not null,
    level int not null,
    name varchar(32) not null
)
*/
let achieveConfigModel = sequelize.define('achieveconfigs', {
    achieveid: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(32),
        allowNull: false
    }
},{
    timestamps: false
});

achieveConfigModel.sync();

let createAchieveCfgItem = async function (id, level, name){
    try{
        await achieveConfigModel.create({
            achieveid: id,
            level,
            name
        });
        return true;
    }catch(e){
        return false;
    }
}

let initAchieveConfig = async function(){
    await createAchieveCfgItem('10001', 0, '默默无闻');
    await createAchieveCfgItem('10002', 21, '崭露头角');
    await createAchieveCfgItem('10003', 51, '小有所成');
    await createAchieveCfgItem('10004', 101, '名传乡里');
    await createAchieveCfgItem('10005', 181, '地方传奇');
    await createAchieveCfgItem('10006', 311, '名震一时');
    await createAchieveCfgItem('10007', 521, '举国闻名');
    await createAchieveCfgItem('10008', 861, '封疆大吏');
    await createAchieveCfgItem('10009', 1411, '藩镇诸侯');
    await createAchieveCfgItem('10010', 2301, '帝国君主');
    await createAchieveCfgItem('10011', 2301, '我是传奇');
}

let getAchieveCfg = async function(){
    let achieveCfgKey = 'getallachievecfgkey';
    let cfg = null;
    
    try{
        cfg = await memcache.get(achieveCfgKey);
    }catch(e){
    }

    if(!cfg){
        cfg = await achieveConfigModel.findAll()
        if(cfg){
            await memcache.set(achieveCfgKey, cfg);
        }
    }

    return cfg;
}

module.exports = {
    initAchieveConfig,
    getAchieveCfg
}