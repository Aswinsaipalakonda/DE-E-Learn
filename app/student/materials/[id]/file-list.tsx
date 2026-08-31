"use client";

import { useState } from "react";
import { trackDownloadAndGetUrl, trackPreviewAndGetUrl } from "./actions";
import { Download, FileText, Loader2, Eye } from "lucide-react";
import FilePreviewModal from "@/components/file-preview-modal";

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
  const [previewingFile, setPreviewingFile] = useState<{
    id: string;
    fileName: string;
    fileUrl: string | null;
    mimeType: string;
    storageRef: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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

  const handlePreview = async (file: FileItem) => {
    setPreviewingFile({
      id: file.id,
      fileName: file.file_name,
      fileUrl: null,
      mimeType: file.mime_type,
      storageRef: file.storage_ref,
    });
    setIsPreviewModalOpen(true);

    try {
      const res = await trackPreviewAndGetUrl(file.id, materialId, file.storage_ref);
      if (res.error) {
        alert(res.error);
        setIsPreviewModalOpen(false);
        return;
      }
      if (res.previewUrl) {
        setPreviewingFile((prev) => (prev ? { ...prev, fileUrl: res.previewUrl } : null));
      }
    } catch {
      alert("Failed to open preview.");
      setIsPreviewModalOpen(false);
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
    <>
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {files.map((file) => {
            const isDownloading = downloadingId === file.id;
            return (
              <div 
                key={file.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-bg/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-primary text-sm sm:text-base block truncate leading-tight">
                      {file.file_name}
                    </span>
                    <span className="text-xs text-primary/40 mt-1 block">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handlePreview(file)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 font-semibold text-xs transition-all cursor-pointer"
                    aria-label={`Preview ${file.file_name}`}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>

                  <button
                    onClick={() => handleDownload(file.id, file.storage_ref, file.file_name)}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                    aria-label={`Download ${file.file_name}`}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewingFile && (
        <FilePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          fileName={previewingFile.fileName}
          fileUrl={previewingFile.fileUrl}
          mimeType={previewingFile.mimeType}
          onDownload={() =>
            handleDownload(
              previewingFile.id,
              previewingFile.storageRef,
              previewingFile.fileName
            )
          }
          isDownloading={downloadingId === previewingFile.id}
        />
      )}
    </>
  );
}

