"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleMaterialState, deleteMaterial, getFacultyFilePreviewUrl } from "./actions";
import ReplaceDialog from "./replace-dialog";
import FilePreviewModal from "@/components/file-preview-modal";
import { StudentEngagementLog } from "./page";
import { 
  FileText, 
  Archive, 
  Trash2, 
  RefreshCw, 
  Globe,
  Eye, 
  Download, 
  Loader2,
  Plus,
  Layers,
  Calendar,
  Sparkles,
  FolderOpen,
  Users,
  Search,
  X,
  FileSpreadsheet,
  ChevronRight
} from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  state: "draft" | "published" | "archived" | "deleted";
  created_at: string;
  subject: string;
  views?: number;
  downloads?: number;
  engagementLogs?: StudentEngagementLog[];
  material_files: FileItem[];
}

interface MaterialsListProps {
  initialMaterials: MaterialItem[];
}

export default function MaterialsList({ initialMaterials }: MaterialsListProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [activeTab, setActiveTab] = useState<"published" | "draft" | "archived">("published");

  // Replace file version modal state
  const [replaceTarget, setReplaceTarget] = useState<{
    materialId: string;
    fileId: string;
    fileName: string;
  } | null>(null);

  // File preview modal state
  const [previewingFile, setPreviewingFile] = useState<{
    fileName: string;
    fileUrl: string | null;
    mimeType: string;
    storageRef: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  // Slide-over Engagement Detail Drawer State for Faculty
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialItem | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<"all" | "view" | "download">("all");
  const [drawerStudentSearch, setDrawerStudentSearch] = useState("");

  const filteredMaterials = materials.filter(m => m.state === activeTab);

  const openInspectDrawer = (material: MaterialItem, defaultTab: "all" | "view" | "download" = "all") => {
    setInspectingMaterial(material);
    setDrawerActiveTab(defaultTab);
    setDrawerStudentSearch("");
    setIsDrawerMounted(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeInspectDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setInspectingMaterial(null);
    }, 300);
  };

  const handleStateToggle = async (id: string, newState: "draft" | "published" | "archived") => {
    const result = await toggleMaterialState(id, newState);
    if (result.success) {
      setMaterials(prev =>
        prev.map(m => (m.id === id ? { ...m, state: newState } : m))
      );
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material? This will soft delete the record.")) return;

    const result = await deleteMaterial(id);
    if (result.success) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    } else {
      alert(result.error);
    }
  };

  const handlePreview = async (file: FileItem) => {
    setPreviewingFile({
      fileName: file.file_name,
      fileUrl: null,
      mimeType: file.mime_type,
      storageRef: file.storage_ref,
    });
    setIsPreviewOpen(true);

    try {
      const res = await getFacultyFilePreviewUrl(file.storage_ref);
      if (res.error) {
        alert(res.error);
        setIsPreviewOpen(false);
        return;
      }
      if (res.previewUrl) {
        setPreviewingFile(prev => prev ? { ...prev, fileUrl: res.previewUrl } : null);
      }
    } catch {
      alert("Failed to load preview.");
      setIsPreviewOpen(false);
    }
  };

  const handleDownload = async (storageRef: string, fileName: string) => {
    setDownloadingRef(storageRef);
    try {
      const res = await getFacultyFilePreviewUrl(storageRef);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.previewUrl) {
        const link = document.createElement("a");
        link.href = res.previewUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Failed to download file.");
    } finally {
      setDownloadingRef(null);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + " MB";
    const kb = bytes / 1024;
    return kb.toFixed(1) + " KB";
  };

  // Filtered Student Engagement Logs for Drawer
  const filteredStudentLogs = (inspectingMaterial?.engagementLogs || []).filter((l) => {
    if (drawerActiveTab === "view" && l.action !== "view") return false;
    if (drawerActiveTab === "download" && l.action !== "download") return false;

    if (drawerStudentSearch.trim()) {
      const q = drawerStudentSearch.toLowerCase();
      return (
        l.studentName.toLowerCase().includes(q) ||
        l.rollNumber.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.fileName && l.fileName.toLowerCase().includes(q))
      );
    }

    return true;
  });

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
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* FILTER TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs w-full sm:w-fit overflow-x-auto">
        {(["published", "draft", "archived"] as const).map(tab => {
          const count = materials.filter(m => m.state === tab).length;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MATERIALS INVENTORY LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(m => (
            <div 
              key={m.id} 
              className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 hover:shadow-md transition-all group"
            >
              {/* Material Header & Top Actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.subject && (
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {m.subject}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {m.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      m.state === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : m.state === "draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {m.state}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-primary transition-colors">
                    {m.title}
                  </h3>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400 font-normal">
                    <span>Uploaded on {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    
                    {/* Live Student Engagement Metric Pills for Faculty */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openInspectDrawer(m, "view")}
                        title="Click to view which students opened this material"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>{m.views || 0} Views</span>
                      </button>

                      <button
                        onClick={() => openInspectDrawer(m, "download")}
                        title="Click to view which students downloaded study files"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="h-3 w-3" />
                        <span>{m.downloads || 0} Downloads</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* State Controls Bar */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  {activeTab === "draft" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "published")}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {activeTab === "published" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "archived")}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  )}

                  {activeTab === "archived" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "published")}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                  )}

                  <button
                    onClick={() => openInspectDrawer(m, "all")}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-full border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-slate-600" />
                    <span>Analytics</span>
                  </button>

                  <Link
                    href={`/student/materials/${m.id}`}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-full shadow-2xs transition-all"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full border border-red-200 cursor-pointer transition-all"
                    title="Delete material"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Nested Files / Version Control Area */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Attached Study Files ({m.material_files?.length || 0}):
                </span>

                <div className="space-y-2">
                  {m.material_files && m.material_files.length > 0 ? (
                    m.material_files
                      .filter((f, idx, self) => self.findIndex(t => t.file_name === f.file_name) === idx)
                      .map(file => {
                        const isDownloading = downloadingRef === file.storage_ref;
                        return (
                          <div 
                            key={file.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs gap-3 hover:bg-slate-100/80 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md block">
                                    {file.file_name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[9px] font-bold">
                                    v{file.version}
                                  </span>
                                </div>
                                <span className="text-slate-500 text-[11px]">
                                  {formatSize(file.size)} • PDF Document
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              <button
                                onClick={() => handlePreview(file)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <Eye className="h-3 w-3 text-blue-600" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => handleDownload(file.storage_ref, file.file_name)}
                                disabled={isDownloading}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                                <span>Download</span>
                              </button>

                              <button
                                onClick={() => setReplaceTarget({
                                  materialId: m.id,
                                  fileId: file.id,
                                  fileName: file.file_name,
                                })}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <RefreshCw className="h-3 w-3 text-amber-600" />
                                <span>New Version</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <span className="text-xs text-slate-400">No files registered.</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Materials in {activeTab} State</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t added any course materials under this category yet.
            </p>
            <div className="pt-2">
              <Link
                href="/faculty/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Upload New Material</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Render Replace File Version Dialog */}
      {replaceTarget && (
        <ReplaceDialog
          materialId={replaceTarget.materialId}
          fileId={replaceTarget.fileId}
          fileName={replaceTarget.fileName}
          onClose={() => setReplaceTarget(null)}
        />
      )}

      {/* Render File Preview Modal */}
      {previewingFile && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileName={previewingFile.fileName}
          fileUrl={previewingFile.fileUrl}
          mimeType={previewingFile.mimeType}
          onDownload={() => handleDownload(previewingFile.storageRef, previewingFile.fileName)}
          isDownloading={downloadingRef === previewingFile.storageRef}
        />
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: STUDENT ACCESS ROSTER FOR FACULTY */}
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
                    <h2 className="text-base font-bold text-slate-900">Student Access Breakdown</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Audited list of enrolled students who viewed or downloaded this material.
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
                      {inspectingMaterial.subject}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {inspectingMaterial.title}
                  </h3>
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
                    All ({inspectingMaterial.engagementLogs?.length || 0})
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
                    <span>Views ({inspectingMaterial.views || 0})</span>
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
                    <span>Downloads ({inspectingMaterial.downloads || 0})</span>
                  </button>
                </div>

                {/* Search Component inside Drawer */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search student name, roll number, or file..."
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
                    <span>Identified Student Access ({filteredStudentLogs.length})</span>
                    <button
                      type="button"
                      onClick={handleExportStudentLogsCSV}
                      disabled={filteredStudentLogs.length === 0}
                      className="text-blue-600 hover:underline cursor-pointer text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
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
                        No student views or downloads recorded yet for this material.
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
