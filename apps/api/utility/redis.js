  import Redis from 'ioredis';
  import { Queue } from 'bullmq'

  const redis = new Redis({
    host: 'redis-13299.c239.us-east-1-2.ec2.cloud.redislabs.com',
    port:  13299,

    password: 'Ly4YUbzyLSFcPfLl20vp2Tcgv2dtwLE0',
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