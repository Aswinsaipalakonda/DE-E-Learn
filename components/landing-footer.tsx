import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, GraduationCap, BookOpen, ShieldCheck, ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/90 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1 & 2: Institutional Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <Image 
                  src="/De_logo.jpg" 
                  alt="Department Logo" 
                  width={42} 
                  height={42} 
                  className="object-contain w-full h-full rounded-xl"
                />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
                  Department of Data Engineering
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  MVGR College of Engineering (Autonomous)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-sm">
              The official centralized academic learning and verified materials repository for Cyber Security &amp; IoT (CIC), Data Science (CSD), and AI &amp; Machine Learning (CSM).
            </p>

            {/* Accreditation Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                UGC Autonomous
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                NAAC &apos;A&apos; Grade
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                NBA Accredited
              </span>
            </div>
          </div>

          {/* Column 3: Academic Specializations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Specializations
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <a href="#specializations" className="hover:text-blue-600 transition-colors">
                  Cyber Security &amp; IoT (CIC)
                </a>
              </li>
              <li>
                <a href="#specializations" className="hover:text-blue-600 transition-colors">
                  Data Science (CSD)
                </a>
              </li>
              <li>
                <a href="#specializations" className="hover:text-blue-600 transition-colors">
                  AI &amp; Machine Learning (CSM)
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-600 transition-colors">
                  Autonomous Syllabi Sem 1–8
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Portals & Workspaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  Student Portal <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  Faculty Workspace <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  Admin Console <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors">
                  Personal Study Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Institutional Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Institution
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <a 
                  href="https://www.mvgrce.edu.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  MVGR Official Site <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-600 transition-colors">
                  Help &amp; FAQ
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-600 transition-colors">
                  Department Standards
                </a>
              </li>
              <li>
                <span className="text-slate-400">Vizianagaram, AP, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">All Academic Cloud Systems Operational</span>
          </div>

          <div className="font-normal">
            © {new Date().getFullYear()} MVGR College of Engineering. Department of Data Engineering. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}

export default LandingFooter;
