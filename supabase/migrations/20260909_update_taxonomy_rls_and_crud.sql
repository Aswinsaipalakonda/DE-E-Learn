-- MIGRATION: UPDATE TAXONOMY RLS POLICIES FOR ADMIN MANAGEMENT
-- Allows authenticated administrators (users.role = 'admin') to fully perform CRUD on regulations, branches, and semesters.

-- 1. Branches Policies
DROP POLICY IF EXISTS "Admins manage branches" ON public.branches;
CREATE POLICY "Admins manage branches" ON public.branches
  FOR ALL
  TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
    OR (auth.role() = 'service_role')
  )
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can view all branches" ON public.branches;
CREATE POLICY "Admins can view all branches" ON public.branches
  FOR SELECT
  TO authenticated
  USING (
    active = true OR (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
  );

-- 2. Semesters Policies
DROP POLICY IF EXISTS "Admins manage semesters" ON public.semesters;
CREATE POLICY "Admins manage semesters" ON public.semesters
  FOR ALL
  TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
    OR (auth.role() = 'service_role')
  )
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can view all semesters" ON public.semesters;
CREATE POLICY "Admins can view all semesters" ON public.semesters
  FOR SELECT
  TO authenticated
  USING (
    active = true OR (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
  );

-- 3. Regulations Policies
DROP POLICY IF EXISTS "Admins can view all regulations" ON public.regulations;
CREATE POLICY "Admins can view all regulations" ON public.regulations
  FOR SELECT
  TO authenticated
  USING (
    active = true OR (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
  );
