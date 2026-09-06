-- Support / Contact Inquiries Table
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

-- Index for speedy queries in Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_support_inquiries_status ON public.support_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_support_inquiries_created_at ON public.support_inquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.support_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public insert on support_inquiries" ON public.support_inquiries;
DROP POLICY IF EXISTS "Allow admin full access on support_inquiries" ON public.support_inquiries;

-- Allow anyone (anon visitors + logged-in users) to submit inquiries
CREATE POLICY "Allow public insert on support_inquiries" 
ON public.support_inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow admins full SELECT, UPDATE, DELETE access
CREATE POLICY "Allow admin full access on support_inquiries" 
ON public.support_inquiries 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE (public.users.id = auth.uid() OR public.users.email = auth.jwt() ->> 'email')
          AND public.users.role = 'admin'
    )
);
