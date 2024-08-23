const authorize = require("./authorize");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use("/", cookieParser());
app.use("/", async (req, res, next)=>{
    const token = 
    (
        (match)=>{
            const prefix = match?match[0]:null;
            const index = match?.index;
            const input = match?.input;
            if(prefix)
                return input.substr(prefix.length+index);
            else
                return "";
        }
    )(req.headers.authorization?.match(/^bearer /i)) || req.cookies.token;

    const {authorized, userInfo, origin, error} = await authorize(token);
    req.authorization={
        authorized,
        ...(
            authorized?{
                userInfo,
                origin
            }:{
                error
            }
        )
    }
    next();
})

module.exports = app;