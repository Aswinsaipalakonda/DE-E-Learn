const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function dumpSeed() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'de_elearn'
  });

  let sql = `-- =========================================================================
-- DE E-LEARN PLATFORM — PRODUCTION SEED DATA
-- Includes:
--   - 3 Active Branches: CIC, CSD, CSM
--   - 8 Semesters
--   - 1 Regulation: R23 Autonomous Regulation
--   - 213 R23 Curriculum Subjects
--   - 1 Master System Administrator (admin@mvgrce.edu.in)
--   - 33 Faculty Members
--   - 70 CSM Section A Students (64 Regular 23331A42xx + 6 Lateral Entry 24335A42xx)
-- =========================================================================

USE \`de_elearn\`;
SET FOREIGN_KEY_CHECKS = 0;

`;

  // Branches
  const [branches] = await conn.query('SELECT code, name, active FROM branches ORDER BY code');
  sql += '-- 1. Branches\n';
  sql += 'INSERT INTO `branches` (`code`, `name`, `active`) VALUES\n';
  sql += branches.map(b => `  ('${b.code}', '${b.name.replace(/'/g, "''")}', ${b.active})`).join(',\n') + '\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = 1;\n\n';

  // Semesters
  const [semesters] = await conn.query('SELECT number, name, active FROM semesters ORDER BY number');
  sql += '-- 2. Semesters\n';
  sql += 'INSERT INTO `semesters` (`number`, `name`, `active`) VALUES\n';
  sql += semesters.map(s => `  (${s.number}, '${s.name.replace(/'/g, "''")}', ${s.active})`).join(',\n') + '\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = 1;\n\n';

  // Regulations
  const [regulations] = await conn.query('SELECT code, name, active FROM regulations ORDER BY code');
  sql += '-- 3. Regulations\n';
  sql += 'INSERT INTO `regulations` (`code`, `name`, `active`) VALUES\n';
  sql += regulations.map(r => `  ('${r.code}', '${r.name.replace(/'/g, "''")}', ${r.active})`).join(',\n') + '\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = 1;\n\n';

  // Subjects
  const [subjects] = await conn.query('SELECT code, title, branch, semester, regulation, active FROM subjects ORDER BY regulation, branch, semester, code');
  sql += `-- 4. Subjects (${subjects.length} Records)\n`;
  sql += 'INSERT INTO `subjects` (`code`, `title`, `branch`, `semester`, `regulation`, `active`) VALUES\n';
  sql += subjects.map(s => `  ('${s.code}', '${s.title.replace(/'/g, "''")}', '${s.branch}', ${s.semester}, '${s.regulation}', ${s.active})`).join(',\n') + '\nON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `active` = 1;\n\n';

  // Users
  const [users] = await conn.query('SELECT id, email, password_hash, name, role, status, branch, academic_year, current_semester, section, designation, phone, roll_number, first_login_pending FROM users ORDER BY role, email');
  sql += `-- 5. Users (${users.length} Records: 1 Admin, 33 Faculty, 70 Students)\n`;
  sql += 'INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `branch`, `academic_year`, `current_semester`, `section`, `designation`, `phone`, `roll_number`, `first_login_pending`) VALUES\n';
  sql += users.map(u => {
    const branch = u.branch ? `'${u.branch}'` : 'NULL';
    const ay = u.academic_year !== null ? u.academic_year : 'NULL';
    const cs = u.current_semester !== null ? u.current_semester : 'NULL';
    const sec = u.section ? `'${u.section}'` : 'NULL';
    const des = u.designation ? `'${u.designation.replace(/'/g, "''")}'` : 'NULL';
    const ph = u.phone ? `'${u.phone}'` : 'NULL';
    const rn = u.roll_number ? `'${u.roll_number}'` : 'NULL';
    return `  ('${u.id}', '${u.email}', '${u.password_hash}', '${u.name.replace(/'/g, "''")}', '${u.role}', '${u.status}', ${branch}, ${ay}, ${cs}, ${sec}, ${des}, ${ph}, ${rn}, ${u.first_login_pending})`;
  }).join(',\n') + '\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `role` = VALUES(`role`), `status` = VALUES(`status`), `branch` = VALUES(`branch`), `academic_year` = VALUES(`academic_year`), `current_semester` = VALUES(`current_semester`), `section` = VALUES(`section`), `roll_number` = VALUES(`roll_number`);\n\n';

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

  const outPath = path.join(__dirname, 'seed.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`Successfully generated ${outPath} (${users.length} users, ${subjects.length} subjects).`);

  await conn.end();
}

dumpSeed().catch(console.error);
