const loginSession = require('../utils/loginSession');
const response = require('../utils/response');
const Error = require('../utils/error');
const toolModel = require('../models/tool');

let _checkLoginAndGetOpenId = async (ctx) => {
    if(!loginSession.isLogin(ctx)) {
        ctx.response.body = response.error(Error.codes.server.needLogin, '需要登录');
        return;
    }
    //获取uid
    return await loginSession.getOpenId();
}

//所有道具
let getAllTools = async (ctx, next) => {
    let uid = await _checkLoginAndGetOpenId(ctx);
    if(!uid) {
        return;
    }
    //获取uid
    let tools = await toolModel.getAllTools(uid);
    if(Array.isArray(tools)){
        ctx.response.body = response.success({tools}, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.notEnough, `getAllTools(${uid})数量为0`);
    }
}

//某个道具
let getTool = async (ctx, next) => {
    Error.assertValueExist(ctx.request.query.toolId, 'need params toolId');
    let uid = await _checkLoginAndGetOpenId(ctx);
    if(!uid) {
        return;
    }
    let tool = await toolModel.getTool(uid, ctx.request.query.toolId);
    if(tool){
        ctx.response.body = response.success(tool, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.notEnough, `getTool(${uid},${ctx.request.query.toolId})无数据`);
    }
}

let useTool = async (ctx, next) => {
    Error.assertType(ctx.request.query.toolId, 'string', 'need params toolId is string');
    Error.assertType(ctx.request.query.count, 'integer', 'need params count is integer');
    let uid = await _checkLoginAndGetOpenId(ctx);
    if(!uid) {
        return;
    }
    let useSucc = await toolModel.useTool(uid, ctx.request.query.toolId, ctx.request.query.count);
    if(useSucc){
        ctx.respons.body = response.success({}, 'ok');
    }else{
        ctx.respons.body = response.error(Error.codes.server.notEnough, '道具使用失败');
    }
}

module.exports = {
	'GET /getalltools': getAllTools,
	'GET /gettool': getTool,
	'POST /usetool': useTool
}