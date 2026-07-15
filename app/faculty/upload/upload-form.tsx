"use client";

import { useState } from "react";
import { uploadMaterialAction } from "./actions";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  X,
  FileText
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

  // Form Fields State
  const [subjectCode, setSubjectCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"draft" | "published">("published");

  // Selected subject metadata derived
  const selectedSubject = subjects.find(s => s.code === subjectCode);

  const materialTypes = [
    "Notes",
    "Lecture Slides",
    "Assignments",
    "Lab Manuals",
    "Question Banks",
    "Model Papers",
    "Reference Books",
    "Previous Papers",
    "Other Resources",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Extension and size checks
      const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip"];
      const maxFileSize = 100 * 1024 * 1024; // 100 MB

      for (const file of selectedFiles) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          alert(`File type ${ext} is not allowed. Supported: PDF, PPT/X, DOC/X, ZIP.`);
          return;
        }
        if (file.size > maxFileSize) {
          alert(`File ${file.name} exceeds the 100MB limit.`);
          return;
        }
      }

      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isStep1Valid = !!subjectCode;
  const isStep2Valid = !!title && !!type && files.length > 0;

  const handleNext = () => {
    setError(null);
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
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
      formData.append("branch", selectedSubject?.branch || "");
      formData.append("semester", String(selectedSubject?.semester || ""));
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
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface rounded-2xl border border-border shadow-xs p-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-primary text-white" : "bg-bg text-primary/40"}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? "text-primary" : "text-primary/40"}`}>Taxonomy</span>
        </div>
        <div className="h-0.5 w-12 bg-border" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-primary text-white" : "bg-bg text-primary/40"}`}>
            {step > 2 ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? "text-primary" : "text-primary/40"}`}>Details</span>
        </div>
        <div className="h-0.5 w-12 bg-border" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "bg-primary text-white" : "bg-bg text-primary/40"}`}>
            3
          </div>
          <span className={`text-xs font-semibold ${step >= 3 ? "text-primary" : "text-primary/40"}`}>Review</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Scope Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-primary mb-2">
              Select Course Subject
            </label>
            <select
              id="subject"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
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
            <div className="p-4 bg-bg rounded-xl border border-border space-y-2 text-sm">
              <span className="font-semibold text-primary/60 block uppercase text-[10px] tracking-wider">Target Scope Preview:</span>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/5 text-primary border border-primary/10">
                  {selectedSubject.branch}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-secondary/10 text-secondary border border-secondary/10">
                  Semester {selectedSubject.semester}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details & Files */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-primary mb-2">
              Material Title
            </label>
            <input
              id="title"
              required
              placeholder="e.g., Unit 1 Syllabus Notes - Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-primary mb-2">
                Resource Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              >
                <option value="">-- Choose Type --</option>
                {materialTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-primary mb-2">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                placeholder="e.g., syllabus, unit1, pdf"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-primary mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide a brief summary of the upload content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Attach Files
            </label>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-secondary rounded-xl bg-bg/30 text-center cursor-pointer relative group transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-8 w-8 text-primary/40 group-hover:text-secondary mb-2 transition-colors" />
              <span className="text-xs font-semibold text-primary">Drag files here or click to browse</span>
              <span className="text-[10px] text-primary/45 mt-1 block">PDF, PPT/X, DOC/X, ZIP (Max 100MB per file)</span>
            </div>

            {/* Selected files list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-primary/40 shrink-0" />
                      <span className="text-xs font-semibold text-primary truncate max-w-[300px]">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-border text-danger hover:text-danger/80 rounded-md cursor-pointer transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-surface hover:bg-bg border border-border text-primary font-semibold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStep2Valid}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-5 bg-bg rounded-xl border border-border space-y-4 text-sm">
            <h3 className="font-bold text-primary border-b border-border pb-2 text-xs uppercase tracking-wider text-primary/50">Summary Review</h3>
            <div className="space-y-2 font-medium">
              <div>
                <span className="text-primary/55 block text-xs">Subject</span>
                <span className="text-primary font-bold">{subjectCode} - {selectedSubject?.title}</span>
              </div>
              <div>
                <span className="text-primary/55 block text-xs">Title</span>
                <span className="text-primary font-bold">{title}</span>
              </div>
              <div>
                <span className="text-primary/55 block text-xs">Type</span>
                <span className="text-primary font-bold">{type}</span>
              </div>
              <div>
                <span className="text-primary/55 block text-xs">Scope</span>
                <span className="text-primary font-bold">{selectedSubject?.branch}, Semester {selectedSubject?.semester}</span>
              </div>
              <div>
                <span className="text-primary/55 block text-xs">Attached Files</span>
                <span className="text-primary font-bold">{files.length} file(s) ready</span>
              </div>
            </div>
          </div>

          {/* Visibility selection */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Visibility state
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setState("published")}
                className={`p-4 rounded-xl border text-sm font-semibold text-center cursor-pointer transition-all ${
                  state === "published"
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-surface border-border text-primary/70 hover:bg-bg hover:text-primary"
                }`}
              >
                Publish Immediately
              </button>
              <button
                type="button"
                onClick={() => setState("draft")}
                className={`p-4 rounded-xl border text-sm font-semibold text-center cursor-pointer transition-all ${
                  state === "draft"
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-surface border-border text-primary/70 hover:bg-bg hover:text-primary"
                }`}
              >
                Save as Draft
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 bg-surface hover:bg-bg border border-border text-primary font-semibold text-sm rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex gap-3">
              {state === "published" ? (
                <>
                  <button
                    onClick={() => handleSubmit("draft")}
                    disabled={loading}
                    className="px-4 py-2.5 bg-surface hover:bg-bg border border-border text-primary font-semibold text-sm rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit("published")}
                    disabled={loading}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? "Publishing..." : "Publish Material"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Draft"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
