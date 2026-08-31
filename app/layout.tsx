import type { Metadata } from "next";
import "./globals.css";

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
      className="h-full antialiased font-sans"
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}


