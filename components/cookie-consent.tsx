"use client";

import { useState, useEffect } from "react";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a cookie choice
    const consent = localStorage.getItem("de_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type: "accepted" | "rejected" | "necessary_only") => {
    localStorage.setItem("de_cookie_consent", type);
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 max-w-xl z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}
      role="region"
      aria-label="Cookie consent banner"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl p-5 sm:p-6 space-y-4">
        
        {/* Main Banner Row */}
        <div className="flex items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/70 shadow-2xs">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Cookie &amp; Session Preferences
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded-full">
                  Essential Only
                </span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                We use strictly essential session cookies to authenticate student/faculty roles and preserve study vault bookmarks.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleConsent("rejected")}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Authentication JWT Token</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Strictly Required
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal pl-6">
              Maintains secure login sessions across tabs and validates role-based permissions for student and faculty portals.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2 flex-wrap">
          
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showPreferences ? "Hide details" : "Preferences"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConsent("necessary_only")}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleConsent("accepted")}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] rounded-full shadow-md transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CookieConsent;
