require("dotenv").config();
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const express = require("express");
const app = express();
const {useRedisConnection, ...redis} = require("./redis");
const {responseData, responseError} = require("modules/serverUtility");
const FileErrors = require("./FileErrors");
const {middleware: authorization} = require("modules/authorize");

const getChunkSize = ()=>(1<<20);//1Mbyte

app.post("/createFile", express.json());
app.post("/createFile", authorization);
app.post("/createFile", async (req, res)=>{
    const conn = await useRedisConnection();
    const key = uuid.v4();
    const storage = process.env.FILE_STORAGE;
    const {fileName, fileSize} = req.body;
    
    fs.mkdir(path.join(storage, process.env.TEMP_FILE_DIRECTORY, key),
        (
            (key, fileName, fileSize, response)=>async (error)=>{
                if(error)
                    throw error;
                const chunkSize = getChunkSize();
                const partData = ((fileSize, chunkSize)=>{
                    const fullSizePart = Array.from({length: fileSize/chunkSize}).fill(chunkSize);
                    const remainingPart = fileSize%chunkSize;
                    return remainingPart>0?[...fullSizePart, remainingPart]:fullSizePart;
                })(fileSize, chunkSize);
                console.assert(partData.reduce(
                    (result, part)=>{
                        return result+part;
                    },0
                )===fileSize, fileSize);
                await(
                    async (connection, key, partData) => {
                        await redis.set(connection, [key, "fileName"].join(":"), fileName);
                        await redis.list.rPush(connection, [key, "uploaded"].join(":"), partData.map(element=>element.toString()));
                    }
                )(conn, key, partData);

                responseData(response, {
                    key,
                    fileName,
                    fileSize,
                    partData
                });
            }
        )
        (
            key,
            fileName,
            fileSize,
            res
        )
    )
});

app.get("/getUploaded/:key", async (req, res)=>{
    const {key} = req.params;
    const conn = await useRedisConnection();
    const fileName = await redis.get(conn, [key, "fileName"].join(":"));
    const uploaded = (await redis.list.lRange(conn, [key, "uploaded"].join(":"), 0, -1)).map((value)=>(parseInt(value)));
    responseData(res, {
        key,
        fileName,
        uploaded
    });
});

const multer = require("multer");
const { composeFile } = require("./composeFile");
const fileFilter = async(req, file, cb)=>{
    const conn = await useRedisConnection();
    const {key} = req.body;
    const result = await Promise.all(
        [
            redis.exists(conn, [key, "fileName"].join(":")),
            redis.exists(conn, [key, "uploaded"].join(":"))
        ]
    );
    if(result[0] && result[1]){
        cb(null, true);
    }
    else{
        cb(new FileErrors.NoTempFileWithKey(key));
    }
}
const storage = multer.diskStorage(
    {
        destination: (req, file, cb)=>{
            const {key} = req.body;
            const destination = path.join(process.env.FILE_STORAGE, process.env.TEMP_FILE_DIRECTORY, key);
            cb(null, destination);
        },
        filename: (req, file, cb)=>{
            const {partNo} = req.body;
            cb(null, `${partNo}.part`);
        }
    }
)
const upload = multer(
        {
            fileFilter,
            storage,
        }
    ).single("part");
app.post("/uploadPart", (req, res)=>{
    upload(req, res, async (error)=>{
        if(error){
            responseError(res, error);
            return;
        }
        const {key, partNo} = req.body;
        const conn = await useRedisConnection();
        await redis.list.lSet(conn, `${key}:uploaded`, partNo, "0");
        const uploaded = (await redis.list.lRange(conn, `${key}:uploaded`, 0, -1)).map((data)=>parseInt(data));
        responseData(res, {
            key,
            uploaded
        })
    });
});

app.use("/composeFile", express.json());
app.post("/composeFile", async (req, res)=>{
    try{
        const conn = await useRedisConnection();
        const {key} = req.body;
        if(
            !((result)=>{
                return result.reduce(
                    (out, result)=>{
                        return out && result
                    },
                    true
                )
            })
            (await Promise.all(
                [
                    redis.exists(conn, [key, "fileName"].join(":")),
                    redis.exists(conn, [key, "uploaded"].join(":")),
                ]
            ))
        ){
            throw new FileErrors.NoInMemoryDataWithKey(key);
        }
        const uploaded = (await redis.list.lRange(conn, `${key}:uploaded`, 0, -1)).map((value)=>(parseInt(value)));
        const fileName = await redis.get(conn, `${key}:fileName`);
        const extention = fileName.split('.').pop().toLowerCase();
        const remainSize = uploaded.reduce(
            (result, element)=>{
                return result+element;
            },
            0
        );
        if(remainSize){
            throw new FileErrors.UploadNotComplete(key, remainSize);
        }
        const allPartExists = (await Promise.all(
            uploaded.map(
                ((key)=>(_, index)=>{
                    return new Promise(
                        (resolve)=>{
                            fs.exists(path.join(process.env.FILE_STORAGE, "temp", key, `${index}.part`), (e)=>{
                                resolve(e);
                            })
                        }
                    )
                })(key)
            )
        )).reduce((result, element)=>(result && element), true);
        if(!allPartExists){
            throw new FileErrors.NoTempFileWithKey(key);
        }
        const composedFileName = `${key}.${extention}`;
        await composeFile(path.join(process.env.FILE_STORAGE, process.env.TEMP_FILE_DIRECTORY, key), path.join(process.env.FILE_STORAGE, process.env.COMPLETE_FILE_DIRECTORY, composedFileName), uploaded.length);
        await Promise.all(
            [
                redis.del(conn, `${key}:fileName`),
                redis.del(conn, `${key}:uploaded`),
                new Promise(
                    (resolve, reject)=>{
                        fs.rmdir(path.join(process.env.FILE_STORAGE, process.env.TEMP_FILE_DIRECTORY, key), {recursive: true}, (error)=>{
                            if(error)
                                reject(error);
                            else{
                                resolve(true);
                            }
                        })
                    }
                )
            ]
        );
        responseData(res, {
            key,
            fileName: composedFileName,
            ok: true
        });
    }
    catch(error){
        responseError(res, error);
    }
});

app.get("/static/:filePath", (req, res)=>{
    const staticPath = path.join(process.env.FILE_STORAGE, process.env.COMPLETE_FILE_DIRECTORY);
    res.sendFile(req.params.filePath, {root: staticPath});
});

app.get("/", (req, res)=>{
    res.writeHead(200, {"Content-type": "text/plain"});
    res.write("file module");
    res.end();
})

module.exports = app;