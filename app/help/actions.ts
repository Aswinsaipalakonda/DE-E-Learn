"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { logAuditAction } from "@/utils/audit-logger";

export async function submitSupportTicket(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  const category = formData.get("category") as string;
  const subject = (formData.get("subject") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const userEmail = (formData.get("email") as string)?.trim() || user?.email || "anonymous";

  if (!category || !subject || !description) {
    return { error: "Please fill in all required fields." };
  }

  // If user is authenticated, log to audit_logs
  if (user) {
    await logAuditAction(
      "submit_support_ticket",
      `ticket_${Date.now()}`,
      null,
      { category, subject, description, email: userEmail }
    );
  }

  return { success: true };
}

