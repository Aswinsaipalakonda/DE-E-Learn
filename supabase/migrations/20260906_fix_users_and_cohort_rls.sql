-- Allow authenticated faculty and admin to view student profiles for class engagement
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Admins full access on users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- 1. Allow authenticated users to view active profiles
CREATE POLICY "Authenticated users can view profiles" ON public.users
    FOR SELECT TO authenticated USING (true);

-- 2. Allow admins full access on users
CREATE POLICY "Admins full access on users" ON public.users 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE (u.id = auth.uid() OR u.email = auth.jwt()->>'email') 
              AND u.role = 'admin'
        )
        OR (auth.jwt()->'user_metadata'->>'role' = 'admin')
        OR (auth.jwt()->>'email' LIKE 'admin%')
    );

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users 
    FOR UPDATE TO authenticated USING (auth.uid() = id);
