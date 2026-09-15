const crypto = require('crypto');
const pool = require('../config/db');

async function getAnnouncements(req, res) {
  try {
    const user = req.user;
    let query = 'SELECT * FROM announcements WHERE 1=1';
    const params = [];

    if (user && user.role === 'student') {
      query += ` AND (scope_branch IS NULL OR scope_branch = ?)
                 AND (scope_semester IS NULL OR scope_semester = ?)
                 AND end_time >= NOW()`;
      params.push(user.branch || '', user.current_semester || 0);
    }

    query += ' ORDER BY priority DESC, created_at DESC LIMIT 50';
    const [announcements] = await pool.query(query, params);
    return res.json({ success: true, announcements });
  } catch (err) {
    console.error('getAnnouncements error:', err);
    return res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { title, content, scope_branch, scope_semester, priority, start_time, end_time } = req.body;
    if (!title || !content || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, content, start time, and end time are required.' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO announcements (id, title, content, scope_branch, scope_semester, priority, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        content.trim(),
        scope_branch || null,
        scope_semester ? parseInt(scope_semester, 10) : null,
        priority || 'normal',
        new Date(start_time),
        new Date(end_time),
      ]
    );

    return res.json({ success: true, message: 'Announcement published successfully.' });
  } catch (err) {
    console.error('createAnnouncement error:', err);
    return res.status(500).json({ error: 'Failed to create announcement.' });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Announcement removed.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
