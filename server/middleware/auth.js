const { verifyToken } = require('../config/jwt');
const pool = require('../config/db');

async function authenticate(req, res, next) {
  let token = null;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check HTTP-only cookie if header not present
  if (!token && req.cookies && req.cookies.de_token) {
    token = req.cookies.de_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, status, branch, current_semester, academic_year, section, designation, phone, roll_number, first_login_pending FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    const user = rows[0];
    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware DB error:', err);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
}

// Role-Based Authorization Guard
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.` });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
