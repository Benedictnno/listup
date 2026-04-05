require('dotenv').config();
require("./jobs/ad-expiry.job");
require('./jobs/kyc-expiry-reminder.job');

// Initialize cron jobs
const { scheduleAdvertisementExpiry } = require('./jobs/advertisement-expiry.job');
const { scheduleWhatsAppMaintenance } = require('./jobs/whatsapp-maintenance.job');
scheduleAdvertisementExpiry();
scheduleWhatsAppMaintenance();

const app = require('./app');
const whatsappService = require('./services/whatsappService');

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, async () => {
    console.log(`✅ API running on http://localhost:${PORT}`);

    // Initialize WhatsApp Bot
    try {
        await whatsappService.initialize();
    } catch (err) {
        console.error('Failed to start WhatsApp bot:', err);
    }
});

// Initialize Socket.io
const { initSocket } = require('./lib/socket');
initSocket(server, {
    origin: [
        'https://listup.ng',
        'https://www.listup.ng',
        'https://api.listup.ng',
        'https://listup-admin.vercel.app',
        'https://listup-three.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        // Add new Vercel deployment URLs here explicitly — never use a wildcard
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
            const prisma = require('./lib/prisma');
            await prisma.$disconnect();
            console.log('Database connection closed.');
            process.exit(0);
        } catch (err) {
            console.error('Error during database disconnect:', err);
            process.exit(1);
        }
    });

    // If server takes too long to close, force exit
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
