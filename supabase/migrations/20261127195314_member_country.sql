-- Keep country in the protected member record, outside the public directory.
alter table public.member_preferences add column country text
  check (char_length(country) between 2 and 100 and country = btrim(country));

create or replace function private.save_profile(p_data jsonb, p_interests uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare
  member uuid := auth.uid();
  country_name text := btrim(p_data->>'country');
begin
  if member is null then raise exception 'AUTH_REQUIRED'; end if;
  perform private.enforce_member_limit('profile');
  if cardinality(p_interests) > 15 then raise exception 'TOO_MANY_INTERESTS'; end if;
  if char_length(p_data->>'display_name') < 2 or char_length(p_data->>'city') < 2 then
    raise exception 'INVALID_PROFILE';
  end if;
  -- Older clients may omit country during rollout. They must preserve saved values.
  if p_data ? 'country' and (
    jsonb_typeof(p_data->'country') <> 'string' or char_length(country_name) not between 2 and 100
  ) then raise exception 'INVALID_COUNTRY'; end if;

  update public.profiles set
    display_name = p_data->>'display_name',
    city = p_data->>'city',
    experience = p_data->>'experience',
    bio = coalesce(p_data->>'bio', ''),
    github_url = nullif(p_data->>'github_url', ''),
    linkedin_url = nullif(p_data->>'linkedin_url', ''),
    website = nullif(p_data->>'website', ''),
    public_profile = coalesce((p_data->>'public_profile')::boolean, false),
    onboarded = true
  where id = member;
  update public.member_preferences set
    updates = coalesce((p_data->>'updates')::boolean, false),
    country = coalesce(country_name, country)
  where member_id = member;
  delete from public.member_interests where member_id = member;
  insert into public.member_interests (member_id, interest_id)
  select member, unnest(p_interests) on conflict do nothing;
end $$;
