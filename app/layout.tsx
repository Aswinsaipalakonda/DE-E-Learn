import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MVGR Data Engineering E-Learning Portal",
    template: "%s | MVGR Data Engineering"
  },
  description: "Curated learning repository for MVGR College of Engineering. Access lecture notes, lab manuals, assignments, syllabus details, and study documents for the Data Engineering department.",
  keywords: [
    "MVGR",
    "MVGR College of Engineering",
    "MVGR DE E-learn",
    "MVGR Data Engineering",
    "Data Engineering",
    "E-Learning",
    "MVGR Data Engineering E-Learn",
    "MVGR CE",
    "Data Engineering Materials",
    "Lecture Notes",
    "Lab Manuals",
    "Syllabus"
  ],
  metadataBase: new URL("https://de-mvgrce.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MVGR Data Engineering E-Learning Portal | DE E-Learn",
    description: "Access curated study materials and syllabus resources for the Data Engineering department at MVGR College of Engineering.",
    url: "https://de-mvgrce.vercel.app/",
    siteName: "MVGR Data Engineering E-Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MVGR Data Engineering E-Learning Portal",
    description: "Access curated study materials and syllabus resources for the Data Engineering department at MVGR College of Engineering.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
