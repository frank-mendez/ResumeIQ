-- =========================================
-- ResumeIQ Production Upgrade Migration
-- =========================================

-- ================================
-- 1. Enforce NOT NULL Constraints
-- ================================

do $$
declare
  null_count bigint;
begin
  select count(*) into null_count from resumes where user_id is null;
  if null_count > 0 then
    raise exception 'Cannot set resumes.user_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from resume_versions where resume_id is null;
  if null_count > 0 then
    raise exception 'Cannot set resume_versions.resume_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from resume_analyses where resume_version_id is null;
  if null_count > 0 then
    raise exception 'Cannot set resume_analyses.resume_version_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from subscriptions where user_id is null;
  if null_count > 0 then
    raise exception 'Cannot set subscriptions.user_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from subscriptions where stripe_subscription_id is null;
  if null_count > 0 then
    raise exception 'Cannot set subscriptions.stripe_subscription_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from payments where user_id is null;
  if null_count > 0 then
    raise exception 'Cannot set payments.user_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from payments where stripe_payment_intent_id is null;
  if null_count > 0 then
    raise exception 'Cannot set payments.stripe_payment_intent_id to NOT NULL: % rows have NULL values', null_count;
  end if;

  select count(*) into null_count from usage_logs where user_id is null;
  if null_count > 0 then
    raise exception 'Cannot set usage_logs.user_id to NOT NULL: % rows have NULL values', null_count;
  end if;
end
$$;

alter table resumes
  alter column user_id set not null;

alter table resume_versions
  alter column resume_id set not null;

alter table resume_analyses
  alter column resume_version_id set not null;

alter table subscriptions
  alter column user_id set not null;

alter table subscriptions
  alter column stripe_subscription_id set not null;

alter table payments
  alter column user_id set not null;

alter table payments
  alter column stripe_payment_intent_id set not null;

alter table usage_logs
  alter column user_id set not null;

-- ================================
-- 2. Performance Indexes
-- ================================

create index if not exists idx_resumes_user_id
  on resumes(user_id);

create index if not exists idx_resume_versions_resume_id
  on resume_versions(resume_id);

create index if not exists idx_resume_analyses_resume_version_id
  on resume_analyses(resume_version_id);

create index if not exists idx_subscriptions_user_id
  on subscriptions(user_id);

create index if not exists idx_payments_user_id
  on payments(user_id);

create index if not exists idx_usage_logs_user_id
  on usage_logs(user_id);

create index if not exists idx_usage_logs_created_at
  on usage_logs(created_at);

-- ================================
-- 3. Resume Improvements
-- ================================

alter table resumes
  add column if not exists title text;

alter table resumes
  add column if not exists deleted_at timestamptz;

-- ================================
-- 4. Resume Version Improvements
-- ================================

alter table resume_versions
  add column if not exists is_current boolean default false;

create unique index if not exists one_current_version_per_resume
  on resume_versions(resume_id)
  where is_current = true;

-- ================================
-- 5. Resume Analysis Improvements
-- ================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    where t.typname = 'resume_analysis_status'
  ) then
    create type resume_analysis_status as enum ('pending', 'processing', 'completed', 'failed');
  end if;
end
$$;

alter table resume_analyses
  add column if not exists status resume_analysis_status default 'pending';

-- ================================
-- 6. Credit System
-- ================================

create table if not exists user_credits (
  user_id uuid primary key references profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table user_credits enable row level security;

-- Users can view their own credit balance
create policy "Users can view own credits"
  on user_credits
  for select
  using (auth.uid() = user_id);

-- IMPORTANT:
-- No insert/update/delete policy for user_credits.
-- Only backend (service role) can modify credits.

-- ================================
-- 7. Strengthen Subscriptions
-- ================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and conname = 'subscriptions_status_check'
  ) then
    alter table subscriptions
      add constraint subscriptions_status_check
      check (status in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid'));
  end if;
end
$$;

create unique index if not exists uniq_stripe_subscription
  on subscriptions(stripe_subscription_id);

-- Enable RLS
alter table subscriptions enable row level security;

-- Users can view their own subscription
create policy "Users can view own subscription"
  on subscriptions
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy (backend only)

-- ================================
-- 8. Strengthen Payments
-- ================================

create unique index if not exists uniq_payment_intent
  on payments(stripe_payment_intent_id);

-- Enable RLS
alter table payments enable row level security;

create policy "Users can view own payments"
  on payments
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy (backend only)

-- ================================
-- 9. Upgrade Usage Logs
-- ================================

alter table usage_logs
  add column if not exists resume_analysis_id uuid references resume_analyses(id) on delete set null;

alter table usage_logs
  add column if not exists input_tokens int check (input_tokens >= 0);

alter table usage_logs
  add column if not exists output_tokens int check (output_tokens >= 0);

-- Enable RLS
alter table usage_logs enable row level security;

create policy "Users can view own usage logs"
  on usage_logs
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy (backend only)

-- ================================
-- 10. Update Resume RLS (Soft Delete Protection)
-- ================================

drop policy if exists "Users can view own resumes" on resumes;

create policy "Users can view own resumes"
  on resumes
  for select
  using (auth.uid() = user_id AND deleted_at IS NULL);

-- =========================================
-- Migration Complete
-- =========================================
