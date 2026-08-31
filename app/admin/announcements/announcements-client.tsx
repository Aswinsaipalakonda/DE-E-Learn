"use client";

import { useState } from "react";
import { createAnnouncement, deleteAnnouncement } from "./actions";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Filter, 
  CheckCircle2, 
  X,
  Loader2,
  Tag
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "all" | "important">("active");

  const now = new Date();

  // Filter announcements based on status tab
  const filtered = announcements.filter((a) => {
    const start = new Date(a.start_time);
    const end = new Date(a.end_time);
    const isActive = now >= start && now <= end;

    if (activeTab === "active") return isActive;
    if (activeTab === "important") return a.priority === "important";
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    try {
      const res = await deleteAnnouncement(id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete announcement.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createAnnouncement(formData);
      if (res.error) {
        alert(res.error);
        return;
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch {
      alert("Failed to create announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning text-[10px] font-bold border border-warning/15">
          Scheduled
        </span>
      );
    }
    if (now > end) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary/40 text-[10px] font-bold border border-border">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold border border-success/15">
        Live Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-surface rounded-2xl border border-border shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Announcements Manager</h1>
          <p className="text-sm text-primary/60 mt-1">
            Broadcast departmental updates, exam schedules, and circulars directly to students and faculty.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-full shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border">
        {(["active", "important", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-primary/50 hover:text-primary"
            }`}
          >
            {tab === "active" ? "Active Now" : tab === "important" ? "High Priority" : "All Broadcasts"}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-surface rounded-2xl border transition-all ${
                item.priority === "important"
                  ? "border-accent/30 bg-accent/5 shadow-xs"
                  : "border-border shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.start_time, item.end_time)}
                    {item.priority === "important" && (
                      <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-bold border border-accent/20 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> High Priority
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold border border-secondary/15">
                      {item.scope_branch ? `Branch: ${item.scope_branch}` : "All Branches"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/5 text-primary/70 text-[10px] font-bold border border-border">
                      {item.scope_semester ? `Semester ${item.scope_semester}` : "All Semesters"}
                    </span>
                  </div>

                  <h3 className="font-bold text-primary text-lg">{item.title}</h3>
                  <p className="text-sm text-primary/80 leading-relaxed whitespace-pre-line max-w-3xl">
                    {item.content}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0">
                  <div className="text-right text-xs text-primary/50 space-y-1">
                    <div className="flex items-center gap-1 sm:justify-end">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(item.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:justify-end">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Until {new Date(item.end_time).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    title="Delete announcement"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-surface border border-border rounded-2xl text-primary/50 text-sm font-semibold">
            No announcements found under this filter.
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div 
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-6 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 ease-[cubic-bezier(0.16,1,0.3,1)] duration-300"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-primary">New Department Announcement</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-primary/50 hover:text-primary rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                  Announcement Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Mid-Term Examination Schedule Released"
                  className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                  Announcement Content *
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Provide detailed instructions, dates, or circular details..."
                  className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Target Branch
                  </label>
                  <select
                    name="scope_branch"
                    defaultValue="ALL"
                    className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  >
                    <option value="ALL">All Branches (Global)</option>
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Target Semester
                  </label>
                  <select
                    name="scope_semester"
                    defaultValue="0"
                    className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  >
                    <option value="0">All Semesters (Global)</option>
                    {semesters.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Start Date / Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    required
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    End Date / Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    required
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-3 py-2.5 text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                  Priority Level
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary">
                    <input
                      type="radio"
                      name="priority"
                      value="normal"
                      defaultChecked
                      className="accent-primary"
                    />
                    Normal
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-accent">
                    <input
                      type="radio"
                      name="priority"
                      value="important"
                      className="accent-accent"
                    />
                    Important (Highlighted)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-primary/70 hover:text-primary rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Announcement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
