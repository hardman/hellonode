
const c = require('crypto');

let crypto = {
    md5(s){
        const hash = c.createHash('md5');
        hash.update(s);
        return hash.digest('hex');
    }
}

module.exports = crypto;