"use client";

import { useState } from "react";
import { createUserAction, batchCreateUsersAction, toggleUserStatus } from "./actions";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Upload, 
  Search
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
  const [activeTab, setActiveTab] = useState<"directory" | "single" | "csv">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Single User State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "admin">("student");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Simple CSV text parser
  const parseCSV = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map(c => c.trim());
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
    setMessage(null);

    const result = await createUserAction(
      email,
      name,
      role,
      role === "student" ? branch || null : null,
      null
    );

    setLoading(false);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "User created successfully! Default password is 'ChangeMe1234!'", type: "success" });
      // Reset form
      setEmail("");
      setName("");
      setBranch("");
      setSemester("");
      window.location.reload();
    }
  };

  const handleCsvSubmit = async () => {
    if (csvPreview.length === 0) return;
    setLoading(true);
    setMessage(null);

    const formattedList = csvPreview.map(item => ({
      email: item.email || "",
      name: item.name || "",
      role: (item.role || "student") as "student" | "faculty" | "admin",
      branch: item.branch || null,
      semester: parseInt(item.semester, 10) || null
    })).filter(u => u.email && u.name);

    const result = await batchCreateUsersAction(formattedList);
    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({
        text: `Batch processing complete. Successfully created ${result.successCount ?? 0} users. Failed ${result.failCount ?? 0}.`,
        type: (result.failCount ?? 0) > 0 ? "error" : "success"
      });
      if (result.errors && result.errors.length > 0) {
        console.error("Batch creation warnings:", result.errors);
      }
      setCsvFile(null);
      setCsvPreview([]);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const result = await toggleUserStatus(userId, currentStatus);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === "active" ? "deactivated" : "active" } : u));
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "directory" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary"
          }`}
        >
          <UsersIcon className="h-4 w-4" /> Roster Directory
        </button>
        <button
          onClick={() => setActiveTab("single")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "single" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary"
          }`}
        >
          <UserPlus className="h-4 w-4" /> Add Single User
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "csv" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary"
          }`}
        >
          <Upload className="h-4 w-4" /> Batch Import CSV
        </button>
      </div>

      {message && (
        <div role="alert" className={`p-4 rounded-xl border text-sm font-semibold ${
          message.type === "success" ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {message.text}
        </div>
      )}

      {/* Directory tab */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-xl border border-border shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
              <input
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-surface text-xs text-primary font-semibold focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Roster Listing */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Scope</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-bg/20 transition-all font-medium">
                        <td className="p-4 font-bold text-primary">{u.name}</td>
                        <td className="p-4 text-primary/80">{u.email}</td>
                        <td className="p-4 uppercase tracking-wider text-[10px] font-black text-secondary">{u.role}</td>
                        <td className="p-4">
                          {u.branch ? (
                            <span className="inline-flex gap-1.5 items-center">
                              <span className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold">{u.branch}</span>
                              {u.current_semester && (
                                <span className="px-1.5 py-0.5 rounded-md bg-secondary/10 border border-secondary/10 text-[10px] font-bold">Sem {u.current_semester}</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-primary/30">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            u.status === "active" ? "bg-success/10 text-success border-success/15" : "bg-danger/10 text-danger border-danger/15"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className="px-2.5 py-1.5 bg-bg hover:bg-border text-primary/75 hover:text-primary rounded-lg border border-border font-bold transition-all cursor-pointer"
                          >
                            {u.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-primary/45 font-semibold text-xs">
                No matching system users found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Single user */}
      {activeTab === "single" && (
        <form onSubmit={handleSingleSubmit} className="bg-surface p-6 rounded-2xl border border-border shadow-xs max-w-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Full Name</label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aswin Sai"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., student@mvgrce.edu.in"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="role" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">System Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "faculty" | "admin")}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "student" && (
              <div>
                <label htmlFor="branch" className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider text-primary/60">Academic Branch</label>
                <select
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-xs focus:outline-none"
                >
                  <option value="">-- Choose Branch --</option>
                  {branches.map(b => (
                    <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? "Registering..." : "Create User Account"}
            </button>
          </div>
        </form>
      )}

      {/* CSV upload tab */}
      {activeTab === "csv" && (
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs max-w-xl space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/50">Batch CSV Upload Instructions</h3>
            <p className="text-xs text-primary/60 leading-relaxed">
              Format your CSV file with headers: <span className="font-bold text-secondary">email, name, role, branch, semester</span>. Default credentials will be created dynamically as <span className="font-semibold text-secondary">ChangeMe1234!</span> for all provisioned users.
            </p>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-secondary rounded-xl bg-bg/30 text-center relative group transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-8 w-8 text-primary/40 group-hover:text-secondary mb-2 transition-colors" />
              <span className="text-xs font-semibold text-primary">
                {csvFile ? csvFile.name : "Select student roster CSV file"}
              </span>
            </div>
          </div>

          {csvPreview.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60">CSV Import Preview ({csvPreview.length} records)</h3>
              <div className="bg-surface rounded-2xl border border-border overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                      <th className="p-3">Email</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Branch</th>
                      <th className="p-3">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {csvPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-bg/25">
                        <td className="p-3 truncate">{row.email}</td>
                        <td className="p-3 font-semibold">{row.name}</td>
                        <td className="p-3 uppercase">{row.role || "student"}</td>
                        <td className="p-3">{row.branch || "-"}</td>
                        <td className="p-3">{row.semester || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => { setCsvFile(null); setCsvPreview([]); }}
                  className="px-4 py-2 bg-surface hover:bg-bg border border-border text-primary font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Clear File
                </button>
                <button
                  onClick={handleCsvSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {loading ? "Processing..." : "Import Users Roster"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
