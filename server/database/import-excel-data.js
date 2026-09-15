const XLSX = require('xlsx');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Roman numerals to numbers
const romanToNumber = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4,
  'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8,
  '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8
};

async function main() {
  const filePath = path.join(__dirname, '../../R23_Regulation Details.xlsx');
  console.log(`[1/5] Reading Excel workbook: ${filePath}`);
  const wb = XLSX.readFile(filePath);

  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'de_elearn',
  };

  console.log(`[2/5] Connecting to MySQL database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
  const conn = await mysql.createConnection(dbConfig);

  try {
    // -------------------------------------------------------------
    // STEP 1: Verify / Ensure branches (CIC, CSD, CSM)
    // -------------------------------------------------------------
    console.log(`[3/5] Verifying branches and regulations...`);
    const defaultBranches = [
      ['CIC', 'Cyber Security, IoT with BlockChain Technology'],
      ['CSD', 'Data Science'],
      ['CSM', 'Artificial Intelligence and Machine Learning']
    ];

    for (const [code, name] of defaultBranches) {
      await conn.query(
        `INSERT INTO branches (code, name, active) VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), active = 1`,
        [code, name]
      );
    }

    await conn.query(
      `INSERT INTO regulations (code, name, active) VALUES ('R23', 'R23 Autonomous Regulation', 1)
       ON DUPLICATE KEY UPDATE active = 1`
    );

    for (let sem = 1; sem <= 8; sem++) {
      await conn.query(
        `INSERT INTO semesters (number, name, active) VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE active = 1`,
        [sem, `Semester ${sem}`]
      );
    }

    // -------------------------------------------------------------
    // STEP 2: Ingest Sheet 1: Regulation(R23) -> 213 Subjects
    // -------------------------------------------------------------
    console.log(`[4/5] Processing Regulation(R23) sheet...`);
    const regSheet = XLSX.utils.sheet_to_json(wb.Sheets['Regulation(R23)'], { raw: false, defval: '' });
    console.log(`Found ${regSheet.length} rows in Regulation(R23).`);

    let insertedSubjects = 0;
    const seenSubjects = new Map();

    for (let i = 0; i < regSheet.length; i++) {
      const row = regSheet[i];
      const rowNum = i + 2;
      const rawCode = (row['Subject Code'] || '').toString().trim();
      const rawTitle = (row['Title'] || '').toString().trim().replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
      let rawBranch = (row['Branch'] || '').toString().trim().toUpperCase();
      const rawSem = (row['Semester'] || '').toString().trim().toUpperCase();
      const rawReg = (row['Regulation'] || '').toString().trim().toUpperCase() || 'R23';

      if (!rawCode || !rawTitle) {
        console.warn(`Skipping row ${rowNum}: missing subject code or title.`);
        continue;
      }

      // User Specification: ICB and CIC are the exact same branch
      if (rawBranch === 'ICB') {
        rawBranch = 'CIC';
      }

      const semNumber = romanToNumber[rawSem] || parseInt(rawSem, 10) || 1;

      // Handle duplicate code in Semester VIII: R23MSCSTXXX for HON-5 and HON-6
      let finalCode = rawCode;
      if (rawCode === 'R23MSCSTXXX') {
        if (rawTitle.includes('HON-5')) {
          finalCode = 'R23MSCSTXX5';
        } else if (rawTitle.includes('HON-6')) {
          finalCode = 'R23MSCSTXX6';
        }
      }

      const key = `${finalCode}|${rawBranch}|${rawReg}`;
      if (seenSubjects.has(key)) {
        console.warn(`Duplicate key detected at row ${rowNum} (${key}), skipping duplicate.`);
        continue;
      }
      seenSubjects.set(key, true);

      await conn.query(
        `INSERT INTO subjects (code, title, branch, semester, regulation, active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           semester = VALUES(semester),
           active = 1`,
        [finalCode, rawTitle, rawBranch, semNumber, rawReg]
      );
      insertedSubjects++;
    }

    console.log(`✓ Successfully ingested ${insertedSubjects} subjects into database.`);

    // -------------------------------------------------------------
    // STEP 3: Ingest Sheet 2: Students -> 70 Students
    // -------------------------------------------------------------
    console.log(`[5/5] Processing Sheet2 (Student Cohort)...`);
    const studentSheet = XLSX.utils.sheet_to_json(wb.Sheets['Sheet2'], { raw: false, defval: '' });
    console.log(`Found ${studentSheet.length} rows in Sheet2.`);

    let insertedStudents = 0;
    const studentListForAudit = [];

    for (let i = 0; i < studentSheet.length; i++) {
      const row = studentSheet[i];
      const rowNum = i + 2;
      const roll = (row['Roll No.'] || '').toString().trim().toUpperCase();
      const name = (row['Name of the Student'] || '').toString().trim().replace(/\s+/g, ' ');
      let branch = (row['Branch'] || '').toString().trim().toUpperCase() || 'CSM';
      const sem = (row['Semester'] || '').toString().trim().toUpperCase();
      const sec = (row['Section'] || '').toString().trim().toUpperCase() || 'A';

      if (!roll || !name) {
        console.warn(`Skipping student row ${rowNum}: missing roll or name.`);
        continue;
      }

      if (branch === 'ICB') {
        branch = 'CIC';
      }

      const semNumber = romanToNumber[sem] || parseInt(sem, 10) || 1;
      const clgEmail = `${roll.toLowerCase()}@mvgrce.edu.in`;

      // Password requirement: Roll number in UPPERCASE is the default password
      const plainPassword = roll;
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      // Determine joining batch year from roll number
      // 23331A42xx -> 2023 regular entry
      // 24335A42xx -> 2024 lateral entry (passed diploma, joins B.Tech cohort)
      const yearPrefix = roll.substring(0, 2);
      const academicYear = parseInt('20' + yearPrefix, 10);

      // Check if user already exists
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [clgEmail]);
      const userId = existing.length > 0 ? existing[0].id : crypto.randomUUID();

      await conn.query(
        `INSERT INTO users (
          id, email, password_hash, name, role, status,
          branch, academic_year, current_semester, section,
          roll_number, first_login_pending
        ) VALUES (?, ?, ?, ?, 'student', 'active', ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          password_hash = VALUES(password_hash),
          branch = VALUES(branch),
          academic_year = VALUES(academic_year),
          current_semester = VALUES(current_semester),
          section = VALUES(section),
          roll_number = VALUES(roll_number),
          status = 'active'`,
        [userId, clgEmail, passwordHash, name, branch, academicYear, semNumber, sec, roll]
      );

      insertedStudents++;
      studentListForAudit.push({
        roll,
        name,
        email: clgEmail,
        branch,
        sem: semNumber,
        sec,
        year: academicYear
      });
    }

    console.log(`✓ Successfully ingested ${insertedStudents} students into database.`);

    // Quick verification query
    const [[{ subjectCount }]] = await conn.query('SELECT COUNT(*) AS subjectCount FROM subjects WHERE regulation = "R23"');
    const [[{ studentCount }]] = await conn.query('SELECT COUNT(*) AS studentCount FROM users WHERE role = "student"');
    const [[{ regularCount }]] = await conn.query('SELECT COUNT(*) AS regularCount FROM users WHERE role = "student" AND roll_number LIKE "23331A%"');
    const [[{ lateralCount }]] = await conn.query('SELECT COUNT(*) AS lateralCount FROM users WHERE role = "student" AND roll_number LIKE "24335A%"');
    const [[{ facultyCount }]] = await conn.query('SELECT COUNT(*) AS facultyCount FROM users WHERE role = "faculty"');
    const [[{ adminCount }]] = await conn.query('SELECT COUNT(*) AS adminCount FROM users WHERE role = "admin"');

    console.log('\n================ DATABASE VERIFICATION ================');
    console.log(`Total R23 Subjects:       ${subjectCount}`);
    console.log(`Total Students:           ${studentCount}`);
    console.log(`  - Regular Students (23-): ${regularCount}`);
    console.log(`  - Lateral Students (24-): ${lateralCount}`);
    console.log(`Total Faculty:            ${facultyCount}`);
    console.log(`Total Admin:              ${adminCount}`);
    console.log('=======================================================\n');

  } catch (err) {
    console.error('Error during data ingestion:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
