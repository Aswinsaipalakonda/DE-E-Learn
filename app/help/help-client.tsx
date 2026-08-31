"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { submitSupportTicket } from "./actions";

interface FAQItem {
  question: string;
  answer: string;
  role: "student" | "faculty" | "admin" | "general";
}

const FAQS: FAQItem[] = [
  // Student FAQs
  {
    role: "student",
    question: "How do I log in for the first time?",
    answer: "Enter your official MVGR student email (e.g. 23331a4745@mvgrce.edu.in) and your uppercase Roll Number as the initial password. You will be automatically prompted to create a secure personal password immediately.",
  },
  {
    role: "student",
    question: "How do I access materials from other semesters?",
    answer: "On your Student Dashboard, use the 'Select Semester' dropdown to switch between Semester 1 through Semester 8. You can browse, preview, and bookmark notes from any semester in your branch.",
  },
  {
    role: "student",
    question: "Can I preview lecture notes and manuals without downloading them?",
    answer: "Yes! Simply click the 'Preview' button on any material file. Our in-browser document reader opens the PDF directly without consuming your device storage.",
  },
  {
    role: "student",
    question: "How do Bookmarks work?",
    answer: "Click the bookmark icon on any course material page to save it to your private Bookmarks library. You can access all saved materials from the 'Bookmarks' tab in the navigation menu.",
  },
  // Faculty FAQs
  {
    role: "faculty",
    question: "How do I upload notes, slides, or lab manuals?",
    answer: "Navigate to 'Upload Material' in the faculty sidebar. Select the Branch, Semester, Subject, and Material Type, upload your files (PDF, PPT, DOC, ZIP up to 100MB), and choose whether to publish immediately or save as a Draft.",
  },
  {
    role: "faculty",
    question: "How does File Versioning work when updating notes?",
    answer: "In 'My Materials', click 'Replace' on any attached file. Upload the updated file, and the portal will automatically bump the version counter (e.g., v1 -> v2) while retaining historical metadata.",
  },
  {
    role: "faculty",
    question: "Can I track how many students viewed my course materials?",
    answer: "Yes, your Faculty Dashboard and My Materials tabs display real-time view counts, download statistics, and total storage utilization for all materials you have published.",
  },
  // Admin FAQs
  {
    role: "admin",
    question: "How do I bulk import a new batch of students?",
    answer: "Go to 'Student Roster' under Administration. Click 'Bulk Import (CSV)', download the template if needed, and upload your CSV. The portal will automatically validate and create authenticated student profiles.",
  },
  {
    role: "admin",
    question: "How do I broadcast an urgent announcement to students?",
    answer: "Visit 'Announcements Manager' in the Admin sidebar. Click 'Create Announcement', select the target branch or semester, mark it as 'High Priority' if needed, and choose the start and expiry dates.",
  },
  {
    role: "admin",
    question: "How do I inspect system audit logs?",
    answer: "Navigate to 'System Logs' to view immutable, append-only logs for all logins, material state changes, roster updates, and user modifications with full before/after summaries.",
  },
];

export default function HelpClient({ userEmail }: { userEmail?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoleTab, setActiveRoleTab] = useState<"all" | "student" | "faculty" | "admin">("all");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  // Ticket Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeRoleTab === "all" || faq.role === activeRoleTab;
    return matchesSearch && matchesRole;
  });

  const handleTicketSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await submitSupportTicket(formData);
      if (res.error) {
        alert(res.error);
        return;
      }
      setIsSubmitted(true);
    } catch {
      alert("Failed to submit support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/90 p-8 sm:p-12 rounded-3xl text-white border border-border shadow-xs text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xs">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Help Center & Support</h1>
        <p className="text-white/70 max-w-xl mx-auto text-sm sm:text-base font-medium leading-relaxed">
          Find quick answers to common questions about accounts, materials, uploads, and platform navigation.
        </p>

        {/* Global FAQ Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <Search className="absolute left-4 top-5 h-5 w-5 text-primary/40" />
          <input
            placeholder="Search FAQs (e.g. 'first login', 'replace file', 'CSV')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-primary text-sm font-medium focus:outline-none focus:ring-4 focus:ring-secondary/30 shadow-lg placeholder:text-primary/40"
          />
        </div>
      </section>

      {/* Role Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(
          [
            { id: "all", label: "All Questions", icon: HelpCircle },
            { id: "student", label: "For Students", icon: GraduationCap },
            { id: "faculty", label: "For Faculty", icon: BookOpen },
            { id: "admin", label: "For Admins", icon: ShieldCheck },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRoleTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRoleTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-primary/70 border border-border hover:border-primary/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-primary tracking-tight">
          Frequently Asked Questions ({filteredFAQs.length})
        </h2>
        <div className="space-y-3">
          {filteredFAQs.map((faq, idx) => {
            const isOpen = openFAQIndex === idx;
            return (
              <div
                key={idx}
                className="bg-surface rounded-2xl border border-border overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFAQIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-primary text-sm sm:text-base cursor-pointer hover:bg-bg/40 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-primary/40 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary/40 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-primary/75 leading-relaxed border-t border-border/40 bg-bg/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Form and Contact Cards Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Submission Form */}
        <div className="lg:col-span-2 bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Report an Issue or Feedback</h3>
              <p className="text-xs text-primary/60 mt-0.5">
                Our department admin team will review and respond to your inquiry promptly.
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-8 bg-success/10 border border-success/20 rounded-2xl text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
              <h4 className="font-bold text-success text-base">Request Submitted Successfully</h4>
              <p className="text-xs text-primary/70 max-w-md mx-auto">
                Thank you for reaching out. We have logged your request and the Data Engineering team will get back to you shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-4 py-2 bg-surface border border-border text-primary text-xs font-bold rounded-xl hover:bg-bg cursor-pointer"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  >
                    <option value="login_issue">Login / Password Issue</option>
                    <option value="material_access">Material Not Accessible</option>
                    <option value="upload_error">File Upload / Version Error</option>
                    <option value="missing_subject">Missing Subject or Branch</option>
                    <option value="other">General Feedback / Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                    Your Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={userEmail || ""}
                    placeholder="e.g. 23331a4745@mvgrce.edu.in"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Brief summary of the issue..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what happened, including subject code, error message, or semester details..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary text-primary font-medium resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Department Contact Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">Department Contact</h3>
            <p className="text-xs text-primary/60 leading-relaxed">
              For urgent administrative queries or student roster updates, contact the Data Engineering department coordinator directly.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-bg/50 rounded-xl border border-border text-xs">
                <Mail className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary block">Official Email</span>
                  <span className="text-primary/70">de.dept@mvgrce.edu.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-bg/50 rounded-xl border border-border text-xs">
                <Phone className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary block">Department Office</span>
                  <span className="text-primary/70">+91 8922 241039</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50 block">Campus Hours</span>
            <span className="text-xs font-extrabold text-primary block">Mon – Sat: 8:45 AM – 4:30 PM</span>
          </div>
        </div>
      </section>
    </div>
  );
}
