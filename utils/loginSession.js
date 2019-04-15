
const crypto = require('../utils/crypto');
const memcache = require('../utils/memcache');
const config = require('../utils/config');

let UseSession = {
	async isLogin(ctx){
		return !!(ctx.session && ctx.session.session_key);
	},
	
	async getOpenId(ctx){
		try{
			return await memcache.get(ctx.session.session_key);
		}catch(e){
		}
		return null;
	},
	
	async addSession(ctx, openid, sessionKey) {
		//openid + md5 存在session中
		let sessionkeyMd5 = crypto.md5(sessionKey);
		ctx.session.session_key = sessionkeyMd5;
	
		//openid存储在memcache中
		await memcache.set(sessionkeyMd5, openid, 86400); //24 * 60 * 60
	},
	
	async removeSession(ctx) {
		if(await isLogin(ctx)){
			let sessionKeyMd5 = ctx.session.session_key;
			try{
				await memcache.delete(sessionKeyMd5);
			}catch(e){
				//do nothing
			}
			ctx.session = false;
		}
	}
}

let UseHeader = {
	async isLogin(ctx){
		let sessionKey = ctx.request.headers.sessionkey;
		if(!sessionKey){
			return false;
		}
		let openId = await this.getOpenId(ctx);
		return !!openId;
	},
	
	async getOpenId(ctx){
		try{
			return await memcache.get(ctx.request.headers.sessionkey);
		}catch(e){
			//do nothing
		}
		ctx.set("removesessionkey", "1");
		return null;
	},
	
	async addSession(ctx, openid, sessionKey) {
		//openid + md5 存在session中
		let sessionkeyMd5 = crypto.md5(sessionKey);
		ctx.set("sessionkey", sessionkeyMd5);
	
		//openid存储在memcache中
		await memcache.set(sessionkeyMd5, openid, 86400); //24 * 60 * 60 * 1000)
	},
	
	async removeSession(ctx) {
		if(await this.isLogin(ctx)){
			let sessionKeyMd5 = ctx.request.headers.sessionkey;
			try{
				await memcache.delete(sessionKeyMd5);
			}catch(e){
				//do nothing
			}
			ctx.set('removesessionkey', '1');
		}
	}
}

module.exports = config.isDebug ? UseHeader: UseSession;