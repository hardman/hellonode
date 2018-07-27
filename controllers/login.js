
const response = require('../utils/response');

let auth = async (ctx, next)=> {
	ctx.response.body = `
		<form action="/login" method="POST">
			<p>username <input name="username" value="koa"></p>
			<p>username <input name="password" type="password" value="123"></p>
			<p>username <input type="submit" value="提交"></p>
		</form>
	`
}

//登录
let login = async (ctx, next)=> {
	console.log(" -- body = " + ctx.request.body);
	var name = ctx.request.body.username || '';
	var pwd = ctx.request.body.password || '';
	console.log(' -- name=' + name + ',password = ' + pwd);
	if(name == 'koa' && pwd == '123456') {
		ctx.response.body = `<h1>登录成功</h1>`;
	}else{
		ctx.response.body = `<a href="/auth">重试</a>`;
	}
}

//注册
let register = async (ctx, next) => {
	//取参数
	let wxcode = ctx.request.body.code;
	if(!wxcode){
		ctx.response.body = response.error(response.codes.invalidParams, '需要参数code');
		return;
	}

	let config = require('../utils/config');
	let request = require('../utils/request');
	let ret = await request.get(
		{
			url: 'https://api.weixin.qq.com/sns/jscode2session',
			params: {
				appid: config.wx.appid,
				secret: config.wx.appsecret,
				js_code: wxcode,
				grant_type: 'authorization_code'
			}
		}
	)

	if(ret.body){
		console.log(`请求wxjscode2session 成功 ${ret}`);
		ctx.session.sessionKey = ret.body.session_key;
		ctx.session.openid = ret.body.openid;

		ctx.response.body = response.succ({}, 'ok');
	}else{
		console.log(`请求wxjscode2session 失败 ${ret.error} ${ret.statusCode}`);
		ctx.response.body = response.error(ret.statusCode, '请求失败')
	}

	return;


	let userModel = require('../models/user');
	ctx.response.type = 'application/json';
	ctx.response.body = response.error(-100, "数据不存在");
}

module.exports = {
	'GET /auth': auth,
	'POST /login': login,
	'POST /register': register,
	'GET /register': register
}