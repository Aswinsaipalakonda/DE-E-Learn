-- =========================================================================
-- DE E-LEARN PLATFORM — MYSQL SEED DATA
-- Only Administrator and 33 Faculty Staff
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

-- Clean up any legacy test users / dummy students
DELETE FROM `users` WHERE `role` = 'student' OR `email` IN ('faculty@mvgrce.edu.in', 'student@mvgrce.edu.in', '23331a4745@mvgrce.edu.in');

-- Clean up dummy subjects so admin/faculty can add their own
DELETE FROM `subjects`;

-- 4. Seed Users: Administrator and 33 Faculty Members

-- System Administrator
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `first_login_pending`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mvgrce.edu.in', '$2b$10$X20auI7TJFHGY857JSVJQewlHa2YAm7dsYPQx21LchqvkdChKQyYy', 'System Administrator', 'admin', 'active', 0)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `name` = VALUES(`name`), `role` = 'admin';

-- 33 Official Department Faculty Members
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000001', 'satyanarayanareddy@mvgrce.edu.in', '$2b$10$lUtbhi4VOZdHtJfDmMkeTuHKBxNVez4Ba68Uz9RxT.X620ivVSXyi', 'Dr. G. Satyanarayana Reddy', 'faculty', 'active', 'Associate Professor', '9490545686', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000002', 'ravikumarkottala@mvgrce.edu.in', '$2b$10$hrOqoeM5RquzZK6EfpLjDu5Oz9BJWZv5OnFgfw593X6sY9rEUgvJC', 'Dr. K. Ravi Kumar', 'faculty', 'active', 'Distinguished Assistant Professor', '8886369167', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000003', 'satish@mvgrce.edu.in', '$2b$10$S5TJN1WhvrJNkklNonfZcuD2EHQXAPtxsFGEMvEbZ87B1MdwcnpJS', 'Dr. P. Sateesh', 'faculty', 'active', 'Professor', '9246615251', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000004', 'psr.cse@mvgrce.edu.in', '$2b$10$U6tVVYm6p/9xKeQhxkDG9OqmamM1oxlp.XtfX3ksh6rprZtG.Rdi6', 'Dr. P. Srinivasa Rao', 'faculty', 'active', 'Professor', '9866370352', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000005', 'atchut.sadu@mvgrce.edu.in', '$2b$10$eyYPzyhRl7ywqJgGjj.vk.p/2nzVXq4ZC9IcUloyXaVoPPUxOHA46', 'Dr. S Atchuta Rao', 'faculty', 'active', 'Professor', '9441159714', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000006', 'tgrao@mvgrce.edu.in', '$2b$10$gsNI/3zgfRyzz1Cr9NcjGOs8/T67/7C7.0V4x18r/VdzABg2HZzu6', 'Dr. T. Govindarao', 'faculty', 'active', 'Senior Assistant Professor', '8328505780', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000007', 'jyothi@mvgrce.edu.in', '$2b$10$DfL.lI0YqjRJig3ox49URe9KzguvqwcamapujDBrwiuyBvQUevd/W', 'Dr. V. Jyothi', 'faculty', 'active', 'HOD & Associate Professor', '9701562756', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000008', 'prasannaraju@mvgrce.edu.in', '$2b$10$fRCMX3j9Ni031DJDzKEl2urCjV.UVfPG8ii0Tfi.2/iyPBr2K9x66', 'Dr. Y. Home Prasanna Raju', 'faculty', 'active', 'Associate Professor', '8688771559', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000009', 'apunyavardhanraj@mvgrce.edu.in', '$2b$10$xIo9FsrWxx2mk2lYY00rsuT1HfmyNzhMEpT7FL2UlJoGfdZjbsnpq', 'Mr. A. Punya Vardhan Raj', 'faculty', 'active', 'Assistant Professor', '8688174609', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000010', 'kvenkatarao@mvgrce.edu.in', '$2b$10$Ov4DiVm5UG4l6BShh6Z.A.dR50RUnEy2K7CqAS/WPEwGBc9Fy6ADG', 'Mr. K. Venkata Rao', 'faculty', 'active', 'Assistant Professor', '9032606706', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000011', 'saiganeshlolla@mvgrce.edu.in', '$2b$10$8XRCV4NG9g5x009ZJdfMmex6IU/kVUM7iKutaNA56RyK.j5.6AiHe', 'Mr. L. Sai Ganesh', 'faculty', 'active', 'Assistant Professor', '6281682306', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000012', 'aswinikumarm@mvgrce.edu.in', '$2b$10$Q.UcK7e0a2SM95mjAy7yvOltnWn4sYyoeD3yEVNCzu9gFh7dLQqCG', 'Mr. M. Aswini Kumar', 'faculty', 'active', 'Assistant Professor', '9059287397', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000013', 'spalavelli@mvgrce.edu.in', '$2b$10$L4XFee5h05J8L6EcnAbI5eRduHxCXNLDb0BSiQAmoxInKRLMzJ4Ai', 'Mr. S. Palavalli', 'faculty', 'active', 'Assistant Professor', '9010695939', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000014', 'surapaparao@mvgrce.edu.in', '$2b$10$XzlzgVFY9ElRlart8yygBu1e8jNTG.oL35gku7itJc3iLilCvGd/G', 'Mr. S. Paparao', 'faculty', 'active', 'Assistant Professor', '9491494021', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000015', 'velalakirankumar@mvgrce.edu.in', '$2b$10$kOMXzs65jI8Dvrg.5t11beMlSjvX/oFXB0fqHYP6yI9WPlC7Ar33i', 'Mr. V. Kiran Kumar', 'faculty', 'active', 'Assistant Professor', '8978438583', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000016', 'manikantavella48@mvgrce.edu.in', '$2b$10$Nt5fY9e4p.xeZHTipxPIe.sY58QncVCHifQQFiinENbRE4goo/6qC', 'Mr. V. Manikanta', 'faculty', 'active', 'Assistant Professor', '8978970366', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000017', 'annepusruthipatro@mvgrce.edu.in', '$2b$10$nZXRDCLe9Bo95tXKFpa23..Pq9bjECRTE6Eq2HHfvf7hK1a/03jYW', 'Mrs. A. Sruthi Patro', 'faculty', 'active', 'Assistant Professor', '9490225613', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000018', 'sowjanyabodasingi@mvgrce.edu.in', '$2b$10$s9TygiGSggL7hrhmeMCNQOQh2AVO0z8OMLdz7ZySJCrlLF4uhUCmm', 'Mrs. B. Sowjanya', 'faculty', 'active', 'Assistant Professor', '8500192192', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000019', 'sravanidandu@mvgrce.edu.in', '$2b$10$69THD.GwJYo2wj0kQq1avuepE5nJWrLrDMvVw7fjVNQy6wUcxvfte', 'Mrs. D. Sravani', 'faculty', 'active', 'Assistant Professor', '9490560621', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000020', 'ggayathri@mvgrce.edu.in', '$2b$10$Cx.PDU9ML5XTTt1sIE7pNu5ERDruiC44P3JPP3pdYQd1qofhdbL6m', 'Mrs. G. Gayathri', 'faculty', 'active', 'Assistant Professor', '7416500759', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000021', 'glalitha@mvgrce.edu.in', '$2b$10$TBdGcWZHgr4OW4WBeV1Lhez9uVrzXTqH0NHTOQXbW1FtZ3gqm1PKm', 'Mrs. G. Lalitha', 'faculty', 'active', 'Assistant Professor', '7306666619', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000022', 'gayathri.imandi@mvgrce.edu.in', '$2b$10$n85TH6FGhtLSWjaHGHJCPOX1k2MPRZtfKTONbHY/lKBHaVq.cNObe', 'Mrs. I. Gayathri', 'faculty', 'active', 'Assistant Professor', '8074104033', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000023', 'amaravathikaviti@mvgrce.edu.in', '$2b$10$3ayvlcf5Mhq1aw5a4V3ByeCeIQM1zC5UFQdg13Y6Qd0MIzGfFZH8O', 'Mrs. K. Amaravathi', 'faculty', 'active', 'Assistant Professor', '9493277988', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000024', 'kpapayamma@mvgrce.edu.in', '$2b$10$ZYhhfpXaHMuqOoOXC2A4COJyYAmCsjWPOyzz889BTts1CcfcXxAfO', 'Mrs. K. Papayamma', 'faculty', 'active', 'Assistant Professor', '9581136635', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000025', 'sushmaranin@mvgrce.edu.in', '$2b$10$.3SWr0ZJwn0zpA9gnrRHEuORxQcNH6A9246oa8WlqYMIkovXQRSgS', 'Mrs. N Sushma Rani', 'faculty', 'active', 'Distinguished Assistant Professor', '9948056302', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000026', 'sowjanyanalam@mvgrce.edu.in', '$2b$10$KfPk6btJuy/BA5bEpL6j.OvIqeItsjg9XSmcieun2KnO9Fcf2rfUe', 'Mrs. N. Sowjanya Kumari', 'faculty', 'active', 'Assistant Professor', '9063166307', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000027', 'pmonika@mvgrce.edu.in', '$2b$10$vULYJ7FEIh/Kf98nu.RdFuWS84bEu82V3F4pfdyGGqj8oflDKYHXO', 'Mrs. P. Monika', 'faculty', 'active', 'Assistant Professor', '8639086350', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000028', 's.nikhila@mvgrce.edu.in', '$2b$10$GhBaibepQaz9kMhOt6Pxi.BhvBpPgfgGxp6o34tEKSCGMEVnI48z6', 'Mrs. S. Nikhila', 'faculty', 'active', 'Assistant Professor', '9490653956', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000029', 'tulasidesetti@mvgrce.edu.in', '$2b$10$3K40e0kzNd/K3Ye8rEB0FOSijKbiqxD0obOXlo9L3LJFqB39GFg7O', 'Ms. D. Tulasi', 'faculty', 'active', 'Assistant Professor', '9100783439', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000030', 'gaparanjini@mvgrce.edu.in', '$2b$10$7ycWw1VbLzaLqY38JPobieCGqlds/dN8y9SMe9sK/T7.P8MbcZC0G', 'Ms. G. Aparanjini', 'faculty', 'active', 'Assistant Professor', '7989639183', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000031', 'anjalidevi@mvgrce.edu.in', '$2b$10$JeBzUz6JHK4Gjj7PS9bUkeU7xWn2vMf3PLSsH3ZSEHM5OvGwnAId.', 'Ms. J. Anjali Devi', 'faculty', 'active', 'Assistant Professor', '7330838157', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000032', 'kallaswathi@mvgrce.edu.in', '$2b$10$XEMv6QmCYu/PrdQxp3I.2uZu.lkzwr.K3WZD7RJmA0h7Umq1Twf6C', 'Ms. K. Swathi', 'faculty', 'active', 'Assistant Professor', '8790177137', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `designation`, `phone`, `first_login_pending`) VALUES
('10000000-0000-0000-0000-000000000033', 'pylalova@mvgrce.edu.in', '$2b$10$2JTQDbAQ7gbcuOg4TQaWtei7J10OVvCSVjdjs51xtpwk4YS.6Pm0m', 'Ms. P. Lova', 'faculty', 'active', 'Assistant Professor', '8374470543', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`), `phone` = VALUES(`phone`), `designation` = VALUES(`designation`);
