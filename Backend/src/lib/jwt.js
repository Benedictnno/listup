const jwt = require('jsonwebtoken');

const sign = (payload, options = {}) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', ...options }
  );
};

const verify = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { sign, verify };
