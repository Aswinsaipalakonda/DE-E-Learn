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
  FileText
} from "lucide-react";
import { logExportEvent } from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";

interface MaterialWithMetrics {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  views: number;
  downloads: number;
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

  // Slide-over Detail Drawer State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialWithMetrics | null>(null);

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
  const openInspectDrawer = (m: MaterialWithMetrics) => {
    setInspectingMaterial(m);
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

  // CSV Export Handler
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
                Analyze student curriculum engagement, content downloads, and departmental resource logs.
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
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-center">Downloads</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
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

                    {/* Views Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold">
                        <Eye className="h-3 w-3" />
                        <span>{m.views}</span>
                      </span>
                    </td>

                    {/* Downloads Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
                        <Download className="h-3 w-3" />
                        <span>{m.downloads}</span>
                      </span>
                    </td>

                    {/* Inspect Action */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <button
                        onClick={() => openInspectDrawer(m)}
                        title="View Detailed Analytics"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Inspect</span>
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
      {/* SLIDE-OVER DETAIL INSPECTION DRAWER */}
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
              className={`w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Material Engagement Profile
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Interaction performance and faculty metadata
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

              {/* Body */}
              <div data-lenis-prevent className="px-6 py-5 space-y-5 flex-1 overflow-y-auto overscroll-contain">
                {/* Title & Type */}
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 inline-block">
                    {inspectingMaterial.type}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">
                    {inspectingMaterial.title}
                  </h4>
                </div>

                {/* 2-Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1">
                    <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block">Student Views</span>
                    <span className="text-2xl font-bold text-blue-950 block">{inspectingMaterial.views}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider block">Downloads</span>
                    <span className="text-2xl font-bold text-emerald-950 block">{inspectingMaterial.downloads}</span>
                  </div>
                </div>

                {/* Academic Metadata Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Curriculum Metadata
                  </span>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-normal">Department Branch:</span>
                      <span className="font-semibold text-slate-900">{inspectingMaterial.branch}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-normal">Academic Semester:</span>
                      <span className="font-semibold text-slate-900">Semester {inspectingMaterial.semester}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-normal">Faculty Contributor:</span>
                      <span className="font-semibold text-slate-900">{inspectingMaterial.users?.name || "System"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-normal">Official Email:</span>
                      <span className="font-normal text-slate-700">{inspectingMaterial.users?.email || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-normal">Uploaded Date:</span>
                      <span className="font-normal text-slate-700">{new Date(inspectingMaterial.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={closeInspectDrawer}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-full shadow-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
