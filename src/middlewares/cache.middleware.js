
import cache from "../utils/cache.js";

const cacheMiddleware = (ttl = 300) => async (req, res, next) => {
    if (req.method !== 'GET') {
       return  next();
    }
    const key = `${req.method}:${req.originalUrl}`
    const cachedData = await cache.get(key);
    if (cachedData){ 
        
        return res.json(cachedData)
    }

    const originalJson = res.json;

    res.json = function (data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache.set(key, data, ttl);
        }
        originalJson.call(this, data);
    }
    next();
}
export default cacheMiddleware