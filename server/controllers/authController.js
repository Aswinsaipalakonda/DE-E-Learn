const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { generateToken } = require('../config/jwt');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Query user
    let [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    // Seamless onboarding for institutional MVGR students (e.g., 23331a4745@mvgrce.edu.in)
    if (!users.length && cleanEmail.endsWith('@mvgrce.edu.in')) {
      const emailPrefix = cleanEmail.split('@')[0];
      const studentRollRegex = /^([0-9]{2})33([15])A([0-9a-zA-Z]{2})([0-9a-zA-Z]{2})$/i;
      const match = emailPrefix.match(studentRollRegex);
      if (match) {
        const rollUpper = emailPrefix.toUpperCase();
        if (cleanPassword.toUpperCase() === rollUpper) {
          const yearPrefix = parseInt(match[1], 10);
          const branchMap = { '47': 'CIC', '44': 'CSD', '42': 'CSM' };
          const branchCode = branchMap[match[3].toUpperCase()] || 'CIC';
          const academicYear = 2000 + yearPrefix;
          const newUserId = crypto.randomUUID();
          const defaultHash = await bcrypt.hash(rollUpper, 10);

          await pool.query(
            `INSERT INTO users (id, email, password_hash, name, role, status, branch, academic_year, current_semester, section, roll_number, first_login_pending) 
             VALUES (?, ?, ?, ?, 'student', 'active', ?, ?, 3, 'A', ?, 1)`,
            [newUserId, cleanEmail, defaultHash, `Student ${rollUpper}`, branchCode, academicYear, rollUpper]
          );

          const [created] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [newUserId]);
          users = created;
        }
      }
    }

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact your administrator.' });
    }

    // 1. Direct and case-normalized comparison
    let isValid = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isValid && cleanPassword !== cleanPassword.toUpperCase()) {
      isValid = await bcrypt.compare(cleanPassword.toUpperCase(), user.password_hash);
    }
    if (!isValid && cleanPassword !== cleanPassword.toLowerCase()) {
      isValid = await bcrypt.compare(cleanPassword.toLowerCase(), user.password_hash);
    }

    // 2. Fallback check for default roll numbers or faculty keys
    if (!isValid) {
      const regNo = cleanEmail.split('@')[0].toUpperCase();
      const phoneSuffix = user.phone ? user.phone.slice(-4) : null;
      const validDefaults = [
        user.role === 'student' ? regNo : null,
        user.role === 'student' && user.roll_number ? user.roll_number.toUpperCase() : null,
        user.role === 'faculty' && phoneSuffix ? `MVGRDE@${phoneSuffix}` : null,
      ].filter(Boolean);

      const upperInput = cleanPassword.toUpperCase();
      if (validDefaults.some(d => d.toUpperCase() === upperInput)) {
        isValid = true;
        const newHash = await bcrypt.hash(upperInput, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branch: user.branch,
      current_semester: user.current_semester,
      section: user.section,
      designation: user.designation,
      roll_number: user.roll_number,
    };

    const token = generateToken(tokenPayload);

    // Set HTTP-Only Cookie
    res.cookie('de_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Record audit event
    await pool.query(
      'INSERT INTO audit_logs (id, action, actor_id, object_id, after_summary) VALUES (?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        'USER_LOGIN',
        user.id,
        user.id,
        JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })
      ]
    ).catch((e) => console.warn('Audit log write non-fatal notice:', e.message));

    const sanitizedUser = { ...user };
    delete sanitizedUser.password_hash;

    return res.json({
      success: true,
      token,
      user: sanitizedUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    // Get current hash
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (currentPassword) {
      const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!match) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, first_login_pending = 0, updated_at = NOW() WHERE id = ?',
      [newHash, userId]
    );

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
}

async function logout(req, res) {
  res.clearCookie('de_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
}

module.exports = {
  login,
  me,
  changePassword,
  logout,
};
