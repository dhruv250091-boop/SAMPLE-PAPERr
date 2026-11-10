import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security';
import { getUserConversations, createConversation } from '@/services/conversation.service';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;

  try {
    const conversations = await getUserConversations(auth.user.id, search);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('Error listing conversations:', err);
    return NextResponse.json({ error: 'Failed to retrieve conversation history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;

  try {
    const body = await req.json();
    const title = (body.title || 'New Study Chat').slice(0, 100);
    const conv = await createConversation(auth.user.id, title, body.subjectCode, body.paperId);
    return NextResponse.json({ conversation: conv });
  } catch (err) {
    console.error('Error creating conversation:', err);
    return NextResponse.json({ error: 'Failed to create new conversation' }, { status: 500 });
  }
}
