# Bilingual search and AI discoverability

Implementation plan: keep Spanish canonical URLs, add English `/en` URLs through an internal rewrite, and render translated content on the server. A visible language switch preserves page, query and fragment. No automatic language redirect overrides a visitor's explicit URL. Locale headers are overwritten by proxy, never trusted from clients. Member and admin authorization remains independent of language.

Use self-canonicals, reciprocal es-AR/en/x-default alternates, localized Open Graph/Twitter metadata and social images, a bilingual sitemap, stable organization/site/page entity IDs, breadcrumb data and visible answers to common community questions. Do not invent organizational credentials, addresses, people, partnerships or activity.

GEO means generative engine optimization here. The work improves factual accessibility and crawlability, not guaranteed inclusion in AI answers. Google states no special AI-specific schema or file is required: https://developers.google.com/search/docs/appearance/ai-features . Language references: https://developers.google.com/search/docs/specialty/international/localized-versions . A human-readable llms.txt is supplementary documentation, not an indexing or ranking mechanism.

Local-only authorization remains in force. Public indexing, Search Console/Bing verification, sitemap submission and domain configuration require a real deployed origin. Never submit localhost URLs. Use NEXT_PUBLIC_SITE_URL for the verified canonical origin before deployment.

## Translation maintenance

Spanish remains the source language. `src/lib/i18n/en.json` holds server-rendered English copy; `en-ui.json` contains the smaller shared client interface dictionary. Add matching dictionary keys when changing `t(...)` calls. Catalog search includes the active language's titles, descriptions, formats and categories. Authored event/project content stays in its original language and shows an explanatory notice; new CMS content and provider-delivered emails need their own editorial translations.

Internal links retain language, and the ES/EN switch preserves the current page, query and fragment. It deliberately uses document navigation so the root HTML language and provider update together. Reading locale from request headers makes page rendering dynamic; the full server dictionary is not sent to the browser. The proxy overwrites locale headers, and authorization does not depend on locale.

Run `npm test`, `npm run typecheck`, `npm run build` and, with the preview running, `node scripts/check-i18n.mjs` plus `node scripts/check-launch.mjs`. The bilingual check writes temporary rendered-text review files under the workspace `work/` directory. Set `TEST_BASE_URL` to test another local port.

## Production handoff

Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin and rebuild. Verify canonical URLs, alternate languages, social images, published records and sitemap on that deployment. Only then verify site ownership and submit the sitemap to search engines. Keep login, member/admin pages and filtered search views out of indexing. `/llms.txt` provides a concise bilingual factual guide; visible page text and accurate structured data remain the primary material. No hosted configuration or search-engine submission was performed locally.
