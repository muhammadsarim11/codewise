  import Redis from 'ioredis';
  import { Queue } from 'bullmq'

  const redis = new Redis({
   username: 'default',
    password: 'po58FG7Huco4FMDUCHIjcVPy8gQorUYD',
    socket: {
        host: 'redis-10490.c285.us-west-2-2.ec2.cloud.redislabs.com',
        port: 10490,},
  skipConfigValidation: true
  });

  redis.on('connect', () => {
    console.log('Connected to Redis!');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  export const explanationQueue = new Queue('explanation-jobs', {
    connection: redis
  });

  export default redis;