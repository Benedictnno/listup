const router = require('express').Router();
const { auth } = require('../middleware/auth');
const ChatController = require('../controllers/chat.controller');
const { generalLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');
const cloudinary = require('../lib/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer for chat images (Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req) => ({
        folder: `chat/${req.user.id}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    })
});

const upload = multer({ storage });

// Conversations
router.post('/conversations', generalLimiter, auth, ChatController.createOrGetConversation);
router.get('/conversations', generalLimiter, auth, ChatController.getUserConversations);
router.get('/conversations/:id', generalLimiter, auth, ChatController.getConversationDetails);
router.delete('/conversations/:id', generalLimiter, auth, ChatController.archiveConversation);

// Messages
router.get('/conversations/:id/messages', generalLimiter, auth, ChatController.getMessages);
router.post('/messages', generalLimiter, auth, ChatController.sendTextMessage);
router.post('/messages/image', generalLimiter, auth, upload.single('image'), ChatController.sendImageMessage);
router.put('/messages/:id/read', generalLimiter, auth, ChatController.markAsRead);
router.put('/conversations/:id/read-all', generalLimiter, auth, ChatController.markAllAsRead);

// Moderation
router.post('/report', generalLimiter, auth, ChatController.reportConversation);

// Stats
router.get('/stats', generalLimiter, auth, ChatController.getChatStats);

module.exports = router;
