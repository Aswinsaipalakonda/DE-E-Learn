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
    const actorId = user?.id || "00000000-0000-0000-0000-000000000001";

    await supabase.from("audit_logs").insert({
      action,
      actor_id: actorId,
      object_id: objectId,
      before_summary: beforeSummary,
      after_summary: afterSummary,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
