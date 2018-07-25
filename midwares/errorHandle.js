const response = require('../utils/response');
module.exports = {
    internalerror: function(){
        return async (ctx, next) => {
            try {
                await next();
            } catch (e) {
                const debug = require('../package.json').debug;
                if(debug){
                    ctx.response.body = JSON.stringify(response.error(response.codes.internalError, '内部错误')) + "\r\n" + e.stack;
                }else{
                    ctx.response.body = response.error(response.codes.internalError, '内部错误');
                }
            }
        }
    },
    httperror: function(){
        return async (ctx, next) => {
            ctx.response.body = response.error(ctx.response.status, ctx.response.message ? ctx.response.message: "HTTP错误");
            await next();
        }
    }
}