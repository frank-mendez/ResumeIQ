-- Fix storage RLS for resume uploads in the resumes bucket
-- Ensures authenticated users can only manage files under <auth.uid()>/...

create or replace function public.resume_storage_bucket_name()
returns text
language sql
immutable
as $$
  select 'resumes'::text;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  public.resume_storage_bucket_name(),
  public.resume_storage_bucket_name(),
  false,
  5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own resumes" on storage.objects;
drop policy if exists "Users can read own resumes" on storage.objects;
drop policy if exists "Users can update own resumes" on storage.objects;
drop policy if exists "Users can delete own resumes" on storage.objects;

create policy "Users can upload own resumes"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = public.resume_storage_bucket_name()
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can read own resumes"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = public.resume_storage_bucket_name()
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can update own resumes"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = public.resume_storage_bucket_name()
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = public.resume_storage_bucket_name()
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can delete own resumes"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = public.resume_storage_bucket_name()
    and split_part(name, '/', 1) = auth.uid()::text
  );
