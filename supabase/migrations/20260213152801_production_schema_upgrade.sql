-- =========================================
-- ResumeIQ Production Upgrade Migration
-- =========================================

-- ================================
-- 1. Enforce NOT NULL Constraints
-- ================================

alter table resumes
  alter column user_id set not null;

alter table resume_versions
  alter column resume_id set not null;

alter table resume_analyses
  alter column resume_version_id set not null;

alter table subscriptions
  alter column user_id set not null;

alter table payments
  alter column user_id set not null;

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

alter table resume_analyses
  add column if not exists status text default 'pending'
  check (status in ('pending','processing','completed','failed'));

-- ================================
-- 6. Credit System
-- ================================

create table if not exists user_credits (
  user_id uuid primary key references profiles(id) on delete cascade,
  balance integer not null default 0,
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

alter table subscriptions
  add constraint subscriptions_status_check
  check (status in ('trialing','active','past_due','canceled','incomplete'));

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
  add column if not exists input_tokens int;

alter table usage_logs
  add column if not exists output_tokens int;

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
