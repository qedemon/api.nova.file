const fs = require("fs");
const path = require("path");

async function composeFile(src, dest, count){
    await new Promise(
        (resolve, reject)=>{
            try{
                fs.writeFileSync(dest, "");
                Array.from({length: count}, (_, index)=>{
                    return path.join(src, `${index}.part`);
                }).forEach((filePath)=>{
                    const data = fs.readFileSync(filePath);
                    fs.appendFileSync(dest, data);
                });
                resolve();
            }
            catch(error){
                reject(error);
            }
        }
    )
}

module.exports = {
    composeFile
}