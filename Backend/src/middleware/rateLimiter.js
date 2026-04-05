// /middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Example: limit to 10 requests per minute per IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after a minute.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // 12 req/min sustained — enough for legitimate SPA usage
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for email resend — 1 per IP per 60 seconds
const resendEmailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: {
    success: false,
    message: 'Please wait 60 seconds before requesting another verification email.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  generalLimiter,
  resendEmailLimiter,
};
