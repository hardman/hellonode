//游戏记录 存memcache
const Error = require('../utils/error');
const memcache = require('../utils/memcache');
const config = require('../utils/config');

let getSummaryRecord = async function(uid){
    let record = null;
    try{
        record = await memcache.get(`gamesummaryrecord_${uid}`);
    }catch(e){}

    return record;
}

let addSummaryRecord = async function(record){
    let summaryRecord = await getSummaryRecord(record.uid);
    if(!summaryRecord){
        summaryRecord = record;
    }else{
        let level = parseInt(summaryRecord.level);
        let duration = level / parseFloat(summaryRecord.speed);
        level += parseInt(record.level);
        let newDuration = record.level * parseFloat(record.speed) + duration;
        let newSpeed = level / newDuration;
        let newRound = summaryRecord.round ? parseInt(summaryRecord.round) + 1: 1;
        let newRecord = {
            uid: record.uid,
            duration: `${newDuration.toFixed(2)}`,
            speed: `${newSpeed.toFixed(2)}`,
            level: `${level}`,
            combo: `${parseInt(summaryRecord.combo) + parseInt(record.combo)}`,
            round: `${newRound}`
        }
        summaryRecord = newRecord;
    }
    try{
        await memcache.set(`gamesummaryrecord_${record.uid}`, summaryRecord);
        return true;
    }catch(e){
        return false;
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

let createRecord = async function(uid, speed, level, combo){
    let records = await getRecentlyRecords(uid);
    if(!Array.isArray(records)){
        records = [];
    }
    if(records.length >= 10){
        records.shift();
    }
    let newRecord = {uid, speed, level, combo};
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