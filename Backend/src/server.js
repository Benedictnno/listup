require('dotenv').config();
require("./jobs/ad-expiry.job");
require('./jobs/kyc-expiry-reminder.job');
require('./jobs/chat-cleanup.job');
require('./jobs/chat-notification.job');
// require('./jobs/whatsapp-reminders.job');
const { initWhatsApp } = require('./services/whatsapp.service');

// Initialize cron jobs
const { scheduleAdvertisementExpiry } = require('./jobs/advertisement-expiry.job');
scheduleAdvertisementExpiry();

const app = require('./app');
const http = require('http');
const { initSocket } = require('./lib/socket');

const server = http.createServer(app);

// Get CORS options from app
const corsOptions = {
  origin: [
    'https://listup.ng',
    'https://www.listup.ng',
    'https://api.listup.ng',
    'https://listup-admin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://listup-three.vercel.app',
    /^https:\/\/.*\.vercel\.app$/,
  ],
  credentials: true
};

// Initialize Socket.io
initSocket(server, corsOptions);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server (API + WebSockets) running on http://localhost:${PORT}`);
  // Initialize WhatsApp Bot
  initWhatsApp();
});
