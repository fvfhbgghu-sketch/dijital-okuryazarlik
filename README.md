# Dijital Okuryazarlık — Online Examination Platform

Production-ready exam platform built with **React + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL)**.

It ships with **two separate exams**, seeded from the provided question banks:

| Exam | Source | Questions |
|------|--------|-----------|
| **Dijital Okuryazarlık — Final & Önceki Yıllar** | First two files (deduplicated) | **29** |
| **Dijital Okuryazarlık — Bölüm Sonu Soruları** | Bölüm-sonu file (8 chapters) | **80** |

---

## ✨ Features

**Student area**
- Home page with exam cards (title, question count, welcome, start).
- One-question-at-a-time interface, question-navigator grid, progress bar, answered/remaining counters.
- Move forward/back, jump to any question, change answers freely.
- **Autosave** of every answer to Supabase; **refresh-safe resume** of in-progress sessions.
- Finish confirmation → server-side grading → results page with score, %, correct/wrong, and a per-question review (correct answer green, wrong answer red). Review-all / retake.

**Admin area**
- Secure login via **Supabase Auth** (no hardcoded credentials). Admin role enforced server-side via `is_admin()` + RLS.
- Dashboard: total attempts, average / highest / lowest score, unique participants.
- Sessions table with **search, sorting, pagination, and filters** (by exam & status).
- Session details: every question with the participant's answer vs. the correct answer.
- Question management: view / add / edit / delete — changes hit Supabase immediately.

**UX**
- Dark / light mode (persisted, no flash), smooth transitions, responsive (mobile/tablet/desktop), loading/empty/error states, toast notifications.

**Security model**
- Correct answers **never leave the database** for participants. The exam UI reads a `question_options_public` view (no `is_correct`). Grading happens inside `SECURITY DEFINER` RPCs (`submit_exam`, `get_session_results`). Participants reach their own data only via the secret session UUID.

---

## 📁 Project structure

```
exam-platform/
├─ index.html
├─ package.json
├─ vite.config.ts · tailwind.config.js · postcss.config.js · tsconfig*.json
├─ .env.example
├─ scripts/
│  └─ generate_seed.py          # regenerates supabase/seed.sql from the question banks
├─ supabase/
│  ├─ schema.sql                # full schema (same as migration 0001)
│  ├─ migrations/0001_init.sql  # tables, indexes, RLS, RPC functions, grants
│  └─ seed.sql                  # 109 questions + options + correct answers
└─ src/
   ├─ main.tsx · App.tsx · index.css
   ├─ lib/        supabase.ts · api.ts · types.ts · utils.ts
   ├─ context/    ThemeContext · ToastContext · AuthContext
   ├─ components/  ui/ · layout/ · exam/ · admin/
   └─ pages/       HomePage · ExamPage · ResultsPage · NotFoundPage
                   admin/ LoginPage · DashboardPage · SessionDetailsPage · QuestionsPage
```

---

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```
Fill in from **Supabase → Project Settings → API**:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Database setup
In the **Supabase SQL Editor**, run the two scripts in order:

1. `supabase/migrations/0001_init.sql` — creates tables, indexes, RLS policies, and the RPC functions.
2. `supabase/seed.sql` — loads both exams with all 109 questions and the correct answers.

> Using the Supabase CLI instead?
> ```bash
> supabase db push                       # applies migrations/0001_init.sql
> psql "$DATABASE_URL" -f supabase/seed.sql
> ```

To re-generate the seed after editing the banks: `npm run seed` (needs Python 3).

### 4. Authentication setup (create an admin)
1. **Supabase → Authentication → Users → Add user** — create a user with email + password (email confirm on).
2. In the **SQL Editor**, promote that user to admin:
   ```sql
   select public.grant_admin('admin@kurum.com');
   ```
   (Or insert manually: `insert into admin_users (id,email) select id,email from auth.users where email='admin@kurum.com';`)
3. Log in at **`/loginadmin`** (there is no public link to this page — reach it by typing the URL). Non-admin users are rejected and signed out automatically; `ProtectedRoute` blocks every admin page.

> Tip: disable public sign-ups under **Authentication → Providers → Email** so only you create admin accounts.

### 5. Run
```bash
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build
```

---

## ☁️ Deployment (Vercel / Netlify / static host)

1. **Build command:** `npm run build` — **Output dir:** `dist`.
2. Add the env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host dashboard.
3. SPA fallback (client-side routing): rewrite all paths to `/index.html`.
   - **Vercel** — `vercel.json`:
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```
   - **Netlify** — `public/_redirects`:
     ```
     /*  /index.html  200
     ```
4. The Supabase **anon key is safe to expose** — RLS + `SECURITY DEFINER` RPCs enforce all access rules. Never ship the `service_role` key to the client.

---

## 🗄️ Database overview

Normalized schema:

- `exams` — exam metadata (`slug`, `title`, `question_count`, `is_active`).
- `questions` — `exam_id` FK, `question_number`, `question_text` (unique per exam).
- `question_options` — `question_id` FK, `option_label`, `option_text`, `is_correct`, `sort_order`.
- `exam_sessions` — one attempt (participant, status, totals, %, score, timestamps).
- `user_answers` — `session_id` + `question_id` FK, `selected_option_id`, `is_correct` (unique per session+question).
- `admin_users` — maps a Supabase Auth user to admin rights.

All FKs use `ON DELETE CASCADE` (answers/options follow their parents). Indexes cover the hot paths (questions by exam, options by question, sessions by status/finish, answers by session). RLS is enabled on every table; the participant flow goes exclusively through the SECURITY DEFINER RPCs. See `supabase/migrations/0001_init.sql` for the full definition.

### RPC functions
| Function | Caller | Purpose |
|----------|--------|---------|
| `start_exam_session(exam, name, email)` | anon | create attempt, returns session id |
| `save_answer(session, question, option)` | anon | autosave one answer |
| `get_session_state(session)` | anon | restore answers after refresh |
| `submit_exam(session, answers)` | anon | grade server-side, finalize, return summary |
| `get_session_results(session)` | anon/admin | full per-question review |
| `admin_dashboard_stats()` | admin | aggregate statistics |
| `is_admin()` / `grant_admin(email)` | — | role check / promote |
```
