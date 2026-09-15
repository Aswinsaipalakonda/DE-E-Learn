const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');

async function getUsers(req, res) {
  try {
    const { role, branch, semester, status, search } = req.query;

    let query = 'SELECT id, email, name, role, status, branch, academic_year, current_semester, section, designation, phone, roll_number, first_login_pending, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    if (branch && branch !== 'all') {
      query += ' AND branch = ?';
      params.push(branch);
    }
    if (semester && semester !== 'all') {
      query += ' AND current_semester = ?';
      params.push(parseInt(semester, 10));
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR roll_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT 300';

    const [users] = await pool.query(query, params);
    return res.json({ success: true, users });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user roster.' });
  }
}

async function createUser(req, res) {
  try {
    const { email, password, name, role, branch, current_semester, section, designation, phone, roll_number } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const defaultPassword = password || (role === 'student' ? (roll_number || cleanEmail.split('@')[0].toUpperCase()) : 'Password@789');
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, status, branch, current_semester, section, designation, phone, roll_number, first_login_pending)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, 1)`,
      [
        userId,
        cleanEmail,
        passwordHash,
        name.trim(),
        role || 'student',
        branch || null,
        current_semester ? parseInt(current_semester, 10) : null,
        section || null,
        designation || null,
        phone || null,
        roll_number || null,
      ]
    );

    return res.json({
      success: true,
      message: 'User created successfully.',
      user: { id: userId, email: cleanEmail, name, role: role || 'student' },
    });
  } catch (err) {
    console.error('createUser error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create user.' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, role, status, branch, current_semester, section, designation, phone, roll_number } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (branch !== undefined) { updates.push('branch = ?'); params.push(branch || null); }
    if (current_semester !== undefined) { updates.push('current_semester = ?'); params.push(current_semester ? parseInt(current_semester, 10) : null); }
    if (section !== undefined) { updates.push('section = ?'); params.push(section || null); }
    if (designation !== undefined) { updates.push('designation = ?'); params.push(designation || null); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone || null); }
    if (roll_number !== undefined) { updates.push('roll_number = ?'); params.push(roll_number || null); }

    if (!updates.length) {
      return res.json({ success: true, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const passwordToSet = newPassword || 'Password@789';
    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    await pool.query('UPDATE users SET password_hash = ?, first_login_pending = 1, updated_at = NOW() WHERE id = ?', [passwordHash, id]);

    return res.json({ success: true, message: `Password reset successfully to: ${passwordToSet}` });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own administrator account.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User removed successfully.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
}

async function bulkImportUsers(req, res) {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || !users.length) {
      return res.status(400).json({ error: 'Users array is required.' });
    }

    let imported = 0;
    let errors = 0;

    for (const u of users) {
      const rollNumber = u.roll_number ? u.roll_number.toString().trim().toUpperCase() : null;
      let cleanEmail = u.email ? u.email.trim().toLowerCase() : (rollNumber ? `${rollNumber.toLowerCase()}@mvgrce.edu.in` : null);
      if (!cleanEmail || !u.name) {
        errors++;
        continue;
      }

      try {
        const isStudent = (u.role || 'student') === 'student';
        const defaultPassword = u.password || (isStudent ? (rollNumber || cleanEmail.split('@')[0].toUpperCase()) : 'Password@789');
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        const userId = crypto.randomUUID();

        let branch = u.branch ? u.branch.trim().toUpperCase() : null;
        if (branch === 'ICB') branch = 'CIC';

        const academicYear = u.academic_year 
          ? parseInt(u.academic_year, 10) 
          : (rollNumber && rollNumber.length >= 2 ? parseInt('20' + rollNumber.slice(0, 2), 10) : null);

        const currentSemester = u.current_semester ? parseInt(u.current_semester, 10) : null;

        await pool.query(
          `INSERT INTO users (
            id, email, password_hash, name, role, status,
            branch, academic_year, current_semester, section,
            designation, phone, roll_number, first_login_pending
          ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            branch = VALUES(branch),
            academic_year = VALUES(academic_year),
            current_semester = VALUES(current_semester),
            section = VALUES(section),
            roll_number = VALUES(roll_number),
            designation = VALUES(designation),
            phone = VALUES(phone)`,
          [
            userId,
            cleanEmail,
            passwordHash,
            u.name.trim(),
            u.role || 'student',
            branch,
            academicYear,
            currentSemester,
            u.section ? u.section.trim().toUpperCase() : null,
            u.designation ? u.designation.trim() : null,
            u.phone ? u.phone.trim() : null,
            rollNumber,
          ]
        );
        imported++;
      } catch (e) {
        console.error('Row insert error in bulkImportUsers:', e);
        errors++;
      }
    }

    return res.json({ success: true, message: `Batch processed: ${imported} imported/updated, ${errors} skipped.` });
  } catch (err) {
    console.error('bulkImportUsers error:', err);
    return res.status(500).json({ error: 'Failed to process bulk import.' });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  bulkImportUsers,
};
