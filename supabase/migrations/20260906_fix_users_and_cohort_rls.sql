-- Clean Security Definer Admin Helper to avoid RLS Infinite Recursion
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
  ) OR (auth.jwt() ->> 'email' LIKE 'admin%') OR ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
$$;

-- Drop all existing policies on public.users
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

-- 1. Read: All authenticated users (students, faculty, admin) can read profiles without recursion
CREATE POLICY "Allow authenticated read on users" ON public.users
    FOR SELECT TO authenticated USING (true);

-- 2. Insert: Self-creation or admin creation
CREATE POLICY "Allow insert on users" ON public.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());

-- 3. Update: Users can update their own profile or admin can manage
CREATE POLICY "Allow update on users" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

-- 4. Delete: Admins can delete
CREATE POLICY "Allow delete on users" ON public.users
    FOR DELETE TO authenticated USING (public.is_admin());
