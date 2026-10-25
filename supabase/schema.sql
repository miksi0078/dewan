-- =====================================================================
--  DEWAN (دیوان) — Pashto Poetry Platform — Supabase database schema
--  Paste this WHOLE file into Supabase > SQL Editor > New query > Run.
--  It is safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ADMIN LIST + helper function
--    Only people listed in admin_users can change anything.
--    Nobody can read this table through the public API (no policies).
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. POETS   (_ps = Pashto script, _pr = Roman Pashto, _en = English)
-- ---------------------------------------------------------------------
create table if not exists public.poets (
  id         uuid primary key default gen_random_uuid(),
  name_ps    text,
  name_pr    text,
  name_en    text,
  born       text,
  died       text,
  bio_ps     text,
  bio_pr     text,
  bio_en     text,
  photo_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poets_has_name check (
    coalesce(name_ps,'') <> '' or coalesce(name_pr,'') <> '' or coalesce(name_en,'') <> ''
  )
);
drop trigger if exists poets_touch on public.poets;
create trigger poets_touch before update on public.poets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 4. POETRY
-- ---------------------------------------------------------------------
create table if not exists public.poetry (
  id         uuid primary key default gen_random_uuid(),
  poet_id    uuid not null references public.poets(id) on delete restrict,
  category   text not null default 'ghazal'
             check (category in ('ghazal','nazam','tappa','rubai','charbeta','landay','marsia','naat','other')),
  title_ps   text,
  title_pr   text,
  title_en   text,
  text_ps    text,
  text_pr    text,
  text_en    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poetry_has_title check (
    coalesce(title_ps,'') <> '' or coalesce(title_pr,'') <> '' or coalesce(title_en,'') <> ''
  ),
  constraint poetry_has_text check (
    coalesce(text_ps,'') <> '' or coalesce(text_pr,'') <> '' or coalesce(text_en,'') <> ''
  )
);
create index if not exists poetry_poet_idx     on public.poetry(poet_id);
create index if not exists poetry_category_idx on public.poetry(category);
create index if not exists poetry_created_idx  on public.poetry(created_at desc);
drop trigger if exists poetry_touch on public.poetry;
create trigger poetry_touch before update on public.poetry
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 5. COUPLETS (used for "Couplet of the Day")
-- ---------------------------------------------------------------------
create table if not exists public.couplets (
  id         uuid primary key default gen_random_uuid(),
  poet_id    uuid references public.poets(id)  on delete set null,
  poetry_id  uuid references public.poetry(id) on delete set null,
  text_ps    text,
  text_pr    text,
  text_en    text,
  created_at timestamptz not null default now(),
  constraint couplets_has_text check (
    coalesce(text_ps,'') <> '' or coalesce(text_pr,'') <> '' or coalesce(text_en,'') <> ''
  )
);

-- ---------------------------------------------------------------------
-- 6. MEDIA (audio, image poetry, video links, PDF books)
-- ---------------------------------------------------------------------
create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  poet_id      uuid references public.poets(id)  on delete cascade,
  poetry_id    uuid references public.poetry(id) on delete cascade,
  kind         text not null check (kind in ('audio','image','video','pdf')),
  title        text,
  url          text not null,
  storage_path text,
  created_at   timestamptz not null default now(),
  constraint media_has_owner check (poet_id is not null or poetry_id is not null)
);
create index if not exists media_poet_idx   on public.media(poet_id);
create index if not exists media_poetry_idx on public.media(poetry_id);

-- ---------------------------------------------------------------------
-- 7. SETTINGS (key/value). is_public = false keeps a value private
--    (for example the feedback email address).
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      text,
  is_public  boolean not null default true,
  updated_at timestamptz not null default now()
);
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

insert into public.settings (key, value, is_public) values
  ('dev_name_ps',        '', true),
  ('dev_name_pr',        '', true),
  ('dev_name_en',        '', true),
  ('dev_bio_ps',         '', true),
  ('dev_bio_pr',         '', true),
  ('dev_bio_en',         '', true),
  ('dev_photo_url',      '', true),
  ('couplet_override_id','', true),
  ('featured_poet_id',   '', true),
  ('feedback_email',     '', false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 8. FEEDBACK (written only by the server; readable only by admins)
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text not null check (char_length(message) between 1 and 5000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY — this is what keeps your data safe
-- ---------------------------------------------------------------------
alter table public.poets     enable row level security;
alter table public.poetry    enable row level security;
alter table public.couplets  enable row level security;
alter table public.media     enable row level security;
alter table public.settings  enable row level security;
alter table public.feedback  enable row level security;

-- Public can READ poets / poetry / couplets / media
do $$
declare t text;
begin
  foreach t in array array['poets','poetry','couplets','media'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Settings: public rows are readable by everyone, private rows only by admins
drop policy if exists "settings read"   on public.settings;
create policy "settings read"   on public.settings for select using (is_public or public.is_admin());
drop policy if exists "settings insert" on public.settings;
create policy "settings insert" on public.settings for insert to authenticated with check (public.is_admin());
drop policy if exists "settings update" on public.settings;
create policy "settings update" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "settings delete" on public.settings;
create policy "settings delete" on public.settings for delete to authenticated using (public.is_admin());

-- Feedback: admins only (the website's server inserts with its secret key)
drop policy if exists "feedback admin read"   on public.feedback;
create policy "feedback admin read"   on public.feedback for select to authenticated using (public.is_admin());
drop policy if exists "feedback admin update" on public.feedback;
create policy "feedback admin update" on public.feedback for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "feedback admin delete" on public.feedback;
create policy "feedback admin delete" on public.feedback for delete to authenticated using (public.is_admin());

-- Table permissions (RLS above still decides who can do what)
grant usage on schema public to anon, authenticated;
grant select on public.poets, public.poetry, public.couplets, public.media, public.settings to anon, authenticated;
grant insert, update, delete on public.poets, public.poetry, public.couplets, public.media, public.settings to authenticated;
grant select, update, delete on public.feedback to authenticated;

-- ---------------------------------------------------------------------
-- 10. FILE STORAGE — one public bucket called "media"
--     (pictures, audio, PDFs). Only admins may upload or delete.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif',
        'audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','audio/aac','audio/ogg','audio/wav','audio/x-wav','audio/webm',
        'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin select" on storage.objects;
create policy "media admin select" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
--  DONE. Next step: create your admin user (see README, Part 3),
--  then run the one-line "make me admin" query from the README.
-- =====================================================================
