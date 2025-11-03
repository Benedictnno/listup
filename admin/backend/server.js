require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const listingRoutes = require('./routes/listings');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const addressesRoutes = require('./routes/addresses');
const categoriesRoutes = require('./routes/categories');
const advertisementsRoutes = require('./routes/advertisements');
const uploadsRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.ADMIN_PORT || 4001; // Changed port to avoid conflict

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001', // Admin frontend
    'http://localhost:3002', // Main frontend
    'http://localhost:3000', // Main frontend
    'https://listup-admin.vercel.app', // Admin production
    'http://listup.ng',
    'https://listup.ng',
    'http://www.listup.ng',
    'https://www.listup.ng',  
    'listup-admin.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ListUp Admin Backend'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/advertisements', advertisementsRoutes);
app.use('/api/uploads', uploadsRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Admin backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
