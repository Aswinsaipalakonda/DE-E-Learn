"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  ChevronRight, 
  Layers, 
  User, 
  Download,
  Eye,
  Clock,
  Loader2,
  Code,
  Table,
  Presentation,
  FileArchive,
  Image as ImageIcon,
  FolderOpen,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X
} from "lucide-react";
import FilePreviewModal from "@/components/file-preview-modal";
import { trackDownloadAndGetUrl, trackPreviewAndGetUrl } from "@/app/student/materials/[id]/actions";
import { formatSubjectTitle } from "@/lib/utils";

interface MaterialFileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  storage_ref: string;
  version?: number;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
  tags?: string[];
  branch?: string;
  subject?: string;
  users?: {
    name?: string;
  };
  material_files?: MaterialFileItem[];
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  regulation?: string;
  description?: string;
}

interface SubjectMaterialsViewProps {
  subject: SubjectItem;
  materials: MaterialItem[];
  studentBranch: string;
  initialType?: string;
  initialQuery?: string;
  examLockout: {
    isLocked: boolean;
    examTitle?: string;
    startTimeText?: string;
    endTimeText?: string;
    message?: string;
  };
}

function getFileTypeDetails(fileName: string) {
  const ext = "." + (fileName.split(".").pop() || "").toLowerCase();
  if ([".py", ".java", ".c", ".cpp", ".h", ".cs", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".json", ".sql", ".ipynb", ".sh", ".xml", ".yaml", ".yml"].includes(ext)) {
    return {
      label: `${ext.slice(1).toUpperCase()} Code`,
      icon: <Code className="h-4 w-4 text-purple-600" />,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      iconBg: "bg-purple-100/70 text-purple-700",
    };
  }
  if ([".xls", ".xlsx", ".csv"].includes(ext)) {
    return {
      label: "Excel Spreadsheet",
      icon: <Table className="h-4 w-4 text-emerald-600" />,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100/70 text-emerald-700",
    };
  }
  if ([".ppt", ".pptx"].includes(ext)) {
    return {
      label: "PowerPoint Slides",
      icon: <Presentation className="h-4 w-4 text-amber-600" />,
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100/70 text-amber-700",
    };
  }
  if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
    return {
      label: "ZIP Archive",
      icon: <FileArchive className="h-4 w-4 text-indigo-600" />,
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconBg: "bg-indigo-100/70 text-indigo-700",
    };
  }
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return {
      label: "Image Asset",
      icon: <ImageIcon className="h-4 w-4 text-pink-600" />,
      badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
      iconBg: "bg-pink-100/70 text-pink-700",
    };
  }
  return {
    label: ext === ".doc" || ext === ".docx" ? "Word Document" : ext === ".txt" || ext === ".md" ? "Text File" : "PDF Document",
    icon: <FileText className="h-4 w-4 text-blue-600" />,
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100/70 text-blue-700",
  };
}

const CATEGORY_TABS = [
  { label: "All Materials", value: "All" },
  { label: "Lecture Notes", value: "Lecture Notes" },
  { label: "Lecture Slides", value: "Lecture Slides" },
  { label: "Assignments", value: "Assignments" },
  { label: "Lab Manuals", value: "Lab Manuals" },
  { label: "Question Banks", value: "Question Banks" },
];

function normalizeType(t: string) {
  const s = (t || "").toLowerCase().trim();
  if (s.includes("note")) return "notes";
  if (s.includes("slide")) return "slides";
  if (s.includes("assignment")) return "assignments";
  if (s.includes("lab") || s.includes("manual")) return "labs";
  if (s.includes("question")) return "questions";
  return s;
}

export default function SubjectMaterialsView({
  subject,
  materials,
  studentBranch,
  initialType = "All",
  initialQuery = "",
  examLockout,
}: SubjectMaterialsViewProps) {
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // File Preview Modal State
  const [previewFile, setPreviewFile] = useState<{
    fileName: string;
    fileUrl: string | null;
    mimeType: string;
    storageRef: string;
    materialId: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  // Filter materials based on selected category and search query
  const filteredMaterials = useMemo(() => {
    let result = materials;

    if (selectedType && selectedType !== "All") {
      const target = normalizeType(selectedType);
      result = result.filter((m) => normalizeType(m.type) === target);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => {
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesType = m.type.toLowerCase().includes(q);
        const matchesTags = m.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesFiles = m.material_files?.some((f) => f.file_name.toLowerCase().includes(q));
        return matchesTitle || matchesType || matchesTags || matchesFiles;
      });
    }

    return result;
  }, [materials, selectedType, searchQuery]);

  // Aggregate files count
  const totalFilesCount = useMemo(() => {
    return materials.reduce((acc, m) => acc + (m.material_files?.length || 0), 0);
  }, [materials]);

  // Handle in-browser Preview with engagement logging
  const handlePreview = async (file: MaterialFileItem, materialId: string) => {
    const previewUrl = `/api/materials/file/${file.storage_ref}?filename=${encodeURIComponent(file.file_name)}`;
    setPreviewFile({
      fileName: file.file_name,
      fileUrl: previewUrl,
      mimeType: file.mime_type,
      storageRef: file.storage_ref,
      materialId,
    });
    setIsPreviewOpen(true);

    // Asynchronously log preview activity
    try {
      await trackPreviewAndGetUrl(file.id, materialId, file.storage_ref, file.file_name);
    } catch {}
  };

  // Handle Direct Download with exact file format retention
  const handleDownload = async (file: MaterialFileItem, materialId: string) => {
    setDownloadingRef(file.storage_ref);
    try {
      // Trigger download tracking
      await trackDownloadAndGetUrl(file.id, materialId, file.storage_ref, file.file_name);

      const downloadUrl = `/api/materials/file/${file.storage_ref}?download=1&filename=${encodeURIComponent(file.file_name)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.file_name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    <div className="space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* COMPACT & SLEEK MOBILE-FIRST SUBJECT BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-3 sm:space-y-4">
        {/* Top Actions Row: Back Button & Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/student/subjects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Subjects</span>
          </Link>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold font-mono">
              {subject.code}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
              Section {studentBranch} • Sem {subject.semester || 3}
            </span>
          </div>
        </div>

        {/* Subject Title & Details */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {formatSubjectTitle(subject.title)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Curated syllabus materials uploaded by faculty specifically for{" "}
            <strong className="font-semibold text-slate-800">Section {studentBranch}</strong>.
          </p>
        </div>

        {/* Quick Stats Pill Badges */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>{materials.length} {materials.length === 1 ? "Unit Published" : "Units Published"}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>{totalFilesCount} {totalFilesCount === 1 ? "Study File Attached" : "Study Files Attached"}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">
            {subject.regulation || "R23"} Regulation
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR (FULLY RESPONSIVE) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search notes by unit name, topic, or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:border-primary text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x -mx-1 px-1">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.value === "All"
              ? materials.length
              : materials.filter((m) => normalizeType(m.type) === normalizeType(tab.value)).length;

            const isSelected = selectedType === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 snap-start ${
                  isSelected
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs font-medium"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXAM LOCKOUT BANNER (IF ACTIVE) */}
      {/* ========================================================================= */}
      {examLockout.isLocked ? (
        <div className="bg-amber-50/70 p-5 sm:p-7 rounded-3xl border border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950">
                {examLockout.examTitle || "Examination Lockout Active"}
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Session Hours: {examLockout.startTimeText} – {examLockout.endTimeText} (IST)
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-normal">
            {examLockout.message || `Course materials for Semester ${subject.semester || 3} are temporarily locked during the scheduled evaluation window.`}
          </p>
          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
              Locked for Examination Mode
            </span>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MATERIALS CARDS LIST (RICH, COMPLETE & MOBILE-READY) */
        /* ========================================================================= */
        <div className="space-y-4">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((mat) => {
              const facultyName = mat.users?.name || "Faculty Incharge";
              const files = mat.material_files || [];

              return (
                <div
                  key={mat.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all overflow-hidden p-4 sm:p-6 space-y-4 group"
                >
                  {/* Card Header: Type, Faculty, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold">
                        {mat.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] sm:text-xs font-medium text-slate-700">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{facultyName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-normal">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(mat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </span>
                    </div>

                    {/* Quick Link to Dedicated Reading Workspace */}
                    <Link
                      href={`/student/materials/${mat.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <span>Study Workspace</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Material Title */}
                  <div className="space-y-1">
                    <Link href={`/student/materials/${mat.id}`} className="block group-hover:text-primary transition-colors">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {mat.title}
                      </h2>
                    </Link>

                    {mat.tags && mat.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {mat.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-normal">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attached Study Files Section (Interactive Direct Preview & Download) */}
                  <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Attached Documents ({files.length}):
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tap preview or download to inspect
                      </span>
                    </div>

                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files
                          .filter((f, idx, self) => self.findIndex((t) => t.file_name === f.file_name) === idx)
                          .map((file) => {
                            const fileType = getFileTypeDetails(file.file_name);
                            const isDownloading = downloadingRef === file.storage_ref;

                            return (
                              <div
                                key={file.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 gap-2.5 hover:bg-slate-100/90 transition-all"
                              >
                                {/* File Info */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${fileType.badgeBg}`}>
                                    {fileType.icon}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                                      {file.file_name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal">
                                      <span>{formatSize(file.size)}</span>
                                      <span>•</span>
                                      <span className="truncate">{fileType.label}</span>
                                      {file.version && (
                                        <>
                                          <span>•</span>
                                          <span className="font-semibold text-blue-700">v{file.version}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Direct Mobile Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handlePreview(file, mat.id)}
                                    className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  >
                                    <Eye className="h-3 w-3 text-blue-600" />
                                    <span>Preview</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isDownloading}
                                    onClick={() => handleDownload(file, mat.id)}
                                    className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                  >
                                    {isDownloading ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Download className="h-3 w-3 text-white" />
                                    )}
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 text-xs text-center border border-dashed border-slate-200">
                        No files attached yet to this unit.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FolderOpen className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {searchQuery || selectedType !== "All"
                  ? "No Materials Found Matching Filters"
                  : `No Materials Published Yet for Section ${studentBranch}`}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                {searchQuery || selectedType !== "All"
                  ? "Try adjusting your search keywords or switching category tabs."
                  : "Your subject faculty member has not published syllabus notes or lab manuals for this section yet."}
              </p>
              {(searchQuery || selectedType !== "All") && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("All");
                    }}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Render File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileName={previewFile.fileName}
          fileUrl={previewFile.fileUrl}
          mimeType={previewFile.mimeType}
          onDownload={() => {
            const mockItem: MaterialFileItem = {
              id: previewFile.fileName,
              file_name: previewFile.fileName,
              size: 0,
              mime_type: previewFile.mimeType,
              storage_ref: previewFile.storageRef,
            };
            handleDownload(mockItem, previewFile.materialId);
          }}
          isDownloading={downloadingRef === previewFile.storageRef}
        />
      )}
    </div>
  );
}
