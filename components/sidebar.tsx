"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Bookmark, 
  LayoutDashboard, 
  LogOut, 
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

  return (
    <aside
      className="hidden lg:flex fixed top-0 bottom-0 left-0 z-45 w-64 bg-[#111827] border-r border-[#1f2937] flex-col"
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
            <span className="font-extrabold text-white text-base tracking-tight block">
              Data Engineering
            </span>
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-widest">
              MVGR COLLEGE
            </span>
          </div>
        </Link>
      </div>

      {/* User Scope Badge Panel */}
      {userScope && (userScope.branch || userScope.semester) && (
        <div className="px-6 py-4 border-b border-[#1f2937] bg-[#1f2937]/30">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Current Scope</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {userScope.branch && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1f2937] text-gray-300 border border-[#374151]">
                  {userScope.branch}
                </span>
              )}
              {userScope.semester && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Sem {userScope.semester}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === `/${userRole}`
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-5 py-3 rounded-full text-sm transition-all duration-200 group ${
                isActive 
                  ? "bg-[#f3f4f6] text-[#111827] shadow-sm font-semibold" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors duration-200 ${isActive ? "text-[#111827]" : "text-gray-400 group-hover:text-white"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Signout Footer */}
      <div className="p-4 border-t border-[#1f2937]">
        <button
          onClick={() => signOutAction()}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
