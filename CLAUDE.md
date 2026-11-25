# IGUA.DEV

Follow **[AGENTS.md](AGENTS.md)** for Next.js version rules and every project convention. Human setup is in **[README.md](README.md)**.

Short map:

- Public community site for Puerto Iguazú at https://www.iguazu.dev (es-AR default, `/pt`, `/en`).
- App Router, Server Components, mutations in `src/features/*/actions.ts`.
- No fictional public activity. Local-only until an IGUA.DEV-owned Supabase project is connected.
- Authz in every action + RLS. Lock event rows before seat changes.
- SEO/AEO helpers: `src/lib/seo.ts`, `/llms.txt`, sitemap, robots. Do not invent credentials or metrics in structured data.
