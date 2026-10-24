"""Extract exact PDF chapter/section headings and PDF-page locators for original learning guides.
No publisher prose, pages or figures are redistributed."""
import json,fitz,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
items={
'db':('/mnt/data/coronel_carlos_morris_steven_database_systems_design_impleme.pdf',2,3),
'rl':('/mnt/data/sutton_rs_barto_ag_reinforcement_learning_an_introduction.pdf',2,3),
'd2l':('/mnt/data/zhang_a_lipton_zc_li_m_smola_aj_dive_into_deep_learning.pdf',1,2),
'os':('/mnt/data/silberschatz_a_galvin_pb_gagne_g_operating_system_concepts.pdf',2,3),
'network':('/mnt/data/kurose_jf_ross_kw_computer_networking_a_topdown_approach.pdf',1,2),
}
out={}
for key,(path,chapter_lvl,section_lvl) in items.items():
 doc=fitz.open(path); toc=doc.get_toc(); chapters=[]
 if key in ('db','os'):
  chapter_positions=[i for i,(lv,t,p) in enumerate(toc) if lv==2 and re.search(r'^Chapter\s+\d+(?::|\s)',t)]
 elif key=='network':
  chapter_positions=[i for i,(lv,t,p) in enumerate(toc) if lv==1 and 33<=p<=639]
 elif key=='rl':
  names=['Introduction','Multi-armed Bandits','Finite Markov Decision Processes','Dynamic Programming','Monte Carlo Methods','Temporal-Difference Learning','n-step Bootstrapping','Planning and Learning with Tabular Methods'];chapter_positions=[i for i,(lv,t,p) in enumerate(toc) if t in names]
 else:
  chapter_positions=[i for i,(lv,t,p) in enumerate(toc) if lv==1 and t in ('Introduction','Preliminaries','Linear Neural Networks for Regression','Linear Neural Networks for Classification','Multilayer Perceptrons',"Builders' Guide")]
 for idx,i in enumerate(chapter_positions):
  lv,t,page=toc[i]; end=chapter_positions[idx+1] if idx+1<len(chapter_positions) else next((j for j in range(i+1,len(toc)) if toc[j][0]<=lv),len(toc))
  sections=[]
  for l,st,pg in toc[i+1:end]:
   if l==(2 if key=='rl' and idx==0 else section_lvl):
    st=re.split('[\udc80-\udcff]',st,maxsplit=1)[0].strip(); st=re.sub(r'\s+',' ',st)
    if re.match(r'^(Summary|Key Terms|Review Questions|Problems)',st):continue
    sections.append({'name':st,'pdfPage':pg})
  chapters.append({'n':idx+1,'pdf':page,'title':re.split('[\udc80-\udcff]',t,maxsplit=1)[0].strip(), 'sections':sections})
 # RL first 8 chapters, note levels across Parts: chapter positions selection above excludes most later? take first 8
 if key=='rl': chapters=chapters[:8]
 if key=='network':
  # Kurose/Ross global edition has chapter PDF bookmarks, but no subsection bookmarks.
  # Its table of contents is text, with numbered headings and printed page numbers.
  nums={}
  for pno in range(22,29):
   lns=[line.strip() for line in doc[pno].get_text().splitlines() if line.strip()]
   for q,line in enumerate(lns):
    mat=re.fullmatch(r'([1-8]\.\d+)',line)
    if not mat:continue
    pieces=[]; pp=None
    for nxt in lns[q+1:q+6]:
     if re.fullmatch(r'\d{1,4}',nxt):pp=int(nxt);break
     if re.match(r'^[1-8]\.\d+',nxt):break
     pieces.append(nxt)
    if pp is not None and pieces:
     num=mat.group(1);chap=int(num.split('.')[0]);nums.setdefault(chap,[]).append({'name':num+' '+' '.join(pieces),'pdfPage':pp+2})
  for ch in chapters:ch['sections']=nums.get(ch['n'],[])

 out[key]=chapters
 (root/'assets'/'book-source-map.json').write_text(json.dumps(out,indent=2,ensure_ascii=True),encoding='utf-8')
 (root/'assets'/'book-source-map.js').write_text('window.BOOK_SOURCE_MAP = '+json.dumps(out,ensure_ascii=True)+';\n',encoding='utf-8')
 print(key,len(chapters),'source subsections',sum(len(c['sections']) for c in chapters))
