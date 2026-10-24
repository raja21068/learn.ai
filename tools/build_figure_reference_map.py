"""Find figure-number/caption candidates in selected supplied PDFs.
Captions are locators only, not copies of the artwork or full source text."""
import json,fitz,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
source=json.loads((root/'assets/book-source-map.json').read_text())
paths={
'db':'/mnt/data/coronel_carlos_morris_steven_database_systems_design_impleme.pdf',
'rl':'/mnt/data/sutton_rs_barto_ag_reinforcement_learning_an_introduction.pdf',
'd2l':'/mnt/data/zhang_a_lipton_zc_li_m_smola_aj_dive_into_deep_learning.pdf'
}
result={}
for book,path in paths.items():
 doc=fitz.open(path); result[book]=[]
 for i,chapter in enumerate(source[book]):
  start=chapter['pdf']-1;end=source[book][i+1]['pdf']-1 if i+1<len(source[book]) else min(doc.page_count,start+35)
  if book=='db':prefix=str(i+1)+r'\.'
  elif book=='rl':prefix=str(i+1)+r'\.'
  else:prefix=str(i+1)+r'\.'
  found=[]; seen=set()
  for pi in range(start,min(end,doc.page_count)):
   lines=doc[pi].get_text(sort=True).splitlines()
   for li,line in enumerate(lines):
    m=re.match(r'^\s*(?:Figure|FIGURE|Fig\.)\s+('+prefix+r'\d+[a-z]?)\s+(.{6,130})$',line.strip())
    if not m:continue
    number,title=m.groups();title=title.strip()
    if (number in seen or not re.match(r'^[A-Z“(]',title) or re.search(r'^(?:shows|illustrates|depicts|includes|is implemented|uses|below|demonstrates|would|presents|provides)',title,re.I) or title.endswith(('.',':'))):continue
    title=re.sub(r'\s+',' ',title)[:105]
    # noisy lines in PDF columns occasionally include sentences; keep short caption-like titles only
    if len(title)>96:continue
    seen.add(number)
    found.append({'figure':number,'caption':title,'pdfPage':pi+1})
    if len(found)>=10:break
   if len(found)>=10:break
  result[book].append({'n':i+1,'figures':found})
  print(book,i+1,len(found),[(x['figure'],x['caption'][:22]) for x in found[:3]])
(root/'assets/book-figure-map.json').write_text(json.dumps(result,indent=2,ensure_ascii=True))
(root/'assets/book-figure-map.js').write_text('window.BOOK_FIGURE_MAP = '+json.dumps(result,ensure_ascii=True)+';\n')
