create table public.resources (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  provider text not null,
  description text not null,
  url text not null check (url ~ '^https://[^[:space:]]+$'),
  english_url text check (english_url ~ '^https://[^[:space:]]+$'),
  category text not null check (category in ('ai', 'agents', 'deploy', 'git', 'blockchain', 'security')),
  format text not null check (format in ('Tutoriales y talleres', 'Documentación', 'Guía práctica', 'Directorio', 'Portal')),
  language text not null check (language in ('Español', 'Inglés')),
  tags text[] not null default '{}',
  sort_order integer not null default 0
);

alter table public.resources enable row level security;
revoke all privileges on table public.resources from public, anon, authenticated;
grant select on table public.resources to anon, authenticated;
create policy resources_read on public.resources
  for select to anon, authenticated using (true);

-- Preserve the existing public catalog and its display order.
insert into public.resources
  (id, title, provider, description, url, english_url, category, format, language, tags, sort_order)
values
  (
    'codex-academy',
    'Aprendé a construir con Codex',
    'OpenAI Academy',
    'Tutoriales y talleres para dar tus primeros pasos con Codex y llevarlo a tareas reales de programación.',
    'https://openai.com/es-ES/academy/codex/',
    'https://openai.com/academy/codex/',
    'ai',
    'Tutoriales y talleres',
    'Español',
    array['codex', 'openai', 'inteligencia artificial', 'prompts', 'automatización'],
    1
  ),
  (
    'cursor-docs',
    'Cursor, del editor al agente',
    'Cursor',
    'Configurá tu entorno, trabajá con agentes y aprendé a darles contexto con reglas, skills e integraciones.',
    'https://cursor.com/docs',
    null,
    'ai',
    'Documentación',
    'Inglés',
    array['cursor', 'editor', 'agentes', 'rules', 'mcp', 'contexto'],
    2
  ),
  (
    'claude-code',
    'Buenas prácticas con Claude Code',
    'Anthropic',
    'Mejorá cómo definís tareas, compartís contexto y verificás el trabajo de tu agente de programación.',
    'https://code.claude.com/docs/en/best-practices',
    null,
    'ai',
    'Guía práctica',
    'Inglés',
    array['claude', 'anthropic', 'claude code', 'agentes', 'prompts', 'verificación'],
    3
  ),
  (
    'skills-directory',
    'Skills para tus agentes',
    'skills.sh',
    'Explorá capacidades reutilizables para agentes y encontrá instrucciones para tareas y herramientas específicas.',
    'https://www.skills.sh/',
    null,
    'agents',
    'Directorio',
    'Inglés',
    array['skills', 'agentes', 'capacidades', 'herramientas', 'ecosistema'],
    4
  ),
  (
    'vercel-docs',
    'De tu proyecto a producción',
    'Vercel',
    'Documentación para publicar aplicaciones, configurar dominios y entender cómo funcionan tus despliegues.',
    'https://vercel.com/docs',
    null,
    'deploy',
    'Documentación',
    'Inglés',
    array['vercel', 'deploy', 'deployment', 'hosting', 'dominios', 'web', 'despliegue'],
    5
  ),
  (
    'github-git',
    'Git, una buena base para construir',
    'GitHub Docs',
    'Entendé el control de versiones y aprendé a trabajar con repositorios, cambios remotos y ramas.',
    'https://docs.github.com/es/get-started/using-git',
    'https://docs.github.com/en/get-started/using-git',
    'git',
    'Documentación',
    'Español',
    array['git', 'github', 'commits', 'ramas', 'repositorios', 'colaboración', 'principiantes'],
    6
  ),
  (
    'stellar-developers',
    'Portal para desarrolladores de Stellar',
    'Stellar Development Foundation',
    'Explorá la red Stellar, las herramientas de desarrollo y los primeros pasos para construir sobre la red.',
    'https://developers.stellar.org/',
    null,
    'blockchain',
    'Portal',
    'Inglés',
    array['stellar', 'blockchain', 'sdk', 'cli', 'testnet'],
    7
  ),
  (
    'stellar-docs',
    'Documentación de Stellar',
    'Stellar Development Foundation',
    'Tutoriales y guías para escribir contratos inteligentes, crear aplicaciones y trabajar con la red Stellar.',
    'https://developers.stellar.org/docs',
    null,
    'blockchain',
    'Documentación',
    'Inglés',
    array['stellar', 'blockchain', 'soroban', 'smart contracts', 'rpc', 'sdk'],
    8
  ),
  (
    'github-sensitive-data',
    'Datos sensibles fuera de tu repositorio',
    'GitHub Docs',
    'Una guía para responder a una exposición de secretos y entender cómo limpiar el historial de un repositorio.',
    'https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
    'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
    'security',
    'Guía práctica',
    'Español',
    array['git', 'github', 'seguridad', 'secretos', 'credenciales', 'tokens', 'claves', 'historial'],
    9
  );
