"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Loader2, 
  Maximize2, 
  Minimize2 
} from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string | null;
  mimeType?: string;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  mimeType = "",
  onDownload,
  isDownloading = false,
}: FilePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  const isPdf = fileName.toLowerCase().endsWith(".pdf") || mimeType.includes("pdf");
  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(fileName) || mimeType.startsWith("image/");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-primary/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? "w-full h-full rounded-none" 
            : "w-full max-w-5xl h-[85vh] max-h-[900px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-bg/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-primary text-sm sm:text-base truncate leading-tight">
                {fileName}
              </h3>
              <p className="text-xs text-primary/50 mt-0.5">In-Browser Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onDownload && (
              <button
                onClick={onDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer disabled:opacity-50"
                title="Download file"
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:inline-flex p-1.5 text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-primary/70 hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-bg relative overflow-auto flex items-center justify-center p-2 sm:p-4">
          {!fileUrl ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              <p className="text-sm font-medium text-primary/60">Generating secure preview link...</p>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              )}
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full rounded-xl border border-border/60 bg-white"
                title={fileName}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isImage ? (
            <div className="max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="max-w-md p-8 bg-surface rounded-2xl border border-border shadow-xs text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-base">{fileName}</h4>
                <p className="text-xs text-primary/60 mt-1.5 leading-relaxed">
                  In-browser preview is optimized for PDF and image formats. Please download the file to view presentation slides or documents on your device.
                </p>
              </div>
              {onDownload && (
                <button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
