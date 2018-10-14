const response = require('../utils/response');
const Error = require('../utils/error');

module.exports = {
    internalerror: function(){
        return async (ctx, next) => {
            try {
                await next();
            } catch (e) {
                console.log(`catch a error ${e} ${e.stack}`);
                const debug = require('../package.json').debug;
                if(debug){
                    ctx.response.body = JSON.stringify(response.error(Error.codes.server.internalError, '内部错误')) + "\r\n" + e + "\r\n" + e.stack;
                }else{
                    ctx.response.body = response.error(Error.codes.server.internalError, '内部错误');
                }
            }
        }
    },
    httperror: function(){
        return async (ctx, next) => {
            ctx.response.body = response.error(ctx.response.status, ctx.response.message ? ctx.response.message: "HTTP错误");
        }
    }
}