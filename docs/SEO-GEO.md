# Multilingual search and AI discoverability

Argentine Spanish uses unprefixed URLs. The proxy sets the request language from the URL. An internal rewrite then maps Brazilian Portuguese (`/pt`) and English (`/en`) paths to the corresponding page. Member and admin authorization remains independent of language.

Each localized page has its own canonical URL and links to its `es-AR`, `pt-BR` and `en` alternates. The `x-default` alternate points to Spanish. The sitemap lists all three versions of each public page it includes. Use localized Open Graph/Twitter metadata and social images, stable organization/site/page entity IDs, breadcrumb data and visible answers to common community questions. Do not invent organizational credentials, addresses, people, partnerships or activity.

GEO means generative engine optimization here. The work improves factual accessibility and crawlability, not guaranteed inclusion in AI answers. Google states no special AI-specific schema or file is required: https://developers.google.com/search/docs/appearance/ai-features . Language references: https://developers.google.com/search/docs/specialty/international/localized-versions . A human-readable llms.txt is supplementary documentation, not an indexing or ranking mechanism.

Local-only authorization remains in force. Public indexing, Search Console/Bing verification, sitemap submission and domain configuration require a real deployed origin. Never submit localhost URLs. Use NEXT_PUBLIC_SITE_URL for the verified canonical origin before deployment.

## Translation maintenance

Spanish remains the source language. In `src/lib/i18n/`, `pt.json` and `en.json` hold the server dictionaries for Brazilian Portuguese and English. The client interface uses `pt-ui.json` and `en-ui.json`. Add matching dictionary keys when changing `t(...)` calls. Catalog search includes the active language's titles, descriptions, formats and categories. Community-authored event and project content stays in its original language, with a notice on the Portuguese and English detail pages. New CMS content and provider-delivered emails need their own editorial translations.

Internal links retain the selected language. Switching between Spanish, Portuguese and English preserves the current page, query and fragment. The switch uses document navigation so the root HTML language and provider update together. Reading the locale from request headers makes page rendering dynamic.

Run `npm test`, `npm run typecheck`, `npm run build` and, with the preview running, `node scripts/check-i18n.mjs` plus `node scripts/check-launch.mjs`. The HTTP language check covers English routes and selected Spanish behavior. It writes temporary English rendered-text files to `../../work/i18n/rendered/` relative to the working directory. Set `TEST_BASE_URL` to test another local port.

## Production handoff

Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin and rebuild. Verify canonical URLs, alternate languages, social images, published records and sitemap on that deployment. Only then verify site ownership and submit the sitemap to search engines. Keep login, member/admin pages and filtered search views out of indexing. `/llms.txt` links to public pages in Spanish, Portuguese and English. Visible page text and accurate structured data remain the primary material. No hosted configuration or search-engine submission was performed locally.
