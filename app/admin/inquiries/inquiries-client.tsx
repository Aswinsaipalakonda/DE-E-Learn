"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  Sparkles,
  Inbox,
  RefreshCw,
  Eye,
  Check,
  X
} from "lucide-react";
import { updateInquiryStatus, deleteInquiry } from "./actions";

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved";
  admin_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

interface InquiriesClientProps {
  initialInquiries: InquiryItem[];
}

export default function InquiriesClient({ initialInquiries }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState("");

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesRole = roleFilter === "all" || item.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [inquiries, searchQuery, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status === "pending").length;
    const inProgress = inquiries.filter((i) => i.status === "in_progress").length;
    const resolved = inquiries.filter((i) => i.status === "resolved").length;
    return { total, pending, inProgress, resolved };
  }, [inquiries]);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "in_progress" | "resolved",
    notes?: string
  ) => {
    setIsUpdating(true);
    const res = await updateInquiryStatus(id, newStatus, notes);
    setIsUpdating(false);

    if (res.success) {
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
                admin_notes: notes !== undefined ? notes : item.admin_notes,
                resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
              }
            : item
        )
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                admin_notes: notes !== undefined ? notes : prev.admin_notes,
              }
            : null
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry record?")) return;
    setIsUpdating(true);
    const res = await deleteInquiry(id);
    setIsUpdating(false);

    if (res.success) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const openDetail = (item: InquiryItem) => {
    setSelectedInquiry(item);
    setAdminNoteText(item.admin_notes || "");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-blue-600" />
            Support &amp; Contact Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and resolve messages submitted by students, faculty, and institutional visitors from the public contact page.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all" ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Received</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
        </div>

        <div 
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "pending" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{stats.pending}</span>
        </div>

        <div 
          onClick={() => setStatusFilter("in_progress")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "in_progress" ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> In Progress
          </span>
          <span className="text-2xl font-black text-indigo-900 mt-1 block">{stats.inProgress}</span>
        </div>

        <div 
          onClick={() => setStatusFilter("resolved")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "resolved" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{stats.resolved}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sender, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
            <option value="Alumni">Alumni</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Support Inquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                ? "No inquiries match your filter criteria. Try adjusting the search filters."
                : "No messages have been submitted through the public contact form yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Sender Details</th>
                  <th className="py-3.5 px-4">Subject / Topic</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => openDetail(item)}
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{item.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate font-medium text-slate-900">
                      <span>{item.subject || "General Inquiry"}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{item.message}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {item.status === "in_progress" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Sparkles className="w-3 h-3" /> In Progress
                        </span>
                      )}
                      {item.status === "resolved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || "DataDock Inquiry")}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  INQ-{selectedInquiry.id.slice(0, 6).toUpperCase()}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedInquiry.subject || "General Inquiry"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Sender Name</span>
                <span className="font-bold text-slate-900">{selectedInquiry.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email Address</span>
                <a href={`mailto:${selectedInquiry.email}`} className="font-mono text-blue-600 hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Affiliation / Role</span>
                <span className="font-semibold text-slate-700">{selectedInquiry.role}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Submitted Date</span>
                <span className="text-slate-700">
                  {new Date(selectedInquiry.created_at).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Message Body:</span>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Admin Notes Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">Internal Administrative Notes:</label>
              <textarea
                rows={3}
                placeholder="Add internal resolution notes or student follow-up details..."
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Status Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Update Status:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(selectedInquiry.id, "pending", adminNoteText)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedInquiry.status === "pending"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  Mark Pending
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(selectedInquiry.id, "in_progress", adminNoteText)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedInquiry.status === "in_progress"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                  }`}
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(selectedInquiry.id, "resolved", adminNoteText)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedInquiry.status === "resolved"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || "DataDock Support")}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply to {selectedInquiry.name}
              </a>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
