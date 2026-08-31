"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleMaterialState, deleteMaterial, getFacultyFilePreviewUrl } from "./actions";
import ReplaceDialog from "./replace-dialog";
import FilePreviewModal from "@/components/file-preview-modal";
import { StudentEngagementLog } from "./page";
import StudentCohortProgressMatrix from "@/components/student-cohort-progress-matrix";
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
  ChevronRight,
  GraduationCap 
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
  branch?: string;
  semester?: number;
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

  // Modal State for Cohort Progress Matrix
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialItem | null>(null);

  const filteredMaterials = materials.filter(m => m.state === activeTab);

  const openInspectModal = (material: MaterialItem) => {
    setInspectingMaterial(material);
    setIsModalOpen(true);
  };

  const closeInspectModal = () => {
    setIsModalOpen(false);
    setInspectingMaterial(null);
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
                        onClick={() => openInspectModal(m)}
                        title="Click to view student progress matrix"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>{m.views || 0} Views</span>
                      </button>

                      <button
                        onClick={() => openInspectModal(m)}
                        title="Click to view student download matrix"
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
                    onClick={() => openInspectModal(m)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Users className="h-3.5 w-3.5 text-blue-300" />
                    <span>Cohort Matrix</span>
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
      {/* FULL-SCREEN RESPONSIVE MODAL: STUDENT COHORT PROGRESS MATRIX FOR FACULTY */}
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
                branch={inspectingMaterial.branch || "CIC"}
                semester={inspectingMaterial.semester || 3}
                files={inspectingMaterial.material_files || []}
                activityLogs={inspectingMaterial.engagementLogs || []}
                uploaderName="You (Faculty)"
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
