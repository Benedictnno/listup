const { getIO } = require('../lib/socket');

/**
 * Emits a new message event to the conversation room and recipient.
 */
const emitNewMessage = (conversationId, message, recipientId) => {
    try {
        const io = getIO();

        // Emit to the conversation room (for users currently in the chat window)
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        // Emit to the recipient's personal room (for background notifications/unread count)
        io.to(`user:${recipientId}`).emit('notification:message', {
            conversationId,
            message
        });
    } catch (err) {
        console.error('Socket Emitter Error (New Message):', err.message);
    }
};

/**
 * Emits a message read event.
 */
const emitMessageRead = (conversationId, messageIds, userId) => {
    try {
        const io = getIO();
        io.to(`conversation:${conversationId}`).emit('messages:read', {
            messageIds,
            readBy: userId,
            readAt: new Date()
        });
    } catch (err) {
        console.error('Socket Emitter Error (Message Read):', err.message);
    }
};

/**
 * Signals to a user that their unread count should be refreshed.
 */
const emitUnreadRefresh = (userId) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('unread:refresh');
    } catch (err) {
        console.error('Socket Emitter Error (Unread Refresh):', err.message);
    }
};

module.exports = {
    emitNewMessage,
    emitMessageRead,
    emitUnreadRefresh
};
