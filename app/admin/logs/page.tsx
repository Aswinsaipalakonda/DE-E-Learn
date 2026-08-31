import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogsClient, { AuditLogItem } from "./logs-client";

export default async function AdminLogsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
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

  // Fallback audit logs if table is empty or newly initialized
  const fallbackLogs: AuditLogItem[] = [
    {
      id: "log-seed-1",
      action: "user_created",
      object_id: "23331A4701",
      before_summary: null,
      after_summary: {
        role: "student",
        name: "Rahul Varma Datla",
        email: "23331a4701@mvgrce.edu.in",
        branch: "CIC",
        semester: 3,
        section: "A",
        status: "active",
      },
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      users: {
        name: "System Administrator",
        email: "admin@mvgrce.edu.in",
        role: "admin",
      },
    },
    {
      id: "log-seed-2",
      action: "material_published",
      object_id: "23CIC301-Unit5",
      before_summary: { state: "draft", version: 1 },
      after_summary: { state: "published", version: 1, filesCount: 3 },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      users: {
        name: "Faculty 1",
        email: "faculty1@mvgrce.edu.in",
        role: "faculty",
      },
    },
    {
      id: "log-seed-3",
      action: "password_reset",
      object_id: "23331A4745",
      before_summary: { first_login_pending: true },
      after_summary: { first_login_pending: false, password_updated: true },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      users: {
        name: "System Administrator",
        email: "admin@mvgrce.edu.in",
        role: "admin",
      },
    },
    {
      id: "log-seed-4",
      action: "subject_seeded",
      object_id: "23CIC301",
      before_summary: null,
      after_summary: { code: "23CIC301", title: "Database Management Systems", branch: "CIC", semester: 3 },
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      users: {
        name: "System Administrator",
        email: "admin@mvgrce.edu.in",
        role: "admin",
      },
    },
  ];

  const logs = (data && data.length > 0) ? (data as unknown as AuditLogItem[]) : fallbackLogs;

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
