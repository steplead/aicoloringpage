#!/usr/bin/env python3
"""batch-review-20261113: verify printable noindex/sitemap/hreflang policy in the built static output."""
import json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parents[1]
out = root / '.vercel/output/static'
SITE = 'https://ai-coloringpage.com'
locales = ['en', 'es', 'pt', 'fr']
policy = json.loads((root / 'src/data/printable-index-policy.json').read_text())
pages = [p for p in json.loads((root / 'src/data/seo-pages.json').read_text()) if str(p.get('image_url', '')).startswith('http')]
def indexable(p):
    return p['style'].lower() != 'standard' or p['audience'] in policy['indexableAudiences'] or p['slug'] in policy['gscKeepSlugs']
want = {p['slug']: indexable(p) for p in pages}
errors = []
def err(m):
    if len(errors) < 30: errors.append(m)
    errors_count[0] += 1
errors_count = [0]
counts = {'index': 0, 'noindex': 0}
for loc in locales:
    for slug, ok in want.items():
        f = out / loc / 'printable' / (slug + '.html')
        if not f.is_file(): err(f'missing {loc}/{slug}'); continue
        head = f.read_text(encoding='utf-8').split('</head>', 1)[0]
        url = f'{SITE}/{loc}/printable/{slug}'
        canon = re.findall(r'<link rel="canonical" href="([^"]+)"', head)
        alts = dict(re.findall(r'<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"', head))
        robots = re.findall(r'<meta name="robots" content="([^"]+)"', head)
        if canon != [url]: err(f'canonical {url} {canon}')
        if ok:
            counts['index'] += 1
            exp = {l: f'{SITE}/{l}/printable/{slug}' for l in locales}; exp['x-default'] = exp['en']
            if robots: err(f'unexpected robots {url} {robots}')
            if alts != exp: err(f'hreflang {url} {alts}')
            if any(not want.get(h.rsplit('/', 1)[1], False) for h in alts.values()): err(f'hreflang->noindex {url}')
        else:
            counts['noindex'] += 1
            if robots != ['noindex, follow']: err(f'robots {url} {robots}')
            if alts: err(f'noindex page has hreflang {url}')
sm = (out / 'sitemap.xml').read_text()
locs = re.findall(r'<loc>([^<]+)</loc>', sm)
pr = [u for u in locs if '/printable/' in u]
for u in pr:
    s = u.rsplit('/', 1)[1]
    if not want.get(s, False): err(f'sitemap has noindex {u}')
for h in re.findall(r'hreflang="[^"]+"\s+href="([^"]+/printable/[^"]+)"', sm):
    if not want.get(h.rsplit('/', 1)[1], False): err(f'sitemap hreflang->noindex {h}')
report = {'printable_html_index': counts['index'], 'printable_html_noindex': counts['noindex'], 'sitemap_urls': len(locs), 'sitemap_printable': len(pr), 'errors': errors_count[0]}
print('index-policy', json.dumps(report))
if errors:
    print('\n'.join(errors)); sys.exit(1)
