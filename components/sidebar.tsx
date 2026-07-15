"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Bookmark, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Upload,
  FileText
} from "lucide-react";

interface SidebarProps {
  userRole: "student" | "faculty" | "admin";
  userScope?: {
    branch?: string;
    semester?: number;
  };
  signOutAction: () => Promise<void>;
}

export default function Sidebar({ userRole, userScope, signOutAction }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = {
    student: [
      { name: "Dashboard", href: "/student", icon: LayoutDashboard },
      { name: "Subjects", href: "/student/subjects", icon: BookOpen },
      { name: "Bookmarks", href: "/student/bookmarks", icon: Bookmark },
    ],
    faculty: [
      { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
      { name: "Upload Material", href: "/faculty/upload", icon: Upload },
      { name: "My Materials", href: "/faculty/materials", icon: FileText },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  };

  const navItems = navigation[userRole] || [];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-surface border border-border text-primary hover:bg-bg cursor-pointer focus:outline-none"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X className="h-6 h-6" /> : <Menu className="h-6 h-6" />}
        </button>
      </div>

      {/* Overlay behind sidebar on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-primary/20 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-surface border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
              <Image
                src="/De_logo.jpg"
                alt="Logo"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-primary text-sm block">DE E-Learn</span>
              <span className="text-xs text-primary/45 font-semibold block uppercase tracking-wider">MVGR College</span>
            </div>
          </Link>
        </div>

        {/* User Scope Badge Panel */}
        {userScope && (userScope.branch || userScope.semester) && (
          <div className="px-6 py-4 border-b border-border bg-bg/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Current Scope</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {userScope.branch && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/5 text-primary border border-primary/10">
                    {userScope.branch}
                  </span>
                )}
                {userScope.semester && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/10">
                    Sem {userScope.semester}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-primary/75 hover:bg-bg hover:text-primary"
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-secondary" : "text-primary/60 group-hover:text-primary"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Panel (Signout / Profile) */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOutAction()}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-danger/80 hover:text-danger hover:bg-danger/5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
