require("dotenv").config();
const fetch = require("node-fetch");
const path = require("path");
const remoteAPIHost = process.env.REMOTE_API_HOST;

const request = {
    async get(requestPath, token){
        const options = {
            method: "GET",
            mode: "cors",
            chache: "no-chache",
            credentials: "same-origin",
            headers: token?
                {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Bearer ${token}`
                }:
                {
                    "Content-Type": "application/json; charset=utf-8",
                }
                ,
            redirect: "follow",
            referrerPolicy: "no-referrer"
        };
        const res = await fetch(path.join(remoteAPIHost, requestPath, "/"), options);
        return await res.json();
    },
    async post(requestPath, data, token){
        const options = {
            method: "POST",
            mode: "cors",
            chache: "no-chache",
            credentials: "same-origin",
            headers: token?
                {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Bearer ${token}`
                }:
                {
                    "Content-Type": "application/json; charset=utf-8",
                }
                ,
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(data)
        };
        const res = await fetch(path.join(remoteAPIHost, requestPath, "/"), options);
        return await res.json();
    }
}

module.exports = request;