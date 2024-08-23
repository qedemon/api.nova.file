const path = require("path");
const file = require(path.join(__dirname, "file"));
console.log("file module loaded");
module.exports={
    middleware: file
}