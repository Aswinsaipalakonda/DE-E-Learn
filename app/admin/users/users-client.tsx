"use client";

import { useState, useMemo } from "react";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction, 
  batchCreateUsersAction, 
  toggleUserStatus, 
  adminResetUserPassword, 
  bulkPromoteStudentsSemesterAction 
} from "./actions";
import { ToastContainer, ToastMessage } from "@/components/toast";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Upload, 
  Search, 
  X, 
  Loader2, 
  GraduationCap, 
  ChevronRight,
  ChevronLeft,
  Mail,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Check,
  ArrowRight,
  Phone,
  Briefcase,
  ShieldCheck,
  Layers,
  Sparkles,
  Copy
} from "lucide-react";

export interface BranchOption {
  code: string;
  name: string;
}

export interface SemesterOption {
  number: number;
  name: string;
}

export interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "student" | "faculty" | "admin";
  status: "active" | "deactivated";
  branch: string | null;
  current_semester: number | null;
  section: string | null;
  designation: string | null;
  phone: string | null;
  roll_number: string | null;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  branches: BranchOption[];
  semesters: SemesterOption[];
}

const COMMON_DESIGNATIONS = [
  "Professor & Head of Department",
  "Professor",
  "Associate Professor",
  "Senior Assistant Professor",
  "Assistant Professor",
  "Adjunct Faculty",
  "Visiting Professor",
  "Lab Instructor / Technical Assistant",
];

// Validate 10-char roll number with college code '33' at position 3-4 (0-indexed 2-3)
function isValidRollNumber(roll: string): boolean {
  if (!roll || roll.length !== 10) return false;
  const upper = roll.toUpperCase();
  const regex = /^\d{2}33[0-9A-Z]{6}$/;
  return regex.test(upper);
}

export default function UsersClient({ initialUsers, branches, semesters }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  // Tab State: 'all' | 'faculty' | 'student' | 'admin'
  const [activeTab, setActiveTab] = useState<"all" | "faculty" | "student" | "admin">("all");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [designationFilter, setDesignationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Slide-over Right Drawer State
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form State
  const [formRole, setFormRole] = useState<"student" | "faculty" | "admin">("faculty");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [customDesignation, setCustomDesignation] = useState("");
  const [branch, setBranch] = useState<string>("ALL");
  const [semester, setSemester] = useState("3");
  const [section, setSection] = useState("A");
  const [availableSections, setAvailableSections] = useState<string[]>(["A", "B"]);
  const [customSectionInput, setCustomSectionInput] = useState("");
  const [isAddingNewSection, setIsAddingNewSection] = useState(false);
  const [status, setStatus] = useState<"active" | "deactivated">("active");
  const [formLoading, setFormLoading] = useState(false);

  // Password Reset in Drawer
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Delete Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // CSV Modal State
  const [isCsvMounted, setIsCsvMounted] = useState(false);
  const [isCsvVisible, setIsCsvVisible] = useState(false);
  const [csvImportType, setCsvImportType] = useState<"faculty" | "student">("faculty");
  const [csvRawText, setCsvRawText] = useState("");
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  // Batch Semester Promotion Modal State
  const [isPromoteModalMounted, setIsPromoteModalMounted] = useState(false);
  const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
  const [promoteFromSem, setPromoteFromSem] = useState(1);
  const [promoteToSem, setPromoteToSem] = useState(2);
  const [promoteBranch, setPromoteBranch] = useState("ALL");
  const [isPromoting, setIsPromoting] = useState(false);

  // Status Toggling State
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Counts Calculation
  const counts = useMemo(() => {
    const total = users.length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const student = users.filter((u) => u.role === "student").length;
    const admin = users.filter((u) => u.role === "admin").length;
    const active = users.filter((u) => u.status === "active").length;
    const deactivated = users.filter((u) => u.status === "deactivated").length;
    return { total, faculty, student, admin, active, deactivated };
  }, [users]);

  // Unique designations in dataset
  const allKnownDesignations = useMemo(() => {
    const dSet = new Set<string>(COMMON_DESIGNATIONS);
    users.forEach((u) => {
      if (u.designation) dSet.add(u.designation);
    });
    return Array.from(dSet);
  }, [users]);

  // Dynamic unique sections list
  const allKnownSections = useMemo(() => {
    const secSet = new Set<string>(availableSections);
    users.forEach((u) => {
      if (u.section) secSet.add(u.section);
    });
    return Array.from(secSet).sort();
  }, [availableSections, users]);

  // Target students eligible for promotion based on selection
  const eligiblePromoteStudents = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== "student") return false;
      if (u.status !== "active") return false;
      if (u.current_semester !== promoteFromSem) return false;
      if (promoteBranch !== "ALL" && u.branch !== promoteBranch) return false;
      return true;
    });
  }, [users, promoteFromSem, promoteBranch]);

  // Branch breakdown of eligible students
  const eligibleStudentsByBranch = useMemo(() => {
    const map: Record<string, number> = {};
    eligiblePromoteStudents.forEach((s) => {
      const b = s.branch || "Unknown";
      map[b] = (map[b] || 0) + 1;
    });
    return map;
  }, [eligiblePromoteStudents]);

  // Duplicate Check for roll number
  const isDuplicateRollNumber = useMemo(() => {
    if (!rollNumber || formRole !== "student") return false;
    const upper = rollNumber.toUpperCase().trim();
    return users.some(
      (u) =>
        u.id !== editingUser?.id &&
        u.role === "student" &&
        (u.roll_number?.toUpperCase() === upper || (u.email.includes("@") && u.email.split("@")[0].toUpperCase() === upper))
    );
  }, [rollNumber, users, editingUser, formRole]);

  const isRollInvalid = useMemo(() => {
    if (!rollNumber || formRole !== "student") return false;
    return !isValidRollNumber(rollNumber);
  }, [rollNumber, formRole]);

  // Student Roll Number change handler (auto-generates official college email)
  const handleRollNumberChange = (val: string) => {
    const upper = val.toUpperCase().trim();
    setRollNumber(upper);
    if (formRole === "student" && upper) {
      setEmail(`${upper.toLowerCase()}@mvgrce.edu.in`);
      if (upper.includes("47")) setBranch("CIC");
      else if (upper.includes("44") || upper.includes("05")) setBranch("CSD");
      else if (upper.includes("42")) setBranch("CSM");
    }
  };

  // Open Drawer in Create Mode
  const openCreateDrawer = (defaultRole?: "student" | "faculty" | "admin") => {
    const initialRole = defaultRole || (activeTab === "faculty" ? "faculty" : activeTab === "student" ? "student" : activeTab === "admin" ? "admin" : "faculty");
    setEditingUser(null);
    setFormRole(initialRole);
    setName("");
    setRollNumber("");
    setEmail("");
    setPhone("");
    setDesignation("Assistant Professor");
    setCustomDesignation("");
    setBranch(initialRole === "student" ? (branches[0]?.code || "CIC") : "ALL");
    setSemester("3");
    setSection("A");
    setStatus("active");
    setResetPasswordResult(null);
    setCopiedPassword(false);
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
    setFormRole(user.role);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    const resolvedRoll = user.roll_number || (user.role === "student" && user.email.includes("@") ? user.email.split("@")[0].toUpperCase() : "");
    setRollNumber(resolvedRoll);
    let resolvedBranch = user.branch || "ALL";
    if (user.role === "student" && (!user.branch || user.branch === "ALL")) {
      const code = resolvedRoll.length >= 8 ? resolvedRoll.slice(6, 8) : "";
      if (code === "47") resolvedBranch = "CIC";
      else if (code === "44" || code === "05") resolvedBranch = "CSD";
      else if (code === "42") resolvedBranch = "CSM";
      else resolvedBranch = branches[0]?.code || "CIC";
    }
    setBranch(resolvedBranch);
    setSemester(user.current_semester ? user.current_semester.toString() : "3");
    setSection(user.section || "A");
    setStatus(user.status);

    if (user.designation) {
      if (COMMON_DESIGNATIONS.includes(user.designation)) {
        setDesignation(user.designation);
        setCustomDesignation("");
      } else {
        setDesignation("Other");
        setCustomDesignation(user.designation);
      }
    } else {
      setDesignation("Assistant Professor");
      setCustomDesignation("");
    }

    if (user.section && !availableSections.includes(user.section)) {
      setAvailableSections((prev) => [...prev, user.section!]);
    }

    setResetPasswordResult(null);
    setCopiedPassword(false);
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
      setResetPasswordResult(null);
    }, 400);
  };

  const handleAddCustomSection = () => {
    const val = customSectionInput.trim().toUpperCase();
    if (val && !availableSections.includes(val)) {
      setAvailableSections((prev) => [...prev, val].sort());
      setSection(val);
      setCustomSectionInput("");
      setIsAddingNewSection(false);
    }
  };

  // Form Submit Handler
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("error", "Validation Error", "Full Name is required.");
      return;
    }

    if (formRole === "student") {
      if (!rollNumber.trim()) {
        addToast("error", "Validation Error", "Roll Number is required for students.");
        return;
      }
      if (!isValidRollNumber(rollNumber.trim())) {
        addToast("error", "Validation Error", "Please enter a valid 10-digit MVGR roll number (e.g., 22331A4701).");
        return;
      }
    }

    if (formRole === "faculty") {
      if (!phone.trim()) {
        addToast("error", "Validation Error", "Contact Mobile Number is required for faculty accounts.");
        return;
      }
    }

    if (!email.trim() || !email.includes("@")) {
      addToast("error", "Validation Error", "A valid institutional email address is required.");
      return;
    }

    setFormLoading(true);
    try {
      const selectedDesignation = designation === "Other" ? customDesignation.trim() : designation;
      const selectedBranch = (formRole === "admin" || formRole === "faculty") ? null : (branch === "ALL" ? null : branch);
      const parsedSemester = formRole === "student" ? parseInt(semester, 10) : null;
      const formattedRoll = formRole === "student" ? rollNumber.toUpperCase().trim() : null;
      const formattedPhone = (formRole === "faculty" || formRole === "admin") ? (phone.trim() || null) : null;

      if (editingUser) {
        const res = await updateUserAction(editingUser.id, {
          name: name.trim(),
          role: formRole,
          branch: selectedBranch,
          semester: parsedSemester,
          section: formRole === "student" ? section : null,
          designation: formRole === "faculty" ? selectedDesignation : null,
          phone: formattedPhone,
          rollNumber: formattedRoll,
          status,
        });

        if (res.error) {
          addToast("error", "Update Failed", res.error);
        } else {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    name: name.trim(),
                    role: formRole,
                    branch: selectedBranch,
                    current_semester: parsedSemester,
                    section: formRole === "student" ? section : null,
                    designation: formRole === "faculty" ? selectedDesignation : null,
                    phone: phone.trim() || null,
                    roll_number: formattedRoll,
                    status,
                  }
                : u
            )
          );
          addToast("success", "User Updated", `${name} has been successfully updated.`);
          closeDrawer();
        }
      } else {
        const res = await createUserAction(
          email.trim(),
          name.trim(),
          formRole,
          selectedBranch,
          parsedSemester,
          formRole === "student" ? section : null,
          formRole === "faculty" ? selectedDesignation : null,
          formattedRoll,
          phone.trim() || null
        );

        if (res.error) {
          addToast("error", "Creation Failed", res.error);
        } else {
          const newUser: UserItem = {
            id: res.user?.id || Math.random().toString(),
            email: email.trim().toLowerCase(),
            name: name.trim(),
            role: formRole,
            status: "active",
            branch: selectedBranch,
            current_semester: parsedSemester,
            section: formRole === "student" ? section : null,
            designation: formRole === "faculty" ? selectedDesignation : null,
            phone: phone.trim() || null,
            roll_number: formattedRoll,
            created_at: new Date().toISOString(),
          };
          setUsers((prev) => [newUser, ...prev]);
          addToast("success", "User Created", `New ${formRole} account created for ${name}.`);
          closeDrawer();
        }
      }
    } catch {
      addToast("error", "Error", "An unexpected error occurred while saving the user.");
    } finally {
      setFormLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async () => {
    if (!editingUser) return;
    setIsResettingPassword(true);
    try {
      const res = await adminResetUserPassword(editingUser.id, editingUser.email);
      if (res.error) {
        addToast("error", "Password Reset Failed", res.error);
      } else {
        setResetPasswordResult(res.defaultPassword || "Password@789");
        addToast(
          "success",
          "Password Reset",
          `Password for ${editingUser.name} has been reset to "${res.defaultPassword}".`
        );
      }
    } catch {
      addToast("error", "Error", "Failed to reset user password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Toggle Status Handler
  const handleToggleStatus = async (user: UserItem) => {
    setTogglingId(user.id);
    try {
      const res = await toggleUserStatus(user.id, user.status);
      if (res.error) {
        addToast("error", "Status Update Failed", res.error);
      } else {
        const nextStatus = user.status === "active" ? "deactivated" : "active";
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        addToast(
          "info",
          "Status Changed",
          `Account for ${user.name} is now ${nextStatus}.`
        );
      }
    } catch {
      addToast("error", "Error", "Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleteLoading(true);
    try {
      const res = await deleteUserAction(deletingUser.id, deletingUser.email);
      if (res.error) {
        addToast("error", "Delete Failed", res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        addToast("success", "User Deleted", `User ${deletingUser.name} has been removed.`);
        setDeletingUser(null);
      }
    } catch {
      addToast("error", "Error", "Failed to delete user account.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // CSV Parsing & Preview Handler
  const handleCsvTextChange = (text: string) => {
    setCsvRawText(text);
    setCsvErrors([]);
    if (!text.trim()) {
      setCsvPreview([]);
      return;
    }

    const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setCsvPreview([]);
      return;
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\r\s_]/g, ""));
    const previewList: Record<string, string>[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/\r/g, ""));
      if (cols.length === 0 || cols.every((c) => !c)) continue;

      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = cols[idx] || "";
      });

      if (csvImportType === "faculty") {
        const rowName = row["name"] || row["facultyname"] || cols[0] || "";
        const rowEmail = row["email"] || row["emailaddress"] || cols[1] || "";
        const rowDesig = row["designation"] || row["desig"] || cols[2] || "Assistant Professor";
        const rowPhone = row["phone"] || row["phonenumber"] || row["mobile"] || cols[3] || "";
        const rowBranch = row["branch"] || row["department"] || cols[4] || "";

        if (!rowName) errors.push(`Row ${i}: Missing Faculty Name`);
        if (!rowEmail || !rowEmail.includes("@")) errors.push(`Row ${i}: Invalid or missing Email (${rowEmail || "empty"})`);

        previewList.push({
          name: rowName,
          email: rowEmail,
          designation: rowDesig,
          phone: rowPhone,
          branch: rowBranch,
        });
      } else {
        const rowName = row["name"] || row["studentname"] || cols[0] || "";
        const rowRoll = (row["rollnumber"] || row["rollno"] || row["roll"] || cols[1] || "").toUpperCase().trim();
        let rowBranch = (row["branch"] || cols[2] || "CSM").trim().toUpperCase();
        if (rowBranch === "ICB") rowBranch = "CIC";

        const semRaw = (row["semester"] || row["sem"] || cols[3] || "1").toString().trim().toUpperCase();
        const romanMap: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6", VII: "7", VIII: "8" };
        const rowSem = romanMap[semRaw] || semRaw;
        const rowSec = (row["section"] || row["sec"] || cols[4] || "A").trim().toUpperCase();

        if (!rowName) errors.push(`Row ${i}: Missing Student Name`);
        if (!rowRoll) errors.push(`Row ${i}: Missing Roll Number`);
        else if (!isValidRollNumber(rowRoll)) errors.push(`Row ${i}: Invalid 10-char roll number (${rowRoll})`);

        previewList.push({
          name: rowName,
          rollNumber: rowRoll,
          email: rowRoll ? `${rowRoll.toLowerCase()}@mvgrce.edu.in` : "",
          branch: rowBranch,
          semester: rowSem,
          section: rowSec,
        });
      }
    }

    setCsvPreview(previewList);
    setCsvErrors(errors);
  };

  // CSV Batch Upload Submit
  const handleCsvImportSubmit = async () => {
    if (csvPreview.length === 0) {
      addToast("error", "Validation Error", "No valid records to import.");
      return;
    }

    setCsvLoading(true);
    try {
      const payload = csvPreview.map((row) => {
        if (csvImportType === "faculty") {
          return {
            name: row.name,
            email: row.email.toLowerCase().trim(),
            role: "faculty" as const,
            designation: row.designation || "Assistant Professor",
            phone: row.phone || null,
            branch: row.branch || null,
            semester: null,
            section: null,
            rollNumber: null,
          };
        } else {
          return {
            name: row.name,
            email: row.email ? row.email.toLowerCase().trim() : `${row.rollNumber.toLowerCase()}@mvgrce.edu.in`,
            role: "student" as const,
            designation: null,
            phone: null,
            branch: row.branch || "CIC",
            semester: parseInt(row.semester, 10) || 3,
            section: row.section || "A",
            rollNumber: row.rollNumber.toUpperCase().trim(),
          };
        }
      });

      const res = await batchCreateUsersAction(payload);
      if (res.error) {
        addToast("error", "Batch Import Failed", res.error);
        return;
      }
      if (res.successCount > 0) {
        addToast(
          "success",
          "Batch Import Complete",
          `Successfully imported ${res.successCount} ${csvImportType === "faculty" ? "faculty members" : "students"}.`
        );
        const newItems: UserItem[] = payload.slice(0, res.successCount).map((p) => ({
          id: Math.random().toString(),
          email: p.email,
          name: p.name,
          role: p.role,
          status: "active",
          branch: p.branch,
          current_semester: p.semester,
          section: p.section,
          designation: p.designation,
          phone: p.phone,
          roll_number: p.rollNumber,
          created_at: new Date().toISOString(),
        }));
        setUsers((prev) => [...newItems, ...prev]);
        closeCsvModal();
      }

      if (res.failCount > 0) {
        addToast(
          "error",
          "Import Warnings",
          `${res.failCount} records failed. First error: ${res.errors[0] || "Unknown"}`
        );
      }
    } catch {
      addToast("error", "Error", "Failed to execute batch import.");
    } finally {
      setCsvLoading(false);
    }
  };

  const openCsvModal = () => {
    setCsvRawText("");
    setCsvPreview([]);
    setCsvErrors([]);
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
      setCsvRawText("");
      setCsvPreview([]);
    }, 300);
  };

  // Bulk Promote Students
  const handleBulkPromote = async () => {
    setIsPromoting(true);
    try {
      const res = await bulkPromoteStudentsSemesterAction(promoteFromSem, promoteToSem, promoteBranch);
      if (res.error) {
        addToast("error", "Promotion Failed", res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => {
            if (
              u.role === "student" &&
              u.current_semester === promoteFromSem &&
              (promoteBranch === "ALL" || u.branch === promoteBranch)
            ) {
              return { ...u, current_semester: promoteToSem };
            }
            return u;
          })
        );
        addToast(
          "success",
          "Promotion Complete",
          `Promoted students from Semester ${promoteFromSem} to Semester ${promoteToSem}.`
        );
        setIsPromoteModalVisible(false);
        setTimeout(() => setIsPromoteModalMounted(false), 300);
      }
    } catch {
      addToast("error", "Error", "Failed to bulk promote students.");
    } finally {
      setIsPromoting(false);
    }
  };

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab !== "all" && u.role !== activeTab) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesRoll = u.roll_number ? u.roll_number.toLowerCase().includes(q) : false;
        const matchesDesig = u.designation ? u.designation.toLowerCase().includes(q) : false;
        const matchesPhone = u.phone ? u.phone.includes(q) : false;
        const matchesBranch = u.branch ? u.branch.toLowerCase().includes(q) : false;

        if (!matchesName && !matchesEmail && !matchesRoll && !matchesDesig && !matchesPhone && !matchesBranch) {
          return false;
        }
      }

      if (branchFilter !== "all" && u.branch !== branchFilter) {
        return false;
      }

      if (semesterFilter !== "all" && String(u.current_semester) !== semesterFilter) {
        return false;
      }

      if (sectionFilter !== "all" && u.section !== sectionFilter) {
        return false;
      }

      if (designationFilter !== "all" && u.designation !== designationFilter) {
        return false;
      }

      if (statusFilter !== "all" && u.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery, branchFilter, semesterFilter, sectionFilter, designationFilter, statusFilter]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIdx, startIdx + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const hasActiveFilters = searchQuery !== "" || branchFilter !== "all" || semesterFilter !== "all" || sectionFilter !== "all" || designationFilter !== "all" || statusFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setBranchFilter("all");
    setSemesterFilter("all");
    setSectionFilter("all");
    setDesignationFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & ACTIONS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-0.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Identity & Roster Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            User Directory & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Manage faculty educators, student cohorts, and departmental administrators with real-time provisioning.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeTab === "student" && counts.student > 0 && (
            <button
              onClick={() => {
                setIsPromoteModalMounted(true);
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    setIsPromoteModalVisible(true);
                  });
                });
              }}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span>Promote Cohort</span>
            </button>
          )}

          <button
            onClick={openCsvModal}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-700" />
            <span>Batch Import (CSV)</span>
          </button>

          <button
            onClick={() => openCreateDrawer()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Enroll User</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROLE TABS & STATUS INDICATORS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Role Tabs */}
        <div className="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200 gap-1 self-start">
          <button
            onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UsersIcon className="h-3.5 w-3.5 text-slate-600" />
            <span>All Users</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("faculty"); setCurrentPage(1); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "faculty"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-slate-700" />
            <span>Faculty</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
              {counts.faculty}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("student"); setCurrentPage(1); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "student"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
            <span>Students</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
              {counts.student}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("admin"); setCurrentPage(1); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Admins</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
              {counts.admin}
            </span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active: {counts.active}</span>
          </span>
          {counts.deactivated > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Deactivated: {counts.deactivated}</span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTERS & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-4.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={
              activeTab === "faculty"
                ? "Search faculty name, designation, email, phone..."
                : activeTab === "student"
                ? "Search student name, roll number, email..."
                : "Search by name, roll number, email, designation..."
            }
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Branch / Department Filter */}
        <div className="shrink-0">
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-slate-800 transition-all cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Designation Filter (visible for Faculty or All) */}
        {(activeTab === "faculty" || activeTab === "all") && (
          <div className="shrink-0">
            <select
              value={designationFilter}
              onChange={(e) => { setDesignationFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-slate-800 transition-all cursor-pointer"
            >
              <option value="all">All Designations</option>
              {allKnownDesignations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Semester Filter (visible for Students or All) */}
        {(activeTab === "student" || activeTab === "all") && (
          <div className="shrink-0">
            <select
              value={semesterFilter}
              onChange={(e) => { setSemesterFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-slate-800 transition-all cursor-pointer"
            >
              <option value="all">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.number} value={s.number.toString()}>
                  Sem {s.number}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Section Filter (visible for Students or All) */}
        {(activeTab === "student" || activeTab === "all") && (
          <div className="shrink-0">
            <select
              value={sectionFilter}
              onChange={(e) => { setSectionFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-slate-800 transition-all cursor-pointer"
            >
              <option value="all">All Sections</option>
              {allKnownSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-slate-800 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Accounts</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN USERS DIRECTORY TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <UsersIcon className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === "faculty" ? "No Faculty Members Found" : activeTab === "student" ? "No Students Found" : "No Users Found"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No users match your active search or filter selection."
                : `No enrolled accounts exist in this directory.`}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all mt-2 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <button
                onClick={() => openCreateDrawer()}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all mt-2 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Enroll New User</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">User & Contact</th>
                    <th className="py-3.5 px-4">Role & Designation</th>
                    <th className="py-3.5 px-4">Department / Scope</th>
                    <th className="py-3.5 px-4">Identifier / Phone</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {paginatedUsers.map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U";

                    // Clean, professional styling for badges and avatars without generic AI purple
                    const roleBadgeStyle =
                      u.role === "admin"
                        ? "bg-amber-50 text-amber-800 border-amber-200/80"
                        : u.role === "faculty"
                        ? "bg-slate-100 text-slate-800 border-slate-200/90 font-semibold"
                        : "bg-blue-50 text-blue-800 border-blue-200/80";

                    const avatarStyle =
                      u.role === "admin"
                        ? "bg-amber-600 text-white"
                        : u.role === "faculty"
                        ? "bg-slate-900 text-white"
                        : "bg-blue-600 text-white";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* 1. Name & Email */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarStyle}`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate leading-snug">
                                {u.name}
                              </span>
                              <span className="text-slate-500 text-xs block truncate font-normal">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role & Designation */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
                              {u.role}
                            </span>
                            {u.role === "faculty" && u.designation && (
                              <span className="text-xs text-slate-700 block font-medium">
                                {u.designation}
                              </span>
                            )}
                            {u.role === "student" && (
                              <span className="text-xs text-slate-600 block">
                                {u.current_semester ? `Sem ${u.current_semester}` : ""}{u.section ? ` • Sec ${u.section}` : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Department / Scope */}
                        <td className="py-3.5 px-4">
                          {u.role === "faculty" ? (
                            <span className="text-slate-600 text-xs font-medium">
                              Department Faculty
                            </span>
                          ) : u.branch ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                              <Layers className="h-3 w-3 text-slate-500" />
                              <span>{u.branch}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs font-normal">
                              {u.role === "admin" ? "System Administrator" : "Data Engineering"}
                            </span>
                          )}
                        </td>

                        {/* 4. Identifier / Phone */}
                        <td className="py-3.5 px-4">
                          {u.role === "student" ? (
                            <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {u.roll_number || "-"}
                            </span>
                          ) : u.phone ? (
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-normal">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* 5. Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={togglingId === u.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              u.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                            title="Click to toggle status"
                          >
                            {togglingId === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            )}
                            <span className="capitalize">{u.status}</span>
                          </button>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditDrawer(u)}
                              className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Edit user profile"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>of <strong>{filteredUsers.length}</strong> total records</span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 font-semibold text-slate-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER RIGHT DRAWER (BEFORE UI + FULL SMOOTH SCROLLING) */}
      {/* ========================================================================= */}
      {isDrawerMounted && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => !formLoading && closeDrawer()}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Slide-Over Panel Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              data-lenis-prevent
              className={`w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overscroll-contain h-full ${
                isDrawerVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              {/* Drawer Header (Fixed at Top) */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {editingUser
                      ? editingUser.role === "faculty"
                        ? "Edit Faculty Profile"
                        : editingUser.role === "admin"
                        ? "Edit Administrator Profile"
                        : "Edit Student Profile"
                      : "Enroll New User"}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {editingUser
                      ? `Updating details for ${editingUser.name}`
                      : "Add credentials and departmental scope"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={formLoading}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body (Smoothly Scrollable with full Lenis prevent) */}
              <form 
                id="user-manage-form" 
                data-lenis-prevent
                onSubmit={handleSaveUser} 
                className="px-6 py-5 space-y-5 flex-1 overflow-y-auto overscroll-contain"
              >
                {/* 1. Account Role Switcher */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormRole("faculty");
                        if (!rollNumber) setEmail("");
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        formRole === "faculty"
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormRole("student");
                        if (rollNumber) setEmail(`${rollNumber.toLowerCase()}@mvgrce.edu.in`);
                        if (branch === "ALL") setBranch("CIC");
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        formRole === "student"
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormRole("admin");
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        formRole === "admin"
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {/* 2. STUDENT SPECIFIC: Roll Number */}
                {formRole === "student" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        College Roll Number <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Format: 10 characters</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={rollNumber}
                      onChange={(e) => handleRollNumberChange(e.target.value)}
                      placeholder="Enter 10-character roll number"
                      className={`w-full px-4 py-2.5 text-sm uppercase bg-white border rounded-full focus:outline-none transition-all ${
                        isDuplicateRollNumber
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-700"
                          : isRollInvalid
                          ? "border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900"
                          : "border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900"
                      }`}
                    />

                    {isDuplicateRollNumber && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-0.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>the number already exists</span>
                      </div>
                    )}

                    {!isDuplicateRollNumber && isRollInvalid && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium pt-0.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Please enter a valid 10-character college roll number.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={formRole === "faculty" ? "Enter faculty name" : formRole === "student" ? "Enter student name" : "Enter full name"}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                  />
                </div>

                {/* 4. Institutional Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={formRole === "student" && !!rollNumber && !editingUser}
                    placeholder={formRole === "student" ? "Enter student email" : formRole === "faculty" ? "Enter faculty email" : "Enter institutional email"}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all disabled:opacity-75 disabled:bg-slate-50"
                  />
                </div>

                {/* 5. FACULTY SPECIFIC: Designation */}
                {formRole === "faculty" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Faculty Academic Rank / Designation
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    >
                      {COMMON_DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="Other">Other / Custom Designation...</option>
                    </select>

                    {designation === "Other" && (
                      <input
                        type="text"
                        required
                        value={customDesignation}
                        onChange={(e) => setCustomDesignation(e.target.value)}
                        placeholder="Enter custom designation title"
                        className="w-full mt-2 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal"
                      />
                    )}
                  </div>
                )}

                {/* 6. FACULTY SPECIFIC: Contact Mobile Number */}
                {formRole === "faculty" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Format: 10 digits</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-slate-900 placeholder:text-slate-400 font-normal transition-all"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Default Password: <span className="font-mono font-semibold text-slate-800">{phone.trim().length >= 4 ? `MVGRDE@${phone.trim().slice(-4)}` : "MVGRDE@<last 4 digits>"}</span>
                    </p>
                  </div>
                )}

                {/* 7. STUDENT SPECIFIC: Branch Specialization */}
                {formRole === "student" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Branch Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={branch === "ALL" ? "CIC" : branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 8. STUDENT SPECIFIC: Semester & Section Grid */}
                {formRole === "student" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                      >
                        {semesters.map((s) => (
                          <option key={s.number} value={s.number.toString()}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Section
                        </label>
                        {!isAddingNewSection && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewSection(true)}
                            className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            + New
                          </button>
                        )}
                      </div>
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                      >
                        {allKnownSections.map((sec) => (
                          <option key={sec} value={sec}>
                            Section {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Inline Input for New Section */}
                {formRole === "student" && isAddingNewSection && (
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-full">
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="Section code (e.g. C)"
                      value={customSectionInput}
                      onChange={(e) => setCustomSectionInput(e.target.value.toUpperCase())}
                      className="px-3 py-1 text-xs bg-white border border-slate-200 rounded-full uppercase font-medium text-slate-900 w-32 focus:outline-none focus:border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSection}
                      disabled={!customSectionInput.trim()}
                      className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-40"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewSection(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* 9. Account Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "deactivated")}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                  >
                    <option value="active">Active (Access Enabled)</option>
                    <option value="deactivated">Deactivated (Locked Out)</option>
                  </select>
                </div>

                {/* 10. EDIT MODE: Password Reset Card (Classic Amber Style) */}
                {editingUser && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-amber-700" />
                        <span className="text-xs font-bold text-amber-950">Credential Recovery</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                        Default Reset
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900/85 font-normal leading-relaxed">
                      If this user forgot their password, click below to immediately reset their password to the default credential (&quot;Password@789&quot;).
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isResettingPassword}
                        className="w-full py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isResettingPassword ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Resetting Password...</span>
                          </>
                        ) : resetPasswordResult ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Reset to {resetPasswordResult} (Copied)</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                            <span>Reset Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Drawer Footer (Fixed at Bottom) */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={formLoading}
                  className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="user-manage-form"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingUser ? "Save Changes" : "Create Account"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BATCH CSV IMPORT MODAL */}
      {/* ========================================================================= */}
      {isCsvMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeCsvModal}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
              isCsvVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            data-lenis-prevent
            className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${
              isCsvVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-900">
                  Batch Roster Import (CSV)
                </h3>
                <p className="text-xs text-slate-500">
                  Bulk provision faculty educators or student cohorts using structured CSV data.
                </p>
              </div>
              <button
                onClick={closeCsvModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Import Type Switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setCsvImportType("faculty");
                    handleCsvTextChange(csvRawText);
                  }}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    csvImportType === "faculty"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Import Faculty Directory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCsvImportType("student");
                    handleCsvTextChange(csvRawText);
                  }}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    csvImportType === "student"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Import Student Cohort
                </button>
              </div>

              {/* Sample Template Helper */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {csvImportType === "faculty" ? "Expected Faculty CSV Headers:" : "Expected Student CSV Headers:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample =
                        csvImportType === "faculty"
                          ? "Name,Email,Designation,Phone\nFaculty Member Name,faculty.email@mvgrce.edu.in,Assistant Professor,9876543210"
                          : "Name,RollNumber,Branch,Semester,Section\nStudent Name,23331A4201,CSM,1,A";
                      handleCsvTextChange(sample);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Paste Sample Template
                  </button>
                </div>
                <code className="block p-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                  {csvImportType === "faculty"
                    ? "Name,Email,Designation,Phone"
                    : "Name,RollNumber,Branch,Semester,Section"}
                </code>
              </div>

              {/* Raw CSV Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Paste Raw CSV Data
                </label>
                <textarea
                  rows={5}
                  value={csvRawText}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder={
                    csvImportType === "faculty"
                      ? "Paste comma-separated CSV rows:\nName, Email, Designation, Phone"
                      : "Paste comma-separated CSV rows:\nName, RollNumber, Branch, Semester, Section"
                  }
                  className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                />
              </div>

              {/* Parsing Errors */}
              {csvErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <span className="font-bold block">Validation Warnings ({csvErrors.length}):</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {csvErrors.slice(0, 4).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {csvErrors.length > 4 && <li>...and {csvErrors.length - 4} more warnings</li>}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Parsed Preview ({csvPreview.length} records ready to import):
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                        <tr className="border-b border-slate-200">
                          <th className="p-2">Name</th>
                          <th className="p-2">{csvImportType === "faculty" ? "Email" : "Roll No"}</th>
                          <th className="p-2">{csvImportType === "faculty" ? "Designation" : "Branch"}</th>
                          <th className="p-2">{csvImportType === "faculty" ? "Phone" : "Sem / Sec"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-medium text-slate-900">{row.name}</td>
                            <td className="p-2 font-mono text-slate-600">{csvImportType === "faculty" ? row.email : row.rollNumber}</td>
                            <td className="p-2 text-slate-600">{csvImportType === "faculty" ? row.designation : row.branch}</td>
                            <td className="p-2 text-slate-600">{csvImportType === "faculty" ? row.phone : `Sem ${row.semester} (${row.section})`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/75 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={closeCsvModal}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImportSubmit}
                disabled={csvLoading || csvPreview.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {csvLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>Import {csvPreview.length} {csvImportType === "faculty" ? "Faculty" : "Students"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. BATCH SEMESTER PROMOTION MODAL */}
      {/* ========================================================================= */}
      {isPromoteModalMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsPromoteModalVisible(false);
              setTimeout(() => setIsPromoteModalMounted(false), 300);
            }}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${
              isPromoteModalVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            data-lenis-prevent
            className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden p-6 space-y-5 transition-all duration-300 transform ${
              isPromoteModalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Bulk Promote Student Cohort
              </h3>
              <p className="text-xs text-slate-500">
                Advance all enrolled students from one semester level to the next.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">From Semester</label>
                  <select
                    value={promoteFromSem}
                    onChange={(e) => {
                      const from = Number(e.target.value);
                      setPromoteFromSem(from);
                      if (promoteToSem <= from && from < 8) {
                        setPromoteToSem(from + 1);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                  >
                    {semesters.map((s) => (
                      <option key={s.number} value={s.number}>Sem {s.number}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">To Semester</label>
                  <select
                    value={promoteToSem}
                    onChange={(e) => setPromoteToSem(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                  >
                    {semesters.map((s) => (
                      <option key={s.number} value={s.number}>Sem {s.number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Target Branch</label>
                <select
                  value={promoteBranch}
                  onChange={(e) => setPromoteBranch(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:border-slate-800 text-slate-900 font-normal cursor-pointer"
                >
                  <option value="ALL">All Branches (CIC, CSD, CSM)</option>
                  {branches.map((b) => (
                    <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Enrolled Students Count Display */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  eligiblePromoteStudents.length > 0
                    ? "bg-blue-50/80 border-blue-200/80 text-blue-950"
                    : "bg-amber-50/80 border-amber-200/80 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className={`h-4 w-4 ${eligiblePromoteStudents.length > 0 ? "text-blue-600" : "text-amber-600"}`} />
                    <span className="text-xs font-semibold">
                      Eligible Students:
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      eligiblePromoteStudents.length > 0
                        ? "bg-white text-blue-700 border-blue-200"
                        : "bg-white text-amber-700 border-amber-200"
                    }`}
                  >
                    {eligiblePromoteStudents.length} {eligiblePromoteStudents.length === 1 ? "Student" : "Students"}
                  </span>
                </div>

                {eligiblePromoteStudents.length > 0 ? (
                  <div className="mt-2 text-[11px] text-blue-800 space-y-1.5">
                    <p className="leading-relaxed">
                      <strong>{eligiblePromoteStudents.length}</strong> active {eligiblePromoteStudents.length === 1 ? "student" : "students"} in <strong>Sem {promoteFromSem}</strong> {promoteBranch !== "ALL" ? `(${promoteBranch})` : "across all branches"} will advance to <strong>Sem {promoteToSem}</strong>.
                    </p>
                    {promoteBranch === "ALL" && Object.keys(eligibleStudentsByBranch).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {Object.entries(eligibleStudentsByBranch).map(([bCode, bCount]) => (
                          <span
                            key={bCode}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-blue-100 text-[10px] font-semibold text-blue-900"
                          >
                            <span>{bCode}:</span>
                            <span className="font-bold">{bCount}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-amber-800 leading-relaxed">
                    No active students are currently enrolled in <strong>Sem {promoteFromSem}</strong> {promoteBranch !== "ALL" ? `(${promoteBranch})` : "across the selected branches"}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsPromoteModalVisible(false);
                  setTimeout(() => setIsPromoteModalMounted(false), 300);
                }}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkPromote}
                disabled={isPromoting || eligiblePromoteStudents.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isPromoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
                <span>
                  {isPromoting
                    ? "Promoting..."
                    : eligiblePromoteStudents.length > 0
                    ? `Promote ${eligiblePromoteStudents.length} Students`
                    : "Promote Students"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingUser(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong>{deletingUser.name}</strong> ({deletingUser.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleteLoading}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
