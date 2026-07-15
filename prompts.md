# Antigravity Prompts for Data Engineering E-Learning Portal

This file contains structured implementation prompts designed for the **Antigravity** coding assistant to build the **Data Engineering E-Learning Portal** step-by-step. Each prompt is aligned with the PRD specifications, visual design system, and technical guidelines.

---

## 🧭 Prompt Sequence

1. [Prompt 1: Database Schema & Supabase Setup](#prompt-1-database-schema--supabase-setup)
2. [Prompt 2: Authentication & First-Login Password Reset Flow](#prompt-2-authentication--first-login-password-reset-flow)
3. [Prompt 3: Core UI Foundations & Design System Layouts](#prompt-3-core-ui-foundations--design-system-layouts)
4. [Prompt 4: Student Experience (Dashboard & Browsing Portal)](#prompt-4-student-experience-dashboard--browsing-portal)
5. [Prompt 5: Faculty Experience (Upload Flow & Analytics Dashboard)](#prompt-5-faculty-experience-upload-flow--analytics-dashboard)
6. [Prompt 6: Admin Experience (User Roster, Taxonomy, & Storage Quotas)](#prompt-6-admin-experience-user-roster-taxonomy--storage-quotas)
7. [Prompt 7: Global Search, Audit Logs, & Notifications](#prompt-7-global-search-audit-logs--notifications)

---

### Prompt 1: Database Schema & Supabase Setup

```markdown
Role: Database Engineer & Supabase Architect
Goal: Design and apply the Postgres database schema, row-level security (RLS) policies, and storage buckets on Supabase for the Data Engineering E-Learning Portal.

Reference the following entity specifications from the PRD:
- User (role: admin/faculty/student, email, name, status, branch, academicYear, currentSemester)
- Branch (code: CIC/CSD/CSM, name, active)
- Semester (number: 1-8, name, active)
- Subject (code, title, branch, semester, active)
- Material (title, description, subject, branch, semester, type, state: draft/published/archived/deleted, owner, tags)
- MaterialFile (fileName, mimeType, size, version, storageRef)
- Bookmark (user, material, createdAt)
- ActivityEvent (type: view/download, actor, target, metadata)
- AuditLog (action, actor, object, before/after summary)
- Announcement (title, content, scope: branch/semester/all, start/end, priority)
- Notification (user, type, payload, readAt)

Instructions:
1. Write a clean SQL schema using PostgreSQL standards.
2. Implement relational integrity (foreign keys, cascading rules, unique constraints).
3. Enable Row-Level Security (RLS) on all tables:
   - Students can only SELECT materials and files where branch and semester match their profile, and the state is 'published'.
   - Faculty can INSERT/UPDATE/DELETE/SELECT materials and files within their assigned subjects and branches.
   - Admins have full access to all tables.
4. Set up the `materials` storage bucket in Supabase with RLS policies restricting file downloads to authenticated students within their academic scope.
5. Create a trigger or function to sync authenticated users from Supabase Auth (`auth.users`) to our public `users` table.
6. Provide the complete migration script. Ensure there is no placeholder SQL.
```

---

### Prompt 2: Authentication & First-Login Password Reset Flow

```markdown
Role: Frontend & Authentication Developer
Goal: Implement the secure authentication and password reset flow using Next.js (app router), Supabase Auth, and Tailwind CSS.

Specific Requirements:
1. Faculty login: Secure credential flow using college email.
2. Student login:
   - Identifier: College Email (e.g., 23331a4745@mvgrce.edu.in).
   - Initial temporary password: Case-insensitive Registration Number (e.g., 23331A4745).
   - Validation during initial login: Convert input password and registration number to uppercase/lowercase to ensure case-insensitivity on the first attempt only.
3. First-login flow:
   - Intercept session post-auth if `first_login_pending` flag is true in the user profile.
   - Redirect to a forced "Change Password" screen immediately. Block dashboard access.
   - Enforce password strength: minimum length, complexity, and disallow reusing the registration number.
   - Update user profile status, flag `first_login_pending` to false, and redirect to the dashboard.
4. Support standard error handling, loading states, and clean design using Geist font.
```

---

### Prompt 3: Core UI Foundations & Design System Layouts

```markdown
Role: UI/UX Engineer
Goal: Build the base design tokens, globals.css, theme configuration, and layouts for the portal.

Design Tokens & Brand Colors:
- `--primary`: Deep Navy Blue (`#0B1F3B`)
- `--secondary`: Sky Blue (`#2F80ED`)
- `--accent`: Pink (`#E84D8A`)
- `--supporting`: Cyan (`#00B7C7`)
- `--bg`: Off White (`#F7F9FC`)
- `--surface`: Pure White (`#FFFFFF`)
- `--border`: Light Blue Gray (`#E6ECF5`)
- `--success`: Green (`#22C55E`)
- `--warning`: Amber (`#F59E0B`)
- `--danger`: Red (`#EF4444`)

Instructions:
1. Define these variables in Next.js `globals.css` (Tailwind configuration).
2. Create responsive layouts with a persistent/collapsible Sidebar:
   - Desktop (>=1024px): Persistent sidebar, role-aware navigation. Badge displaying user's current branch/semester scope.
   - Laptop (>=768px and <1024px): Collapsible sidebar.
   - Tablet/Mobile (<768px): Overlay sidebar drawer, bottom bar navigation, page titles stacked.
3. Implement Breadcrumbs with Academic taxonomy (`Portal / Semester / Subject / Material Type / Material`).
4. Apply smooth hover transitions (<300ms) and accessible focus states. Meet WCAG 2.1 AA requirements.
```

---

### Prompt 4: Student Experience (Dashboard & Browsing Portal)

```markdown
Role: Frontend Developer
Goal: Implement the Student Portal experience.

Pages to Build:
1. **Student Dashboard**:
   - Widgets: Quick Actions, Latest Uploads (within student's branch/semester), Recently Viewed, Bookmarks, and Active Announcements.
   - Empty states for new/unpopulated feeds.
2. **Subject Browser**:
   - Displays subjects for the current semester showing course title/code, last updated time, and material counts by type.
3. **Material List & Filtering**:
   - Filter by Material Type (Notes, Lab Manuals, Assignments, etc.), date range, faculty.
   - Sort options: newest, most viewed, most downloaded.
4. **Material Detail & Viewer**:
   - Clean details showing owner, file list (name, size, version), and action buttons.
   - PDF viewer embedded in browser; fallback to download button.
   - Record view/download events to Supabase `activity_events` logs.
```

---

### Prompt 5: Faculty Experience (Upload Flow & Analytics Dashboard)

```markdown
Role: Frontend & Operations Developer
Goal: Implement the Faculty Portal, including uploading and analytics.

Features to Build:
1. **Faculty Dashboard**:
   - Stats widgets: total uploads, view counts, download counts, storage used.
   - Charts: views/downloads trends (daily/weekly), material distribution by type.
   - Popular materials table.
2. **Step-by-Step Upload Stepper**:
   - Step 1: Select Academic Scope (Year, Semester, Branch, Subject - filtered by assigned teaching scope).
   - Step 2: Metadata (Title, Description, Material Type, Tags).
   - Step 3: File drag-and-drop (validate file size <= 100MB, allowed types: PDF, PPT/X, DOC/X, ZIP).
   - Step 4: Preview access scope permissions.
   - Step 5: Save as Draft or Publish.
3. **Material Management & Versioning**:
   - Edit metadata, archive/unarchive, replace file (creates new version in database/storage).
```

---

### Prompt 6: Admin Experience (User Roster, Taxonomy, & Storage Quotas)

```markdown
Role: Full-Stack Developer
Goal: Build the Admin Administration modules.

Modules to Implement:
1. **User Directory**:
   - Search, edit, activate/deactivate users.
   - Roster Upload: Drag-and-drop CSV parser with headers mapping, data validation, and import summary.
   - Reset user password (forced change on next login option).
2. **Academic Taxonomy Manager**:
   - Manage branches, semesters, and subjects (create, update, toggle active status).
   - Faculty subject assignments grid.
3. **Storage & Quota Governance**:
   - Monitor total system storage.
   - Configure global file size limits, retention policies for archived/soft-deleted files, and branch-specific storage quotas.
```

---

### Prompt 7: Global Search, Audit Logs, & Notifications

```markdown
Role: Full-Stack Developer
Goal: Build the core middleware systems: Global Search, Audit Logs, and Notifications/Announcements.

Systems to Build:
1. **Permission-Aware Global Search**:
   - Top search input supporting keyboard shortcut focus (`Cmd/Ctrl + K`) and keyboard navigation.
   - Search titles, descriptions, codes, tags, and faculty.
   - Enforce RLS filtering so results only return permitted items.
2. **Immutable Audit Logs**:
   - View listing for Admins.
   - Filters: actor, action type, date range, branch/semester.
   - Drawer component showing details of selected log.
3. **Announcements**:
   - Admin editor to broadcast messages (title, priority, scope: branch/semester/all).
   - In-app notification center showing unread indicators.
```
