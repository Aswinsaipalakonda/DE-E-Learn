-- =========================================================================
-- DATA ENGINEERING E-LEARNING PORTAL: SUBJECT TAXONOMY SEED & FACULTY RLS
-- =========================================================================
-- Run this in your Supabase Dashboard -> SQL Editor to seed core course subjects
-- and enable faculty permissions.

-- 1. Ensure core academic branches exist
INSERT INTO public.branches (code, name, active) VALUES
('CIC', 'Cyber Security, IoT with BlockChain Technology', true),
('CSD', 'Data Science', true),
('CSM', 'Artificial Intelligence and Machine Learning', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, active = true;

-- 2. Ensure semesters (1 to 8) exist
INSERT INTO public.semesters (number, name, active) VALUES
(1, '1st Semester', true),
(2, '2nd Semester', true),
(3, '3rd Semester', true),
(4, '4th Semester', true),
(5, '5th Semester', true),
(6, '6th Semester', true),
(7, '7th Semester', true),
(8, '8th Semester', true)
ON CONFLICT (number) DO NOTHING;

-- 3. Seed Course Subjects
INSERT INTO public.subjects (code, title, branch, semester, active) VALUES
('23CIC301', 'Database Management Systems', 'CIC', 3, true),
('23CIC302', 'Cloud Infrastructure & Distributed Systems', 'CIC', 3, true),
('23CIC303', 'Big Data Processing with Apache Spark', 'CIC', 3, true),
('23CIC304', 'Operating Systems & Linux Kernel Architecture', 'CIC', 3, true),
('23CIC305', 'Computer Networks & IoT Protocols', 'CIC', 3, true),
('23CSD501', 'Data Warehousing & Dimensional Mining', 'CSD', 5, true),
('23CSM101', 'Machine Learning with Python', 'CSM', 1, true)
ON CONFLICT (code) DO UPDATE SET 
    title = EXCLUDED.title,
    branch = EXCLUDED.branch,
    semester = EXCLUDED.semester,
    active = true;

-- 4. Allow Faculty & Admins to manage subjects if not already allowed
DROP POLICY IF EXISTS "Faculty and Admins manage subjects" ON public.subjects;
CREATE POLICY "Faculty and Admins manage subjects" ON public.subjects 
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('faculty', 'admin')
        )
    );
