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

  // Filtered materials
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.title.toLowerCase().includes(q) ||
        (m.users?.name || "").toLowerCase().includes(q) ||
        (m.users?.email || "").toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q);

      const matchesBranch = selectedBranch === "ALL" || m.branch === selectedBranch;
      const matchesSemester = selectedSemester === "ALL" || m.semester.toString() === selectedSemester;
      const matchesType = selectedType === "ALL" || m.type === selectedType;

      return matchesSearch && matchesBranch && matchesSemester && matchesType;
    });
  }, [materials, searchQuery, selectedBranch, selectedSemester, selectedType]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedMaterials = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filtered.slice(startIdx, startIdx + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Drawer Handlers
  const openInspectDrawer = (m: MaterialWithMetrics, initialTab: "all" | "view" | "download" = "all") => {
    setInspectingMaterial(m);
    setDrawerActiveTab(initialTab);
    setDrawerStudentSearch("");
    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  const closeInspectDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setInspectingMaterial(null);
    }, 450);
  };

  // Filtered student engagement logs inside the drawer
  const filteredStudentLogs = useMemo(() => {
    if (!inspectingMaterial || !inspectingMaterial.engagementLogs) return [];
    const logs = inspectingMaterial.engagementLogs;
    const q = drawerStudentSearch.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesTab = drawerActiveTab === "all" ? true : log.action === drawerActiveTab;
      const matchesQuery =
        !q ||
        log.studentName.toLowerCase().includes(q) ||
        log.rollNumber.toLowerCase().includes(q) ||
        log.email.toLowerCase().includes(q) ||
        log.section.toLowerCase().includes(q) ||
        log.branch.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [inspectingMaterial, drawerActiveTab, drawerStudentSearch]);

  // CSV Export Handler for all materials
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const headers = ["Title", "Material Type", "Branch", "Semester", "Faculty Name", "Faculty Email", "Views", "Downloads", "Uploaded Date"];
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

    const headers = ["Student Name", "Roll Number", "Official Email", "Branch", "Semester", "Section", "Action", "Timestamp"];
    const rows = filteredStudentLogs.map((log) => [
      `"${log.studentName.replace(/"/g, '""')}"`,
      `"${log.rollNumber}"`,
      `"${log.email}"`,
      `"${log.branch}"`,
      log.semester,
      `"${log.section}"`,
      log.action.toUpperCase(),
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

    addToast("success", "Student List Exported", `Downloaded access records for ${filteredStudentLogs.length} students.`);
  };

  return (
    <div className="space-y-6 relative pb-10 w-full">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* EXECUTIVE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Repository Usage & Metrics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-0.5">
                Analyze student curriculum engagement, document views, and file download logs.
              </p>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              Resources: <span className="font-semibold">{materials.length}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Total Views: <span className="font-semibold">{totalViews}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Total Downloads: <span className="font-semibold">{totalDownloads}</span>
            </span>
          </div>
        </div>

        {/* Header Action */}
        <div className="self-start lg:self-center shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={isExporting || filtered.length === 0}
            className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRIC TILES: 2-COLUMNS ON MOBILE / 4-COLUMNS ON DESKTOP */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Total Views */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Eye className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalViews}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Document Previews</span>
          </div>
        </div>

        {/* Card 2: Total Downloads */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloads</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Download className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalDownloads}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">File Downloads</span>
          </div>
        </div>

        {/* Card 3: Uploaded Materials */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{materials.length}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Learning Units</span>
          </div>
        </div>

        {/* Card 4: Faculty Contributors */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{facultyContributorsCount}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Active Uploaders</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by title, faculty, or material type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {/* Material Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
            >
              <option value="ALL">All Types</option>
              {materialTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED MATERIAL ENGAGEMENT DIRECTORY TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs w-full">
        {paginatedMaterials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                  <th className="py-3.5 pl-6 pr-4">Material Info</th>
                  <th className="py-3.5 px-4">Faculty Uploader</th>
                  <th className="py-3.5 px-4">Academic Scope</th>
                  <th className="py-3.5 px-4 text-center">Views (Click to Inspect)</th>
                  <th className="py-3.5 px-4 text-center">Downloads (Click to Inspect)</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Material Title & Type */}
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {m.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600 inline-block mt-1">
                          {m.type}
                        </span>
                      </div>
                    </td>

                    {/* Faculty Uploader */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 text-xs block">
                          {m.users?.name || "System Repository"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal block truncate max-w-[180px]">
                          {m.users?.email || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Scope (Branch & Sem) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                          {m.branch}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                          Sem {m.semester}
                        </span>
                      </div>
                    </td>

                    {/* Interactive Views Pill (Click to open Drawer in Views mode) */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openInspectDrawer(m, "view")}
                        title="Click to see students who viewed this file"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                        <span>{m.views}</span>
                        <ChevronRight className="h-3 w-3 text-blue-400 opacity-60 group-hover/btn:opacity-100" />
                      </button>
                    </td>

                    {/* Interactive Downloads Pill (Click to open Drawer in Downloads mode) */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openInspectDrawer(m, "download")}
                        title="Click to see students who downloaded this file"
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

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="px-1 text-xs text-slate-400 font-normal">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-full text-xs transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-slate-900 text-white shadow-2xs font-semibold"
                            : "bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

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
      {/* SLIDE-OVER RIGHT DRAWER: STUDENT ENGAGEMENT ROSTER (VIEWS & DOWNLOADS) */}
      {/* ========================================================================= */}
      {isDrawerMounted && inspectingMaterial && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeInspectDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Student Access Roster
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Audited student views & download history
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeInspectDrawer}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div data-lenis-prevent className="px-6 py-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
                {/* Material Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700 inline-block">
                    {inspectingMaterial.type} • {inspectingMaterial.branch} Sem {inspectingMaterial.semester}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {inspectingMaterial.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal">
                    Uploaded by: <span className="font-semibold text-slate-700">{inspectingMaterial.users?.name || "System"}</span>
                  </p>
                </div>

                {/* View / Download Filter Tabs */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
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
                    <span>Identified Students ({filteredStudentLogs.length})</span>
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
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredStudentLogs.map((log) => {
                        const isDownload = log.action === "download";

                        return (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/70 transition-all flex items-start justify-between gap-3 group"
                          >
                            <div className="space-y-1 min-w-0">
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
                                  {log.branch} Sem {log.semester} Sec {log.section}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {isDownload ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <Download className="h-3 w-3" />
                                  <span>Downloaded</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  <Eye className="h-3 w-3" />
                                  <span>Viewed</span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                        No student access records match your filter criteria.
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
