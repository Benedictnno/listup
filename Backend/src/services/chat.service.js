const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ChatService {
    /**
     * Finds an existing conversation or creates a new one between buyer and seller.
     * Supports hybrid approach: listing-specific or general vendor.
     */
    async createOrGetConversation(buyerId, sellerId, listingId = null) {
        // Try to find existing conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                buyerId_sellerId_listingId: {
                    buyerId,
                    sellerId,
                    listingId
                }
            }
        });

        // Create if not exists
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    buyerId,
                    sellerId,
                    listingId,
                    isActive: true
                }
            });
        } else if (!conversation.isActive) {
            // Re-activate if it was deleted/inactive
            conversation = await prisma.conversation.update({
                where: { id: conversation.id },
                data: { isActive: true, isArchived: false }
            });
        }

        return conversation;
    }

    /**
     * Gets all active conversations for a user (either as buyer or seller).
     */
    async getUserConversations(userId) {
        return await prisma.conversation.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId }
                ],
                isActive: true,
                isArchived: false
            },
            include: {
                buyer: {
                    select: { id: true, name: true, profileImage: true }
                },
                seller: {
                    select: { id: true, name: true, profileImage: true, vendorProfile: { select: { storeName: true, logo: true } } }
                },
                listing: {
                    select: { id: true, title: true, price: true, images: true }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderId: { not: userId },
                                isRead: false
                            }
                        }
                    }
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });
    }

    /**
     * Gets conversation details by ID.
     */
    async getConversationDetails(conversationId, userId) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                buyer: {
                    select: { id: true, name: true, profileImage: true }
                },
                seller: {
                    select: { id: true, name: true, profileImage: true, vendorProfile: { select: { storeName: true, logo: true } } }
                },
                listing: {
                    select: { id: true, title: true, price: true, images: true }
                }
            }
        });

        if (!conversation) return null;

        // Verify user is part of the conversation
        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            throw new Error('Unauthorized access to conversation');
        }

        return conversation;
    }

    /**
     * Gets paginated messages for a conversation.
     */
    async getMessages(conversationId, userId, limit = 50, cursor = null) {
        // Verify access first
        await this.getConversationDetails(conversationId, userId);

        const query = {
            where: { conversationId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            }
        };

        if (cursor) {
            query.cursor = { id: cursor };
            query.skip = 1; // Skip the cursor itself
        }

        const messages = await prisma.message.findMany(query);
        return messages.reverse(); // Return in chronological order
    }

    /**
     * Saves a new message.
     */
    async saveMessage({ conversationId, senderId, senderType, content, messageType = 'TEXT', imageUrl = null }) {
        return await prisma.$transaction(async (tx) => {
            // 1. Create message
            const message = await tx.message.create({
                data: {
                    conversationId,
                    senderId,
                    senderType,
                    messageType,
                    content,
                    imageUrl
                }
            });

            // 2. Update conversation
            await tx.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessageAt: new Date(),
                    lastMessagePreview: messageType === 'TEXT' ? content : '[Image]'
                }
            });

            return message;
        });
    }

    /**
     * Marks messages as read.
     */
    async markAsRead(messageIds, userId) {
        return await prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                senderId: { not: userId }, // Can't mark your own messages as read by you
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * Marks all messages in a conversation as read.
     */
    async markAllAsRead(conversationId, userId) {
        return await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * Archives a conversation.
     */
    async archiveConversation(conversationId, userId) {
        // Verify access
        const conversation = await this.getConversationDetails(conversationId, userId);

        return await prisma.conversation.update({
            where: { id: conversationId },
            data: { isArchived: true }
        });
    }

    /**
     * Reports a conversation.
     */
    async reportConversation({ conversationId, reporterId, reason, details }) {
        return await prisma.conversationReport.create({
            data: {
                conversationId,
                reporterId,
                reason,
                details,
                status: 'PENDING'
            }
        });
    }

    /**
     * Gets chat statistics for a user.
     */
    async getChatStats(userId) {
        const unreadCount = await prisma.conversation.count({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId }
                ],
                messages: {
                    some: {
                        senderId: { not: userId },
                        isRead: false
                    }
                }
            }
        });

        const activeConversations = await prisma.conversation.count({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId }
                ],
                isActive: true,
                isArchived: false
            }
        });

        return { unreadCount, activeConversations };
    }
}

module.exports = new ChatService();
