const ChatService = require('../services/chat.service');
const { notifySeller } = require('../services/whatsapp-notification.service');

class ChatController {
    /**
     * POST /api/chat/conversations
     */
    async createOrGetConversation(req, res) {
        try {
            const buyerId = req.user.id;
            const { sellerId, listingId } = req.body;

            if (!sellerId) {
                return res.status(400).json({ success: false, message: 'Seller ID is required' });
            }

            if (buyerId === sellerId) {
                return res.status(400).json({ success: false, message: 'You cannot start a conversation with yourself' });
            }

            const conversation = await ChatService.createOrGetConversation(buyerId, sellerId, listingId);
            return res.json({ success: true, conversationId: conversation.id, conversation });
        } catch (error) {
            console.error('Create Conversation Error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Internal error' });
        }
    }

    /**
     * GET /api/chat/conversations
     */
    async getUserConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await ChatService.getUserConversations(userId);
            return res.json({ success: true, conversations });
        } catch (error) {
            console.error('Get User Conversations Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/chat/conversations/:id
     */
    async getConversationDetails(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const conversation = await ChatService.getConversationDetails(id, userId);

            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found' });
            }

            return res.json({ success: true, conversation });
        } catch (error) {
            console.error('Get Conversation Details Error:', error);
            return res.status(error.message === 'Unauthorized access to conversation' ? 403 : 500)
                .json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/chat/conversations/:id/messages
     */
    async getMessages(req, res) {
        try {
            const { id } = req.params;
            const { limit, cursor } = req.query;
            const userId = req.user.id;

            const messages = await ChatService.getMessages(
                id,
                userId,
                limit ? parseInt(limit) : 50,
                cursor
            );

            return res.json({ success: true, messages });
        } catch (error) {
            console.error('Get Messages Error:', error);
            return res.status(error.message === 'Unauthorized access to conversation' ? 403 : 500)
                .json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/chat/messages
     */
    async sendTextMessage(req, res) {
        try {
            const { conversationId, content } = req.body;
            const userId = req.user.id;

            if (!conversationId || !content) {
                return res.status(400).json({ success: false, message: 'Conversation ID and content are required' });
            }

            // Determine senderType
            const conversation = await ChatService.getConversationDetails(conversationId, userId);
            const senderType = conversation.buyerId === userId ? 'BUYER' : 'SELLER';

            const message = await ChatService.saveMessage({
                conversationId,
                senderId: userId,
                senderType,
                content,
                messageType: 'TEXT'
            });

            // Emit socket event
            const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
            const { emitNewMessage } = require('../utils/socketEmitter');
            emitNewMessage(conversationId, message, recipientId);

            // Notify seller via WhatsApp if buyer sent the message
            if (senderType === 'BUYER') {
                const productName = conversation.listing?.title || 'General Inquiry';
                const buyerName = req.user.name;
                notifySeller(conversation.sellerId, buyerName, productName, content);
            }

            return res.json({ success: true, message });
        } catch (error) {
            console.error('Send Message Error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/chat/messages/image
     */
    async sendImageMessage(req, res) {
        try {
            const { conversationId } = req.body;
            const userId = req.user.id;

            if (!conversationId || !req.file) {
                return res.status(400).json({ success: false, message: 'Conversation ID and image are required' });
            }

            // req.file.path is the secure_url from Cloudinary
            const imageUrl = req.file.path;

            const conversation = await ChatService.getConversationDetails(conversationId, userId);
            const senderType = conversation.buyerId === userId ? 'BUYER' : 'SELLER';

            const message = await ChatService.saveMessage({
                conversationId,
                senderId: userId,
                senderType,
                messageType: 'IMAGE',
                imageUrl
            });

            // Emit socket event
            const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
            const { emitNewMessage } = require('../utils/socketEmitter');
            emitNewMessage(conversationId, message, recipientId);

            // Notify seller via WhatsApp if buyer sent the image
            if (senderType === 'BUYER') {
                const productName = conversation.listing?.title || 'General Inquiry';
                const buyerName = req.user.name;
                notifySeller(conversation.sellerId, buyerName, productName, '[Image]');
            }

            return res.json({ success: true, message });
        } catch (error) {
            console.error('Send Image Error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PUT /api/messages/:id/read
     */
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get conversation ID first to emit event
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const message = await prisma.message.findUnique({ where: { id }, select: { conversationId: true } });

            await ChatService.markAsRead([id], userId);

            const { emitMessageRead, emitUnreadRefresh } = require('../utils/socketEmitter');
            if (message) {
                emitMessageRead(message.conversationId, [id], userId);
            }
            emitUnreadRefresh(userId);

            return res.json({ success: true });
        } catch (error) {
            console.error('Mark As Read Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PUT /api/conversations/:id/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await ChatService.markAllAsRead(id, userId);

            const { emitUnreadRefresh } = require('../utils/socketEmitter');
            emitUnreadRefresh(userId);

            return res.json({ success: true });
        } catch (error) {
            console.error('Mark All As Read Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * DELETE /api/chat/conversations/:id
     */
    async archiveConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await ChatService.archiveConversation(id, userId);
            return res.json({ success: true, message: 'Conversation archived' });
        } catch (error) {
            console.error('Archive Conversation Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * POST /api/chat/report
     */
    async reportConversation(req, res) {
        try {
            const { conversationId, reason, details } = req.body;
            const reporterId = req.user.id;

            if (!conversationId || !reason) {
                return res.status(400).json({ success: false, message: 'Conversation ID and reason are required' });
            }

            const report = await ChatService.reportConversation({
                conversationId,
                reporterId,
                reason,
                details
            });

            return res.json({ success: true, reportId: report.id });
        } catch (error) {
            console.error('Report Conversation Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/chat/stats
     */
    async getChatStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await ChatService.getChatStats(userId);
            return res.json({ success: true, stats });
        } catch (error) {
            console.error('Get Chat Stats Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
}

module.exports = new ChatController();
