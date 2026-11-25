# Multilingual search, SEO and AEO

Argentine Spanish uses unprefixed URLs. The proxy sets the request language from the URL. An internal rewrite then maps Brazilian Portuguese (`/pt`) and English (`/en`) paths to the corresponding page. Member and admin authorization remains independent of language.

Each localized page has its own canonical URL and links to its `es-AR`, `pt-BR` and `en` alternates. The `x-default` alternate points to Spanish. The sitemap lists all three versions of each public page it includes. Use localized Open Graph/Twitter metadata and social images, stable organization/site/page entity IDs, breadcrumb data and visible answers to common community questions. Do not invent organizational credentials, addresses, people, partnerships or activity.

GEO/AEO here means making the public site easy for search and answer engines to cite accurately: visible Q&A, stable entity IDs, localized metadata, and a factual `/llms.txt`. It is not a ranking guarantee and not a special Google file format. Google states no extra AI-only schema is required: https://developers.google.com/search/docs/appearance/ai-features . Language versions: https://developers.google.com/search/docs/specialty/international/localized-versions .

Implementation lives in `src/lib/seo.ts` (canonical/hreflang, Open Graph, Organization/WebSite/WebPage/breadcrumb graph, FAQ, Event, CreativeWork, ItemList, SearchAction on the resource library). `/about` keeps FAQ copy in the page and in `faqEntities` with `@id` `…/about#faq` so it does not collide with the WebPage entity. Event structured data maps `cancelled` → EventCancelled, `completed` → EventCompleted, otherwise EventScheduled, and only marks attendance as offline when a venue exists. Filtered `/recursos` views and member/admin routes stay `noindex`.

The canonical production origin is **https://www.iguazu.dev**. `/sitemap.xml`, `/robots.txt` and `/llms.txt` always emit that origin, never localhost. On Vercel, HTML canonicals fall back to the same origin when `NEXT_PUBLIC_SITE_URL` is unset. Preview deployments are `noindex`.

After deploying this code, confirm:

1. `https://www.iguazu.dev/robots.txt` lists `Sitemap: https://www.iguazu.dev/sitemap.xml` and does not mention localhost.
2. `https://www.iguazu.dev/sitemap.xml` lists `https://www.iguazu.dev/` and the `/pt` and `/en` alternates.
3. Search Console (and Bing Webmaster, if used): add `https://www.iguazu.dev`, verify ownership, then submit `https://www.iguazu.dev/sitemap.xml`.

Optional verification tokens: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION`. They only add meta tags; they do not replace the sitemap.

## Translation maintenance

Spanish remains the source language. In `src/lib/i18n/`, `pt.json` and `en.json` hold the server dictionaries for Brazilian Portuguese and English. The client interface uses `pt-ui.json` and `en-ui.json`. Add matching dictionary keys when changing `t(...)` calls. Catalog search includes the active language's titles, descriptions, formats and categories. Community-authored event and project content stays in its original language, with a notice on the Portuguese and English detail pages. New CMS content and provider-delivered emails need their own editorial translations.

Internal links retain the selected language. Switching between Spanish, Portuguese and English preserves the current page, query and fragment. The switch uses document navigation so the root HTML language and provider update together. Reading the locale from request headers makes page rendering dynamic.

Run `npm test`, `npm run typecheck`, `npm run build` and, with the preview running, `node scripts/check-i18n.mjs` plus `node scripts/check-launch.mjs`. The HTTP language check covers English routes and selected Spanish behavior. It writes temporary English rendered-text files to `../../work/i18n/rendered/` relative to the working directory. Set `TEST_BASE_URL` to test another local port.

## Production handoff

On https://www.iguazu.dev, verify canonical URLs, `hreflang`, social images, published records, `/robots.txt`, `/llms.txt` and `/sitemap.xml`. Then verify site ownership and submit `https://www.iguazu.dev/sitemap.xml`. Keep login, member/admin pages and filtered search views out of indexing. Visible page text and accurate structured data remain the primary material.
