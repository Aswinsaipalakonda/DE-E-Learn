"use client";

import { useState, useMemo } from "react";
import { createUserAction, batchCreateUsersAction, toggleUserStatus } from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Upload, 
  Search, 
  X, 
  Check, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface BranchOption {
  code: string;
  name: string;
}

interface SemesterOption {
  number: number;
  name: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "student" | "faculty" | "admin";
  status: "active" | "deactivated";
  branch: string | null;
  current_semester: number | null;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  branches: BranchOption[];
  semesters: SemesterOption[];
}

export default function UsersClient({ initialUsers, branches, semesters }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Slide-over Right Drawer Animation State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // CSV Modal Animation State
  const [isCsvMounted, setIsCsvMounted] = useState(false);
  const [isCsvVisible, setIsCsvVisible] = useState(false);

  // Single User Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "admin">("student");
  const [branch, setBranch] = useState(branches[0]?.code || "CIC");
  const [semester, setSemester] = useState("1");
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvLoading, setCsvLoading] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Drawer Open / Close Handlers (500ms smooth cubic-bezier easing)
  const openDrawer = () => {
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
    }, 450);
  };

  // CSV Modal Open / Close Handlers
  const openCsvModal = () => {
    setIsCsvMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsCsvVisible(true);
      });
    });
  };

  const closeCsvModal = () => {
    setIsCsvVisible(false);
    setTimeout(() => {
      setIsCsvMounted(false);
    }, 400);
  };

  // Role Counts for Stat Pills
  const counts = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === "student").length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, students, faculty, admins };
  }, [users]);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchesBranch = branchFilter === "all" ? true : u.branch === branchFilter;
      const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, branchFilter, statusFilter]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIdx, startIdx + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset pagination on filter change
  const handleRoleTabChange = (newRole: string) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // CSV Parser
  const parseCSV = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());
      if (cells.length < headers.length) continue;

      const obj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        obj[header] = cells[idx];
      });
      result.push(obj);
    }
    return result;
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setCsvPreview(parsed);
      };
      reader.readAsText(file);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const semNum = role === "student" && semester ? parseInt(semester, 10) : null;
    const branchVal = role === "student" ? branch : null;

    try {
      const result = await createUserAction(email, name, role, branchVal, semNum);

      if (result.error) {
        addToast("error", "Failed to create user", result.error);
      } else {
        addToast(
          "success",
          "User Created Successfully",
          `${name} (${role.toUpperCase()}) account has been registered.`
        );

        if (result.user) {
          setUsers((prev) => [result.user as UserItem, ...prev]);
        }

        setEmail("");
        setName("");
        closeDrawer();
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred while creating user.");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvSubmit = async () => {
    if (csvPreview.length === 0) return;
    setCsvLoading(true);

    const formattedList = csvPreview
      .map((item) => ({
        email: item.email || "",
        name: item.name || "",
        role: (item.role || "student") as "student" | "faculty" | "admin",
        branch: item.branch || null,
        semester: item.semester ? parseInt(item.semester, 10) : null,
      }))
      .filter((u) => u.email && u.name);

    try {
      const result = await batchCreateUsersAction(formattedList);
      if (result.error) {
        addToast("error", "Batch Import Failed", result.error);
      } else {
        addToast(
          "success",
          "Batch Processing Complete",
          `Successfully provisioned ${result.successCount ?? 0} users. (Failed: ${result.failCount ?? 0})`
        );
        setCsvFile(null);
        setCsvPreview([]);
        closeCsvModal();
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      addToast("error", "Error", "Batch upload failed.");
    } finally {
      setCsvLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string, userName: string) => {
    setTogglingId(userId);
    const newStatus = currentStatus === "active" ? "deactivated" : "active";

    try {
      const result = await toggleUserStatus(userId, currentStatus);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus as "active" | "deactivated" } : u))
        );
        addToast(
          "info",
          "Status Updated",
          `${userName}'s access has been set to ${newStatus.toUpperCase()}.`
        );
      } else {
        addToast("error", "Status Update Failed", result.error);
      }
    } catch {
      addToast("error", "Error", "Failed to update account status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Avatar Initials Helper
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  // Avatar & Role Styling Helpers (Clean, distinctive, no weird gradients)
  const getRoleStyle = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case "student":
        return {
          avatarBg: "bg-blue-50 text-blue-700 border-blue-200/80",
          badge: "bg-blue-50 text-blue-700 border border-blue-200/70",
          label: "STUDENT",
        };
      case "faculty":
        return {
          avatarBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
          label: "FACULTY",
        };
      case "admin":
        return {
          avatarBg: "bg-slate-100 text-slate-800 border-slate-300",
          badge: "bg-slate-100 text-slate-800 border border-slate-300",
          label: "ADMIN",
        };
      default:
        return {
          avatarBg: "bg-gray-100 text-gray-700 border-gray-200",
          badge: "bg-gray-100 text-gray-700 border border-gray-200",
          label: userRole.toUpperCase(),
        };
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Alert Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* UNIFIED PREMIUM PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-xs">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                User Management & Roster
              </h1>
              <p className="text-sm text-primary/60 mt-0.5 font-medium">
                Provision students, faculty members, and administrators across department specializations.
              </p>
            </div>
          </div>

          {/* Stat Counter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg border border-border text-xs font-bold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary/60" />
              Total: {counts.total}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Students: {counts.students}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Faculty: {counts.faculty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-slate-700" />
              Admins: {counts.admins}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
          <button
            onClick={openCsvModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-bg hover:bg-surface text-primary font-bold text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer"
          >
            <Upload className="h-4.5 w-4.5 text-primary/70" />
            <span>Batch Import (CSV)</span>
          </button>

          <button
            onClick={openDrawer}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-surface p-4 sm:p-5 rounded-3xl border border-border shadow-xs space-y-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3.5">
          {[
            { id: "all", label: "All Users", count: counts.total },
            { id: "student", label: "Students", count: counts.students },
            { id: "faculty", label: "Faculty", count: counts.faculty },
            { id: "admin", label: "Administrators", count: counts.admins },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleRoleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "bg-bg text-primary/70 hover:text-primary hover:bg-border/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-surface border border-border text-primary/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Branch & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-primary/40" />
            <input
              placeholder="Search by user name or official email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-sm bg-bg border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium text-primary placeholder:text-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 top-3.5 text-primary/40 hover:text-primary p-0.5 rounded-full hover:bg-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Branch Specialization Selector */}
          <div className="sm:col-span-3">
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 text-sm font-semibold bg-bg border border-border rounded-2xl text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 text-sm font-semibold bg-bg border border-border rounded-2xl text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="deactivated">Deactivated Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IMMERSIVE ROSTER DIRECTORY TABLE */}
      {/* ========================================================================= */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg/60 text-primary/60 font-extrabold uppercase tracking-wider text-xs border-b border-border">
                  <th className="py-4.5 pl-6 pr-4">User</th>
                  <th className="py-4.5 px-4">Official Email</th>
                  <th className="py-4.5 px-4">Role</th>
                  <th className="py-4.5 px-4">Scope & Academic Term</th>
                  <th className="py-4.5 px-4">Status</th>
                  <th className="py-4.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((u) => {
                  const isToggling = togglingId === u.id;
                  const roleStyle = getRoleStyle(u.role);
                  const initials = getInitials(u.name);

                  return (
                    <tr key={u.id} className="hover:bg-bg/40 transition-colors font-medium group">
                      {/* Name & Initials Avatar */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${roleStyle.avatarBg}`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-primary text-sm sm:text-base leading-tight group-hover:text-secondary transition-colors">
                              {u.name}
                            </h3>
                            <span className="text-[11px] text-primary/50 font-semibold block mt-0.5">
                              Registered: {new Date(u.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-primary/75 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary/40 shrink-0" />
                          <span className="truncate max-w-[220px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black tracking-wide ${roleStyle.badge}`}>
                          {roleStyle.label}
                        </span>
                      </td>

                      {/* Scope & Academic Term */}
                      <td className="py-4 px-4">
                        {u.branch ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border text-xs font-bold text-primary">
                              {u.branch}
                            </span>
                            {u.current_semester ? (
                              <span className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-[11px] font-bold text-secondary">
                                Sem {u.current_semester}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-primary/30 font-semibold text-xs">— Department Wide</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/70">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status, u.name)}
                          disabled={isToggling}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            u.status === "active"
                              ? "bg-surface hover:bg-red-50 text-primary/70 hover:text-red-700 border-border hover:border-red-200/80 shadow-2xs"
                              : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/80 shadow-2xs"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : u.status === "active" ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-bg border border-border flex items-center justify-center text-primary/40">
              <UsersIcon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">No Users Found</h3>
              <p className="text-xs sm:text-sm text-primary/50 mt-1 max-w-sm mx-auto">
                No registered accounts match your current filter or search criteria.
              </p>
            </div>
            {(searchQuery || roleFilter !== "all" || branchFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setBranchFilter("all");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-bg hover:bg-border text-xs font-bold text-primary transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================================================= */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-border bg-bg/30">
            {/* Info and Page Size Selector */}
            <div className="flex items-center gap-4 text-xs font-semibold text-primary/60">
              <span>
                Showing{" "}
                <strong className="text-primary font-bold">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)}
                </strong>{" "}
                to{" "}
                <strong className="text-primary font-bold">
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </strong>{" "}
                of <strong className="text-primary font-bold">{filteredUsers.length}</strong> accounts
              </span>

              <div className="flex items-center gap-1.5">
                <label htmlFor="pageSizeSelect" className="text-primary/50">Rows:</label>
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-surface border border-border rounded-lg text-primary focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Numeric Page Navigator */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="px-1 text-xs text-primary/40 font-bold">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-primary text-white shadow-2xs"
                            : "bg-surface border border-border text-primary/70 hover:text-primary hover:bg-bg"
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
                className="p-2 rounded-xl border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT WINDOW / DRAWER (CREATE USER) - SMOOTH PREMIUM TRANSITION */}
      {/* ========================================================================= */}
      {isDrawerMounted && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div
            className={`fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !loading && closeDrawer()}
          />

          {/* Slide Drawer Panel (Slides Right-to-Left on open, Left-to-Right on close) */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-bg/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary text-white shadow-xs">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary leading-tight">Add New User</h3>
                    <p className="text-xs sm:text-sm text-primary/55 mt-0.5 font-medium">
                      Provision student, faculty, or admin account
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  disabled={loading}
                  className="p-2 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body - fully scrollable with mouse wheel, touch & trackpad */}
              <form 
                id="create-user-form" 
                data-lenis-prevent
                onSubmit={handleSingleSubmit} 
                className="p-6 space-y-5 flex-1 overflow-y-auto overscroll-contain"
              >
                {/* Role Selector Segmented Buttons */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-primary/60 mb-2.5">
                    Account Role *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { id: "student", label: "Student", icon: GraduationCap },
                        { id: "faculty", label: "Faculty", icon: BookOpen },
                        { id: "admin", label: "Admin", icon: ShieldCheck },
                      ] as const
                    ).map((r) => {
                      const Icon = r.icon;
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-bg text-primary/70 border-border hover:border-primary/30"
                          }`}
                        >
                          <Icon className="h-5 w-5 mb-1.5" />
                          <span>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aswin Sai"
                    className="w-full px-4 py-3 text-sm sm:text-base bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium placeholder:text-primary/40"
                  />
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Official College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "student"
                        ? "e.g., 23331a4745@mvgrce.edu.in"
                        : "e.g., faculty@mvgrce.edu.in"
                    }
                    className="w-full px-4 py-3 text-sm sm:text-base bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium placeholder:text-primary/40"
                  />
                </div>

                {/* Conditional Fields for Students */}
                {role === "student" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                        Branch Specialization *
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-3 text-sm sm:text-base bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                        Current Semester *
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-4 py-3 text-sm sm:text-base bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium cursor-pointer"
                      >
                        {semesters.map((s) => (
                          <option key={s.number} value={s.number.toString()}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Password Policy Info Note */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Sparkles className="h-4 w-4 text-secondary shrink-0" />
                    <span>Security & Initial Credentials</span>
                  </div>
                  <p className="text-xs text-primary/70 leading-relaxed pt-0.5">
                    {role === "student"
                      ? "Initial password will default to student's uppercase roll number. Forced password change is required upon first login."
                      : "Initial password will default to 'ChangeMe1234!'. Forced password change is enforced on first sign-in."}
                  </p>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-border bg-bg/40 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={loading}
                  className="px-5 py-3 text-sm font-semibold text-primary/70 hover:text-primary rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-user-form"
                  disabled={loading}
                  className="px-7 py-3 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH IMPORT CSV MODAL - SMOOTH TRANSITION */}
      {/* ========================================================================= */}
      {isCsvMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isCsvVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !csvLoading && closeCsvModal()}
          />
          <div
            data-lenis-prevent
            className={`bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] flex flex-col relative z-10 transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
              isCsvVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-primary">Batch Import Roster (CSV)</h3>
                  <p className="text-xs sm:text-sm text-primary/60 mt-0.5 font-medium">Bulk provision student and faculty accounts</p>
                </div>
              </div>
              <button
                onClick={closeCsvModal}
                disabled={csvLoading}
                className="p-2 text-primary/50 hover:text-primary rounded-xl cursor-pointer hover:bg-bg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="space-y-4 overflow-y-auto flex-1 pr-1 overscroll-contain">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-secondary/50 transition-colors bg-bg/50">
                <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                <label className="text-sm font-bold text-secondary hover:underline cursor-pointer block">
                  Select or drag CSV file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-primary/50 mt-1 block font-medium">
                  Required columns: <code>email, name, role, branch, semester</code>
                </span>
              </div>

              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-primary">
                    Preview Data ({csvPreview.length} entries parsed):
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-bg font-bold text-primary/50 border-b border-border">
                        <tr>
                          <th className="p-3">Email</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Branch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-bg/25">
                            <td className="p-3 font-medium text-primary">{row.email}</td>
                            <td className="p-3 text-primary/80">{row.name}</td>
                            <td className="p-3 font-bold uppercase">{row.role || "student"}</td>
                            <td className="p-3">{row.branch || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 10 && (
                    <span className="text-xs text-primary/40 italic block">
                      Showing first 10 rows of {csvPreview.length} total.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={closeCsvModal}
                disabled={csvLoading}
                className="px-5 py-2.5 text-sm font-semibold text-primary/70 hover:text-primary rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvSubmit}
                disabled={csvLoading || csvPreview.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {csvLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Roster...
                  </>
                ) : (
                  "Execute Import"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
