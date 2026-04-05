const jwt = require('jsonwebtoken');

// Security Check: Ensure JWT_SECRET is configured and sufficiently strong
if (!process.env.JWT_SECRET) {
  console.error('FATAL ❌: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('SECURITY ⚠️: JWT_SECRET should be at least 32 characters long for strong security.');
}

const sign = (payload, options = {}) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', ...options }
  );
};

const verify = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { sign, verify };
