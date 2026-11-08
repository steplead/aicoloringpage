#!/usr/bin/env python3
"""Read-only page checks plus the explicitly requested no-token API rejection test."""
import concurrent.futures, datetime, html, json, pathlib, re, sys, urllib.error, urllib.request
base=sys.argv[1].rstrip('/');label=sys.argv[2]
root=pathlib.Path(__file__).resolve().parents[1]
ua='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args):return None
opener=urllib.request.build_opener(NoRedirect)
def request(path,method='GET',body=None):
    headers={'User-Agent':ua}
    if body is not None:headers['Content-Type']='application/json'
    try:
        response=opener.open(urllib.request.Request(base+path,data=body,method=method,headers=headers),timeout=45)
        return {'path':path,'status':response.status,'location':response.headers.get('Location'),'body':response.read().decode('utf8',errors='replace'),'cache':response.headers.get('CF-Cache-Status')}
    except urllib.error.HTTPError as e:
        return {'path':path,'status':e.code,'location':e.headers.get('Location'),'body':e.read().decode('utf8',errors='replace'),'cache':e.headers.get('CF-Cache-Status')}
    except Exception as e:return {'path':path,'status':0,'error':str(e),'body':''}
styles=['realistic','kawaii','anime','cartoon'];locales=['en','es','fr','pt'];checks=[];errors=[]
def record(r,expected,condition=True):
    if r['status']!=expected or not condition:errors.append({'path':r['path'],'expected':expected,'actual':r['status'],'body_preview':r['body'][:180]})
    checks.append({k:v for k,v in r.items() if k!='body'})
# Check both ordinary paths and cache-busting paths: cache staleness is not hidden.
for repeat in range(2):
    suffix='' if repeat==0 else '?v21-check='+label
    paths=[f'/{locale}/tags/{style}' for locale in locales for style in styles]
    with concurrent.futures.ThreadPoolExecutor(8) as pool:
        for r in pool.map(lambda p:request(p+suffix),paths):
            path=r['path'].split('?')[0]
            canonical=f'https://ai-coloringpage.com{path}'
            record(r,200,'data-style-guide=' in r['body'] and f'href="{canonical}"' in r['body'])
    for locale in locales:
        r=request('/'+locale+suffix);expected=json.loads((root/f'messages/{locale}.json').read_text())['HomePage']['metaTitle'];title=re.search('<title>(.*?)</title>',r['body'])
        record(r,200,bool(title and expected in html.unescape(title[1])))
        r=request(f'/{locale}/printable/realistic-cat-coloring-page'+suffix)
        h1=re.search(r'<h1\b[^>]*>(.*?)</h1>',r['body'],re.S)
        record(r,200,bool(h1 and 'Realistic' in h1[1] and 'Everyone' not in h1[1]))
        r=request('/'+locale+'/create/photo'+suffix);record(r,200,'data-photo-local="true"' in r['body'])
    legacy=[('/en','steampunk-cupcake-coloring-page-for-intermediates'),('/pt','steampunk-cupcake-coloring-page-for-beginners'),('/fr','steampunk-donut-coloring-page-for-adults'),('/es','kawaii-pattern-coloring-page-for-kindergarteners'),('/en','mandala-cat-coloring-page-for-kids')]
    for locale,slug in legacy:
        r=request(locale+'/printable/'+slug+suffix);record(r,301)
        if r['location']:
            target=r['location'].replace(base,'').split('?')[0];dest=request(target+suffix);record(dest,200)
# Every distinct footer target from all four localized pages.
links=set()
for locale in locales:
    source=(root/f'.vercel/output/static/{locale}.html').read_text()
    footer=re.findall(r'<footer\b.*?</footer>',source,re.S)[-1]
    for href in re.findall(r'href="([^"]+)"',footer):
        if href.startswith('/'):links.add(html.unescape(href))
with concurrent.futures.ThreadPoolExecutor(8) as pool:
    for r in pool.map(request,sorted(links)):record(r,200)
r=request('/sitemap.xml');expected=(root/'.vercel/output/static/sitemap.xml').read_text().count('<loc>');actual=r['body'].count('<loc>');record(r,200,actual==expected)
r=request('/api/generate','POST',json.dumps({'prompt':'a cute cat','style':'kawaii'}).encode());record(r,403)
report={'base':base,'checked_at':datetime.datetime.now().astimezone().isoformat(),'timezone':'Asia/Shanghai UTC+8','checks':checks,'errors':errors,'unique_footer_links':len(links),'sitemap_urls':actual,'expected_sitemap_urls':expected,'passed':not errors}
(root/f'evidence/v21-{label}-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2))
if errors:sys.exit(1)
