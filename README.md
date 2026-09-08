# MVGR Data Engineering E-Learning Portal (DE E-Learn)

Welcome to the **MVGR Data Engineering E-Learning Portal** (`MVGR DE E-learn`), a high-performance academic resource distribution and syllabus management system built for the students, faculty, and administration of the **Department of Data Engineering** at **MVGR College of Engineering (Autonomous)**.

---

## 🏛️ System Overview & Architecture

DE E-Learn is engineered to streamline curriculum material delivery, enforce strict academic regulation isolation, provide engagement telemetry, and secure exam integrity across autonomous cohorts.

```
┌─────────────────────────────────────────────────────────────┐
│                    MVGR DE E-Learn Platform                 │
├─────────────────┬───────────────────────────┬───────────────┤
│  Student Portal │       Faculty Portal      │  Admin Suite  │
│  - Syllabus Hub │  - Resource Distribution  │  - Governance │
│  - Dynamic View │  - Engagement Telemetry   │  - Roster CSV │
│  - Bookmarks    │  - Material Lifecycle     │  - Lockouts   │
└─────────────────┴───────────────────────────┴───────────────┘
                                │
               Supabase PostgreSQL & Storage Engine
```

---

## 🚀 Key Modules & Capabilities

### 👨‍🎓 1. Student Academic Hub
* **Curriculum Exploration:** Filter notes, lecture presentations, lab manuals, and question banks by Autonomous Regulation (`R23`), Department Branch (`CIC`, `CSD`, `CSM`), and Semester (`Sem 1` – `Sem 8`).
* **Personalized Bookmarking:** Save materials to a private, persistent library for quick revision.
* **Integrated Inquiries:** Submit academic inquiries directly to course coordinators and faculty.
* **Exam Lockout Compliance:** Automated UI lockdown during scheduled examination windows to prevent unauthorized material access.

### 👩‍🏫 2. Faculty Distribution & Analytics
* **Course Material Publisher:** Multi-file drag-and-drop uploader supporting PDF, Word, PowerPoint, and lab archives with version tracking.
* **Real-time Engagement Metrics:** Real-time dashboards monitoring total published files, unique student readers, download counts, and active subject portfolios.
* **Cohort Isolation:** Direct material publishing scoped to specific branches or cross-listed cohorts.
* **Broadcast Circulars:** Post targeted departmental announcements and notice board updates.

### 🛠️ 3. Administrative Governance Suite
* **Student Roster & Cohort Management:** Single student enrollment with 10-digit roll number validation, auto-generated institutional emails, and bulk CSV roster imports.
* **Batch Cohort Promotion:** Advance an entire semester cohort to the next curriculum term with a single administrative action.
* **Academic Taxonomy Manager:** Dynamic CRUD operations for Autonomous Regulations, Department Branches, and Semester Timelines.
* **Examination Lockout Scheduler:** Schedule timed material lockouts for specific branches, semesters, and subject codes.
* **Security & Immutable Audit Logs:** Append-only logging tracking user lifecycle, password resets, and curriculum adjustments.

---

## 🏢 Departmental Specializations Supported

* **CIC:** *Computer Science and Information Technology*
* **CSD:** *Computer Science and Design*
* **CSM:** *Artificial Intelligence and Machine Learning*

---

## 🔐 Role-Based Access Control (RBAC)

The platform enforces strict role-based access:
* **Administrators:** Full system governance, taxonomy, roster imports, and exam schedules.
* **Faculty Members:** Publishing materials, viewing engagement metrics, and posting announcements.
* **Students:** Accessing enrolled semester materials, bookmarking documents, and submitting inquiries.

> [!NOTE]
> For authenticated credentials and setup procedures, authorized staff should consult the internal `creds.md` documentation.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router & Server Actions)
* **Language:** TypeScript 5.x
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security & GoTrue)
* **Storage:** Supabase Storage Bucket (`materials`)
* **Styling:** Tailwind CSS with custom design tokens
* **Icons:** Lucide React

---

## 💻 Local Development Setup

### 1. Prerequisites
* Node.js 18+ or 20+
* npm or pnpm
* Supabase Project

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Validate Production Build
```bash
npm run build
```

---

## 📄 License & Institutional Rights

Developed for the **Department of Data Engineering**, **MVGR College of Engineering (Autonomous)**, Vizianagaram, Andhra Pradesh, India.
