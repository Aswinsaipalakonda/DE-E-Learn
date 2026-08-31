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
      const result = await trackDownloadAndGetUrl(fileId, materialId, storageRef, fileName);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.downloadUrl) {
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
      const res = await trackPreviewAndGetUrl(file.id, materialId, file.storage_ref, file.file_name);
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
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {files.map((file) => {
            const isDownloading = downloadingId === file.id;
            return (
              <div 
                key={file.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-slate-50/70 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {file.file_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-normal">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span className="uppercase">{file.file_name.split(".").pop() || "PDF"} Document</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    onClick={() => handlePreview(file)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(file.id, file.storage_ref, file.file_name)}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{isDownloading ? "Preparing..." : "Download"}</span>
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
          onDownload={() => handleDownload(previewingFile.id, previewingFile.storageRef, previewingFile.fileName)}
          isDownloading={downloadingId === previewingFile.id}
        />
      )}
    </>
  );
}
