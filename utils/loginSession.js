
const crypto = require('../utils/crypto');
const memcache = require('../utils/memcache');

let isLogin = (ctx) => {
	return !!(ctx.session && ctx.session.session_key);
}

let getOpenId = async (ctx) => {
	if(isLogin(ctx)){
		try{
			return await memcache.get(ctx.session.session_key);
		}catch(e){
			return null;
		}
	}else{
		return null;
	}
}

let addSession = async (ctx, openid, sessionKey) => {
	//openid + md5 存在session中
    let sessionkeyMd5 = crypto.md5(sessionKey);
    ctx.session.session_key = sessionkeyMd5;

    //openid存储在memcache中
    await memcache.set(sessionkeyMd5, openid, 86400000); //24 * 60 * 60 * 1000)
}

let removeSession = async (ctx) => {
	if(isLogin(ctx)){
		let sessionKeyMd5 = ctx.session.session_key;
		try{
			await memcache.delete(sessionKeyMd5);
		}catch(e){
			//do nothing
		}
		ctx.session = false;
	}
}

module.exports = {
    isLogin,
    getOpenId,
    addSession,
    removeSession
}