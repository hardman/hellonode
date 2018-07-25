
module.exports = () => {
	const router = require('koa-router')();

	const fs = require('fs');

	let dir = __dirname + '/../controllers';

	let files = fs.readdirSync(dir);

	let jsFiles = files.filter((f)=>{
		return f.endsWith('.js');
	});

	for (let f of jsFiles) {
		console.log(`processing controllers file ${f}`);
		let md = require(dir + '/' + f);
		for(let url in md) {
			if(url.startsWith('GET ')){
				let path = url.substring(4);
				router.get(path, md[url]);
			}else if(url.startsWith('POST ')) {
				let path = url.substring(5);
				router.post(path, md[url]);
			}else{
				console.log(`invalid route ${url}`);
			}
		}
	}
	return router.routes();
};