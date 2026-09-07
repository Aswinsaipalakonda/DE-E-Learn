"use client";

import { useState, useMemo } from "react";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "./actions";
import { 
  createExamScheduleAction, 
  toggleExamScheduleAction, 
  deleteExamScheduleAction 
} from "./exam-actions";
import { ExamSchedule } from "@/utils/exam-lockout";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Loader2, 
  Tag, 
  Search, 
  Pencil, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Bell, 
  Layers, 
  Info,
  Lock,
  Unlock,
  CalendarDays,
  Check,
  ShieldAlert,
  BookOpen
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  scope_branch: string | null;
  scope_semester: number | null;
  priority: "normal" | "important";
  start_time: string;
  end_time: string;
  created_at: string;
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  regulation?: string;
}

interface AnnouncementsClientProps {
  initialAnnouncements: AnnouncementItem[];
  initialExamSchedules?: ExamSchedule[];
  branches: { code: string; name: string }[];
  semesters: { number: number; name: string }[];
  subjects?: SubjectItem[];
}

export default function AnnouncementsClient({
  initialAnnouncements,
  initialExamSchedules = [],
  branches,
  semesters,
  subjects = [],
}: AnnouncementsClientProps) {
  // Main Section Toggle
  const [mainSection, setMainSection] = useState<"broadcasts" | "exams">("broadcasts");

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "important" | "expired">("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Slide-over Right Drawer Animation State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  // Delete Announcement Modal State
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Announcement Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scopeBranch, setScopeBranch] = useState("ALL");
  const [scopeSemester, setScopeSemester] = useState("0");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // EXAM LOCKOUT SCHEDULES STATE
  // ==========================================
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(initialExamSchedules);
  const [isExamModalMounted, setIsExamModalMounted] = useState(false);
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examSemesters, setExamSemesters] = useState<number[]>([1, 3, 5]);
  const [examBranch, setExamBranch] = useState("ALL");
  const [examSubjectMode, setExamSubjectMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [examSelectedSubjects, setExamSelectedSubjects] = useState<string[]>([]);
  const [examStartDate, setExamStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [examEndDate, setExamEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [examIsDailyRecurring, setExamIsDailyRecurring] = useState(true);
  const [examDailyStartTime, setExamDailyStartTime] = useState("10:00");
  const [examDailyEndTime, setExamDailyEndTime] = useState("11:30");
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [deletingExamSchedule, setDeletingExamSchedule] = useState<ExamSchedule | null>(null);
  const [isDeletingExam, setIsDeletingExam] = useState(false);
  const [togglingExamId, setTogglingExamId] = useState<string | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", toastTitle: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title: toastTitle, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const now = new Date();

  // Announcement Stats
  const stats = useMemo(() => {
    const total = announcements.length;
    const active = announcements.filter((a) => {
      const start = new Date(a.start_time);
      const end = new Date(a.end_time);
      return now >= start && now <= end;
    }).length;
    const important = announcements.filter((a) => a.priority === "important").length;
    return { total, active, important };
  }, [announcements, now]);

  // Exam Schedules Stats
  const examStats = useMemo(() => {
    const total = examSchedules.length;
    const activeCount = examSchedules.filter((s) => s.active).length;
    return { total, activeCount };
  }, [examSchedules]);

  // Available subjects matching selected semesters & branch
  const availableSubjectsForExams = useMemo(() => {
    const map = new Map<string, SubjectItem>();
    subjects.forEach((s) => {
      if (examSemesters.includes(s.semester)) {
        if (examBranch === "ALL" || s.branch === examBranch) {
          if (!map.has(s.code)) {
            map.set(s.code, s);
          }
        }
      }
    });
    return Array.from(map.values());
  }, [subjects, examSemesters, examBranch]);

  // Open Drawer in Create Mode
  const openCreateDrawer = () => {
    setEditingItem(null);
    setTitle("");
    setContent("");
    setScopeBranch("ALL");
    setScopeSemester("0");
    setPriority("normal");
    
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartTime(today.toISOString().slice(0, 16));
    setEndTime(nextWeek.toISOString().slice(0, 16));

    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  // Open Drawer in Edit Mode
  const openEditDrawer = (item: AnnouncementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setScopeBranch(item.scope_branch || "ALL");
    setScopeSemester(item.scope_semester ? item.scope_semester.toString() : "0");
    setPriority(item.priority);
    setStartTime(new Date(item.start_time).toISOString().slice(0, 16));
    setEndTime(new Date(item.end_time).toISOString().slice(0, 16));

    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      setEditingItem(null);
    }, 450);
  };

  // Filtered dataset
  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const start = new Date(a.start_time);
      const end = new Date(a.end_time);
      const isActive = now >= start && now <= end;
      const isExpired = now > end;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.scope_branch && a.scope_branch.toLowerCase().includes(q));

      const matchesBranch = branchFilter === "all" ? true : (branchFilter === "ALL" ? !a.scope_branch : a.scope_branch === branchFilter);
      const matchesSemester = semesterFilter === "all" ? true : (semesterFilter === "0" ? !a.scope_semester : a.scope_semester?.toString() === semesterFilter);

      let matchesTab = true;
      if (activeTab === "active") matchesTab = isActive;
      else if (activeTab === "important") matchesTab = a.priority === "important";
      else if (activeTab === "expired") matchesTab = isExpired;

      return matchesSearch && matchesBranch && matchesSemester && matchesTab;
    });
  }, [announcements, searchQuery, activeTab, branchFilter, semesterFilter, now]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedAnnouncements = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filtered.slice(startIdx, startIdx + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Submit Handler (Create or Edit Announcement)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("scope_branch", scopeBranch);
    formData.append("scope_semester", scopeSemester);
    formData.append("priority", priority);
    formData.append("start_time", new Date(startTime).toISOString());
    formData.append("end_time", new Date(endTime).toISOString());

    try {
      if (editingItem) {
        const res = await updateAnnouncement(editingItem.id, formData);
        if (res.error) {
          addToast("error", "Update Failed", res.error);
        } else {
          addToast("success", "Announcement Updated", `"${title}" has been modified.`);
          setAnnouncements((prev) =>
            prev.map((a) =>
              a.id === editingItem.id
                ? {
                    ...a,
                    title: title.trim(),
                    content: content.trim(),
                    scope_branch: scopeBranch === "ALL" ? null : scopeBranch,
                    scope_semester: scopeSemester === "0" ? null : parseInt(scopeSemester, 10),
                    priority,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                  }
                : a
            )
          );
          closeDrawer();
        }
      } else {
        const res = await createAnnouncement(formData);
        if (res.error) {
          addToast("error", "Creation Failed", res.error);
        } else {
          addToast("success", "Announcement Broadcasted", `"${title}" is now published.`);
          if (res.announcement) {
            setAnnouncements((prev) => [res.announcement as unknown as AnnouncementItem, ...prev]);
          }
          closeDrawer();
        }
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred while saving announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Announcement Handler
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      const res = await deleteAnnouncement(deletingItem.id);
      if (res.error) {
        addToast("error", "Delete Failed", res.error);
      } else {
        addToast("success", "Broadcast Removed", `Announcement "${deletingItem.title}" was deleted.`);
        setAnnouncements((prev) => prev.filter((a) => a.id !== deletingItem.id));
        setDeletingItem(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete announcement.");
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================================
  // EXAM LOCKOUT HANDLERS
  // =========================================================================
  const openExamModal = () => {
    setExamTitle("");
    setExamSubjectMode("ALL");
    setExamSelectedSubjects([]);
    setIsExamModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsExamModalVisible(true);
      });
    });
  };

  const closeExamModal = () => {
    setIsExamModalVisible(false);
    setTimeout(() => {
      setIsExamModalMounted(false);
    }, 400);
  };

  const toggleExamSubject = (code: string) => {
    setExamSelectedSubjects((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleSaveExamSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || examSemesters.length === 0) {
      addToast("error", "Validation Error", "Please provide an exam title and select at least one semester.");
      return;
    }

    if (examSubjectMode === "CUSTOM" && examSelectedSubjects.length === 0) {
      addToast("error", "Validation Error", "Please select at least one subject or choose 'All Semester Subjects'.");
      return;
    }

    setIsSavingExam(true);
    const targetSubjects = examSubjectMode === "ALL" ? ["ALL"] : examSelectedSubjects;

    try {
      const res = await createExamScheduleAction({
        title: examTitle.trim(),
        semesters: examSemesters,
        branch: examBranch,
        subjects: targetSubjects,
        startDate: examStartDate,
        endDate: examEndDate,
        isDailyRecurring: examIsDailyRecurring,
        dailyStartTime: examDailyStartTime,
        dailyEndTime: examDailyEndTime,
      });

      if (res.error) {
        addToast("error", "Save Failed", res.error);
      } else if (res.schedule) {
        addToast(
          "success", 
          "Exam Lockout Scheduled", 
          `Materials for ${targetSubjects.includes("ALL") ? "All Subjects" : targetSubjects.join(", ")} (Sem ${examSemesters.join(", ")}) will hide daily from ${examDailyStartTime} to ${examDailyEndTime}.`
        );
        setExamSchedules((prev) => [res.schedule!, ...prev]);
        closeExamModal();
      }
    } catch {
      addToast("error", "Error", "Failed to save exam schedule.");
    } finally {
      setIsSavingExam(false);
    }
  };

  const handleToggleExamStatus = async (id: string, currentActive: boolean) => {
    setTogglingExamId(id);
    try {
      const newActive = !currentActive;
      const res = await toggleExamScheduleAction(id, newActive);
      if (res.error) {
        addToast("error", "Toggle Failed", res.error);
      } else {
        setExamSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, active: newActive } : s)));
        addToast("info", "Lockout Status Updated", newActive ? "Exam Mode activated for this schedule." : "Exam Mode paused for this schedule.");
      }
    } catch {
      addToast("error", "Error", "Failed to update exam lockout status.");
    } finally {
      setTogglingExamId(null);
    }
  };

  const handleDeleteExamSchedule = async () => {
    if (!deletingExamSchedule) return;
    setIsDeletingExam(true);
    try {
      const res = await deleteExamScheduleAction(deletingExamSchedule.id);
      if (res.error) {
        addToast("error", "Delete Failed", res.error);
      } else {
        setExamSchedules((prev) => prev.filter((s) => s.id !== deletingExamSchedule.id));
        addToast("success", "Schedule Removed", `Exam schedule "${deletingExamSchedule.title}" has been deleted.`);
        setDeletingExamSchedule(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete exam schedule.");
    } finally {
      setIsDeletingExam(false);
    }
  };

  const getStatusBadge = (sTime: string, eTime: string) => {
    const start = new Date(sTime);
    const end = new Date(eTime);

    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="h-3 w-3 text-amber-600" />
          Scheduled
        </span>
      );
    }
    if (now > end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="h-3 w-3 text-slate-400" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Broadcast
      </span>
    );
  };

  return (
    <div className="space-y-6 relative pb-10 w-full">
      {/* Toast Alert Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* EXECUTIVE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
              {mainSection === "broadcasts" ? <Megaphone className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {mainSection === "broadcasts" ? "Department Broadcasts & Notices" : "Exam Mode Timed Lockout Schedules"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-0.5">
                {mainSection === "broadcasts" 
                  ? "Publish targeted academic notifications, exam schedules, and department circulars."
                  : "Automatically hide semester/subject study materials during scheduled exam hours and unlock when the session concludes."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-medium text-slate-500">
              Active Notices: <strong className="text-slate-800 font-semibold">{stats.active}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              Active Exam Lockouts: <strong className="text-indigo-700 font-semibold">{examStats.activeCount}</strong>
            </span>
          </div>
        </div>

        {/* Section Toggle Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              onClick={() => setMainSection("broadcasts")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mainSection === "broadcasts"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Broadcasts
            </button>
            <button
              onClick={() => setMainSection("exams")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                mainSection === "exams"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Exam Mode Lockouts</span>
            </button>
          </div>

          {mainSection === "broadcasts" ? (
            <button
              onClick={openCreateDrawer}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Announcement</span>
            </button>
          ) : (
            <button
              onClick={openExamModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Exam Lockout</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXAM LOCKOUT SCHEDULES VIEW */}
      {/* ========================================================================= */}
      {mainSection === "exams" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="font-medium">
                When active, study documents & notes for targeted course subjects are <strong className="font-bold text-slate-900">locked & hidden</strong> on student dashboards during the specified hours. Materials automatically reappear once the session time ends.
              </p>
            </div>
            <button
              onClick={openExamModal}
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-2xs"
            >
              + Add Exam Schedule
            </button>
          </div>

          {examSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examSchedules.map((sched) => (
                <div
                  key={sched.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all bg-white shadow-xs space-y-4 ${
                    sched.active ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sched.active ? "bg-slate-900 text-white border border-slate-900" : "bg-slate-100 text-slate-600"
                        }`}>
                          {sched.active ? "Lockout Active" : "Lockout Paused"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Branch: <strong className="text-slate-800">{sched.branch || "ALL"}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{sched.title}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleExamStatus(sched.id, sched.active)}
                        disabled={togglingExamId === sched.id}
                        title={sched.active ? "Pause Lockout" : "Activate Lockout"}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          sched.active 
                            ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {togglingExamId === sched.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : sched.active ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeletingExamSchedule(sched)}
                        title="Delete Schedule"
                        className="p-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges & Subjects */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-500">Semesters:</span>
                      {sched.semesters.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                          Sem {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-500">Subjects Scope:</span>
                      {sched.subjects && !sched.subjects.includes("ALL") ? (
                        sched.subjects.map((subCode) => (
                          <span key={subCode} className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-xs">
                            {subCode}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs">
                          All Subjects in Semester(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Daily Timing Card */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                      <span>
                        Daily Session: <strong className="text-slate-900 font-bold">{sched.daily_start_time} – {sched.daily_end_time} IST</strong>
                      </span>
                    </div>
                    <span className="text-slate-400 font-normal">
                      {sched.start_date.slice(0, 10)} to {sched.end_date.slice(0, 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 w-fit mx-auto border border-amber-200">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Exam Lockout Schedules</h3>
              <p className="text-xs text-slate-500 font-normal max-w-md mx-auto">
                Schedule an examination window so that notes and study materials are temporarily hidden for specific semester students during exam hours.
              </p>
              <button
                onClick={openExamModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Exam Schedule</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BROADCASTS LIST VIEW */}
      {/* ========================================================================= */}
      {mainSection === "broadcasts" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search announcements by title or keyword..."
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                <option value="all">All Target Branches</option>
                <option value="ALL">Campus-Wide Only</option>
                {branches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.number} value={s.number.toString()}>
                    Semester {s.number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Announcements Grid */}
          {paginatedAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {getStatusBadge(item.start_time, item.end_time)}
                      {item.priority === "important" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                          Important
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-400 font-medium">
                      {item.scope_branch ? `Branch: ${item.scope_branch}` : "All Branches"}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditDrawer(item)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Edit Notice"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <p className="text-sm font-semibold text-slate-800">No Announcements Found</p>
              <p className="text-xs text-slate-500">No broadcast records match your search query.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXAM LOCKOUT SCHEDULE CREATION SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      {isExamModalMounted && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
              isExamModalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isSavingExam && closeExamModal()}
          />
          <div
            data-lenis-prevent
            className={`w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-2xl relative z-10 flex flex-col transform transition-transform duration-300 overscroll-contain ${
              isExamModalVisible ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Schedule Exam Material Lockout
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Temporarily hide subject materials during examination hours
                  </p>
                </div>
              </div>
              <button
                onClick={closeExamModal}
                disabled={isSavingExam}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form id="exam-schedule-form" onSubmit={handleSaveExamSchedule} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Examination Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Enter examination session title"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 font-medium"
                />
              </div>

              {/* Multi-Semester Selection Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Target Semesters (Having Exams) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (examSemesters.length === 8) setExamSemesters([]);
                      else setExamSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {examSemesters.length === 8 ? "Deselect All" : "Select All (Sem 1-8)"}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                    const isChecked = examSemesters.includes(semNum);
                    return (
                      <button
                        key={semNum}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (examSemesters.length > 1) {
                              setExamSemesters((prev) => prev.filter((s) => s !== semNum));
                            }
                          } else {
                            setExamSemesters((prev) => [...prev, semNum].sort());
                          }
                        }}
                        className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span>Sem {semNum}</span>
                        {isChecked && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branch Scope */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Academic Branch Scope
                </label>
                <select
                  value={examBranch}
                  onChange={(e) => setExamBranch(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 cursor-pointer font-medium"
                >
                  <option value="ALL">All Branches (Common Exams)</option>
                  {branches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Scope Granularity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <span>Target Subjects Scope *</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-600">
                    {availableSubjectsForExams.length} matching subjects
                  </span>
                </div>

                {/* Radio Selector: ALL Subjects vs CUSTOM Subjects */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamSubjectMode("ALL")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      examSubjectMode === "ALL"
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      examSubjectMode === "ALL" ? "border-white bg-white/20" : "border-slate-300"
                    }`}>
                      {examSubjectMode === "ALL" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>All Subjects in Semester(s)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamSubjectMode("CUSTOM")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      examSubjectMode === "CUSTOM"
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      examSubjectMode === "CUSTOM" ? "border-white bg-white/20" : "border-slate-300"
                    }`}>
                      {examSubjectMode === "CUSTOM" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>Specific Exam Subjects</span>
                  </button>
                </div>

                {/* Custom Subjects Checkbox List */}
                {examSubjectMode === "CUSTOM" && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-slate-600">
                      Select specific course subjects to lock during this exam window:
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-white rounded-xl border border-slate-200">
                      {availableSubjectsForExams.length > 0 ? (
                        availableSubjectsForExams.map((sub) => {
                          const isSelected = examSelectedSubjects.includes(sub.code);
                          return (
                            <button
                              key={sub.code}
                              type="button"
                              onClick={() => toggleExamSubject(sub.code)}
                              className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected ? "bg-indigo-50 font-bold text-indigo-950" : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                                  Sem {sub.semester}
                                </span>
                                <span className="font-bold">{sub.code}</span>
                                <span className="truncate text-slate-500 font-normal">{sub.title}</span>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 p-2 text-center">
                          No subjects registered for Semesters {examSemesters.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Time Window (e.g. 10:00 to 11:30) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-700" />
                    Daily Examination Hours
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Indian Standard Time (IST)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time (Lock At)</label>
                    <input
                      type="time"
                      required
                      value={examDailyStartTime}
                      onChange={(e) => setExamDailyStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time (Unlock At)</label>
                    <input
                      type="time"
                      required
                      value={examDailyEndTime}
                      onChange={(e) => setExamDailyEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Term Start Date</label>
                    <input
                      type="date"
                      required
                      value={examStartDate}
                      onChange={(e) => setExamStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Term End Date</label>
                    <input
                      type="date"
                      required
                      value={examEndDate}
                      onChange={(e) => setExamEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={closeExamModal}
                disabled={isSavingExam}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="exam-schedule-form"
                disabled={isSavingExam || examSemesters.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSavingExam ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling Lockout...
                  </>
                ) : (
                  `Schedule Lockout for Sem ${examSemesters.join(", ")}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE EXAM SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {deletingExamSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isDeletingExam && setDeletingExamSchedule(null)}
          />
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Exam Schedule</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deletingExamSchedule.title}</strong>? Material locks for this schedule will be removed immediately.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExamSchedule(null)}
                disabled={isDeletingExam}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExamSchedule}
                disabled={isDeletingExam}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingExam ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ANNOUNCEMENT EDIT/CREATE DRAWER */}
      {/* ========================================================================= */}
      {isDrawerMounted && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isSubmitting && closeDrawer()}
          />
          <div
            data-lenis-prevent
            className={`w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-2xl relative z-10 flex flex-col transform transition-transform duration-300 overscroll-contain ${
              isDrawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? "Edit Broadcast Notice" : "Broadcast New Notice"}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {editingItem ? "Modify notice details and audience" : "Publish announcement to student and faculty portals"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement headline or title"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Target Branch
                  </label>
                  <select
                    value={scopeBranch}
                    onChange={(e) => setScopeBranch(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer font-medium"
                  >
                    <option value="ALL">All Branches (Campus-wide)</option>
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={scopeSemester}
                    onChange={(e) => setScopeSemester(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer font-medium"
                  >
                    <option value="0">All Semesters</option>
                    {semesters.map((s) => (
                      <option key={s.number} value={s.number.toString()}>
                        Semester {s.number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority("normal")}
                    className={`py-2 px-4 rounded-xl border text-xs font-semibold cursor-pointer ${
                      priority === "normal" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Normal Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("important")}
                    className={`py-2 px-4 rounded-xl border text-xs font-semibold cursor-pointer ${
                      priority === "important" ? "bg-red-600 text-white border-red-600" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Important Alert
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter notice details, circular text, or instructions for students..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-normal leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Display Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Display End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Broadcast Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
