"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Code,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  Image as ImageIcon,
  Copy,
  Check
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
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const ext = "." + (fileName.split(".").pop() || "").toLowerCase();

  const isPdf = ext === ".pdf" || mimeType.includes("pdf");
  const isImage = /\.(jpe?g|png|webp|gif|svg|bmp)$/i.test(fileName) || mimeType.startsWith("image/");
  const isCodeOrText = [
    ".txt", ".md", ".py", ".java", ".c", ".cpp", ".h", ".cs", ".js", 
    ".ts", ".tsx", ".jsx", ".html", ".css", ".json", ".sql", ".ipynb", 
    ".sh", ".bash", ".xml", ".yaml", ".yml", ".csv", ".env", ".log"
  ].includes(ext) || mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("javascript");

  const isSpreadsheet = [".xls", ".xlsx", ".csv"].includes(ext) || mimeType.includes("spreadsheet") || mimeType.includes("excel");
  const isPresentation = [".ppt", ".pptx"].includes(ext) || mimeType.includes("presentation") || mimeType.includes("powerpoint");
  const isArchive = [".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext) || mimeType.includes("zip") || mimeType.includes("compressed");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setTextContent(null);
      setFetchError(null);
      setIsCopied(false);
      document.body.style.overflow = "hidden";

      if (isCodeOrText && fileUrl) {
        fetch(fileUrl)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to load text content.");
            return res.text();
          })
          .then((text) => {
            setTextContent(text);
            setIsLoading(false);
          })
          .catch((err) => {
            setFetchError(err.message || "Failed to load content.");
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, fileUrl, isCodeOrText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getFormatBadge = () => {
    if (isPdf) return { label: "PDF Document", icon: <FileText className="h-4 w-4 text-rose-600" /> };
    if (isImage) return { label: "Image Asset", icon: <ImageIcon className="h-4 w-4 text-pink-600" /> };
    if (isCodeOrText) return { label: `${ext.replace(".", "").toUpperCase()} Code/Text`, icon: <Code className="h-4 w-4 text-emerald-600" /> };
    if (isSpreadsheet) return { label: "Spreadsheet Data", icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> };
    if (isPresentation) return { label: "Presentation Slide Deck", icon: <Presentation className="h-4 w-4 text-amber-600" /> };
    if (isArchive) return { label: "Archive Package", icon: <FileArchive className="h-4 w-4 text-purple-600" /> };
    return { label: `${ext.replace(".", "").toUpperCase() || "File"} Resource`, icon: <FileText className="h-4 w-4 text-blue-600" /> };
  };

  const badge = getFormatBadge();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        data-lenis-prevent
        className={`bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in zoom-in-95 overscroll-contain ${
          isFullscreen 
            ? "w-full h-full rounded-none" 
            : "w-full max-w-5xl h-[85vh] max-h-[900px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
              {badge.icon}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                {fileName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">{badge.label}</span>
                <span>•</span>
                <span>Original Format Preserved</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isCodeOrText && textContent && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                title="Copy contents"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="hidden sm:inline text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            )}

            {onDownload && (
              <button
                onClick={onDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                title={`Download original ${ext.toUpperCase() || "file"}`}
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  Download {ext.toUpperCase()}
                </span>
              </button>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:inline-flex p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
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
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-900/5 relative overflow-auto flex items-center justify-center p-2 sm:p-4">
          {!fileUrl ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-700">Generating secure preview stream...</p>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full rounded-xl border border-slate-200 bg-white"
                title={fileName}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isImage ? (
            <div className="max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md bg-white border border-slate-200"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isCodeOrText ? (
            <div className="w-full h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner text-slate-200">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
                <span>{fileName} ({ext})</span>
                <span>{textContent ? `${textContent.split("\n").length} lines` : "Loading..."}</span>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed select-text">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    <span>Loading source code...</span>
                  </div>
                ) : fetchError ? (
                  <div className="text-rose-400 p-4">{fetchError}</div>
                ) : (
                  <pre className="whitespace-pre overflow-x-auto text-slate-100">
                    <code>{textContent}</code>
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  This file is stored in its native <strong>{ext.toUpperCase()}</strong> format. Direct in-browser rendering is reserved for PDFs, images, and text/code files.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <span>Preserves original extension:</span>
                  <code className="text-blue-600 font-bold">{ext}</code>
                </div>
              </div>
              {onDownload && (
                <button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Original ({ext.toUpperCase()})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
