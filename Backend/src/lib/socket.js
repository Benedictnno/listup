const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server, corsOptions) => {
    io = socketIO(server, {
        cors: corsOptions
    });

    // Authentication middleware for Socket.io
    io.use((socket, next) => {
        let token = socket.handshake.auth.token || socket.handshake.query.token;

        // Fallback to cookies if no token in auth object
        if (!token && socket.handshake.headers.cookie) {
            const cookies = require('cookie').parse(socket.handshake.headers.cookie);
            token = cookies.accessToken;
        }

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    const prisma = require('../lib/prisma');

    io.on('connection', (socket) => {
        console.log(`🔌 User connected to socket: ${socket.userId}`);

        // Join a personal room for direct notifications
        socket.join(`user:${socket.userId}`);

        // Handle joining specific conversation rooms — verify membership first.
        socket.on('join:conversation', async (conversationId) => {
            try {
                const convo = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { buyerId: true, sellerId: true },
                });

                if (!convo || (convo.buyerId !== socket.userId && convo.sellerId !== socket.userId)) {
                    socket.emit('error', { message: 'Unauthorized: Not a member of this conversation' });
                    console.warn(`🚫 Socket ${socket.userId} denied join to conversation: ${conversationId}`);
                    return;
                }

                socket.join(`conversation:${conversationId}`);
                console.log(`💬 User ${socket.userId} joined conversation: ${conversationId}`);
            } catch (err) {
                console.error('Socket join:conversation error:', err);
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`💬 User ${socket.userId} left conversation: ${conversationId}`);
        });

        // Typing indicators — only relay if the socket is genuinely in that room.
        socket.on('typing:start', ({ conversationId }) => {
            if (!socket.rooms.has(`conversation:${conversationId}`)) return;
            socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: socket.userId });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            if (!socket.rooms.has(`conversation:${conversationId}`)) return;
            socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: socket.userId });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };
