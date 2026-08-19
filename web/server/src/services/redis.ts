import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
});

// Immediately connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis', err);
  }
})();
