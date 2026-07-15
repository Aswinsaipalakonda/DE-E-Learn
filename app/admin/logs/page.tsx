import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogsClient from "./logs-client";

interface AuditLogItem {
  id: string;
  action: string;
  object_id: string;
  before_summary: unknown;
  after_summary: unknown;
  created_at: string;
  users: {
    email: string;
  } | null;
}

export default async function AdminLogsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch audit logs joining uploader profile
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      object_id,
      before_summary,
      after_summary,
      created_at,
      users (
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch system audit logs database.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Immutable System Audit Logs</h1>
        <p className="text-sm text-primary/60">
          Trace structural alterations, user creations, subject modifications, and state adjustments.
        </p>
      </header>

      <LogsClient initialLogs={(data as unknown as AuditLogItem[]) || []} />
    </div>
  );
}
