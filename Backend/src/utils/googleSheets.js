const { google } = require("googleapis");

// Load service account credentials from environment.
// Preferred: set GOOGLE_SERVICE_ACCOUNT_BASE64 to base64(service-account.json)
// Fallback: set individual env vars (see .env.example)
function loadServiceAccount() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString();
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_BASE64:', e.message);
      throw e;
    }
  }

  // fallback to discrete env vars
  if (process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      type: process.env.GOOGLE_TYPE || 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    };
  }

  throw new Error('Google service account credentials not provided. Set GOOGLE_SERVICE_ACCOUNT_BASE64 or the individual GOOGLE_* env vars.');
}

const serviceAccount = loadServiceAccount();

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function addToGoogleSheet(vendorName, storeName, email, phone, notes) {
  const spreadsheetId = "1bpxf7Q4snJ37bdUZQ8t3Ll8QiWWghh4AHG9TNM7bieg";
  const range = 'Sheet1!A1'; // safer and simpler

  const values = [[vendorName, storeName, email, phone, notes]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log("✅ Successfully added to Google Sheet");
}

module.exports = { addToGoogleSheet };