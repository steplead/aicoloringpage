#!/usr/bin/env python3
"""Validate the deployed static artifacts, not just source configuration."""
import collections, html, itertools, json, pathlib, re, sys
from html.parser import HTMLParser
root = pathlib.Path(__file__).resolve().parents[1]
out = root / '.vercel/output/static'
locales = ['en', 'es', 'fr', 'pt']
styles = ['realistic', 'kawaii', 'anime', 'cartoon']
def require(ok, message):
    if not ok: raise AssertionError(message)
def page_exists(path):
    path = path.split('?',1)[0].rstrip('/')
    return (out / (path.lstrip('/')+'.html')).is_file() or (out / path.lstrip('/') / 'index.html').is_file()
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]
    def handle_data(self,data): self.parts.append(data)
def text(markup):
    p=Text();p.feed(markup);return ' '.join(' '.join(p.parts).split())
def grams(copy):
    words=re.findall(r'\w+',copy.casefold())
    return {tuple(words[i:i+4]) for i in range(len(words)-3)}
report={'guides':{},'footer_links':{},'form_b_redirects':0}
# Parse redirects with documented Pages semantics and enforce the actual budgets.
rules=[]; static=dynamic=0; dynamic_started=False
for line in (out/'_redirects').read_text().splitlines():
    if not line.strip() or line.lstrip().startswith('#'):continue
    source,target,*status=line.split(); is_dynamic=bool(re.search(r'\*|:[A-Za-z]\w*',source))
    dynamic_started |= is_dynamic
    if dynamic_started:dynamic+=1
    else:static+=1
    pattern='';position=0
    for m in re.finditer(r'\*|:([A-Za-z]\w*)',source):
        pattern+=re.escape(source[position:m.start()])
        pattern+= '(?P<splat>.*)' if m[0]=='*' else '(?P<'+m[1]+'>[^/]+)'
        position=m.end()
    pattern+=re.escape(source[position:]);rules.append((re.compile('^'+pattern+'$'),target,int(status[0]) if status else 302))
require(static<=2000 and dynamic<=100,f'Redirect limits exceeded: {static}/{dynamic}')
def resolve(path):
    for regex,target,status in rules:
        match=regex.fullmatch(path)
        if match:
            for name,value in match.groupdict().items():target=target.replace(':'+name,value)
            return status,target
    return None,path
# Check every actual footer emitted across all static pages; deduplicate targets.
all_footer_links=set();footers=0
for file in out.rglob('*.html'):
    source=file.read_text()
    matches=re.findall(r'<footer\b.*?</footer>',source,re.S)
    site_footers=[f for f in matches if 'pt-16 pb-8 mt-24' in f]
    if not site_footers:continue
    footers+=1;footer=site_footers[-1]
    markers=re.findall(r'data-style-link="([^"]+)"',footer)
    require(sorted(markers)==sorted(styles),f'{file}: By Style mismatch {markers}')
    for href in re.findall(r'href="([^"]+)"',footer):
        if href.startswith('/'):all_footer_links.add(html.unescape(href))
for link in all_footer_links:
    require(page_exists(link),f'Footer target missing: {link}')
require(footers>0,'No site footers checked')
report.update(checked_footers=footers,unique_footer_links=len(all_footer_links),redirect_rules={'static':static,'dynamic':dynamic})
all_grams={}
for locale in locales:
    report['guides'][locale]={}
    for style in styles:
        file=out/locale/'tags'/f'{style}.html'
        require(file.is_file(),f'Missing style hub {locale}/{style}')
        source=file.read_text()
        require(f'<link rel="canonical" href="https://ai-coloringpage.com/{locale}/tags/{style}"' in source,'Style canonical mismatch')
        match=re.search(r'<article\b[^>]*data-style-guide="'+style+r'"[^>]*>(.*?)</article>',source,re.S)
        require(match is not None,'Guide missing')
        copy=text(match[1]);count=len(copy.split())
        require(310<=count<=322,f'{locale}/{style}: {count} words')
        require(len(re.findall('<h2',match[1]))==5,'Must contain five sections')
        all_grams[locale+'/'+style]=grams(copy)
        report['guides'][locale][style]={'words':count,'sections':5}
        require('/printable/' in source,'Empty style listing')
    report['footer_links'][locale]=len([x for x in all_footer_links if x.startswith('/'+locale+'/')])
for a,b in itertools.combinations(all_grams,2):
    overlap=all_grams[a]&all_grams[b]
    require(not overlap,f'Shared four-grams {a} / {b}: {overlap}')
# Every retained Form B is a placeholder; every legacy URL must reach real static HTML.
data=json.loads((root/'src/data/seo-pages.json').read_text())
legacy=[p for p in data if re.fullmatch(r'(kawaii|anime|cartoon|realistic|steampunk|mandala|geometric|chibi|minimalist|stained-glass)-.+-coloring-page-for-.+',p['slug'])]
for page in legacy:
    require(not page['image_url'].startswith('http'),'A recoverable Form B must not be redirected')
    for locale in locales:
        status,target=resolve('/'+locale+'/printable/'+page['slug'])
        require(status==301,f'Legacy URL missing 301: {page["slug"]}')
        require(page_exists(target),f'Legacy destination not built: {target}')
        report['form_b_redirects']+=1
for locale in locales:
    source=(out/locale/'printable/realistic-cat-coloring-page.html').read_text()
    h1=text(re.search(r'<h1\b[^>]*>(.*?)</h1>',source,re.S)[1])
    require('Realistic' in h1 and 'Everyone' not in h1,f'Lost style H1: {h1}')
    require('data-photo-local="true"' in (out/locale/'create/photo.html').read_text(),'Photo tool unavailable')
routes=json.loads((out/'_routes.json').read_text());require(routes['include']==['/api/*'],'HTML must stay static')
sitemap=(out/'sitemap.xml').read_text();report['sitemap_urls']=sitemap.count('<loc>')
for locale in locales:
    for style in styles:require(f'<loc>https://ai-coloringpage.com/{locale}/tags/{style}</loc>' in sitemap,'Missing style sitemap entry')
report['shared_4grams']=0
(root/'evidence/v21-built-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2));print('v21 built-output checks PASS')
