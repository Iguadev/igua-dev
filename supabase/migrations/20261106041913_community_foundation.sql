-- All privileged implementation lives outside the exposed API schema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (char_length(display_name)<=80),
 city text not null default '' check (char_length(city)<=100),
 experience text not null default 'starting' check(experience in ('starting','student','junior','mid','senior')),
 bio text not null default '' check(char_length(bio)<=500),
 github_url text, linkedin_url text, website text, avatar_path text,
 public_profile boolean not null default false, onboarded boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(github_url is null or github_url ~ '^https://github.com/'),
 check(linkedin_url is null or linkedin_url ~ '^https?://'), check(website is null or website ~ '^https?://'),
 check(avatar_path is null or avatar_path like id::text || '/%')
);
create table public.member_preferences (member_id uuid primary key references public.profiles on delete cascade, updates boolean not null default false, deletion_requested_at timestamptz, updated_at timestamptz not null default now());
create table public.interests (id uuid primary key default gen_random_uuid(), name text not null unique);
create table public.member_interests (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.profiles on delete cascade, interest_id uuid not null references public.interests on delete cascade, unique(member_id,interest_id));
create table public.member_roles (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.profiles on delete cascade, role text not null check(role in ('member','contributor','organizer','admin')), unique(member_id,role));
create table public.venues (id uuid primary key default gen_random_uuid(), name text not null, address text not null, map_url text check(map_url is null or map_url ~ '^https://'), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.programs (id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), title text not null, description text not null, accent text not null default 'green' check(accent in ('green','purple','blue','orange')), status text not null default 'draft' check(status in ('draft','planned','active','archived')), sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.events (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), title text not null check(char_length(title) between 3 and 150), description text not null,
 category text not null, cover_path text, organizer_id uuid references public.profiles on delete set null,
 starts_at timestamptz not null, ends_at timestamptz not null, time_zone text not null default 'America/Argentina/Buenos_Aires',
 venue_id uuid references public.venues on delete set null, capacity integer not null check(capacity between 1 and 10000),
 registration_opens_at timestamptz, registration_closes_at timestamptz,
 status text not null default 'draft' check(status in ('draft','published','completed','cancelled')),
 registration_status text not null default 'closed' check(registration_status in ('open','closed')),
 resources jsonb not null default '[]', recap text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at > starts_at), check(registration_closes_at is null or registration_closes_at <= starts_at), check(registration_opens_at is null or registration_closes_at is null or registration_opens_at < registration_closes_at)
);
create table public.event_speakers (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events on delete cascade, display_name text not null, bio text, website text check(website is null or website ~ '^https?://'));
create table public.program_events (id uuid primary key default gen_random_uuid(), program_id uuid not null references public.programs on delete cascade, event_id uuid not null references public.events on delete cascade, unique(program_id,event_id));
create table public.event_registrations (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events on delete cascade, member_id uuid not null references public.profiles on delete cascade, status text not null check(status in ('confirmed','waitlisted','cancelled')), attended_at timestamptz, checkin_token uuid not null default gen_random_uuid() unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(event_id,member_id));
create table public.projects (id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), owner_id uuid not null references public.profiles on delete cascade, title text not null check(char_length(title) between 3 and 100), description text not null check(char_length(description) between 30 and 5000), github_url text, demo_url text, cover_path text, visibility text not null default 'private' check(visibility in ('private','public')), status text not null default 'pending' check(status in ('draft','pending','published','rejected')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(github_url is null or github_url ~ '^https?://'), check(demo_url is null or demo_url ~ '^https?://'));
create table public.project_members (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects on delete cascade, member_id uuid not null references public.profiles on delete cascade, unique(project_id,member_id));
create table public.project_technologies (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects on delete cascade, name text not null check(char_length(name) between 1 and 40), unique(project_id,name));
create table public.partners (id uuid primary key default gen_random_uuid(), name text not null, website text check(website is null or website ~ '^https?://'), logo_path text, category text not null, approved boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.partnership_inquiries (id uuid primary key default gen_random_uuid(), name text not null, email text not null, organization text not null, category text not null check(category in ('technology','education','community','event','venue')), message text not null check(char_length(message) between 20 and 3000), consent boolean not null check(consent), status text not null default 'new' check(status in ('new','contacted','closed')), created_at timestamptz not null default now());
create table public.content_pages (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, body text not null, published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles on delete set null, action text not null, table_name text not null, record_id uuid, details jsonb not null default '{}', created_at timestamptz not null default now());
create table private.rate_limits (key text primary key, hits integer not null, resets_at timestamptz not null);
create table private.email_outbox (id uuid primary key default gen_random_uuid(), registration_id uuid references public.event_registrations on delete cascade, kind text not null, recipient_id uuid references auth.users on delete cascade, payload jsonb not null, attempts integer not null default 0, lease_until timestamptz, sent_at timestamptz, created_at timestamptz not null default now());

create index events_public_dates on public.events(status,starts_at);
create index registrations_capacity on public.event_registrations(event_id,status,created_at,id);
create index registrations_member on public.event_registrations(member_id);
create index member_interests_interest on public.member_interests(interest_id);
create index member_roles_member on public.member_roles(member_id);
create index project_owner on public.projects(owner_id);
create index project_public on public.projects(status,visibility,created_at desc);
create index project_members_member on public.project_members(member_id);
create index program_events_event on public.program_events(event_id);
create index programs_order on public.programs(status,sort_order);
create index event_speakers_event on public.event_speakers(event_id);
create index events_venue on public.events(venue_id);
create index events_organizer on public.events(organizer_id);
create index audit_actor on public.audit_logs(actor_id);
create index audit_date on public.audit_logs(created_at desc);
create index inquiry_status on public.partnership_inquiries(status,created_at desc);
create index outbox_ready on private.email_outbox(sent_at,lease_until,created_at);

create function private.has_role(roles text[]) returns boolean language sql stable security definer set search_path='' as $$ select auth.uid() is not null and exists(select 1 from public.member_roles where member_id=auth.uid() and role=any(roles)) $$;
create function private.is_staff() returns boolean language sql stable security invoker set search_path='' as $$ select private.has_role(array['admin','organizer']) $$;
create function private.is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select private.has_role(array['admin']) $$;
create function private.touch_updated() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create function private.new_member() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.profiles(id) values(new.id);
 insert into public.member_roles(member_id,role) values(new.id,'member');
 insert into public.member_preferences(member_id) values(new.id);
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.new_member();
create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
declare row_data jsonb;
begin
 row_data=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 -- Store only identifiers/status/role, never inquiry messages, emails or profile data.
 insert into public.audit_logs(actor_id,action,table_name,record_id,details) values(auth.uid(),tg_op,tg_table_name,(row_data->>'id')::uuid,jsonb_strip_nulls(jsonb_build_object('status',row_data->>'status','role',row_data->>'role','member_id',row_data->>'member_id')));
 if tg_op='DELETE' then return old; end if; return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['profiles','member_preferences','venues','programs','events','event_registrations','projects','partners','content_pages'] loop execute format('create trigger touch_updated before update on public.%I for each row execute function private.touch_updated()',t); end loop;
 foreach t in array array['events','member_roles','partners','programs','content_pages','projects','partnership_inquiries'] loop execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_change()',t); end loop;
 foreach t in array array['profiles','member_preferences','interests','member_interests','member_roles','venues','programs','events','event_speakers','program_events','event_registrations','projects','project_members','project_technologies','partners','partnership_inquiries','content_pages','audit_logs'] loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;
alter table private.rate_limits enable row level security;
alter table private.email_outbox enable row level security;

-- Deliberate table grants. Sensitive mutations go through checked transaction functions.
grant select on public.profiles,public.interests,public.venues,public.programs,public.events,public.event_speakers,public.program_events,public.projects,public.project_members,public.project_technologies,public.partners,public.content_pages to anon,authenticated;
grant select on public.member_preferences,public.member_interests,public.member_roles,public.event_registrations,public.audit_logs,public.partnership_inquiries to authenticated;
grant insert,update,delete on public.events,public.event_speakers,public.venues,public.programs,public.program_events to authenticated;
grant insert,update,delete on public.partners,public.content_pages to authenticated;
grant update on public.partnership_inquiries to authenticated;
create policy profile_read on public.profiles for select to anon,authenticated using(public_profile or id=(select auth.uid()) or (select private.is_staff()));
create policy preferences_read on public.member_preferences for select to authenticated using(member_id=(select auth.uid()) or (select private.is_admin()));
create policy interests_read on public.interests for select to anon,authenticated using(true);
create policy member_interests_read on public.member_interests for select to authenticated using(member_id=(select auth.uid()));
create policy roles_read on public.member_roles for select to authenticated using(member_id=(select auth.uid()) or (select private.is_admin()));
create policy event_read on public.events for select to anon,authenticated using(status<>'draft' or (select private.is_staff()));
create policy event_write on public.events for all to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy venues_read on public.venues for select to anon,authenticated using((select private.is_staff()) or exists(select 1 from public.events e where e.venue_id=public.venues.id and e.status<>'draft'));
create policy venues_write on public.venues for all to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy programs_read on public.programs for select to anon,authenticated using(status<>'draft' or (select private.is_staff()));
create policy programs_write on public.programs for all to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy speakers_read on public.event_speakers for select to anon,authenticated using(exists(select 1 from public.events e where e.id=event_id));
create policy speakers_write on public.event_speakers for all to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy program_events_read on public.program_events for select to anon,authenticated using(exists(select 1 from public.events e where e.id=event_id) and exists(select 1 from public.programs p where p.id=program_id));
create policy program_events_write on public.program_events for all to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy registration_read on public.event_registrations for select to authenticated using(member_id=(select auth.uid()) or (select private.is_staff()));
create policy projects_read on public.projects for select to anon,authenticated using((visibility='public' and status='published') or owner_id=(select auth.uid()) or (select private.is_admin()));
create policy project_members_read on public.project_members for select to anon,authenticated using(exists(select 1 from public.projects p where p.id=project_id));
create policy technologies_read on public.project_technologies for select to anon,authenticated using(exists(select 1 from public.projects p where p.id=project_id));
create policy partners_read on public.partners for select to anon,authenticated using(approved or (select private.is_admin()));
create policy partners_write on public.partners for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy inquiry_read on public.partnership_inquiries for select to authenticated using((select private.is_admin()));
create policy inquiry_update on public.partnership_inquiries for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy content_read on public.content_pages for select to anon,authenticated using(published or (select private.is_admin()));
create policy content_write on public.content_pages for all to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy audit_read on public.audit_logs for select to authenticated using((select private.is_admin()));

-- Capacity changes lock the same row as registration. Prevent reducing below commitments.
create function private.check_capacity() returns trigger language plpgsql set search_path='' as $$ begin
 if new.capacity < (select count(*) from public.event_registrations where event_id=new.id and status='confirmed') then raise exception 'CAPACITY_BELOW_CONFIRMED'; end if; return new;
end $$;
create trigger capacity_guard before update of capacity on public.events for each row execute function private.check_capacity();

-- Also throttle direct PostgREST RPC calls; server-action limits alone are bypassable.
create function private.enforce_member_limit(p_scope text) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if not private.consume_rate_limit('member:'||auth.uid()::text||':'||p_scope,30,600) then raise exception 'RATE_LIMITED'; end if;
end $$;

create function private.register_event(p_event uuid) returns text language plpgsql security definer set search_path='' as $$
declare e public.events; existing public.event_registrations; result text; registration uuid; occupied integer;
begin
 perform private.enforce_member_limit('write');
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and onboarded) then raise exception 'ONBOARDING_REQUIRED'; end if;
 select * into e from public.events where id=p_event for update;
 if not found or e.status<>'published' or e.registration_status<>'open' or now()>=e.starts_at or (e.registration_opens_at is not null and now()<e.registration_opens_at) or (e.registration_closes_at is not null and now()>=e.registration_closes_at) then raise exception 'REGISTRATION_CLOSED'; end if;
 select * into existing from public.event_registrations where event_id=p_event and member_id=auth.uid();
 if existing.id is not null and existing.status<>'cancelled' then return existing.status; end if;
 select count(*) into occupied from public.event_registrations where event_id=p_event and status='confirmed';
 result=case when occupied < e.capacity then 'confirmed' else 'waitlisted' end;
 insert into public.event_registrations(event_id,member_id,status) values(p_event,auth.uid(),result)
 on conflict(event_id,member_id) do update set status=excluded.status,created_at=clock_timestamp(),attended_at=null returning id into registration;
 insert into private.email_outbox(registration_id,kind,recipient_id,payload) values(registration,result,auth.uid(),jsonb_build_object('title',e.title,'slug',e.slug,'starts_at',e.starts_at,'time_zone',e.time_zone));
 return result;
end $$;
create function public.register_event(p_event uuid) returns text language sql security invoker set search_path='' as $$ select private.register_event(p_event) $$;

create function private.cancel_registration(p_event uuid) returns void language plpgsql security definer set search_path='' as $$
declare e public.events; r public.event_registrations; next_r public.event_registrations;
begin
 perform private.enforce_member_limit('write');
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into e from public.events where id=p_event for update;
 if not found or now()>=e.starts_at or e.status='completed' then raise exception 'CANCELLATION_CLOSED'; end if;
 select * into r from public.event_registrations where event_id=p_event and member_id=auth.uid();
 if r.id is null or r.status='cancelled' then return; end if;
 update public.event_registrations set status='cancelled',attended_at=null where id=r.id;
 insert into private.email_outbox(registration_id,kind,recipient_id,payload) values(r.id,'cancelled',r.member_id,jsonb_build_object('title',e.title,'slug',e.slug,'starts_at',e.starts_at,'time_zone',e.time_zone));
 if r.status='confirmed' and e.status='published' then
 select * into next_r from public.event_registrations where event_id=p_event and status='waitlisted' order by created_at,id limit 1 for update;
 if next_r.id is not null then
 update public.event_registrations set status='confirmed' where id=next_r.id;
 insert into private.email_outbox(registration_id,kind,recipient_id,payload) values(next_r.id,'promoted',next_r.member_id,jsonb_build_object('title',e.title,'slug',e.slug,'starts_at',e.starts_at,'time_zone',e.time_zone));
 end if; end if;
end $$;
create function public.cancel_registration(p_event uuid) returns void language sql security invoker set search_path='' as $$ select private.cancel_registration(p_event) $$;

create function private.save_profile(p_data jsonb,p_interests uuid[]) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 perform private.enforce_member_limit('profile');
 if cardinality(p_interests)>15 then raise exception 'TOO_MANY_INTERESTS'; end if;
 if char_length(p_data->>'display_name')<2 or char_length(p_data->>'city')<2 then raise exception 'INVALID_PROFILE'; end if;
 update public.profiles set display_name=p_data->>'display_name',city=p_data->>'city',experience=p_data->>'experience',bio=coalesce(p_data->>'bio',''),github_url=nullif(p_data->>'github_url',''),linkedin_url=nullif(p_data->>'linkedin_url',''),website=nullif(p_data->>'website',''),public_profile=coalesce((p_data->>'public_profile')::boolean,false),onboarded=true where id=auth.uid();
 update public.member_preferences set updates=coalesce((p_data->>'updates')::boolean,false) where member_id=auth.uid();
 delete from public.member_interests where member_id=auth.uid();
 insert into public.member_interests(member_id,interest_id) select auth.uid(),unnest(p_interests) on conflict do nothing;
end $$;
create function public.save_profile(p_data jsonb,p_interests uuid[]) returns void language sql security invoker set search_path='' as $$ select private.save_profile(p_data,p_interests) $$;

create function private.save_project(p_id uuid,p_data jsonb,p_technologies text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; begin
 perform private.enforce_member_limit('write');
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and onboarded) then raise exception 'ONBOARDING_REQUIRED'; end if;
 if cardinality(p_technologies)>15 then raise exception 'TOO_MANY_TECHNOLOGIES'; end if;
 if p_id is null then
 insert into public.projects(owner_id,slug,title,description,github_url,demo_url,visibility,status) values(auth.uid(),p_data->>'slug',p_data->>'title',p_data->>'description',nullif(p_data->>'github_url',''),nullif(p_data->>'demo_url',''),p_data->>'visibility','pending') returning id into result;
 else
 update public.projects set title=p_data->>'title',description=p_data->>'description',github_url=nullif(p_data->>'github_url',''),demo_url=nullif(p_data->>'demo_url',''),visibility=p_data->>'visibility',status='pending' where id=p_id and owner_id=auth.uid() returning id into result;
 if result is null then raise exception 'NOT_OWNER'; end if;
 end if;
 delete from public.project_technologies where project_id=result;
 insert into public.project_technologies(project_id,name) select result,unnest(p_technologies) on conflict do nothing;
 return result;
end $$;
create function public.save_project(p_id uuid,p_data jsonb,p_technologies text[]) returns uuid language sql security invoker set search_path='' as $$ select private.save_project(p_id,p_data,p_technologies) $$;

create function private.moderate_project(p_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.is_admin() or p_status not in ('published','rejected') then raise exception 'FORBIDDEN'; end if;
 update public.projects set status=p_status where id=p_id;
end $$;
create function public.moderate_project(p_id uuid,p_status text) returns void language sql security invoker set search_path='' as $$ select private.moderate_project(p_id,p_status) $$;
create function private.set_role(p_member uuid,p_role text) returns void language plpgsql security definer set search_path='' as $$ begin
 -- Serialize role changes and forbid removing your own administrative access.
 perform pg_advisory_xact_lock(7243981);
 if not private.is_admin() or p_role not in ('member','contributor','organizer','admin') then raise exception 'FORBIDDEN'; end if;
 if p_member=auth.uid() and p_role<>'admin' then raise exception 'SELF_DEMOTION_DISABLED'; end if;
 delete from public.member_roles where member_id=p_member;
 insert into public.member_roles(member_id,role) values(p_member,p_role);
end $$;
create function public.set_member_role(p_member uuid,p_role text) returns void language sql security invoker set search_path='' as $$ select private.set_role(p_member,p_role) $$;
create function private.mark_attendance(p_registration uuid,p_attended boolean) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.is_staff() then raise exception 'FORBIDDEN'; end if;
 update public.event_registrations set attended_at=case when p_attended then now() else null end where id=p_registration and status='confirmed';
 insert into public.audit_logs(actor_id,action,table_name,record_id) values(auth.uid(),'ATTENDANCE','event_registrations',p_registration);
end $$;
create function public.mark_attendance(p_registration uuid,p_attended boolean) returns void language sql security invoker set search_path='' as $$ select private.mark_attendance(p_registration,p_attended) $$;
create function private.request_deletion() returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 update public.member_preferences set deletion_requested_at=now() where member_id=auth.uid();
 update public.profiles set public_profile=false where id=auth.uid();
end $$;
create function public.request_deletion() returns void language sql security invoker set search_path='' as $$ select private.request_deletion() $$;

-- Persistent anonymous throttle, callable only by server secret role. Client cannot reset it.
create function private.consume_rate_limit(p_key text,p_limit integer,p_window integer) returns boolean language plpgsql security definer set search_path='' as $$ declare n integer; begin
 if p_limit<1 or p_window<1 then raise exception 'INVALID_LIMIT'; end if;
 insert into private.rate_limits(key,hits,resets_at) values(p_key,1,now()+make_interval(secs=>p_window)) on conflict(key) do update set hits=case when private.rate_limits.resets_at<=now() then 1 else private.rate_limits.hits+1 end,resets_at=case when private.rate_limits.resets_at<=now() then now()+make_interval(secs=>p_window) else private.rate_limits.resets_at end returning hits into n;
 delete from private.rate_limits where resets_at<now()-interval '1 day';
 return n<=p_limit;
end $$;
create function public.consume_rate_limit(p_key text,p_limit integer,p_window integer) returns boolean language sql security invoker set search_path='' as $$ select private.consume_rate_limit(p_key,p_limit,p_window) $$;
create function private.submit_inquiry(p_data jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 insert into public.partnership_inquiries(name,email,organization,category,message,consent) values(p_data->>'name',p_data->>'email',p_data->>'organization',p_data->>'category',p_data->>'message',(p_data->>'consent')::boolean);
end $$;
create function public.submit_inquiry(p_data jsonb) returns void language sql security invoker set search_path='' as $$ select private.submit_inquiry(p_data) $$;
create function private.claim_email_batch() returns table(id uuid,recipient text,kind text,payload jsonb) language plpgsql security definer set search_path='' as $$ begin
 return query with selected as (select o.id from private.email_outbox o where o.sent_at is null and (o.lease_until is null or o.lease_until<now()) and o.attempts<8 order by o.created_at limit 25 for update skip locked), claimed as (update private.email_outbox o set lease_until=now()+interval '5 minutes',attempts=attempts+1 from selected s where o.id=s.id returning o.*) select c.id,u.email::text,c.kind,c.payload from claimed c join auth.users u on u.id=c.recipient_id;
end $$;
create function public.claim_email_batch() returns table(id uuid,recipient text,kind text,payload jsonb) language sql security invoker set search_path='' as $$ select * from private.claim_email_batch() $$;
create function private.ack_email(p_id uuid) returns void language sql security definer set search_path='' as $$ update private.email_outbox set sent_at=now(),lease_until=null where id=p_id $$;
create function public.ack_email(p_id uuid) returns void language sql security invoker set search_path='' as $$ select private.ack_email(p_id) $$;

-- Close PostgreSQL's default PUBLIC function execution grants, then whitelist.
revoke all on all functions in schema private from public,anon,authenticated;
revoke all on function public.register_event(uuid),public.cancel_registration(uuid),public.save_profile(jsonb,uuid[]),public.save_project(uuid,jsonb,text[]),public.moderate_project(uuid,text),public.set_member_role(uuid,text),public.mark_attendance(uuid,boolean),public.request_deletion(),public.consume_rate_limit(text,integer,integer),public.submit_inquiry(jsonb),public.claim_email_batch(),public.ack_email(uuid) from public,anon,authenticated;
grant execute on function private.has_role(text[]),private.is_staff(),private.is_admin() to anon,authenticated;
grant execute on function private.register_event(uuid),private.cancel_registration(uuid),private.save_profile(jsonb,uuid[]),private.save_project(uuid,jsonb,text[]),private.moderate_project(uuid,text),private.set_role(uuid,text),private.mark_attendance(uuid,boolean),private.request_deletion() to authenticated;
grant execute on function public.register_event(uuid),public.cancel_registration(uuid),public.save_profile(jsonb,uuid[]),public.save_project(uuid,jsonb,text[]),public.moderate_project(uuid,text),public.set_member_role(uuid,text),public.mark_attendance(uuid,boolean),public.request_deletion() to authenticated;
grant execute on function private.consume_rate_limit(text,integer,integer),private.submit_inquiry(jsonb),private.claim_email_batch(),private.ack_email(uuid) to service_role;
grant execute on function public.consume_rate_limit(text,integer,integer),public.submit_inquiry(jsonb),public.claim_email_batch(),public.ack_email(uuid) to service_role;

-- Private image buckets, 2MB raster images only; no user SVG/HTML.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp']),('covers','covers',false,2097152,array['image/jpeg','image/png','image/webp']);
create policy avatar_read on storage.objects for select to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_insert on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_update on storage.objects for update to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy avatar_delete on storage.objects for delete to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy covers_staff on storage.objects for all to authenticated using(bucket_id='covers' and private.is_staff()) with check(bucket_id='covers' and private.is_staff());
create policy covers_public on storage.objects for select to anon,authenticated using(bucket_id='covers' and (exists(select 1 from public.events where cover_path=name and status<>'draft') or exists(select 1 from public.projects where cover_path=name and visibility='public' and status='published')));

-- Real editorial launch content only: no fictional events, members or partners.
insert into public.interests(name) values('Desarrollo web'),('Desarrollo mobile'),('Inteligencia artificial'),('Open source'),('Diseño de producto'),('Blockchain'),('Emprender'),('Datos');
insert into public.programs(slug,title,description,accent,status,sort_order) values
('software','Software Engineering & Open Source','Código que se comparte. Aprendé buenas prácticas, contribuí a proyectos abiertos y construí junto a otras personas.','green','planned',1),
('ai','AI & Automation','De la curiosidad al prototipo. Explorá inteligencia artificial y automatizá problemas del mundo real.','purple','planned',2),
('blockchain','Blockchain & Emerging Technology','Entendé qué hay detrás. Experimentá con redes, contratos y nuevas formas de construir tecnología.','blue','planned',3),
('builders','Builders & Entrepreneurship','Una idea es un punto de partida. Convertí problemas cercanos en productos útiles, con feedback y colaboración.','orange','planned',4);

create function private.set_avatar(p_path text) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null or p_path not like auth.uid()::text||'/%' then raise exception 'FORBIDDEN'; end if;
 perform private.enforce_member_limit('avatar');
 if not exists(select 1 from storage.objects where bucket_id='avatars' and name=p_path) then raise exception 'FILE_NOT_FOUND'; end if;
 update public.profiles set avatar_path=p_path where id=auth.uid();
end $$;
create function public.set_avatar(p_path text) returns void language sql security invoker set search_path='' as $$ select private.set_avatar(p_path) $$;
revoke all on function private.set_avatar(text),public.set_avatar(text) from public,anon,authenticated;
grant execute on function private.set_avatar(text),public.set_avatar(text) to authenticated;

-- Intentionally public aggregate, with no attendee identifiers. Definer is needed
-- because registration rows themselves remain private under RLS.
create function private.event_availability(p_event uuid) returns integer language sql stable security definer set search_path='' as $$
 select greatest(0,e.capacity-(select count(*)::integer from public.event_registrations r where r.event_id=e.id and r.status='confirmed')) from public.events e where e.id=p_event and e.status='published'
$$;
create function public.event_availability(p_event uuid) returns integer language sql stable security invoker set search_path='' as $$ select private.event_availability(p_event) $$;
revoke all on function private.event_availability(uuid),public.event_availability(uuid) from public;
grant execute on function private.event_availability(uuid),public.event_availability(uuid) to anon,authenticated;
