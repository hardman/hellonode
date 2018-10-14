
let Error = require('./error');

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
        code: Error.codes.server.succ,
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
    error: error,
    succ: succ,
}