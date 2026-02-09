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
app.listen(PORT, async () => {
  console.log(`✅ API running on http://localhost:${PORT}`);

  // Initialize WhatsApp Bot
  try {
    await whatsappService.initialize();
  } catch (err) {
    console.error('Failed to start WhatsApp bot:', err);
  }
});
