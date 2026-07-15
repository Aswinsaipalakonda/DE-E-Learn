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
  Settings,
  LogOut,
  User
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
      { name: "Courses", href: "/admin/taxonomy", icon: Settings },
      { name: "Profile", href: "/admin/profile", icon: User },
    ],
  };

  const navItems = navigation[userRole] || [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface border-t border-border flex justify-around items-center px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all ${
              isActive ? "text-secondary" : "text-primary/50 hover:text-primary"
            }`}
          >
            <Icon className={`h-5 w-5 mb-0.5 ${isActive ? "text-secondary" : "text-primary/50"}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
      
      {/* Quick Sign Out Action */}
      <button
        onClick={() => signOutAction()}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold text-danger/70 hover:text-danger cursor-pointer transition-all"
      >
        <LogOut className="h-5 w-5 mb-0.5 text-danger/60" />
        <span>Sign Out</span>
      </button>
    </nav>
  );
}
