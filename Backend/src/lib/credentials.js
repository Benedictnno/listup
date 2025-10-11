const fs = require('fs');
const os = require('os');
const path = require('path');

function createTempCredentialsFile(serviceAccount) {
  const id = (serviceAccount && serviceAccount.project_id) || 'gsa';
  const fileName = `gsa-${id}.json`;
  const p = path.join(os.tmpdir(), fileName);

  try {
    // write file with restrictive permissions
    fs.writeFileSync(p, JSON.stringify(serviceAccount), { mode: 0o600 });
    return p;
  } catch (err) {
    console.error('Failed to write temp credentials file:', err.message);
    throw err;
  }
}

function loadServiceAccountFromEnv() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_BASE64 value:', e.message);
      return null;
    }
  }

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

  return null;
}

function ensureCredentialsFile() {
  // If already set by environment, don't override
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return;

  const sa = loadServiceAccountFromEnv();
  if (!sa) return;

  try {
    const p = createTempCredentialsFile(sa);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = p;
    // attempt to unlink on exit (best-effort)
    process.on('exit', () => {
      try { fs.unlinkSync(p); } catch (_) { }
    });
    process.on('SIGINT', () => { try { fs.unlinkSync(p); } catch (_) { } process.exit(0); });
    process.on('SIGTERM', () => { try { fs.unlinkSync(p); } catch (_) { } process.exit(0); });
  } catch (e) {
    console.error('Could not create GOOGLE_APPLICATION_CREDENTIALS file:', e.message);
  }
}

module.exports = { ensureCredentialsFile };
