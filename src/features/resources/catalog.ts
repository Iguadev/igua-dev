/** Curated external references. Add entries here; no provider credentials are required. */
export const resourceCategories = [
  { id: 'all', label: 'Todos' },
  { id: 'ai', label: 'IA para programar' },
  { id: 'agents', label: 'Skills y agentes' },
  { id: 'deploy', label: 'Web y despliegue' },
  { id: 'git', label: 'Git y colaboración' },
  { id: 'security', label: 'Seguridad' },
] as const;
export type ResourceCategory = Exclude<(typeof resourceCategories)[number]['id'], 'all'>;
export type Resource = {
  id: string;
  title: string;
  provider: string;
  description: string;
  url: string;
  category: ResourceCategory;
  format: 'Tutoriales y talleres' | 'Documentación' | 'Guía práctica' | 'Directorio';
  language: 'Español' | 'Inglés';
  tags: readonly string[];
};

export const resources: readonly Resource[] = [
  {
    id: 'codex-academy',
    title: 'Aprendé a construir con Codex',
    provider: 'OpenAI Academy',
    description:
      'Tutoriales y talleres para dar tus primeros pasos con Codex y llevarlo a tareas reales de programación.',
    url: 'https://openai.com/es-ES/academy/codex/',
    category: 'ai',
    format: 'Tutoriales y talleres',
    language: 'Español',
    tags: ['codex', 'openai', 'inteligencia artificial', 'prompts', 'automatización'],
  },
  {
    id: 'cursor-docs',
    title: 'Cursor, del editor al agente',
    provider: 'Cursor',
    description:
      'Configurá tu entorno, trabajá con agentes y aprendé a darles contexto con reglas, skills e integraciones.',
    url: 'https://cursor.com/docs',
    category: 'ai',
    format: 'Documentación',
    language: 'Inglés',
    tags: ['cursor', 'editor', 'agentes', 'rules', 'mcp', 'contexto'],
  },
  {
    id: 'claude-code',
    title: 'Buenas prácticas con Claude Code',
    provider: 'Anthropic',
    description:
      'Mejorá cómo definís tareas, compartís contexto y verificás el trabajo de tu agente de programación.',
    url: 'https://code.claude.com/docs/en/best-practices',
    category: 'ai',
    format: 'Guía práctica',
    language: 'Inglés',
    tags: ['claude', 'anthropic', 'claude code', 'agentes', 'prompts', 'verificación'],
  },
  {
    id: 'skills-directory',
    title: 'Skills para tus agentes',
    provider: 'skills.sh',
    description:
      'Explorá capacidades reutilizables para agentes y encontrá instrucciones para tareas y herramientas específicas.',
    url: 'https://www.skills.sh/',
    category: 'agents',
    format: 'Directorio',
    language: 'Inglés',
    tags: ['skills', 'agentes', 'capacidades', 'herramientas', 'ecosistema'],
  },
  {
    id: 'vercel-docs',
    title: 'De tu proyecto a producción',
    provider: 'Vercel',
    description:
      'Documentación para publicar aplicaciones, configurar dominios y entender cómo funcionan tus despliegues.',
    url: 'https://vercel.com/docs',
    category: 'deploy',
    format: 'Documentación',
    language: 'Inglés',
    tags: ['vercel', 'deploy', 'deployment', 'hosting', 'dominios', 'web', 'despliegue'],
  },
  {
    id: 'github-git',
    title: 'Git, una buena base para construir',
    provider: 'GitHub Docs',
    description:
      'Entendé el control de versiones y aprendé a trabajar con repositorios, cambios remotos y ramas.',
    url: 'https://docs.github.com/es/get-started/using-git',
    category: 'git',
    format: 'Documentación',
    language: 'Español',
    tags: ['git', 'github', 'commits', 'ramas', 'repositorios', 'colaboración', 'principiantes'],
  },
  {
    id: 'github-sensitive-data',
    title: 'Datos sensibles fuera de tu repositorio',
    provider: 'GitHub Docs',
    description:
      'Una guía para responder a una exposición de secretos y entender cómo limpiar el historial de un repositorio.',
    url: 'https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
    category: 'security',
    format: 'Guía práctica',
    language: 'Español',
    tags: [
      'git',
      'github',
      'seguridad',
      'secretos',
      'credenciales',
      'tokens',
      'claves',
      'historial',
    ],
  },
];

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function findResources(
  query: string,
  category: string,
  translate: (text: string) => string = (text) => text,
) {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return resources.filter((resource) => {
    if (category !== 'all' && resource.category !== category) return false;
    const text = normalize(
      [
        resource.title,
        resource.provider,
        translate(resourceCategories.find((item) => item.id === resource.category)?.label || ''),
        resource.description,
        translate(resource.title),
        translate(resource.description),
        translate(resource.language),
        resource.language,
        ...resource.tags,
      ].join(' '),
    );
    return terms.every((term) => text.includes(term));
  });
}
