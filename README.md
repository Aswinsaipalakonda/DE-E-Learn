# MVGR Data Engineering E-Learning Portal (DE E-Learn)

Welcome to the **MVGR Data Engineering E-Learning Portal** (`MVGR DE E-learn`), a premium academic resource repository designed specifically for students and faculty of the Data Engineering department at **MVGR College of Engineering**.

**Live Production URL:** [https://de-mvgrce.vercel.app/](https://de-mvgrce.vercel.app/)

---

## 🔍 SEO & Search Optimization Keywords
To maintain a high search ranking and assist MVGR students in finding course materials quickly, this repository is optimized for:
*   `MVGR` / `MVGR College of Engineering`
*   `MVGR DE E-learn` / `MVGR Data Engineering E-Learn`
*   `MVGR Data Engineering` / `Data Engineering MVGR`
*   `MVGR Data Science` / `MVGR Cyber Security` / `MVGR AI ML`
*   `Data Engineering syllabus notes` / `MVGR lab manuals`

---

## 🚀 Key Portal Features

### 👨‍🎓 For Students
1.  **Direct Portal Access:** Sign in instantly using your college email and roll number.
2.  **Auto-Filtering Semester Selector:** Easily switch semesters (Semester 1 to Semester 8) via a dropdown selector to display corresponding notes and manuals.
3.  **Bookmarking System:** Save files to your private bookmarks page for offline learning.
4.  **Case-Insensitive Passwords:** Login supports both uppercase and lowercase student roll numbers.

### 👩‍🏫 For Faculty
1.  **Resource Uploader:** Upload and publish PDFs/docs categorized by Branch, Semester, and Subject.
2.  **Engagement Tracking:** Monitor which resources have been viewed or downloaded.
3.  **Branch Specializations:**
    *   `CIC`: *Cyber Security, IoT with BlockChain Technology*
    *   `CSD`: *Data Science*
    *   `CSM`: *Artificial Intelligence and Machine Learning*

### 🛠️ For Administrators
1.  **Usage Metrics & Analytics Dashboard:** View overall downloads and student view metrics.
2.  **Student & Faculty Roster Manager:** Single and bulk-CSV user account generation.
3.  **Courses & Branches Manager:** Create subjects, courses, and branches.

---

## 🔑 Default Credentials & Portal URLs
Users can log in directly at [https://de-mvgrce.vercel.app/login](https://de-mvgrce.vercel.app/login):

*   **Administrator Account:**
    *   **Email:** `admin@mvgrce.edu.in`
    *   **Password:** `AdminPassword123!`
*   **Faculty Account:**
    *   **Email:** `faculty@mvgrce.edu.in`
    *   **Password:** `ChangeMe1234!`
*   **Student Account:**
    *   **Email:** `23331a4745@mvgrce.edu.in` (example roll number)
    *   **Password:** `23331A4745` (roll number is case-insensitive)

---

## 💻 Local Development Setup

First, initialize the local environment configuration in `.env.local` containing your Supabase project keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the local server.
