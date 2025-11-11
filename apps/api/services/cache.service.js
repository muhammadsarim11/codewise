
import redis from "../utility/redis.js";

export class CacheService {
    static async set(key, value, expirySeconds = 3600) {
        try {
            const serialized = JSON.stringify(value);
            await redis.setex(key, expirySeconds, serialized);
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    static async get(key) {
        try {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
}
