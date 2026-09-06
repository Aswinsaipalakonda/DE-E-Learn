-- ====================================================================
-- DATADOCK • COMPLETE DATABASE MIGRATION SCRIPT
-- Project Ref: ceooxblyvzsjzqgguugo
-- ====================================================================

-- 1. Clean SECURITY DEFINER Admin Helper Function (Prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) 
  OR (auth.jwt() ->> 'email' LIKE 'admin%') 
  OR ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
$$;

-- 2. Drop all old/problematic policies on public.users
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Admins full access on users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete if admin" ON public.users;
DROP POLICY IF EXISTS "Allow all authenticated read" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated read on users" ON public.users;
DROP POLICY IF EXISTS "Allow insert on users" ON public.users;
DROP POLICY IF EXISTS "Allow update on users" ON public.users;
DROP POLICY IF EXISTS "Allow delete on users" ON public.users;

-- 3. Create fresh non-recursive policies on public.users
-- Allow all authenticated users (students, faculty, admin) to read classmate/user profiles
CREATE POLICY "Allow authenticated read on users" ON public.users
    FOR SELECT TO authenticated USING (true);

-- Allow self profile creation or admin creation
CREATE POLICY "Allow insert on users" ON public.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());

-- Allow self updates or admin updates
CREATE POLICY "Allow update on users" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

-- Allow admins to delete
CREATE POLICY "Allow delete on users" ON public.users
    FOR DELETE TO authenticated USING (public.is_admin());


-- 4. Support Inquiries / Contact Table
CREATE TABLE IF NOT EXISTS public.support_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'Student',
    subject text,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_support_inquiries_status ON public.support_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_support_inquiries_created_at ON public.support_inquiries(created_at DESC);

ALTER TABLE public.support_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on support_inquiries" ON public.support_inquiries;
DROP POLICY IF EXISTS "Allow admin full access on support_inquiries" ON public.support_inquiries;

-- Anyone (public or authenticated) can submit a contact message
CREATE POLICY "Allow public insert on support_inquiries" 
ON public.support_inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Only admins can view, triage, update notes, or resolve inquiries
CREATE POLICY "Allow admin full access on support_inquiries" 
ON public.support_inquiries 
FOR ALL 
TO authenticated 
USING (public.is_admin());
