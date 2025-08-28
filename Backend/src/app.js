const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const error = require('./middleware/error');

require('./config/passport'); // init strategies

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        // ListUp domain variations
        'http://listup.ng',
        'https://listup.ng',
        'http://www.listup.ng',
        'https://www.listup.ng',
        
        'http://localhost:3000', // Local development
        'https://listup-three.vercel.app', // Old Vercel project
        // Add your new Vercel project domain here
        'https://listup-frontend.vercel.app', // Common pattern
        'https://listup-marketplace.vercel.app', // Common pattern
        'https://listup-app.vercel.app', // Common pattern
        // You can also use a wildcard for all Vercel subdomains (less secure but more flexible)
        /^https:\/\/.*\.vercel\.app$/, // All Vercel subdomains
    ],
    
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Add CORS debugging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🌐 Request origin:', origin);
  console.log('🌐 Request method:', req.method);
  console.log('🌐 Request headers:', req.headers);
  next();
});

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api', routes);

app.use(error.notFound);
app.use(error.handler);

module.exports = app;
