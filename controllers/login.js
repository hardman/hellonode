
const response = require('../utils/response');
const crypto = require('../utils/crypto');
const memcache = require('../utils/memcache');
const Error = require('../utils/error');
const User = require('../models/user');
const config = require('../utils/config');

/**
 * 微信登录会传入临时code，用临时code通过微信接口获取session_key和openid
 * 
 * 登录使用wechat，session_key作为memcache的key，value是openId
 * 然后sessionKeyMd5存到session中，作为登录凭证。
 * 
 * 登录后从数据库获取个人资料，取到后，放入memcached
 */

let _isLogin = (ctx) => {
	return !!(ctx.session && ctx.session.session_key);
}

let _getOpenId = async (ctx) => {
	if(_isLogin(ctx)){
		try{
			return await memcache.get(ctx.session.session_key);
		}catch(e){
			return null;
		}
	}else{
		return null;
	}
}

let _loginFailed = (ctx, code, msg) => {
	console.log(`login failed code=${code} msg=${msg}`);
	ctx.response.body = response.error(code, msg);
}

let _loginSucc = async (ctx, openid) => {
	if(openid){
		//更新数据库 & 返回数据信息
		let user = await User.findUser(openid);
		let reqBody = ctx.request.body;
		if(!user){
			let createParams = Object.assign({createat: Date.now(), updatedat: Date.now()}, reqBody);
			user = await User.createUser(openid, createParams);
		}else{
			//检查是否需要update
			let updateUser = null;
			try{
				updateUser = await User.updateUser(openid, reqBody);
			}catch(e){
				//do nothing
			}
			if(updateUser){
				user = updateUser;
			}
		}
		if(user){
			//登录记录
			await User.loginRecord(openid);
			//返回给客户端
			ctx.response.body = response.succ({
				userinfo: user
			}, "ok");
		}else{
			_loginFailed(ctx, Error.codes.login.modelError, 'model创建错误');
		}
	}else{
		_loginFailed(ctx, Error.codes.login.noOpenid, 'session_key丢失');
	}
}

let _checkParams = (ctx) => {
	let postBody = ctx.request.body;
	Error.assertType(postBody, 'object', 'postBody is not object');
	Error.assertValueExist(postBody.code, 'post.code is not exists');
	Error.assertValueExist(postBody.nickName, 'post.nickName is not exists');
	Error.assertValueExist(postBody.avatarUrl, 'post.avatarUrl is not exists');
}

//注册
let login = async (ctx, next) => {
	//参数检查
	_checkParams(ctx);
	//登录检查
	if(_isLogin(ctx)) {
		await _loginSucc(ctx, await _getOpenId());
		return;
	}
	//取参数
	let wxcode = ctx.request.body.code;
	if(!wxcode){
		_loginFailed(ctx, Error.codes.server.invalidParams, '需要参数code');
		return;
	}

	let retBody = null;

	if(config.isDebug){
		retBody = {
			openid: "openid:" + wxcode,
			session_key: "session_key:" + wxcode
		}
	}else{
		let config = require('../utils/config');
		let request = require('../utils/request');
		let ret = null;
		try{
			ret = await request.get(
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
		}catch(err){
			_loginFailed(ctx, Error.codes.login.wechatSessionKeyRequestFailed, `微信sessionkey接口请求失败 network ${err}`);
		}

		retBody = ret.body;
		if(typeof(retBody) == "string"){
			retBody = JSON.parse(retBody);
		}
	}

	if(retBody && retBody.openid && retBody.session_key){
		console.log(`请求wxjscode2session 成功 ${retBody}`);

		//openid + md5 存在session中
		let sessionkeyMd5 = crypto.md5(retBody.session_key);
		ctx.session.session_key = sessionkeyMd5;

		//openid存储在memcache中
		memcache.set(sessionkeyMd5, retBody.openid, 86400000); //24 * 60 * 60 * 1000)
		
		await _loginSucc(ctx, retBody.openid);
	}else{
		console.log(`请求wxjscode2session 失败 ${JSON.stringify(ret)} ${ret.error} ${ret.statusCode}`);
		_loginFailed(ctx, Error.codes.login.wechatSessionKeyRequestFailed, `微信sessionkey接口请求失败 data ${ret.error} ${ret.statusCode}`);
	}
}

//退出登录
let logout = async (ctx, next) => {
	if(_isLogin(ctx)){
		let sessionKeyMd5 = ctx.session.session_key;
		try{
			await memcache.delete(sessionKeyMd5);
		}catch(e){
			//do nothing
		}
		ctx.session = false;
	}
	ctx.response.body = response.succ({}, "ok");
}

let getUserInfo = async (ctx, next) => {
	//登录检查
	if(!_isLogin(ctx)) {
		_loginFailed(ctx, Error.codes.server.needLogin, '未登录');
		return;
	}

	let openid = await _getOpenId();

	let user = await User.findUser(openid);

	if(user){
		ctx.response.body = response.succ(user, 'ok');
	}else{
		ctx.response.body = response.error(Error.codes.server.notFound, '未找到当前用户');
	}
}

module.exports = {
	'POST /login': login,
	'GET /logout': logout,
	'GET /getUserInfo': getUserInfo
}