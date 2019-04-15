
const test = require('./test');
if(test.runTest){
    test.test();
    console.log("只执行测试代码");
    return;
}

const Koa = require('koa');
const https = require('https');
const fs = require('fs');
const config = require('./utils/config');
const memcache = require('./utils/memcache');

const app = new Koa();

//0. 允许跨域
if(config.isDebug){
    let cors = require('koa2-cors');
    app.use(cors({
        origin: (ctx) => {
            return "http://awstar.cn:7456";
        },
        credentials: true,
        exposeHeaders: ["sessionkey", "removesessionkey"],
        allowHeaders: ["sessionkey", "removesessionkey"]
    }));
}

const errorHandle = require('./midwares/errorHandle');

//1. internalerror
app.use(errorHandle.internalerror());

//2. 执行时间
const timecost = require('./midwares/timeCost')();
app.use(timecost);

//3. session
const session = require('./midwares/session');
app.use(session(app));

//4. static
const staticmd = require('./midwares/static')();
app.use(staticmd);

//5. POST
const bodyParser = require('koa-bodyparser');
app.use(bodyParser({
    onerror: (err, ctx) => {
        console.log(`error on bodyParser ${err}`);
    }
}));

//6. route
const routes = require('./midwares/router')();
app.use(routes);

//7. 处理非逻辑错误
app.use(errorHandle.httperror());

//listen
//http
// app.listen(3000);
// console.log('app started at port 3000');

//https
https.createServer({
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
}, app.callback()).listen(config.server.port)

console.log(`https app started at port ${config.server.port}`)

//memcache
memcache.start((connected) => {
    if(connected){
        let toolModel = require('./models/tool');
        toolModel.initTool();

        let achieveModel = require('./models/achieve');
        achieveModel.initAchieveConfig();
    }
});