"use client";

import { useState } from "react";
import { 
  Eye, 
  Download, 
  BookOpen, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Check, 
  Loader2 
} from "lucide-react";
import { logExportEvent } from "./actions";

interface MaterialWithMetrics {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  views: number;
  downloads: number;
  users: {
    name: string;
    email: string;
  } | null;
}

interface AnalyticsClientProps {
  materials: MaterialWithMetrics[];
  totalViews: number;
  totalDownloads: number;
}

export default function AnalyticsClient({
  materials,
  totalViews,
  totalDownloads,
}: AnalyticsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.users?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === "ALL" || m.branch === selectedBranch;
    const matchesSemester = selectedSemester === "ALL" || m.semester.toString() === selectedSemester;

    return matchesSearch && matchesBranch && matchesSemester;
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // 1. Prepare CSV Content
      const headers = ["Title", "Material Type", "Branch", "Semester", "Faculty Name", "Faculty Email", "Views", "Downloads", "Uploaded Date"];
      const rows = filtered.map((m) => [
        `"${(m.title || "").replace(/"/g, '""')}"`,
        `"${m.type || ""}"`,
        `"${m.branch || ""}"`,
        m.semester,
        `"${(m.users?.name || "System").replace(/"/g, '""')}"`,
        `"${m.users?.email || ""}"`,
        m.views,
        m.downloads,
        `"${new Date(m.created_at).toISOString()}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mvgr_de_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Log export audit log in Supabase
      await logExportEvent("material_analytics", filtered.length);
    } catch {
      alert("Failed to export CSV report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-surface rounded-2xl border border-border shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Repository Usage Metrics</h1>
          <p className="text-sm text-primary/60 mt-1">
            Monitor student interactions, document downloads, and faculty upload logs.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={isExporting || filtered.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-full shadow-xs cursor-pointer transition-all disabled:opacity-50 shrink-0"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Export CSV Report
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Total Material Views</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{totalViews}</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Total Downloads</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{totalDownloads}</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Uploaded Materials</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{materials.length}</span>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
          <input
            placeholder="Search by title, faculty name, or material type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-xs text-primary font-semibold focus:outline-none"
          >
            <option value="ALL">All Branches</option>
            <option value="CIC">CIC</option>
            <option value="CSD">CSD</option>
            <option value="CSM">CSM</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-xs text-primary font-semibold focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>Sem {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Material Logs Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary tracking-tight">Material Engagement Logs ({filtered.length})</h2>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                    <th className="p-4">Material Info</th>
                    <th className="p-4">Faculty Uploader</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4 text-center">Views</th>
                    <th className="p-4 text-center">Downloads</th>
                    <th className="p-4 text-right">Uploaded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-bg/25 transition-all font-medium">
                      <td className="p-4">
                        <span className="font-bold text-primary block leading-tight">{m.title}</span>
                        <span className="text-[10px] text-primary/45 mt-0.5 block">{m.type}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-primary block">{m.users?.name || "System"}</span>
                        <span className="text-[10px] text-primary/45 block">{m.users?.email || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex gap-1.5 items-center">
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[9px] font-bold uppercase">{m.branch}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-secondary/10 border border-secondary/10 text-[9px] font-bold">Sem {m.semester}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 bg-secondary/10 text-secondary border border-secondary/10 font-bold rounded-lg text-[10px]">
                          {m.views}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 bg-accent/10 text-accent border border-accent/10 font-bold rounded-lg text-[10px]">
                          {m.downloads}
                        </span>
                      </td>
                      <td className="p-4 text-right text-primary/60">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center text-primary/40 font-semibold">
              No matching materials found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
