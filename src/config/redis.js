import Redis from "ioredis";
const redis =  new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest:3,

})
redis.on('connect',()=>{
    console.log("connecting to redis");

})
redis.on('ready',()=>{
    console.log("connected to redis");
})
redis.on('error',(err)=>{
    console.log('Redis error', err);
})
export default redis