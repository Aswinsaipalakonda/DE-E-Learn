const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const facultyList = [
  { name: 'Dr. G. Satyanarayana Reddy', desig: 'Associate Professor', email: 'satyanarayanareddy@mvgrce.edu.in', phone: '9490545686', pass: 'MVGRDE@5686' },
  { name: 'Dr. K. Ravi Kumar', desig: 'Distinguished Assistant Professor', email: 'ravikumarkottala@mvgrce.edu.in', phone: '8886369167', pass: 'MVGRDE@9167' },
  { name: 'Dr. P. Sateesh', desig: 'Professor', email: 'satish@mvgrce.edu.in', phone: '9246615251', pass: 'MVGRDE@5251' },
  { name: 'Dr. P. Srinivasa Rao', desig: 'Professor', email: 'psr.cse@mvgrce.edu.in', phone: '9866370352', pass: 'MVGRDE@0352' },
  { name: 'Dr. S Atchuta Rao', desig: 'Professor', email: 'atchut.sadu@mvgrce.edu.in', phone: '9441159714', pass: 'MVGRDE@9714' },
  { name: 'Dr. T. Govindarao', desig: 'Senior Assistant Professor', email: 'tgrao@mvgrce.edu.in', phone: '8328505780', pass: 'MVGRDE@5780' },
  { name: 'Dr. V. Jyothi', desig: 'HOD & Associate Professor', email: 'jyothi@mvgrce.edu.in', phone: '9701562756', pass: 'MVGRDE@2756' },
  { name: 'Dr. Y. Home Prasanna Raju', desig: 'Associate Professor', email: 'prasannaraju@mvgrce.edu.in', phone: '8688771559', pass: 'MVGRDE@1559' },
  { name: 'Mr. A. Punya Vardhan Raj', desig: 'Assistant Professor', email: 'apunyavardhanraj@mvgrce.edu.in', phone: '8688174609', pass: 'MVGRDE@4609' },
  { name: 'Mr. K. Venkata Rao', desig: 'Assistant Professor', email: 'kvenkatarao@mvgrce.edu.in', phone: '9032606706', pass: 'MVGRDE@6706' },
  { name: 'Mr. L. Sai Ganesh', desig: 'Assistant Professor', email: 'saiganeshlolla@mvgrce.edu.in', phone: '6281682306', pass: 'MVGRDE@2306' },
  { name: 'Mr. M. Aswini Kumar', desig: 'Assistant Professor', email: 'aswinikumarm@mvgrce.edu.in', phone: '9059287397', pass: 'MVGRDE@7397' },
  { name: 'Mr. S. Palavalli', desig: 'Assistant Professor', email: 'spalavelli@mvgrce.edu.in', phone: '9010695939', pass: 'MVGRDE@5939' },
  { name: 'Mr. S. Paparao', desig: 'Assistant Professor', email: 'surapaparao@mvgrce.edu.in', phone: '9491494021', pass: 'MVGRDE@4021' },
  { name: 'Mr. V. Kiran Kumar', desig: 'Assistant Professor', email: 'velalakirankumar@mvgrce.edu.in', phone: '8978438583', pass: 'MVGRDE@8583' },
  { name: 'Mr. V. Manikanta', desig: 'Assistant Professor', email: 'manikantavella48@mvgrce.edu.in', phone: '8978970366', pass: 'MVGRDE@0366' },
  { name: 'Mrs. A. Sruthi Patro', desig: 'Assistant Professor', email: 'annepusruthipatro@mvgrce.edu.in', phone: '9490225613', pass: 'MVGRDE@5613' },
  { name: 'Mrs. B. Sowjanya', desig: 'Assistant Professor', email: 'sowjanyabodasingi@mvgrce.edu.in', phone: '8500192192', pass: 'MVGRDE@2192' },
  { name: 'Mrs. D. Sravani', desig: 'Assistant Professor', email: 'sravanidandu@mvgrce.edu.in', phone: '9490560621', pass: 'MVGRDE@0621' },
  { name: 'Mrs. G. Gayathri', desig: 'Assistant Professor', email: 'ggayathri@mvgrce.edu.in', phone: '7416500759', pass: 'MVGRDE@0759' },
  { name: 'Mrs. G. Lalitha', desig: 'Assistant Professor', email: 'glalitha@mvgrce.edu.in', phone: '7306666619', pass: 'MVGRDE@6619' },
  { name: 'Mrs. I. Gayathri', desig: 'Assistant Professor', email: 'gayathri.imandi@mvgrce.edu.in', phone: '8074104033', pass: 'MVGRDE@4033' },
  { name: 'Mrs. K. Amaravathi', desig: 'Assistant Professor', email: 'amaravathikaviti@mvgrce.edu.in', phone: '9493277988', pass: 'MVGRDE@7988' },
  { name: 'Mrs. K. Papayamma', desig: 'Assistant Professor', email: 'kpapayamma@mvgrce.edu.in', phone: '9581136635', pass: 'MVGRDE@6635' },
  { name: 'Mrs. N Sushma Rani', desig: 'Distinguished Assistant Professor', email: 'sushmaranin@mvgrce.edu.in', phone: '9948056302', pass: 'MVGRDE@6302' },
  { name: 'Mrs. N. Sowjanya Kumari', desig: 'Assistant Professor', email: 'sowjanyanalam@mvgrce.edu.in', phone: '9063166307', pass: 'MVGRDE@6307' },
  { name: 'Mrs. P. Monika', desig: 'Assistant Professor', email: 'pmonika@mvgrce.edu.in', phone: '8639086350', pass: 'MVGRDE@6350' },
  { name: 'Mrs. S. Nikhila', desig: 'Assistant Professor', email: 's.nikhila@mvgrce.edu.in', phone: '9490653956', pass: 'MVGRDE@3956' },
  { name: 'Ms. D. Tulasi', desig: 'Assistant Professor', email: 'tulasidesetti@mvgrce.edu.in', phone: '9100783439', pass: 'MVGRDE@3439' },
  { name: 'Ms. G. Aparanjini', desig: 'Assistant Professor', email: 'gaparanjini@mvgrce.edu.in', phone: '7989639183', pass: 'MVGRDE@9183' },
  { name: 'Ms. J. Anjali Devi', desig: 'Assistant Professor', email: 'anjalidevi@mvgrce.edu.in', phone: '7330838157', pass: 'MVGRDE@8157' },
  { name: 'Ms. K. Swathi', desig: 'Assistant Professor', email: 'kallaswathi@mvgrce.edu.in', phone: '8790177137', pass: 'MVGRDE@7137' },
  { name: 'Ms. P. Lova', desig: 'Assistant Professor', email: 'pylalova@mvgrce.edu.in', phone: '8374470543', pass: 'MVGRDE@0543' }
];

let sql = `-- =========================================================================
-- DE E-LEARN PLATFORM — MYSQL SEED DATA
-- Default Branches, Semesters, Regulations, Subjects, and User Accounts
-- =========================================================================

USE \`de_elearn\`;

-- 1. Seed Branches
INSERT INTO \`branches\` (\`code\`, \`name\`, \`active\`) VALUES
('CIC', 'Cyber Security, IoT with BlockChain Technology', 1),
('CSD', 'Data Science', 1),
('CSM', 'Artificial Intelligence and Machine Learning', 1)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`active\` = VALUES(\`active\`);

-- 2. Seed Semesters (1 to 8)
INSERT INTO \`semesters\` (\`number\`, \`name\`, \`active\`) VALUES
(1, '1st Semester', 1),
(2, '2nd Semester', 1),
(3, '3rd Semester', 1),
(4, '4th Semester', 1),
(5, '5th Semester', 1),
(6, '6th Semester', 1),
(7, '7th Semester', 1),
(8, '8th Semester', 1)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`active\` = VALUES(\`active\`);

-- 3. Seed Regulations
INSERT INTO \`regulations\` (\`code\`, \`name\`, \`active\`) VALUES
('R23', 'R23 Autonomous Regulation', 1),
('R20', 'R20 Autonomous Regulation', 1),
('R19', 'R19 Autonomous Regulation', 1),
('A2', 'A2 Autonomous Regulation', 1)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`active\` = VALUES(\`active\`);

-- 4. Seed Standard Subjects
INSERT INTO \`subjects\` (\`code\`, \`title\`, \`branch\`, \`semester\`, \`regulation\`, \`active\`) VALUES
('R23MATT101', 'Linear Algebra & Calculus', 'CIC', 1, 'R23', 1),
('R23MATT101', 'Linear Algebra & Calculus', 'CSD', 1, 'R23', 1),
('R23MATT101', 'Linear Algebra & Calculus', 'CSM', 1, 'R23', 1),
('R23CS301', 'Data Structures & Algorithms', 'CIC', 3, 'R23', 1),
('R23CS301', 'Data Structures & Algorithms', 'CSD', 3, 'R23', 1),
('R23CS301', 'Data Structures & Algorithms', 'CSM', 3, 'R23', 1),
('R23CS401', 'Database Management Systems', 'CIC', 4, 'R23', 1),
('R23CS401', 'Database Management Systems', 'CSD', 4, 'R23', 1),
('R23CS401', 'Database Management Systems', 'CSM', 4, 'R23', 1),
('R23CS501', 'Operating Systems', 'CIC', 5, 'R23', 1),
('R23CS501', 'Operating Systems', 'CSD', 5, 'R23', 1),
('R23CS501', 'Operating Systems', 'CSM', 5, 'R23', 1),
('R23CS601', 'Computer Networks', 'CIC', 6, 'R23', 1),
('R23CS601', 'Computer Networks', 'CSD', 6, 'R23', 1),
('R23CS601', 'Computer Networks', 'CSM', 6, 'R23', 1),
('R23SE701', 'Software Engineering', 'CIC', 7, 'R23', 1),
('R23SE701', 'Software Engineering', 'CSD', 7, 'R23', 1),
('R23SE701', 'Software Engineering', 'CSM', 7, 'R23', 1)
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`active\` = VALUES(\`active\`);

-- 5. Seed Users
-- Passwords:
-- Admin: AdminPassword@123!
-- Test Student: 23331A4745
-- Test Faculty / Default: Password@789
`;

const adminHash = bcrypt.hashSync('AdminPassword@123!', 10);
const studentHash = bcrypt.hashSync('23331A4745', 10);
const defaultPassHash = bcrypt.hashSync('Password@789', 10);

sql += `
-- System Admin
INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`name\`, \`role\`, \`status\`, \`first_login_pending\`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mvgrce.edu.in', '${adminHash}', 'System Administrator', 'admin', 'active', 0)
ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`), \`name\` = VALUES(\`name\`), \`role\` = 'admin';

-- Test Student
INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`name\`, \`role\`, \`status\`, \`branch\`, \`academic_year\`, \`current_semester\`, \`roll_number\`, \`first_login_pending\`) VALUES
('00000000-0000-0000-0000-000000000002', '23331a4745@mvgrce.edu.in', '${studentHash}', 'Test Student', 'student', 'active', 'CSD', 2023, 4, '23331A4745', 0),
('00000000-0000-0000-0000-000000000003', 'student@mvgrce.edu.in', '${defaultPassHash}', 'Demo Student', 'student', 'active', 'CIC', 2023, 3, '23331A4701', 0)
ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`), \`branch\` = VALUES(\`branch\`);

-- Generic Test Faculty
INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`name\`, \`role\`, \`status\`, \`designation\`, \`first_login_pending\`) VALUES
('00000000-0000-0000-0000-000000000004', 'faculty@mvgrce.edu.in', '${defaultPassHash}', 'Department Faculty', 'faculty', 'active', 'Assistant Professor', 0)
ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`);

-- 33 Faculty Members
`;

facultyList.forEach((fac, idx) => {
  const facId = `10000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
  const facHash = bcrypt.hashSync(fac.pass, 10);
  sql += `INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`name\`, \`role\`, \`status\`, \`designation\`, \`phone\`, \`first_login_pending\`) VALUES
('${facId}', '${fac.email}', '${facHash}', '${fac.name.replace(/'/g, "''")}', 'faculty', 'active', '${fac.desig}', '${fac.phone}', 1)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`password_hash\` = VALUES(\`password_hash\`), \`phone\` = VALUES(\`phone\`), \`designation\` = VALUES(\`designation\`);\n`;
});

fs.writeFileSync(path.join(__dirname, 'seed.sql'), sql, 'utf8');
console.log('Successfully generated seed.sql with 33 faculty members, admin, and test students!');
