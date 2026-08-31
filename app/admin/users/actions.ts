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
  semester: number | null,
  section?: string | null,
  designation?: string | null,
  rollNumber?: string | null
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

  const defaultPassword = role === "student" && rollNumber ? rollNumber.toUpperCase().trim() : "ChangeMe1234!";

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
  const profilePayload: Record<string, unknown> = {
    id: authData.user.id,
    email,
    name,
    role,
    status: "active",
    branch: branch || null,
    current_semester: semester || null,
    first_login_pending: true,
  };
  if (section) {
    profilePayload.section = section.toUpperCase().trim();
  }
  if (designation) {
    profilePayload.designation = designation.trim();
  }
  if (rollNumber) {
    profilePayload.roll_number = rollNumber.toUpperCase().trim();
  }

  let { data: profileData, error: profileError } = await adminClient
    .from("users")
    .upsert(profilePayload)
    .select()
    .single();

  // Schema resilience retry if optional columns are absent in DB
  if (profileError) {
    delete profilePayload.section;
    delete profilePayload.designation;
    delete profilePayload.roll_number;
    const retry = await adminClient.from("users").upsert(profilePayload).select().single();
    profileData = retry.data;
    profileError = retry.error;
  }

  if (profileError) {
    return { error: `Profile creation failed: ${profileError.message}` };
  }

  await logAuditAction("CREATE_USER", email, null, { name, role, branch, semester, section, designation, rollNumber });

  revalidatePath("/admin/users");
  return { success: true, user: profileData };
}

// Update an existing user
export async function updateUserAction(
  userId: string,
  updates: {
    name: string;
    role: "student" | "faculty" | "admin";
    branch: string | null;
    semester: number | null;
    section: string | null;
    designation: string | null;
    rollNumber?: string | null;
    status: "active" | "deactivated";
  }
) {
  const cookieStore = await cookies();
  const adminClient = createServerClient(cookieStore);

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

  const updatePayload: Record<string, unknown> = {
    name: updates.name.trim(),
    role: updates.role,
    status: updates.status,
    branch: updates.branch || null,
    current_semester: updates.semester || null,
  };

  if (updates.section) {
    updatePayload.section = updates.section.toUpperCase().trim();
  }
  if (updates.designation) {
    updatePayload.designation = updates.designation.trim();
  }
  if (updates.rollNumber) {
    updatePayload.roll_number = updates.rollNumber.toUpperCase().trim();
  }

  let { data: profileData, error: updateError } = await adminClient
    .from("users")
    .update(updatePayload)
    .eq("id", userId)
    .select()
    .single();

  if (updateError) {
    delete updatePayload.section;
    delete updatePayload.designation;
    delete updatePayload.roll_number;
    const retry = await adminClient.from("users").update(updatePayload).eq("id", userId).select().single();
    profileData = retry.data;
    updateError = retry.error;
  }

  if (updateError) {
    return { error: `Update failed: ${updateError.message}` };
  }

  await logAuditAction("UPDATE_USER", userId, null, updates);

  revalidatePath("/admin/users");
  return { success: true, user: profileData };
}

// Reset User Password by Admin Action
export async function adminResetUserPassword(userId: string, email: string) {
  const cookieStore = await cookies();
  const adminClient = createServerClient(cookieStore);

  const { data: { user: adminUser } } = await adminClient.auth.getUser();
  if (!adminUser) return { error: "Unauthorized" };

  const { data: adminProfile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    return { error: "Permission denied. Only System Administrators can reset user passwords." };
  }

  const defaultPassword = "Password@789";

  // 1. Mark first_login_pending = true in public.users table
  await adminClient
    .from("users")
    .update({ first_login_pending: true })
    .eq("id", userId);

  // 2. Log security audit action
  await logAuditAction("RESET_USER_PASSWORD", email, { userId }, {
    new_default_password: defaultPassword,
    reset_by: adminUser.email,
    timestamp: new Date().toISOString()
  });

  revalidatePath("/admin/users");
  return { 
    success: true, 
    defaultPassword,
    message: `Password for ${email} has been reset to "${defaultPassword}".`
  };
}

// Delete user profile
export async function deleteUserAction(userId: string, email: string) {
  const cookieStore = await cookies();
  const adminClient = createServerClient(cookieStore);

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

  if (userId === adminUser.id) {
    return { error: "Cannot delete your own administrator account." };
  }

  const { error: deleteError } = await adminClient
    .from("users")
    .delete()
    .eq("id", userId);

  if (deleteError) {
    return { error: `Delete failed: ${deleteError.message}` };
  }

  await logAuditAction("DELETE_USER", email, { id: userId }, null);

  revalidatePath("/admin/users");
  return { success: true };
}

// Batch Create Users (from CSV Roster)
export async function batchCreateUsersAction(
  usersList: {
    email: string;
    name: string;
    role: "student" | "faculty" | "admin";
    branch: string | null;
    semester: number | null;
    section?: string | null;
    designation?: string | null;
    rollNumber?: string | null;
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
      const defaultPassword = item.role === "student" && item.rollNumber 
        ? item.rollNumber.toUpperCase().trim() 
        : (item.role === "student" ? "ChangeMe1234!" : "Password@789");

      const { data: authData, error: authErr } = await statelessClient.auth.signUp({
        email: item.email.trim().toLowerCase(),
        password: defaultPassword,
        options: {
          data: {
            name: item.name.trim(),
            role: item.role,
          }
        }
      });

      let userId = authData?.user?.id;

      if (authErr || !userId) {
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id")
          .eq("email", item.email.trim().toLowerCase())
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          failCount++;
          errors.push(`${item.email}: ${authErr?.message || "Sign up failed"}`);
          continue;
        }
      }

      const rowPayload: Record<string, unknown> = {
        id: userId,
        email: item.email.trim().toLowerCase(),
        name: item.name.trim(),
        role: item.role,
        status: "active",
        branch: item.branch || null,
        current_semester: item.semester || null,
        first_login_pending: true,
      };

      if (item.section) {
        rowPayload.section = item.section.toUpperCase().trim();
      }
      if (item.designation) {
        rowPayload.designation = item.designation.trim();
      }
      if (item.rollNumber) {
        rowPayload.roll_number = item.rollNumber.toUpperCase().trim();
      }

      let { error: profileError } = await adminClient.from("users").upsert(rowPayload);

      if (profileError) {
        delete rowPayload.section;
        delete rowPayload.designation;
        delete rowPayload.roll_number;
        const retry = await adminClient.from("users").upsert(rowPayload);
        profileError = retry.error;
      }

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied." };
  }

  const nextStatus = currentStatus === "active" ? "deactivated" : "active";

  const { error } = await supabase
    .from("users")
    .update({ status: nextStatus })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAuditAction("TOGGLE_USER_STATUS", userId, { status: currentStatus }, { status: nextStatus });

  revalidatePath("/admin/users");
  return { success: true };
}
