-- ============================================================
--  002 - row level security for reading, editing, deleting
--  REVIEW THIS SEPARATELY. Nothing else in this file changes
--  the schema, and nothing else in the app requires it.
-- ============================================================
--
-- Why this exists
-- ---------------
-- The edit and delete buttons on an entry page are hidden from anyone who is
-- not the owner, but a hidden button is a courtesy, not a security control. Both
-- the update and the delete run from the browser, so without these policies any
-- signed-in user could edit or remove any row just by changing the request.
--
-- READ FIRST: policies do nothing on their own. They only take effect once row
-- level security is ENABLED on the table, and the last statement here is what
-- enables it. Check the current state before you run anything:
--
--   select relrowsecurity from pg_class where relname = 'entries';
--
-- If it is already true, some other policy setup may exist -- read them first:
--
--   select policyname, cmd, qual from pg_policies where tablename = 'entries';
--
-- THE TRAP: once RLS is on, EVERY operation needs a policy, including SELECT.
-- Enable RLS with only the update and delete policies below and the public
-- archive returns no rows, the home page goes blank, and /my-archive is empty.
-- That is why the SELECT policy comes first here.
--
-- How to apply
-- ------------
-- Supabase dashboard -> SQL Editor -> paste -> run. Or, with the CLI:
--   supabase db execute --file db/002_entries_owner_policies.sql
--
-- Safe to run more than once: each policy is dropped first.
--
-- Requires that entries.owner exists and holds the auth.users id, which is what
-- components/ContributionForm.js writes (owner comes from the session, never
-- from the form).
--
-- Note, deliberately NOT included here: this file does not touch the signup
-- trigger on auth.users. "Database error saving new user" on /signup is a
-- separate problem in a separate place, and should be fixed on its own.

-- ── SELECT ──────────────────────────────────────────────────────────────
-- The archive is meant to be browsable by everyone, including visitors who are
-- not signed in, so this matches how the site already behaves. It is included
-- so that enabling RLS below does not lock the public site out of its own data.
drop policy if exists "anyone can read entries" on entries;
create policy "anyone can read entries"
  on entries
  for select
  using (true);

-- ── UPDATE ──────────────────────────────────────────────────────────────
-- WITH CHECK is what stops an owner reassigning the row to someone else in the
-- same request: the row must still belong to the caller afterwards.
drop policy if exists "owners can update own entries" on entries;
create policy "owners can update own entries"
  on entries
  for update
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- ── DELETE ──────────────────────────────────────────────────────────────
drop policy if exists "owners can delete own entries" on entries;
create policy "owners can delete own entries"
  on entries
  for delete
  using (owner = auth.uid());

-- ── ENABLE ──────────────────────────────────────────────────────────────
-- Without this line none of the three policies above do anything.
alter table entries enable row level security;

-- ── INSERT ──────────────────────────────────────────────────────────────
-- New entries set owner from the session, so a contributor may only write rows
-- that belong to them. Included before you run the above with the intention of
-- actually saving from /contribute.
drop policy if exists "owners can add their own entries" on entries;
create policy "owners can add their own entries"
  on entries
  for insert
  with check (owner = auth.uid());

-- ── Verifying ───────────────────────────────────────────────────────────
-- After running this, sign in as a contributor and confirm that editing or
-- deleting somebody else's entry returns no rows rather than succeeding. That
-- empty result is exactly what the app reports as "That change wasn't saved".
--
-- Also confirm the home page still lists records: that is the SELECT policy
-- doing its job.