import redis from "../utility/redis.js";

/**
 * Cache keys are namespaced by owner.
 *
 * An explanation has exactly one owner, so a namespaced key can only ever be
 * written by that owner. That makes a cross-user cache hit structurally
 * impossible, rather than dependent on a caller remembering to check ownership
 * before reading the cache.
 */
export const explanationKey = (userId, explanationId) =>
    `explanation:${userId}:${explanationId}`;

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

    static async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error('Cache del error:', error);
            return false;
        }
    }
}
