"use client";

import { useState, useMemo } from "react";
import { 
  Eye, 
  Download, 
  BookOpen, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Check, 
  Loader2,
  BarChart3,
  Sparkles,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { logExportEvent } from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { StudentEngagementLog } from "./page";

interface MaterialWithMetrics {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  views: number;
  downloads: number;
  engagementLogs?: StudentEngagementLog[];
  users: {
    name: string;
    email: string;
  } | null;
}

interface AnalyticsClientProps {
  materials: MaterialWithMetrics[];
  branches: { code: string; name: string }[];
  totalViews: number;
  totalDownloads: number;
}

export default function AnalyticsClient({
  materials,
  branches,
  totalViews,
  totalDownloads,
}: AnalyticsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Slide-over Engagement Detail Drawer State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialWithMetrics | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<"all" | "view" | "download">("all");
  const [drawerStudentSearch, setDrawerStudentSearch] = useState("");

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Distinct material types list
  const materialTypes = useMemo(() => {
    const types = new Set<string>();
    materials.forEach((m) => {
      if (m.type) types.add(m.type);
    });
    return Array.from(types).sort();
  }, [materials]);

  // Unique faculty contributors count
  const facultyContributorsCount = useMemo(() => {
    const emails = new Set<string>();
    materials.forEach((m) => {
      if (m.users?.email) emails.add(m.users.email);
    });
    return emails.size;
  }, [materials]);

  // Open Drawer Function
  const openInspectDrawer = (material: MaterialWithMetrics, defaultTab: "all" | "view" | "download" = "all") => {
    setInspectingMaterial(material);
    setDrawerActiveTab(defaultTab);
    setDrawerStudentSearch("");
    setIsDrawerMounted(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  // Close Drawer Function
  const closeInspectDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setInspectingMaterial(null);
    }, 300);
  };

  // Filtered Materials list
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = m.title.toLowerCase().includes(q);
        const facultyMatch = (m.users?.name || "").toLowerCase().includes(q);
        const typeMatch = m.type.toLowerCase().includes(q);
        const branchMatch = m.branch.toLowerCase().includes(q);
        if (!titleMatch && !facultyMatch && !typeMatch && !branchMatch) {
          return false;
        }
      }

      // 2. Branch Filter
      if (selectedBranch !== "ALL" && m.branch !== selectedBranch) {
        return false;
      }

      // 3. Semester Filter
      if (selectedSemester !== "ALL" && m.semester !== parseInt(selectedSemester, 10)) {
        return false;
      }

      // 4. Type Filter
      if (selectedType !== "ALL" && m.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [materials, searchQuery, selectedBranch, selectedSemester, selectedType]);

  // Paginated Materials
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // Filtered Student Engagement Logs for Drawer
  const filteredStudentLogs = useMemo(() => {
    if (!inspectingMaterial?.engagementLogs) return [];
    
    let logs = inspectingMaterial.engagementLogs;

    // Filter by Tab
    if (drawerActiveTab === "view") {
      logs = logs.filter((l) => l.action === "view");
    } else if (drawerActiveTab === "download") {
      logs = logs.filter((l) => l.action === "download");
    }

    // Filter by Student Search
    if (drawerStudentSearch.trim()) {
      const q = drawerStudentSearch.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.studentName.toLowerCase().includes(q) ||
          l.rollNumber.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.fileName && l.fileName.toLowerCase().includes(q))
      );
    }

    return logs;
  }, [inspectingMaterial, drawerActiveTab, drawerStudentSearch]);

  // Global CSV Export Handler
  const handleExportAllCSV = async () => {
    if (filtered.length === 0) {
      addToast("info", "Nothing to Export", "No materials match your current filters.");
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["Title", "Category", "Branch", "Semester", "Faculty Contributor", "Faculty Email", "Total Views", "Total Downloads", "Uploaded Date"];
      const rows = filtered.map((m) => [
        `"${(m.title || "").replace(/"/g, '""')}"`,
        `"${m.type || ""}"`,
        `"${m.branch || ""}"`,
        m.semester,
        `"${(m.users?.name || "System").replace(/"/g, '""')}"`,
        `"${m.users?.email || ""}"`,
        m.views,
        m.downloads,
        `"${new Date(m.created_at).toISOString()}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mvgr_de_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logExportEvent("material_analytics", filtered.length);
      addToast("success", "Export Successful", `Downloaded engagement report for ${filtered.length} resources.`);
    } catch {
      addToast("error", "Export Failed", "Failed to generate CSV analytics report.");
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Export for individual material's student engagement logs
  const handleExportStudentLogsCSV = () => {
    if (!inspectingMaterial || filteredStudentLogs.length === 0) return;

    const headers = ["Student Name", "Roll Number", "Official Email", "Branch", "Semester", "Section", "Action", "Accessed File", "Timestamp"];
    const rows = filteredStudentLogs.map((log) => [
      `"${log.studentName.replace(/"/g, '""')}"`,
      `"${log.rollNumber}"`,
      `"${log.email}"`,
      `"${log.branch}"`,
      log.semester,
      `"${log.section}"`,
      log.action.toUpperCase(),
      `"${(log.fileName || "Material Workspace").replace(/"/g, '""')}"`,
      `"${new Date(log.timestamp).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${inspectingMaterial.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_student_access.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("success", "Student List Exported", `Downloaded access records for ${filteredStudentLogs.length} interactions.`);
  };

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-7xl pb-10">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Curriculum Analytics & Student Engagement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Analyze real-time student engagement, document view audits, and verified file downloads.
          </p>
        </div>

        <button
          onClick={handleExportAllCSV}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Document Views</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalViews}</span>
            <span className="text-xs text-slate-400 block font-normal">Audited student views</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total File Downloads</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Download className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalDownloads}</span>
            <span className="text-xs text-slate-400 block font-normal">Verified file downloads</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Materials</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{materials.length}</span>
            <span className="text-xs text-slate-400 block font-normal">Active syllabus documents</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden space-y-4">
        {/* Filters Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by title, faculty, or material type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder:text-slate-400 font-normal transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {materialTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        {paginatedMaterials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Material Info</th>
                  <th className="py-3.5 px-4">Faculty Uploader</th>
                  <th className="py-3.5 px-4">Academic Scope</th>
                  <th className="py-3.5 px-4 text-center">Views (Click to Inspect)</th>
                  <th className="py-3.5 px-4 text-center">Downloads (Click to Inspect)</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                {paginatedMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 pl-6 pr-4 max-w-xs sm:max-w-sm">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block leading-snug truncate group-hover:text-primary transition-colors">
                          {m.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            {m.type}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block">{m.users?.name || "Faculty Member"}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">{m.users?.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                          {m.branch}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Sem {m.semester}
                        </span>
                      </div>
                    </td>

                    {/* Interactive Views Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openInspectDrawer(m, "view")}
                        title="Click to see students who viewed this material"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                        <span>{m.views}</span>
                        <ChevronRight className="h-3 w-3 text-blue-400 opacity-60 group-hover/btn:opacity-100" />
                      </button>
                    </td>

                    {/* Interactive Downloads Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openInspectDrawer(m, "download")}
                        title="Click to see students who downloaded files"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                        <span>{m.downloads}</span>
                        <ChevronRight className="h-3 w-3 text-emerald-400 opacity-60 group-hover/btn:opacity-100" />
                      </button>
                    </td>

                    {/* Inspect Action */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <button
                        onClick={() => openInspectDrawer(m, "all")}
                        title="View Full Access Breakdown"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">No Material Metrics Found</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-sm mx-auto">
                No syllabus resources match your current filter selections.
              </p>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 text-xs font-normal text-slate-500">
              <span>
                Showing{" "}
                <span className="text-slate-900 font-semibold">
                  {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}
                </span>{" "}
                to{" "}
                <span className="text-slate-900 font-semibold">
                  {Math.min(currentPage * pageSize, filtered.length)}
                </span>{" "}
                of <span className="text-slate-900 font-semibold">{filtered.length}</span> materials
              </span>

              <div className="flex items-center gap-1.5">
                <label htmlFor="analyticsPageSize" className="text-slate-500">Rows:</label>
                <select
                  id="analyticsPageSize"
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
      {/* SLIDE-OVER DRAWER: STUDENT ACCESS ROSTER */}
      {/* ========================================================================= */}
      {isDrawerMounted && inspectingMaterial && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={closeInspectDrawer}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              className={`w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
                isDrawerVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      <Users className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Student Access Roster</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Audited student views, document previews, and download records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeInspectDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  title="Close Roster"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Material Target Info Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {inspectingMaterial.type}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {inspectingMaterial.branch} • Sem {inspectingMaterial.semester}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {inspectingMaterial.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 block font-normal">
                    Uploaded by: <strong>{inspectingMaterial.users?.name || "Faculty"}</strong>
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDrawerActiveTab("all")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      drawerActiveTab === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Access ({inspectingMaterial.engagementLogs?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerActiveTab("view")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      drawerActiveTab === "view"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Views ({inspectingMaterial.views})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerActiveTab("download")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      drawerActiveTab === "download"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Downloads ({inspectingMaterial.downloads})</span>
                  </button>
                </div>

                {/* Search Component inside Drawer */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search student name, roll number (e.g. 23331A4745)..."
                    value={drawerStudentSearch}
                    onChange={(e) => setDrawerStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                  />
                  {drawerStudentSearch && (
                    <button
                      onClick={() => setDrawerStudentSearch("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Student Records List */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                    <span>Identified Interactions ({filteredStudentLogs.length})</span>
                    <button
                      type="button"
                      onClick={handleExportStudentLogsCSV}
                      disabled={filteredStudentLogs.length === 0}
                      className="text-blue-600 hover:underline cursor-pointer text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Export List</span>
                    </button>
                  </div>

                  {filteredStudentLogs.length > 0 ? (
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {filteredStudentLogs.map((log) => {
                        const isDownload = log.action === "download";

                        return (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/70 transition-all flex items-start justify-between gap-3 group shadow-2xs"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">
                                  {log.studentName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                                  {log.rollNumber}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="truncate max-w-[160px]">{log.email}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-700">
                                  {log.branch} Sem {log.semester}
                                </span>
                              </div>

                              {/* Exact Action and File Details */}
                              {log.fileName && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/90 text-[11px] font-medium text-slate-700 max-w-full">
                                  <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                  <span className="truncate max-w-[220px]">{log.fileName}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {isDownload ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <Download className="h-3 w-3" />
                                  <span>Downloaded</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  <Eye className="h-3 w-3" />
                                  <span>Viewed</span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(log.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-slate-200">
                      <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-slate-500 font-normal">
                        No student access records recorded yet for this material.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-normal">
                  Total Captured: <strong className="text-slate-900 font-semibold">{inspectingMaterial.engagementLogs?.length || 0}</strong> events
                </span>
                <button
                  type="button"
                  onClick={closeInspectDrawer}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-full shadow-xs cursor-pointer"
                >
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
