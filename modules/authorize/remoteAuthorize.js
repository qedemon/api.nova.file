const request = require("modules/serverUtility/remoteConnection");

async function remoteAuthorize(token){
    try{
        const {success, CODE, userInfo} = await request.get("api/userinfo", token);
        if(!success){
            throw new Error(CODE);
        }
        return {
            user: userInfo
        };
    }
    catch(error){
        return {
            error
        }
    }
}

module.exports = remoteAuthorize;