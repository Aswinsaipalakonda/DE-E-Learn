const crypto = require('crypto');
const pool = require('../config/db');

async function createInquiry(req, res) {
  try {
    const { name, email, role, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO support_inquiries (id, name, email, role, subject, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, name.trim(), email.trim().toLowerCase(), role || 'Student', subject || 'General Inquiry', message.trim()]
    );

    return res.json({ success: true, message: 'Your message has been submitted. We will contact you soon.' });
  } catch (err) {
    console.error('createInquiry error:', err);
    return res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
}

async function getInquiries(req, res) {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM support_inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 200';
    const [inquiries] = await pool.query(query, params);
    return res.json({ success: true, inquiries });
  } catch (err) {
    console.error('getInquiries error:', err);
    return res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
}

async function updateInquiry(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const user = req.user;

    await pool.query(
      `UPDATE support_inquiries SET 
         status = COALESCE(?, status),
         admin_notes = COALESCE(?, admin_notes),
         resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END,
         resolved_by = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_by END
       WHERE id = ?`,
      [status, adminNotes, status, status, user.id, id]
    );

    return res.json({ success: true, message: 'Inquiry updated successfully.' });
  } catch (err) {
    console.error('updateInquiry error:', err);
    return res.status(500).json({ error: 'Failed to update inquiry.' });
  }
}

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiry,
};
