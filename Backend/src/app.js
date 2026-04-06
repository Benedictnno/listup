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

// 1. Trust proxy configuration (MUST BE ABSOLUTE TOP for accurate IP/Header resolution)
app.set('trust proxy', true);

// 2. Early Preflight Handshake (Bypasses all subsequent logic)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.get('origin');
    console.log(`[PREFLIGHT-HANDSHAKE] Path: ${req.originalUrl}, Origin: ${origin}, IP: ${req.ip}`);
    
    // If you need manual header control for debugging, do it here
    // res.header('Access-Control-Allow-Origin', origin || '*');
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    // res.sendStatus(204);
    // return;
  }
  next();
});

// 3. Optimized CORS configuration
const whitelist = [
  'https://listup.ng',
  'https://www.listup.ng',
  'https://api.listup.ng',
  'https://listup-admin.vercel.app',
  'https://listup-three.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (whitelist.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 3. Global Middleware (CORS MUST BE FIRST)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  // Activate global backend protection
  app.use(cloudflareSecurity);
}

app.use(express.json({
  limit: '2mb',
  verify: (req, res, buf) => {
    if (req.originalUrl === '/api/payments/webhook') {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Moved to server.js

app.use('/api', routes);

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

app.use(error.notFound);
app.use(error.handler);

module.exports = app;
