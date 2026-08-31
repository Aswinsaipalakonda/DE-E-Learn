"use server";

import { logAuditAction } from "@/utils/audit-logger";

export async function logExportEvent(reportType: string, recordCount: number) {
  await logAuditAction(
    `export_${reportType}`,
    `export_${reportType}_${Date.now()}`,
    null,
    { reportType, recordCount, exported_at: new Date().toISOString() }
  );

  return { success: true };
}


