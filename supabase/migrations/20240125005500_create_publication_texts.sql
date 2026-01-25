-- Create a separate table for heavy text content
create table public.publication_texts (
  publication_id uuid not null references public.publications(id) on delete cascade,
  full_text text,
  primary key (publication_id)
);

-- RLS Policies (Inherit from parent logic essentially)
alter table public.publication_texts enable row level security;

-- Admins can do everything
create policy "Admins can do everything on publication_texts"
  on public.publication_texts for all
  using ( 
    auth.uid() in (
      select id from public.users where role = 'admin'
    )
  );

-- Authors can view/edit their own texts
create policy "Authors can view own publication texts"
  on public.publication_texts for select
  using (
    exists (
      select 1 from public.publications
      where id = publication_texts.publication_id
      and user_id = auth.uid()
    )
  );

create policy "Authors can update own publication texts"
  on public.publication_texts for update
  using (
    exists (
      select 1 from public.publications
      where id = publication_texts.publication_id
      and user_id = auth.uid()
    )
  );

create policy "Authors can insert own publication texts"
  on public.publication_texts for insert
  with check (
    exists (
      select 1 from public.publications
      where id = publication_texts.publication_id
      and user_id = auth.uid()
    )
  );
