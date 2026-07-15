"use client";

import { useState } from "react";
import { createAnnouncementAction } from "./actions";
import { Megaphone } from "lucide-react";

interface Branch {
  code: string;
  name: string;
}

interface Semester {
  number: number;
  name: string;
}

interface AnnouncementFormProps {
  branches: Branch[];
  semesters: Semester[];
}

export default function AnnouncementForm({ branches, semesters }: AnnouncementFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [scopeBranch, setScopeBranch] = useState("");
  const [scopeSemester, setScopeSemester] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Default dates if empty
    const start = startTime || new Date().toISOString();
    // Default 7 days from start
    const end = endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const result = await createAnnouncementAction(
      title,
      content,
      priority,
      scopeBranch || null,
      parseInt(scopeSemester, 10) || null,
      start,
      end
    );

    setLoading(false);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "Announcement broadcasted successfully!", type: "success" });
      setTitle("");
      setContent("");
      setPriority("medium");
      setScopeBranch("");
      setScopeSemester("");
      setStartTime("");
      setEndTime("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-border shadow-xs max-w-xl space-y-6">
      {message && (
        <div role="alert" className={`p-4 rounded-xl border text-sm font-semibold ${
          message.type === "success" ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="ann-title" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Announcement Title</label>
        <input
          id="ann-title"
          required
          placeholder="e.g., Mid-Term Examination Timetable Released"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
        />
      </div>

      <div>
        <label htmlFor="ann-content" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Broadcast Message</label>
        <textarea
          id="ann-content"
          required
          rows={4}
          placeholder="Type announcement details here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="priority" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Severity Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="scope-b" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Target Branch</label>
          <select
            id="scope-b"
            value={scopeBranch}
            onChange={(e) => setScopeBranch(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.code} value={b.code}>{b.code}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scope-s" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Target Semester</label>
          <select
            id="scope-s"
            value={scopeSemester}
            onChange={(e) => setScopeSemester(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
          >
            <option value="">All Semesters</option>
            {semesters.map(s => (
              <option key={s.number} value={s.number}>Sem {s.number}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-t" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Start Date & Time</label>
          <input
            id="start-t"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="end-t" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">End Date & Time</label>
          <input
            id="end-t"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Megaphone className="h-4 w-4" />
          {loading ? "Broadcasting..." : "Broadcast Announcement"}
        </button>
      </div>
    </form>
  );
}
