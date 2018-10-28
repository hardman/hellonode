
let response = require('../utils/response');
let Error = require('../utils/error');
let achieveModel = require('../models/achieve');

let getAchieveCfg = async function(ctx, next){
    let cfg = await achieveModel.getAchieveCfg();
    if(cfg){
        ctx.response.body = response.succ(cfg, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.notFound, '无数据');
    }
}

module.exports = {
    'GET /getachievecfg': getAchieveCfg
}