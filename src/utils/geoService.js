import ApiError from "./ApiError.js";
import redis from "../config/redis.js";
class Geo {
    constructor() {
        this.GEO_KEY = 'events:geo'
    }

    async addEvent(eventId, longitude, latitude) {
        try {
            await redis.geoadd(this.GEO_KEY, longitude, latitude, eventId.toString());
            console.log(` event : ${eventId} added to geo index`)
        } catch (error) {
            throw new ApiError(500, "error while uploading event to geo index : " + error.message)
        }
    }

    async removeEvent(eventId) {
        try {
            await redis.zrem(this.GEO_KEY, eventId.toString())
            console.log(`Event ${eventId} removed from geo index`)
        } catch (error) {
            throw new ApiError(500, "error while removing event from geo index : " + error.message)
        }
    }

    async removePattern(pattern) {
        try {
            const totalFields = await redis.keys(pattern)
           if(totalFields.length)
            await redis.unlink(...totalFields)

        } catch (error) {
            throw new ApiError(500, "error while removing pattern from geo index : " + error.message)
        }
    }

    async updateEvent(eventId, longitude, latitude) {
        try {
            await redis.geoadd(this.GEO_KEY, longitude, latitude, eventId.toString());
            console.log(` event : ${eventId} updated at geo inex`)
        } catch (error) {
            throw new ApiError(500, "error while updating event to geo index : " + error.message)
        }
    }

    async getNearbyEvents(longitude, latitude, radius, unit) {
        try {
            const key = `NearbyFrom:${longitude}:${latitude}`
            
            if (await redis.exists(key)) return { geoEvents: await redis.zrange(key, 0, -1, 'WITHSCORES'), total: await redis.zcard(key) }
            
            await redis.geosearchstore(key, this.GEO_KEY, 'FROMLONLAT', longitude, latitude, 'BYRADIUS', radius, unit, 'STOREDIST')
            await redis.expire(key, 24 * 60 * 60)
            

            return { geoEvents: await redis.zrange(key, 0, -1, 'WITHSCORES'), total: await redis.zcard(key) }
        } catch (error) {
            throw new ApiError(500, "error while getting loction through geo index" + error.message)
        }
    }

    async getEventCoordinates(eventId) {
        try {
            const coordinates = await redis.geopos(this.GEO_KEY, eventId.toString())
            return coordinates

        } catch (error) {
            throw new ApiError(500, "error while getting loction through geo index" + error.message)
        }
    }
}
export default new Geo()