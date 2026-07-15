"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

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

interface LogsClientProps {
  initialLogs: AuditLogItem[];
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  
  // Selected log for detail drawer
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const filteredLogs = logs.filter((log) => {
    const actorEmail = log.users?.email || "system";
    const matchesSearch = actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) || log.object_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    return matchesSearch && matchesAction;
  });

  // Extract unique actions for filter options
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 relative">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
          <input
            placeholder="Search actor email or target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
        </div>
        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs text-primary font-semibold focus:outline-none"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Object ID</th>
                  <th className="p-4 text-right">View details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg/25 transition-all font-medium">
                    <td className="p-4 text-primary/65">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-secondary">{log.action}</td>
                    <td className="p-4 text-primary font-bold">{log.users?.email || "system"}</td>
                    <td className="p-4 font-semibold text-primary/80 truncate max-w-[150px]">{log.object_id}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1.5 bg-bg hover:bg-border text-primary font-bold border border-border rounded-lg cursor-pointer transition-colors"
                      >
                        Inspect Drawer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-primary/40 font-semibold">
            No system audit logs found.
          </div>
        )}
      </div>

      {/* Details Slide-over Drawer Panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-xs flex justify-end">
          <div className="bg-surface border-l border-border w-full max-w-lg h-full p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-black text-primary text-base uppercase tracking-tight">Audit Log Detail</h3>
                  <span className="text-[10px] text-primary/45 font-bold uppercase tracking-wider block mt-1">ID: {selectedLog.id}</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 hover:bg-bg text-primary/60 rounded-md cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-bg rounded-xl border border-border">
                  <span className="text-primary/40 text-[10px] uppercase block mb-1">Action Initiated</span>
                  <span className="text-secondary font-black block">{selectedLog.action}</span>
                </div>
                <div className="p-3 bg-bg rounded-xl border border-border">
                  <span className="text-primary/40 text-[10px] uppercase block mb-1">Timestamp</span>
                  <span className="text-primary block font-bold">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Actor details */}
              <div className="space-y-2 text-xs font-medium">
                <span className="text-primary/45 text-[10px] uppercase font-bold tracking-wider block">Actor Profile</span>
                <div className="p-4 bg-bg rounded-xl border border-border font-semibold text-primary">
                  {selectedLog.users?.email || "system"}
                </div>
              </div>

              {/* Before/After JSON states */}
              <div className="space-y-4">
                <span className="text-primary/45 text-[10px] uppercase font-bold tracking-wider block">State Transformations</span>
                <div className="grid grid-cols-1 gap-4">
                  {!!selectedLog.before_summary && (
                    <div className="space-y-2">
                      <span className="text-primary/50 text-[10px] font-bold uppercase block">Previous State:</span>
                      <pre className="p-3.5 bg-bg border border-border rounded-xl text-[10px] font-mono text-primary/80 overflow-x-auto">
                        {JSON.stringify(selectedLog.before_summary, null, 2)}
                      </pre>
                    </div>
                  )}
                  {!!selectedLog.after_summary && (
                    <div className="space-y-2">
                      <span className="text-primary/50 text-[10px] font-bold uppercase block">Updated State:</span>
                      <pre className="p-3.5 bg-bg border border-border rounded-xl text-[10px] font-mono text-primary/80 overflow-x-auto">
                        {JSON.stringify(selectedLog.after_summary, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
