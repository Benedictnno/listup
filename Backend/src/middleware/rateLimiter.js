// /middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Example: limit to 10 requests per minute per IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after a minute.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = {
  loginLimiter,
  generalLimiter
};
