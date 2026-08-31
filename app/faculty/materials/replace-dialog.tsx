"use client";

import { useState } from "react";
import { replaceFileVersion } from "./actions";
import { X, Upload, Loader2 } from "lucide-react";

interface ReplaceDialogProps {
  materialId: string;
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export default function ReplaceDialog({ materialId, fileId, fileName, onClose }: ReplaceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip"];
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        alert(`File type ${ext} is not allowed. Supported: PDF, PPT/X, DOC/X, ZIP.`);
        return;
      }
      if (selectedFile.size > maxFileSize) {
        alert("File exceeds 100MB limit.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("materialId", materialId);
      formData.append("fileId", fileId);
      formData.append("file", file);

      const result = await replaceFileVersion(formData);
      if (result.error) {
        setError(result.error);
      } else {
        alert("Version updated successfully!");
        onClose();
        window.location.reload();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 ease-[cubic-bezier(0.16,1,0.3,1)] duration-300">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-bg text-primary/60 rounded-md cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-base font-bold text-primary mb-2">Upload New Version</h2>
        <p className="text-xs text-primary/60 mb-6 leading-relaxed">
          Replacing <span className="font-semibold">{fileName}</span> will increment the version number while preserving the download links.
        </p>

        {error && (
          <div role="alert" className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-secondary rounded-xl bg-bg/30 text-center relative group transition-colors cursor-pointer">
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="h-8 w-8 text-primary/40 group-hover:text-secondary mb-2 transition-colors" />
            <span className="text-xs font-semibold text-primary">
              {file ? file.name : "Select replacement file"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Uploading version...
              </>
            ) : (
              "Submit Version Update"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
