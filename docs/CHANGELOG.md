# Changelog

All notable project changes should be documented here.

---

# [1.1.0] - 2026-07-06

## Added
- Integrated the **Geist** sans-serif font family and **Geist Mono** font family globally across the application.
- Configured HTML preconnect and stylesheet link tags inside `index.html` to guarantee browser-level loading of Geist.
- Implemented global typography overrides in `src/index.css` forcing Geist and Geist Mono across all tags, user inputs, buttons, select menus, code tags, and textareas.
- Built a global **ThemeProvider** context (`ThemeContext.tsx`) and `useTheme` hook to manage reactive Light/Dark mode state.
- Installed a theme toggle button inside the header (`Topbar.tsx`) that synchronizes theme updates instantly without page refresh, persists selection in `localStorage`, and respects the OS preference.
- Implemented soft neutral-warm surface layering in **Light Mode**: background `#F8FAFC`, card/sidebar surfaces `#FFFFFF` for clear separation, and slate text/borders.
- Established **Dark Mode** surface styling: background `#030306` with surfaces at `#111118` for visual depth.
- Adopted an **Electric Purple/Amethyst** primary accent palette (`#9333ea` for Light Mode, `#a855f7` for Dark Mode) to preserve the brand identity with a glowing, high-contrast tone.
- Established high-contrast status colors that adhere to WCAG AA recommendations.
- Created dynamic department badge classes in `index.css` to automatically adjust text contrast on both dark and light backdrops.
- Created developer reference documentation in `docs/DESIGN_SYSTEM.md`.
- Implemented multi-layered interactive mouse-parallax animations in `Login.tsx` and `Dashboard.tsx` responding to cursor position vectors.
- Integrated smooth slide-up page entry transitions (`animate-fade-in-up`) on router pathname changes inside `Layout.tsx`.
- Refined card hover states in Light Mode by removing `!important` flags, enabling card translation lifts and glowing amethyst shadows on hover.
- Created keyframe-driven floating animations (`animate-float`) for decorative elements and blurs.
- Replaced native browser `confirm()` and `prompt()` dialogs with clean, styled in-app confirmation modal overlays in `Admin.tsx` and `IdeaDetails.tsx`.
- Integrated a custom Invite User modal in `Admin.tsx` replacing browser input prompts.
- Added a prominent primary "Submit Idea" CTA button in the header of `MyIdeas.tsx` next to filters.
- Added responsive card fallback layouts (`block md:hidden`) for the submissions queue on the Dashboard and the proposals queue in `Department.tsx` to handle screen widths < 768px.
- Integrated CSS environment variables (`pb-safe`, `pt-safe`) for safe area clearances on mobile notches and OS gesture bars.
- Integrated a `useEffect` router path listener in `Layout.tsx` that automatically closes the mobile sidebar drawer upon navigation.

## Removed
- Removed non-functional placeholder "Help" item from the navigation Sidebar utilities.
- Removed non-functional placeholder "Export Data" and "Export Report" download buttons from `Admin.tsx` and `Department.tsx`.
- Removed placeholder "Change Avatar" and "Remove Avatar" buttons and camera overlay from `Settings.tsx`.
- Removed placeholder "Bio" textarea from `Settings.tsx`.

## Changed
- Reverted all view/component layout spacing, border radius adjustments, padding modifications, and card/table token migrations from Phase 1, preserving the original layout structure of the platform.
- Refactored all component-level gradients (`bg-gradient-to-r` and text gradients) to use clean, solid background/color classes.
- Removed the duplicate theme toggle switch from the Settings page, centralizing all theme controls in the Topbar.
- Balanced the Dashboard view's height and layout structure by increasing the table limit to 5 (equalizing left and right columns) and converting transparent buttons and empty placeholders into solid, elevated `bg-bg-surface` card containers.
- Relocated the "Settings" page link to the bottom utilities section in `Sidebar.tsx` to group account utilities together.
- Renamed the "/ideas" navigation label from "My Ideas" to "Explore Ideas" to accurately reflect that it serves as a shared club initiatives directory.
- Made the "Club Role" input disabled and read-only in `Settings.tsx` to display the authentic system role and prevent security privilege escalations.
- Refactored active navigation sidebar highlights to use semantic theme tokens (`bg-primary-transparent`, `text-primary`) rather than hardcoding colors.
- Refined empty state and filter messages to use concise, action-oriented copywriting ("No proposals match your current filters.").
- Changed background of empty state cards from transparent `bg-bg-surface/30` to solid `bg-bg-surface` for consistent color engine compliance.
- Expanded all navigation links, theme switchers, close triggers, and icon buttons (`Bell`, `Sun`/`Moon`, `Settings`, `Menu`, `X`) to meet a minimum touch target area of 40px–44px on mobile viewports.
- Configured modal dialog cards with maximum height boundaries (`max-h-[90vh]`), vertical overflow scroll bars, and bottom padding buffers to prevent virtual keyboard obscure errors.
- Refactored members directory table in `Admin.tsx` with a scrolling viewport wrapper (`overflow-x-auto`) and a `min-w-[700px]` width rule to prevent column squishing on mobile.
- Refactored filters layout in `MyIdeas.tsx` to stack vertically (`flex flex-col sm:flex-row`) on mobile screens to keep actions comfortably reachable.
- Configured selective scrollbar hiding (`.scrollbar-none`) only on decorative swiping components (like filter category tabs) while keeping standard scrollbars visible elsewhere.

---

# [0.9.0] - 2026-07-02

## Added
- Implemented support for deleting drafts, allowing authors to permanently remove their own draft proposals from the details panel.
- Connected `deleteIdea` inside `src/services/ideas.ts` to Supabase to support draft deletes.
- Integrated subtle loader spinners into form buttons (`SubmitIdea.tsx`, `Settings.tsx`, and `Admin.tsx` Edit User modal) during async transactions.
- Refined empty state panels in `MyIdeas.tsx`, `Department.tsx`, and `Dashboard.tsx` with clean, minimal layout cards and context-aware action buttons (e.g. "Clear Filters", "Submit Idea").
- Updated repository seed configs to register the final clean list of 10 club departments (`IIC`, `STARTUP`, `EVENTS`, `OPERATION`, `CREATIVE`, `MEDIA`, `SPONSORSHIP`, `PR`, `MARKETING`, `TECHNICAL`).
- Configured dynamic department loading in the Submit Idea form (`SubmitIdea.tsx`), completely replacing the old hardcoded department classifications.
- Fixed a bug where reloading the client page prematurely triggered the auth state listener with a null session on page refresh, resulting in a flash redirect back to the login screen.
- Restructured `App.tsx` to maintain a single unified `HashRouter` shell context, preventing unmounting state loss and preserving URL history on page refresh.
- Wiped hardcoded mock data in the `Dashboard` Activity Feed and `Department` stats panels, replacing them with live database-driven queries.
- Removed the password-based Security & Account tab and redundant email notifications settings in `Settings.tsx` since authentication is purely Google-OAuth-driven.
- Configured first-login auto-promotion to Administrator when the database is empty, allowing project leads to instantly claim the admin role on fresh deployments.
- Redesigned the Submit Idea page (`SubmitIdea.tsx`) for a zero-scroll experience by moving save/submit buttons to the header, removing asset uploads, converting departments to a compact dropdown, and optimizing layout height.
- Added premium HSL color-coded badge styles and solid left-accent vertical bars on idea cards (`MyIdeas.tsx`) to dynamically represent each department across all main views.
- Integrated a "My Ideas Only" checkbox toggle and a dynamic Department select dropdown filter on the Explore Ideas page to allow cross-department searching and coordination.

---

# [0.8.0] - 2026-07-02

## Added
- Implemented live User Management, Role Management, and Department Assignment for Administrators.
- Connected `profilesService` in `src/services/profiles.ts` to Supabase, completely replacing the mock users storage.
- Added dynamic dropdown selectors for Role and Department inside a premium glassmorphic Edit User Modal dialog in `Admin.tsx`.
- Enforced a double confirmation prompt flow: Administrators must explicitly confirm role changes and department changes before saving.
- Enforced safety rules at the API layer: preventing demoting the last Administrator and preventing users from altering their own Administrator status.
- Configured dynamic department loading from the Supabase `departments` table.
- Added user filtering on the Admin panel supporting search (name or email), role filter, and department assignment filter.
- Integrated successful and failed notification banners at the top of the Admin dashboard with loading wrappers.
- Redefined the database upvote trigger function as `SECURITY DEFINER` to resolve database RLS errors when non-admins cast votes.
- Connected `commentsService` in `src/services/comments.ts` to Supabase, replacing the mock comments storage.
- Added Supabase Realtime Postgres channel subscription for the `idea_comments` table inside the comments service.
- Implemented global real-time notifications in `Layout.tsx` that display sliding bottom-right toast alerts for other active users when a new idea is submitted or a new comment is posted.
- Synchronized the `is_head` flag in the `department_members` table on role changes and department assignments to prevent RLS errors for Department Heads when managing ideas.
- Expanded `public.idea_status` database enum type to support `'Changes Requested'` and `'Rejected'` workflow states.

---

# [0.7.0] - 2026-07-02

## Added
- Implemented the complete Department Review Workflow for college clubs.
- Configured dynamic user profile department mappings: on session restoration, `auth.ts` queries `department_members` and `departments` tables to retrieve both the active user's `departmentId` (UUID) and `departmentName`.
- Implemented context-driven action buttons in the `IdeaDetails` view:
  - **Start Review** (transitions `Submitted` to `'In Review'`)
  - **Approve** (transitions `'In Review'` / `'Needs Collaboration'` to `'Approved'`)
  - **Request Changes** (transitions `'In Review'` / `'Needs Collaboration'` to `'Needs Collaboration'`)
  - **Reject** (transitions `'In Review'` / `'Needs Collaboration'` to `'Rejected'`)
  - **Move to In Progress** (transitions `'Approved'` to `'In Implementation'`)
  - **Mark Completed** (transitions `'In Implementation'` to `'Completed'`)
- Mapped database status strings to user-friendly UI display labels (e.g. `'In Review'` ➔ `"Under Review"`, `'Needs Collaboration'` ➔ `"Changes Requested"`, `'In Implementation'` ➔ `"In Progress"`).
- Restructured authorization: Junior Members are blocked from modifying status, Department Heads can only transition proposals belonging to their `departmentId` UUID, and Administrators have universal permission.

---

# [0.6.0] - 2026-07-02

## Added
- Integrated Supabase database queries into `ideasService` in `src/services/ideas.ts`, completely replacing the local mock ideas store.
- Added database-level pagination, query filtering (matching status, author, and department), and ILIKE text search filtering.
- Implemented high-performance database-level count queries (`ideasService.getStats` and `ideasService.getIdeasCounts`) utilizing Supabase's `{ count: 'exact', head: true }` options.
- Implemented robust UI views for Loading, Empty, and Error states in `Dashboard`, `MyIdeas`, `IdeaDetails`, `Department`, and `Admin` pages.
- Built a live toggle voting mechanism inserting and deleting from the `idea_votes` table, utilizing Postgres DB triggers to update cached vote counters.
- Configured audit tracking inserting status change logs inside `idea_status_history` on review changes.

## Changed
- Refactored `auth.ts` to utilize resilient `try...catch...finally` blocks to resolve loading page hangs in case of network CORS block or adblockers.

---

# [0.5.0] - 2026-07-02

## Added
- Configured dynamic asynchronous check in `src/lib/auth.ts` to map and fetch user profiles from the Supabase database.
- Implemented first-time profile creation inside the `public.profiles` database table, explicitly populating `id`, `email`, `full_name`, `avatar_url`, `role` (defaults to `'junior_member'`), `created_at`, and `updated_at`.
- Mapped database roles (`'junior_member' | 'department_head' | 'administrator'`) to application roles (`'Junior Member' | 'Department Head' | 'Administrator'`).

## Changed
- Replaced mock authentication state logic with true Supabase session notifications and user mappings.

---

# [0.4.0] - 2026-07-02

## Added
- Created `supabase/seed.sql` containing permanent reference data (core club departments lookup table).
- Created `docs/DEPLOYMENT.md` guide detailing SQL run order, Supabase dashboard settings, and OAuth configurations.

---

# [0.3.0] - 2026-07-02

## Added
- Created `supabase/migrations/20260702000000_init_schema.sql` SQL migration script containing enums, tables, keys, triggers, indexes, and RLS policies.
- Created `src/types/database.ts` defining TypeScript schema interfaces for rows, inserts, updates, and enum types.
- Created `docs/DATABASE.md` containing relational diagram (Mermaid), table descriptions, columns descriptions, RLS settings, and database indexes.

---

# [0.2.0] - 2026-07-02

## Added
- Installed `@supabase/supabase-js` SDK.
- Created `src/lib/supabase.ts` to configure and export the Supabase Client.
- Integrated Google OAuth via Supabase authentication.
- Configured dynamic profile logging in `public.profiles` database table on the first successful login.

## Changed
- Refactored `src/lib/auth.ts` to handle dynamic session state checks and map user properties from Supabase credentials.
- Updated `src/hooks/useAuth.ts` to coordinate session status loading states reactively.
- Modified `src/App.tsx` to handle loading flags, preventing screen redirects or flashes during initial session restoration.
- Refactored `src/views/Login.tsx` to connect to real Google OAuth via Supabase, with custom developer configuration notifications.
- Updated `.env.example` to document `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Fixed
- Added URL validation and placeholder fallbacks to `src/lib/supabase.ts` to prevent the Supabase client from throwing a fatal startup exception (`supabaseUrl is required`) when environment variables are not configured, which resolved the blank page runtime crash.

---

# [0.1.0] - 2026-07-02

## Added
- Installed `react-router-dom` to support SPA routing and URL route parameters.
- Created `src/lib/auth.ts` to manage the active logged-in user in memory.
- Created `src/hooks/useAuth.ts` to expose custom authentication context reactively.
- Created `src/services/ideas.ts` to handle idea CRUD, voting, and status transitions in memory.
- Created `src/services/comments.ts` to handle adding and querying comments per idea ID.
- Created `src/services/departments.ts` to manage department statistics and details queries.
- Created `src/services/profiles.ts` to query club members, perform profile updates, and trigger user invitations.
- Created `src/views/Login.tsx` view with role profile picker and mock Google OAuth.

## Changed
- Refactored `src/App.tsx` to configure SPA HashRouter paths and toggle Login views based on session state.
- Modified `src/components/Layout.tsx` to support responsive mobile sidebar drawers and slide-in overlays.
- Modified `src/components/Sidebar.tsx` to implement link transitions, mobile drawer close callbacks, and role-based menu link visibility (Admin option hidden for non-admins).
- Modified `src/components/Topbar.tsx` to wire up hamburger menu triggers, settings redirects, and top search bar submission triggers.
- Updated `src/views/Dashboard.tsx` to load ideas dynamically, calculate overview counters dynamically, and link recent ideas to details.
- Updated `src/views/MyIdeas.tsx` to filter grid items dynamically using search strings and status categories, and sync queries with URL parameters.
- Updated `src/views/IdeaDetails.tsx` to load ideas using the `id` route parameter, enable comment publishing, increment upvote state, and toggle proposal lifecycle phases dynamically.
- Updated `src/views/Department.tsx` to query and filter statistics dynamically based on the logged-in user's department.
- Updated `src/views/Admin.tsx` to support search, record pagination (4 rows per page), and an interactive invite popup prompt.
- Updated `src/views/Settings.tsx` to bind input elements to save profile edits, toggle settings, and display save feedback.
- Updated `index.html` to give a professional product title and meta description tag.
