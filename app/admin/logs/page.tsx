import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import LogsClient, { AuditLogItem } from "./logs-client";

export default async function AdminLogsPage() {
  const { user, supabase } = await getCachedUserProfile();
  if (!user) redirect("/login");

  // Fetch audit logs joining actor profile
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      object_id,
      before_summary,
      after_summary,
      created_at,
      users:actor_id (
        name,
        email,
        role
      )
    `)
    .order("created_at", { ascending: false });

  const logs = (data as unknown as AuditLogItem[]) || [];

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-7xl pb-10">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Governance & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Immutable append-only audit trail recording user management, taxonomy adjustments, and state alterations.
          </p>
        </div>
      </div>

      <LogsClient initialLogs={logs} />
    </div>
  );
}
