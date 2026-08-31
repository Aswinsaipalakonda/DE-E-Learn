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
import StudentCohortProgressMatrix, { FileInfo } from "@/components/student-cohort-progress-matrix";

interface MaterialWithMetrics {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  views: number;
  downloads: number;
  material_files?: FileInfo[];
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

  // Modal State for Cohort Progress Matrix
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const materialTypes = useMemo(() => {
    const types = new Set<string>();
    materials.forEach((m) => {
      if (m.type) types.add(m.type);
    });
    return Array.from(types).sort();
  }, [materials]);

  const openInspectModal = (material: MaterialWithMetrics) => {
    setInspectingMaterial(material);
    setIsModalOpen(true);
  };

  const closeInspectModal = () => {
    setIsModalOpen(false);
    setInspectingMaterial(null);
  };

  const filtered = useMemo(() => {
    return materials.filter((m) => {
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

      if (selectedBranch !== "ALL" && m.branch !== selectedBranch) {
        return false;
      }

      if (selectedSemester !== "ALL" && m.semester !== parseInt(selectedSemester, 10)) {
        return false;
      }

      if (selectedType !== "ALL" && m.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [materials, searchQuery, selectedBranch, selectedSemester, selectedType]);

  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

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
            Analyze student engagement across full cohorts with Red/Orange/Green progress cards and file-level audits.
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
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-center">Downloads</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Cohort Progress</th>
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
                        onClick={() => openInspectModal(m)}
                        title="Click to view student progress matrix"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                        <span>{m.views}</span>
                      </button>
                    </td>

                    {/* Interactive Downloads Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openInspectModal(m)}
                        title="Click to view student download matrix"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                        <span>{m.downloads}</span>
                      </button>
                    </td>

                    {/* Inspect Cohort Progress Action */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <button
                        onClick={() => openInspectModal(m)}
                        title="View Full Cohort Progress Matrix"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Cohort Matrix</span>
                        <ChevronRight className="h-3 w-3" />
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
      {/* FULL-SCREEN RESPONSIVE MODAL: STUDENT COHORT PROGRESS MATRIX (Smooth Scroll) */}
      {/* ========================================================================= */}
      {isModalOpen && inspectingMaterial && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/70 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80 sticky top-0 z-20 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Student Cohort Progress Matrix
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Real-time class engagement analytics and per-file audit trails.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeInspectModal}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <StudentCohortProgressMatrix
                materialId={inspectingMaterial.id}
                materialTitle={inspectingMaterial.title}
                branch={inspectingMaterial.branch}
                semester={inspectingMaterial.semester}
                files={inspectingMaterial.material_files || []}
                activityLogs={inspectingMaterial.engagementLogs || []}
                uploaderName={inspectingMaterial.users?.name || "Faculty Member"}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-20">
              <span className="text-xs text-slate-500 font-normal">
                Total Tracked Events: <strong className="text-slate-900 font-semibold">{inspectingMaterial.engagementLogs?.length || 0}</strong>
              </span>
              <button
                type="button"
                onClick={closeInspectModal}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
