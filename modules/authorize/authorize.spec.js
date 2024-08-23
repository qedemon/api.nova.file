const authorize = require("./authorize");

test("authorize", async ()=>{
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjQsImdyYWRlIjo5LCJsZXZlbCI6MCwiYXV0b0xvZ2luIjp0cnVlLCJpYXQiOjE3MDU1OTEyNDIsImV4cCI6MTcwNjgwMDg0Mn0.3wMZGnr8aWi5k0CjLrG8EGW19w-Y7DgEsIaPFoxTsm0";
    const {authorized, userInfo, origin, error} = await authorize(token);
    expect(authorized).toBe(true);
})