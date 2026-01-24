const { verify } = require('../lib/jwt');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : null;
console.log(token);

  // Fallback to cookie-based token if no Authorization header
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    console.log('Auth Failed: No token found');
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = verify(token);
    req.user = payload; // { id, email, name, role }
    // console.log('Auth Success:', payload.email, payload.role);
    next();
  } catch (err) {
    console.log('Auth Failed: Invalid token', err.message);
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

