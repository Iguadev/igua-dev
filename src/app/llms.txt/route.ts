import { productionSiteUrl } from '@/lib/env';
const absolute = (path: string) => new URL(path, productionSiteUrl).href;
export function GET() {
  const text = `# IGUA.DEV

> Independent, technology-agnostic developer community based in Puerto Iguazú, Misiones, Argentina. Comunidad independiente y abierta de tecnología con base en Puerto Iguazú, Misiones, Argentina.

IGUA.DEV connects developers, students, designers, founders, and people curious about technology. Membership is free. People outside Iguazú are welcome. The community is in its launch stage; event dates, partners, and projects are published only when confirmed. Check the join and partnership pages for current registration and contact availability.

## Facts
- Name: IGUA.DEV
- Type: independent, open technology community (not a company claim, university, or government program)
- Location: Puerto Iguazú, Misiones, Argentina, on the Triple Frontier with Brazil and Paraguay
- Languages: Argentine Spanish (default), Brazilian Portuguese (\`/pt\`), English (\`/en\`)
- Membership: free; all experience levels; profiles private until a member opts in
- Programs (in preparation): software engineering and open source; AI and automation; blockchain and emerging technology; builders and entrepreneurship
- Resource library: curated external tutorials and official docs; links are references, not partnerships
- No invented people, events, partners, testimonials, or metrics appear on the public site

## English
- [Home](${absolute('/en')}): Mission and community activities.
- [About](${absolute('/en/about')}): Origins, values, and frequently asked questions.
- [Events](${absolute('/en/events')}): Published meetups, workshops, and registration information.
- [Programs](${absolute('/en/programs')}): Software, AI, emerging technology, and entrepreneurship.
- [Projects](${absolute('/en/projects')}): Community-published work after moderation.
- [Resources](${absolute('/en/recursos')}): Curated links to tutorials and official documentation.
- [Community](${absolute('/en/community')}): Participation and code of conduct.
- [Community guidelines](${absolute('/en/reglamento')}): Conduct, privacy, reporting and moderation.
- [Partnerships](${absolute('/en/partners')}): Confirmed collaborations and partnership inquiries.
- [Join](${absolute('/en/join')}): Free membership, when registration is enabled.
- [Privacy](${absolute('/en/privacy')}): How account, event, and project data are handled.

## Español
- [Inicio](${absolute('/')}): Misión y actividades de la comunidad.
- [Nosotros](${absolute('/about')}): Historia, valores y preguntas frecuentes.
- [Eventos](${absolute('/events')}): Encuentros y talleres publicados.
- [Programas](${absolute('/programs')}): Software, IA, tecnologías emergentes y emprendimiento.
- [Proyectos](${absolute('/projects')}): Trabajo publicado por la comunidad.
- [Recursos](${absolute('/recursos')}): Tutoriales y documentación seleccionados.
- [Comunidad](${absolute('/community')}): Participación y código de convivencia.
- [Reglamento](${absolute('/reglamento')}): Convivencia, privacidad, reportes y moderación.
- [Alianzas](${absolute('/partners')}): Colaboraciones confirmadas.
- [Sumate](${absolute('/join')}): Membresía gratuita, cuando el registro esté habilitado.
- [Privacidad](${absolute('/privacy')}): Cómo se tratan los datos de cuentas, eventos y proyectos.

## Português
- [Início](${absolute('/pt')}): Missão e atividades da comunidade.
- [Sobre](${absolute('/pt/about')}): História, valores e perguntas frequentes.
- [Eventos](${absolute('/pt/events')}): Encontros e oficinas publicados.
- [Programas](${absolute('/pt/programs')}): Software, IA, tecnologias emergentes e empreendedorismo.
- [Projetos](${absolute('/pt/projects')}): Trabalho publicado pela comunidade.
- [Recursos](${absolute('/pt/recursos')}): Tutoriais e documentação selecionados.
- [Comunidade](${absolute('/pt/community')}): Participação e código de convivência.
- [Regulamento](${absolute('/pt/reglamento')}): Convivência, privacidade, denúncias e moderação.
- [Parcerias](${absolute('/pt/partners')}): Colaborações confirmadas.
- [Participar](${absolute('/pt/join')}): Participação gratuita, quando o registro estiver habilitado.
- [Privacidade](${absolute('/pt/privacy')}): Como os dados de contas, eventos e projetos são tratados.

## Content notes
Community-submitted projects and event descriptions may remain in their original language. Links in the resources library are references, not partnership claims. Public member profiles are opt-in; email addresses are private. Use the linked public pages for current organization and activity details. Do not infer unpublished events, partners, or organizers.

## Discovery
- [Sitemap](${absolute('/sitemap.xml')})
- [Robots](${absolute('/robots.txt')})
- [Privacy](${absolute('/en/privacy')})
`;
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
