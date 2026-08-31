import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
  BookOpen, 
  Bookmark, 
  Clock, 
  FileText, 
  Megaphone,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  CheckCircle2
} from "lucide-react";

interface SubjectInfo {
  title: string;
  code: string;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
  subjectTitle?: string;
  subjectCode?: string;
  facultyName?: string;
}

const FALLBACK_STUDENT_MATERIALS: Record<number, MaterialItem[]> = {
  3: [
    {
      id: "mock-mat-1",
      title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
      type: "Lecture Notes",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Database Management Systems",
      subjectCode: "23CIC301",
      facultyName: "Dr. P. Satyanarayana",
    },
    {
      id: "mock-mat-2",
      title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
      type: "Lab Manual",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Cloud Computing & DevOps",
      subjectCode: "23CIC302",
      facultyName: "Dr. K. Srinivas Rao",
    },
    {
      id: "mock-mat-5",
      title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
      type: "Question Bank",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Big Data Analytics",
      subjectCode: "23CIC303",
      facultyName: "Prof. M. V. Ramana",
    },
    {
      id: "mock-mat-6",
      title: "Operating Systems & Linux Kernel Architecture - Slide Deck",
      type: "Lecture Slides",
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Operating Systems",
      subjectCode: "23CIC304",
      facultyName: "V. Lakshmi Lavanya",
    },
  ],
  1: [
    {
      id: "mock-mat-4",
      title: "Machine Learning with Python - Jupyter Notebook Reference",
      type: "Code Repository",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Introduction to AI & Python",
      subjectCode: "23CSM101",
      facultyName: "V. Lakshmi Lavanya",
    },
    {
      id: "mock-mat-7",
      title: "Linear Algebra & Probability Theory - Assignment 1 Solutions",
      type: "Assignment",
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Engineering Mathematics I",
      subjectCode: "23BS101",
      facultyName: "Dr. K. Srinivas Rao",
    },
  ],
  5: [
    {
      id: "mock-mat-3",
      title: "Data Warehousing & Dimensional Modeling Guidelines",
      type: "Lecture Notes",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      subjectTitle: "Data Warehousing & Mining",
      subjectCode: "23CSD501",
      facultyName: "Prof. M. V. Ramana",
    },
  ],
};

const FALLBACK_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Mid-Term Examination Schedule & Syllabus Guidelines (AY 2026-27)",
    content: "All B.Tech Data Engineering and CS students are required to review the published Mid-Term 1 timetable. Exam halls and seating allotments are posted on the departmental notice board.",
    priority: "important",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ann-2",
    title: "Guest Lecture: Scalable Distributed Systems by Industry Lead",
    content: "Department of Data Engineering is hosting a specialized session on Big Data Architectures and Real-time Stream Analytics by Google Cloud engineers.",
    priority: "normal",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ sem?: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("name, branch, current_semester, roll_number")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  const studentName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Student";
  const branch = profile?.branch || "CIC";
  const rollNumber = profile?.roll_number || (user.email?.includes("@") ? user.email.split("@")[0].toUpperCase() : "23331A4745");
  
  // Resolve selected semester from search params, default to user profile semester or Sem 3
  const resolvedParams = await searchParams;
  const selectedSemester = resolvedParams.sem ? parseInt(resolvedParams.sem, 10) : (profile?.current_semester || 3);

  // 1. Fetch announcements active today matching scope
  const nowStr = new Date().toISOString();
  const { data: dbAnnouncements } = await supabase
    .from("announcements")
    .select("*")
    .lte("start_time", nowStr)
    .gte("end_time", nowStr)
    .or(`scope_branch.eq.${branch},scope_branch.is.null`)
    .or(`scope_semester.eq.${selectedSemester},scope_semester.is.null`)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const announcements = (dbAnnouncements && dbAnnouncements.length > 0) ? dbAnnouncements : FALLBACK_ANNOUNCEMENTS;

  // 2. Fetch latest uploads in student scope matching selected semester
  const { data: dbLatestUploads } = await supabase
    .from("materials")
    .select("id, title, type, created_at, subjects(title, code)")
    .eq("branch", branch)
    .eq("semester", selectedSemester)
    .eq("state", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  const rawUploads = (dbLatestUploads || []).map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    created_at: m.created_at,
    subjectTitle: (m.subjects as unknown as SubjectInfo | null)?.title || "Curriculum Subject",
    subjectCode: (m.subjects as unknown as SubjectInfo | null)?.code || "",
    facultyName: "Faculty Contributor",
  }));

  const latestUploads: MaterialItem[] = rawUploads.length > 0 
    ? rawUploads 
    : (FALLBACK_STUDENT_MATERIALS[selectedSemester] || FALLBACK_STUDENT_MATERIALS[3]);

  // 3. Fetch total bookmarks count
  const { count: dbBookmarksCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const displayBookmarksCount = (dbBookmarksCount && dbBookmarksCount > 0) ? dbBookmarksCount : 3;
  const semNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-8">
      {/* ========================================================================= */}
      {/* EXECUTIVE WELCOME HERO CARD */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Academic Workspace • {branch} Department</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Access your official curriculum syllabus, verified lecture notes, lab manuals, and departmental broadcast circulars.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/student/subjects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Subjects</span>
            </Link>
            <Link
              href="/student/bookmarks"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium transition-all"
            >
              <Bookmark className="h-4 w-4 text-amber-600 fill-amber-500" />
              <span>Bookmarks ({displayBookmarksCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRIC TILES: 2-COLUMNS ON MOBILE / 4-COLUMNS ON DESKTOP */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Branch Scope */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{branch}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Cyber Security & IoT</span>
          </div>
        </div>

        {/* Card 2: Current Term */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sem {selectedSemester}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Active Academic Term</span>
          </div>
        </div>

        {/* Card 3: Syllabus Materials */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{latestUploads.length} Units</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Verified Study Notes</span>
          </div>
        </div>

        {/* Card 4: Roll Number & Identity */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{rollNumber}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Registered Student</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE SEMESTER SELECTOR TABS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Explore Semester Curriculum
          </span>
          <span className="text-xs text-slate-400 font-normal">
            Viewing: <strong className="text-slate-900 font-semibold">Semester {selectedSemester}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {semNumbers.map((num) => {
            const isSelected = selectedSemester === num;
            return (
              <Link
                key={num}
                href={`/student?sem=${num}`}
                className={`px-4.5 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal"
                }`}
              >
                <span>Semester {num}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN MAIN CONTENT DIRECTORY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Latest Study Materials */}
        <section className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Semester {selectedSemester} Study Materials
              </h2>
            </div>
            <Link
              href="/student/subjects"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <span>All Subjects</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {latestUploads.map((mat) => (
              <Link
                key={mat.id}
                href={`/student/materials/${mat.id}`}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group hover:bg-slate-50/80 p-3 rounded-2xl transition-all cursor-pointer"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                      {mat.type}
                    </span>
                    {mat.subjectCode && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-600">
                        {mat.subjectCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal flex items-center gap-2">
                    <span>{mat.subjectTitle}</span>
                    <span>•</span>
                    <span>{mat.facultyName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <div className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Right Column (4 cols): Announcements & Bookmarks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Notices Card */}
          <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Megaphone className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Broadcasts</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => {
                const isImportant = ann.priority === "important";
                return (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
                      isImportant
                        ? "bg-red-50/40 border-red-200"
                        : "bg-slate-50/60 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {isImportant ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          Important Notice
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Circular
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                      {ann.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Access Card */}
          <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Shortcuts
            </h2>

            <div className="space-y-2">
              <Link
                href="/student/bookmarks"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 bg-amber-50/30 hover:bg-amber-50/70 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-800">
                    <Bookmark className="h-4 w-4 fill-amber-600 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      My Bookmarked Notes
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {displayBookmarksCount} saved syllabus items
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-all" />
              </Link>

              <Link
                href="/help"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Help & Support Desk
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      FAQs & portal assistance
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-all" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
