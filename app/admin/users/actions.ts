"use server";

import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Register a single user and create their profile
export async function createUserAction(
  email: string,
  name: string,
  role: "student" | "faculty" | "admin",
  branch: string | null,
  semester: number | null
) {
  const cookieStore = await cookies();
  const adminClient = createServerClient(cookieStore);

  // 1. Verify admin permissions
  const { data: { user: adminUser } } = await adminClient.auth.getUser();
  if (!adminUser) return { error: "Unauthorized" };

  const { data: adminProfile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "Permission denied." };
  }

  // 2. Register user using stateless client (keeps admin logged in)
  const statelessClient = createStatelessClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const defaultPassword = "ChangeMe1234!";

  const { data: authData, error: authError } = await statelessClient.auth.signUp({
    email,
    password: defaultPassword,
    options: {
      data: {
        name,
        role,
      }
    }
  });

  if (authError || !authData.user) {
    return { error: `Auth registration failed: ${authError?.message}` };
  }

  // 3. Create/Update Profile in public.users
  const { data: profileData, error: profileError } = await adminClient
    .from("users")
    .upsert({
      id: authData.user.id,
      email,
      name,
      role,
      status: "active",
      branch: branch || null,
      current_semester: semester || null,
      first_login_pending: true,
    })
    .select()
    .single();

  if (profileError) {
    return { error: `Profile creation failed: ${profileError.message}` };
  }

  await logAuditAction("CREATE_USER", email, null, { name, role, branch, semester });

  revalidatePath("/admin/users");
  return { success: true, user: profileData };
}


// Batch Create Users (from CSV Roster)
export async function batchCreateUsersAction(
  usersList: {
    email: string;
    name: string;
    role: "student" | "faculty" | "admin";
    branch: string | null;
    semester: number | null;
  }[]
) {
  const cookieStore = await cookies();
  const adminClient = createServerClient(cookieStore);

  const { data: { user } } = await adminClient.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied." };
  }

  const statelessClient = createStatelessClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (const item of usersList) {
    try {
      const defaultPassword = "ChangeMe1234!";

      const { data: authData, error: authError } = await statelessClient.auth.signUp({
        email: item.email,
        password: defaultPassword,
        options: {
          data: {
            name: item.name,
            role: item.role,
          }
        }
      });

      if (authError || !authData.user) {
        failCount++;
        errors.push(`${item.email}: ${authError?.message}`);
        continue;
      }

      const { error: profileError } = await adminClient
        .from("users")
        .upsert({
          id: authData.user.id,
          email: item.email,
          name: item.name,
          role: item.role,
          status: "active",
          branch: item.branch || null,
          current_semester: null,
          first_login_pending: true,
        });

      if (profileError) {
        failCount++;
        errors.push(`${item.email}: Profile insert - ${profileError.message}`);
      } else {
        successCount++;
      }
    } catch (err: unknown) {
      failCount++;
      errors.push(`${item.email}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  await logAuditAction("BATCH_CREATE_USERS", "csv_import", null, { successCount, failCount });

  revalidatePath("/admin/users");
  return { successCount, failCount, errors };
}

// Reset User Status / Lock account
export async function toggleUserStatus(userId: string, currentStatus: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const newStatus = currentStatus === "active" ? "deactivated" : "active";

  const { error } = await supabase
    .from("users")
    .update({ status: newStatus })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAuditAction("TOGGLE_USER_STATUS", userId, { status: currentStatus }, { status: newStatus });

  revalidatePath("/admin/users");
  return { success: true };
}
