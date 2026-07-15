"use client";

import { useState } from "react";
import { trackDownloadAndGetUrl } from "./actions";
import { Download, FileText, Loader2 } from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  storage_ref: string;
}

interface FileListProps {
  materialId: string;
  files: FileItem[];
}

export default function FileList({ materialId, files }: FileListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (fileId: string, storageRef: string, fileName: string) => {
    setDownloadingId(fileId);
    try {
      const result = await trackDownloadAndGetUrl(fileId, materialId, storageRef);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.downloadUrl) {
        // Open/download in browser
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Failed to initiate download. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {files.map((file) => {
          const isDownloading = downloadingId === file.id;
          return (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-5 hover:bg-bg/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary/50" />
                <div>
                  <span className="font-bold text-primary text-sm block leading-tight">{file.file_name}</span>
                  <span className="text-xs text-primary/40 mt-1 block">{formatSize(file.size)}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownload(file.id, file.storage_ref, file.file_name)}
                disabled={isDownloading}
                className="p-2.5 bg-primary/5 text-primary hover:bg-secondary/10 hover:text-secondary disabled:opacity-50 rounded-xl transition-all cursor-pointer"
                aria-label={`Download ${file.file_name}`}
              >
                {isDownloading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Download className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
