# Supabase Database Deployment Guide

This guide details the steps to deploy the database schema and seed data for **IdeaHub** to your live Supabase project.

---

## 1. SQL Scripts Execution Order

To set up the database, you must run the SQL scripts in the following order:

### Step 1: Initial Schema Migration
* **File**: [supabase/migrations/20260702000000_init_schema.sql](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/supabase/migrations/20260702000000_init_schema.sql)
* **Description**: Creates custom enum types, table definitions, performance indexes, audit triggers, and security Row Level Security (RLS) policies.
* **Execution**: 
  1. Open your **Supabase Dashboard**.
  2. Go to **SQL Editor** ➔ **New Query**.
  3. Copy the full contents of `20260702000000_init_schema.sql` and paste it into the editor.
  4. Click **Run**.

### Step 2: Reference Data Seeding
* **File**: [supabase/seed.sql](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/supabase/seed.sql)
* **Description**: Seeds the core reference data for club departments (Technical, Events, Content, Public Relations, Operations).
* **Execution**:
  1. In the **SQL Editor**, open another **New Query**.
  2. Copy the contents of `seed.sql` and paste it.
  3. Click **Run**.

---

## 2. Supabase Dashboard Manual Settings

Once the SQL scripts have been executed, configure the following settings in your Supabase Dashboard:

### 1. Enable Google OAuth
To support Google Sign-in:
1. Go to **Authentication** ➔ **Providers** in the left navigation sidebar.
2. Select **Google** from the list of OAuth providers.
3. Toggle the provider to **Enabled**.
4. Enter your Google **Client ID** and **Client Secret** (obtained from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) under your OAuth Web Application Credentials).
5. Copy the **Redirect URI** shown in the Supabase panel and add it to your Google Cloud Console's "Authorized redirect URIs" list.
6. Click **Save** in the Supabase dashboard.

### 2. Configure Redirect & Site URLs
To ensure OAuth callbacks route back to your application:
1. Go to **Authentication** ➔ **URL Configuration**.
2. Under **Site URL**, enter your primary application URL (e.g. `http://localhost:3000` for local dev server, or your hosted web URL).
3. Under **Redirect URLs**, add any secondary or wildcard redirect URIs if needed.

### 3. Verify Database Objects
Go to the **Table Editor** on the left menu:
* Confirm that the following 8 tables are present: `profiles`, `departments`, `department_members`, `ideas`, `idea_collaborators`, `idea_votes`, `idea_comments`, `idea_status_history`.
* Navigate to **Database** ➔ **Roles & Policies** and verify that RLS is toggled **ON** for all 8 tables and that the RLS policies match the descriptions in the [DATABASE.md](file:///c:/Users/SAUMITRA/Documents/Codex/2026-07-01/ideahub-is-not-intended-to-be/work/ideahub-src/docs/DATABASE.md) file.
