function responseData(response, data){
    response.writeHead(200, {"Content-type": "application/json charset=utf-8"});
    response.write(JSON.stringify(data));
    response.end()
}

function responseError(response, error){
    console.log(error);
    response.writeHead(400, {"Content-type": "application.json charset=utf-8"});
    response.write(
        JSON.stringify(
            {
                error: {
                    name: error.name,
                    code: error.code,
                    message: error.message,
                    stack: error.stack
                }
            }
        )
    )
    response.end();
}

module.exports = {
    responseData,
    responseError
}