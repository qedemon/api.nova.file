require("dotenv").config();
const http = require("http");
const router = require("./router");
http.createServer(router).listen(
    process.env.HTTP_PORT,
    ()=>{
        console.log(`http server listening port ${process.env.HTTP_PORT}`);
    }
)
