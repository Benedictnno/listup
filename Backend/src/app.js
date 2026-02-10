// Load .env in development (optional) so GOOGLE_SERVICE_ACCOUNT_BASE64 etc. are available
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Ensure GOOGLE_APPLICATION_CREDENTIALS points to a credentials file when using env-based creds
try {
  require('./lib/credentials').ensureCredentialsFile();
} catch (e) {
  console.error('Error ensuring credentials file:', e.message);
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const error = require('./middleware/error');
const { cloudflareSecurity } = require('./middleware/security');
const cookieParser = require('cookie-parser');
require('./config/passport'); // init strategies
const whatsappService = require('./services/whatsappService');

const app = express();
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// CORS configuration
const corsOptions = {
  origin: [
    // ListUp domain variations
    'https://listup.ng',
    'https://www.listup.ng',
    'https://api.listup.ng',
    'https://www.listup.ng',
    'https://listup-admin.vercel.app',
    'http://localhost:3000', // Local development
    'http://localhost:3001', // Local development
    'https://listup-three.vercel.app', // Old Vercel project
    // Add your new Vercel project domain here
    // You can also use a wildcard for all Vercel subdomains (less secure but more flexible)
    /^https:\/\/.*\.vercel\.app$/, // All Vercel subdomains
  ],


  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Trust proxy configuration for Render and common reverse proxies

// Add CORS debugging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  next();
});

if (process.env.NODE_ENV === 'production') {
  // Cloudflare requires this to forward real IP addresses
  //app.set("trust proxy", true);
  app.set('trust proxy', 1); // trust first proxy only
  // Activate global backend protection
  app.use(cloudflareSecurity);
}
// Handle CORS preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

// QR Code Endpoint
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

app.use('/api', routes);

app.use(error.notFound);
app.use(error.handler);

module.exports = app;
