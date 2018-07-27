const request = require('request');
const Qs = require('qs');

let get = function({url, params}){
    return new Promise((resolve, reject) => {
        request(
            {
                method: 'get',
                url: url + '?' + Qs.stringify(params),
            },
            (err, res, body) => {
                console.log(`request get ${url} err = ${err}, res = ${JSON.stringify(res)}, body = ${body}`);
                if(res.statusCode == 200) {
                    resolve({body});
                } else {
                    reject({error: err, statusCode: res.statusCode || 0});
                }
            }
        )
    })
}

let post = function({url, params}) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: 'post',
                url: url,
                form: Qs.stringify(params),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            },
            (err, res, body) => {
                console.log(`request post ${url} err = ${err}, res = ${JSON.stringify(res)}, body = ${body}`);
                if(res.statusCode == 200) {
                    resolve({body});
                } else {
                    reject({error: err, statusCode: res.statusCode || 0});
                }
            }
        )
    })
}

module.exports = {
    get,
    post
}