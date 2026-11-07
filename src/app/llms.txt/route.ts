import { siteUrl } from '@/lib/env';
const absolute = (path: string) => new URL(path, siteUrl).href;
export function GET() {
  const text = `# IGUA.DEV

> Independent, technology-agnostic developer community based in Puerto Iguazú, Misiones, Argentina. Comunidad independiente y abierta de tecnología con base en Puerto Iguazú, Misiones, Argentina.

IGUA.DEV connects developers, students, designers, founders, and people curious about technology. Membership is free. People outside Iguazú are welcome. The community is in its launch stage; event dates, partners, and projects are published only when confirmed. Check the join and partnership pages for current registration and contact availability.

## English
- [Home](${absolute('/en')}): Mission and community activities.
- [About](${absolute('/en/about')}): Origins, values, and frequently asked questions.
- [Events](${absolute('/en/events')}): Published meetups, workshops, and registration information.
- [Programs](${absolute('/en/programs')}): Software, AI, emerging technology, and entrepreneurship.
- [Resources](${absolute('/en/recursos')}): Curated links to tutorials and official documentation.
- [Community](${absolute('/en/community')}): Participation and code of conduct.
- [Partnerships](${absolute('/en/partners')}): Confirmed collaborations and partnership inquiries.

- [Community guidelines](${absolute('/en/reglamento')}): Conduct, privacy, reporting and moderation.

## Español
- [Inicio](${absolute('/')}): Misión y actividades de la comunidad.
- [Nosotros](${absolute('/about')}): Historia, valores y preguntas frecuentes.
- [Eventos](${absolute('/events')}): Encuentros y talleres publicados.
- [Recursos](${absolute('/recursos')}): Tutoriales y documentación seleccionados.
- [Comunidad](${absolute('/community')}): Participación y código de convivencia.
- [Alianzas](${absolute('/partners')}): Colaboraciones confirmadas.

- [Reglamento](${absolute('/reglamento')}): Convivencia, privacidad, reportes y moderación.

## Content notes
Community-submitted projects and event descriptions may remain in their original language. Links in the resources library are references, not partnership claims. Public member profiles are opt-in; email addresses are private. Use the linked public pages for current organization and activity details.

## Discovery
- [Sitemap](${absolute('/sitemap.xml')})
- [Privacy](${absolute('/en/privacy')})
`;
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
