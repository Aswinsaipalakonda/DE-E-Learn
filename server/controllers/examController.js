const crypto = require('crypto');
const pool = require('../config/db');

async function getExams(req, res) {
  try {
    const { branch, semester } = req.query;
    let query = 'SELECT * FROM exam_schedules WHERE 1=1';
    const params = [];

    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    if (semester) {
      query += ' AND semester = ?';
      params.push(parseInt(semester, 10));
    }

    query += ' ORDER BY start_time ASC';
    const [exams] = await pool.query(query, params);
    return res.json({ success: true, exams });
  } catch (err) {
    console.error('getExams error:', err);
    return res.status(500).json({ error: 'Failed to fetch exam schedules.' });
  }
}

async function createExam(req, res) {
  try {
    const { title, branch, semester, start_time, end_time, lockout_enabled } = req.body;
    if (!title || !branch || !semester || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required exam fields.' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO exam_schedules (id, title, branch, semester, start_time, end_time, lockout_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        branch,
        parseInt(semester, 10),
        new Date(start_time),
        new Date(end_time),
        lockout_enabled !== false ? 1 : 0,
      ]
    );

    return res.json({ success: true, message: 'Exam schedule created.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteExam(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM exam_schedules WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Exam schedule deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getExams,
  createExam,
  deleteExam,
};
