-- Hosted Supabase can give API roles broad default privileges on new public
-- tables. Reset only IGUA.DEV tables before applying the intended allowlist.
revoke all privileges on table
  public.profiles, public.member_preferences, public.interests, public.member_interests,
  public.member_roles, public.venues, public.programs, public.events, public.event_speakers,
  public.program_events, public.event_registrations, public.projects, public.project_members,
  public.project_technologies, public.partners, public.partnership_inquiries,
  public.content_pages, public.audit_logs
from public, anon, authenticated;

grant select on table
  public.profiles, public.interests, public.venues, public.programs, public.events,
  public.event_speakers, public.program_events, public.projects, public.project_members,
  public.project_technologies, public.partners, public.content_pages
to anon, authenticated;

grant select on table
  public.member_preferences, public.member_interests, public.member_roles,
  public.event_registrations, public.audit_logs, public.partnership_inquiries
to authenticated;

grant insert, update, delete on table
  public.events, public.event_speakers, public.venues, public.programs,
  public.program_events, public.partners, public.content_pages
to authenticated;

grant update on table public.partnership_inquiries to authenticated;
