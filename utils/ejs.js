
const ejs = require('ejs');
const fs = require('fs');

module.exports = {
	render : (file, data) => {
		let filename = __dirname + '/../views/' + file + '.ejs';
		let content = fs.readFileSync(filename);
		console.log(` -- content= ${content}`);
		if (!data) {
			return content;
		}
		if (!content) {
			return undefined;
		}
		let params = Object.assign({}, data, {filename: filename});
		let renderHtml = ejs.render(String(content), params);
		return renderHtml;
	}
}