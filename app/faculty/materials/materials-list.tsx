"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { toggleMaterialState, deleteMaterial, getFacultyFilePreviewUrl } from "./actions";
import ReplaceDialog from "./replace-dialog";
import FilePreviewModal from "@/components/file-preview-modal";
import { StudentEngagementLog } from "./page";
import StudentCohortProgressMatrix, { RegisteredStudent } from "@/components/student-cohort-progress-matrix";
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
  FolderOpen, 
  Users, 
  X, 
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter
} from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
}

export interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  description?: string;
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
  subjects: SubjectItem[];
  students?: RegisteredStudent[];
}

export default function MaterialsList({ initialMaterials, subjects, students }: MaterialsListProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "archived">("all");
  
  // Selected Subject State: null = Show Subject Cards Grid; string = Show Materials for that Subject
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");

  // Pagination & Resource Type Filter States
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [subjectPage, setSubjectPage] = useState(1);
  const [materialPage, setMaterialPage] = useState(1);
  const SUBJECTS_PER_PAGE = 6;
  const MATERIALS_PER_PAGE = 6;

  // Reset pagination on search or filter changes
  useEffect(() => {
    setSubjectPage(1);
  }, [subjectSearchQuery]);

  useEffect(() => {
    setMaterialPage(1);
  }, [materialSearchQuery, activeTab, typeFilter, selectedSubjectCode]);

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

  // Smooth Drawer Animation States (Like Add New User)
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialItem | null>(null);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Body scroll locking when drawer or modal is open
  useEffect(() => {
    if (isDrawerMounted || isPreviewOpen || replaceTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerMounted, isPreviewOpen, replaceTarget]);

  // Focus scroll container when drawer becomes visible
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

  // Compute stats for each subject
  const subjectStats = useMemo(() => {
    return subjects.map((sub) => {
      const subMaterials = materials.filter(
        (m) => (m.subject || "").toUpperCase() === sub.code.toUpperCase()
      );
      const totalViews = subMaterials.reduce((acc, curr) => acc + (curr.views || 0), 0);
      const totalDownloads = subMaterials.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
      const totalFiles = subMaterials.reduce((acc, curr) => acc + (curr.material_files?.length || 0), 0);
      const publishedCount = subMaterials.filter((m) => m.state === "published").length;
      const draftCount = subMaterials.filter((m) => m.state === "draft").length;

      return {
        ...sub,
        materialsCount: subMaterials.length,
        publishedCount,
        draftCount,
        totalViews,
        totalDownloads,
        totalFiles,
      };
    });
  }, [subjects, materials]);

  // Filtered subjects list for search
  const filteredSubjects = useMemo(() => {
    if (!subjectSearchQuery.trim()) return subjectStats;
    const q = subjectSearchQuery.toLowerCase();
    return subjectStats.filter(
      (s) => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.branch.toLowerCase().includes(q)
    );
  }, [subjectStats, subjectSearchQuery]);

  // Level 1 Subject Pagination
  const totalSubjectPages = Math.ceil(filteredSubjects.length / SUBJECTS_PER_PAGE) || 1;
  const paginatedSubjects = useMemo(() => {
    const start = (subjectPage - 1) * SUBJECTS_PER_PAGE;
    return filteredSubjects.slice(start, start + SUBJECTS_PER_PAGE);
  }, [filteredSubjects, subjectPage]);

  // Current active subject object
  const currentSubject = useMemo(() => {
    if (!selectedSubjectCode) return null;
    return subjectStats.find((s) => s.code.toUpperCase() === selectedSubjectCode.toUpperCase()) || {
      code: selectedSubjectCode,
      title: selectedSubjectCode,
      branch: "CIC",
      semester: 3,
      materialsCount: 0,
      publishedCount: 0,
      draftCount: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalFiles: 0,
    };
  }, [selectedSubjectCode, subjectStats]);

  // Filter materials for the selected subject
  const subjectMaterials = useMemo(() => {
    if (!selectedSubjectCode) return [];
    return materials.filter(
      (m) => (m.subject || "").toUpperCase() === selectedSubjectCode.toUpperCase()
    );
  }, [materials, selectedSubjectCode]);

  // Distinct resource types in active subject (e.g. Lecture Notes, Lab Manuals)
  const availableTypes = useMemo(() => {
    const types = new Set(subjectMaterials.map((m) => m.type).filter(Boolean));
    return Array.from(types);
  }, [subjectMaterials]);

  // Filter materials by tab, typeFilter & search query
  const displayedMaterials = useMemo(() => {
    return subjectMaterials.filter((m) => {
      if (activeTab !== "all" && m.state !== activeTab) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (materialSearchQuery.trim()) {
        const q = materialSearchQuery.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [subjectMaterials, activeTab, typeFilter, materialSearchQuery]);

  // Level 2 Material Pagination
  const totalMaterialPages = Math.ceil(displayedMaterials.length / MATERIALS_PER_PAGE) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (materialPage - 1) * MATERIALS_PER_PAGE;
    return displayedMaterials.slice(start, start + MATERIALS_PER_PAGE);
  }, [displayedMaterials, materialPage]);

  // Smooth open drawer
  const openInspectModal = (material: MaterialItem) => {
    setInspectingMaterial(material);
    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  // Smooth close drawer (500ms transition)
  const closeInspectModal = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setInspectingMaterial(null);
    }, 500);
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
    <div className="space-y-6" suppressHydrationWarning>
      {/* ========================================================================= */}
      {/* LEVEL 1: ASSIGNED COURSE SUBJECTS GRID (DEFAULT VIEW) */}
      {/* ========================================================================= */}
      {!selectedSubjectCode ? (
        <div className="space-y-6">
          {subjects.length === 0 ? (
            <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
                <FolderOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">No Course Materials Uploaded Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  You haven&apos;t uploaded syllabus notes, lab manuals, or lecture slides yet. Once you publish resources for your assigned subjects, they will appear here.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/faculty/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Your First Course Material</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Controls Bar */}
              <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Teaching Portfolios
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      {subjects.length} Subjects With Materials
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Click on any course subject card below to view, upload, and inspect learning materials.
                  </p>
                </div>

                <div className="relative sm:w-72">
                  <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    placeholder="Search subject by code or name..."
                    value={subjectSearchQuery}
                    onChange={(e) => setSubjectSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all font-normal"
                  />
                  {subjectSearchQuery && (
                    <button
                      onClick={() => setSubjectSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subjects Grid or Empty Search State */}
              {filteredSubjects.length === 0 ? (
                <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No Subjects Match &quot;{subjectSearchQuery}&quot;</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    We couldn&apos;t find any subject with materials matching your search query.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setSubjectSearchQuery("")}
                      className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedSubjects.map((sub) => {
                    const hasMaterials = sub.materialsCount > 0;

                    return (
                      <div
                        key={sub.code}
                        onClick={() => {
                          setSelectedSubjectCode(sub.code);
                          setMaterialPage(1);
                          setTypeFilter("all");
                        }}
                        className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
                      >
                        {/* Top Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold font-mono">
                              {sub.code}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                              {sub.branch} • Sem {sub.semester}
                            </span>
                          </div>

                          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-4.5 w-4.5" />
                          </div>
                        </div>

                        {/* Subject Title */}
                        <div className="space-y-1">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                            {sub.title}
                          </h2>
                          <p className="text-xs text-slate-500 font-normal">
                            Department of Data Engineering Syllabus
                          </p>
                        </div>

                        {/* Metrics Statistics */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                          <div>
                            <span className="block text-base font-bold text-slate-900">{sub.materialsCount}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">Materials</span>
                          </div>
                          <div className="border-x border-slate-200">
                            <span className="block text-base font-bold text-blue-700">{sub.totalViews}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">Views</span>
                          </div>
                          <div>
                            <span className="block text-base font-bold text-emerald-700">{sub.totalDownloads}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">Downloads</span>
                          </div>
                        </div>

                        {/* Action Link Footer */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-primary group-hover:text-blue-700">
                          <span>{hasMaterials ? "View Uploaded Materials" : "Open Subject Workspace"}</span>
                          <div className="p-1 rounded-full bg-blue-50 text-blue-700 group-hover:bg-primary group-hover:text-white transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Level 1 Pagination Toolbar */}
              {totalSubjectPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                  <div className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{(subjectPage - 1) * SUBJECTS_PER_PAGE + 1}</span> to{" "}
                    <span className="font-semibold text-slate-800">{Math.min(subjectPage * SUBJECTS_PER_PAGE, filteredSubjects.length)}</span> of{" "}
                    <span className="font-semibold text-slate-800">{filteredSubjects.length}</span> course subjects
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSubjectPage((p) => Math.max(1, p - 1))}
                      disabled={subjectPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      aria-label="Previous subjects page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Prev</span>
                    </button>
                    {Array.from({ length: totalSubjectPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setSubjectPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          subjectPage === pageNum
                            ? "bg-primary text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={subjectPage === pageNum ? "page" : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setSubjectPage((p) => Math.min(totalSubjectPages, p + 1))}
                      disabled={subjectPage === totalSubjectPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      aria-label="Next subjects page"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 2: SELECTED SUBJECT MATERIALS PORTFOLIO */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Back Button & Subject Header Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => setSelectedSubjectCode(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-full backdrop-blur-md transition-all cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Back to All Subjects</span>
              </button>

              <Link
                href="/faculty/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-full shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload New Material</span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold font-mono text-white border border-white/20">
                    {currentSubject?.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                    {currentSubject?.branch} • Semester {currentSubject?.semester}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentSubject?.title}
                </h1>
              </div>

              {/* Quick Subject Stats */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                  <span className="block text-base font-bold text-white">{subjectMaterials.length}</span>
                  <span className="text-[10px] text-slate-300 font-medium">Uploaded</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-blue-500/15 border border-blue-500/30 backdrop-blur-md text-center">
                  <span className="block text-base font-bold text-blue-300">{currentSubject?.totalViews || 0}</span>
                  <span className="text-[10px] text-blue-200 font-medium">Views</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md text-center">
                  <span className="block text-base font-bold text-emerald-300">{currentSubject?.totalDownloads || 0}</span>
                  <span className="text-[10px] text-emerald-200 font-medium">Downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs, Resource Type Pills & Search for Materials */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs w-full sm:w-fit overflow-x-auto">
                {(["all", "published", "draft", "archived"] as const).map(tab => {
                  const count = tab === "all" ? subjectMaterials.length : subjectMaterials.filter(m => m.state === tab).length;
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
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

              <div className="relative sm:w-64">
                <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  placeholder="Search materials..."
                  value={materialSearchQuery}
                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-primary text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                />
                {materialSearchQuery && (
                  <button
                    onClick={() => setMaterialSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Resource Type Filter Pills (Useful for Theory vs Lab unified workspaces) */}
            {availableTypes.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-white/70 border border-slate-200/80 rounded-2xl w-full sm:w-fit overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Type:</span>
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    typeFilter === "all"
                      ? "bg-slate-900 text-white font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  All Types ({subjectMaterials.length})
                </button>
                {availableTypes.map((t) => {
                  const count = subjectMaterials.filter((m) => m.type === t).length;
                  const isSelected = typeFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{t}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Materials List Under This Subject */}
          <div className="space-y-4">
            {displayedMaterials.length > 0 ? (
              paginatedMaterials.map(m => (
                <div 
                  key={m.id} 
                  className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 hover:shadow-md transition-all group"
                >
                  {/* Material Header & Top Actions */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {m.type}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Section: {m.branch || "All"}
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
                      {m.state === "draft" && (
                        <button
                          onClick={() => handleStateToggle(m.id, "published")}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      {m.state === "published" && (
                        <button
                          onClick={() => handleStateToggle(m.id, "archived")}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          <span>Archive</span>
                        </button>
                      )}

                      {m.state === "archived" && (
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

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full border border-red-200 cursor-pointer transition-all"
                        title="Delete material"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attached Files List */}
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
                <h3 className="text-sm font-bold text-slate-900">
                  {materialSearchQuery || typeFilter !== "all" || activeTab !== "all"
                    ? "No Materials Found Matching Filters"
                    : `No Materials in ${activeTab} State`}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {materialSearchQuery || typeFilter !== "all" || activeTab !== "all"
                    ? "Try clearing your search query or switching resource type and state filters."
                    : `You haven't uploaded any study materials for ${currentSubject?.code} (${currentSubject?.title}) under this category yet.`}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                  {(materialSearchQuery || typeFilter !== "all" || activeTab !== "all") && (
                    <button
                      onClick={() => {
                        setMaterialSearchQuery("");
                        setTypeFilter("all");
                        setActiveTab("all");
                      }}
                      className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                  <Link
                    href="/faculty/upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Notes for {currentSubject?.code}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Level 2 Materials Pagination Toolbar */}
            {totalMaterialPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                <div className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-800">{(materialPage - 1) * MATERIALS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-semibold text-slate-800">{Math.min(materialPage * MATERIALS_PER_PAGE, displayedMaterials.length)}</span> of{" "}
                  <span className="font-semibold text-slate-800">{displayedMaterials.length}</span> materials
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMaterialPage((p) => Math.max(1, p - 1))}
                    disabled={materialPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    aria-label="Previous materials page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>
                  {Array.from({ length: totalMaterialPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setMaterialPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        materialPage === pageNum
                          ? "bg-primary text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={materialPage === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setMaterialPage((p) => Math.min(totalMaterialPages, p + 1))}
                    disabled={materialPage === totalMaterialPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    aria-label="Next materials page"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
      {/* LUXURIOUS SMOOTH SLIDE-OVER DRAWER FOR FACULTY */}
      {/* ========================================================================= */}
      {isDrawerMounted && inspectingMaterial && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with 500ms smooth cubic-bezier transition */}
          <div 
            onClick={closeInspectModal}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Right Slide-over Panel with 500ms smooth cubic-bezier slide */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12 z-50">
            <div 
              className={`w-screen max-w-2xl sm:max-w-3xl lg:max-w-4xl bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              
              {/* Fixed Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50 shrink-0">
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
                  title="Close Window"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Dedicated Scroll Container with onWheel & Direct Scroll Bridge */}
              <div 
                ref={scrollContainerRef}
                tabIndex={0}
                onWheel={handleScrollWheel}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 focus:outline-none"
                style={{
                  overscrollBehavior: "contain",
                  touchAction: "pan-y",
                }}
              >
                <StudentCohortProgressMatrix
                  materialId={inspectingMaterial.id}
                  materialTitle={inspectingMaterial.title}
                  branch={inspectingMaterial.branch || "CIC"}
                  semester={inspectingMaterial.semester || 3}
                  files={inspectingMaterial.material_files || []}
                  activityLogs={inspectingMaterial.engagementLogs || []}
                  uploaderName="You (Faculty)"
                  students={students}
                />
                <div className="h-20" />
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-normal">
                  Total Tracked Events: <strong className="text-slate-900 font-semibold">{inspectingMaterial.engagementLogs?.length || 0}</strong>
                </span>
                <button
                  type="button"
                  onClick={closeInspectModal}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
