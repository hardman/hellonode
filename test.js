let memcache = require('./utils/memcache');

let events = require('events');

function testAsync(){
    async function testAsync(param) {
        console.log(`param = ${param}`);
        await new Promise(async (resolve, reject) => {
            console.log(`hello`);
            await new Promise((res, rej) => {
                console.log(`hello1`);
                setTimeout(() => {
                    res(666);
                    resolve(789);
                }, 3000);
            })
        });
        let ret = 123
        console.log(`after await ret=${ret}`);
        return new Promise((resolve, reject) => {
            console.log(`hello return promise`);
            resolve(999);
        });
    }

    async function wrapper(){
        
    }

    let ret = testAsync().then((data)=>{
        console.log(`data=${data}`);
    }).catch((err) => {
        console.log(`err=${err}`);
    });
    console.log(`ret=${ret}`);
}

function testMemcache(){
    memcache.test();
}

//测试代码都写在test函数内
let test = () => {
    // testAsync();
    testMemcache();
    // console.log(process);
    
}

module.exports = {
    runTest: false,
    test
}