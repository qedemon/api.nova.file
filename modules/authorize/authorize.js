require("dotenv").config();
const remoteAuthorize = require("./remoteAuthorize");

async function authorize(token){
    try{
        const {user, error} = await remoteAuthorize(token);
        if(error){
            throw error;
        }
        return {
            authorized: true,
            userInfo: user,
            origin: "remote"
        }
    }
    catch(error){
        return {
            authorized: false,
            error
        }
    }
}

module.exports = authorize;