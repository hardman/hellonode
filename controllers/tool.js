const loginSession = require('../utils/loginSession');
const response = require('../utils/response');
const Error = require('../utils/error');
const toolModel = require('../models/tool');

let _checkLoginAndGetOpenId = async (ctx) => {
    if(! await loginSession.isLogin(ctx)) {
        ctx.response.body = response.error(Error.codes.server.needLogin, '需要登录');
        return;
    }
    //获取uid
    return await loginSession.getOpenId(ctx);
}

let getToolConfigs = async (ctx, next) => {
    let toolsconfigs = await toolModel.getAllToolConfigs();
    if(Array.isArray(toolsconfigs)){
        ctx.response.body = response.succ({toolsconfigs}, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.notEnough, `getAllToolConfigs()数量为0`);
    }
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
        ctx.response.body = response.succ({tools}, 'ok');
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
    Error.assertType(ctx.request.body.toolId, 'string', 'need params toolId is string');
    Error.assertNotEqual(Number.parseInt(ctx.request.body.count), Number.NaN, 'need params count is integer');
    let uid = await _checkLoginAndGetOpenId(ctx);
    if(!uid) {
        return;
    }
    let useSucc = await toolModel.useTool(uid, ctx.request.body.toolId, ctx.request.body.count);
    if(useSucc){
        ctx.response.body = response.succ({}, 'ok');
    }else{
        ctx.response.body = response.error(Error.codes.server.notEnough, '道具使用失败');
    }
}

module.exports = {
    'GET /getalltoolconfigs': getToolConfigs,
	'GET /getalltools': getAllTools,
	'GET /gettool': getTool,
	'POST /usetool': useTool
}