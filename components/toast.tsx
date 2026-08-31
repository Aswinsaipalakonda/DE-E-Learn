"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    // Auto dismiss after 4.5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, onDismiss]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-danger shrink-0" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-secondary shrink-0" />;
    }
  };

  const getBorderBg = () => {
    switch (toast.type) {
      case "success":
        return "border-success/30 bg-surface/95 shadow-lg shadow-success/5";
      case "error":
        return "border-danger/30 bg-surface/95 shadow-lg shadow-danger/5";
      case "info":
      default:
        return "border-secondary/30 bg-surface/95 shadow-lg shadow-secondary/5";
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform ${getBorderBg()} ${
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-8 opacity-0 scale-95"
      }`}
      role="alert"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold text-primary leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] font-medium text-primary/70 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="p-1 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
