const recordModel = require('../models/record');
const loginSession = require('../utils/loginSession');
const response = require('../utils/response');
const Error = require('../utils/error');

let getSummaryRecord = async (ctx, next) => {
    if(!await loginSession.isLogin(ctx)){
        ctx.response.body = response.error(Error.codes.server.needLogin, '需要登录');
        return;
    }

    let uid = await loginSession.getOpenId(ctx);
    let record = await recordModel.getSummaryRecord(uid);
    if(record){
        if(record.level > 0){
            record.speed = record.duration / record.level;
        }else{
            record.speed = 0;
        }
    }
    ctx.response.body = response.succ(record, 'ok');
}

let getRecords = async (ctx, next) => {
    if(!await loginSession.isLogin(ctx)){
        ctx.response.body = response.error(Error.codes.server.needLogin, '需要登录');
        return;
    }

    let uid = await loginSession.getOpenId(ctx);
    let records = await recordModel.getRecords(uid);
    if(Array.isArray(records)){
        records = records.map((item) => {
            return {
                ...item,
                speed: item.level > 0 ? item.duration / item.level: 0
            };
        });
    }
    ctx.response.body = response.succ(records, 'ok');
}

let createRecord = async (ctx, next) => {
    if(!await loginSession.isLogin(ctx)){
        ctx.response.body = response.error(Error.codes.server.needLogin, '需要登录');
        return;
    }
    let uid = await loginSession.getOpenId(ctx);
    Error.assertNumber(ctx.request.body.duration,  'duration could be converted to number');
    Error.assertNumber(ctx.request.body.level, 'level could be converted to number');
    Error.assertNumber(ctx.request.body.combo, 'combo could be converted to number');
    if(await recordModel.createRecord(uid, ctx.request.body.duration, ctx.request.body.level, ctx.request.body.combo)){
        ctx.response.body = response.succ(null, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.internalError, '创建游戏记录失败');
    }
}

module.exports = {
    'GET /getgamesummaryrecord': getSummaryRecord,
    'GET /getgamerecords': getRecords,
    'POST /creategamerecord': createRecord
}