import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { ChatMessageSchema } from '@/lib/validation';
import { processChatbotMessage } from '@/services/chatbot.service';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const user = await getCurrentUser();
    const rateLimitId = user ? `user:${user.id}` : `ip:${ip}`;

    // 1. Rate limiting check (20 requests per minute by default)
    const rateCheck = checkRateLimit(rateLimitId, 25, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending another query.'
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateCheck.resetAt - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // 2. Maintenance mode check
    const maintenance = await prisma.appSettings.findUnique({
      where: { settingKey: 'maintenance_mode' }
    });
    if (maintenance?.settingValue === 'true' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Study Chat Bot is currently undergoing scheduled maintenance. Please check back shortly.' },
        { status: 503 }
      );
    }

    // 3. Chatbot enabled check
    const botEnabled = await prisma.appSettings.findUnique({
      where: { settingKey: 'chatbot_enabled' }
    });
    if (botEnabled?.settingValue === 'false' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Study Chat Bot is temporarily disabled by the administrator.' },
        { status: 503 }
      );
    }

    // 4. Request validation
    const body = await req.json();
    const parseResult = ChatMessageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid message request', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { message, conversationId, subjectCode, paperId, action, imageUrl, imageBase64 } = parseResult.data;

    const reply = await processChatbotMessage({
      message: message || 'Please analyze and solve the question in this image.',
      userId: user?.id || null,
      conversationId,
      subjectCode,
      paperId,
      action,
      imageUrl,
      imageBase64
    });

    return NextResponse.json(reply);
  } catch (err: unknown) {
    console.error('Chatbot API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your study request. Please try again.' },
      { status: 500 }
    );
  }
}
