#!/usr/bin/env python3
"""Regression guard for rendered printable copy, independent of source translations."""
import collections, html, json, pathlib, re
from html.parser import HTMLParser
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / '.vercel/output/static'
class Visible(HTMLParser):
    def __init__(self): super().__init__(); self.skip=0; self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.skip=max(0,self.skip-1)
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)
def text(markup):
    p=Visible();p.feed(markup);return ' '.join(' '.join(p.parts).split())
def require(ok,message):
    if not ok:raise AssertionError(message)
# Match phrases, not arbitrary English-looking words: Anime, Kawaii, Chibi,
# Cartoon, Realistic etc. are design labels, AI Coloring Page is the brand,
# and French "de style" is ordinary French (not English filler).
ENGLISH = re.compile(r'\b(?:Coloring Pages?|Did you know|Everyone|Download this|coloring sheets with AI|Try using soft pastels|Mix marker and colored pencil|Coloring helps improve|Free printable|AI Generated|Print Page|Download PDF|Share & Embed|favorite subject for)\b|\b(?:Kawaii|Anime|Chibi|Realistic|Cartoon|Steampunk) style\b',re.I)
def inspect(source,locale):
    require('Everyone' not in source, 'Everyone leaked into HTML, including serialized data')
    title=html.unescape(re.search(r'<title>(.*?)</title>',source,re.S)[1])
    desc=html.unescape(re.search(r'<meta name="description" content="([^"]*)"',source)[1])
    main=re.search(r'<main\b[^>]*>(.*?)</main>',source,re.S)[1]
    body=text(main)
    h1=text(re.search(r'<h1\b[^>]*>(.*?)</h1>',main,re.S)[1])
    require(h1 in title, 'Metadata title must follow localized H1')
    require('Everyone' not in title+' '+desc+' '+body,'Everyone leaked')
    if locale!='en':
        # French 'de style' is correct; elsewhere an isolated 'style' is English filler.
        filler = re.search(r'(?<!de )\bstyle\b' if locale=='fr' else r'\bstyle\b', title+' '+desc+' '+body, re.I)
        require(not filler, 'English style filler')
        for label,value in [('title',title),('description',desc),('body',body)]:
            m=ENGLISH.search(value.replace('AI Coloring Page',''))
            require(not m,f'{locale} {label}: English fragment {m[0] if m else ""}')
        for script in re.findall(r'<script type="application/ld\+json">(.*?)</script>',source,re.S):
            m=ENGLISH.search(script.replace('AI Coloring Page',''));require(not m,'English structured data')
        for alt in re.findall(r'\balt="([^"]*)"',main):require(not ENGLISH.search(html.unescape(alt)),'English image alt')
    fact=re.search(r'data-style-fact="([^"]+)"[^>]*>(.*?)</span>',main,re.S)
    tips=re.findall(r'data-style-tip="([^"]+)"[^>]*>(.*?)</span>',main,re.S)
    require(fact and len(tips)==2,'Missing grouped copy markers')
    key=fact[1]
    if key!='generic':require(key.lower() in text(fact[2]).lower(),f'Fact missing style {key}')
    return {'title':title,'description':desc,'fact':text(fact[2]),'tips':[text(x[1]) for x in tips],'style_group':key,'body_characters':len(body),
            'related':[{'href':html.unescape(href),'title':text(anchor)} for href,anchor in re.findall(r'<a[^>]*href="([^"]*/printable/[^"]+)"[^>]*>(.*?)</a>',main,re.S)]}
def run():
    report={'checked':{},'samples':{},'unique_tips':{}}
    for locale in ['en','es','fr','pt']:
        messages=json.loads((ROOT/'messages'/f'{locale}.json').read_text())
        filename='seo-pages.json' if locale=='en' else f'seo-pages-{locale}.json'
        data={p['slug']:p for p in json.loads((ROOT/'src/data'/filename).read_text())}
        count=0;groups=collections.defaultdict(set)
        for file in (OUT/locale/'printable').glob('*.html'):
            try:
                item=inspect(file.read_text(),locale)
                for link in item['related']:
                    page=data[link['href'].rsplit('/',1)[-1]]
                    if locale!='en':require(('St Patricks Day' if page['subject'] == "St. Patrick's Day" else page['subject']) in messages['Data'], f'Missing noun translation: {page["subject"]}')
                    subject=messages['Data'].get('St Patricks Day' if page['subject'] == "St. Patrick's Day" else page['subject'], page['subject'])
                    require(subject in link['title'],f'YMAL missing subject {subject}')
                    if page['style'].lower()!='standard':require(page['style'] in link['title'],f'YMAL missing style {page["style"]}')
                groups[item['style_group']].add(tuple(item['tips']))
                if file.stem in [f'{s}-cat-coloring-page' for s in ['anime','kawaii','realistic','cartoon','chibi','steampunk']]+['mandala-coloring-page-for-adults']:
                    report['samples'][f'{locale}/{file.stem}']=item
                count+=1
            except Exception as exc:raise AssertionError(f'{file}: {exc}') from exc
        require(count==3017,f'Published page count changed: {locale}: {count}')
        primary=['anime','kawaii','realistic','cartoon','chibi']
        require(all(len(groups[s])==1 for s in primary),'Style tips not stable')
        require(len({next(iter(groups[s])) for s in primary})==5,'Tips must differ across five styles')
        report['checked'][locale]=count
        report['unique_tips'][locale]={k:len(v) for k,v in groups.items()}
    (ROOT/'evidence/printable-copy-built.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('Printable localized-copy checks PASS:',report['checked'])
if __name__=='__main__':run()
