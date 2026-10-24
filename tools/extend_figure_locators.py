"""Index verified PDF figure identifiers and abbreviated captions, never copy source images."""
import json,re,pathlib,fitz
root=pathlib.Path(__file__).resolve().parents[1]
sources=json.loads((root/'assets/book-source-map.json').read_text())
figs=json.loads((root/'assets/book-figure-map.json').read_text())
files={
'rl':'/mnt/data/sutton_rs_barto_ag_reinforcement_learning_an_introduction.pdf',
'd2l':'/mnt/data/zhang_a_lipton_zc_li_m_smola_aj_dive_into_deep_learning.pdf',
'os':'/mnt/data/silberschatz_a_galvin_pb_gagne_g_operating_system_concepts.pdf',
'network':'/mnt/data/kurose_jf_ross_kw_computer_networking_a_topdown_approach.pdf'
}
capre=re.compile(r'^\s*(?:Figure|FIGURE)\s+(\d+(?:\.\d+){1,2}[a-z]?)\s*(?::|[♦\u2002\-])?\s*(.{0,130})$')
for key,path in files.items():
  doc=fitz.open(path);figs[key]=[]
  chapters=sources[key]
  for ci,c in enumerate(chapters):
    lo=c['pdf']-1;hi=chapters[ci+1]['pdf']-1 if ci+1<len(chapters) else min(lo+65,len(doc))
    found=[];seen=set()
    for pg in range(lo,hi):
      lines=doc[pg].get_text().splitlines() # D2L captions are separate drawing blocks
      for j,line in enumerate(lines):
        match=capre.match(line.strip())
        if not match:continue
        code,t=match.groups()
        if not code.startswith(str(ci+1)+'.') or code in seen:continue
        title=t.strip().lstrip('♦ :\u2002')
        # Exclude ordinary references such as 'Figure 3.4 shows...'; captions describe, not refer.
        if title.lower().startswith(('shows ','illustrates ','depicts ','contains ','has ','is ','can ','would ','presents ')):continue
        if not title and j+1<len(lines):title=lines[j+1].strip()
        if not title or len(title)<5 or title[0].islower() or len(title)>115:continue
        if re.search(r'\b(in Figure|from Figure|to Figure)\b',title):continue
        # Figure labels are copied as metadata only; the actual artwork stays in user PDF.
        title=re.sub(r'\s+',' ',title)[:90]
        found.append({'figure':code,'caption':title,'pdfPage':pg+1});seen.add(code)
        if len(found)>=18:break
      if len(found)>=18:break
    figs[key].append({'n':ci+1,'figures':found})
  print(key,sum(len(x['figures']) for x in figs[key]),'figure labels')
(root/'assets/book-figure-map.json').write_text(json.dumps(figs,indent=2,ensure_ascii=True),encoding='utf8')
(root/'assets/book-figure-map.js').write_text('window.BOOK_FIGURE_MAP = '+json.dumps(figs,ensure_ascii=True)+';\n',encoding='utf8')
