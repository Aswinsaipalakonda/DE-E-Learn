"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Bookmark, 
  Upload, 
  FileText, 
  Users, 
  User, 
  Megaphone 
} from "lucide-react";

interface BottomNavProps {
  userRole: "student" | "faculty" | "admin";
  signOutAction: () => Promise<void>;
}

export default function BottomNav({ userRole, signOutAction }: BottomNavProps) {
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
      { name: "Upload", href: "/faculty/upload", icon: Upload },
      { name: "Materials", href: "/faculty/materials", icon: FileText },
      { name: "Profile", href: "/faculty/profile", icon: User },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Broadcast", href: "/admin/announcements", icon: Megaphone },
      { name: "Profile", href: "/admin/profile", icon: User },
    ],
  };

  const navItems = navigation[userRole] || [];

  return (
    <nav className="lg:hidden fixed bottom-3 sm:bottom-4 left-3 right-3 z-50 max-w-sm sm:max-w-md mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-1.5 flex items-center justify-between gap-1">
      {navItems.map((item) => {
        const isRootRole = item.href === `/${userRole}`;
        const isActive = isRootRole 
          ? pathname === item.href 
          : pathname === item.href || pathname.startsWith(item.href + "/");

        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              isActive 
                ? "bg-primary text-white shadow-xs" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 mb-0.5 shrink-0 transition-all ${
              isActive ? "text-white stroke-[2.2px]" : "text-slate-400 stroke-[1.8px]"
            }`} />
            <span className={`text-[10px] sm:text-[11px] leading-tight truncate ${
              isActive ? "font-bold text-white" : "font-medium text-slate-500"
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
