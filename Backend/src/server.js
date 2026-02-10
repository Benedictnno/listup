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


app.get('/whatsapp/qr', (req, res) => {
    const qr = whatsappService.getQR();
    if (!qr) {
        return res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>Validating WhatsApp Session...</h1>
                    <p>Status: No QR Code available yet.</p>
                    <p>Possible reasons:</p>
                    <ul>
                        <li>Bot is starting up (wait 1-2 mins)</li>
                        <li>Bot is already logged in</li>
                        <li>QR generation failed</li>
                    </ul>
                    <script>setTimeout(() => window.location.reload(), 5000);</script>
                </body>
            </html>
        `);
    }
    
    // Serve QR code using public API
    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>Scan to Pair WhatsApp</h1>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}" alt="WhatsApp QR Code" />
                <p>Status: Waiting for scan...</p>
                <div style="margin-top: 20px; font-size: 12px; color: #666; word-break: break-all;">
                    Raw Code: ${qr.substring(0, 50)}...
                </div>
            </body>
        </html>
    `);
});

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
