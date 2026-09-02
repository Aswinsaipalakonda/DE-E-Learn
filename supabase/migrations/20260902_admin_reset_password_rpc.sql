-- Migration: Admin User Password Reset & Security Functions
-- Description: Enables administrative password resets securely via PostgreSQL SECURITY DEFINER function

-- 1. Ensure pgcrypto extension is active for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Function to reset user password by an authorized administrator
CREATE OR REPLACE FUNCTION public.reset_user_password_admin(
    target_user_id uuid,
    target_email text,
    new_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    caller_role text;
    caller_id uuid;
    caller_email text;
    resolved_id uuid;
BEGIN
    caller_id := auth.uid();

    -- Verify that the caller is authenticated and has the 'admin' role
    SELECT role, email INTO caller_role, caller_email
    FROM public.users
    WHERE id = caller_id;

    IF caller_role IS NULL OR caller_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only institutional administrators can reset user passwords.';
    END IF;

    -- Resolve target user ID either from provided ID or email
    IF target_user_id IS NOT NULL THEN
        resolved_id := target_user_id;
    ELSE
        SELECT id INTO resolved_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
    END IF;

    IF resolved_id IS NULL THEN
        RAISE EXCEPTION 'User not found in authentication system.';
    END IF;

    -- Update the encrypted password in Supabase auth.users
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = resolved_id;

    -- Mark first_login_pending = true in public.users
    UPDATE public.users
    SET 
        first_login_pending = true,
        updated_at = now()
    WHERE id = resolved_id OR LOWER(email) = LOWER(target_email);

    -- Record Audit Log for security compliance
    INSERT INTO public.audit_logs (
        action,
        actor_id,
        object_id,
        before_summary,
        after_summary,
        created_at
    ) VALUES (
        'ADMIN_RESET_PASSWORD',
        caller_id,
        resolved_id::text,
        jsonb_build_object('target_email', target_email, 'reset_by', caller_email),
        jsonb_build_object('first_login_pending', true, 'timestamp', now()),
        now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', resolved_id,
        'message', 'Password reset successfully in auth system.'
    );
END;
$$;

-- Grant execution permissions on this RPC to authenticated users (internal checks enforce admin role)
GRANT EXECUTE ON FUNCTION public.reset_user_password_admin(uuid, text, text) TO authenticated;
