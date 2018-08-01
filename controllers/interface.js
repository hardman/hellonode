
const ejs = require('../utils/ejs');

let interface = (ctx, next) => {
    ctx.response.body = ejs.render('interface', {title: '接口测试', controllers:[{name:'hello'}, {name:'world'}]});
}

module.exports = {
    'GET /interface': interface
}