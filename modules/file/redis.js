require('dotenv').config();
const {REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD} = process.env;
const redis = require("redis");
let connection = null;
async function useRedisConnection({host, port, user, password}={}){
    if(connection){
        return connection;
    }
    else{
        const connectingHost = host?host:REDIS_HOST;
        const connectingPort = port?port:REDIS_PORT;
        const connectingUser = user?user:REDIS_USER;
        const connectingPassword = password?password:REDIS_PASSWORD;
        
        const newConnection = await redis.createClient({ url: `redis://${connectingUser}:${connectingPassword}@${connectingHost}:${connectingPort}` })
            .on('connect', () => {
            console.info('Redis connected!');
            })
            .on('error', (err) => {
            console.error('Redis Client Error', err);
            })
            .connect();
        connection = newConnection;
        return connection;
    }
}

function userKey(key){
    return `${REDIS_USER}:${key}`;
}
async function get(connection, key){
    return await connection.get(userKey(key));
}
async function set(connection, key, value){
    return await connection.set(userKey(key), value);
}
async function hGet(connection, key, field){
    return await connection.hGet(userKey(key), field);
}
async function hSet(connection, key, field, value){
    return await connection.hSet(userKey(key), field, value);
}
async function keys(connection, pattern){
    return await connection.keys(userKey(pattern));
}
async function exists(connection, key){
    return await connection.exists(userKey(key));
}
async function del(connection, key){
    const keys = (Array.isArray(key)?key:[key]).map((keyMaker=>key=>(keyMaker(key)))(userKey));
    return await keys.length>0?connection.del(keys):null;
}

const list = {
    lPush: async function lPush(connection, key, value){
        return await connection.lPush(userKey(key), value);
    },
    rPush: async function rPush(connection, key, value){
        return await connection.rPush(userKey(key), value);
    },
    lLen: async function lLen(connection, key){
        return await connection.lLen(userKey(key));
    },
    lSet: async function lSet(connection, key, index, value){
        return await connection.lSet(userKey(key), index, value);
    },
    lRange: async function lRange(connection, key, start, stop){
        return await connection.lRange(userKey(key), start, stop);
    }
}

module.exports = {
    useRedisConnection,
    get,
    set,
    hGet,
    hSet,
    keys,
    exists,
    del,
    list
}