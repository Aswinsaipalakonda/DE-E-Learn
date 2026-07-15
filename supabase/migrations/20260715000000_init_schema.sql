-- Data Engineering E-Learning Portal
-- Core Database Schema and Row Level Security Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Branches Table
CREATE TABLE public.branches (
    code text PRIMARY KEY,
    name text NOT NULL,
    active boolean NOT NULL DEFAULT true
);

-- Insert Initial Branches
INSERT INTO public.branches (code, name, active) VALUES
('CIC', 'Cyber Security, IoT with BlockChain Technology', true),
('CSD', 'Data Science', true),
('CSM', 'Artificial Intelligence and Machine Learning', true);

-- 2. Create Semesters Table
CREATE TABLE public.semesters (
    number integer PRIMARY KEY CHECK (number BETWEEN 1 AND 8),
    name text NOT NULL,
    active boolean NOT NULL DEFAULT true
);

-- Insert Initial Semesters
INSERT INTO public.semesters (number, name, active) VALUES
(1, '1st Semester', true),
(2, '2nd Semester', true),
(3, '3rd Semester', true),
(4, '4th Semester', true),
(5, '5th Semester', true),
(6, '6th Semester', true),
(7, '7th Semester', true),
(8, '8th Semester', true);

-- 3. Create Users Table
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    branch text REFERENCES public.branches(code),
    academic_year integer,
    current_semester integer REFERENCES public.semesters(number),
    first_login_pending boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create Subjects Table
CREATE TABLE public.subjects (
    code text PRIMARY KEY,
    title text NOT NULL,
    branch text NOT NULL REFERENCES public.branches(code),
    semester integer NOT NULL REFERENCES public.semesters(number),
    active boolean NOT NULL DEFAULT true
);

-- 5. Create Materials Table
CREATE TABLE public.materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    subject text NOT NULL REFERENCES public.subjects(code),
    branch text NOT NULL REFERENCES public.branches(code),
    semester integer NOT NULL REFERENCES public.semesters(number),
    type text NOT NULL CHECK (type IN ('Notes', 'Lecture Slides', 'Assignments', 'Lab Manuals', 'Question Banks', 'Model Papers', 'Reference Books', 'Previous Papers', 'Videos', 'Other Resources')),
    state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'published', 'archived', 'deleted')),
    owner uuid NOT NULL REFERENCES public.users(id),
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Create MaterialFiles Table
CREATE TABLE public.material_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    size integer NOT NULL,
    version integer NOT NULL DEFAULT 1,
    storage_ref text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Create Bookmarks Table
CREATE TABLE public.bookmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_material_bookmark UNIQUE (user_id, material_id)
);

-- 8. Create ActivityEvents Table
CREATE TABLE public.activity_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('view', 'download')),
    actor_id uuid NOT NULL REFERENCES public.users(id),
    target_id uuid NOT NULL REFERENCES public.materials(id),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 9. Create AuditLogs Table (Immutable)
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    actor_id uuid NOT NULL REFERENCES public.users(id),
    object_id text NOT NULL,
    before_summary jsonb,
    after_summary jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Prevent updates and deletes on Audit Logs to ensure immutability
CREATE RULE prevent_audit_log_update AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE RULE prevent_audit_log_delete AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- 10. Create Announcements Table
CREATE TABLE public.announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    scope_branch text REFERENCES public.branches(code),
    scope_semester integer REFERENCES public.semesters(number),
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important')),
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 11. Create Notifications Table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 12. Trigger function to automatically sync users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, status, first_login_pending)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', 'Unknown User'),
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        'active',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Admins can see all. Faculty and students can see active records or their own profile.
CREATE POLICY "Admins full access on users" ON public.users 
    FOR ALL TO authenticated USING (auth.jwt()->'user_metadata'->>'role' = 'admin');

CREATE POLICY "Users can view their own profile" ON public.users 
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users 
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Branches & Semesters: Viewable by all authenticated users
CREATE POLICY "View active branches" ON public.branches 
    FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "View active semesters" ON public.semesters 
    FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Admins manage branches" ON public.branches 
    FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins manage semesters" ON public.semesters 
    FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Subjects: Viewable by all authenticated users
CREATE POLICY "View active subjects" ON public.subjects 
    FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Admins manage subjects" ON public.subjects 
    FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');

-- Materials: Scoped visibility
CREATE POLICY "Students view published materials matching scope" ON public.materials
    FOR SELECT TO authenticated USING (
        state = 'published' AND 
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'student' AND u.branch = materials.branch AND u.current_semester = materials.semester
        )
    );

CREATE POLICY "Faculty manage own/scoped materials" ON public.materials
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'faculty'
        )
    );

CREATE POLICY "Admins manage all materials" ON public.materials
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- MaterialFiles
CREATE POLICY "Students view material files matching scope" ON public.material_files
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.materials m
            JOIN public.users u ON u.branch = m.branch AND u.current_semester = m.semester
            WHERE m.id = material_files.material_id AND u.id = auth.uid() AND u.role = 'student' AND m.state = 'published'
        )
    );

CREATE POLICY "Faculty manage files" ON public.material_files
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'faculty'
        )
    );

CREATE POLICY "Admins manage all files" ON public.material_files
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Bookmarks
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- ActivityEvents
CREATE POLICY "Users create own activity events" ON public.activity_events
    FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Faculty/Admins view activity events" ON public.activity_events
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('faculty', 'admin')
        )
    );

-- AuditLogs
CREATE POLICY "Admins view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

CREATE POLICY "System insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- Announcements
CREATE POLICY "All users view relevant announcements" ON public.announcements
    FOR SELECT TO authenticated USING (
        (scope_branch IS NULL OR scope_branch = (SELECT branch FROM public.users WHERE id = auth.uid())) AND
        (scope_semester IS NULL OR scope_semester = (SELECT current_semester FROM public.users WHERE id = auth.uid())) AND
        now() BETWEEN start_time AND end_time
    );

CREATE POLICY "Admins manage announcements" ON public.announcements
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Notifications
CREATE POLICY "Users manage own notifications" ON public.notifications
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- 13. Storage Setup Config (For reference; actual creation done in Supabase storage console/API)
-- Insert the materials bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects
CREATE POLICY "Students download bucket files matching scope" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'materials' AND
        EXISTS (
            SELECT 1 FROM public.material_files mf
            JOIN public.materials m ON m.id = mf.material_id
            JOIN public.users u ON u.branch = m.branch AND u.current_semester = m.semester
            WHERE mf.storage_ref = name AND u.id = auth.uid() AND u.role = 'student' AND m.state = 'published'
        )
    );

CREATE POLICY "Faculty manage bucket files" ON storage.objects
    FOR ALL TO authenticated USING (
        bucket_id = 'materials' AND
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'faculty'
        )
    );

CREATE POLICY "Admins full bucket control" ON storage.objects
    FOR ALL TO authenticated USING (
        bucket_id = 'materials' AND
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );
