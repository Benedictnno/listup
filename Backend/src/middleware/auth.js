const { verify } = require('../lib/jwt');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = verify(token);
    req.user = payload; // { id, email, name, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// role-based access control
const allow = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ message: 'Forbidden: Insufficient role' });
};

module.exports = { auth, allow };

