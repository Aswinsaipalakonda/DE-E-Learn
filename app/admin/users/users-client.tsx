"use client";

import { useState, useMemo } from "react";
import { createUserAction, updateUserAction, deleteUserAction, batchCreateUsersAction, toggleUserStatus } from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Upload, 
  Search, 
  X, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Briefcase
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
  section: string | null;
  designation: string | null;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  branches: BranchOption[];
  semesters: SemesterOption[];
}

const DEFAULT_DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Distinguished Associate Professor",
  "Assistant Professor"
];

export default function UsersClient({ initialUsers, branches, semesters }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Slide-over Right Drawer Animation State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Delete Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // CSV Modal Animation State
  const [isCsvMounted, setIsCsvMounted] = useState(false);
  const [isCsvVisible, setIsCsvVisible] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "admin">("student");
  const [branch, setBranch] = useState(branches[0]?.code || "CIC");
  const [semester, setSemester] = useState("1");
  const [status, setStatus] = useState<"active" | "deactivated">("active");

  // Student Section State
  const [section, setSection] = useState("A");
  const [availableSections, setAvailableSections] = useState<string[]>(["A", "B"]);
  const [customSectionInput, setCustomSectionInput] = useState("");
  const [isAddingNewSection, setIsAddingNewSection] = useState(false);

  // Faculty Designation State
  const [designation, setDesignation] = useState("Assistant Professor");
  const [availableDesignations, setAvailableDesignations] = useState<string[]>(DEFAULT_DESIGNATIONS);
  const [customDesignationInput, setCustomDesignationInput] = useState("");
  const [isAddingNewDesignation, setIsAddingNewDesignation] = useState(false);

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

  // Open Drawer in Create Mode
  const openCreateDrawer = () => {
    setEditingUser(null);
    setEmail("");
    setName("");
    setRole("student");
    setBranch(branches[0]?.code || "CIC");
    setSemester("1");
    setSection("A");
    setDesignation("Assistant Professor");
    setStatus("active");
    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawerVisible(true);
      });
    });
  };

  // Open Drawer in Edit Mode
  const openEditDrawer = (user: UserItem) => {
    setEditingUser(user);
    setEmail(user.email);
    setName(user.name);
    setRole(user.role);
    setBranch(user.branch || branches[0]?.code || "CIC");
    setSemester(user.current_semester ? user.current_semester.toString() : "1");
    setSection(user.section || "A");
    setDesignation(user.designation || "Assistant Professor");
    setStatus(user.status);

    if (user.designation && !availableDesignations.includes(user.designation)) {
      setAvailableDesignations((prev) => [...prev, user.designation!]);
    }
    if (user.section && !availableSections.includes(user.section)) {
      setAvailableSections((prev) => [...prev, user.section!]);
    }

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
      setEditingUser(null);
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

  // Dynamic unique sections list
  const allKnownSections = useMemo(() => {
    const secSet = new Set<string>(availableSections);
    users.forEach((u) => {
      if (u.section) secSet.add(u.section);
    });
    return Array.from(secSet).sort();
  }, [availableSections, users]);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchesBranch = branchFilter === "all" ? true : u.branch === branchFilter;
      const matchesSection = sectionFilter === "all" ? true : u.section === sectionFilter;
      const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter;

      return matchesSearch && matchesRole && matchesBranch && matchesSection && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, branchFilter, sectionFilter, statusFilter]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIdx, startIdx + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleRoleTabChange = (newRole: string) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Dynamic Section Add Handler
  const handleAddCustomSection = () => {
    const trimmed = customSectionInput.trim().toUpperCase();
    if (trimmed) {
      if (!availableSections.includes(trimmed)) {
        setAvailableSections((prev) => [...prev, trimmed]);
      }
      setSection(trimmed);
      setCustomSectionInput("");
      setIsAddingNewSection(false);
    }
  };

  // Dynamic Designation Add Handler
  const handleAddCustomDesignation = () => {
    const trimmed = customDesignationInput.trim();
    if (trimmed) {
      if (!availableDesignations.includes(trimmed)) {
        setAvailableDesignations((prev) => [...prev, trimmed]);
      }
      setDesignation(trimmed);
      setCustomDesignationInput("");
      setIsAddingNewDesignation(false);
    }
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

  // Form Submit (Create OR Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const semNum = role === "student" && semester ? parseInt(semester, 10) : null;
    const branchVal = role === "admin" ? null : branch;
    const sectionVal = role === "student" ? section : null;
    const designationVal = role === "faculty" ? designation : null;

    try {
      if (editingUser) {
        // UPDATE Existing User
        const result = await updateUserAction(editingUser.id, {
          name,
          role,
          branch: branchVal,
          semester: semNum,
          section: sectionVal,
          designation: designationVal,
          status,
        });

        if (result.error) {
          addToast("error", "Update Failed", result.error);
        } else {
          addToast("success", "Profile Updated", `${name}'s account details have been modified.`);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    name,
                    role,
                    branch: branchVal,
                    current_semester: semNum,
                    section: sectionVal,
                    designation: designationVal,
                    status,
                  }
                : u
            )
          );
          closeDrawer();
        }
      } else {
        // CREATE New User
        const result = await createUserAction(
          email,
          name,
          role,
          branchVal,
          semNum,
          sectionVal,
          designationVal
        );

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
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred while saving user.");
    } finally {
      setLoading(false);
    }
  };

  // Delete User Handler
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleteLoading(true);

    try {
      const result = await deleteUserAction(deletingUser.id, deletingUser.email);
      if (result.error) {
        addToast("error", "Delete Failed", result.error);
      } else {
        addToast("success", "User Deleted", `${deletingUser.name}'s account was removed from the roster.`);
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete user account.");
    } finally {
      setIsDeleteLoading(false);
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
        section: item.section ? item.section.toUpperCase().trim() : "A",
        designation: item.designation ? item.designation.trim() : "Assistant Professor",
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

  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  const getRoleStyle = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case "student":
        return {
          avatarBg: "bg-blue-50 text-blue-700 border-blue-200/80 font-bold",
          badge: "bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold",
          label: "STUDENT",
        };
      case "faculty":
        return {
          avatarBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold",
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold",
          label: "FACULTY",
        };
      case "admin":
        return {
          avatarBg: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
          badge: "bg-slate-100 text-slate-800 border border-slate-300 font-semibold",
          label: "ADMIN",
        };
      default:
        return {
          avatarBg: "bg-gray-100 text-gray-700 border-gray-200 font-bold",
          badge: "bg-gray-100 text-gray-700 border border-gray-200 font-semibold",
          label: userRole.toUpperCase(),
        };
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Alert Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* UNIFIED EXECUTIVE PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-xs">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                User Management & Roster
              </h1>
              <p className="text-xs sm:text-sm text-primary/60 font-normal leading-relaxed mt-0.5">
                Provision and manage students, faculty designations, and administrators across department cohorts.
              </p>
            </div>
          </div>

          {/* Stat Counter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg border border-border text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              Total: <span className="font-semibold">{counts.total}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Students: <span className="font-semibold">{counts.students}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Faculty: <span className="font-semibold">{counts.faculty}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
              Admins: <span className="font-semibold">{counts.admins}</span>
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
          <button
            onClick={openCsvModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-bg hover:bg-surface text-primary font-medium text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer"
          >
            <Upload className="h-4 w-4 text-primary/70" />
            <span>Batch Import</span>
          </button>

          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-surface p-4 sm:p-5 rounded-3xl border border-border shadow-xs space-y-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
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
                className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "bg-bg text-primary/70 hover:text-primary hover:bg-border/60 font-normal"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-surface border border-border text-primary/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Branch, Section & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-4 top-3 h-4 w-4 text-primary/40" />
            <input
              placeholder="Search by name, email, or designation..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 font-normal text-primary placeholder:text-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 top-3 text-primary/40 hover:text-primary p-0.5 rounded-full hover:bg-border cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="sm:col-span-3">
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm font-normal bg-bg border border-border rounded-full text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} ({b.name})
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="sm:col-span-2">
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm font-normal bg-bg border border-border rounded-full text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Sections</option>
              {allKnownSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm font-normal bg-bg border border-border rounded-full text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IMMERSIVE ROSTER DIRECTORY TABLE WITH FULL CRUD ACTIONS */}
      {/* ========================================================================= */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg/50 text-primary/50 font-semibold uppercase tracking-wider text-xs border-b border-border">
                  <th className="py-3.5 pl-6 pr-4">User</th>
                  <th className="py-3.5 px-4">Official Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Scope, Term / Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((u) => {
                  const isToggling = togglingId === u.id;
                  const roleStyle = getRoleStyle(u.role);
                  const initials = getInitials(u.name);

                  return (
                    <tr key={u.id} className="hover:bg-bg/30 transition-colors group">
                      {/* Name & Initials Avatar */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs shrink-0 ${roleStyle.avatarBg}`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-primary text-sm leading-snug group-hover:text-secondary transition-colors">
                              {u.name}
                            </h3>
                            <span className="text-[11px] text-primary/50 font-normal block mt-0.5">
                              Registered: {new Date(u.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-primary/70 text-sm font-normal">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary/40 shrink-0" />
                          <span className="truncate max-w-[220px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${roleStyle.badge}`}>
                          {roleStyle.label}
                        </span>
                      </td>

                      {/* Scope, Term / Designation */}
                      <td className="py-3.5 px-4">
                        {u.role === "student" ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {u.branch && (
                              <span className="px-2.5 py-0.5 rounded-full bg-bg border border-border text-xs font-medium text-primary">
                                {u.branch}
                              </span>
                            )}
                            {u.current_semester && (
                              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-[11px] font-medium text-secondary">
                                Sem {u.current_semester}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                              Sec {u.section || "A"}
                            </span>
                          </div>
                        ) : u.role === "faculty" ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-emerald-600" />
                              {u.designation || "Assistant Professor"}
                            </span>
                            {u.branch && (
                              <span className="px-2 py-0.5 rounded-full bg-bg border border-border text-[11px] font-medium text-primary/70">
                                {u.branch}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-primary/40 font-normal text-xs">— System Administrator</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/70">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Full CRUD Actions: Edit, Status Toggle, Delete */}
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Trigger */}
                          <button
                            onClick={() => openEditDrawer(u)}
                            title="Edit User Profile"
                            className="p-1.5 rounded-full border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status, u.name)}
                            disabled={isToggling}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                              u.status === "active"
                                ? "bg-surface hover:bg-red-50 text-primary/70 hover:text-red-700 border-border hover:border-red-200/80 shadow-2xs"
                                : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/80 shadow-2xs"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                            ) : u.status === "active" ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </button>

                          {/* Delete Trigger */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-full border border-red-200/60 bg-red-50/50 text-red-600 hover:bg-red-100/80 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-bg border border-border flex items-center justify-center text-primary/40">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-sm">No Users Found</h3>
              <p className="text-xs text-primary/50 mt-0.5 max-w-sm mx-auto font-normal">
                No registered accounts match your current filter criteria.
              </p>
            </div>
            {(searchQuery || roleFilter !== "all" || branchFilter !== "all" || sectionFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setBranchFilter("all");
                  setSectionFilter("all");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-full bg-bg hover:bg-border text-xs font-medium text-primary transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================================================= */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-bg/20">
            <div className="flex items-center gap-3 text-xs font-normal text-primary/60">
              <span>
                Showing{" "}
                <span className="text-primary font-semibold">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)}
                </span>{" "}
                to{" "}
                <span className="text-primary font-semibold">
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </span>{" "}
                of <span className="text-primary font-semibold">{filteredUsers.length}</span> accounts
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
                  className="px-2.5 py-0.5 text-xs font-medium bg-surface border border-border rounded-full text-primary focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface transition-all cursor-pointer disabled:cursor-not-allowed"
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
                      {showEllipsis && <span className="px-1 text-xs text-primary/40 font-normal">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-full text-xs transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-primary text-white shadow-2xs font-semibold"
                            : "bg-surface border border-border text-primary/70 hover:text-primary hover:bg-bg font-normal"
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
                className="p-2 rounded-full border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg disabled:opacity-40 disabled:hover:bg-surface transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT WINDOW / DRAWER (CREATE / EDIT USER) */}
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

          {/* Slide Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-border bg-bg/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary text-white shadow-xs">
                    {editingUser ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary leading-tight">
                      {editingUser ? "Edit User Profile" : "Add New User"}
                    </h3>
                    <p className="text-xs text-primary/55 font-normal mt-0.5">
                      {editingUser
                        ? `Modify account scope and role for ${editingUser.name}`
                        : "Provision student, faculty, or admin account"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  disabled={loading}
                  className="p-2 rounded-full text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form 
                id="user-manage-form" 
                data-lenis-prevent
                onSubmit={handleFormSubmit} 
                className="p-5 sm:p-6 space-y-4.5 flex-1 overflow-y-auto overscroll-contain"
              >
                {/* Role Selector Segmented Buttons */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-2">
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
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                              : "bg-bg text-primary/70 border-border hover:border-primary/30 font-medium"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aswin Sai"
                    className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal placeholder:text-primary/40"
                  />
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                    Official College Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "student"
                        ? "e.g., 23331a4745@mvgrce.edu.in"
                        : "e.g., faculty@mvgrce.edu.in"
                    }
                    className={`w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal placeholder:text-primary/40 ${
                      editingUser ? "opacity-60 cursor-not-allowed bg-border/40" : ""
                    }`}
                  />
                  {editingUser && (
                    <span className="text-[11px] text-primary/40 mt-1 block">Email address cannot be changed once provisioned.</span>
                  )}
                </div>

                {/* Conditional Fields for Faculty: Designation */}
                {role === "faculty" && (
                  <div className="space-y-3.5 pt-0.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60">
                          Faculty Designation *
                        </label>
                        {!isAddingNewDesignation && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewDesignation(true)}
                            className="text-xs font-medium text-secondary hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Designation</span>
                          </button>
                        )}
                      </div>

                      {/* Designation Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableDesignations.map((desig) => {
                          const isDesigSelected = designation === desig;
                          return (
                            <button
                              key={desig}
                              type="button"
                              onClick={() => setDesignation(desig)}
                              className={`px-3.5 py-2 rounded-2xl text-xs text-left border transition-all cursor-pointer flex items-center justify-between ${
                                isDesigSelected
                                  ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                                  : "bg-bg text-primary/70 border-border hover:border-primary/40 font-medium"
                              }`}
                            >
                              <span>{desig}</span>
                              {isDesigSelected && <span className="h-1.5 w-1.5 rounded-full bg-white ml-2" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Inline Input for New Designation */}
                      {isAddingNewDesignation && (
                        <div className="flex items-center gap-2 mt-2 p-1.5 bg-bg border border-border rounded-full animate-in fade-in">
                          <input
                            type="text"
                            placeholder="e.g. Dean of Academic Affairs"
                            value={customDesignationInput}
                            onChange={(e) => setCustomDesignationInput(e.target.value)}
                            className="px-3.5 py-1 text-xs bg-surface border border-border rounded-full font-medium text-primary flex-1 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomDesignation}
                            disabled={!customDesignationInput.trim()}
                            className="px-3.5 py-1 bg-primary text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-40"
                          >
                            Add & Select
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewDesignation(false)}
                            className="p-1 text-primary/40 hover:text-primary cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Department Branch for Faculty */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                        Department Specialization
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Conditional Fields for Students */}
                {role === "student" && (
                  <div className="space-y-3.5 pt-0.5">
                    {/* Branch */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                        Branch Specialization *
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                      >
                        {branches.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                        Current Semester *
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                      >
                        {semesters.map((s) => (
                          <option key={s.number} value={s.number.toString()}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Section Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60">
                          Section Cohort *
                        </label>
                        {!isAddingNewSection && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewSection(true)}
                            className="text-xs font-medium text-secondary hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Section</span>
                          </button>
                        )}
                      </div>

                      {/* Section Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        {availableSections.map((sec) => {
                          const isSecSelected = section === sec;
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setSection(sec)}
                              className={`px-4 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
                                isSecSelected
                                  ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                                  : "bg-bg text-primary/70 border-border hover:border-primary/40 font-medium"
                              }`}
                            >
                              Section {sec}
                            </button>
                          );
                        })}
                      </div>

                      {/* Inline Input for New Section */}
                      {isAddingNewSection && (
                        <div className="flex items-center gap-2 mt-2 p-1.5 bg-bg border border-border rounded-full animate-in fade-in">
                          <input
                            type="text"
                            maxLength={3}
                            placeholder="e.g. C"
                            value={customSectionInput}
                            onChange={(e) => setCustomSectionInput(e.target.value.toUpperCase())}
                            className="px-3 py-1 text-xs bg-surface border border-border rounded-full uppercase font-semibold text-primary w-20 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomSection}
                            disabled={!customSectionInput.trim()}
                            className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-40"
                          >
                            Add & Select
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewSection(false)}
                            className="p-1 text-primary/40 hover:text-primary cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Mode: Account Status Selector */}
                {editingUser && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "active" | "deactivated")}
                      className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                    >
                      <option value="active">Active (Access Enabled)</option>
                      <option value="deactivated">Deactivated (Locked Out)</option>
                    </select>
                  </div>
                )}

                {/* Password Policy Info Note */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>Security Policy</span>
                  </div>
                  <p className="text-[11px] text-primary/65 leading-relaxed font-normal">
                    {editingUser
                      ? "Modifying profile information will immediately update access scopes and subject enrollments."
                      : role === "student"
                      ? "Initial password will default to student's uppercase roll number. Forced password change is required upon first login."
                      : "Initial password will default to 'ChangeMe1234!'. Forced password change is enforced on first sign-in."}
                  </p>
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-5 sm:p-6 border-t border-border bg-bg/40 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={loading}
                  className="px-5 py-2.5 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="user-manage-form"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-medium text-xs sm:text-sm rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{editingUser ? "Saving..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{editingUser ? "Save Changes" : "Create Account"}</span>
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
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isDeleteLoading && setDeletingUser(null)}
          />
          <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Delete User Account</h3>
            </div>
            <p className="text-xs sm:text-sm text-primary/70 font-normal leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-primary font-semibold">{deletingUser.name}</strong> (<span className="text-primary/80 font-mono text-xs">{deletingUser.email}</span>)? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleteLoading}
                className="px-5 py-2 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleteLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleteLoading ? (
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
      {/* BATCH IMPORT CSV MODAL */}
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
            className={`bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] flex flex-col relative z-10 transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
              isCsvVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Batch Import Roster (CSV)</h3>
                  <p className="text-xs text-primary/60 font-normal mt-0.5">Bulk provision student and faculty accounts</p>
                </div>
              </div>
              <button
                onClick={closeCsvModal}
                disabled={csvLoading}
                className="p-2 text-primary/50 hover:text-primary rounded-full cursor-pointer hover:bg-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div data-lenis-prevent className="space-y-4 overflow-y-auto flex-1 pr-1 overscroll-contain">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-secondary/50 transition-colors bg-bg/50">
                <Upload className="h-7 w-7 text-primary/40 mx-auto mb-2" />
                <label className="text-xs font-semibold text-secondary hover:underline cursor-pointer block">
                  Select or drag CSV file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-primary/50 mt-1 block font-normal">
                  Required columns: <code>email, name, role, branch, semester, section, designation</code>
                </span>
              </div>

              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary">
                    Preview Data ({csvPreview.length} entries parsed):
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-bg font-semibold text-primary/50 border-b border-border">
                        <tr>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Scope/Designation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-bg/25">
                            <td className="p-2.5 font-normal text-primary">{row.email}</td>
                            <td className="p-2.5 text-primary/80 font-normal">{row.name}</td>
                            <td className="p-2.5 font-medium uppercase">{row.role || "student"}</td>
                            <td className="p-2.5 font-normal">
                              {row.role === "faculty" ? (row.designation || "Assistant Professor") : `${row.branch || "-"} Sec ${row.section || "A"}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={closeCsvModal}
                disabled={csvLoading}
                className="px-5 py-2.5 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvSubmit}
                disabled={csvLoading || csvPreview.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
