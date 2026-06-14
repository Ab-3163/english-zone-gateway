## Goal
Overhaul ÉLITE ZONE admin dashboard: modern Navy/Red/White/Gray design, fully mobile-responsive (cards instead of tables), with automated workflow: Registration → Accept → Student → Result → Auto-Certificate.

## Design tokens (index.css + tailwind)
- `--admin-navy: 218 76% 17%` (#0B1F4D)
- `--admin-red: 0 84% 60%` (#EF4444)
- `--admin-gray: 220 14% 96%` (#F3F4F6)
- Smooth transitions, hover lift, rounded-2xl cards, soft shadows.

## Layout shell (`AdminDashboard.tsx`)
- **Sidebar**: fixed width (w-64 desktop, slide-over on mobile), navy bg, item icons + live counters (students, new registrations, courses, results, certificates) loaded via parallel `count` queries every 20s, polished logout button at bottom.
- **Header**: smaller logo, centered page title, bell notification icon (badge = pending count), refined hamburger.
- **Content**: gray bg, padded.

## Pages
1. **Dashboard (Home)**: 5 stat cards (Students, New Registrations, Courses, Results, Certificates) with icons + tiny sparkline/progress bar. Replaces current `StatsDashboard`.
2. **Registrations**: 
   - Desktop: table. Mobile (`md:hidden`): Card per request with name, phone, course, date, status badge + buttons (Accept / Reject / Delete / WhatsApp).
   - **Accept logic**: insert into `students` (auto `EZ-YYYY-NNNN` via existing `generate_student_id()`), set registration `status='confirmed'`, toast + refresh.
3. **Students**: Card layout on mobile (name, student_id, phone, course, level, status badge + Edit / Results / Attendance / Certificate / Delete / WhatsApp buttons). Table preserved on desktop.
4. **Results**: form picks an existing student (autocomplete by name/phone/student_id), saves result linked by `student_id`. Auto-compute `status = score >= 50 ? 'pass' : 'fail'`. On pass → auto-insert certificate row.
5. **Certificates** (new tab): list certificates with student name, course, level, pass date, cert number `CERT-YYYY-NNNN`.
6. **Courses**: card grid (image, description, students count, levels count). Limited to English / French / Informatics.
7. Global instant search (name / phone / student_id) on each list page.

## Database changes (one migration)
- New table `public.certificates` (student_id FK, course, level, score, pass_date, certificate_number unique, created_at). Sequence `certificate_seq` + `generate_certificate_number()`. RLS: admin all; public select by certificate_number (for verification). GRANTs included.
- Trigger on `student_results` after insert/update: if `score >= 50` and no certificate exists → insert into `certificates`, also update `students.pass_status='pass'`. If `< 50` → `pass_status='fail'`.
- Add `notification` count helper (use existing `admin_notifications`).

## Files to touch
- `src/index.css`, `tailwind.config.ts` — admin tokens
- `src/pages/AdminDashboard.tsx` — header (logo, title, bell), sidebar counters, add Certificates tab
- `src/components/admin/StatsDashboard.tsx` — 5 main cards redesign
- `src/components/admin/RegistrationsManager.tsx` — mobile cards + Accept→create student + WhatsApp
- `src/components/admin/StudentsManager.tsx` — mobile cards + WhatsApp + Certificate button
- `src/components/admin/ResultsManager.tsx` — student picker, auto pass/fail
- `src/components/admin/CertificatesManager.tsx` — NEW
- `src/components/admin/CoursesManager.tsx` — card grid polish
- New migration for `certificates` + trigger

## Out of scope (confirm if you want them now)
- Attendance tracking system (button placeholder only — no schema)
- Certificate PDF generation/download (text record only for now)
- Editing/redesigning Announcements / Media / Settings pages (kept as-is functionally; only inherit new tokens)

Proceed?