alter table resumes enable row level security;
alter table resume_versions enable row level security;
alter table resume_analyses enable row level security;

create policy "Users can view own resumes"
  on resumes
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on resumes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on resumes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on resumes
  for delete
  using (auth.uid() = user_id);

create policy "Users can view own resume versions"
  on resume_versions
  for select
  using (
    exists (
      select 1
      from resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can insert own resume versions"
  on resume_versions
  for insert
  with check (
    exists (
      select 1
      from resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can update own resume versions"
  on resume_versions
  for update
  using (
    exists (
      select 1
      from resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can delete own resume versions"
  on resume_versions
  for delete
  using (
    exists (
      select 1
      from resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can view own resume analyses"
  on resume_analyses
  for select
  using (
    exists (
      select 1
      from resume_versions
      join resumes on resumes.id = resume_versions.resume_id
      where resume_versions.id = resume_analyses.resume_version_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can insert own resume analyses"
  on resume_analyses
  for insert
  with check (
    exists (
      select 1
      from resume_versions
      join resumes on resumes.id = resume_versions.resume_id
      where resume_versions.id = resume_analyses.resume_version_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can update own resume analyses"
  on resume_analyses
  for update
  using (
    exists (
      select 1
      from resume_versions
      join resumes on resumes.id = resume_versions.resume_id
      where resume_versions.id = resume_analyses.resume_version_id
        and resumes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from resume_versions
      join resumes on resumes.id = resume_versions.resume_id
      where resume_versions.id = resume_analyses.resume_version_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can delete own resume analyses"
  on resume_analyses
  for delete
  using (
    exists (
      select 1
      from resume_versions
      join resumes on resumes.id = resume_versions.resume_id
      where resume_versions.id = resume_analyses.resume_version_id
        and resumes.user_id = auth.uid()
    )
  );
