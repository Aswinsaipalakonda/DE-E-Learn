"use client";

import { useState, useRef } from "react";
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
  FileType
} from "lucide-react";

interface SubjectOption {
  code: string;
  title: string;
  branch: string;
  semester: number;
}

interface UploadFormProps {
  subjects: SubjectOption[];
}

export default function UploadForm({ subjects }: UploadFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [subjectCode, setSubjectCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Lecture Notes");
  const [tagsStr, setTagsStr] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"draft" | "published">("published");

  // Selected subject metadata derived
  const selectedSubject = subjects.find(s => s.code === subjectCode);

  const materialTypes = [
    "Lecture Notes",
    "Lecture Slides",
    "Lab Manual",
    "Assignments",
    "Question Bank",
    "Model Papers",
    "Reference Books",
    "Code Repository",
  ];

  // Allowed extensions: PDF, Word (doc/docx), PowerPoint (ppt/pptx), Text (txt). No zip/rar!
  const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"];
  const maxFileSize = 100 * 1024 * 1024; // 100 MB per file

  const validateAndAddFiles = (incomingFiles: File[]) => {
    setError(null);
    const validIncoming: File[] = [];

    for (const file of incomingFiles) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        setError(`File type "${ext}" is not supported. Please upload PDF, Word (.doc/.docx), or PowerPoint (.ppt/.pptx) files only. (Zip/rar files are not allowed).`);
        return;
      }

      if (file.size > maxFileSize) {
        setError(`File "${file.name}" exceeds the maximum 100MB limit.`);
        return;
      }

      // Avoid duplicates by name & size
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
      // Reset input value so same files can be re-selected if needed
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

  const isStep1Valid = !!subjectCode;
  const isStep2Valid = !!title.trim() && !!type && files.length > 0;

  const handleNext = () => {
    setError(null);
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) {
      if (files.length === 0) {
        setError("Please attach at least 1 study document (PDF, Word, or PPT).");
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
      formData.append("subject", subjectCode);
      formData.append("branch", selectedSubject?.branch || "CIC");
      formData.append("semester", String(selectedSubject?.semester || 3));
      formData.append("type", type);
      formData.append("state", finalState);
      formData.append("tags", tagsStr);
      
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

  // Helper to format file size
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + " MB";
    const kb = bytes / 1024;
    return kb.toFixed(1) + " KB";
  };

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
            Subject
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
        <div role="alert" className="p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SUBJECT & TAXONOMY SELECTION */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Target Course Subject
            </label>
            <p className="text-xs text-slate-500">
              Choose the course subject for which you are publishing syllabus material.
            </p>
            <select
              id="subject"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.title} ({s.branch}, Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          {selectedSubject && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
              <span className="font-bold text-slate-500 block uppercase text-[10px] tracking-wider">
                Target Curriculum Scope:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedSubject.code}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  {selectedSubject.branch} Branch
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Semester {selectedSubject.semester}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium pt-1">
                {selectedSubject.title}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-40"
            >
              <span>Continue to Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DETAILS & FILE ATTACHMENTS */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Material Title *
            </label>
            <input
              id="title"
              required
              placeholder="e.g., Unit 1 Relational Data Models & Schema Normalization"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="type" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Material Category *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {materialTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Search Tags (Optional)
              </label>
              <input
                id="tags"
                placeholder="e.g., unit1, bcnf, notes, mid1"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Syllabus Objectives (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Outline unit learning objectives, topics covered, and reading instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* File Upload Drag & Drop Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attach Verified Study Files *
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {files.length} file{files.length === 1 ? "" : "s"} selected
              </span>
            </div>

            {/* Dropzone Container */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer relative transition-all ${
                isDragging
                  ? "border-primary bg-blue-50/60 scale-[1.01]"
                  : "border-slate-300 hover:border-primary bg-slate-50/70 hover:bg-slate-100/70"
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
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Click to browse or drag & drop files here
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block font-normal">
                Supported formats: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx) • Max 100MB per file
              </span>
            </div>

            {/* Attached files list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Attached Files ({files.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Add More Files
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 sm:p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate block max-w-xs sm:max-w-md">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {formatSize(file.size)} • {file.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-full cursor-pointer transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!isStep2Valid}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <span>Review Material</span>
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
          <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4 text-xs sm:text-sm">
            <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-2 text-xs uppercase tracking-wider">
              Upload Summary Confirmation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Course Subject</span>
                <span className="text-slate-900 font-bold block">{subjectCode} - {selectedSubject?.title}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Category</span>
                <span className="text-blue-700 font-bold block">{type}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Material Title</span>
                <span className="text-slate-900 font-bold block">{title}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Target Scope</span>
                <span className="text-slate-900 font-bold block">{selectedSubject?.branch} • Semester {selectedSubject?.semester}</span>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Attached Study Files</span>
                <span className="text-slate-900 font-bold block">
                  {files.length} document{files.length === 1 ? "" : "s"} ready for distribution
                </span>
                <div className="pt-1.5 space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{f.name} ({formatSize(f.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Publishing Mode
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setState("published")}
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold text-center cursor-pointer transition-all ${
                  state === "published"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                🚀 Publish Immediately
              </button>
              <button
                type="button"
                onClick={() => setState("draft")}
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold text-center cursor-pointer transition-all ${
                  state === "draft"
                    ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                📝 Save as Draft
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {state === "published" ? (
                <>
                  <button
                    onClick={() => handleSubmit("draft")}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit("published")}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{loading ? "Publishing..." : "Publish Material"}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{loading ? "Saving..." : "Save Draft"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
