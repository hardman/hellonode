
const ejs = require('ejs');
const fs = require('fs');

module.exports = {
	render : (file, data) => {
		let content = fs.readFileSync(__dirname + '/../views/' + file + '.ejs');
		console.log(` -- content= ${content}`);
		if (!data) {
			return content;
		}
		if (!content) {
			return undefined;
		}
		let renderHtml = ejs.render(String(content), data);
		return renderHtml;
	}
}