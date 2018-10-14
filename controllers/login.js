
const response = require('../utils/response');
const crypto = require('../utils/crypto');
const memcache = require('../utils/memcache');
const Error = require('../utils/error');
const User = require('../models/user');
const config = require('../utils/config');

let _isLogin = (ctx) => {
	return !!(ctx.session && ctx.session.session_key);
}

let _getOpenId = async (ctx) => {
	if(_isLogin(ctx)){
		return await memcache.get(ctx.session.session_key);
	}else{
		return null;
	}
}

let _loginFailedCode = {
	noOpenid: 1001,
	wechatSessionKeyRequestFailed: 1002,
	modelError: 1003,
}

let _loginFailed = (ctx, code, msg) => {
	console.log(`login failed code=${code} msg=${msg}`);
	ctx.response.body = response.error(code, msg);
}

let _loginSucc = async (ctx, openid) => {
	if(openid){
		//更新数据库 & 返回数据信息
		try{
			let user = null;

			//在memcache里查找
			try{
				user = await memcache.get(openid);
			}catch(e){
				//do nothing
			}

			if(!user){
				//memcache没有，去数据库查找
				let users = null;
				try{
					users = await User.findAll({
						where:{
							wxopenid: openid
						}
					});
				}catch(e){
					//do nothing	
				}
				if(!users || users.length <= 0){
					//没有找到，则在数据库创建
					let reqBody = ctx.request.body;
					user = await User.create({
						uid: openid,
						username: reqBody.nickName,
						avatar: reqBody.avatarUrl,
						gender: reqBody.gender,
						language: reqBody.language,
						city: reqBody.city,
						province: reqBody.province,
						country: reqBody.country,
						createdat: Date.now(),
						updatedat: Date.now(),
						logintimes: 1
					});
				}else{
					//数据库中存在，直接取出
					user = users.shift();
				}
				if(user){
					//重新读取数据库，获取自动生成的部分col
					try{
						user = await User.findOne({
							where: {
								uid: openid
							}
						})
					}catch(e){
						//do nothing
					}
					//存储到memcache
					await memcache.set(openid, user);
				}
			}
			//返回给客户端
			ctx.response.body = response.succ({
				userinfo: user
			}, "ok");
		} catch(e) {
			_loginFailed(ctx, _loginFailedCode.modelError, 'model创建错误');
		}
	}else{
		_loginFailed(ctx, _loginFailedCode.noOpenid, 'session_key丢失');
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
			_loginFailed(ctx, _loginFailedCode.wechatSessionKeyRequestFailed, `微信sessionkey接口请求失败 network ${err}`);
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
		_loginFailed(ctx, _loginFailedCode.wechatSessionKeyRequestFailed, `微信sessionkey接口请求失败 data ${ret.error} ${ret.statusCode}`);
	}
}

let getUserInfo = async (ctx, next) => {
	//登录检查
	if(!_isLogin(ctx)) {
		_loginFailed(ctx, Error.codes.server.needLogin, '未登录');
		return;
	}

	let openid = await _getOpenId();

	//在memcache里查找
	try{
		user = await memcache.get(openid);
	}catch(e){
		//do nothing
	}

	if(!user){
		//memcache没有，去数据库查找
		try{
			user = await User.findOne({
				where:{
					uid: openid
				}
			});
		}catch(e){
			//do nothing	
		}
	}
	if(user){
		ctx.response.body = response.succ(user, 'ok');
	}else{
		ctx.response.body = response.error(Error.codes.server.notFound, '未找到当前用户');
	}
}

module.exports = {
	'POST /login': login,
	'GET /getUserInfo': getUserInfo
}