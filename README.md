# IGUA.DEV

**El futuro también se construye desde acá.**

Comunidad independiente y abierta de tecnología con base en **Puerto Iguazú, Misiones, Argentina**. Conecta a developers, estudiantes, diseñadores, founders y personas curiosas por la tecnología, con los pies en la Triple Frontera y la mirada en el mundo.

Sitio público: **[https://www.iguazu.dev](https://www.iguazu.dev/)**. Español argentino (URLs sin prefijo), portugués de Brasil (`/pt`) e inglés (`/en`). Membresía gratuita. Sin actividad, personas, alianzas, testimonios ni métricas inventadas: si algo no está confirmado, la interfaz lo dice.

> El origen canónico de producción es `https://www.iguazu.dev`. Registro, OAuth, email y administración se habilitan cuando hay un proyecto de Supabase propio de IGUA.DEV.

## Qué incluye

| Área | Qué hace |
| --- | --- |
| Sitio público | Inicio, nosotros, eventos, programas, proyectos, comunidad, reglamento, recursos, alianzas, registro y privacidad |
| Miembros | Onboarding, perfil opt-in, preferencias, avatar, proyectos propios, inscripciones |
| Eventos | Ciclo de vida, cupos atómicos, lista de espera FIFO, cancelación, speakers, portadas, recap y export CSV |
| Administración | Eventos, sedes, miembros, moderación de proyectos, aliados, copy editorial y pedidos de baja |
| Descubrimiento | Metadata localizada, hreflang, sitemap, robots, JSON-LD, imágenes sociales y `/llms.txt` |

Los cuatro programas (software, IA, tecnologías emergentes, emprendimiento) se muestran como **en preparación** hasta que existan actividades confirmadas.

## Stack

- **App:** Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind CSS 4
- **Datos:** PostgreSQL + Supabase Auth/Storage, RLS, funciones en schema `private`
- **Email:** cola durable + Resend (idempotente)
- **Observabilidad:** Sentry (opcional), Vercel Analytics solo en Vercel
- **Tests:** Vitest + PGlite (RLS), PostgreSQL nativo para concurrencia, Playwright para el preview de lanzamiento

## Requisitos

- Node.js **22.12+** y npm
- Docker Desktop solo si querés el stack local completo de Supabase
- Puerto loopback libre para `npm run test:concurrency` (55439)

## Arranque local

```sh
npm ci
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). **Sin variables de entorno** el sitio es un preview de lectura: estados vacíos honestos, botones de registro que explican que el acceso no está habilitado, y las rutas protegidas redirigen a login. No hay membresía en `localStorage`, mensajes de éxito fingidos ni autenticación demo.

Para habilitar integraciones:

```sh
cp .env.example .env.local
```

Configurá un proyecto de Supabase **exclusivo de IGUA.DEV**. No reutilices otro proyecto conectado. Después de cambiar variables `NEXT_PUBLIC_*`, reconstruí. Guía: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Preview con Turbopack en `0.0.0.0:3000` |
| `npm run build` | Build de producción (webpack; ver nota abajo) |
| `npm start` | Servir el build |
| `npm run typecheck` | TypeScript estricto |
| `npm test` | Validación + políticas PostgreSQL en PGlite |
| `npm run test:concurrency` | 24 sesiones reales contra PostgreSQL nativo temporal |
| `npm run test:e2e` | Playwright (instalar browsers; preview sin configurar) |
| `npm run format` | Prettier |
| `npx supabase migration new <nombre>` | Nueva migración (revisá la ayuda del CLI v3 antes) |

El build usa webpack porque el worker interno de Turbopack no pudo bindear su puerto en el entorno de autoría. `next dev` sí usa Turbopack.

`npm test` no demuestra transacciones concurrentes reales: para eso existe `test:concurrency`, con datos de fixture descartables. Nunca uses credenciales de un servicio hosteado en esos tests.

## Variables de entorno

Definidas en `.env.example`. Nada de esto va al cliente salvo las claves `NEXT_PUBLIC_*`.

| Variable | Rol |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico. Local: `http://localhost:3000`. Producción: `https://www.iguazu.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente público. Si faltan, preview de solo lectura |
| `SUPABASE_SECRET_KEY` | Servidor: consultas anónimas de alianzas, rate limits, outbox. No bypass de autorización de miembros |
| `RATE_LIMIT_SECRET` | ≥32 caracteres; hashea buckets de rate limit |
| `RESEND_API_KEY` / `RESEND_FROM` | Entrega de la cola. Sin clave, no se envía mail real |
| `CRON_SECRET` | Bearer obligatorio en `/api/jobs/email` |
| `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_*` | Observabilidad opcional |

## Arquitectura (mapa corto)

```
src/app/                 rutas App Router (páginas, sitemap, robots, llms.txt, OG)
src/features/*/actions.ts  mutaciones de dominio (auth, members, events, projects, partners, admin)
src/lib/                 datos, i18n, SEO, Supabase, env
src/components/          UI; interactividad acotada (nav, forms, motion)
supabase/                migraciones y seed vacío de actividad ficticia
```

- Server Components por defecto. Client Components solo donde hace falta el browser.
- Cada Server Action autentica y autoriza. RLS es un segundo límite. Roles salen de `member_roles`, no de `user_metadata`.
- Inscripción y cancelación: `FOR UPDATE` sobre el evento, después se cuenta y se escribe.
- SQL privilegiado en `private` con `search_path` vacío y wrappers `SECURITY INVOKER`.

Detalle: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Idiomas

El español es el idioma fuente. `src/lib/i18n/pt.json` y `en.json` cubren el servidor; `*-ui.json` cubre el cliente. El proxy toma el idioma de la URL (`x-igua-language`). El contenido escrito por la comunidad (eventos, proyectos) se deja en el idioma original, con un aviso en `/pt` y `/en`.

El switch de idioma conserva ruta, query y fragment. Enlaces internos respetan el idioma activo.

## SEO y AEO

- Canonical + `hreflang` (`es-AR`, `pt-BR`, `en`, `x-default` → español)
- Sitemap trilingüe de páginas públicas, eventos y proyectos publicados
- `robots.txt` bloquea `/login`, `/dashboard`, `/admin`, `/api`, `/auth` en los tres idiomas
- JSON-LD: Organization, WebSite + SearchAction de la biblioteca, WebPage, breadcrumbs, FAQ, Event, CreativeWork, ItemList
- Preguntas visibles en `/about` (misma fuente que FAQPage)
- `/llms.txt` con hechos y enlaces públicos, sin métricas ni gente inventada
- Vistas filtradas (`q`, `tema`) y áreas privadas: `noindex`
- Imágenes sociales localizadas en `/social/{es,pt,en}`

Esto mejora crawlability y respuestas factuales. **No garantiza** ranking ni inclusión en resúmenes de IA. El sitemap a enviar es `https://www.iguazu.dev/sitemap.xml`. Documentación: [docs/SEO-GEO.md](docs/SEO-GEO.md).

## Seguridad (no negociable)

- Secretos solo en entorno, nunca en código de cliente ni archivos trackeados
- Buckets de avatares y portadas privados; MIME allowlist; SVG/HTML de usuarias rechazados
- Rate limits persistentes; en Vercel solo se confía el IP que pisa la plataforma
- Baja de cuenta: pedido + operación administrativa (archivos, sesiones, auth), no borrado instantáneo disfrazado
- No tocar un proyecto de Supabase que no sea de IGUA.DEV

## Deploy

Dominio canónico: `www.iguazu.dev` (el apex `iguazu.dev` redirige con 308). En Vercel, Node ≥22.12, `NEXT_PUBLIC_SITE_URL=https://www.iguazu.dev` en Production, variables distintas para preview, primer admin por consola SQL de confianza. Cron cada 10 minutos contra `/api/jobs/email`. Checklist: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentación

| Doc | Contenido |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Contrato para agentes y convenciones del repo |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Límites de runtime, RLS, inscripciones, email |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Preview, Supabase local, comandos de verificación |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Proveedores, admin bootstrap, cron, bajas |
| [docs/SEO-GEO.md](docs/SEO-GEO.md) | i18n, SEO, AEO, llms.txt |
| [docs/VERIFICATION.md](docs/VERIFICATION.md) | Qué se verificó y qué falta para un lanzamiento público |
| [docs/PLAN.md](docs/PLAN.md) | Plan original e investigación regional |

Para agregar o editar la biblioteca: `src/features/resources/catalog.ts`. Verificá el destino y actualizá la fecha de revisión en la ruta. Los enlaces no son alianzas.

## Contribuir

Copy pública: español argentino, voseo natural, acentos y el tagline intactos. No completes vacíos con gente, eventos o números de muestra. Después de un cambio no trivial: `npm run typecheck`, `npm test` y `npm run build`. Si tocás cupos o locks: `npm run test:concurrency`.
