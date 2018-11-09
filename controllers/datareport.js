
let response = require('../utils/response');
let Error = require('../utils/error');
let datareportModel = require('../models/datareport');
let loginSession = require('../utils/loginSession');

let report = async (ctx, next) => {
    let type = ctx.request.query.type;
    let model = ctx.request.query.model;
    Error.assertValueExist(type, 'need type param');
    Error.assertValueIn(type, ["1", "2", "3"], 'need type in ["1", "2", "3"]');
    Error.assertValueExist(model, 'need type model');

    //uid
    let ext = ctx.request.query.ext;
    let uid = await loginSession.getOpenId(ctx);
    if(uid){
        if(ext){
            ext = JSON.parse(ctx.request.query.ext);
        }else{
            ext = {};
        }
        ext.uid = uid;
        ext = JSON.stringify(ext);
    }

    try{
        await datareportModel.report(type, model, ctx.request.query.info, ext);
        ctx.response.body = response.succ(null, 'ok');
    }catch(e){
        ctx.response.body = response.error(Error.codes.server.internalError, 'datareportModel.report error');
    }
}

module.exports = {
    'GET /datareport': report
}