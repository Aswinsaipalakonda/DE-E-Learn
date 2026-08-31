"use client";

import { useState, useMemo } from "react";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "./actions";
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
  Info
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
  branches: { code: string; name: string }[];
  semesters: { number: number; name: string }[];
}

export default function AnnouncementsClient({
  initialAnnouncements,
  branches,
  semesters,
}: AnnouncementsClientProps) {
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

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scopeBranch, setScopeBranch] = useState("ALL");
  const [scopeSemester, setScopeSemester] = useState("0");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Stats calculation
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

  // Open Drawer in Create Mode
  const openCreateDrawer = () => {
    setEditingItem(null);
    setTitle("");
    setContent("");
    setScopeBranch("ALL");
    setScopeSemester("0");
    setPriority("normal");
    
    // Default dates: Start now, End in 7 days
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

  // Submit Handler (Create or Edit)
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
          addToast("success", "Broadcast Published", `"${title}" has been sent to student and faculty feeds.`);
          if (res.announcement) {
            setAnnouncements((prev) => [res.announcement as AnnouncementItem, ...prev]);
          }
          closeDrawer();
        }
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
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
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Department Broadcasts & Notices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-0.5">
                Publish targeted academic notifications, exam schedules, and department circulars.
              </p>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              Total: <span className="font-semibold">{stats.total}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Active: <span className="font-semibold">{stats.active}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-medium text-red-800">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Important: <span className="font-semibold">{stats.important}</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="self-start lg:self-center shrink-0">
          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOOLBAR FILTER CONTROLS */}
      {/* ========================================================================= */}
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
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search announcements by title or keyword..."
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

          {/* Branch Target Selector */}
          <div className="sm:col-span-3">
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="ALL">Entire Department (All)</option>
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Target Selector */}
          <div className="sm:col-span-3">
            <select
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
            >
              <option value="all">All Semesters</option>
              <option value="0">All Terms</option>
              {semesters.map((s) => (
                <option key={s.number} value={s.number.toString()}>
                  Sem {s.number} ({s.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ANNOUNCEMENT CARDS DIRECTORY WITH FULL CRUD */}
      {/* ========================================================================= */}
      {paginatedAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedAnnouncements.map((a) => {
            const isImportant = a.priority === "important";
            const isDeletingCurrent = deletingItem?.id === a.id;

            return (
              <div
                key={a.id}
                className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all hover:shadow-md flex flex-col justify-between space-y-4 group ${
                  isImportant
                    ? "border-red-200 bg-red-50/20"
                    : "border-slate-200"
                }`}
              >
                {/* Header Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(a.start_time, a.end_time)}
                      {isImportant && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          High Priority
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Edit and Delete */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditDrawer(a)}
                        title="Edit Announcement"
                        className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingItem(a)}
                        title="Delete Announcement"
                        className="p-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-1.5 whitespace-pre-line line-clamp-3">
                      {a.content}
                    </p>
                  </div>
                </div>

                {/* Scope & Schedule Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-normal">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {a.scope_branch ? `Branch: ${a.scope_branch}` : "All Branches"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {a.scope_semester ? `Sem ${a.scope_semester}` : "All Semesters"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Expires: {new Date(a.end_time).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">No Announcements Found</h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-sm mx-auto">
              No published notices match your current status or filter criteria.
            </p>
          </div>
          <button
            onClick={openCreateDrawer}
            className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-medium shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            + Create First Notice
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGINATION */}
      {/* ========================================================================= */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200 bg-white shadow-xs">
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
              of <span className="text-slate-900 font-semibold">{filtered.length}</span> announcements
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
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
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT DRAWER (CREATE / EDIT ANNOUNCEMENT) */}
      {/* ========================================================================= */}
      {isDrawerMounted && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !isSubmitting && closeDrawer()}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                    {editingItem ? <Pencil className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {editingItem ? "Edit Announcement" : "Create Announcement"}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {editingItem ? "Modify broadcast content & schedule" : "Broadcast notice to students and faculty"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form 
                id="announcement-manage-form" 
                data-lenis-prevent
                onSubmit={handleSubmit} 
                className="px-6 py-5 space-y-4 flex-1 overflow-y-auto overscroll-contain"
              >
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mid-Term Examination Schedule"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                  />
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Broadcast Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority("normal")}
                      className={`py-2 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        priority === "normal"
                          ? "bg-slate-900 text-white border-slate-900 font-semibold"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      <span>Standard Notice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority("important")}
                      className={`py-2 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        priority === "important"
                          ? "bg-red-600 text-white border-red-600 font-semibold"
                          : "bg-white text-slate-700 border-slate-200 hover:border-red-300"
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>High Priority</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notice Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter detailed notice message, instructions, or exam guidelines..."
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                  />
                </div>

                {/* Scope Target Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Target Branch
                    </label>
                    <select
                      value={scopeBranch}
                      onChange={(e) => setScopeBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    >
                      <option value="ALL">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Target Semester
                    </label>
                    <select
                      value={scopeSemester}
                      onChange={(e) => setScopeSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    >
                      <option value="0">All Semesters</option>
                      {semesters.map((s) => (
                        <option key={s.number} value={s.number.toString()}>
                          Sem {s.number} ({s.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timeline Schedule Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
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
