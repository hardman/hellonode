
module.exports = function(){
    return async function(ctx, next){
        let start = new Date().getTime();
        await next();
        let end = new Date().getTime();
        console.log(`request ${ctx.href} cost time=${end - start}ms`);
    }
}