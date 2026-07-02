-- Initialize IdeaHub Database Schema
-- Migration Date: 2026-07-02 00:00:00

-- =========================================================================
-- 1. CUSTOM TYPES & ENUMS
-- =========================================================================

create type public.user_role as enum (
  'junior_member',
  'department_head',
  'administrator'
);

create type public.idea_status as enum (
  'Draft',
  'Submitted',
  'In Review',
  'Needs Collaboration',
  'Changes Requested',
  'Rejected',
  'Approved',
  'In Implementation',
  'Completed'
);

create type public.idea_impact as enum (
  'Low',
  'Medium',
  'High'
);

-- =========================================================================
-- 2. TABLE SCHEMAS
-- =========================================================================

-- Profiles Table (Linked to Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role public.user_role not null default 'junior_member'::public.user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Departments Table
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Department Members (Join Table between Profiles and Departments)
create table public.department_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  department_id uuid references public.departments(id) on delete cascade not null,
  is_head boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_department_members unique (profile_id, department_id)
);

-- Ideas Table
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  department_id uuid references public.departments(id) on delete set null,
  status public.idea_status not null default 'Draft'::public.idea_status,
  votes_count integer default 0 not null,
  impact public.idea_impact not null default 'Medium'::public.idea_impact,
  tags text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idea Collaborators Join Table (Tracks contributors assigned to an implementation sprint)
create table public.idea_collaborators (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'Contributor' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_idea_collaborators unique (idea_id, profile_id)
);

-- Idea Votes Table (Keeps unique records of user votes to prevent duplicate upvotes)
create table public.idea_votes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_idea_votes unique (idea_id, profile_id)
);

-- Idea Comments Table
create table public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Idea Status History Audit Table (Tracks transitions for details timeline view)
create table public.idea_status_history (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  status public.idea_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 3. INDEX OPTIMIZATIONS
-- =========================================================================

create index idx_profiles_role on public.profiles (role);
create index idx_department_members_ids on public.department_members (profile_id, department_id);
create index idx_ideas_author on public.ideas (author_id);
create index idx_ideas_department on public.ideas (department_id);
create index idx_ideas_status on public.ideas (status);
create index idx_ideas_tags on public.ideas using gin (tags);
create index idx_idea_collaborators_ids on public.idea_collaborators (idea_id, profile_id);
create index idx_idea_votes_ids on public.idea_votes (idea_id, profile_id);
create index idx_idea_comments_idea on public.idea_comments (idea_id);
create index idx_idea_status_history_idea on public.idea_status_history (idea_id);

-- =========================================================================
-- 4. DATABASE TRIGGERS
-- =========================================================================

-- Trigger function: Auto-updates updated_at audit column on modifications
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger tr_departments_updated_at before update on public.departments for each row execute function public.handle_updated_at();
create trigger tr_department_members_updated_at before update on public.department_members for each row execute function public.handle_updated_at();
create trigger tr_ideas_updated_at before update on public.ideas for each row execute function public.handle_updated_at();
create trigger tr_idea_collaborators_updated_at before update on public.idea_collaborators for each row execute function public.handle_updated_at();
create trigger tr_idea_comments_updated_at before update on public.idea_comments for each row execute function public.handle_updated_at();

-- Trigger function: Auto-updates votes_count counter on the ideas table when a vote is cast or retracted
create or replace function public.handle_idea_vote_change()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.ideas
    set votes_count = votes_count + 1
    where id = new.idea_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.ideas
    set votes_count = votes_count - 1
    where id = old.idea_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger tr_idea_vote_change
after insert or delete on public.idea_votes
for each row execute function public.handle_idea_vote_change();

-- =========================================================================
-- 5. RLS SECURITY POLICY HELPER FUNCTIONS
-- =========================================================================

-- Security helper: Retrieves the active user's role from public.profiles
create or replace function public.get_current_user_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer;

-- Security helper: Checks if the active user is a department head of a specific department
create or replace function public.is_department_head(dept_id uuid)
returns boolean as $$
  select exists (
    select 1 
    from public.department_members 
    where profile_id = auth.uid() 
      and department_id = dept_id 
      and is_head = true
  );
$$ language sql security definer;

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enforce RLS
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.department_members enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_collaborators enable row level security;
alter table public.idea_votes enable row level security;
alter table public.idea_comments enable row level security;
alter table public.idea_status_history enable row level security;

-- profiles policies
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Administrators can update any profile"
  on public.profiles for update
  using (public.get_current_user_role() = 'administrator');

-- departments policies
create policy "Departments are readable by authenticated users"
  on public.departments for select
  using (auth.role() = 'authenticated');

create policy "Only administrators can manage departments"
  on public.departments for all
  using (public.get_current_user_role() = 'administrator');

-- department_members policies
create policy "Department members are readable by authenticated users"
  on public.department_members for select
  using (auth.role() = 'authenticated');

create policy "Only administrators can manage department memberships"
  on public.department_members for all
  using (public.get_current_user_role() = 'administrator');

-- ideas policies
create policy "Users can view public ideas and their own drafts"
  on public.ideas for select
  using (status != 'Draft'::public.idea_status or author_id = auth.uid() or public.get_current_user_role() = 'administrator');

create policy "Authenticated users can create ideas"
  on public.ideas for insert
  with check (auth.uid() = author_id);

create policy "Authorized updates on ideas"
  on public.ideas for update
  using (
    (author_id = auth.uid() and status in ('Draft'::public.idea_status, 'Submitted'::public.idea_status))
    or (public.is_department_head(department_id))
    or (public.get_current_user_role() = 'administrator')
  );

create policy "Authorized deletions on ideas"
  on public.ideas for delete
  using (
    (author_id = auth.uid() and status = 'Draft'::public.idea_status)
    or (public.get_current_user_role() = 'administrator')
  );

-- idea_collaborators policies
create policy "Collaborators are readable by authenticated users"
  on public.idea_collaborators for select
  using (auth.role() = 'authenticated');

create policy "Authorized management of collaborators"
  on public.idea_collaborators for all
  using (
    exists (select 1 from public.ideas where id = idea_id and author_id = auth.uid())
    or exists (select 1 from public.ideas where id = idea_id and public.is_department_head(department_id))
    or (public.get_current_user_role() = 'administrator')
  );

-- idea_votes policies
create policy "Votes are readable by authenticated users"
  on public.idea_votes for select
  using (auth.role() = 'authenticated');

create policy "Users can cast their own vote"
  on public.idea_votes for insert
  with check (auth.uid() = profile_id);

create policy "Users can retract their own vote"
  on public.idea_votes for delete
  using (auth.uid() = profile_id);

-- idea_comments policies
create policy "Comments are readable if the associated idea is readable"
  on public.idea_comments for select
  using (exists (select 1 from public.ideas where id = idea_id));

create policy "Authenticated users can post comments"
  on public.idea_comments for insert
  with check (auth.uid() = author_id and exists (select 1 from public.ideas where id = idea_id));

create policy "Authors can edit their comments"
  on public.idea_comments for update
  using (auth.uid() = author_id);

create policy "Authorized deletions on comments"
  on public.idea_comments for delete
  using (auth.uid() = author_id or public.get_current_user_role() = 'administrator');

-- idea_status_history policies
create policy "Status history is readable by authenticated users"
  on public.idea_status_history for select
  using (auth.role() = 'authenticated');

create policy "Authorized inserts on status history"
  on public.idea_status_history for insert
  with check (
    (changed_by = auth.uid())
    and (
      public.get_current_user_role() = 'administrator'
      or exists (
        select 1 
        from public.ideas 
        where id = idea_id 
          and (author_id = auth.uid() or public.is_department_head(department_id))
      )
    )
  );

create policy "Timeline is read-only"
  on public.idea_status_history for all
  using (false);

-- =========================================================================
-- 7. REALTIME CONNECTION CONFIGURATIONS
-- =========================================================================
alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.idea_comments;
