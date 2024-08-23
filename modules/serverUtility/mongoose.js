require("dotenv").config();
const mongoose = require("mongoose");
let connection = null;

async function connect(){
    if(connection && mongoose.connection.readyState === 1){
        return connection;
    }
    const {MONGO_HOST, MONGO_USER, MONGO_PASSWORD, MONGO_DBNAME, MONGO_PORT, MONGO_ATHENTICATION_DBNAME} = process.env;
    const conn = await mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}?authSource=${MONGO_ATHENTICATION_DBNAME}`, {autoIndex: true});
    connection = conn;
    return connection;
}

async function disconnect(){
    if(connection && mongoose.connection.readyState === 1){
        await connection.disconnect();
        connection = null;
        return true;
    }
    return false;
}

module.exports = {
    connect,
    disconnect
}