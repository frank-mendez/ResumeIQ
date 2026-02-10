create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  original_filename text not null,
  file_type text not null check (file_type in ('pdf', 'docx')),
  storage_path text not null,
  created_at timestamptz default now()
);

create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade,
  parsed_text text not null,
  parsed_json jsonb not null,
  language text,
  created_at timestamptz default now()
);

create table resume_analyses (
  id uuid primary key default gen_random_uuid(),
  resume_version_id uuid references resume_versions(id) on delete cascade,
  model text not null,
  overall_score int check (overall_score between 0 and 100),
  analysis jsonb not null,
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  stripe_payment_intent_id text not null,
  amount integer not null,
  currency text not null,
  status text not null,
  created_at timestamptz default now()
);

create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  model text not null,
  tokens_used int not null,
  cost_usd numeric(10,4),
  created_at timestamptz default now()
);