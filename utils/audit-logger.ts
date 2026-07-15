import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function logAuditAction(
  action: string,
  objectId: string,
  beforeSummary: unknown = null,
  afterSummary: unknown = null
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      action,
      actor_id: user.id,
      object_id: objectId,
      before_summary: beforeSummary,
      after_summary: afterSummary,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
