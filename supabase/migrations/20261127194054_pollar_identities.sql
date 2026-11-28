create table private.pollar_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  login_email text not null unique,
  verified_email text
);

create table private.pollar_identities (
  identity_key text primary key check (identity_key ~ '^[a-f0-9]{64}$'),
  account_id uuid not null references private.pollar_accounts(id) on delete cascade
);
create index pollar_identities_account_idx on private.pollar_identities(account_id);

alter table private.pollar_accounts enable row level security;
alter table private.pollar_identities enable row level security;
revoke all on private.pollar_accounts, private.pollar_identities from public, anon, authenticated, service_role;

create function private.resolve_pollar_account(p_keys text[], p_verified_email text)
returns table(account_id uuid, email text, user_id uuid)
language plpgsql security definer set search_path = '' as $$
declare
  identity_lock bigint;
  matched uuid[];
  account private.pollar_accounts;
begin
  if p_keys is null or cardinality(p_keys) not between 1 and 4
    or exists (select 1 from unnest(p_keys) as key where key is null or key !~ '^[a-f0-9]{64}$')
    or p_verified_email like '%@pollar.invalid'
  then
    raise exception 'INVALID_POLLAR_IDENTITY';
  end if;

  -- Serialize overlapping assertions, including simultaneous first logins.
  for identity_lock in
    select distinct pg_catalog.hashtextextended('pollar:' || key, 0)
    from unnest(p_keys) as key order by 1
  loop
    perform pg_catalog.pg_advisory_xact_lock(identity_lock);
  end loop;

  select array_agg(distinct i.account_id) into matched
  from private.pollar_identities i where i.identity_key = any(p_keys);
  if cardinality(matched) > 1 then
    raise exception 'POLLAR_ACCOUNT_CONFLICT';
  elsif cardinality(matched) = 1 then
    select a.* into strict account from private.pollar_accounts a where a.id = matched[1] for update;
    if p_verified_email is not null then
      -- Never move a proven address between existing member accounts automatically.
      if exists (
        select 1 from auth.users u
        where u.email = p_verified_email
          and u.email <> account.login_email
          and u.id is distinct from account.auth_user_id
      ) then
        raise exception 'POLLAR_ACCOUNT_CONFLICT';
      end if;
      update private.pollar_accounts a set verified_email = p_verified_email where a.id = account.id;
    end if;
  else
    insert into private.pollar_accounts (login_email, verified_email)
    values (coalesce(p_verified_email, gen_random_uuid()::text || '@pollar.invalid'), p_verified_email)
    returning * into account;
  end if;

  insert into private.pollar_identities (identity_key, account_id)
  select distinct key, account.id from unnest(p_keys) as key
  on conflict (identity_key) do nothing;

  return query
  select account.id,
    coalesce((select u.email::text from auth.users u where u.id = account.auth_user_id), account.login_email),
    account.auth_user_id;
end $$;

create function public.resolve_pollar_account(p_keys text[], p_verified_email text)
returns table(account_id uuid, email text, user_id uuid)
language sql security invoker set search_path = '' as $$
  select * from private.resolve_pollar_account(p_keys, p_verified_email);
$$;

create function private.bind_pollar_account(p_account_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update private.pollar_accounts a set auth_user_id = p_user_id
  where a.id = p_account_id
    and (a.auth_user_id = p_user_id or (
      a.auth_user_id is null and exists (
        select 1 from auth.users u where u.id = p_user_id and u.email = a.login_email
      )
    ));
  if not found then raise exception 'POLLAR_ACCOUNT_CONFLICT'; end if;
end $$;

create function public.bind_pollar_account(p_account_id uuid, p_user_id uuid)
returns void language sql security invoker set search_path = '' as $$
  select private.bind_pollar_account(p_account_id, p_user_id);
$$;

revoke all on function private.resolve_pollar_account(text[], text), public.resolve_pollar_account(text[], text),
  private.bind_pollar_account(uuid, uuid), public.bind_pollar_account(uuid, uuid)
from public, anon, authenticated;
grant execute on function private.resolve_pollar_account(text[], text), public.resolve_pollar_account(text[], text),
  private.bind_pollar_account(uuid, uuid), public.bind_pollar_account(uuid, uuid)
to service_role;

-- An internal login address is not a delivery address. A separately verified Pollar
-- email can receive event mail without changing the member's Supabase user or role.
create or replace function private.claim_email_batch()
returns table(id uuid, recipient text, kind text, payload jsonb)
language sql security definer set search_path = '' as $$
  with selected as (
    select o.id, contact.recipient
    from private.email_outbox o
    join auth.users u on u.id = o.recipient_id
    left join private.pollar_accounts a on a.auth_user_id = u.id
    cross join lateral (
      select case when u.email like '%@pollar.invalid' then a.verified_email
                  else u.email::text end as recipient
    ) contact
    where o.sent_at is null and (o.lease_until is null or o.lease_until < now())
      and o.attempts < 8 and nullif(contact.recipient, '') is not null
    order by o.created_at, o.id limit 25 for update of o skip locked
  )
  update private.email_outbox o
  set lease_until = now() + interval '5 minutes', attempts = attempts + 1
  from selected where o.id = selected.id
  returning o.id, selected.recipient, o.kind, o.payload;
$$;
