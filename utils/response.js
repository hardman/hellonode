const errorCodes = {
    succ: 0,//成功
    invalidParams: 400,//参数错误
    needLogin: 401,//需要登录
    requestFrenquently: 402,//请求频繁
    internalError: 500,//内部错误
}

function error(code, msg = null, ext = null){
    let ret = {
        code: code
    }

    if(msg){
        ret.msg = msg;
    }

    if(ext){
        ret.ext = ext;
    }

    return ret;
}

function succ(data, msg = null, ext = null){
    let ret = {
        code: errorCodes.succ,
        data: data
    }

    if(msg){
        ret.msg = msg;
    }
    
    if(ext) {
        ret.ext = ext;
    }

    return ret;
}

module.exports = {
    codes: errorCodes,
    error: error,
    succ: succ,
}