
let response = require('../utils/response');
let Error = require('../utils/error');
let datareportModel = require('../models/datareport');
let loginSession = require('../utils/loginSession');

let reportOne = async (ctx, next) => {
    let type = ctx.request.body.type;
    let model = ctx.request.body.model;
    Error.assertValueExist(type, 'need type param');
    Error.assertValueIn(type, ["1", "2", "3"], 'need type in ["1", "2", "3"]');
    Error.assertValueExist(model, 'need type model');

    try{
        await datareportModel.report(type, model, ctx.request.body.info, ext, ctx.request.body.time);
        ctx.response.body = response.succ(null, 'ok');
    }catch(e){
        ctx.response.body = response.error(Error.codes.server.internalError, 'datareportModel.report error');
    }
}

let reportMulti = async (ctx, next) => {
    let datasstr = ctx.request.body.datas;
    Error.assertValueExist(datasstr, 'need datas param');
    let datas = JSON.parse(datasstr);
    Error.assertArray(datas, 'datas must be array');
    if(datas.length > 0){
        try{
            await datareportModel.reportMulti(datas);
            ctx.response.body = response.succ(null, 'ok');
        }catch(e){
            ctx.response.body = response.error(Error.codes.server.internalError, 'datareportModel.reportMulti error');
        }
    }else{
        ctx.response.body = response.error(Error.codes.server.internalError, 'datareportModel.reportMulti error');
    }
}

module.exports = {
    'POST /datareport': reportOne,
    'POST /datareportmulti': reportMulti
}