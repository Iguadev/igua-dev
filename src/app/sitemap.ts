import type { MetadataRoute } from 'next';
import { events, projects } from '@/lib/data';
import { sitemapEntries } from '@/lib/sitemap';
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedEvents, publishedProjects] = await Promise.all([events(), projects()]);
  return sitemapEntries([
    ...publishedEvents.map((event) => ({
      path: `/events/${event.slug}`,
      lastModified: event.ends_at,
    })),
    ...publishedProjects.map((project) => ({ path: `/projects/${project.slug}` })),
  ]);
}
