import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-11450.crce194.ap-seast-1-1.ec2.redns.redis-cloud.com',
  port:  11450,
  password: 'C69P1SF0EXmi3UkfVqWAR8N62Hyky8I1',

});

redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});


export default redis;