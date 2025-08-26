import redis from "../config/redis.js";

class Cache {
    async get(key) {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            try {
                return JSON.parse(data);
            } catch (err) {
                await this.del(key).catch(() => { });
                throw err;
            }
        } catch (error) {
            console.log("cache error : ", error)
        }
    }
    async set(key, data, ttl = 300) {
        try {
            console.log(" set ", key);
            await redis.set(key, JSON.stringify(data), 'EX', ttl);
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

    async inc(key) {
        try {
            console.log("Increment : ", key)
            await redis.incr(key)
        } catch (error) {
            console.log("cache error : ", error);

        }
    }
}
export default new Cache()