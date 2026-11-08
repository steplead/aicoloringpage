#!/usr/bin/env python3
"""Read-only, ordinary URL checks; do not hide stale custom-domain cache with query strings."""
import concurrent.futures, datetime, hashlib, html, importlib.util, json, pathlib, re, sys, urllib.request, urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('copycheck',ROOT/'scripts/check-printable-copy.py');copycheck=importlib.util.module_from_spec(spec);spec.loader.exec_module(copycheck)
base=sys.argv[1].rstrip('/');label=sys.argv[2]
slugs=['anime-owl-coloring-page','kawaii-lion-coloring-page','realistic-zebra-coloring-page','cartoon-cat-coloring-page','chibi-cat-coloring-page','steampunk-cupcake-coloring-page','mandala-coloring-page-for-adults']
paths=[f'/{locale}/printable/{slug}' for locale in ['en','es','fr','pt'] for slug in slugs]
ua='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def check(path):
    r={'path':path}
    try:
        response=urllib.request.urlopen(urllib.request.Request(base+path,headers={'User-Agent':ua}),timeout=60)
        source=response.read().decode();r.update(status=response.status,cache=response.headers.get('CF-Cache-Status'),age=response.headers.get('Age'),final_url=response.url)
        require=response.status==200 and response.url==base+path
        if not require:raise AssertionError('Unexpected status or redirect')
        r['title']=html.unescape(re.search(r'<title>(.*?)</title>',source,re.S)[1])
        r['description']=html.unescape(re.search(r'<meta name="description" content="([^"]*)"',source)[1])
        r['raw_everyone_count']=source.count('Everyone')
        locale=path.split('/')[1];actual=copycheck.inspect(source,locale);expected=copycheck.inspect((ROOT/'.vercel/output/static'/(path.lstrip('/')+'.html')).read_text(),locale)
        r.update(actual);r['matches_build']=actual==expected
        if actual!=expected:raise AssertionError('Rendered copy does not match the verified build')
        r['passed']=True
    except Exception as exc:r.update(passed=False,error=str(exc))
    return r
with concurrent.futures.ThreadPoolExecutor(6) as pool:checks=list(pool.map(check,paths))
report={'base':base,'checked_at':datetime.datetime.now().astimezone().isoformat(),'timezone':'Asia/Shanghai UTC+8','normal_urls_only':True,'checked':len(checks),'passed':all(x['passed'] for x in checks),'checks':checks}
(ROOT/f'evidence/printable-copy-{label}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2))
for x in checks:
    if not x['passed']:print(x['path'],x.get('cache'),x['error'])
if not report['passed']:sys.exit(1)
