
const ejs = require('../utils/ejs')

let hello = async (ctx, next) => {
	let name = ctx.params.name;
	ctx.response.body = ejs.render('hello', {name: name});
}

let index = async (ctx) => {
	ctx.response.body = '<h1>Index</h1>';
}

module.exports = {
	'GET /' : index,
	'GET /hello/:name' : hello
}