const fs = require("fs");
const path = require("path");
const express = require("express");
const routes = JSON.parse(fs.readFileSync(path.join(__dirname, "routes.json"), {encoding: "utf8"}));
const cors = require("cors");
const app = (
    (routes)=>{
        const app = express();
        app.use(cors(
            {
                origin: '*'
            }
        ))
        routes.forEach(
            (route)=>{
                app.use(`/${route.name}`, require(route.route).middleware);
            }
        )
        return app;
    }
)(routes);
module.exports = app;