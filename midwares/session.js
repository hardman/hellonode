
const Session = require('koa-session');

module.exports = (app) => { 
    app.keys = ['sessionforhellonode'];
    return Session(
        {
            key:'koa:sess',
            maxAge:86400000,
            overwrite: true,
            httpOnly: true,
            signed: true,
            rolling:false,
            renew:false
        }, 
        app
    )
}