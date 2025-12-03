require('dotenv').config();
require("./jobs/ad-expiry.job");
require('./jobs/kyc-expiry-reminder.job');

// Initialize cron jobs
const { scheduleAdvertisementExpiry } = require('./jobs/advertisement-expiry.job');
scheduleAdvertisementExpiry();

const app = require('./app');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
