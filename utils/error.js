
function Error(code, msg){
    this.code = code;
    this.msg = msg;
}

Error.assertType = (v, type, msg) => {
    if(typeof(v) != type){
        throw new Error(Error.codes.invalidParams, msg || `${typeof(v)} != ${type}`);
    }
}

Error.assertValue = (v, v1, msg) => {
    if(v != v1){
        throw new Error(Error.codes.invalidParams, msg || `${v} != ${v1}`);
    }
}

Error.assertValueExist = (v, msg) => {
    if(!v){
        throw  new Error(Error.codes.invalidParams, msg || `${v} == undefined`);
    }
}

Error.prototype[Symbol.toString] = function () {
    console.log(`code=${code}, msg=${msg}`);
}

Error.codes = {
    server: {
        succ: 0,//成功
        invalidParams: 400,//参数错误
        needLogin: 401,//需要登录
        requestFrenquently: 402,//请求频繁
        notFound: 404,//未找到
        internalError: 500,//内部错误
    }
}

module.exports = Error;