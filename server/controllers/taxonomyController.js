const pool = require('../config/db');

async function getTaxonomy(req, res) {
  try {
    const [branches] = await pool.query('SELECT code, name, active FROM branches ORDER BY code ASC');
    const [semesters] = await pool.query('SELECT number, name, active FROM semesters ORDER BY number ASC');
    const [regulations] = await pool.query('SELECT code, name, active FROM regulations ORDER BY code DESC');
    const [subjects] = await pool.query('SELECT code, title, branch, semester, regulation, active FROM subjects ORDER BY semester ASC, code ASC');

    return res.json({
      success: true,
      branches,
      semesters,
      regulations,
      subjects,
    });
  } catch (err) {
    console.error('getTaxonomy error:', err);
    return res.status(500).json({ error: 'Failed to retrieve academic taxonomy.' });
  }
}

// Branches
async function createBranch(req, res) {
  try {
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name required.' });
    await pool.query('INSERT INTO branches (code, name, active) VALUES (?, ?, 1)', [code.toUpperCase().trim(), name.trim()]);
    return res.json({ success: true, message: 'Branch created.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateBranch(req, res) {
  try {
    const { code } = req.params;
    const { name, active } = req.body;
    await pool.query('UPDATE branches SET name = COALESCE(?, name), active = COALESCE(?, active) WHERE code = ?', [name, active, code]);
    return res.json({ success: true, message: 'Branch updated.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Regulations
async function createRegulation(req, res) {
  try {
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name required.' });
    await pool.query('INSERT INTO regulations (code, name, active) VALUES (?, ?, 1)', [code.toUpperCase().trim(), name.trim()]);
    return res.json({ success: true, message: 'Regulation created.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Subjects
async function createSubject(req, res) {
  try {
    const { code, title, branch, branches, semester, regulation } = req.body;
    if (!code || !title || !semester) {
      return res.status(400).json({ error: 'Code, title, and semester are required.' });
    }

    const reg = regulation || 'R23';
    let targetBranches = [];
    if (branches && Array.isArray(branches)) targetBranches = branches;
    else if (branch) targetBranches = [branch];
    else targetBranches = ['CIC'];

    for (const b of targetBranches) {
      await pool.query(
        `INSERT INTO subjects (code, title, branch, semester, regulation, active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE title = VALUES(title), semester = VALUES(semester), active = 1`,
        [code.trim().toUpperCase(), title.trim(), b, parseInt(semester, 10), reg]
      );
    }

    return res.json({ success: true, message: `Subject created for ${targetBranches.length} branch(es).` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateSubject(req, res) {
  try {
    const { code, branch, regulation } = req.params;
    const { title, semester, active } = req.body;

    await pool.query(
      `UPDATE subjects SET 
         title = COALESCE(?, title),
         semester = COALESCE(?, semester),
         active = COALESCE(?, active)
       WHERE code = ? AND branch = ? AND regulation = ?`,
      [title, semester ? parseInt(semester, 10) : null, active, code, branch, regulation]
    );

    return res.json({ success: true, message: 'Subject updated.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteSubject(req, res) {
  try {
    const { code, branch, regulation } = req.params;
    await pool.query('DELETE FROM subjects WHERE code = ? AND branch = ? AND regulation = ?', [code, branch, regulation]);
    return res.json({ success: true, message: 'Subject deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getTaxonomy,
  createBranch,
  updateBranch,
  createRegulation,
  createSubject,
  updateSubject,
  deleteSubject,
};
