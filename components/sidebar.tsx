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
  FileText, 
  Users, 
  Settings, 
  BarChart, 
  History, 
  User,
  Megaphone
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
      { name: "Profile", href: "/student/profile", icon: User },
    ],
    faculty: [
      { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
      { name: "Upload Material", href: "/faculty/upload", icon: Upload },
      { name: "My Materials", href: "/faculty/materials", icon: FileText },
      { name: "Profile", href: "/faculty/profile", icon: User },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Courses & Branches", href: "/admin/taxonomy", icon: Settings },
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "Usage Metrics", href: "/admin/analytics", icon: BarChart },
      { name: "System Logs", href: "/admin/logs", icon: History },
      { name: "Profile", href: "/admin/profile", icon: User },
    ],
  };

  const navItems = navigation[userRole] || [];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay behind sidebar on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-primary/20 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1f2937]">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-[#374151] bg-white p-0.5 shrink-0">
              <Image
                src="/De_logo.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block tracking-tight leading-tight">
                Data Engineering
              </span>
              <span className="text-[10px] text-gray-400 block font-bold tracking-widest uppercase">
                MVGR College
              </span>
            </div>
          </Link>
        </div>

        {/* Scope Pill if available */}
        {userScope && (userScope.branch || userScope.semester) && (
          <div className="px-6 py-3 bg-[#161f30] border-b border-[#1f2937]">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
              Current Scope
            </span>
            <div className="flex items-center gap-2">
              {userScope.branch && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#1e293b] text-blue-400 font-semibold border border-blue-900/50">
                  {userScope.branch}
                </span>
              )}
              {userScope.semester && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#1e293b] text-blue-400 font-semibold border border-blue-900/50">
                  Sem {userScope.semester}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${userRole}` && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#1f2937]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Signout Footer */}
        <div className="p-4 border-t border-[#1f2937]">
          <button
            onClick={() => signOutAction()}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Floating Toggle Button for Mobile Navigation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-20 right-4 z-50 p-3.5 rounded-full bg-primary text-white shadow-lg border border-border flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  );
}
