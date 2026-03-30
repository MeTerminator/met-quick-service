import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = await getRedisClient();
    const messages = await redis.lRange('messages', 0, 99);
    return NextResponse.json(messages.map(m => JSON.parse(m)));
  } catch (error) {
    console.error('Redis error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, username, content } = await request.json();

    // Validation
    if (!title || title.length > 80) return NextResponse.json({ error: 'Title too long' }, { status: 400 });
    if (!username || username.length > 40) return NextResponse.json({ error: 'Username too long' }, { status: 400 });
    if (!content || content.length > 5000) return NextResponse.json({ error: 'Content too long' }, { status: 400 });

    const message = {
      title,
      username,
      content,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(7)
    };

    const redis = await getRedisClient();
    await redis.lPush('messages', JSON.stringify(message));

    return NextResponse.json(message);
  } catch (error) {
    console.error('Redis error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
