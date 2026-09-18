"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Loader2, 
  AlertCircle, 
  Download,
  Maximize2,
  ExternalLink
} from "lucide-react";

interface PdfCanvasViewerProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export default function PdfCanvasViewer({ fileUrl, fileName, onDownload }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("Loading PDF...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const renderTaskRef = useRef<any>(null);

  // 1. Dynamically Load PDF.js library
  useEffect(() => {
    let isMounted = true;

    async function loadPdfJs() {
      setIsLoading(true);
      setErrorMsg(null);
      setLoadingProgress("Initializing document reader...");

      if (window.pdfjsLib) {
        loadDocument(window.pdfjsLib);
        return;
      }

      // Load script from local public folder or CDN fallback
      const script = document.createElement("script");
      script.src = "/pdf.min.js";
      script.async = true;

      script.onload = () => {
        if (!isMounted) return;
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
          loadDocument(window.pdfjsLib);
        } else {
          loadFromCdn();
        }
      };

      script.onerror = () => {
        if (!isMounted) return;
        loadFromCdn();
      };

      document.body.appendChild(script);

      function loadFromCdn() {
        const cdnScript = document.createElement("script");
        cdnScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        cdnScript.async = true;
        cdnScript.onload = () => {
          if (!isMounted) return;
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            loadDocument(window.pdfjsLib);
          } else {
            setErrorMsg("Could not load PDF rendering engine.");
            setIsLoading(false);
          }
        };
        cdnScript.onerror = () => {
          if (!isMounted) return;
          setErrorMsg("Could not load PDF reader from network. Please download the document directly.");
          setIsLoading(false);
        };
        document.body.appendChild(cdnScript);
      }
    }

    async function loadDocument(pdfjs: any) {
      try {
        setLoadingProgress("Fetching document stream...");
        const loadingTask = pdfjs.getDocument({
          url: fileUrl,
          withCredentials: true,
        });

        loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
          if (progressData.total > 0) {
            const percent = Math.round((progressData.loaded / progressData.total) * 100);
            setLoadingProgress(`Downloading PDF ${percent}%...`);
          }
        };

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("PDF.js loading error:", err);
        setErrorMsg("Failed to decode PDF content. The file may be password protected or downloading.");
        setIsLoading(false);
      }
    }

    loadPdfJs();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [fileUrl]);

  // 2. Render Page onto Canvas with High DPI & Dynamic Mobile Scaling
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const unscaledViewport = page.getViewport({ scale: 1.0, rotation });
      
      // Calculate responsive width (padding consideration)
      const availableWidth = Math.max(container.clientWidth - 24, 280);
      const baseScale = availableWidth / unscaledViewport.width;
      const finalScale = baseScale * zoomLevel;

      const viewport = page.getViewport({ scale: finalScale, rotation });

      // Support High-DPI / Retina screens for razor-sharp text
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      ctx.restore();
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn("PDF page render warning:", err);
      }
    }
  }, [pdfDoc, currentPage, zoomLevel, rotation]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Responsive re-render on container resize
  useEffect(() => {
    const handleResize = () => {
      renderCurrentPage();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCurrentPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(2.5, +(z + 0.2).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(0.6, +(z - 0.2).toFixed(1)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900/5 select-none relative">
      {/* Top Mobile-Friendly PDF Toolbar */}
      <div className="px-3 py-2 bg-white border-b border-slate-200/90 flex items-center justify-between gap-2 shrink-0 shadow-2xs z-10 flex-wrap">
        {/* Paging Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-bold text-slate-800 px-1.5 min-w-[75px] text-center">
            {totalPages > 0 ? (
              <span>
                {currentPage} <span className="text-slate-400 font-normal">/</span> {totalPages}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">-- / --</span>
            )}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.6 || isLoading}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Reset Zoom to Fit"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5 || isLoading}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Rotate Page"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center relative min-h-[350px] bg-slate-100/60"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 z-20 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {loadingProgress}
            </p>
          </div>
        )}

        {errorMsg ? (
          <div className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 z-10 m-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Mobile Preview Notice</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {errorMsg}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Document</span>
                </button>
              )}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="transition-transform duration-150 flex items-center justify-center shadow-lg rounded-xl overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
