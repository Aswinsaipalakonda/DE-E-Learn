-- =========================================================================
-- MIGRATION: SUBJECTS COMPOSITE PRIMARY KEY & MULTI-BRANCH CURRICULUM
-- =========================================================================
-- Allows the same curriculum course code (e.g., 23OS401) to be assigned 
-- simultaneously across multiple engineering branches (CIC, CSD, CSM).

-- 1. Ensure subjects table primary key is composite (code, branch)
DO $$
BEGIN
    -- Check and drop existing single-column primary key constraint if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'subjects' 
        AND constraint_type = 'PRIMARY KEY' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey CASCADE;
    END IF;

    -- Add composite primary key (code, branch)
    ALTER TABLE public.subjects ADD PRIMARY KEY (code, branch);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Composite constraint check handled: %', SQLERRM;
END $$;

-- 2. Ensure RLS on subjects allows public reading of active subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active subjects" ON public.subjects;
CREATE POLICY "Anyone can view active subjects" ON public.subjects 
    FOR SELECT TO authenticated, anon USING (active = true);

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects" ON public.subjects 
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        ) OR auth.role() = 'service_role'
    );
