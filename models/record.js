//游戏记录 存memcache
const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');
const Error = require('../utils/error');
const memcache = require('../utils/memcache');
const config = require('../utils/config');

/**
 create table if not exists summaryrecords(
     uid varchar(50) primary key unique key not null,
     duration int not null,
     level int not null,
     maxlevel int not null,
     combo int not null,
     maxcombo int not null,
     round int not null
 )
 */

let summaryRecordModel = sequelize.define('summaryrecords', {
    uid:{
        type: Sequelize.STRING(50),
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    duration:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    maxlevel: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    combo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    maxcombo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    round:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
},{
    timestamps: false
});

summaryRecordModel.sync();

let getSummaryRecord = async function(uid, useCache){
    let record = null;
    if(useCache){
        try{
            record = await memcache.get(`gamesummaryrecord_${uid}`);
        }catch(e){}
    }

    if(!record){
        record = await summaryRecordModel.findOne({
            where:{
                uid
            }
        });

        if(useCache){
            if(record){
                await memcache.set(`gamesummaryrecord_${uid}`, record, 86400);
            }
        }
    }

    return record;
}

let addSummaryRecord = async function(record, useCache){
    let summaryRecord = await getSummaryRecord(record.uid);
    if(!summaryRecord){
        summaryRecord = {
            uid: record.uid,
            combo: record.combo,
            maxcombo: record.maxcombo,
            level: record.level,
            maxlevel: record.level,
            duration: record.duration,
            round: 1
        };
        await summaryRecordModel.create(summaryRecord);
    }else{
        let maxlevel = summaryRecord.maxlevel;
        if(record.level > maxlevel){
            maxlevel = record.level;
        }
        let maxcombo = summaryRecord.maxcombo;
        if(record.maxcombo > maxcombo){
            maxcombo = record.maxcombo;
        }
        let level = summaryRecord.level + record.level;
        let duration = summaryRecord.duration + record.duration;
        let round = summaryRecord.round + 1;
        let combo = summaryRecord.combo + record.combo;
        summaryRecord = {
            duration,
            level,
            maxlevel,
            combo,
            maxcombo,
            round
        };
        await summaryRecordModel.update(summaryRecord, {
            where:{
                uid: record.uid
            }
        });
    }

    if(useCache){
        await memcache.set(`gamesummaryrecord_${record.uid}`, summaryRecord, 86400);
    }
}

let getRecentlyRecords = async function(uid){
    let records = null;
    try{
        records = await memcache.get(`gamerecentlyrecord_${uid}`);
    }catch(e){}
    if(Array.isArray(records)){
        return records;
    }
    return null;
}

let createRecord = async function(uid, duration, level, combo, maxcombo){
    let records = await getRecentlyRecords(uid);
    if(!Array.isArray(records)){
        records = [];
    }
    if(records.length >= 10){
        records.shift();
    }
    let newRecord = {uid, duration: parseInt(duration), level: parseInt(level), combo: parseInt(combo), maxcombo: parseInt(maxcombo)};
    records.push(newRecord);
    try{
        await memcache.set(`gamerecentlyrecord_${uid}`, records);
        await addSummaryRecord(newRecord);
        return true;
    }catch(e){
        return false;
    }
}

let test = async function (){
    for(let i = 0; i < 20; i++){
        await createRecord("1", "1.2", 10, 0);
    }
    let records = await getRecentlyRecords("1");
    if(!Array.isArray(records) || records.length != 10){
        throw new Error(-1, 'createRecord 或 getRecentlyRecords 错误');
    }
    console.log(`11 record=${JSON.stringify(records)}`);
    let summaryRecord = await getSummaryRecord("1");
    console.log(`22 summaryRecord=${JSON.stringify(summaryRecord)}`);
    console.log("测试完成");
}

module.exports = {
    createRecord,
    getRecentlyRecords,
    getSummaryRecord,
    test
}