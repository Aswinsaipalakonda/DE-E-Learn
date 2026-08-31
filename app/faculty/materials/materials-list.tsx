"use client";

import { useState } from "react";
import { toggleMaterialState, deleteMaterial, getFacultyFilePreviewUrl } from "./actions";
import ReplaceDialog from "./replace-dialog";
import FilePreviewModal from "@/components/file-preview-modal";
import { 
  FileText, 
  Archive, 
  Trash, 
  RefreshCw, 
  Globe,
  Eye,
  Download,
  Loader2
} from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  state: "draft" | "published" | "archived" | "deleted";
  created_at: string;
  subject: string;
  material_files: FileItem[];
}

interface MaterialsListProps {
  initialMaterials: MaterialItem[];
}

export default function MaterialsList({ initialMaterials }: MaterialsListProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [activeTab, setActiveTab] = useState<"published" | "draft" | "archived">("published");

  // Replace file version modal state
  const [replaceTarget, setReplaceTarget] = useState<{
    materialId: string;
    fileId: string;
    fileName: string;
  } | null>(null);

  // File preview modal state
  const [previewingFile, setPreviewingFile] = useState<{
    fileName: string;
    fileUrl: string | null;
    mimeType: string;
    storageRef: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  const filteredMaterials = materials.filter(m => m.state === activeTab);

  const handleStateToggle = async (id: string, newState: "draft" | "published" | "archived") => {
    const result = await toggleMaterialState(id, newState);
    if (result.success) {
      setMaterials(prev =>
        prev.map(m => (m.id === id ? { ...m, state: newState } : m))
      );
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material? This will soft delete the record.")) return;

    const result = await deleteMaterial(id);
    if (result.success) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    } else {
      alert(result.error);
    }
  };

  const handlePreview = async (file: FileItem) => {
    setPreviewingFile({
      fileName: file.file_name,
      fileUrl: null,
      mimeType: file.mime_type,
      storageRef: file.storage_ref,
    });
    setIsPreviewOpen(true);

    try {
      const res = await getFacultyFilePreviewUrl(file.storage_ref);
      if (res.error) {
        alert(res.error);
        setIsPreviewOpen(false);
        return;
      }
      if (res.previewUrl) {
        setPreviewingFile(prev => prev ? { ...prev, fileUrl: res.previewUrl } : null);
      }
    } catch {
      alert("Failed to load preview.");
      setIsPreviewOpen(false);
    }
  };

  const handleDownload = async (storageRef: string, fileName: string) => {
    setDownloadingRef(storageRef);
    try {
      const res = await getFacultyFilePreviewUrl(storageRef);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.previewUrl) {
        const link = document.createElement("a");
        link.href = res.previewUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Failed to download file.");
    } finally {
      setDownloadingRef(null);
    }
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb.toFixed(1) + " KB";
  };

  return (
    <div className="space-y-6">
      {/* State Tabs */}
      <div className="flex border-b border-border">
        {(["published", "draft", "archived"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-primary/50 hover:text-primary"
            }`}
          >
            {tab} ({materials.filter(m => m.state === tab).length})
          </button>
        ))}
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(m => (
            <div key={m.id} className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-2 py-0.5 rounded-md border border-secondary/10">
                      {m.subject}
                    </span>
                    <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest bg-bg px-2 py-0.5 rounded-md border border-border">
                      {m.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-primary text-base mt-2">{m.title}</h3>
                </div>

                {/* Material Action Controls */}
                <div className="flex items-center gap-2">
                  {activeTab === "draft" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "published")}
                      className="px-3 py-1.5 bg-success/10 hover:bg-success/15 text-success text-xs font-semibold rounded-lg border border-success/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5" /> Publish
                    </button>
                  )}
                  {activeTab === "published" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "archived")}
                      className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary/80 text-xs font-semibold rounded-lg border border-border flex items-center gap-1.5 cursor-pointer"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  )}
                  {activeTab === "archived" && (
                    <button
                      onClick={() => handleStateToggle(m.id, "published")}
                      className="px-3 py-1.5 bg-success/10 hover:bg-success/15 text-success text-xs font-semibold rounded-lg border border-success/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5" /> Restore
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 bg-danger/5 hover:bg-danger/10 text-danger rounded-lg border border-danger/10 cursor-pointer"
                    aria-label="Delete material"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Nested Files / Version Control Area */}
              <div className="border-t border-border pt-4 space-y-3">
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Files Attached:</span>
                <div className="space-y-2">
                  {m.material_files && m.material_files.length > 0 ? (
                    // Group files by name and show the latest version (highest version number)
                    m.material_files
                      .filter((f, idx, self) => self.findIndex(t => t.file_name === f.file_name) === idx)
                      .map(file => {
                        const isDownloading = downloadingRef === file.storage_ref;
                        return (
                          <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-bg/50 rounded-xl border border-border text-xs gap-3">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 text-primary/40 shrink-0" />
                              <span className="font-bold text-primary truncate max-w-[200px] sm:max-w-xs">{file.file_name}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[9px] font-black border border-secondary/10">
                                v{file.version}
                              </span>
                              <span className="text-primary/40">{formatSize(file.size)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                onClick={() => handlePreview(file)}
                                className="px-2.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="h-3 w-3" /> Preview
                              </button>

                              <button
                                onClick={() => handleDownload(file.storage_ref, file.file_name)}
                                disabled={isDownloading}
                                className="px-2.5 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                                Download
                              </button>

                              <button
                                onClick={() => setReplaceTarget({
                                  materialId: m.id,
                                  fileId: file.id,
                                  fileName: file.file_name,
                                })}
                                className="px-2.5 py-1.5 bg-surface hover:bg-border text-primary/80 hover:text-primary text-[11px] font-bold rounded-lg border border-border flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <RefreshCw className="h-3 w-3" /> Replace
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <span className="text-xs text-primary/40">No files registered.</span>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-surface border border-border rounded-2xl text-primary/45 text-sm font-semibold">
            No materials found in this tab.
          </div>
        )}
      </div>

      {/* Render Replace File Version Dialog */}
      {replaceTarget && (
        <ReplaceDialog
          materialId={replaceTarget.materialId}
          fileId={replaceTarget.fileId}
          fileName={replaceTarget.fileName}
          onClose={() => setReplaceTarget(null)}
        />
      )}

      {/* Render File Preview Modal */}
      {previewingFile && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileName={previewingFile.fileName}
          fileUrl={previewingFile.fileUrl}
          mimeType={previewingFile.mimeType}
          onDownload={() => handleDownload(previewingFile.storageRef, previewingFile.fileName)}
          isDownloading={downloadingRef === previewingFile.storageRef}
        />
      )}
    </div>
  );
}

