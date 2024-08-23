require('dotenv').config();
const redis = require("redis");
const {REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD} = process.env;
redis.createClient({ url: `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}` })
   .on('connect', () => {
      console.info('Redis connected!');
   })
   .on('error', (err) => {
      console.error('Redis Client Error', err);
   })
   .connect()
   .then(async client=>{
      await client.set(`${REDIS_USER}:test`, "test");
      const result = await client.get(`${REDIS_USER}:test`);
      console.log(result);
   })