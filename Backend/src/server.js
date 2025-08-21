require('dotenv').config();
require("./jobs/ad-expiry.job");

const app = require('./app');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
