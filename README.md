# IdeaHub 💡

> A premium collaboration, proposal management, and workflow tracking platform designed for college clubs and organizations.

IdeaHub empowers club members to submit proposals, collaborate in real-time, and enables coordinators and administrators to manage organization-wide workflow lifecycles securely from submission through review and implementation.

---

## 🚀 Key Features

* **Strict Workflow Governance**: Structured proposal lifecycle states: `Draft ➔ Submitted ➔ In Review ➔ Approved/Changes Requested/Rejected ➔ In Progress ➔ Completed`.
* **Dynamic Department Badging**: Real-time category mappings for 10 departments (`IIC`, `STARTUP`, `EVENTS`, `OPERATION`, `CREATIVE`, `MEDIA`, `SPONSORSHIP`, `PR`, `MARKETING`, `TECHNICAL`) featuring premium HSL-colored visual badges and matching card accent bars.
* **Real-time Postgres Sync**: Comments, votes, and status transitions sync instantly across client browsers. Toast alert banners slide in to notify users when new comments or proposals are posted.
* **Secure Permissions (RLS)**: Fine-grained PostgreSQL Row-Level Security policies. Department Heads can only review proposals within their own departments. Administrators retain global management rights.
* **A11y & Polish**: Loading spinners inside buttons prevent double clicks. Accessible purple glow focus outlines (`focus-visible:ring-2`) enable seamless keyboard-only navigation.
* **Draft Deletions**: Authors can permanently delete their draft proposals with confirmation alerts before submitting them for review.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM.
* **Backend**: Supabase (PostgreSQL, GoTrue Authentication, Postgres Realtime Publication, Row Level Security).

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have Node.js (v18+) installed.

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase project API credentials:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
```

### 3. Initialize Database Schemas & Seeding
Deploy the schema to your Supabase project using the SQL Editor:
1. Copy the full content of [init_schema.sql](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/supabase/migrations/20260702000000_init_schema.sql) into the **Supabase SQL Editor** and click **Run**. This creates tables, performance indexes, triggers, and Row Level Security rules.
2. Copy the content of [seed.sql](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/supabase/seed.sql) and run it to seed the 10 departments.

### 4. Enable Google OAuth Authentication
1. Go to **Authentication** ➔ **Providers** in your Supabase Dashboard.
2. Enable the **Google** provider and enter your Google **Client ID** and **Client Secret** (created in your Google Cloud Console Credentials).
3. Set the redirect Site URL to your hosted client origin (e.g. `http://localhost:5173` or your production domain).

### 5. Install & Run
Run the following terminal commands to start the local dev server:
```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Run TypeScript type safety and linting verification
npm run lint

# Build optimized production bundle
npm run build
```

---

## 📖 Additional Documentation

* **[DATABASE.md](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/docs/DATABASE.md)**: Row-Level Security mappings, relational schemas, and indexing design.
* **[DEPLOYMENT.md](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/docs/DEPLOYMENT.md)**: Live deployment steps, Google OAuth redirect configurations, and site setups.
* **[CHANGELOG.md](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/docs/CHANGELOG.md)**: Version history, additions, and updates.
* **[ERROR_FIXES.md](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/docs/ERROR_FIXES.md)**: Common Supabase PostgREST error fixes and preventative actions.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/LICENSE) file for details.
