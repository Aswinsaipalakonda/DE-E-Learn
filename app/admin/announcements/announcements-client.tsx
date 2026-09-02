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
  ShieldAlert
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

interface AnnouncementsClientProps {
  initialAnnouncements: AnnouncementItem[];
  initialExamSchedules?: ExamSchedule[];
  branches: { code: string; name: string }[];
  semesters: { number: number; name: string }[];
}

export default function AnnouncementsClient({
  initialAnnouncements,
  initialExamSchedules = [],
  branches,
  semesters,
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
  const [examTitle, setExamTitle] = useState("Mid-Term 1 Examinations");
  const [examSemesters, setExamSemesters] = useState<number[]>([1, 3, 5]);
  const [examBranch, setExamBranch] = useState("ALL");
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

  // Filter announcements
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

  const handleSaveExamSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || examSemesters.length === 0) {
      addToast("error", "Validation Error", "Please provide an exam title and select at least one semester.");
      return;
    }
    setIsSavingExam(true);
    try {
      const res = await createExamScheduleAction({
        title: examTitle.trim(),
        semesters: examSemesters,
        branch: examBranch,
        startDate: examStartDate,
        endDate: examEndDate,
        isDailyRecurring: examIsDailyRecurring,
        dailyStartTime: examDailyStartTime,
        dailyEndTime: examDailyEndTime,
      });

      if (res.error) {
        addToast("error", "Save Failed", res.error);
      } else if (res.schedule) {
        addToast("success", "Exam Lockout Scheduled", `Materials for Semesters ${examSemesters.join(", ")} will hide during ${examDailyStartTime} - ${examDailyEndTime}.`);
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
                  : "Automatically hide semester study materials during scheduled exam hours and unlock when the timer concludes."}
              </p>
            </div>
          </div>

          {/* Section Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => setMainSection("broadcasts")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                mainSection === "broadcasts"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 font-normal"
              }`}
            >
              📢 Broadcast Notices ({stats.total})
            </button>
            <button
              onClick={() => setMainSection("exams")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                mainSection === "exams"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>Exam Mode Lockouts ({examStats.activeCount} Active)</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="self-start lg:self-center shrink-0">
          {mainSection === "broadcasts" ? (
            <button
              onClick={openCreateDrawer}
              className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Announcement</span>
            </button>
          ) : (
            <button
              onClick={openExamModal}
              className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>+ Schedule Exam Lockout</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: BROADCAST ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {mainSection === "broadcasts" && (
        <>
          {/* TOOLBAR FILTER CONTROLS */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              {[
                { id: "all", label: "All Notices", count: stats.total },
                { id: "active", label: "Active Now", count: stats.active },
                { id: "important", label: "Important Priority", count: stats.important },
                { id: "expired", label: "Archived / Expired", count: announcements.filter((a) => now > new Date(a.end_time)).length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as "all" | "active" | "important" | "expired");
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs font-semibold"
                        : "bg-slate-100/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200 font-normal"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isActive ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search announcements by title or content..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                >
                  <option value="all">All Branch Scopes</option>
                  <option value="ALL">Institutional Broadcasts (All)</option>
                  {branches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} Department
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
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                >
                  <option value="all">All Semester Scopes</option>
                  <option value="0">All Enrolled Semesters</option>
                  {semesters.map((s) => (
                    <option key={s.number} value={s.number.toString()}>
                      Semester {s.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Announcements Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedAnnouncements.map((item) => {
              const isImportant = item.priority === "important";
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group ${
                    isImportant ? "border-red-200" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getStatusBadge(item.start_time, item.end_time)}
                        {isImportant && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            Urgent / High Priority
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.scope_branch ? `${item.scope_branch} Dept` : "All Branches"}
                        </span>
                        {item.scope_semester && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Sem {item.scope_semester}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => openEditDrawer(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{new Date(item.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(item.end_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-xl bg-slate-900 text-white disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: EXAM MODE TIMED LOCKOUT SCHEDULES */}
      {/* ========================================================================= */}
      {mainSection === "exams" && (
        <div className="space-y-4">
          {/* Informational Guidance Banner */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950">How Exam Mode Works</h3>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                When an Exam Lockout schedule is active, study materials for the chosen semesters are <strong>automatically hidden</strong> in student dashboards during the specified daily exam window (e.g. 10:00 AM – 11:30 AM). As soon as the timer ends, materials are <strong>instantly restored</strong> without requiring manual unarchiving.
              </p>
            </div>
          </div>

          {/* Exam Schedules List */}
          {examSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examSchedules.map((sched) => (
                <div
                  key={sched.id}
                  className={`p-5 sm:p-6 rounded-3xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                    sched.active ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200 opacity-75"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {sched.active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                            Lockout Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Paused / Inactive
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {sched.branch === "ALL" ? "All Branches" : `${sched.branch} Dept`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleExamStatus(sched.id, sched.active)}
                          disabled={togglingExamId === sched.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            sched.active
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          }`}
                        >
                          {togglingExamId === sched.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : sched.active ? (
                            "Pause"
                          ) : (
                            "Activate"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingExamSchedule(sched)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {sched.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        <span className="text-xs font-semibold text-slate-600">Locked Semesters:</span>
                        {sched.semesters.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[11px]"
                          >
                            Sem {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Daily Lockout Window:
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {sched.daily_start_time} – {sched.daily_end_time} (IST)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 font-normal text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Evaluation Term Dates:
                        </span>
                        <span>
                          {sched.start_date.slice(0, 10)} to {sched.end_date.slice(0, 10)}
                        </span>
                      </div>
                    </div>
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
      {/* EXAM LOCKOUT SCHEDULE CREATION MODAL */}
      {/* ========================================================================= */}
      {isExamModalMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExamModalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isSavingExam && closeExamModal()}
          />
          <div
            data-lenis-prevent
            className={`bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 space-y-5 max-h-[90vh] flex flex-col relative z-10 transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
              isExamModalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
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
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form id="exam-schedule-form" onSubmit={handleSaveExamSchedule} className="space-y-4 overflow-y-auto flex-1 pr-1">
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
                  placeholder="e.g. Mid-Term 1 Examinations, Semester End Labs"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
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
                    className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
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
                          if (isChecked) setExamSemesters((prev) => prev.filter((s) => s !== semNum));
                          else setExamSemesters((prev) => [...prev, semNum].sort());
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
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer font-medium"
                >
                  <option value="ALL">All Branches (Common Exams)</option>
                  {branches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Time Window (e.g. 10:00 to 11:30) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                    Daily Examination Hours
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800">
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
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time (Unlock At)</label>
                    <input
                      type="time"
                      required
                      value={examDailyEndTime}
                      onChange={(e) => setExamDailyEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
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
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Term End Date</label>
                    <input
                      type="date"
                      required
                      value={examEndDate}
                      onChange={(e) => setExamEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
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
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
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
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isSubmitting && closeDrawer()}
          />
          <div
            data-lenis-prevent
            className={`w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-2xl relative z-10 flex flex-col transform transition-transform duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
              isDrawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {editingItem ? "Edit Announcement" : "Create New Notice"}
                  </h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Targeted broadcast notification for academic cohorts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form id="announcement-manage-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 overscroll-contain">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term 1 Schedule & Hall Allotments"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Broadcast Content / Instructions *
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide comprehensive details or guidelines for students and faculty..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Branch Scope
                  </label>
                  <select
                    value={scopeBranch}
                    onChange={(e) => setScopeBranch(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Semester Scope
                  </label>
                  <select
                    value={scopeSemester}
                    onChange={(e) => setScopeSemester(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Start Broadcast
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Expire Broadcast
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Priority Banner
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPriority("normal")}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      priority === "normal"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Normal Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("important")}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      priority === "important"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-red-50/50 border-red-200 text-red-700"
                    }`}
                  >
                    High / Urgent Priority
                  </button>
                </div>
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={closeDrawer}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="announcement-manage-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{editingItem ? "Saving..." : "Publishing..."}</span>
                  </>
                ) : (
                  <>
                    <span>{editingItem ? "Save Changes" : "Publish Notice"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE ANNOUNCEMENT MODAL */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isDeleting && setDeletingItem(null)}
          />
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Announcement</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deletingItem.title}</strong>? It will immediately be removed from all student and faculty feeds.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
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
    </div>
  );
}
