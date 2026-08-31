"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bell, BellRing, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export default function NotificationBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      // Get current user profile for scope filtering
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("role, branch, current_semester")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      // Query active announcements
      let query = supabase
        .from("announcements")
        .select("id, title, content, priority, created_at")
        .lte("start_time", new Date().toISOString())
        .gte("end_time", new Date().toISOString());

      // Filter by scope if student
      if (profile.role === "student" && profile.branch) {
        query = query.or(`scope_branch.is.null,scope_branch.eq.${profile.branch}`);
      }

      const { data } = await query.order("created_at", { ascending: false });
      if (data) {
        setAnnouncements(data as Announcement[]);
        if (data.length > 0) {
          setHasUnread(true);
        }
      }
    };

    fetchAnnouncements();

    // Poll every 60 seconds
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [supabase]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasUnread(false); // Clear red dot indicator on open
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg bg-surface border border-border text-primary hover:bg-bg cursor-pointer focus:outline-none transition-colors"
        aria-label="View notifications"
      >
        {hasUnread ? (
          <>
            <BellRing className="h-4.5 w-4.5 text-secondary animate-pulse" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
          </>
        ) : (
          <Bell className="h-4.5 w-4.5 text-primary/60" />
        )}
      </button>

      {/* Floating Announcements Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 bg-surface rounded-2xl border border-border shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]">

          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs text-primary">Announcements ({announcements.length})</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-primary/45 hover:bg-bg rounded-md cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div data-lenis-prevent className="space-y-3 max-h-60 overflow-y-auto overscroll-contain">

            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-bg rounded-xl border border-border space-y-1.5 text-xs font-medium">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-primary truncate max-w-[150px]">{ann.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      ann.priority === "high"
                        ? "bg-danger/10 text-danger"
                        : ann.priority === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/5 text-primary/50"
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-primary/65 leading-relaxed font-semibold">{ann.content}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-primary/40 font-semibold text-xs">
                No active announcements today.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
