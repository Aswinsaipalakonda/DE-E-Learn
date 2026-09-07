-- =========================================================================
-- MIGRATION: EXAM SCHEDULES WITH SUBJECTS GRANULARITY
-- =========================================================================
-- Creates public.exam_schedules with support for multi-semester, multi-branch,
-- and subject-specific timed material lockout.

CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id text PRIMARY KEY,
    title text NOT NULL,
    semesters integer[] NOT NULL,
    branch text DEFAULT 'ALL',
    subjects text[] DEFAULT '{"ALL"}',
    start_date text NOT NULL,
    end_date text NOT NULL,
    is_daily_recurring boolean DEFAULT true,
    daily_start_time text DEFAULT '10:00',
    daily_end_time text DEFAULT '11:30',
    active boolean DEFAULT true,
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- If table already existed, ensure columns exist
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{"ALL"}';
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS branch text DEFAULT 'ALL';
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS is_daily_recurring boolean DEFAULT true;
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS daily_start_time text DEFAULT '10:00';
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS daily_end_time text DEFAULT '11:30';
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Enable RLS
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active exam schedules" ON public.exam_schedules;
CREATE POLICY "Allow public read access to active exam schedules"
ON public.exam_schedules FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Allow admin full access to exam schedules" ON public.exam_schedules;
CREATE POLICY "Allow admin full access to exam schedules"
ON public.exam_schedules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ) OR auth.role() = 'service_role'
);
