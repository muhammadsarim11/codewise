import Redis from 'ioredis';
import { Queue } from 'bullmq';
import 'dotenv/config';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      family: 0, // Forces IPv4 instead of IPv6 (required on Render)
    })
  : new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      family: 0, // Forces IPv4 instead of IPv6 (required on Render)
    });

redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const explanationQueue = new Queue('explanation-jobs', {
  connection: redis,
});

export default redis;