"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  FileSpreadsheet, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Lock, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  ArrowRight,
  Database,
  KeyRound,
  Eye,
  Copy,
  Check
} from "lucide-react";
import { ToastContainer, ToastMessage } from "@/components/toast";

export interface AuditLogItem {
  id: string;
  action: string;
  object_id: string;
  before_summary: unknown;
  after_summary: unknown;
  created_at: string;
  users: {
    name?: string;
    email: string;
    role?: string;
  } | null;
}

interface LogsClientProps {
  initialLogs: AuditLogItem[];
}

// Action badge style mapping
function getActionBadgeStyle(action: string): { bg: string; text: string; border: string; label: string } {
  const act = (action || "").toLowerCase();
  if (act.includes("create") || act.includes("register") || act.includes("seed")) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "CREATE" };
  }
  if (act.includes("delete") || act.includes("remove") || act.includes("archive")) {
    return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "DELETE" };
  }
  if (act.includes("pass") || act.includes("auth") || act.includes("login")) {
    return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "AUTH" };
  }
  if (act.includes("publish") || act.includes("material")) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "CONTENT" };
  }
  return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "UPDATE" };
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  
  // Drawer Animation States
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Body scroll locking when drawer is open
  useEffect(() => {
    if (isDrawerMounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerMounted]);

  // Focus scroll container on open
  useEffect(() => {
    if (isDrawerVisible && scrollContainerRef.current) {
      scrollContainerRef.current.focus();
    }
  }, [isDrawerVisible]);

  // Direct wheel scroll handler
  const handleScrollWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openDrawer = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setSelectedLog(null);
    }, 500);
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
    addToast("success", "JSON Copied", "State payload copied to clipboard.");
  };

  // KPI Metrics Calculation
  const totalLogsCount = logs.length;
  const userActionsCount = logs.filter((l) => l.action.toLowerCase().includes("user") || l.action.toLowerCase().includes("pass")).length;
  const contentActionsCount = logs.filter((l) => l.action.toLowerCase().includes("material") || l.action.toLowerCase().includes("subject")).length;
  const authActionsCount = logs.filter((l) => l.action.toLowerCase().includes("pass") || l.action.toLowerCase().includes("auth")).length;

  // Extract unique actions for filter options
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort();
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actorEmail = log.users?.email || "system";
      const actorName = log.users?.name || "";
      const q = searchQuery.toLowerCase();
      
      const matchesSearch = 
        !searchQuery.trim() ||
        actorEmail.toLowerCase().includes(q) ||
        actorName.toLowerCase().includes(q) ||
        log.object_id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);

      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      addToast("info", "Nothing to Export", "No audit records match your current filters.");
      return;
    }

    try {
      const headers = ["Audit ID", "Timestamp", "Action Initiated", "Actor Name", "Actor Email", "Target Object ID", "Before State Payload", "After State Payload"];
      const rows = filteredLogs.map((l) => [
        `"${l.id}"`,
        `"${new Date(l.created_at).toISOString()}"`,
        `"${l.action}"`,
        `"${l.users?.name || "System Administrator"}"`,
        `"${l.users?.email || "system@mvgrce.edu.in"}"`,
        `"${l.object_id}"`,
        `"${JSON.stringify(l.before_summary || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(l.after_summary || {}).replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mvgr_de_system_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast("success", "Export Successful", `Downloaded audit trail report with ${filteredLogs.length} events.`);
    } catch {
      addToast("error", "Export Failed", "Could not generate CSV file.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* 1. OVERVIEW KPI METRICS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Audit Events */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Audit Records</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalLogsCount}</span>
            <span className="text-xs text-slate-400 block font-normal">Immutable logged entries</span>
          </div>
        </div>

        {/* Metric 2: User Governance Actions */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Governance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{userActionsCount}</span>
            <span className="text-xs text-slate-400 block font-normal">Account creations & updates</span>
          </div>
        </div>

        {/* Metric 3: Syllabus & Material Alterations */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content & Taxonomy</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{contentActionsCount}</span>
            <span className="text-xs text-slate-400 block font-normal">Syllabus notes & subjects</span>
          </div>
        </div>

        {/* Metric 4: Credential Resets */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security & Auth</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{authActionsCount}</span>
            <span className="text-xs text-slate-400 block font-normal">Password resets & auth keys</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN LOGS AUDIT TABLE CONTAINER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden space-y-4">
        {/* Filters Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by actor email, action, or target ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder:text-slate-400 font-normal transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All System Actions ({totalLogsCount})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        {paginatedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Actor Profile</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                {paginatedLogs.map((log) => {
                  const badge = getActionBadgeStyle(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block">
                            {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}</span>
                          </span>
                        </div>
                      </td>

                      {/* Action Type Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Actor Profile */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">
                            {log.users?.name || "Administrator"}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                            {log.users?.email || "system@mvgrce.edu.in"}
                          </span>
                        </div>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold truncate max-w-[160px] inline-block">
                          {log.object_id}
                        </span>
                      </td>

                      {/* Inspect Drawer Action */}
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <button
                          onClick={() => openDrawer(log)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-semibold transition-all border border-slate-200 shadow-2xs cursor-pointer group-hover:border-primary/40"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect Payload</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">No Audit Logs Found</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-sm mx-auto">
                No system governance entries match your active query or action filter.
              </p>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 text-xs font-normal text-slate-500">
              <span>
                Showing{" "}
                <span className="text-slate-900 font-semibold">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}
                </span>{" "}
                to{" "}
                <span className="text-slate-900 font-semibold">
                  {Math.min(currentPage * pageSize, filteredLogs.length)}
                </span>{" "}
                of <span className="text-slate-900 font-semibold">{filteredLogs.length}</span> records
              </span>

              <div className="flex items-center gap-1.5">
                <label htmlFor="logsPageSize" className="text-slate-500">Rows:</label>
                <select
                  id="logsPageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-0.5 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-xs font-semibold px-2 text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. LUXURIOUS SMOOTH SLIDE-OVER INSPECTION DRAWER */}
      {/* ========================================================================= */}
      {isDrawerMounted && selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={closeDrawer}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Right Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12 z-50">
            <div 
              className={`w-screen max-w-xl sm:max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Audit Event Details
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Event ID: {selectedLog.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div 
                ref={scrollContainerRef}
                tabIndex={0}
                onWheel={handleScrollWheel}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 focus:outline-none"
                style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
              >
                {/* Action & Timestamp Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Action Executed
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getActionBadgeStyle(selectedLog.action).bg} ${getActionBadgeStyle(selectedLog.action).text} ${getActionBadgeStyle(selectedLog.action).border}`}>
                        {getActionBadgeStyle(selectedLog.action).label}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Timestamp
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actor & Entity Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Actor Identity
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedLog.users?.name || "System Admin"}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {selectedLog.users?.email || "system@mvgrce.edu.in"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Entity Identifier
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold block truncate">
                      {selectedLog.object_id}
                    </span>
                  </div>
                </div>

                {/* State Transformation Diffs */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-blue-600" />
                      <span>State Payload Transformations</span>
                    </h3>
                  </div>

                  {/* Previous State (Before) */}
                  {Boolean(selectedLog.before_summary) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Previous State (Before)</span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(selectedLog.before_summary, null, 2), "before")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-full transition-colors cursor-pointer"
                        >
                          {copiedSection === "before" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          <span>Copy JSON</span>
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                        {JSON.stringify(selectedLog.before_summary, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Updated State (After) */}
                  {Boolean(selectedLog.after_summary) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Updated State (After)</span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(selectedLog.after_summary, null, 2), "after")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-full transition-colors cursor-pointer"
                        >
                          {copiedSection === "after" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          <span>Copy JSON</span>
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                        {JSON.stringify(selectedLog.after_summary, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!selectedLog.before_summary && !selectedLog.after_summary && (
                    <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                      No structural diff payloads attached to this action record.
                    </div>
                  )}
                </div>

                <div className="h-16" />
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
