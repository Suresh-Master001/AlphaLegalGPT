import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Chat {
  /**
   * Find all chats for a specific user
   */
  static async findByUser(userId) {
    return prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  /**
   * Find a specific chat session for a user
   */
  static async findSession(userId, sessionId) {
    return prisma.chat.findFirst({
      where: {
        AND: [
          { userId },
          { id: sessionId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  /**
   * Create a chat session
   */
  static async create(userId, chatData) {
    return prisma.chat.create({
      data: {
        userId,
        title: chatData.title || null,
        messages: {
          create: (chatData.messages || []).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      },
      include: {
        messages: true
      }
    });
  }

  /**
   * Create or update a chat session with messages
   */
  static async save(userId, chatData) {
    if (chatData.id) {
      // Update existing chat
      const existing = await prisma.chat.findFirst({
        where: {
          AND: [
            { userId },
            { id: chatData.id }
          ]
        },
        include: { messages: true }
      });

      if (existing) {
        await prisma.message.deleteMany({
          where: { chatId: existing.id }
        });

        return prisma.chat.update({
          where: { id: existing.id },
          data: {
            title: chatData.title || existing.title,
            updatedAt: new Date(),
            messages: {
              create: (chatData.messages || []).map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
      }
    }

    // Create new chat
    return prisma.chat.create({
      data: {
        userId,
        title: chatData.title || null,
        messages: {
          create: (chatData.messages || []).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  /**
   * Update chat title
   */
  static async updateTitle(userId, sessionId, title) {
    return prisma.chat.updateMany({
      where: {
        AND: [
          { userId },
          { id: sessionId }
        ]
      },
      data: { title }
    });
  }

  /**
   * Delete a specific chat session
   */
  static async delete(userId, sessionId) {
    const result = await prisma.chat.deleteMany({
      where: {
        AND: [
          { userId },
          { id: sessionId }
        ]
      }
    });
    return result.count > 0;
  }

  /**
   * Clear all chats for a user
   */
  static async clear(userId) {
    const result = await prisma.chat.deleteMany({
      where: { userId }
    });
    return result.count > 0;
  }
}

export default prisma;