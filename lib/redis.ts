import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.MET_REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000, // 5 seconds timeout to prevent hanging
      }
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  } else if (!client.isOpen) {
    await client.connect();
  }
  return client;
}
