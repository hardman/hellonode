

let wx = {
    appid: 'wx10edda71f6a5fa5d',
    appsecret: '82e39983e0832051b80d4a808f6c05f4'
}

let ssl = {
    key: __dirname + '/../ssl/214903003390429.key',
    cert: __dirname + '/../ssl/214903003390429.pem'
}

let memcache = {
    host: '127.0.0.1',
    port: 12111
}

let server = {
    port: 3000
}

let mysql = {
    database: 'koaminigame',
    username: 'wanghy',
    password: 'wang@1234',
    host: 'localhost',
    port: 3306
}

let config = {
    wx,
    ssl,
    server,
    memcache,
    mysql,
    isDebug: true
}

module.exports = config;