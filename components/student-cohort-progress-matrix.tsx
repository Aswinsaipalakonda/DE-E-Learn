"use client";

import { useState, useMemo } from "react";
import { 
  Eye, 
  Download, 
  FileText, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MinusCircle, 
  X, 
  ChevronRight,
  Sparkles,
  Users,
  Layers,
  GraduationCap
} from "lucide-react";

export interface FileInfo {
  id: string;
  file_name: string;
  size?: number;
}

export interface ActivityLogItem {
  id: string;
  studentName: string;
  rollNumber: string;
  email: string;
  branch: string;
  semester: number;
  section: string;
  action: "view" | "download";
  fileName?: string;
  actionDetail?: string;
  timestamp: string;
}

export interface StudentCohortProgressMatrixProps {
  materialId: string;
  materialTitle: string;
  branch: string;
  semester: number;
  files: FileInfo[];
  activityLogs: ActivityLogItem[];
  uploaderName?: string;
}

interface StudentFileStatus {
  fileId: string;
  fileName: string;
  viewed: boolean;
  viewCount: number;
  lastViewedAt?: string;
  downloaded: boolean;
  downloadCount: number;
  lastDownloadedAt?: string;
}

interface StudentProgressRecord {
  rollNumber: string;
  studentName: string;
  email: string;
  branch: string;
  semester: number;
  section: string;
  overallStatus: "downloaded" | "viewed" | "not_opened";
  selectedFileStatus: "downloaded" | "viewed" | "not_opened";
  files: StudentFileStatus[];
  totalViews: number;
  totalDownloads: number;
  lastActivityAt?: string;
}

// Generate complete cohort of roll numbers
function generateCohortRolls(branch: string, semester: number): { roll: string; name: string; section: string }[] {
  const cohort: { roll: string; name: string; section: string }[] = [];
  const b = (branch || "CIC").toUpperCase();

  // Known named students
  const knownStudents: Record<string, string> = {
    "23331A4701": "Rahul Varma Datla",
    "23331A4745": "Aswin Sai Palakonda",
    "23331A4718": "Sneha Reddy K.",
    "23331A4722": "Sai Kiran V.",
    "23331A4715": "B. Bhavana",
    "23331A0502": "Divya Sri Madhuri",
    "23331A0544": "K. Karthik Subhash",
    "23331A0589": "T. Tarun Teja",
    "23331A4201": "M. Naveen Kumar",
    "23331A4233": "P. Harika",
  };

  if (b === "CIC") {
    // 71 Students (23331A4701 to 23331A4771)
    for (let i = 1; i <= 71; i++) {
      const rollNum = `23331A47${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 36 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else if (b === "CSD") {
    // 68 Students
    for (let i = 1; i <= 68; i++) {
      const rollNum = `23331A05${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 34 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else if (b === "CSM") {
    // 65 Students
    for (let i = 1; i <= 65; i++) {
      const rollNum = `23331A42${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 33 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else {
    // Default 60 Students
    for (let i = 1; i <= 60; i++) {
      const rollNum = `23331A00${i < 10 ? "0" + i : i}`;
      cohort.push({ roll: rollNum, name: `Student ${rollNum.slice(-4)}`, section: "A" });
    }
  }

  return cohort;
}

export default function StudentCohortProgressMatrix({
  materialId,
  materialTitle,
  branch,
  semester,
  files,
  activityLogs,
  uploaderName,
}: StudentCohortProgressMatrixProps) {
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>("ALL"); // "ALL" or file_name
  const [statusFilter, setStatusFilter] = useState<"ALL" | "downloaded" | "viewed" | "not_opened">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectingStudent, setInspectingStudent] = useState<StudentProgressRecord | null>(null);

  // Material Files normalization
  const normalizedFiles = useMemo(() => {
    if (files && files.length > 0) return files;
    return [
      { id: "file-default-1", file_name: "Course_Study_Material.pdf" },
    ];
  }, [files]);

  // Compute Full Cohort Records with per-file status
  const cohortRecords: StudentProgressRecord[] = useMemo(() => {
    const rawCohort = generateCohortRolls(branch, semester);

    return rawCohort.map((c) => {
      // Find all activity events matching this student
      const studentEvents = activityLogs.filter(
        (log) =>
          log.rollNumber?.toUpperCase() === c.roll.toUpperCase() ||
          log.email?.toLowerCase().includes(c.roll.toLowerCase())
      );

      // Compute status for each file
      const fileStatuses: StudentFileStatus[] = normalizedFiles.map((f) => {
        const fileEvents = studentEvents.filter(
          (e) =>
            (e.fileName && e.fileName.toLowerCase() === f.file_name.toLowerCase()) ||
            (!e.fileName && e.action === "view") // Page view applies generally
        );

        const viewEvents = fileEvents.filter((e) => e.action === "view");
        const downloadEvents = fileEvents.filter((e) => e.action === "download");

        const lastView = viewEvents.length > 0 ? viewEvents[0].timestamp : undefined;
        const lastDownload = downloadEvents.length > 0 ? downloadEvents[0].timestamp : undefined;

        return {
          fileId: f.id,
          fileName: f.file_name,
          viewed: viewEvents.length > 0,
          viewCount: viewEvents.length,
          lastViewedAt: lastView,
          downloaded: downloadEvents.length > 0,
          downloadCount: downloadEvents.length,
          lastDownloadedAt: lastDownload,
        };
      });

      const hasAnyDownload = fileStatuses.some((fs) => fs.downloaded);
      const hasAnyView = fileStatuses.some((fs) => fs.viewed) || studentEvents.length > 0;

      let overallStatus: "downloaded" | "viewed" | "not_opened" = "not_opened";
      if (hasAnyDownload) {
        overallStatus = "downloaded";
      } else if (hasAnyView) {
        overallStatus = "viewed";
      }

      // Status specifically for currently selected file
      let selectedFileStatus: "downloaded" | "viewed" | "not_opened" = overallStatus;
      if (selectedFileFilter !== "ALL") {
        const targetFs = fileStatuses.find((fs) => fs.fileName === selectedFileFilter);
        if (targetFs) {
          if (targetFs.downloaded) selectedFileStatus = "downloaded";
          else if (targetFs.viewed) selectedFileStatus = "viewed";
          else selectedFileStatus = "not_opened";
        }
      }

      const totalViews = fileStatuses.reduce((acc, curr) => acc + curr.viewCount, 0);
      const totalDownloads = fileStatuses.reduce((acc, curr) => acc + curr.downloadCount, 0);
      const lastActivityAt = studentEvents.length > 0 ? studentEvents[0].timestamp : undefined;

      return {
        rollNumber: c.roll,
        studentName: c.name,
        email: `${c.roll.toLowerCase()}@mvgrce.edu.in`,
        branch: branch || "CIC",
        semester: semester || 3,
        section: c.section,
        overallStatus,
        selectedFileStatus,
        files: fileStatuses,
        totalViews,
        totalDownloads,
        lastActivityAt,
      };
    });
  }, [branch, semester, activityLogs, normalizedFiles, selectedFileFilter]);

  // Aggregate Metrics
  const totalCount = cohortRecords.length;
  const downloadedCount = cohortRecords.filter((r) => r.selectedFileStatus === "downloaded").length;
  const viewedCount = cohortRecords.filter((r) => r.selectedFileStatus === "viewed").length;
  const notOpenedCount = cohortRecords.filter((r) => r.selectedFileStatus === "not_opened").length;

  const downloadPct = Math.round((downloadedCount / totalCount) * 100) || 0;
  const viewPct = Math.round((viewedCount / totalCount) * 100) || 0;
  const notOpenedPct = 100 - downloadPct - viewPct;

  // Filtered Roster for Grid Display
  const filteredCohort = useMemo(() => {
    return cohortRecords.filter((r) => {
      // Status filter
      if (statusFilter !== "ALL" && r.selectedFileStatus !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rollMatch = r.rollNumber.toLowerCase().includes(q);
        const nameMatch = r.studentName.toLowerCase().includes(q);
        return rollMatch || nameMatch;
      }

      return true;
    });
  }, [cohortRecords, statusFilter, searchQuery]);

  // Export Matrix to CSV
  const handleExportMatrixCSV = () => {
    const headers = [
      "Roll Number",
      "Student Name",
      "Official Email",
      "Branch",
      "Semester",
      "Section",
      "Overall Status",
      ...normalizedFiles.flatMap((f) => [`${f.file_name} (Viewed)`, `${f.file_name} (Downloaded)`]),
      "Total Views",
      "Total Downloads",
      "Last Activity Timestamp",
    ];

    const rows = cohortRecords.map((r) => [
      `"${r.rollNumber}"`,
      `"${r.studentName}"`,
      `"${r.email}"`,
      `"${r.branch}"`,
      r.semester,
      `"${r.section}"`,
      r.overallStatus.toUpperCase(),
      ...r.files.flatMap((f) => [
        f.viewed ? `YES (${f.viewCount})` : "NO",
        f.downloaded ? `YES (${f.downloadCount})` : "NO",
      ]),
      r.totalViews,
      r.totalDownloads,
      r.lastActivityAt ? `"${new Date(r.lastActivityAt).toLocaleString()}"` : '"N/A"',
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${materialTitle.slice(0, 25).replace(/[^a-zA-Z0-9]/g, "_")}_cohort_progress_${branch}_Sem${semester}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. MATERIAL & COHORT PROGRESS HEADER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                {branch} • Semester {semester} Cohort ({totalCount} Enrolled)
              </span>
              {uploaderName && (
                <span className="text-xs text-slate-500 font-normal">
                  Faculty: <strong className="text-slate-800 font-semibold">{uploaderName}</strong>
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {materialTitle}
            </h3>
          </div>

          <button
            onClick={handleExportMatrixCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full shadow-2xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {/* Multi-Segment Cohort Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">Cohort Completion Progress</span>
            <span className="font-bold text-slate-900">{downloadPct}% Downloaded</span>
          </div>

          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            {downloadPct > 0 && (
              <div 
                style={{ width: `${downloadPct}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`Downloaded: ${downloadedCount} students (${downloadPct}%)`}
              />
            )}
            {viewPct > 0 && (
              <div 
                style={{ width: `${viewPct}%` }} 
                className="bg-amber-500 h-full transition-all duration-500" 
                title={`Viewed Only: ${viewedCount} students (${viewPct}%)`}
              />
            )}
            {notOpenedPct > 0 && (
              <div 
                style={{ width: `${notOpenedPct}%` }} 
                className="bg-rose-400 h-full transition-all duration-500 opacity-80" 
                title={`Not Opened: ${notOpenedCount} students (${notOpenedPct}%)`}
              />
            )}
          </div>

          {/* Legend / Counters */}
          <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-emerald-800">Downloaded ({downloadedCount})</span>
              <span className="text-slate-400 font-normal">({downloadPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-semibold text-amber-800">Viewed Only ({viewedCount})</span>
              <span className="text-slate-400 font-normal">({viewPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="font-semibold text-rose-800">Not Opened ({notOpenedCount})</span>
              <span className="text-slate-400 font-normal">({notOpenedPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILE SELECTOR TABS */}
      {/* ========================================================================= */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Target Document to Audit:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedFileFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFileFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-normal"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Files Combined ({normalizedFiles.length})</span>
          </button>

          {normalizedFiles.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFileFilter(f.file_name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFileFilter === f.file_name
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-normal"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{f.file_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STATUS FILTER PILLS & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("downloaded")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "downloaded"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Downloaded ({downloadedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("viewed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "viewed"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Viewed ({viewedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("not_opened")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "not_opened"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>Not Opened ({notOpenedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search roll (e.g. 4701, 4745) or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STUDENT ROLL NUMBER CARDS MATRIX (RED / ORANGE / GREEN) */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing {filteredCohort.length} of {totalCount} Students in Cohort</span>
          <span className="text-[11px] text-slate-400">Click any roll card to inspect per-file logs</span>
        </div>

        {filteredCohort.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[420px] overflow-y-auto p-1.5 border border-slate-100 rounded-2xl bg-slate-50/50">
            {filteredCohort.map((student) => {
              const isDownloaded = student.selectedFileStatus === "downloaded";
              const isViewed = student.selectedFileStatus === "viewed";
              const isNotOpened = student.selectedFileStatus === "not_opened";

              let colorClasses = "bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-300";
              let statusDot = "bg-rose-500";
              let statusLabel = "Not Opened";

              if (isDownloaded) {
                colorClasses = "bg-emerald-50/90 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400 shadow-2xs";
                statusDot = "bg-emerald-600";
                statusLabel = "Downloaded";
              } else if (isViewed) {
                colorClasses = "bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400 shadow-2xs";
                statusDot = "bg-amber-500";
                statusLabel = "Viewed Only";
              }

              return (
                <button
                  key={student.rollNumber}
                  onClick={() => setInspectingStudent(student)}
                  title={`${student.rollNumber} - ${student.studentName} (${statusLabel})`}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 group relative ${colorClasses}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      {student.rollNumber.slice(-4)}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                  </div>

                  <span className="text-[11px] font-semibold truncate block w-full leading-none">
                    {student.rollNumber}
                  </span>

                  <span className="text-[9px] truncate opacity-75 block w-full">
                    {student.studentName.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-500 font-normal">
              No students match the current filter selection &quot;{statusFilter}&quot;.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. STUDENT DETAILED POPUP / MODAL INSPECTOR */}
      {/* ========================================================================= */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden space-y-5 p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                    {inspectingStudent.rollNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    inspectingStudent.overallStatus === "downloaded"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : inspectingStudent.overallStatus === "viewed"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}>
                    {inspectingStudent.overallStatus === "downloaded"
                      ? "Downloaded"
                      : inspectingStudent.overallStatus === "viewed"
                      ? "Viewed Only"
                      : "Not Opened"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {inspectingStudent.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  {inspectingStudent.email} • {inspectingStudent.branch} Semester {inspectingStudent.semester} (Sec {inspectingStudent.section})
                </p>
              </div>

              <button
                onClick={() => setInspectingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Per-File Access Audit Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Per-File Progress & Activity Audit:
              </span>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {inspectingStudent.files.map((file) => (
                  <div
                    key={file.fileId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {file.fileName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                      {/* View Status */}
                      <div className="flex items-center gap-1.5">
                        {file.viewed ? (
                          <div className="flex items-center gap-1 text-blue-700 font-medium">
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                            <span>Viewed ({file.viewCount}x)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 font-normal">
                            <MinusCircle className="h-3.5 w-3.5" />
                            <span>Not Viewed</span>
                          </div>
                        )}
                      </div>

                      {/* Download Status */}
                      <div className="flex items-center gap-1.5">
                        {file.downloaded ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Downloaded ({file.downloadCount}x)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 font-normal">
                            <MinusCircle className="h-3.5 w-3.5" />
                            <span>Not Downloaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(file.lastViewedAt || file.lastDownloadedAt) && (
                      <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          Last active: {new Date(file.lastDownloadedAt || file.lastViewedAt || "").toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full cursor-pointer shadow-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
