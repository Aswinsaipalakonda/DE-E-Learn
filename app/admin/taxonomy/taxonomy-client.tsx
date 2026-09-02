"use client";

import { useState, useMemo } from "react";
import { createSubjectAction, updateSubjectAction, deleteSubjectAction, toggleSubjectActiveAction, createBranchAction, deleteBranchAction } from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { 
  BookOpen, 
  FolderPlus, 
  Plus, 
  Search, 
  X, 
  Loader2, 
  Calendar, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Layers,
  Pencil,
  Trash2,
  Check,
  ChevronDown,
  CheckSquare
} from "lucide-react";

interface Branch {
  code: string;
  name: string;
  active: boolean;
}

interface Semester {
  number: number;
  name: string;
  active: boolean;
}

interface Subject {
  code: string;
  title: string;
  branch: string;
  semester: number;
  active: boolean;
}

interface TaxonomyClientProps {
  branches: Branch[];
  semesters: Semester[];
  subjects: Subject[];
}

export default function TaxonomyClient({
  branches: initialBranches,
  semesters: initialSemesters,
  subjects: initialSubjects,
}: TaxonomyClientProps) {
  // Navigation Tabs: "subjects" | "branches" | "semesters"
  const [activeTab, setActiveTab] = useState<"subjects" | "branches" | "semesters">("subjects");

  // Master Data
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [semesters] = useState<Semester[]>(initialSemesters);

  // Filter States for Subjects
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination for Subjects
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Slide-over Right Drawer for Subject Creation & Editing
  const [isSubjectDrawerMounted, setIsSubjectDrawerMounted] = useState(false);
  const [isSubjectDrawerVisible, setIsSubjectDrawerVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ originalCode: string; originalBranch: string } | null>(null);

  // Delete Subject Confirmation Modal
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

  // Modal for Branch Creation
  const [isBranchModalMounted, setIsBranchModalMounted] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);

  // Delete Branch Confirmation Modal
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);

  // Subject Form State (Supports Multiple Branches)
  const [subCode, setSubCode] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [subBranches, setSubBranches] = useState<string[]>([initialBranches[0]?.code || "CIC"]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [subSemester, setSubSemester] = useState("1");
  const [subActive, setSubActive] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Branch Form State
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);

  // Toggling State
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Branch selection toggle helper
  const toggleBranchSelection = (bCode: string) => {
    setSubBranches((prev) => {
      if (prev.includes(bCode)) {
        if (prev.length === 1) return prev; // Keep at least one branch selected
        return prev.filter((b) => b !== bCode);
      } else {
        return [...prev, bCode];
      }
    });
  };

  // Toggle select all branches
  const toggleSelectAllBranches = () => {
    if (subBranches.length === branches.length) {
      setSubBranches([branches[0]?.code || "CIC"]);
    } else {
      setSubBranches(branches.map((b) => b.code));
    }
  };

  // Open Drawer in Create Mode
  const openSubjectDrawer = () => {
    setEditingSubject(null);
    setSubCode("");
    setSubTitle("");
    setSubBranches(branches.map((b) => b.code)); // Default to all branches for convenience
    setSubSemester("1");
    setSubActive(true);
    setIsBranchDropdownOpen(false);
    setIsSubjectDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSubjectDrawerVisible(true);
      });
    });
  };

  // Open Drawer in Edit Mode
  const openEditSubjectDrawer = (subject: Subject) => {
    setEditingSubject({ originalCode: subject.code, originalBranch: subject.branch });
    setSubCode(subject.code);
    setSubTitle(subject.title);
    setSubBranches([subject.branch]);
    setSubSemester(subject.semester.toString());
    setSubActive(subject.active);
    setIsBranchDropdownOpen(false);
    setIsSubjectDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSubjectDrawerVisible(true);
      });
    });
  };

  const closeSubjectDrawer = () => {
    setIsSubjectDrawerVisible(false);
    setIsBranchDropdownOpen(false);
    setTimeout(() => {
      setIsSubjectDrawerMounted(false);
      setEditingSubject(null);
    }, 450);
  };

  const openBranchModal = () => {
    setIsBranchModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsBranchModalVisible(true);
      });
    });
  };

  const closeBranchModal = () => {
    setIsBranchModalVisible(false);
    setTimeout(() => {
      setIsBranchModalMounted(false);
    }, 400);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter((s) => s.active).length;
    const totalBranches = branches.length;
    const totalSemesters = initialSemesters.length;
    return { totalSubjects, activeSubjects, totalBranches, totalSemesters };
  }, [subjects, branches, initialSemesters]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = branchFilter === "all" ? true : s.branch === branchFilter;
      const matchesSemester = semesterFilter === "all" ? true : s.semester.toString() === semesterFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? s.active
          : !s.active;

      return matchesSearch && matchesBranch && matchesSemester && matchesStatus;
    });
  }, [subjects, searchQuery, branchFilter, semesterFilter, statusFilter]);

  // Paginated Subjects
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / pageSize));
  const paginatedSubjects = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(startIdx, startIdx + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  // Submit Handler for Subject (Create OR Update)
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subBranches.length === 0) {
      addToast("error", "Branch Selection Required", "Please select at least one branch for this subject.");
      return;
    }
    setSubjectLoading(true);

    const semNum = parseInt(subSemester, 10);
    const formattedCode = subCode.toUpperCase().trim();
    const formattedTitle = subTitle.trim();

    try {
      if (editingSubject) {
        // UPDATE Subject
        const result = await updateSubjectAction(
          editingSubject.originalCode,
          editingSubject.originalBranch,
          {
            code: formattedCode,
            title: formattedTitle,
            branches: subBranches,
            semester: semNum,
            active: subActive,
          }
        );

        if (result.error) {
          addToast("error", "Subject Update Failed", result.error);
        } else {
          addToast(
            "success", 
            "Subject Updated", 
            `${formattedCode} - ${formattedTitle} updated across ${subBranches.join(", ")}.`
          );
          const updatedRecords = subBranches.map((b) => ({
            code: formattedCode,
            title: formattedTitle,
            branch: b,
            semester: semNum,
            active: subActive,
          }));
          setSubjects((prev) => [
            ...updatedRecords,
            ...prev.filter((s) => !(
              (s.code === editingSubject.originalCode && s.branch === editingSubject.originalBranch) ||
              (s.code === formattedCode && subBranches.includes(s.branch))
            )),
          ]);
          closeSubjectDrawer();
        }
      } else {
        // CREATE Subject across selected branches
        const result = await createSubjectAction(
          formattedCode,
          formattedTitle,
          subBranches,
          semNum
        );

        if (result.error) {
          addToast("error", "Subject Creation Failed", result.error);
        } else {
          addToast(
            "success",
            "Subject Created Successfully",
            `${formattedCode} - ${formattedTitle} registered for ${subBranches.join(", ")}.`
          );
          const createdRecords = subBranches.map((b) => ({
            code: formattedCode,
            title: formattedTitle,
            branch: b,
            semester: semNum,
            active: true,
          }));
          setSubjects((prev) => [
            ...createdRecords,
            ...prev.filter((s) => !(s.code === formattedCode && subBranches.includes(s.branch))),
          ]);
          setSubCode("");
          setSubTitle("");
          closeSubjectDrawer();
        }
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred.");
    } finally {
      setSubjectLoading(false);
    }
  };

  // Delete Subject Handler
  const handleDeleteSubjectConfirm = async () => {
    if (!deletingSubject) return;
    setIsDeletingSubject(true);

    try {
      const result = await deleteSubjectAction(deletingSubject.code, deletingSubject.branch);
      if (result.error) {
        addToast("error", "Delete Failed", result.error);
      } else {
        addToast("success", "Subject Deleted", `${deletingSubject.code} was removed from the catalog.`);
        setSubjects((prev) =>
          prev.filter((s) => !(s.code === deletingSubject.code && s.branch === deletingSubject.branch))
        );
        setDeletingSubject(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete subject.");
    } finally {
      setIsDeletingSubject(false);
    }
  };

  // Create Branch Handler
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchLoading(true);

    const formattedCode = branchCode.toUpperCase().trim();
    const formattedName = branchName.trim();

    try {
      const result = await createBranchAction(formattedCode, formattedName);
      if (result.error) {
        addToast("error", "Branch Creation Failed", result.error);
      } else {
        addToast(
          "success",
          "Branch Created Successfully",
          `${formattedCode} (${formattedName}) is now registered.`
        );
        setBranches((prev) => [
          ...prev,
          { code: formattedCode, name: formattedName, active: true },
        ]);
        setBranchCode("");
        setBranchName("");
        closeBranchModal();
      }
    } catch {
      addToast("error", "Error", "Failed to create branch.");
    } finally {
      setBranchLoading(false);
    }
  };

  // Delete Branch Handler
  const handleDeleteBranchConfirm = async () => {
    if (!deletingBranch) return;
    setIsDeletingBranch(true);

    try {
      const result = await deleteBranchAction(deletingBranch.code);
      if (result.error) {
        addToast("error", "Delete Failed", result.error);
      } else {
        addToast("success", "Branch Deleted", `${deletingBranch.code} specialization was removed.`);
        setBranches((prev) => prev.filter((b) => b.code !== deletingBranch.code));
        setDeletingBranch(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete branch.");
    } finally {
      setIsDeletingBranch(false);
    }
  };

  const handleToggleSubject = async (code: string, branch: string, currentActive: boolean) => {
    setTogglingCode(`${code}-${branch}`);
    try {
      const result = await toggleSubjectActiveAction(code, branch, currentActive);
      if (result.error) {
        addToast("error", "Status Toggle Failed", result.error);
      } else {
        setSubjects((prev) =>
          prev.map((s) =>
            s.code === code && s.branch === branch
              ? { ...s, active: !currentActive }
              : s
          )
        );
        addToast(
          "info",
          "Subject Status Updated",
          `${code} is now ${!currentActive ? "ACTIVE" : "INACTIVE"}.`
        );
      }
    } catch {
      addToast("error", "Error", "Failed to update subject status.");
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Alert Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* UNIFIED EXECUTIVE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Courses & Academic Taxonomy
              </h1>
              <p className="text-xs sm:text-sm text-primary/60 font-normal leading-relaxed mt-0.5">
                Configure curriculum catalogs, departmental branches, semesters, and course syllabus codes.
              </p>
            </div>
          </div>

          {/* Stat Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Subjects: <span className="font-semibold">{stats.totalSubjects}</span> ({stats.activeSubjects} Active)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Branches: <span className="font-semibold">{stats.totalBranches}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
              Semesters: <span className="font-semibold">{stats.totalSemesters}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
          <button
            onClick={openBranchModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-bg hover:bg-surface text-primary font-medium text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-primary/70" />
            <span>Add Branch</span>
          </button>

          <button
            onClick={openSubjectDrawer}
            className="inline-flex items-center gap-2 px-5.5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="bg-surface p-4 sm:p-5 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
          {[
            { id: "subjects", label: "Subjects Catalog", count: subjects.length, icon: BookOpen },
            { id: "branches", label: "Department Branches", count: branches.length, icon: FolderPlus },
            { id: "semesters", label: "Semester Timelines", count: semesters.length, icon: Calendar },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as "subjects" | "branches" | "semesters");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "bg-bg text-primary/70 hover:text-primary hover:bg-border/60 font-normal"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
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

        {/* Subjects Tab Toolbar Filter Controls */}
        {activeTab === "subjects" && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-0.5">
            {/* Search Box */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-4 top-3 h-4 w-4 text-primary/40" />
              <input
                placeholder="Search subject code or title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-10 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 font-normal text-primary placeholder:text-primary/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3.5 top-3 text-primary/40 hover:text-primary p-0.5 rounded-full hover:bg-border cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Branch Selector */}
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

            {/* Semester Selector */}
            <div className="sm:col-span-2">
              <select
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 text-sm font-normal bg-bg border border-border rounded-full text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.number} value={s.number.toString()}>
                    Sem {s.number}
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
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBJECTS CATALOG VIEW WITH FULL CRUD ACTIONS */}
      {/* ========================================================================= */}
      {activeTab === "subjects" && (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
          {paginatedSubjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-bg/50 text-primary/50 font-semibold uppercase tracking-wider text-xs border-b border-border">
                    <th className="py-3.5 pl-6 pr-4">Course Code</th>
                    <th className="py-3.5 px-4">Subject Title</th>
                    <th className="py-3.5 px-4">Branch Specialization</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedSubjects.map((sub) => {
                    const isToggling = togglingCode === `${sub.code}-${sub.branch}`;

                    return (
                      <tr key={`${sub.code}-${sub.branch}`} className="hover:bg-bg/30 transition-colors group">
                        {/* Course Code Badge */}
                        <td className="py-3.5 pl-6 pr-4">
                          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs">
                            {sub.code}
                          </span>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4 font-semibold text-primary text-sm leading-snug group-hover:text-secondary transition-colors">
                          {sub.title}
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-bg border border-border text-xs font-medium text-primary">
                            {sub.branch}
                          </span>
                        </td>

                        {/* Semester */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-medium text-secondary">
                            Semester {sub.semester}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {sub.active ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Full CRUD Actions: Edit, Toggle, Delete */}
                        <td className="py-3.5 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Trigger */}
                            <button
                              onClick={() => openEditSubjectDrawer(sub)}
                              title="Edit Subject"
                              className="p-1.5 rounded-full border border-border bg-surface text-primary/70 hover:text-primary hover:bg-bg hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            {/* Activate / Deactivate Toggle */}
                            <button
                              onClick={() => handleToggleSubject(sub.code, sub.branch, sub.active)}
                              disabled={isToggling}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                                sub.active
                                  ? "bg-surface hover:bg-red-50 text-primary/70 hover:text-red-700 border-border hover:border-red-200/80 shadow-2xs"
                                  : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/80 shadow-2xs"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                              ) : sub.active ? (
                                "Deactivate"
                              ) : (
                                "Activate"
                              )}
                            </button>

                            {/* Delete Trigger */}
                            <button
                              onClick={() => setDeletingSubject(sub)}
                              title="Delete Subject"
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
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary text-sm">No Subjects Registered</h3>
                <p className="text-xs text-primary/50 mt-0.5 max-w-sm mx-auto font-normal">
                  No curriculum subject records match your current filter criteria.
                </p>
              </div>
              <button
                onClick={openSubjectDrawer}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-medium shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
              >
                + Add First Subject
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredSubjects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-bg/20">
              <div className="flex items-center gap-3 text-xs font-normal text-primary/60">
                <span>
                  Showing{" "}
                  <span className="text-primary font-semibold">
                    {Math.min((currentPage - 1) * pageSize + 1, filteredSubjects.length)}
                  </span>{" "}
                  to{" "}
                  <span className="text-primary font-semibold">
                    {Math.min(currentPage * pageSize, filteredSubjects.length)}
                  </span>{" "}
                  of <span className="text-primary font-semibold">{filteredSubjects.length}</span> subjects
                </span>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="taxPageSize" className="text-primary/50">Rows:</label>
                  <select
                    id="taxPageSize"
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
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRANCHES DIRECTORY VIEW WITH CRUD ACTIONS */}
      {/* ========================================================================= */}
      {activeTab === "branches" && (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-border/80 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary">Department Branch Specializations</h3>
              <p className="text-xs sm:text-sm text-primary/60 font-normal mt-0.5">
                Specializations under Data Engineering and Computer Science
              </p>
            </div>
            <button
              onClick={openBranchModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-medium text-xs shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Branch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg/50 text-primary/50 font-semibold uppercase tracking-wider text-xs border-b border-border">
                  <th className="py-3.5 pl-6 pr-4">Branch Code</th>
                  <th className="py-3.5 px-4">Full Program Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branches.map((b) => (
                  <tr key={b.code} className="hover:bg-bg/30 transition-colors">
                    <td className="py-3.5 pl-6 pr-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold text-xs">
                        {b.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary text-sm">
                      {b.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <button
                        onClick={() => setDeletingBranch(b)}
                        title="Delete Branch"
                        className="p-1.5 rounded-full border border-red-200/60 bg-red-50/50 text-red-600 hover:bg-red-100/80 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEMESTERS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "semesters" && (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-border/80">
            <h3 className="text-base sm:text-lg font-bold text-primary">Academic Semester Timelines</h3>
            <p className="text-xs sm:text-sm text-primary/60 font-normal mt-0.5">
              Standardized 4-Year B.Tech Curriculum Term Cycle
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6">
            {semesters.map((s) => (
              <div
                key={s.number}
                className="p-5 rounded-3xl border border-border bg-bg/50 hover:bg-surface hover:shadow-xs transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    TERM 0{s.number}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-semibold text-primary text-sm sm:text-base">{s.name}</h4>
                <p className="text-xs text-primary/50 font-normal">B.Tech Year {Math.ceil(s.number / 2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER RIGHT DRAWER (ADD / EDIT SUBJECT) */}
      {/* ========================================================================= */}
      {isSubjectDrawerMounted && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSubjectDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !subjectLoading && closeSubjectDrawer()}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
                isSubjectDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-border bg-bg/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary text-white shadow-xs">
                    {editingSubject ? <Pencil className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary leading-tight">
                      {editingSubject ? "Edit Curriculum Subject" : "Add New Subject"}
                    </h3>
                    <p className="text-xs text-primary/55 font-normal mt-0.5">
                      {editingSubject ? `Modify course syllabus code: ${editingSubject.originalCode}` : "Register curriculum course syllabus code"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeSubjectDrawer}
                  disabled={subjectLoading}
                  className="p-2 rounded-full text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form
                id="subject-manage-form"
                data-lenis-prevent
                onSubmit={handleSubjectSubmit}
                className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                    Subject Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="e.g., 23CI3001"
                    className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal placeholder:text-primary/40 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g., Database Management Systems"
                    className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal placeholder:text-primary/40"
                  />
                </div>

                {/* Multi-Select Branches Checkbox Dropdown */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60">
                      Branches (Multi-Select) *
                    </label>
                    <button
                      type="button"
                      onClick={toggleSelectAllBranches}
                      className="text-[11px] font-bold text-secondary hover:underline cursor-pointer"
                    >
                      {subBranches.length === branches.length ? "Deselect All" : "Select All Branches"}
                    </button>
                  </div>

                  {/* Multi-Select Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-left bg-bg border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-primary/30"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                      {subBranches.length === branches.length ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          <Check className="h-3 w-3" /> All Branches ({branches.length})
                        </span>
                      ) : subBranches.length > 0 ? (
                        subBranches.map((bCode) => (
                          <span
                            key={bCode}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 shadow-2xs"
                          >
                            {bCode}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-primary/40">Select one or more branches...</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-primary/50 shrink-0">
                      <span className="text-[11px] font-medium hidden sm:inline">
                        {subBranches.length} selected
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isBranchDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Multi-Select Dropdown Menu */}
                  {isBranchDropdownOpen && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsBranchDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 p-2 bg-surface border border-border rounded-2xl shadow-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        {/* Select All Option */}
                        <button
                          type="button"
                          onClick={toggleSelectAllBranches}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold hover:bg-bg flex items-center justify-between cursor-pointer transition-colors text-primary"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={subBranches.length === branches.length}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer pointer-events-none"
                            />
                            <span>All Branches (Common Course)</span>
                          </div>
                          <span className="text-[10px] text-primary/50 uppercase font-semibold">
                            {branches.length} Branches
                          </span>
                        </button>

                        <div className="border-t border-border my-1" />

                        {/* Individual Branches List */}
                        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                          {branches.map((b) => {
                            const isSelected = subBranches.includes(b.code);
                            return (
                              <button
                                key={b.code}
                                type="button"
                                onClick={() => toggleBranchSelection(b.code)}
                                className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? "bg-primary/5 text-primary font-bold"
                                    : "hover:bg-bg text-primary/80 font-normal"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer pointer-events-none shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-xs">{b.code}</span>
                                      {!b.active && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                          Inactive
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-primary/55 block truncate font-normal">
                                      {b.name}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Semester Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                    Semester *
                  </label>
                  <select
                    value={subSemester}
                    onChange={(e) => setSubSemester(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                  >
                    {semesters.map((s) => (
                      <option key={s.number} value={s.number.toString()}>
                        Semester {s.number} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                {editingSubject && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                      Status
                    </label>
                    <select
                      value={subActive ? "active" : "inactive"}
                      onChange={(e) => setSubActive(e.target.value === "active")}
                      className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal cursor-pointer"
                    >
                      <option value="active">Active (Visible to Students)</option>
                      <option value="inactive">Inactive (Archived)</option>
                    </select>
                  </div>
                )}

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>Curriculum Alignment</span>
                  </div>
                  <p className="text-[11px] text-primary/65 leading-relaxed font-normal">
                    Once saved, students enrolled in this branch and semester will see this subject syllabus updated across their learning dashboard.
                  </p>
                </div>
              </form>

              {/* Footer */}
              <div className="p-5 sm:p-6 border-t border-border bg-bg/40 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={closeSubjectDrawer}
                  disabled={subjectLoading}
                  className="px-5 py-2.5 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="subject-manage-form"
                  disabled={subjectLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-medium text-xs sm:text-sm rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {subjectLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
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
      {/* DELETE SUBJECT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isDeletingSubject && setDeletingSubject(null)}
          />
          <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Delete Subject</h3>
            </div>
            <p className="text-xs sm:text-sm text-primary/70 font-normal leading-relaxed">
              Are you sure you want to permanently delete course <strong className="text-primary font-semibold">{deletingSubject.code}</strong> - <em>{deletingSubject.title}</em> from <strong className="text-primary font-semibold">{deletingSubject.branch}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                disabled={isDeletingSubject}
                className="px-5 py-2 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubjectConfirm}
                disabled={isDeletingSubject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingSubject ? (
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
      {/* DELETE BRANCH CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isDeletingBranch && setDeletingBranch(null)}
          />
          <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Delete Branch Specialization</h3>
            </div>
            <p className="text-xs sm:text-sm text-primary/70 font-normal leading-relaxed">
              Are you sure you want to remove <strong className="text-primary font-semibold">{deletingBranch.code}</strong> ({deletingBranch.name}) from academic branches?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                disabled={isDeletingBranch}
                className="px-5 py-2 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBranchConfirm}
                disabled={isDeletingBranch}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingBranch ? (
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
      {/* MODAL (ADD BRANCH) */}
      {/* ========================================================================= */}
      {isBranchModalMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isBranchModalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !branchLoading && closeBranchModal()}
          />
          <div
            data-lenis-prevent
            className={`bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 relative z-10 transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain ${
              isBranchModalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Add Department Branch</h3>
                  <p className="text-xs text-primary/60 font-normal mt-0.5">
                    Register a new specialization program
                  </p>
                </div>
              </div>
              <button
                onClick={closeBranchModal}
                disabled={branchLoading}
                className="p-2 text-primary/50 hover:text-primary rounded-full cursor-pointer hover:bg-bg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                  Branch Code (e.g. CIC, CSD) *
                </label>
                <input
                  required
                  maxLength={6}
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="e.g., CIC"
                  className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary/60 mb-1">
                  Full Branch Specialization Name *
                </label>
                <input
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g., Computer Science & Design"
                  className="w-full px-4 py-2.5 text-sm bg-bg border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 text-primary font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={closeBranchModal}
                  disabled={branchLoading}
                  className="px-5 py-2.5 text-xs sm:text-sm font-normal text-primary/70 hover:text-primary rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={branchLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {branchLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Register Branch"
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
