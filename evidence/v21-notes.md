# v21 implementation notes — 2026-11-08 (Asia/Shanghai UTC+8)

User authorized the v21 gate override (t0s4) and explicitly requested a local checkout (t1u).
Base: `cursor/static-html-free-plan-496c` at `30c2eaf`.

## Audit D: the distinction matters

- 8,192 distinct style-subject slugs: Form A 1,024; Form B 7,168. The four locale catalogs reuse those slugs (not four times as many distinct slugs).
- Form B data was **not deleted**. All 7,168 rows point at `/placeholder-image.png`; none has a real image.
- `generateStaticParams()` reads `getPublishedPages('en')`, whose publication whitelist is derived from real hosted image URLs. `dynamicParams=false`; this is not a suffix validator or a database lookup.
- Therefore merely allowing audience suffixes would publish empty doorway pages. The safe operational outcome is v21's unrecoverable-page 301 branch (②), not a claim that data was deleted.
- Kawaii, realistic and steampunk legacy pages map to the same existing style/subject Form A. Mandala has no such Form A in the data; its fallback is the existing adult mandala sheet.
- 16 Pages dynamic redirect rules cover every 28,672 localized legacy URL. Actual Pages limits are checked, including existing rules.
- There are 768 currently published Form A style/subject pages, including 128 each for all four Batch1 styles. The previously reported ten were not an exhaustive repository count. We do not invent dozens of recoverable Form B images.
- The compiled published catalog contains 3,017 distinct sheets per locale, not 15,000 and not the earlier reported 1,311 directory-link count. Footer count is derived from the same catalog used to generate HTML.

## Changes

- Text-generation homepage metadata and visible promise in en/es/fr/pt.
- Published printable template retains style in H1, body (twice), breadcrumb, image alt and FAQ.
- Four localized style guides, each with five original sections; editorial word count 310–322; no shared editorial four-grams across any of the sixteen copies. Existing realistic/cartoon tag routes become populated; anime/kawaii are added.
- Style listing uses existing published Form A records, 128 per Batch1 hub. Translated catalog rows use the actual original image rather than the old placeholder.
- Footer only links to actual sheets; unavailable theme links are omitted. By Style is derived from the exact four built Batch1 hubs in every language.
- Sitemap adds the two missing tag routes in all four languages; existing realistic/cartoon entries are retained (832 total entries expected, not sixteen duplicate entries).
- `/create/photo` restored as explicit local browser photo-to-outline conversion. FLUX Schnell is text-only, so this does not pretend text generation can reconstruct an uploaded photograph. Photos never leave the device; there is no extra API cost, binding, or unguarded server endpoint. The existing text API retains Turnstile/KV/spend controls. Pure conversion test checks black edges, white interiors and opaque binary pixels.
- Fixed pre-existing type errors without changing schema data or broad unrelated behavior.
- Reproducible offline build bootstrap uses next-on-pages' standard placeholder `.vercel/project.json`; it does not link/deploy to Vercel or fetch credentials.
- Kept static HTML and `/api/*`-only Worker routing. Kept slashless canonicals. Local Wrangler config mirrors existing production/preview KV, AI and public hostname settings without changing them.

## Evidence

`v21-audit-d.json`, `v21-built-checks.json`, `v21-gate-checks.json`, and deployment verification JSON files accompany this change. Every change type is separately registered in the site's shared SEO ledger with its verdict and `user override 2026-11-08 t0s4`.

## Outstanding owner inputs

GSC complete 404 export and the two indexation-state counts remain owner-provided. Mandala hub is Batch2 and is deliberately not added to the four-link Batch1 footer. The pre-existing www/DNS issue is a separate todo and was not modified.
