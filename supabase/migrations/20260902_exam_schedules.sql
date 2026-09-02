-- Migration: 20260902_exam_schedules.sql
-- Description: Create exam_schedules table for timed exam material hiding/lockout

CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    semesters integer[] NOT NULL,
    branch text DEFAULT 'ALL',
    start_date text NOT NULL,
    end_date text NOT NULL,
    is_daily_recurring boolean DEFAULT false,
    daily_start_time text DEFAULT '10:00',
    daily_end_time text DEFAULT '11:30',
    active boolean DEFAULT true,
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read active schedules
CREATE POLICY "Allow public read access to active exam schedules"
ON public.exam_schedules FOR SELECT
TO authenticated, anon
USING (true);

-- Policies: Admin can manage all schedules
CREATE POLICY "Allow admin full access to exam schedules"
ON public.exam_schedules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
