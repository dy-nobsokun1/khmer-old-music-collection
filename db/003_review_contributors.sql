-- Run in Supabase SQL Editor before using contributor details on /review.
-- Only reviewers can read identity details, and only for pending entries.
create or replace function public.review_contributors()
returns table (entry_id text, display_name text, email text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_reviewer() is distinct from true then
    raise exception 'Reviewer access required' using errcode = '42501';
  end if;

  return query
    select e.id::text,
      coalesce(
        nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(u.raw_user_meta_data ->> 'name'), '')
      ),
      u.email::text
    from public.entries e
    join auth.users u on u.id = e.owner
    where e.status = 'pending';
end;
$$;

revoke all on function public.review_contributors() from public, anon;
grant execute on function public.review_contributors() to authenticated;
