-- PROPOSED ONLY. Phase 1 must be reviewed before executing Phase 2.
-- PHASE 1: run these read-only queries separately.
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (table_name ilike '%profile%' or table_name = 'entries')
order by table_name, ordinal_position;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename ilike '%profile%')
   or (schemaname = 'storage' and tablename = 'objects');

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets;

select n.nspname as schema_name, c.relname as table_name,
       t.tgname, pg_get_triggerdef(t.oid) as definition,
       pg_get_functiondef(t.tgfoid) as trigger_function
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal and n.nspname in ('public', 'auth', 'storage');

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid = 'public.entries'::regclass;

select p.proname, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('is_reviewer', 'review_entry');

-- Inspect all Storage policies for broad USING/WITH CHECK permissions.
-- Review existing ownership triggers and review_entry for owner assignments.
-- Reuse any equivalent profile system instead of creating another.
-- If owner has ON DELETE SET NULL, the ownership guard below also blocks
-- that change during account deletion. Reconcile that workflow before approval.

-- PHASE 2: execute only after reviewing Phase 1.
begin;

-- Stop before creation if existing objects need reconciliation.
-- A repeat run stops without creating duplicates or overwriting anything.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name ilike '%profile%'
  ) then
    raise exception 'Existing profile relation found. Inspect and reuse it; adapt migration first.';
  end if;
  if exists (
    select 1 from storage.buckets where id = 'avatars' or name = 'avatars'
  ) then
    raise exception 'Existing avatars bucket found. Inspect configuration before proceeding.';
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'archive_avatar_%'
  ) or to_regprocedure('public.preserve_entry_owner()') is not null
    or exists (
      select 1 from pg_trigger
      where tgrelid = 'public.entries'::regclass
        and tgname = 'preserve_entry_owner' and not tgisinternal
    ) then
    raise exception 'Existing migration policy/function/trigger found. Inspect before proceeding.';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'entries'
      and column_name = 'owner' and udt_name = 'uuid'
  ) then
    raise exception 'Expected public.entries.owner UUID column.';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'storage.objects'::regclass) then
    raise exception 'Storage objects RLS must already be enabled.';
  end if;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (
    display_name is null or
    (display_name = btrim(display_name) and char_length(display_name) between 1 and 80)
  ),
  avatar_path text check (
    avatar_path is null or avatar_path ~ (
      '^' || id::text ||
      '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp)$'
    )
  )
);

alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select (id, display_name, avatar_path) on public.profiles to anon, authenticated;
grant insert (id, display_name, avatar_path) on public.profiles to authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;

create policy archive_profile_read on public.profiles
  for select to anon, authenticated using (true);
create policy archive_profile_insert on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy archive_profile_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- CHECK ties the path to profile.id; RLS ties that ID to the caller.
-- App usage: supabase.storage.from('avatars').getPublicUrl(profile.avatar_path)
-- No emails, auth metadata, signup trigger, or backfill.
-- Profiles are optional: no entries-to-profiles FK or entry updates.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp']);

-- Restrictive policies AND with permissive policies, preventing existing broad
-- policies from granting cross-folder access to avatars through the Storage API.
-- Other buckets retain their existing permissions. Public downloads use the
-- public bucket endpoint; anonymous object listing/writes remain blocked.
create policy archive_avatar_guard on storage.objects
  as restrictive for all to public
  using (
    bucket_id <> 'avatars' or
    (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id <> 'avatars' or name ~ (
      '^' || (select auth.uid())::text ||
      '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp)$'
    )
  );

create policy archive_avatar_owner on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars' and
    (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' and name ~ (
      '^' || (select auth.uid())::text ||
      '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp)$'
    )
  );

-- Bucket limits enforce MIME types/size through Storage uploads.
-- App must also validate size, MIME type and image decoding before upload.
-- SQL does not inspect image bytes or guarantee a referenced object exists.

-- Existing edits omit owner. Status/review_note updates remain allowed.
-- AFTER UPDATE catches ownership changes made by BEFORE UPDATE triggers too.
-- Ownership changes roll back the statement, including privileged function
-- updates. Inserts/deletes are unchanged; legacy null owners remain null.
create function public.preserve_entry_owner()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.owner is distinct from old.owner then
    raise exception 'Entry ownership cannot be changed' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.preserve_entry_owner() from public, anon, authenticated;

create trigger preserve_entry_owner
  after update on public.entries
  for each row execute function public.preserve_entry_owner();

-- is_reviewer, review_entry, review_note and entries policies are unchanged.
commit;
