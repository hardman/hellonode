
class MyError extends Error{
    constructor(code, msg, ext = null){
        super(msg);
        this.code = code;
        this.msg = msg;
        this.ext = ext;
    }
}

MyError.assertType = (v, type, msg) => {
    if(typeof(v) != type){
        throw new MyError(MyError.codes.invalidParams, msg || `${typeof(v)} != ${type}`);
    }
}

MyError.assertBool = (v, msg) => {
    if(typeof(v) != 'boolean' && (v != 'true' && v != 'false')){
        throw new MyError(MyError.codes.invalidParams, msg || `${v} muset be boolean`);
    }
}

MyError.assertNumber = (v, msg) => {
    if(typeof(v) != 'number' && (typeof(v) == 'string' && parseFloat(v) == NaN)){
        throw new MyError(MyError.codes.invalidParams, msg || `${v} must convert to number`);
    }
}

MyError.assertValue = (v, v1, msg) => {
    if(v != v1){
        throw new MyError(MyError.codes.invalidParams, msg || `${v} != ${v1}`);
    }
}

MyError.assertEqual = (v, v1, msg) => {
    if(v != v1){
        throw new MyError(MyError.codes.invalidParams, msg || `${v} != ${v1}`);
    }
}

MyError.assertNotEqual = (v, v1, msg) => {
    if(v == v1){
        throw new MyError(MyError.codes.invalidParams, msg || `${v} == ${v1}`);
    }
}

MyError.assertValueExist = (v, msg) => {
    if(!v){
        throw  new MyError(MyError.codes.invalidParams, msg || `${v} == undefined`);
    }
}

MyError.assertValueIn = (v, arr, msg) => {
    if(!Array.isArray(arr)){
        throw  new MyError(MyError.codes.invalidParams, `v=${v}, arr=${v} msg=${msg}`);
    }
    if(!arr.includes(v)){
        throw  new MyError(MyError.codes.invalidParams, msg || `${v} == undefined`);
    }
}

MyError.prototype[Symbol.toString] = function () {
    console.log(`code=${this.code}, msg=${this.msg} ${this.ext ? this.ext : ''}`);
}

MyError.codes = {
    server: {
        succ: 0,//成功
        invalidParams: 400,//参数错误
        needLogin: 401,//需要登录
        requestFrenquently: 402,//请求频繁
        notFound: 404,//未找到
        notEnough:405,//数量不足
        ignore:406,//忽略请求
        internalError: 500,//内部错误
    },
    login: {
        noOpenid: 1001,
        wechatSessionKeyRequestFailed: 1002,
        modelError: 1003,
    },
    memcache: {
        noConnect: 1004,
        noResult: 1005
    },
    request: {
        requestFailed: 1006
    }
}

module.exports = MyError;