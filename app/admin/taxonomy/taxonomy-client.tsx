"use client";

import { useState } from "react";
import { createSubjectAction, toggleSubjectActiveAction, createBranchAction } from "./actions";
import { BookOpen, Plus, FolderPlus, ToggleLeft, ToggleRight } from "lucide-react";

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

export default function TaxonomyClient({ branches, semesters, subjects }: TaxonomyClientProps) {
  const [activeTab, setActiveTab] = useState<"subjects" | "branches">("subjects");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Subject Form State
  const [subCode, setSubCode] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [subBranch, setSubBranch] = useState("");
  const [subSemester, setSubSemester] = useState("");

  // Branch Form State
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await createSubjectAction(
      subCode,
      subTitle,
      subBranch,
      parseInt(subSemester, 10)
    );

    setLoading(false);
    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "Subject created successfully!", type: "success" });
      setSubCode("");
      setSubTitle("");
      setSubBranch("");
      setSubSemester("");
      window.location.reload();
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await createBranchAction(branchCode, branchName);
    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "Branch created successfully!", type: "success" });
      setBranchCode("");
      setBranchName("");
      window.location.reload();
    }
  };

  const handleToggleSubject = async (code: string, branch: string, currentActive: boolean) => {
    const result = await toggleSubjectActiveAction(code, branch, currentActive);
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "subjects" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Manage Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "branches" ? "border-primary text-primary" : "border-transparent text-primary/50 hover:text-primary"
          }`}
        >
          <FolderPlus className="h-4 w-4" /> Manage Branches ({branches.length})
        </button>
      </div>

      {message && (
        <div role="alert" className={`p-4 rounded-xl border text-sm font-semibold ${
          message.type === "success" ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {message.text}
        </div>
      )}

      {/* Subjects tab */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Subject Form */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs h-fit space-y-6">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-secondary" /> Add New Subject
            </h3>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Subject Code</label>
                <input
                  id="code"
                  required
                  placeholder="e.g., 23CI3001"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Subject Title</label>
                <input
                  id="title"
                  required
                  placeholder="e.g., Database Management Systems"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sub-branch" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Branch</label>
                  <select
                    id="sub-branch"
                    required
                    value={subBranch}
                    onChange={(e) => setSubBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none"
                  >
                    <option value="">-- Code --</option>
                    {branches.map(b => (
                      <option key={b.code} value={b.code}>{b.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sub-semester" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Semester</label>
                  <select
                    id="sub-semester"
                    required
                    value={subSemester}
                    onChange={(e) => setSubSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none"
                  >
                    <option value="">-- Sem --</option>
                    {semesters.map(s => (
                      <option key={s.number} value={s.number}>Sem {s.number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                Create Subject
              </button>
            </form>
          </div>

          {/* Subjects Inventory List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-primary text-sm">Subject Directory</h3>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
              {subjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                        <th className="p-3">Code</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Branch</th>
                        <th className="p-3">Semester</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subjects.map((sub) => (
                        <tr key={`${sub.code}-${sub.branch}`} className="hover:bg-bg/25 transition-all font-medium">
                          <td className="p-3 font-bold text-primary">{sub.code}</td>
                          <td className="p-3 text-primary/80">{sub.title}</td>
                          <td className="p-3 font-bold text-secondary">{sub.branch}</td>
                          <td className="p-3 font-semibold">Sem {sub.semester}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleSubject(sub.code, sub.branch, sub.active)}
                              className="focus:outline-none cursor-pointer text-primary"
                              aria-label={sub.active ? "Deactivate subject" : "Activate subject"}
                            >
                              {sub.active ? (
                                <ToggleRight className="h-6 w-6 text-success" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-primary/30" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-primary/45 font-semibold">
                  No subjects registered.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Branches tab */}
      {activeTab === "branches" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Branch Form */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs h-fit space-y-6">
            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-secondary" /> Add New Branch
            </h3>
            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label htmlFor="b-code" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Branch Code (3 chars)</label>
                <input
                  id="b-code"
                  required
                  placeholder="e.g., CIC"
                  maxLength={5}
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <div>
                <label htmlFor="b-name" className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1.5">Branch Name</label>
                <input
                  id="b-name"
                  required
                  placeholder="e.g., Computer Science & Design"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                Create Branch
              </button>
            </form>
          </div>

          {/* Branches list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-primary text-sm">Branch Directory</h3>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                      <th className="p-3">Code</th>
                      <th className="p-3">Branch Name</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {branches.map((b) => (
                      <tr key={b.code} className="hover:bg-bg/25 transition-all font-medium">
                        <td className="p-3 font-bold text-primary">{b.code}</td>
                        <td className="p-3 text-primary/80">{b.name}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-success/10 text-success border border-success/15">
                            {b.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
