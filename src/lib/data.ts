import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/supabase/server';
import { resources, type Resource } from '@/features/resources/catalog';

export const resourceCatalog = cache(async function resourceCatalog(): Promise<
  readonly Resource[]
> {
  const client = await db();
  if (!client) return resources;
  const { data, error } = await client
    .from('resources')
    .select(
      'id,title,provider,description,url,englishUrl:english_url,category,format,language,tags',
    )
    .order('sort_order')
    .order('id')
    .returns<Resource[]>();
  // Preserve the public catalog until the migration reaches this environment.
  if (error?.code === 'PGRST205' || error?.code === '42P01') return resources;
  if (error) throw new Error('Could not load resources');
  return data ?? [];
});

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  cover_path: string | null;
  starts_at: string;
  ends_at: string;
  time_zone: string;
  venue_id: string | null;
  capacity: number;
  status: string;
  registration_status: string;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  recap: string | null;
  venues: { name: string; address: string; map_url: string | null } | null;
};
export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  owner_id: string;
  status: string;
  visibility: string;
  technologies?: string[];
};
export type Program = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  accent: string;
};
export const programIdeas: Program[] = [
  {
    id: 'software',
    slug: 'software',
    title: 'Software Engineering & Open Source',
    description:
      'Código que se comparte. Aprendé buenas prácticas, contribuí a proyectos abiertos y construí junto a otras personas.',
    status: 'planned',
    accent: 'green',
  },
  {
    id: 'ai',
    slug: 'ai',
    title: 'AI & Automation',
    description:
      'De la curiosidad al prototipo. Explorá inteligencia artificial y automatizá problemas del mundo real.',
    status: 'planned',
    accent: 'purple',
  },
  {
    id: 'blockchain',
    slug: 'blockchain',
    title: 'Blockchain & Emerging Technology',
    description:
      'Entendé qué hay detrás. Experimentá con redes, contratos y nuevas formas de construir tecnología.',
    status: 'planned',
    accent: 'blue',
  },
  {
    id: 'builders',
    slug: 'builders',
    title: 'Builders & Entrepreneurship',
    description:
      'Una idea es un punto de partida. Convertí problemas cercanos en productos útiles, con feedback y colaboración.',
    status: 'planned',
    accent: 'orange',
  },
];
export const events = cache(async function events() {
  const client = await db();
  if (!client) return [] as Event[];
  const { data, error } = await client
    .from('events')
    .select('*, venues(name,address,map_url)')
    .neq('status', 'draft')
    .order('starts_at');
  if (error) throw new Error('Could not load events');
  return (data ?? []) as Event[];
});
export const projects = cache(async function projects() {
  const client = await db();
  if (!client) return [] as Project[];
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load projects');
  return (data ?? []) as Project[];
});
export const programs = cache(async function programs() {
  const client = await db();
  if (!client) return programIdeas;
  const { data, error } = await client
    .from('programs')
    .select('*')
    .neq('status', 'draft')
    .order('sort_order');
  if (error) throw new Error('Could not load programs');
  return (data ?? []) as Program[];
});
export const partners = cache(async function partners() {
  const client = await db();
  if (!client) return [];
  const { data, error } = await client
    .from('partners')
    .select('id,name,website,category')
    .eq('approved', true);
  if (error) throw new Error('Could not load partners');
  return data ?? [];
});
export const content = cache(async function content(slug: string) {
  const client = await db();
  if (!client) return null;
  const { data, error } = await client
    .from('content_pages')
    .select('title,body')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) throw new Error('Could not load content');
  return data;
});
