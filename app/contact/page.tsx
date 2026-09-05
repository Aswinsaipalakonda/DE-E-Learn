"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { LandingHeader } from "@/components/landing-hero";
import { LandingFooter } from "@/components/landing-footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans antialiased">
      <LandingHeader />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Academic Support &amp; Grievance Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Contact DataDock Support
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Have questions regarding syllabus updates, missing course notes, or portal access? Reach out to the Department of Data Engineering coordinators or submit a support inquiry.
          </p>
        </div>

        {/* 2-Column Grid: Info & Interactive Form */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Department Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src="/De_logo.jpg"
                    alt="MVGR DE Logo"
                    width={40}
                    height={40}
                    className="rounded-xl object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    Department of Data Engineering
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    MVGR College of Engineering (Autonomous)
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Campus Address:</strong>
                    <span>Chintalavalasa, Vizianagaram, Andhra Pradesh - 535005, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Department Email:</strong>
                    <a href="mailto:de.elearn@mvgrce.edu.in" className="hover:text-blue-600 underline">
                      de.elearn@mvgrce.edu.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Academic Cell Phone:</strong>
                    <span>+91 8922 241039 / 241199</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Academic Helpdesk Hours
                </p>
                <p className="text-xs text-slate-600">
                  Monday to Saturday: 9:00 AM – 4:30 PM (IST)
                </p>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-blue-900 text-white p-6 rounded-3xl space-y-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Fast Access</span>
              <h4 className="text-base font-bold">Looking for direct study notes?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to your student vault to access all uploaded unit PPTs, question banks, and lab manuals.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>

          </div>

          {/* Right: Interactive Support Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Inquiry Submitted Successfully</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-900">{formData.name}</strong>. Your message has been routed to the Data Engineering academic coordinators. We will reply to <strong className="text-slate-900">{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", role: "Student", subject: "", message: "" });
                  }}
                  className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Send a Message
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in your details below and our team will get back to you within 24–48 working hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. 21331A4201@mvgrce.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">I am a *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                    >
                      <option value="Student">Student (CIC / CSD / CSM)</option>
                      <option value="Faculty">Faculty Member</option>
                      <option value="Alumni">Alumni / Visitor</option>
                      <option value="Other">Other Institutional Staff</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Inquiry Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Sem 5 Question Paper Request"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Message / Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your query or request with subject code/unit specifics..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Academic Inquiry
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
