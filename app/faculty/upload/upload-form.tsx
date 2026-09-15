"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { uploadMaterialAction } from "./actions";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  Loader2, 
  FileCheck,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  Users,
  GraduationCap,
  Search,
  BookOpen,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

interface RegulationOption {
  code: string;
  name: string;
}

interface SubjectOption {
  code: string;
  title: string;
  branch: string;
  semester: number;
  regulation?: string;
}

interface UploadFormProps {
  regulations: RegulationOption[];
  subjects: SubjectOption[];
}

const MATERIAL_TYPES = [
  { label: "Lecture Notes", value: "Notes" },
  { label: "Lecture Slides", value: "Lecture Slides" },
  { label: "Lab Manuals", value: "Lab Manuals" },
  { label: "Assignments", value: "Assignments" },
  { label: "Question Banks", value: "Question Banks" },
  { label: "Model Papers", value: "Model Papers" },
  { label: "Reference Books", value: "Reference Books" },
  { label: "Previous Papers", value: "Previous Papers" },
  { label: "Other Resources", value: "Other Resources" },
];

export default function UploadForm({ regulations, subjects }: UploadFormProps) {
  // 4-Step Progressive Workflow:
  // Step 1: Regulation & Semester
  // Step 2: Subject & Branch Allocation
  // Step 3: Material Details & Files
  // Step 4: Review & Publish
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 State: Regulation & Semester
  const defaultReg = regulations.find(r => r.code === "R23")?.code || regulations[0]?.code || "R23";
  const [selectedRegulation, setSelectedRegulation] = useState(defaultReg);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Step 2 State: Subject & Branch
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [targetBranches, setTargetBranches] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Step 3 State: Details & Files
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Notes");
  const [tagsStr, setTagsStr] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"draft" | "published">("published");

  // All subjects filtered by active regulation
  const subjectsForRegulation = useMemo(() => {
    return subjects.filter(s => (s.regulation || "R23") === selectedRegulation);
  }, [subjects, selectedRegulation]);

  // Semester course counts for active regulation
  const semesterCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    const seenPerSem = new Map<number, Set<string>>();
    for (let s = 1; s <= 8; s++) seenPerSem.set(s, new Set());

    for (const sub of subjectsForRegulation) {
      if (sub.semester >= 1 && sub.semester <= 8) {
        const set = seenPerSem.get(sub.semester);
        if (set && !set.has(sub.code)) {
          set.add(sub.code);
          counts[sub.semester] = (counts[sub.semester] || 0) + 1;
        }
      }
    }
    return counts;
  }, [subjectsForRegulation]);

  // Group distinct courses for selected semester with aggregated branch tags
  const groupedSubjects = useMemo(() => {
    if (!selectedSemester) return [];
    const map = new Map<string, { code: string; title: string; semester: number; branches: string[]; regulation: string }>();

    for (const sub of subjectsForRegulation) {
      if (sub.semester !== selectedSemester) continue;

      const existing = map.get(sub.code);
      if (existing) {
        if (!existing.branches.includes(sub.branch)) {
          existing.branches.push(sub.branch);
        }
      } else {
        map.set(sub.code, {
          code: sub.code,
          title: sub.title,
          semester: sub.semester,
          branches: [sub.branch],
          regulation: sub.regulation || selectedRegulation,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [subjectsForRegulation, selectedSemester, selectedRegulation]);

  // Filtered courses by search query
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return groupedSubjects;
    const q = subjectSearch.toLowerCase().trim();
    return groupedSubjects.filter(s => 
      s.code.toLowerCase().includes(q) || 
      s.title.toLowerCase().includes(q) ||
      s.branches.some(b => b.toLowerCase().includes(q))
    );
  }, [groupedSubjects, subjectSearch]);

  // Active Selected Subject Object
  const currentSubject = useMemo(() => {
    return groupedSubjects.find(s => s.code === selectedSubjectCode);
  }, [groupedSubjects, selectedSubjectCode]);

  // Regulation selection handler
  const handleRegulationChange = (reg: string) => {
    setSelectedRegulation(reg);
    setSelectedSemester(null);
    setSelectedSubjectCode("");
    setTargetBranches([]);
    setSubjectSearch("");
  };

  // Semester selection handler
  const handleSemesterChange = (sem: number) => {
    setSelectedSemester(sem);
    setSelectedSubjectCode("");
    setTargetBranches([]);
    setSubjectSearch("");
  };

  // Subject selection handler (defaults to selecting all branches of that course)
  const handleSubjectChange = (code: string) => {
    setSelectedSubjectCode(code);
    const sub = groupedSubjects.find(s => s.code === code);
    if (sub && sub.branches.length > 0) {
      setTargetBranches([...sub.branches]);
    } else {
      setTargetBranches([]);
    }
  };

  // Target Branch checkbox toggle
  const toggleBranch = (bCode: string) => {
    setTargetBranches(prev => {
      if (prev.includes(bCode)) {
        if (prev.length === 1) return prev; // Keep at least one branch selected
        return prev.filter(b => b !== bCode);
      } else {
        return [...prev, bCode];
      }
    });
  };

  // Toggle All Branches for current subject
  const selectAllBranches = () => {
    if (!currentSubject) return;
    if (targetBranches.length === currentSubject.branches.length) {
      setTargetBranches([currentSubject.branches[0]]);
    } else {
      setTargetBranches([...currentSubject.branches]);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndAddFiles = (incomingFiles: File[]) => {
    const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt"];
    const maxFileSize = 100 * 1024 * 1024; // 100 MB

    const validNewFiles: File[] = [];
    for (const f of incomingFiles) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        setError(`File "${f.name}" is unsupported. Please upload PDF, Word, or PowerPoint files.`);
        return;
      }
      if (f.size > maxFileSize) {
        setError(`File "${f.name}" exceeds 100 MB limit.`);
        return;
      }
      validNewFiles.push(f);
    }

    setFiles(prev => [...prev, ...validNewFiles]);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      validateAndAddFiles(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Step Validation Flags
  const isStep1Valid = Boolean(selectedRegulation && selectedSemester !== null);
  const isStep2Valid = Boolean(selectedSubjectCode && targetBranches.length > 0);
  const isStep3Valid = Boolean(title.trim() && type && files.length > 0);

  // Stepper Next Handler
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!selectedRegulation) {
        setError("Please select an academic regulation.");
        return;
      }
      if (selectedSemester === null) {
        setError("Please choose a semester to proceed.");
        return;
      }
    } else if (step === 2) {
      if (!selectedSubjectCode) {
        setError("Please select a course subject from the list.");
        return;
      }
      if (targetBranches.length === 0) {
        setError("Please select at least one target section/branch.");
        return;
      }
    } else if (step === 3) {
      if (!title.trim()) {
        setError("Please enter a title for the material.");
        return;
      }
      if (files.length === 0) {
        setError("Please attach at least 1 study material document (PDF, Word, or PowerPoint).");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  // Submit Handler
  const handleSubmit = async (publishState?: "draft" | "published") => {
    const finalState = publishState || state;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("subject", selectedSubjectCode);
      formData.append("subjectTitle", currentSubject?.title || "");
      formData.append("regulation", selectedRegulation);
      formData.append("semester", String(selectedSemester || currentSubject?.semester || 1));
      formData.append("type", type);
      formData.append("state", finalState);
      formData.append("tags", tagsStr);
      
      targetBranches.forEach(b => {
        formData.append("branches", b);
      });

      files.forEach(file => {
        formData.append("files", file);
      });

      const result = await uploadMaterialAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while uploading.");
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + " MB";
    const kb = bytes / 1024;
    return kb.toFixed(1) + " KB";
  };

  const selectedTypeLabel = MATERIAL_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 sm:space-y-8" suppressHydrationWarning>
      {/* ========================================================================= */}
      {/* 4-STEP PROGRESS INDICATOR */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        {[
          { num: 1, label: "Curriculum & Sem" },
          { num: 2, label: "Subject & Section" },
          { num: 3, label: "Details & Files" },
          { num: 4, label: "Review & Publish" },
        ].map((s, idx, arr) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.num
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : step === s.num
                  ? "bg-primary text-white shadow-2xs ring-4 ring-primary/15"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {step > s.num ? <Check className="h-4 w-4 stroke-[2.5]" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden md:inline transition-colors ${
                step === s.num ? "text-slate-900 font-bold" : step > s.num ? "text-slate-700" : "text-slate-400"
              }`}>
                {s.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-all ${
                step > s.num ? "bg-emerald-500" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 font-semibold animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT REGULATION & SEMESTER */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-7 animate-in fade-in duration-200">
          {/* 1A. Academic Regulation */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-600" />
                <span>1. Select Academic Regulation *</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">Autonomous syllabus framework</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {regulations.map((reg) => {
                const isSelected = selectedRegulation === reg.code;
                return (
                  <button
                    key={reg.code}
                    type="button"
                    onClick={() => handleRegulationChange(reg.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${isSelected ? "text-indigo-950" : "text-slate-900"}`}>
                        {reg.code}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-1 font-medium">
                      {reg.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1B. Academic Semester Selector */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>2. Select Academic Semester *</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                Pick semester to auto-filter subjects
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const isSelected = selectedSemester === sem;
                const count = semesterCounts[sem] || 0;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => handleSemesterChange(sem)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/25 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100/90 border-slate-200/90 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Term
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                      )}
                    </div>

                    <div>
                      <h4 className={`text-base font-bold ${isSelected ? "text-blue-950" : "text-slate-900"}`}>
                        Semester {sem}
                      </h4>
                      <p className={`text-[11px] font-medium mt-0.5 ${isSelected ? "text-blue-700" : "text-slate-500"}`}>
                        {count > 0 ? `${count} Subjects available` : "No subjects mapped"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1 Selection Confirmation */}
          {selectedSemester !== null && (
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between gap-3 text-xs text-blue-900 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Selected: <strong className="font-bold">{selectedRegulation} • Semester {selectedSemester}</strong> (
                  {semesterCounts[selectedSemester] || 0} subjects). Next step will display the subject list.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next: Select Subject & Section</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT COURSE SUBJECT & TARGET SECTION / BRANCH ALLOCATION */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Context Bar */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-bold">
                {selectedRegulation}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold">
                Semester {selectedSemester}
              </span>
              <span className="text-slate-600 font-medium">
                {groupedSubjects.length} Courses Mapped
              </span>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Semester</span>
            </button>
          </div>

          {/* Subject Dropdown Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Select Course Subject (Semester {selectedSemester}) *</span>
              </label>

              <span className="text-[11px] font-medium text-slate-500">
                {groupedSubjects.length} subjects available in Semester {selectedSemester}
              </span>
            </div>

            {/* Custom Interactive Dropdown / Combobox */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={`w-full px-4.5 py-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isDropdownOpen
                    ? "bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                    : selectedSubjectCode
                    ? "bg-blue-50/50 border-blue-300 hover:border-blue-400"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <BookOpen className={`h-4 w-4 shrink-0 ${selectedSubjectCode ? "text-blue-600" : "text-slate-400"}`} />
                  {currentSubject ? (
                    <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shrink-0">
                        {currentSubject.code}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {currentSubject.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                      -- Click to Select Subject ({groupedSubjects.length} Available) --
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedSubjectCode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 hidden sm:inline-block">
                      Selected
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
                </div>
              </button>

              {/* Dropdown Options Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Search inside dropdown */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        placeholder="Type to filter subjects by code or title..."
                        className="w-full pl-8.5 pr-8 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                        autoFocus
                      />
                      {subjectSearch && (
                        <button
                          type="button"
                          onClick={() => setSubjectSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1.5">
                    {filteredSubjects.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold text-slate-700">No matching subjects</p>
                        <p className="text-[11px]">No course found matching &quot;{subjectSearch}&quot;</p>
                      </div>
                    ) : (
                      filteredSubjects.map((sub) => {
                        const isSelected = selectedSubjectCode === sub.code;
                        return (
                          <button
                            key={sub.code}
                            type="button"
                            onClick={() => {
                              handleSubjectChange(sub.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full p-3 text-left rounded-xl transition-all flex items-start justify-between gap-3 text-xs cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/90 text-blue-950 font-semibold"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {sub.code}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Branches: {sub.branches.join(", ")}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug break-words">
                                {sub.title}
                              </p>
                            </div>

                            {isSelected && (
                              <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Course Confirmation Card */}
          {currentSubject && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start justify-between gap-3 animate-in fade-in duration-150">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    {currentSubject.code}
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    Semester {currentSubject.semester}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {currentSubject.title}
                </h4>
                <p className="text-[11px] text-slate-600">
                  Applicable Branches: <strong className="text-slate-800">{currentSubject.branches.join(", ")}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(true)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer shrink-0 pt-0.5"
              >
                Change
              </button>
            </div>
          )}

          {/* Section / Branch Allocation (Appears once subject is selected) */}
          {currentSubject && (
            <div className="p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-700" />
                    <span>Destination Section / Branch Allocation *</span>
                  </h4>
                  <p className="text-xs text-blue-700/80 mt-0.5">
                    Select target branches. Study material will <span className="font-bold underline">only</span> be visible to students in these sections.
                  </p>
                </div>

                {currentSubject.branches.length > 1 && (
                  <button
                    type="button"
                    onClick={selectAllBranches}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    {targetBranches.length === currentSubject.branches.length ? "Deselect All" : "Select All Sections"}
                  </button>
                )}
              </div>

              {/* Branch / Section Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                {currentSubject.branches.map((bCode) => {
                  const isSelected = targetBranches.includes(bCode);
                  return (
                    <button
                      key={bCode}
                      type="button"
                      onClick={() => toggleBranch(bCode)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20"
                          : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                      )}
                      <span>Section {bCode}</span>
                    </button>
                  );
                })}
              </div>

              {/* Isolation Confirmation Badge */}
              <div className="p-3 bg-white/95 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <span className="font-bold text-slate-900">Isolation Active:</span> Uploading for{" "}
                  <span className="font-bold text-blue-700">{targetBranches.join(", ")}</span> (Sem {currentSubject.semester} • {selectedRegulation}).
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back: Change Semester</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStep2Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next: Details & Files</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DETAILS & FILE UPLOAD */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Context Pill */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">
                {selectedRegulation}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                Sem {selectedSemester}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-200/80 text-slate-800 font-bold font-mono">
                {selectedSubjectCode}
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-xs">
                {currentSubject?.title}
              </span>
              <span className="text-slate-500 font-medium">
                • Target: <span className="font-bold text-blue-700">{targetBranches.join(", ")}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Change Subject
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Material Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title or unit topic name"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Material Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {MATERIAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Topic Tags (Optional)
              </label>
              <input
                id="tags"
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="Enter topic keywords separated by commas"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description / Instructions (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, syllabus unit mappings, or instructions for students..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attach Documents (PDF, Word, PPT) *
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-primary/40 bg-slate-50/60 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Click to select or drag and drop study materials
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                  Supported formats: <span className="font-semibold text-slate-700">PDF, Word (.docx), PowerPoint (.pptx)</span> (Up to 100MB each)
                </p>
              </div>
            </div>
          </div>

          {/* Attached Files List */}
          {files.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Attached Files ({files.length})
              </span>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div 
                    key={`${file.name}-${idx}`} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back: Subject Selection</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStep3Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next: Review & Publish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW & PUBLISH */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Review Material Details</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{title}</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {selectedTypeLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Regulation & Semester</span>
                <span className="font-bold text-indigo-900 text-sm mt-0.5 block">{selectedRegulation} • Semester {selectedSemester}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Course Subject</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedSubjectCode}</span>
                <span className="text-[11px] text-slate-500 truncate block">{currentSubject?.title}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Destination Sections</span>
                <span className="font-bold text-blue-700 text-sm mt-0.5 block">{targetBranches.join(", ")}</span>
              </div>
            </div>

            {description && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed font-normal">{description}</p>
              </div>
            )}

            {/* Files Attached Summary */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Attached Study Files ({files.length})
              </span>
              <div className="space-y-1.5">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/70 text-xs text-slate-800">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate flex-1">{file.name}</span>
                    <span className="text-slate-400 text-[11px]">{formatSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Publish to Section Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
