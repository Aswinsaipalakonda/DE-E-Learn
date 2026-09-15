# MVGR Data Engineering E-Learning Portal (DE E-Learn)

Welcome to the **MVGR Data Engineering E-Learning Portal** (`MVGR DE E-learn`), a production-grade academic resource distribution, curriculum management, and analytics system built for the students, faculty, and administration of the **Department of Data Engineering** at **MVGR College of Engineering (Autonomous)**.

---

## 🏛️ System Architecture

DE E-Learn is built on a decoupled, self-hosted modern architecture designed for maximum performance, data privacy, and unlimited file storage capacity without cloud vendor lock-in.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MVGR DE E-Learn Platform                          │
├────────────────────┬───────────────────────────────┬────────────────────┤
│   Student Portal   │         Faculty Portal        │    Admin Suite     │
│  - Syllabus Hub    │  - Multi-File Distribution    │  - Governance      │
│  - In-Browser View │  - Engagement Analytics       │  - Roster CSV      │
│  - Bookmarks & DL  │  - Material Lifecycle (Draft) │  - Exam Lockouts   │
└────────────────────┴───────────────┬───────────────┴────────────────────┘
                                     │
                        Node.js & Express REST API
                      (Authentication, RBAC, Multer)
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
       MySQL Database                              Disk Storage Engine
    (XAMPP / Hostinger)                        (server/uploads/materials/)
```

---

## 🚀 Key Modules & Capabilities

### 👨‍🎓 1. Student Academic Hub
* **Curriculum Exploration:** Filter lecture notes, presentations, lab manuals, question banks, and reference materials by Autonomous Regulation (`R23`, `R20`, `R19`, `A2`), Department Branch (`CIC`, `CSD`, `CSM`), and Semester (`Sem 1` – `Sem 8`).
* **In-Browser Document Preview & Download:** High-speed streaming downloads and preview modal for PDF, Word, PowerPoint, and lab files.
* **Personalized Bookmarking:** Save materials to a private, persistent library for rapid exam revision.
* **Support Inquiries:** Submit academic queries directly to department coordinators.
* **Exam Lockout Compliance:** Automated UI lockdown during scheduled examination windows to prevent unauthorized material access.

### 👩‍🏫 2. Faculty Distribution & Analytics
* **Course Material Publisher:** Multi-file drag-and-drop uploader supporting PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), and TXT files up to 100 MB per file.
* **State Management:** Publish immediately or save drafts for later review and scheduling.
* **Engagement Telemetry:** Dashboards monitoring total published resources, download counts, and unique student readers.
* **Cohort Isolation:** Direct material publishing scoped to specific branches or cross-listed cohorts.
* **Broadcast Circulars:** Post targeted departmental announcements and notice board updates.

### 🛠️ 3. Administrative Governance Suite
* **Student Roster & Cohort Management:** Single student enrollment with 10-digit roll number validation, auto-generated institutional emails, and bulk CSV roster imports.
* **Academic Taxonomy Manager:** Dynamic CRUD operations for Autonomous Regulations, Department Branches, Semesters, and Subjects.
* **Examination Lockout Scheduler:** Schedule timed material lockouts for specific branches, semesters, and subject codes.
* **Security & Immutable Audit Logs:** Append-only logging tracking user lifecycle, authentication events, password resets, and curriculum adjustments.

---

## 🏢 Departmental Specializations Supported

* **CIC:** *Cyber Security, IoT with BlockChain Technology*
* **CSD:** *Data Science*
* **CSM:** *Artificial Intelligence and Machine Learning*

---

## 🔐 Role-Based Access Control (RBAC)

The platform enforces strict role-based access:
* **Administrators:** Full system governance, taxonomy, roster imports, system logs, and exam schedules.
* **Faculty Members:** Publishing materials, viewing engagement telemetry, and posting announcements.
* **Students:** Accessing enrolled semester materials, bookmarking documents, and submitting inquiries.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (React 19, App Router, Server Actions)
* **Backend:** Node.js & Express 5 (REST API, layered architecture)
* **Database:** MySQL 8.x / MariaDB (managed via connection pooling with `mysql2/promise`)
* **Storage Engine:** Local / Hostinger Disk Storage via `multer` (bypassing 500MB cloud limits)
* **Authentication:** Stateless JWT (`jsonwebtoken`) with salted bcrypt hashes (`bcryptjs`) & HTTP-only cookies
* **Styling & UI:** Tailwind CSS v4, Lucide React icons, and custom design tokens

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** (v20.x or higher) and **npm**
* **XAMPP** (or MySQL server running locally on port `3306`)

### 2. Configure Environment Variables
Verify or create `.env.local` in the project root:

```env
# Local MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=de_elearn

# Express Server Port
PORT=5000

# Security & JWT Token Secret
JWT_SECRET=de-elearn-mvgrce-super-secure-jwt-secret-key-2026
JWT_EXPIRES_IN=7d

# API Endpoint URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Initialize & Seed MySQL Database
Make sure Apache & MySQL are running in your **XAMPP Control Panel**, then run:

```bash
npm run db:init
```
*This automatically connects to MySQL, creates the database `de_elearn`, executes `schema.sql`, and seeds initial branches, semesters, regulations, subjects, all 33 faculty members, and test accounts.*

### 4. Start the Application
Run both the Express API backend and Next.js frontend concurrently:

```bash
npm run dev:all
```

Or run them individually:
* **Terminal 1 (Express API)**: `npm run server` (runs at `http://localhost:5000`)
* **Terminal 2 (Next.js Frontend)**: `npm run dev` (runs at `http://localhost:3000`)

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Default Seed Credentials & Academic Dataset

The platform is pre-loaded with official institutional data from `R23_Regulation Details.xlsx`:
* **Curriculum**: **213 R23 Autonomous Regulation Subjects** across Semesters 1 to 8 for branches `CSM`, `CSD`, and `CIC`.
* **Faculty Staff**: **33 Department Faculty Members** with designations, branches, and contact numbers.
* **Student Roster**: **70 CSM Section A Students** (64 Regular 4-year B.Tech + 6 Lateral Entry Diploma students).

| Role | Name / Group | Login Email | Password | Scope & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | System Administrator | `admin@mvgrce.edu.in` | `AdminPassword@123!` | Full governance, roster management, taxonomy, exam schedules (`/admin`). |
| **Faculty #1** | Dr. G. Satyanarayana Reddy | `satyanarayanareddy@mvgrce.edu.in` | `MVGRDE@5686` | Associate Professor (`/faculty`). Rule: `MVGRDE@<last-4-digits-of-mobile>`. |
| **Faculty #7** | Dr. V. Jyothi (HOD) | `jyothi@mvgrce.edu.in` | `MVGRDE@2756` | HOD & Associate Professor (`/faculty`). |
| **Faculty (All 33)** | *Department Faculty Staff* | *`<name>@mvgrce.edu.in`* | `MVGRDE@<last4>` | All 33 official faculty accounts are active. |
| **Regular Student** | Adhya Naidu Chokkakula | `23331a4201@mvgrce.edu.in` | `23331A4201` | 2023 Regular B.Tech CSM Sem 1 Sec A. Password is uppercase roll number. |
| **Regular Student** | Sanjay Yandava | `23331a4266@mvgrce.edu.in` | `23331A4266` | 2023 Regular B.Tech CSM Sem 1 Sec A. Password is uppercase roll number. |
| **Lateral Student** | Darapu Varshini | `24335a4201@mvgrce.edu.in` | `24335A4201` | Lateral Entry Diploma student. Password is uppercase roll number (`24335A4201`). |
| **Lateral Student** | Chukkala Yaswanth Sai | `24335a4206@mvgrce.edu.in` | `24335A4206` | Lateral Entry Diploma student. Password is uppercase roll number (`24335A4206`). |

> **Student Login Rule**: Every student account has an institutional email `<roll_number_lower>@mvgrce.edu.in` and their default password is their **exact uppercase roll number** (e.g. `23331A4201` or `24335A4201`). Lateral entry students completed Diploma and study the B.Tech curriculum together with the class.

---

### 📊 Ingesting & Re-importing Excel Spreadsheets

To re-ingest or update data directly from `R23_Regulation Details.xlsx`:
```bash
node server/database/import-excel-data.js
```
This script strictly validates each row and column:
1. **Curriculum Sheet (`Regulation(R23)`)**: Maps `ICB` -> `CIC`, converts Roman numeral semesters (`I`–`VIII`) to integers (`1`–`8`), disambiguates duplicate codes in Sem 8, and upserts 213 subjects.
2. **Student Cohort Sheet (`Sheet2`)**: Validates roll number structure, assigns college emails, computes bcrypt hashes for roll numbers, and provisions all regular and lateral entry students.

---

## 🌐 Production Deployment (Hostinger)

For complete, step-by-step instructions on deploying the Node.js/Express backend, MySQL database, and Next.js frontend to **Hostinger Web Hosting (cPanel / hPanel)**, see the dedicated deployment guide:

📖 **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)**

---

## 🧪 Testing & Verification

Run the automated integration test suite to verify the database connection, authentication, file storage, and analytics:

```bash
node server/test-integration.js
```

Validate production bundle compilation:
```bash
npm run build
```

---

## 📄 Institutional Rights

Developed for the **Department of Data Engineering**, **MVGR College of Engineering (Autonomous)**, Vizianagaram, Andhra Pradesh, India.
