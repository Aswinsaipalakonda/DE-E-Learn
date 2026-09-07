"use client";

import { useState, useRef, useMemo } from "react";
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
  Users
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cascading Step 1 State
  const defaultReg = regulations.find(r => r.code === "R23")?.code || regulations[0]?.code || "R23";
  const [selectedRegulation, setSelectedRegulation] = useState(defaultReg);
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [targetBranches, setTargetBranches] = useState<string[]>([]);

  // Form Fields State (Step 2)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Notes");
  const [tagsStr, setTagsStr] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"draft" | "published">("published");

  // Filter and Group Subjects by Regulation & Semester
  const availableSubjectsForRegulation = useMemo(() => {
    return subjects.filter(s => (s.regulation || "R23") === selectedRegulation);
  }, [subjects, selectedRegulation]);

  // Group by Course Code to collect distinct subjects with their multi-branch mappings
  const groupedSubjects = useMemo(() => {
    const map = new Map<string, { code: string; title: string; semester: number; branches: string[]; regulation: string }>();
    
    for (const sub of availableSubjectsForRegulation) {
      if (semesterFilter !== "all" && sub.semester.toString() !== semesterFilter) {
        continue;
      }

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
  }, [availableSubjectsForRegulation, semesterFilter, selectedRegulation]);

  // Active Subject Group Metadata
  const currentSubject = useMemo(() => {
    return groupedSubjects.find(s => s.code === selectedSubjectCode);
  }, [groupedSubjects, selectedSubjectCode]);

  // Handle Regulation Change (reset subject & target branches)
  const handleRegulationChange = (reg: string) => {
    setSelectedRegulation(reg);
    setSelectedSubjectCode("");
    setTargetBranches([]);
  };

  // Handle Subject Change (default target to first branch)
  const handleSubjectChange = (code: string) => {
    setSelectedSubjectCode(code);
    const sub = groupedSubjects.find(s => s.code === code);
    if (sub && sub.branches.length > 0) {
      setTargetBranches([sub.branches[0]]);
    } else {
      setTargetBranches([]);
    }
  };

  // Toggle Target Branch Selection
  const toggleBranch = (bCode: string) => {
    setTargetBranches(prev => {
      if (prev.includes(bCode)) {
        if (prev.length === 1) return prev; // Keep at least one branch
        return prev.filter(b => b !== bCode);
      } else {
        return [...prev, bCode];
      }
    });
  };

  // Select All Branches for this subject
  const selectAllBranches = () => {
    if (!currentSubject) return;
    if (targetBranches.length === currentSubject.branches.length) {
      setTargetBranches([currentSubject.branches[0]]);
    } else {
      setTargetBranches([...currentSubject.branches]);
    }
  };

  // Allowed extensions: PDF, Word (doc/docx), PowerPoint (ppt/pptx), Text (txt)
  const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"];
  const maxFileSize = 100 * 1024 * 1024; // 100 MB per file

  const validateAndAddFiles = (incomingFiles: File[]) => {
    setError(null);
    const validIncoming: File[] = [];

    for (const file of incomingFiles) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        setError(`File type "${ext}" is not supported. Please upload PDF, Word (.doc/.docx), or PowerPoint (.ppt/.pptx) files.`);
        return;
      }

      if (file.size > maxFileSize) {
        setError(`File "${file.name}" exceeds the maximum 100MB limit.`);
        return;
      }

      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size);
      if (!isDuplicate) {
        validIncoming.push(file);
      }
    }

    if (validIncoming.length > 0) {
      setFiles(prev => [...prev, ...validIncoming]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
      e.target.value = "";
    }
  };

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

  const isStep1Valid = !!selectedSubjectCode && targetBranches.length > 0;
  const isStep2Valid = !!title.trim() && !!type && files.length > 0;

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!selectedSubjectCode) {
        setError("Please select a subject from the list.");
        return;
      }
      if (targetBranches.length === 0) {
        setError("Please select at least one destination section/branch.");
        return;
      }
    }
    if (step === 2 && !isStep2Valid) {
      if (files.length === 0) {
        setError("Please attach at least 1 document (PDF, Word, or PowerPoint).");
      } else if (!title.trim()) {
        setError("Please enter a title for the material.");
      }
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

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
      formData.append("semester", String(currentSubject?.semester || 3));
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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* STEPPER PROGRESS BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        {/* Step 1 */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 1 ? "bg-primary text-white shadow-2xs" : "bg-slate-100 text-slate-400"
          }`}>
            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className={`text-xs font-semibold hidden sm:inline ${
            step >= 1 ? "text-slate-900" : "text-slate-400"
          }`}>
            Regulation & Section
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all ${step >= 2 ? "bg-primary" : "bg-slate-200"}`} />

        {/* Step 2 */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 2 ? "bg-primary text-white shadow-2xs" : "bg-slate-100 text-slate-400"
          }`}>
            {step > 2 ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <span className={`text-xs font-semibold hidden sm:inline ${
            step >= 2 ? "text-slate-900" : "text-slate-400"
          }`}>
            Details & Files
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all ${step >= 3 ? "bg-primary" : "bg-slate-200"}`} />

        {/* Step 3 */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= 3 ? "bg-primary text-white shadow-2xs" : "bg-slate-100 text-slate-400"
          }`}>
            3
          </div>
          <span className={`text-xs font-semibold hidden sm:inline ${
            step >= 3 ? "text-slate-900" : "text-slate-400"
          }`}>
            Review & Publish
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 font-semibold animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: CASCADING REGULATION -> SUBJECT -> TARGET SECTION SELECTION */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Step 1A: Select Academic Regulation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-600" />
                <span>1. Select Academic Regulation *</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">Autonomous syllabus standard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {regulations.map((reg) => {
                const isSelected = selectedRegulation === reg.code;
                return (
                  <button
                    key={reg.code}
                    type="button"
                    onClick={() => handleRegulationChange(reg.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                        {reg.code}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5 font-medium">
                      {reg.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1B: Filter by Semester & Select Subject */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label htmlFor="subject-select" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>2. Select Course Subject ({selectedRegulation}) *</span>
              </label>

              {/* Quick Semester Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Semester:</span>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s.toString()}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <select
              id="subject-select"
              value={selectedSubjectCode}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">-- Choose Subject ({groupedSubjects.length} Available) --</option>
              {groupedSubjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.title} (Sem {s.semester} • {s.branches.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {/* Step 1C: Destination Section / Branch Selector */}
          {currentSubject && (
            <div className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 rounded-2xl border border-blue-200/80 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-700" />
                    <span>3. Destination Section / Branch Allocation *</span>
                  </h4>
                  <p className="text-xs text-blue-700/80 mt-0.5">
                    Select your assigned section(s). Material will <span className="font-bold underline">only</span> be visible to enrolled students of the selected section.
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
              <div className="p-3 bg-white/90 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <span className="font-bold text-slate-900">Isolation Active:</span> Uploading for{" "}
                  <span className="font-bold text-blue-700">{targetBranches.join(", ")}</span> (Sem {currentSubject.semester} • {selectedRegulation}). Other branches ({currentSubject.branches.filter(b => !targetBranches.includes(b)).join(", ") || "none"}) will not receive these files.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next: Details & Files</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DETAILS & FILE UPLOAD */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Summary pill of selected subject & target */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">
                {selectedRegulation}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                {selectedSubjectCode}
              </span>
              <span className="font-semibold text-slate-800">
                {currentSubject?.title}
              </span>
              <span className="text-slate-500 font-medium">
                • Target: <span className="font-bold text-blue-700">{targetBranches.join(", ")}</span> (Sem {currentSubject?.semester})
              </span>
            </div>

            <button
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
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStep2Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next: Review & Publish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW & PUBLISH */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6">
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
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Regulation</span>
                <span className="font-bold text-indigo-900 text-sm mt-0.5 block">{selectedRegulation}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subject & Sem</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedSubjectCode} (Sem {currentSubject?.semester})</span>
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
