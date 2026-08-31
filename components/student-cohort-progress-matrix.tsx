"use client";

import { useState, useMemo, useEffect } from "react";
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
  GraduationCap,
  LayoutGrid,
  ListFilter,
  Check
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
  hasDownloaded: boolean;
  hasViewed: boolean;
  isPending: boolean;
  files: StudentFileStatus[];
  totalViews: number;
  totalDownloads: number;
  lastActivityAt?: string;
}

// Resilient file name normalizer to prevent whitespace / comma mismatch
function normalizeFileName(name?: string): string {
  if (!name) return "";
  try {
    return decodeURIComponent(name)
      .replace(/[,\s_\-.]+/g, " ")
      .trim()
      .toLowerCase();
  } catch {
    return (name || "").replace(/[,\s_\-.]+/g, " ").trim().toLowerCase();
  }
}

// Generate complete cohort of 71 roll numbers for CIC Semester 3
function generateCohortRolls(branch: string, semester: number): { roll: string; name: string; section: string }[] {
  const cohort: { roll: string; name: string; section: string }[] = [];
  const b = (branch || "CIC").toUpperCase();

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
    for (let i = 1; i <= 71; i++) {
      const rollNum = `23331A47${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 36 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else if (b === "CSD") {
    for (let i = 1; i <= 68; i++) {
      const rollNum = `23331A05${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 34 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else if (b === "CSM") {
    for (let i = 1; i <= 65; i++) {
      const rollNum = `23331A42${i < 10 ? "0" + i : i}`;
      const name = knownStudents[rollNum] || `Student ${rollNum.slice(-4)}`;
      const section = i <= 33 ? "A" : "B";
      cohort.push({ roll: rollNum, name, section });
    }
  } else {
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
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "downloaded" | "viewed" | "pending">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [inspectingStudent, setInspectingStudent] = useState<StudentProgressRecord | null>(null);

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
      const studentEvents = activityLogs.filter((log) => {
        const r1 = (log.rollNumber || "").toUpperCase();
        const r2 = c.roll.toUpperCase();
        const emailMatch = (log.email || "").toLowerCase().includes(c.roll.toLowerCase());
        const nameMatch = (log.studentName || "").toLowerCase().includes(c.roll.toLowerCase());
        return r1 === r2 || emailMatch || nameMatch;
      });

      // Compute status for each file
      const fileStatuses: StudentFileStatus[] = normalizedFiles.map((f) => {
        const normTarget = normalizeFileName(f.file_name);

        const fileEvents = studentEvents.filter((e) => {
          if (!e.fileName) return e.action === "view";
          const normEv = normalizeFileName(e.fileName);
          return normEv === normTarget || normEv.includes(normTarget) || normTarget.includes(normEv);
        });

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

      let hasDownloaded = false;
      let hasViewed = false;

      if (selectedFileFilter === "ALL") {
        hasDownloaded = fileStatuses.some((fs) => fs.downloaded);
        hasViewed = fileStatuses.some((fs) => fs.viewed) || studentEvents.some((e) => e.action === "view");
      } else {
        const normFilter = normalizeFileName(selectedFileFilter);
        const targetFs = fileStatuses.find((fs) => normalizeFileName(fs.fileName) === normFilter);
        hasDownloaded = !!targetFs?.downloaded;
        hasViewed = !!targetFs?.viewed;
      }

      const isPending = !hasDownloaded && !hasViewed;
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
        hasDownloaded,
        hasViewed,
        isPending,
        files: fileStatuses,
        totalViews,
        totalDownloads,
        lastActivityAt,
      };
    });
  }, [branch, semester, activityLogs, normalizedFiles, selectedFileFilter]);

  const totalCount = cohortRecords.length;
  // Accurate Counts: Anyone who downloaded is counted in Downloaded; Anyone who viewed is counted in Viewed
  const downloadedCount = cohortRecords.filter((r) => r.hasDownloaded).length;
  const viewedCount = cohortRecords.filter((r) => r.hasViewed).length;
  const pendingCount = cohortRecords.filter((r) => r.isPending).length;

  const downloadPct = Math.round((downloadedCount / totalCount) * 100) || 0;
  const viewPct = Math.round((viewedCount / totalCount) * 100) || 0;
  const pendingPct = Math.max(0, 100 - downloadPct);

  const filteredCohort = useMemo(() => {
    return cohortRecords.filter((r) => {
      if (statusFilter === "downloaded" && !r.hasDownloaded) return false;
      if (statusFilter === "viewed" && !r.hasViewed) return false;
      if (statusFilter === "pending" && !r.isPending) return false;

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
      "Downloaded Any",
      "Viewed Any",
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
      r.hasDownloaded ? "YES" : "NO",
      r.hasViewed ? "YES" : "NO",
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
    <div className="space-y-6 w-full">
      {/* ========================================================================= */}
      {/* 1. HERO COHORT ANALYTICS CARD */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
                {branch} • Semester {semester}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                {totalCount} Enrolled Students
              </span>
              {uploaderName && (
                <span className="text-xs text-slate-300 font-normal">
                  Faculty: <strong className="text-white font-semibold">{uploaderName}</strong>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {materialTitle}
            </h2>
          </div>

          <button
            onClick={handleExportMatrixCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-full backdrop-blur-md shadow-sm cursor-pointer transition-all self-start sm:self-auto"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Downloaded */}
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
              <span>Downloaded & Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{downloadedCount}</span>
              <span className="text-xs text-emerald-300 font-medium">({downloadPct}% of class)</span>
            </div>
          </div>

          {/* Viewed */}
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
              <span>Viewed Documents</span>
              <Eye className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{viewedCount}</span>
              <span className="text-xs text-amber-300 font-medium">({viewPct}% of class)</span>
            </div>
          </div>

          {/* Pending / Not Opened */}
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-rose-300 text-xs font-semibold">
              <span>Pending / Not Opened</span>
              <MinusCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">{pendingCount}</span>
              <span className="text-xs text-rose-300 font-medium">({Math.round((pendingCount/totalCount)*100)}% of class)</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
            {downloadPct > 0 && (
              <div 
                style={{ width: `${downloadPct}%` }} 
                className="bg-emerald-400 h-full transition-all duration-500" 
                title={`Downloaded: ${downloadedCount}`}
              />
            )}
            {viewPct > downloadPct && (
              <div 
                style={{ width: `${viewPct - downloadPct}%` }} 
                className="bg-amber-400 h-full transition-all duration-500" 
                title={`Viewed Only: ${viewedCount - downloadedCount}`}
              />
            )}
            {pendingPct > 0 && (
              <div 
                style={{ width: `${pendingPct}%` }} 
                className="bg-rose-400/80 h-full transition-all duration-500" 
                title={`Pending: ${pendingCount}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARGET DOCUMENT SELECTOR */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Filter Progress by Specific Document:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedFileFilter("ALL")}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              selectedFileFilter === "ALL"
                ? "bg-primary text-white shadow-md"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium shadow-2xs"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>All Study Files Combined ({normalizedFiles.length})</span>
          </button>

          {normalizedFiles.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFileFilter(f.file_name)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedFileFilter === f.file_name
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium shadow-2xs"
              }`}
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="truncate max-w-[220px]">{f.file_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTROLS BAR: STATUS TABS, SEARCH, VIEW MODE */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("downloaded")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "downloaded"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Downloaded ({downloadedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("viewed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "viewed"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>Viewed ({viewedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>Pending ({pendingCount})</span>
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search roll (4701) or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-primary text-slate-900 placeholder:text-slate-400 font-normal transition-all"
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

          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STUDENT ROLL CARDS MATRIX (GRID VIEW) */}
      {/* ========================================================================= */}
      {viewMode === "grid" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Showing {filteredCohort.length} of {totalCount} Students</span>
            <span className="text-[11px] text-slate-400">Click any card to inspect file breakdown</span>
          </div>

          {filteredCohort.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 border border-slate-200/80 rounded-3xl bg-slate-50/50">
              {filteredCohort.map((student) => {
                const isDownloaded = student.hasDownloaded;
                const isViewed = student.hasViewed;

                let borderClasses = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700";
                let badgeClasses = "bg-slate-100 text-slate-600";
                let statusLabel = "Pending";
                let StatusIcon = MinusCircle;

                if (isDownloaded) {
                  borderClasses = "border-emerald-300 bg-emerald-50/80 hover:border-emerald-400 hover:bg-emerald-100/80 text-emerald-950 shadow-xs";
                  badgeClasses = "bg-emerald-600 text-white font-bold";
                  statusLabel = "Downloaded";
                  StatusIcon = CheckCircle2;
                } else if (isViewed) {
                  borderClasses = "border-amber-300 bg-amber-50/80 hover:border-amber-400 hover:bg-amber-100/80 text-amber-950 shadow-xs";
                  badgeClasses = "bg-amber-500 text-white font-bold";
                  statusLabel = "Viewed";
                  StatusIcon = Eye;
                }

                return (
                  <button
                    key={student.rollNumber}
                    onClick={() => setInspectingStudent(student)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative shadow-2xs hover:scale-[1.02] ${borderClasses}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold tracking-tight">
                        {student.rollNumber}
                      </span>
                      <StatusIcon className="h-4 w-4 shrink-0" />
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold truncate block w-full">
                        {student.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Sec {student.section}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-slate-200/50">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${badgeClasses}`}>
                        {statusLabel}
                      </span>
                      <ChevronRight className="h-3 w-3 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-500 font-normal">
                No students match &quot;{statusFilter}&quot; in the cohort.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 5. TABLE VIEW */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-6 pr-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class Section</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">Downloads</th>
                  <th className="py-3 pl-4 pr-6 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCohort.map((student) => {
                  const isDownloaded = student.hasDownloaded;
                  const isViewed = student.hasViewed;

                  return (
                    <tr key={student.rollNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-6 pr-4 font-bold text-slate-900">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {student.studentName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {student.branch} Sem {student.semester} - Sec {student.section}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isDownloaded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Downloaded</span>
                          </span>
                        ) : isViewed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                            <Eye className="h-3 w-3" />
                            <span>Viewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-normal">
                            <MinusCircle className="h-3 w-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">
                        {student.totalViews}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {student.totalDownloads}
                      </td>
                      <td className="py-3 pl-4 pr-6 text-right">
                        <button
                          onClick={() => setInspectingStudent(student)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-full text-xs cursor-pointer transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. STUDENT DETAILED PER-FILE AUDIT MODAL */}
      {/* ========================================================================= */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden space-y-5 p-6 sm:p-7 my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                    {inspectingStudent.rollNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    inspectingStudent.hasDownloaded
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : inspectingStudent.hasViewed
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {inspectingStudent.hasDownloaded
                      ? "Downloaded Files"
                      : inspectingStudent.hasViewed
                      ? "Viewed Material"
                      : "Pending"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {inspectingStudent.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  {inspectingStudent.email} • {inspectingStudent.branch} Sem {inspectingStudent.semester} (Sec {inspectingStudent.section})
                </p>
              </div>

              <button
                onClick={() => setInspectingStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Per-File Access Audit */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Per-File Access & Download Breakdown:
              </span>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
                {inspectingStudent.files.map((file) => (
                  <div
                    key={file.fileId}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {file.fileName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                      {/* View Status */}
                      <div>
                        {file.viewed ? (
                          <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span>Viewed ({file.viewCount}x)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-normal">
                            <MinusCircle className="h-4 w-4" />
                            <span>Not Viewed</span>
                          </div>
                        )}
                      </div>

                      {/* Download Status */}
                      <div>
                        {file.downloaded ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Downloaded ({file.downloadCount}x)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-normal">
                            <MinusCircle className="h-4 w-4" />
                            <span>Not Downloaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(file.lastViewedAt || file.lastDownloadedAt) && (
                      <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1.5">
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

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full cursor-pointer shadow-xs"
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
