import pool from '../../lib/db.js';

async function cleanSubjects() {
  const [rows] = await pool.query('SELECT code, branch, semester, regulation, title FROM subjects');
  let updated = 0;
  for (const row of rows) {
    const cleanCode = row.code.replace(/[\r\n]+/g, '').trim();
    const cleanTitle = row.title
      .replace(/[\uF0B7\uF0A7\u2022]/g, '• ')
      .replace(/[\t\r\n]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (cleanCode !== row.code || cleanTitle !== row.title) {
      await pool.query(
        'UPDATE subjects SET code = ?, title = ? WHERE code = ? AND branch = ? AND semester = ? AND regulation = ?',
        [cleanCode, cleanTitle, row.code, row.branch, row.semester, row.regulation]
      );
      updated++;
    }
  }
  console.log(`Cleaned ${updated} subjects in database.`);
  process.exit(0);
}

cleanSubjects().catch(err => {
  console.error(err);
  process.exit(1);
});
