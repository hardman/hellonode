
const fs = require('fs');

module.exports = function (){
    return async function (ctx, next){
        if(ctx.path.startsWith('/static/')) {
            console.log(`reading static file=${ctx.path}`);
            const content = fs.readFileSync(__dirname + '/../' + ctx.path);
            if(content) {
                ctx.response.body = content;
            }else{
                await next();
            }
        }else{
            await next();
        }
    }
}