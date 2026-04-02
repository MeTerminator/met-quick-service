import { Redis } from '@upstash/redis';

let client: Redis | null = null;

export async function getRedisClient() {
  if (!client) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.MET_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.MET_REDIS_TOKEN;

    if (url && token) {
      client = new Redis({
        url,
        token,
      });
    } else {
      // In development or if not configured, this will try to use process.env
      try {
        client = Redis.fromEnv();
      } catch (err) {
        console.error('Failed to initialize Redis client from environment:', err);
        throw new Error('Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
      }
    }
  }
  return client;
}
