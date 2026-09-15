-- =========================================================================
-- DE E-LEARN PLATFORM — MYSQL SEED DATA
-- Default Branches, Semesters, Regulations, Subjects, and User Accounts
-- =========================================================================

USE `de_elearn`;

-- 1. Seed Branches
INSERT INTO `branches` (`code`, `name`, `active`) VALUES
('CIC', 'Cyber Security, IoT with BlockChain Technology', 1),
('CSD', 'Data Science', 1),
('CSM', 'Artificial Intelligence and Machine Learning', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = VALUES(`active`);

-- 2. Seed Semesters (1 to 8)
INSERT INTO `semesters` (`number`, `name`, `active`) VALUES
(1, '1st Semester', 1),
(2, '2nd Semester', 1),
(3, '3rd Semester', 1),
(4, '4th Semester', 1),
(5, '5th Semester', 1),
(6, '6th Semester', 1),
(7, '7th Semester', 1),
(8, '8th Semester', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = VALUES(`active`);

-- 3. Seed Regulations
INSERT INTO `regulations` (`code`, `name`, `active`) VALUES
('R23', 'R23 Autonomous Regulation', 1),
('R20', 'R20 Autonomous Regulation', 1),
('R19', 'R19 Autonomous Regulation', 1),
('A2', 'A2 Autonomous Regulation', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `active` = VALUES(`active`);

-- 4. Seed Standard Subjects
INSERT INTO `subjects` (`code`, `title`, `branch`, `semester`, `regulation`, `active`) VALUES
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
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `active` = VALUES(`active`);

-- 5. Seed Users
-- Passwords:
-- Admin: AdminPassword@123!
-- Test Student: 23331A4745
-- Test Faculty / Default: Password@789

-- System Admin
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `first_login_pending`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mvgrce.edu.in', '$2b$10$SfpdBKjCic8ymIq4Qbc.8Of7reS.ldK6NjAUdAkoLwADlY7n3VYru', 'System Administrator', 'admin', 'active', 0)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `name` = VALUES(`name`), `role` = 'admin';

-- Test Student
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `branch`, `academic_year`, `current_semester`, `roll_number`, `first_login_pending`) VALUES
('00000000-0000-0000-0000-000000000002', '23331a4745@mvgrce.edu.in', '$2b$10$jA9Eh9wMJMtWaphgGSIsIeNvu3TgYywiJsMWx0YSTeUEDmXsHA1lK', 'Test Student', 'student', 'active', 'CSD', 2023, 4, '23331A4745', 0),
('00000000-0000-0000-0000-000000000003', 'student@mvgrce.edu.in', '$2b$10$LSE/dtPIAuJM7ms837ihsO50X5q8cYGirJvjdIc/dhxPe3cJrDeHy', 'Demo Student', 'student', 'active', 'CIC', 2023, 3, '23331A4701', 0)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `branch` = VALUES(`branch`);

-- Generic Test Faculty
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `first_login_pending`) VALUES
('00000000-0000-0000-0000-000000000004', 'faculty@mvgrce.edu.in', '$2b$10$LSE/dtPIAuJM7ms837ihsO50X5q8cYGirJvjdIc/dhxPe3cJrDeHy', 'Department Faculty', 'faculty', 'active', 'Assistant Professor', 0)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

-- 33 Faculty Members
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000001', 'satyanarayanareddy@mvgrce.edu.in', '$2b$10$dA/ZPvNwgIxDPuExhrgw7eoakQnwFmDWaEs4n4A0HOSnLS2FvsycO', 'Dr. G. Satyanarayana Reddy', 'faculty', 'active', 'Associate Professor', '9490545686', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000002', 'ravikumarkottala@mvgrce.edu.in', '$2b$10$n4FObwtehhh7BDIYg5YFJeKXi6QzjPjqX6X4afz4dM9BUkjcNGqxy', 'Dr. K. Ravi Kumar', 'faculty', 'active', 'Distinguished Assistant Professor', '8886369167', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000003', 'satish@mvgrce.edu.in', '$2b$10$UUFoOc6aAoAv9WRF95ruI.ZnnHniSCPNkrdob0qJYwv/VFO1diRTC', 'Dr. P. Sateesh', 'faculty', 'active', 'Professor', '9246615251', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000004', 'psr.cse@mvgrce.edu.in', '$2b$10$3xsP9knXg/wOBnseIvO62.0mIiKyg4VimuMn3punQQkCHEIfD2j2q', 'Dr. P. Srinivasa Rao', 'faculty', 'active', 'Professor', '9866370352', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000005', 'atchut.sadu@mvgrce.edu.in', '$2b$10$N9nTHIOrof8BHYRCZ/js9eGalkENLBvqd3nM/iTKSwsO6c0iXNnxi', 'Dr. S Atchuta Rao', 'faculty', 'active', 'Professor', '9441159714', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000006', 'tgrao@mvgrce.edu.in', '$2b$10$Xz.KlcFthf9KV.N8CjEK0eAuuo8Rt1EQBvwIBtv22xC88S6G/DHQW', 'Dr. T. Govindarao', 'faculty', 'active', 'Senior Assistant Professor', '8328505780', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000007', 'jyothi@mvgrce.edu.in', '$2b$10$r6Lam6jUnrnLUzF64MPGyevZYLfkgbfEljGjNxf4PL47uSlBAwnfC', 'Dr. V. Jyothi', 'faculty', 'active', 'HOD & Associate Professor', '9701562756', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000008', 'prasannaraju@mvgrce.edu.in', '$2b$10$GccW78qb9H4jDcohuw3enuu40W8qeZL8az3lHUna.ZKZoyE3zSKWG', 'Dr. Y. Home Prasanna Raju', 'faculty', 'active', 'Associate Professor', '8688771559', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000009', 'apunyavardhanraj@mvgrce.edu.in', '$2b$10$6sbDtPAxyVlgrBZ546uhW.0x57Vj8PX2RpCVZz95euOCf841LtXXy', 'Mr. A. Punya Vardhan Raj', 'faculty', 'active', 'Assistant Professor', '8688174609', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000010', 'kvenkatarao@mvgrce.edu.in', '$2b$10$5ysaF6IRQQZpU6Sk2XBsVutOfn7xeSm6Vq69bZ1P.6nlr9wr07aW6', 'Mr. K. Venkata Rao', 'faculty', 'active', 'Assistant Professor', '9032606706', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000011', 'saiganeshlolla@mvgrce.edu.in', '$2b$10$XvBsmao7AVzyZVkD4xvoMOJMqAeXErmR7LJxtGRWWwOR/vdI3dFvW', 'Mr. L. Sai Ganesh', 'faculty', 'active', 'Assistant Professor', '6281682306', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000012', 'aswinikumarm@mvgrce.edu.in', '$2b$10$K612UDX/lBg2SDZl1ZUg6.Bte8DPa3Jp6gkqt0gzmbXTisAGGT372', 'Mr. M. Aswini Kumar', 'faculty', 'active', 'Assistant Professor', '9059287397', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000013', 'spalavelli@mvgrce.edu.in', '$2b$10$lz1YGWwS.QJ7SXG4RdvV2OPJA0CURW4CZjIAdOvZy5i3QqH/0K20C', 'Mr. S. Palavalli', 'faculty', 'active', 'Assistant Professor', '9010695939', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000014', 'surapaparao@mvgrce.edu.in', '$2b$10$3N3FQr7U5BIrfZK1v.zJS.ZE0wNyMHWCy558EXrYHphFDtUf1x0bG', 'Mr. S. Paparao', 'faculty', 'active', 'Assistant Professor', '9491494021', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000015', 'velalakirankumar@mvgrce.edu.in', '$2b$10$.4/zVc3P3xqlbiJ6uf5yaullyJ/tDAzjlN1Dy1bFi4oczyjaJJMXO', 'Mr. V. Kiran Kumar', 'faculty', 'active', 'Assistant Professor', '8978438583', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000016', 'manikantavella48@mvgrce.edu.in', '$2b$10$VyIltackttpJhYp7cNDMs.MUMNOPn1KlWiCaIYWq.nngVbX.rSUDC', 'Mr. V. Manikanta', 'faculty', 'active', 'Assistant Professor', '8978970366', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000017', 'annepusruthipatro@mvgrce.edu.in', '$2b$10$2pLtsJkty5L8/fLDzLgcTel4Tyjr2nhEWkT3ERLDDRSyyP8XfmuCG', 'Mrs. A. Sruthi Patro', 'faculty', 'active', 'Assistant Professor', '9490225613', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000018', 'sowjanyabodasingi@mvgrce.edu.in', '$2b$10$2M8fyyWzpWFo9spqeCjSaOeNoRh04JZrTXd/FzW/d8jErYoxjsVj6', 'Mrs. B. Sowjanya', 'faculty', 'active', 'Assistant Professor', '8500192192', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000019', 'sravanidandu@mvgrce.edu.in', '$2b$10$WyrV4PosvZltSCb.lHrsH.Rcvkbuk7XIdwCh7gP9pyngJgVKUWtv2', 'Mrs. D. Sravani', 'faculty', 'active', 'Assistant Professor', '9490560621', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000020', 'ggayathri@mvgrce.edu.in', '$2b$10$NT2HAa5QCtiLonZpPI5AmexuL59B3y8xG8jWBQteRLL2fr4U/Nk.W', 'Mrs. G. Gayathri', 'faculty', 'active', 'Assistant Professor', '7416500759', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000021', 'glalitha@mvgrce.edu.in', '$2b$10$ReVpR8IpMq6493FVNZ3pJe7SbEpT.KcpwDH0nyKUP6ex3NgeGr.me', 'Mrs. G. Lalitha', 'faculty', 'active', 'Assistant Professor', '7306666619', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000022', 'gayathri.imandi@mvgrce.edu.in', '$2b$10$58mmeOLvDUSYP0UwKIM2ruPpcNQfh8bww7gZUAZ.9heJgRsiibn0i', 'Mrs. I. Gayathri', 'faculty', 'active', 'Assistant Professor', '8074104033', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000023', 'amaravathikaviti@mvgrce.edu.in', '$2b$10$wJMSDqL9luIqn0PUkmVQIeqsebdKeu14x0bxkLKp/GjbiXX2nYjLy', 'Mrs. K. Amaravathi', 'faculty', 'active', 'Assistant Professor', '9493277988', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000024', 'kpapayamma@mvgrce.edu.in', '$2b$10$Z5BQjGXyJuzh9GCvKTHHgulyKB6GezYJCJyIMutvHGVqbFESSPpeu', 'Mrs. K. Papayamma', 'faculty', 'active', 'Assistant Professor', '9581136635', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000025', 'sushmaranin@mvgrce.edu.in', '$2b$10$bnHKtgcNbdNxgkHzpbvWU.am5yuHkOQQwOiFECQSIrlHKhV39HtBi', 'Mrs. N Sushma Rani', 'faculty', 'active', 'Distinguished Assistant Professor', '9948056302', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000026', 'sowjanyanalam@mvgrce.edu.in', '$2b$10$58e2PYMlV3TRsRC/kExRXOsQA5Nml2y9QELKCvNmXAliBnY0UGizi', 'Mrs. N. Sowjanya Kumari', 'faculty', 'active', 'Assistant Professor', '9063166307', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000027', 'pmonika@mvgrce.edu.in', '$2b$10$6XqGKVTYVhlzBLI1kvRLUOlLbL1LLI3s6I7QPxGpkQ8IYsSUJXsdS', 'Mrs. P. Monika', 'faculty', 'active', 'Assistant Professor', '8639086350', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000028', 's.nikhila@mvgrce.edu.in', '$2b$10$etqXLD3J4vNJS/MU0nc.5.fhbw4IEThc6A1EtrgI1KJR5oPScCOqa', 'Mrs. S. Nikhila', 'faculty', 'active', 'Assistant Professor', '9490653956', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000029', 'tulasidesetti@mvgrce.edu.in', '$2b$10$CdB9WEIyvIu7VPg0GYOo2.iC8Pd7d7FUzPi8eJSS50WMFGrGZrW0e', 'Ms. D. Tulasi', 'faculty', 'active', 'Assistant Professor', '9100783439', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000030', 'gaparanjini@mvgrce.edu.in', '$2b$10$nHFf2lpEyjUdehU3KEVN9uzPd2JAUgQJdW.OMs2nYh/ulMUwwzXVi', 'Ms. G. Aparanjini', 'faculty', 'active', 'Assistant Professor', '7989639183', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000031', 'anjalidevi@mvgrce.edu.in', '$2b$10$tODeK.HZfhd9uPWYMfy11eWciuXL4kFA4H97iCh9oR6mllzl/TXOu', 'Ms. J. Anjali Devi', 'faculty', 'active', 'Assistant Professor', '7330838157', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000032', 'kallaswathi@mvgrce.edu.in', '$2b$10$Il73zrULzZe.JoOL5n/p3.Yw6JCrs/z185XOBO33QipO3Nq/DvQjq', 'Ms. K. Swathi', 'faculty', 'active', 'Assistant Professor', '8790177137', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000033', 'pylalova@mvgrce.edu.in', '$2b$10$5ttGErR.8VehLEnM7slOwuDg6jXd.HjFGIySGTG5sTbT2b/3cv3em', 'Ms. P. Lova', 'faculty', 'active', 'Assistant Professor', '8374470543', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
