"use client";

import { useState } from "react";
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
  AlertCircle,
  Sparkles,
  ChevronRight
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
  const [roleFilter, setRoleFilter] = useState("");

  // Slide-over Right Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

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

        // Optimistically add user to table list
        if (result.user) {
          setUsers((prev) => [result.user as UserItem, ...prev]);
        }

        // Reset form & close drawer
        setEmail("");
        setName("");
        setIsDrawerOpen(false);
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
        setIsCsvModalOpen(false);
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

  const getRoleBadge = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case "student":
        return <span className="font-extrabold text-secondary tracking-wide text-xs">STUDENT</span>;
      case "faculty":
        return <span className="font-extrabold text-primary tracking-wide text-xs">FACULTY</span>;
      case "admin":
        return <span className="font-extrabold text-accent tracking-wide text-xs">ADMIN</span>;
      default:
        return <span className="font-extrabold text-primary/60 tracking-wide text-xs">{userRole.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Controls Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">Roster Directory</h2>
          <p className="text-xs text-primary/60 mt-0.5">
            Total registered accounts ({users.length}) across all departments.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-surface hover:bg-bg text-primary font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Upload className="h-4 w-4 text-primary/60" />
            <span>Batch Import CSV</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-primary/40" />
          <input
            placeholder="Search user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium text-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-bg border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Roster Table (Matching User Screenshot) */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const isToggling = togglingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-bg/25 transition-all font-medium">
                      <td className="p-4 pl-6 font-bold text-primary">{u.name}</td>
                      <td className="p-4 text-primary/70">{u.email}</td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">
                        {u.branch ? (
                          <span className="px-2 py-0.5 rounded-md bg-bg border border-border text-[10px] font-bold text-primary/70">
                            {u.branch}
                            {u.current_semester ? ` • Sem ${u.current_semester}` : ""}
                          </span>
                        ) : (
                          <span className="text-primary/30 font-semibold">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "active"
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-danger/10 text-danger border border-danger/20"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status, u.name)}
                          disabled={isToggling}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                            u.status === "active"
                              ? "bg-surface hover:bg-danger/10 text-primary/70 hover:text-danger border-border hover:border-danger/30"
                              : "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
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
          <div className="py-20 text-center text-primary/45 font-semibold text-sm">
            No registered users found matching the filter.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT WINDOW / DRAWER (CREATE USER) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-all duration-300">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => !loading && setIsDrawerOpen(false)}
          />

          {/* Slide Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in slide-in-from-right">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-bg/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary text-white shadow-xs">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">Add New User</h3>
                    <p className="text-xs text-primary/50 mt-0.5">
                      Provision student, faculty, or admin account
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={loading}
                  className="p-1.5 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form id="create-user-form" onSubmit={handleSingleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">

                {/* Role Selector Segmented Buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-2">
                    Account Role *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
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
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-bg text-primary/70 border-border hover:border-primary/30"
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aswin Sai"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium"
                  />
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
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
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium"
                  />
                </div>

                {/* Conditional Fields for Students */}
                {role === "student" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                        Branch Specialization *
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium"
                      >
                        {branches.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                        Current Semester *
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-medium"
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
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-secondary" />
                    <span>Security & Initial Credentials</span>
                  </div>
                  <p className="text-[11px] text-primary/70 leading-relaxed">
                    {role === "student"
                      ? "Initial password will default to student's uppercase roll number. Forced password change is required upon first login."
                      : "Initial password will default to 'ChangeMe1234!'. Forced password change is enforced on first sign-in."}
                  </p>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-border bg-bg/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-semibold text-primary/70 hover:text-primary rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-user-form"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH IMPORT CSV MODAL */}
      {/* ========================================================================= */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Batch Import Roster (CSV)</h3>
                  <p className="text-xs text-primary/60 mt-0.5">Bulk provision student and faculty accounts</p>
                </div>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                disabled={csvLoading}
                className="p-1.5 text-primary/50 hover:text-primary rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-secondary/50 transition-colors bg-bg/50">
                <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                <label className="text-xs font-bold text-secondary hover:underline cursor-pointer block">
                  Select or drag CSV file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-primary/50 mt-1 block">
                  Required columns: <code>email, name, role, branch, semester</code>
                </span>
              </div>

              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary">
                    Preview Data ({csvPreview.length} entries parsed):
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-bg font-bold text-primary/50 border-b border-border">
                        <tr>
                          <th className="p-2">Email</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Branch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-bg/25">
                            <td className="p-2 font-medium text-primary">{row.email}</td>
                            <td className="p-2 text-primary/80">{row.name}</td>
                            <td className="p-2 font-bold uppercase">{row.role || "student"}</td>
                            <td className="p-2">{row.branch || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 10 && (
                    <span className="text-[10px] text-primary/40 italic block">
                      Showing first 10 rows of {csvPreview.length} total.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                disabled={csvLoading}
                className="px-5 py-2.5 text-xs font-semibold text-primary/70 hover:text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvSubmit}
                disabled={csvLoading || csvPreview.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
