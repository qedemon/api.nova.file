const Errors = {
    NoTempFileWithKey: class extends Error{
        constructor(key){
            super(`there is no temp file matching key: ${key}`);
            this.name = "NoTempFileWithKey";
            this.code = 1;
        }
    },
    NoInMemoryDataWithKey: class extends Error{
        constructor(key){
            super(`there is no in-memory data matching key: ${key}`);
            this.name = "NoTempFileWithKey";
            this.code = 1;
        }
    },
    UploadNotComplete: class extends Error{
        constructor(key, remain){
            super(`${remain} byte data not uploaded with key ${key}`);
            this.name = "UploadNotComplete",
            this.code = 2;
        }
    }
}

module.exports=Errors;