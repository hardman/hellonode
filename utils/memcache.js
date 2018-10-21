
//memcache module patch
let events = require('events');
process.EventEmitter = events.EventEmitter;

let memcache = require('memcache');
let config = require('./config');

let Error = require('../utils/error');

let mc = {
    connected: false,
    client: null,

    async connect(){
        if(!this.client){
            this.client = new memcache.Client(config.memcache.port, config.memcache.host);
        }
        return await new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                this.connected = true;
                resolve(true);
            });
            this.client.connect();
        });
    },

    async close(){
        if(this.client){
            return await new Promise((resolve, reject) => {
                this.client.on('close', () => {
                    this.connected = false;
                    resolve(true);
                });
                this.client.close(); 
            });
        }
        this.client = null;
        return true;
    },

    async get(key){
        return await new Promise((resolve, reject) => {
            if(!this.connected){
                reject(new Error(Error.codes.memcache.noConnect, 'no connect'));
                return;
            }
            this.client.get(key, (err, result) => {
                if(err || !result){
                    reject(err || new Error(Error.codes.memcache.noResult, 'no result'));
                }else{
                    try{
                        let obj = JSON.parse(result);
                        if(obj.value) {
                            resolve(obj.value);
                        }else{
                            reject(new Error(Error.codes.memcache.noResult, 'no result'));
                        }
                    }catch(err){
                        reject(err || new Error(Error.codes.memcache.noResult, 'no result'));
                    }
                }
            });
        });
    },

    async set(key, value, lifetime, flags) {
        return await new Promise((resolve, reject) => {
            if(!this.connected){
                reject(new Error(Error.codes.memcache.noConnect, 'no connect'));
                return;
            }
            this.client.set(key, JSON.stringify({value}), (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            }, lifetime, flags);
        });
    },

    async delete(key){
        return await new Promise((resolve, reject) => {
            if(!this.connected){
                reject(new Error(Error.codes.memcache.noConnect, 'no connect'));
                return;
            }

            this.client.delete(key, (err, result) => {
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        })
    },

    async test(){
        let connected = await this.connect();
        console.log(`connected = ${this.connected}`);
        try{
            let value = await this.get("key");
            console.log(`get(key) = ${value}`);
        }catch(err){
            console.log(`error when get ${err}`);
        }
        let setted = await this.set("key", {a:1,b:"2", c:{d:1}}, 0, 0);
        console.log(`setted = ${setted}`);
        let valueAfterSetted = await this.get("key");
        console.log(`valueAfterSetted = ${JSON.stringify(valueAfterSetted)}`);
        let closed = await this.close();
        console.log(`after closed = ${closed}`);
    },

    start(){
        (async () => {
            let connected = await this.connect();
            console.log(`memcache is connected ${connected}`);
        })();
        console.log(`memcache called start()`);
    }
}

module.exports = mc;