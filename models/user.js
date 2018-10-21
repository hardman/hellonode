const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');
const memcache = require('../utils/memcache');
const Error = require('../utils/error');

//创建user表
/*
create table if not exists users( 
    id int not null auto_increment primary key,
    uid varchar(50) not null unique key,
    username varchar(100) not null,
    avatar varchar(256),
    gender tinyint,
    language varchar(16),
    city varchar(32),
    province varchar(32),
    country varchar(32),
    createdat bigint,
    updatedat bigint,
    wxopenid varchar(256),
    device varchar(50)
    )
;
*/
let userModel = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uid: {
        type: Sequelize.STRING(50),
        unique: true
    },
    username:Sequelize.STRING(100),
    avatar: Sequelize.STRING(256),
    gender: Sequelize.TINYINT,
    language: Sequelize.STRING(16),
    city: Sequelize.STRING(32),
    province: Sequelize.STRING(32),
    country: Sequelize.STRING(32),
    createdat: Sequelize.BIGINT,
    updatedat: Sequelize.BIGINT,
    wxopenid: Sequelize.STRING(256),
    device: Sequelize.STRING(50)
}, {
    timestamps: false
});

//查找用户
let findUser = async (uid) => {
    console.log(`查找用户uid=${uid}`);
    let user = null;
    try{
        user = await memcache.get(uid);
    }catch(e){
        //do nothing
    }
    if(!user){
        try{
            user = await userModel.findOne({
                where: {
                    uid
                }
            });
        }catch(e){
            //do nothing
        }

        if(user){
            await memcache.set(uid, user);
        }
    }
    return user;
}

//创建用户
let createUser = async (uid, {nickName, avatarUrl, gender, language, city, province, country}) => {
    console.log(`创建用户uid=${uid}`);
    let user = await findUser(uid);
    if(user){
        return user;
    }
    user = await userModel.create({
        uid,
        username: nickName,
        avatar: avatarUrl,
        gender,
        language,
        city,
        province,
        country,
        createdat: Date.now(),
        updatedat: Date.now()
    });

    if(user){
        user = await findUser(uid);
    }

    return user;
}

//修改信息
let updateUser = async (uid, {nickName, avatarUrl, gender, language, city, province, country}) => {
    console.log(`更新用户uid=${uid}`);
    let user = await findUser(uid);
    if(!user){
        throw new Error(Error.codes.server.notFound, '没有找到用户');
    }

    let composeParams = {}
    let changed = false;
    if(nickName != user.username){
        composeParams.username = nickName;
        changed = true;
    }
    if(avatarUrl != user.avatar){
        composeParams.avatar = avatarUrl;
        changed = true;
    }
    if(gender != user.gender){
        composeParams.gender = gender;
        changed = true;
    }
    if(language != user.language){
        composeParams.language = language;
        changed = true;
    }
    if(city != user.city){
        composeParams.city = city;
        changed = true;
    }
    if(province != user.province){
        composeParams.province = province;
        changed = true;
    }
    if(country != user.country){
        composeParams.country = country;
        changed = true;
    }

    if(changed){
        composeParams.updatedat = Date.now();
    }else{
        throw new Error(Error.codes.server.invalidParams, '参数错误');
    }

    //返回数组，第一个参数表示影响行数
    let newUser = await userModel.update(composeParams, {
        where: {
            uid
        }
    });

    if(Array.isArray(newUser)){
        if(newUser[0] == 1){
            newUser = await findUser(uid);
            if(newUser){
                await memcache.set(uid, newUser);
            }
        }
    }

    return newUser;
}

//登录表
//==========
/*
create table if not exists logininfos (
    uid varchar(50) not null unique key primary key,
    logintimes int,
    lastlogintime bigint
)
*/

let loginModel = sequelize.define('logininfo', {
    uid: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    logintimes: Sequelize.INTEGER,
    lastlogintime: Sequelize.BIGINT
},{
    timestamps: false
});

//登录记录
let loginRecord = async(uid) => {
    console.log(`登录记录uid=${uid}`);
    let record = await loginModel.findOne({
        where:{
            uid
        }
    });
    if(!record){
        record = await loginModel.create({
            uid,
            lastlogintime: Date.now(),
            logintimes: 1
        });
    }else{
        record = await loginModel.update({
            lastlogintime: Date.now(),
            logintimes: record.logintimes + 1
        }, {
            where: {
                uid
            }
        });
    }

    return record;
}

module.exports = {
    loginRecord,
    findUser,
    createUser,
    updateUser
}