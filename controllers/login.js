
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
	ctx.response.type = 'application/json';
	ctx.response.body = response.error(-100, "数据不存在");
}

module.exports = {
	'GET /auth': auth,
	'POST /login': login,
	'GET /register': register
}