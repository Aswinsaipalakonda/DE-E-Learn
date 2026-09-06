"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";

export async function updateInquiryStatus(
  id: string,
  status: "pending" | "in_progress" | "resolved",
  adminNotes?: string
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized access" };

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    if (status === "resolved") {
      updatePayload.resolved_at = new Date().toISOString();
      updatePayload.resolved_by = user.id;
    } else {
      updatePayload.resolved_at = null;
      updatePayload.resolved_by = null;
    }

    const { error } = await supabase
      .from("support_inquiries")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditAction("update_inquiry_status", id, null, { status, adminNotes });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update inquiry" };
  }
}

export async function deleteInquiry(id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized access" };

    const { error } = await supabase
      .from("support_inquiries")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditAction("delete_inquiry", id, null, { deleted_at: new Date().toISOString() });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete inquiry" };
  }
}
