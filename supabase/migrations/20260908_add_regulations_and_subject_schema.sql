-- =========================================================================
-- MIGRATION: REGULATIONS TABLE & SUBJECT REGULATION COMPOSITE SCHEMA
-- =========================================================================
-- Adds support for autonomous academic regulations (e.g. R23, R24, A2)
-- Allows course codes to be assigned across regulations, semesters, and branches (CIC, CSD, CSM).

-- 1. Create Regulations Table
CREATE TABLE IF NOT EXISTS public.regulations (
    code text PRIMARY KEY,
    name text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert Default Autonomous Regulations
INSERT INTO public.regulations (code, name, active) VALUES
('R23', 'R23 Autonomous Regulation', true),
('R20', 'R20 Autonomous Regulation', true),
('R19', 'R19 Autonomous Regulation', true),
('A2', 'A2 Autonomous Regulation', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active;

-- 2. Enable RLS on Regulations Table
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active regulations" ON public.regulations;
CREATE POLICY "Anyone can view active regulations" ON public.regulations 
    FOR SELECT TO authenticated, anon USING (active = true);

DROP POLICY IF EXISTS "Admins can manage regulations" ON public.regulations;
CREATE POLICY "Admins can manage regulations" ON public.regulations 
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        ) OR auth.role() = 'service_role'
    );

-- 3. Add Regulation column to Subjects Table
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS regulation text NOT NULL DEFAULT 'R23' REFERENCES public.regulations(code) ON UPDATE CASCADE;

-- 4. Reconstruct composite primary key (code, branch, regulation)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'subjects' 
        AND constraint_type = 'PRIMARY KEY' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey CASCADE;
    END IF;

    ALTER TABLE public.subjects ADD PRIMARY KEY (code, branch, regulation);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Composite constraint update handled: %', SQLERRM;
END $$;

-- 5. Seed R23 Common Subjects for Multi-Branch (CIC, CSD, CSM)
INSERT INTO public.subjects (code, title, branch, semester, regulation, active)
VALUES 
  ('R23MATT101', 'LINEAR ALGEBRA & CALCULUS', 'CIC', 1, 'R23', true),
  ('R23MATT101', 'LINEAR ALGEBRA & CALCULUS', 'CSD', 1, 'R23', true),
  ('R23MATT101', 'LINEAR ALGEBRA & CALCULUS', 'CSM', 1, 'R23', true),
  ('R23SE701', 'Software Engineering', 'CIC', 7, 'R23', true),
  ('R23SE701', 'Software Engineering', 'CSD', 7, 'R23', true),
  ('R23SE701', 'Software Engineering', 'CSM', 7, 'R23', true)
ON CONFLICT (code, branch, regulation) DO UPDATE 
SET title = EXCLUDED.title, semester = EXCLUDED.semester, active = EXCLUDED.active;
