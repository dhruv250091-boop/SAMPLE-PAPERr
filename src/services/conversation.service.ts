import prisma from '@/lib/prisma';

export async function getUserConversations(userId: string, search?: string) {
  const where: Record<string, unknown> = { userId };
  if (search && search.trim()) {
    where.title = { contains: search.trim() };
  }

  return await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      subjectCode: true,
      paperId: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { messages: true }
      }
    }
  });
}

export async function getConversationWithMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return conversation;
}

export async function createConversation(
  userId: string | null,
  title: string,
  subjectCode?: string | null,
  paperId?: string | null
) {
  return await prisma.conversation.create({
    data: {
      userId,
      title: title.slice(0, 100),
      subjectCode: subjectCode || null,
      paperId: paperId || null
    }
  });
}

export async function addMessageToConversation(
  conversationId: string,
  role: 'USER' | 'ASSISTANT' | 'SYSTEM',
  content: string,
  metadata?: Record<string, unknown>,
  imageUrl?: string | null
) {
  return await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        imageUrl: imageUrl || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })
  ]);
}

export async function renameUserConversation(conversationId: string, userId: string, newTitle: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId }
  });

  if (!conv) {
    throw new Error('Conversation not found or access denied');
  }

  return await prisma.conversation.update({
    where: { id: conversationId },
    data: { title: newTitle.trim().slice(0, 100) }
  });
}

export async function deleteUserConversation(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId }
  });

  if (!conv) {
    throw new Error('Conversation not found or access denied');
  }

  return await prisma.conversation.delete({
    where: { id: conversationId }
  });
}
