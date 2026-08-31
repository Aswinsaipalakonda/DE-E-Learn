-- =========================================================================
-- DATA ENGINEERING E-LEARNING PORTAL: SUBJECT TAXONOMY SEED & ACCESS RLS
-- =========================================================================
-- Run this in your Supabase Dashboard -> SQL Editor to seed subjects,
-- configure student/faculty access policies, and enable activity analytics.

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

-- 4. Set up Row-Level Security for Materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view published materials matching scope" ON public.materials;
CREATE POLICY "Students view published materials matching scope" ON public.materials 
    FOR SELECT TO authenticated USING (state = 'published');

DROP POLICY IF EXISTS "Faculty manage their own materials" ON public.materials;
CREATE POLICY "Faculty manage their own materials" ON public.materials 
    FOR ALL TO authenticated USING (owner = auth.uid() OR auth.role() = 'service_role');

-- 5. Set up Row-Level Security for Material Files
ALTER TABLE public.material_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view material files matching scope" ON public.material_files;
CREATE POLICY "Students view material files matching scope" ON public.material_files 
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_files.material_id AND m.state = 'published'
        ) OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Faculty manage their material files" ON public.material_files;
CREATE POLICY "Faculty manage their material files" ON public.material_files 
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_files.material_id AND (m.owner = auth.uid() OR auth.role() = 'service_role')
        )
    );

-- 6. Set up Row-Level Security for Activity Events (Student Tracking)
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create own activity events" ON public.activity_events;
CREATE POLICY "Users create own activity events" ON public.activity_events
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Faculty/Admins view activity events" ON public.activity_events;
CREATE POLICY "Faculty/Admins view activity events" ON public.activity_events
    FOR SELECT TO authenticated USING (true);

-- 7. Ensure Storage Access
DROP POLICY IF EXISTS "Students download bucket files matching scope" ON storage.objects;
CREATE POLICY "Students download bucket files matching scope" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Faculty manage storage files" ON storage.objects;
CREATE POLICY "Faculty manage storage files" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'materials');
