import redis from "../config/redis.js";

class Cache {
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.log("cache error : ", error)
        }
    }
    async set(key, data, ttl = 300) {
        try {
            console.log(" set ", key);
            await redis.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.log("cache error : ", error)
        }
    }
    async del(key) {
        try {
            console.log("del", key);
            await redis.unlink(key);
        } catch (error) {
            console.log("cache error : ", error)
        }
    }
    async delPattern(pattern) {
        try {
            console.log("delPattern ", pattern);
            const keys = await redis.keys(pattern);
            if (keys.length > 0) await redis.unlink(...keys)
        } catch (error) {
            console.log("cache error : ", error)
        }
    }
}
export default new Cache()