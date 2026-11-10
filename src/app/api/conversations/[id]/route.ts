import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security';
import {
  getConversationWithMessages,
  renameUserConversation,
  deleteUserConversation
} from '@/services/conversation.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;

  const { id } = await params;
  try {
    const conversation = await getConversationWithMessages(id, auth.user.id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const updated = await renameUserConversation(id, auth.user.id, body.title);
    return NextResponse.json({ conversation: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Failed to rename conversation' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;

  const { id } = await params;
  try {
    await deleteUserConversation(id, auth.user.id);
    return NextResponse.json({ success: true, message: 'Conversation deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Failed to delete conversation' }, { status: 400 });
  }
}
