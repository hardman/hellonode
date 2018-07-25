
const Koa = require('koa');
const app = new Koa();

const errorHandle = require('./midwares/errorHandle');

//internalerror
app.use(errorHandle.internalerror());

//时间
const timecost = require('./midwares/timeCost')();
app.use(timecost);

//static
const staticmd = require('./midwares/static')();
app.use(staticmd);

//POST
const bodyParser = require('koa-bodyparser')();
app.use(bodyParser);

//route
const routes = require('./midwares/router')();
app.use(routes);

//处理非逻辑错误
app.use(errorHandle.httperror());

//listen
app.listen(3000);
console.log('app started at port 3000');