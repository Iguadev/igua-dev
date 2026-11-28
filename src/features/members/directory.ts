import 'server-only';

import { db } from '@/lib/supabase/server';

export type MemberTicketData = {
  display_name: string;
  city: string;
  bio: string;
  github_url: string | null;
  projects: { slug: string; title: string }[];
};

type ProjectLink = MemberTicketData['projects'][number] & { created_at: string };
type MemberRow = Omit<MemberTicketData, 'projects'> & {
  id: string;
  owned: ProjectLink[];
  collaborations: { project: ProjectLink }[];
};

export const membersPerPage = 12;
const ticketProjects = 4;

function directoryQuery(client: NonNullable<Awaited<ReturnType<typeof db>>>) {
  return client
    .from('profiles')
    .select(
      `id,display_name,city,bio,github_url,
       owned:projects!projects_owner_id_fkey(slug,title,created_at),
       collaborations:project_members(project:projects!inner(slug,title,created_at))`,
    )
    .eq('onboarded', true)
    .eq('owned.visibility', 'public')
    .eq('owned.status', 'published')
    .eq('collaborations.project.visibility', 'public')
    .eq('collaborations.project.status', 'published')
    .order('created_at', { referencedTable: 'owned', ascending: false })
    .order('project(created_at)', { referencedTable: 'collaborations', ascending: false })
    .limit(ticketProjects, { referencedTable: 'owned' })
    .limit(ticketProjects, { referencedTable: 'collaborations' });
}

function toTicket(row: MemberRow): MemberTicketData & { id: string } {
  const { id, display_name, city, bio, github_url } = row;
  const projects = [...row.owned, ...row.collaborations.map(({ project }) => project)];
  const unique = [...new Map(projects.map((project) => [project.slug, project])).values()];
  unique.sort((a, b) => b.created_at.localeCompare(a.created_at) || a.slug.localeCompare(b.slug));
  return {
    id,
    display_name,
    city,
    bio,
    github_url,
    projects: unique.slice(0, ticketProjects).map(({ title, slug }) => ({ title, slug })),
  };
}

export async function publicMembers(page: number) {
  const client = await db();
  if (!client) return { members: [], hasNextPage: false };
  const start = (page - 1) * membersPerPage;
  const { data, error } = await directoryQuery(client)
    .eq('public_profile', true)
    .order('display_name')
    .order('id')
    .range(start, start + membersPerPage)
    .overrideTypes<MemberRow[], { merge: false }>();
  if (error) throw new Error('Could not load public members');
  return {
    members: data.slice(0, membersPerPage).map(toTicket),
    hasNextPage: data.length > membersPerPage,
  };
}

export async function ownMemberTicket(id: string) {
  const client = await db();
  if (!client) return null;
  const { data, error } = await directoryQuery(client)
    .eq('id', id)
    .maybeSingle()
    .overrideTypes<MemberRow, { merge: false }>();
  if (error) throw new Error('Could not load member ticket');
  return data ? toTicket(data) : null;
}
