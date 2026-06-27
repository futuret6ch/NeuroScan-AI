const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'neuroscan-super-secret-key-999';

// Middleware to authenticate JWT access tokens
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required. Access Denied.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired credentials session.' });
  }
};

// Middleware to restrict routes to authorized roles only
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permissions for this action.' });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
