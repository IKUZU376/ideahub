# Error Fixes

This document tracks recurring issues, debugging notes and important implementation details.

Its purpose is to prevent the same mistakes from happening repeatedly.

---

## Issue
Powershell script execution policies on Windows block running local `.ps1` files, throwing `SecurityError` and failing when invoking `npm` or other CLI packages.

---

## Cause
By default, Windows restricts execution of script files downloaded from the internet or created locally unless the execution policy is explicitly configured (e.g., `Bypass` or `RemoteSigned`). PowerShell tries to resolve the `npm` command using a script file (`npm.ps1`), triggering the error.

---

## Solution
Directly execute the commands inside `cmd.exe` by prefixing with `cmd.exe /c` (e.g. `cmd.exe /c npm install react-router-dom`), which does not trigger PowerShell script execution policy checks.

---

## Prevention
For script tasks or npm operations on Windows development setups, utilize `cmd.exe /c` wrapper blocks or run powershell commands with the `-ExecutionPolicy Bypass` argument.

---

## Issue
TypeScript compilation error: `Property 'env' does not exist on type 'ImportMeta'` inside `src/lib/supabase.ts` and `src/views/Login.tsx`.

---

## Cause
Vite client types are not implicitly loaded by standard tsconfig configurations, meaning TypeScript is unaware of `ImportMeta.env` properties.

---

## Solution
Create `src/vite-env.d.ts` and append `/// <reference types="vite/client" />` to load Vite's client typings definitions.

---

## Prevention
Always verify the presence of `src/vite-env.d.ts` when configuring type checks in new Vite+TypeScript applications.

---

## Issue
TypeScript compilation error: `Property 'login' does not exist on type auth` inside `src/services/profiles.ts`.

---

## Cause
The authentication helper was refactored for Supabase, deprecating the mock `login` method but leaving a reference inside the mock profile updates service.

---

## Solution
Implement a clean `updateActiveUser(updates: Partial<User>)` method inside `src/lib/auth.ts` to allow memory-backed sync, and call it from the profile service.

---

## Prevention
When refactoring auth state managers, verify all downstream imports and updates are aligned with the new schema structures.

---

## Issue
Runtime crash / blank page in browser when launching the application local dev server.

---

## Cause
Supabase SDK's `createClient` throws a fatal runtime exception (`supabaseUrl is required`) if the URL is empty, undefined, or missing, crashing the initial evaluation of the javascript bundle in the browser.

---

## Solution
Implement URL format checking and fall back to valid placeholder credentials (`https://placeholder-url.supabase.co` and `placeholder-anon-key`) if the environment keys are missing or not configured, allowing the application shell to load and display warning instructions.

---

## Prevention
Provide valid placeholder fallbacks for service initializers that require active environment variables, enabling developer interfaces to mount and report errors gracefully.

---

## SQL Schema Validation
No issues were identified during validation of the SQL migration files. The schema definitions, triggers, constraints, and RLS policies compile and validate successfully. No workarounds were necessary.

---

## Auth State Refactoring Validation
No compilation or syntax issues were identified during the refactoring of the authentication listener or helper functions. TypeScript types and mapping rules validated successfully.

---

## Issue
Application hangs on "Restoring Session..." loading screen if the Supabase connection times out, is blocked by an adblocker, or fails.

---

## Cause
Database calls checking profiles inside `ensureProfileExists` are made synchronously during the initial session restoration callback. If these network calls fail or reject, the uncaught exception terminates the listener thread before the initialization flag is set (`initialized = true`), leaving the loading flag active indefinitely.

---

## Solution
Wrap the authentication change transitions inside a `try...catch...finally` block, ensuring that the initialization state `initialized = true` is always executed in the `finally` block. Added a 2.5-second safety timeout callback to force-initialize the app state to a `null` user, preventing page hangs.

---

## Prevention
Always wrap initial database bootstrapper callbacks in try-catch structures with finally blocks, and implement absolute safety timeouts to release loading wrappers if downstream network queries fail or hang.

---

## Department & Status Refactoring Validation
Renamed `department` to `departmentName` and added `departmentId` in frontend data models to enable UUID-based authorization rather than string matching. All TypeScript and Vite compile dependencies have been aligned and verified.

---

## Profile Updates & Demotion Safety Validation
Validated the demotion prevention rules (blocking self-updates and last administrator lockout). Re-implemented `updateProfile` in `profilesService` to guarantee user settings save full name updates successfully.

---

## Issue
Administrators receive save confirmation alerts in the UI, but user role changes are silently rejected by the database, leaving the target user's role unmodified.

---

## Cause
The Row Level Security (RLS) policies on the `profiles` table only authorized users to update their own profile row: `create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id)`. There was no policy authorizing Administrators to perform updates on other users' profile rows.

---

## Solution
Create an update policy on the `profiles` table authorizing updates if the active session belongs to an administrator:
```sql
create policy "Administrators can update any profile"
  on public.profiles for update
  using (public.get_current_user_role() = 'administrator');
```

---

## Prevention
When implementing dynamic admin modules, ensure that the table RLS policies authorize administrators (`get_current_user_role() = 'administrator'`) for insert/update/delete operations on all target tables.

---

## Issue
Junior Members and non-author users are unable to upvote ideas; clicking the upvote button throws a database RLS policy violation error.

---

## Cause
When a vote is cast, an insert trigger on the `idea_votes` table automatically updates the cached `votes_count` counter inside the `ideas` table. By default, trigger functions execute as `SECURITY INVOKER` (inheriting the session user's permissions). Since standard Junior Members are not authorized to update details inside the `ideas` table under RLS policies, the automated update is blocked and the entire transaction aborts.

---

## Solution
Redefine the `handle_idea_vote_change()` trigger function with `SECURITY DEFINER` privileges, authorizing the counter cache updates to execute as the database owner `postgres`, bypassing RLS.

---

## Prevention
Always configure automated counter triggers (e.g. upvote caches, comment totals) as `SECURITY DEFINER` to bypass session-level RLS restrictions when modifying count columns on secondary tables.

---

## Issue
Department Heads clicking "Start Review" receive a `"Cannot coerce the result to a single JSON object"` error.

---

## Cause
When the Department Head edits an idea's status, the RLS policy on the `ideas` table checks `public.is_department_head(department_id)`. That helper function queries the `department_members` table looking for a row matching the user's ID with `is_head = true`. However, when assigning a department or changing a user's role in the Admin Panel, the `is_head` column in the `department_members` table was never set to `true`, defaulting to `false` for everyone. Since Postgres could not find a row with `is_head = true`, the UPDATE query was blocked by RLS, returned 0 rows, and triggered the PostgREST single-row coercion error.

---

## Solution
Modify the frontend `profilesService.updateUserRole` and `profilesService.updateUserDepartment` methods to automatically synchronize and insert the `is_head` flag to `true` if the user is a `Department Head`. Additionally, provide a SQL migration script to sync existing rows:
```sql
UPDATE public.department_members dm
SET is_head = (p.role = 'department_head')
FROM public.profiles p
WHERE dm.profile_id = p.id;
```

---

## Prevention
When using multi-table join criteria for row-level permissions, ensure that all flags and relationship mappings (e.g., `is_head`, `role_permissions`) are synchronized programmatically whenever a related primary record is changed.

---

## Issue
Administrators and Department Heads receive the database error `"invalid input value for enum idea_status: 'Rejected'"` (or `'Changes Requested'`) when trying to reject or request changes on proposals.

---

## Cause
The PostgreSQL custom enum type `public.idea_status` created during initial schema setup was missing the `'Changes Requested'` and `'Rejected'` states required by the custom review workflow rules, causing database updates utilizing those values to fail.

---

## Solution
Execute an `ALTER TYPE` statement in the database to add the missing enum values, and update the schema creation scripts to include them:
```sql
ALTER TYPE public.idea_status ADD VALUE 'Changes Requested';
ALTER TYPE public.idea_status ADD VALUE 'Rejected';
```

---

## Prevention
Always coordinate database-level enum structures with frontend application state models to prevent inputs that violate database schema constraints.

---

## Draft Deletion Security Validation
Verified that the newly integrated draft delete button is fully validated against the database RLS policies (`Authorized deletions on ideas`). Standard members are allowed to permanently delete their own draft items, but any unauthorized attempts or deletions on non-draft proposals are securely rejected at the database level.

---

## Issue
Inputs, buttons, textareas, and select tags do not inherit the `font-family` from the global `body` CSS rule, causing parts of the UI to use generic system fallback fonts instead of the target Geist font.

---

## Cause
By default, web browsers assign vendor-specific stylesheets to form elements and interactive tags that override inheritance of standard text styles like `font-family`.

---

## Solution
Use a global CSS reset rule that explicitly forces the font family on all form control elements:
```css
body, html, input, select, textarea, button {
  font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
```

---

## Prevention
Always include form inputs, selects, textareas, and buttons in global font resets to ensure uniform typography application throughout the user interface.

---

## Issue
Duplicate theme toggle controls (in Topbar and Settings) can lead to UI desynchronization where the local theme state is out of sync with the global theme selection.

---

## Cause
Maintaining local component-level states for theme preference (like `const [darkMode, setDarkMode] = useState(true)`) in multiple files results in race conditions or missing update listeners, causing parts of the UI to show incorrect states.

---

## Solution
Consolidate theme control into a single global context (`ThemeProvider`) and expose it through a hook (`useTheme`). Remove duplicate checkboxes and switches, making the Topbar toggle the single source of truth for the entire application.

---

## Prevention
Avoid duplicating layout switches across multiple views. Drive global preferences from a unified React Context and expose a single control toggle.

---

## Issue
Native browser prompt and confirm dialogs (e.g. `window.confirm`, `prompt`) block the browser thread, have poor UX, and do not inherit custom style themes.

---

## Cause
Using native browser dialogs is a low-fidelity way to handle destructive draft deletes or input configurations, leading to poor visual consistency and blocking browser actions.

---

## Solution
Replace all native browser alerts, confirms, and prompts with stylized in-app modal overlays (`isInviteModalOpen`, `showDeleteModal`, `saveConfirmation`). Build them with React state variables and style them with consistent Tailwind cards, input forms, and action button components.

---

## Prevention
Always use custom React overlay modals for confirmation prompts and input fields rather than relying on browser-native blocking alerts.

---

## Issue
Modal dialogs containing input fields get clipped and confirm/cancel action buttons become obscured when the virtual software keyboard opens on mobile devices.

---

## Cause
Modals lacking height constraints or vertical scroll overrides become taller than the reduced visible viewport space, causing forms to extend off-screen and blocking form completion.

---

## Solution
Apply `max-h-[90vh]` limits combined with `overflow-y-auto` scrolling and bottom padding buffers (`pb-8`) to all modal dialog cards. This allows the modal contents to be scrolled freely, keeping action buttons accessible even with the soft keyboard active.

---

## Prevention
Always set maximum height bounds and vertical scroll bars on modal containers containing input elements.

---

## Issue
Large data tables containing multiple detailed columns (such as members directories) squish column content on small viewports, rendering text overlays and misaligning action links.

---

## Cause
Forcing standard HTML tables to scale down to fit screen widths under 768px compresses column cells to unreadable proportions, without triggering natural scrolling.

---

## Solution
Wrap tabular listings in a smooth scrolling container (`overflow-x-auto`) and set a minimum width limit (`min-w-[700px]`) on the table element. This maintains proper text line heights and columns spacing, enabling fluid horizontal swipe navigation on mobile devices.

---

## Prevention
Configure tables with minimum width bounds whenever they wrap multi-column directories.