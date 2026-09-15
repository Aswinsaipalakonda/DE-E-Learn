const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../R23_Regulation Details.xlsx');
const wb = XLSX.readFile(filePath);

console.log('--- SHEET 1: Regulation(R23) ---');
const s1 = XLSX.utils.sheet_to_json(wb.Sheets['Regulation(R23)'], { raw: false, defval: '' });
console.log('Total rows in Regulation(R23):', s1.length);

const s1Errors = [];
const s1Cleaned = [];

const romanToNumber = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4,
  'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8,
  '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8
};

const seenCodes = new Map();

s1.forEach((row, i) => {
  const rowNum = i + 2;
  const rawCode = (row['Subject Code'] || '').trim();
  const rawTitle = (row['Title'] || '').trim().replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
  const rawBranch = (row['Branch'] || '').trim().toUpperCase();
  const rawSem = (row['Semester'] || '').trim().toUpperCase();
  const rawReg = (row['Regulation'] || '').trim().toUpperCase();

  if (!rawCode) s1Errors.push(`Row ${rowNum}: Missing Subject Code`);
  if (!rawTitle) s1Errors.push(`Row ${rowNum}: Missing Title`);
  if (!rawBranch) s1Errors.push(`Row ${rowNum}: Missing Branch`);
  if (!rawSem) s1Errors.push(`Row ${rowNum}: Missing Semester`);
  if (!rawReg) s1Errors.push(`Row ${rowNum}: Missing Regulation`);

  const semNum = romanToNumber[rawSem];
  if (!semNum) {
    s1Errors.push(`Row ${rowNum}: Unrecognized Semester format "${rawSem}"`);
  }

  // Handle R23MSCSTXXX disambiguation
  let finalCode = rawCode;
  if (rawCode === 'R23MSCSTXXX') {
    if (rawTitle.includes('HON-5')) {
      finalCode = 'R23MSCSTXX5';
    } else if (rawTitle.includes('HON-6')) {
      finalCode = 'R23MSCSTXX6';
    }
  }

  const uniqueKey = `${finalCode}|${rawBranch}|${rawReg}`;
  if (seenCodes.has(uniqueKey)) {
    s1Errors.push(`Row ${rowNum}: Duplicate primary key (${uniqueKey}) previously seen at row ${seenCodes.get(uniqueKey)}`);
  } else {
    seenCodes.set(uniqueKey, rowNum);
  }

  s1Cleaned.push({
    code: finalCode,
    originalCode: rawCode,
    title: rawTitle,
    branch: rawBranch,
    semester: semNum,
    regulation: rawReg
  });
});

console.log('Sheet 1 Errors count:', s1Errors.length);
if (s1Errors.length) console.log('Sheet 1 Errors:', s1Errors);

console.log('\n--- SHEET 2: Student Cohort ---');
const s2 = XLSX.utils.sheet_to_json(wb.Sheets['Sheet2'], { raw: false, defval: '' });
console.log('Total rows in Sheet2:', s2.length);

const s2Errors = [];
const s2Cleaned = [];
const seenRolls = new Set();
const seenEmails = new Set();

s2.forEach((row, i) => {
  const rowNum = i + 2;
  const sno = (row['S.No'] || '').toString().trim();
  const roll = (row['Roll No.'] || '').toString().trim().toUpperCase();
  const name = (row['Name of the Student'] || '').toString().trim().replace(/\s+/g, ' ');
  const branch = (row['Branch'] || '').toString().trim().toUpperCase();
  const sem = (row['Semester'] || '').toString().trim().toUpperCase();
  const sec = (row['Section'] || '').toString().trim().toUpperCase();

  if (!roll) s2Errors.push(`Row ${rowNum}: Missing Roll No.`);
  if (!name) s2Errors.push(`Row ${rowNum}: Missing Student Name`);
  if (!branch) s2Errors.push(`Row ${rowNum}: Missing Branch`);
  if (!sem) s2Errors.push(`Row ${rowNum}: Missing Semester`);
  if (!sec) s2Errors.push(`Row ${rowNum}: Missing Section`);

  // Validate roll number format (10 characters, starts with 23 or 24, college code 33, degree 1A or 5A)
  // Regular: 23331A42xx -> 2023 B.Tech CSM
  // Lateral: 24335A42xx -> 2024 Lateral CSM
  const rollRegex = /^(\d{2})33([15]A)(\d{2})(\d{2})$/;
  const match = roll.match(rollRegex);
  let batchYear = null;
  let isLateral = false;

  if (!match) {
    s2Errors.push(`Row ${rowNum}: Roll ${roll} does not match expected MVGR roll format`);
  } else {
    const yearPrefix = match[1]; // '23' or '24'
    const entryCode = match[2];  // '1A' (Regular) or '5A' (Lateral)
    batchYear = parseInt('20' + yearPrefix, 10);
    isLateral = entryCode === '5A';
  }

  const semNum = romanToNumber[sem] || parseInt(sem, 10) || 1;
  const email = `${roll.toLowerCase()}@mvgrce.edu.in`;

  if (seenRolls.has(roll)) {
    s2Errors.push(`Row ${rowNum}: Duplicate roll number ${roll}`);
  }
  seenRolls.add(roll);

  if (seenEmails.has(email)) {
    s2Errors.push(`Row ${rowNum}: Duplicate email ${email}`);
  }
  seenEmails.add(email);

  s2Cleaned.push({
    sno: parseInt(sno, 10) || (i + 1),
    roll,
    name,
    email,
    branch,
    semester: semNum,
    section: sec,
    academic_year: batchYear,
    is_lateral: isLateral,
    default_password: roll
  });
});

console.log('Sheet 2 Errors count:', s2Errors.length);
if (s2Errors.length) console.log('Sheet 2 Errors:', s2Errors);

console.log('\n--- STUDENT DISTRIBUTION SUMMARY ---');
const regularStudents = s2Cleaned.filter(s => !s.is_lateral);
const lateralStudents = s2Cleaned.filter(s => s.is_lateral);
console.log(`Regular Students: ${regularStudents.length} (Rolls: ${regularStudents[0]?.roll} to ${regularStudents[regularStudents.length-1]?.roll}, Batch: 2023)`);
console.log(`Lateral Students: ${lateralStudents.length} (Rolls: ${lateralStudents[0]?.roll} to ${lateralStudents[lateralStudents.length-1]?.roll}, Batch: 2024)`);
console.log('Sample Lateral Students:', lateralStudents);
