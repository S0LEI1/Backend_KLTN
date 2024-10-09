import { createClient } from 'redis';

// Create and configure Redis client
export const redisClient = createClient({
  url: `redis://${process.env.AUTH_REDIS_HOST}`,
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
redisClient.connect().catch(console.error);

// Function to set a key-value pair in Redis
export const setValue = async (
  key: string,
  value: string,
  exp: number
): Promise<void> => {
  await redisClient.set(key, value, { EX: exp });
};

// Function to retrieve a value by key from Redis
export const getValue = async (key: string): Promise<string | null> => {
  return redisClient.get(key);
};
