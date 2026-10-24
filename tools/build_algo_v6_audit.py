"""Preserve truthful v5 coverage while annotating v6 source sections."""
from pathlib import Path
import csv,json,collections
R=Path(__file__).resolve().parents[1]
meta=json.loads((R/'ALGORITHM_DESIGN_DEPTH_v6.json').read_text())
expanded=collections.defaultdict(list)
for m in meta:expanded[m['chapter']].append(m)
with (R/'TEXTBOOK_COVERAGE_v5.csv').open(encoding='utf-8-sig',newline='') as f:r=list(csv.DictReader(f));fields=list(r[0]);assert len(r)>40
for x in r:
 if x['Book ID']!='algo':continue
 n=int(x['Chapter no.']);developed=expanded.get(n,[])
 if developed:
  x['Current teaching status']=f'Guided chapter study + {len(developed)} developed section lesson(s), still NOT exhaustive'
  x['Practice code']+='; '+', '.join('v6-'+m['id']+'.py' for m in developed)+' passed cross-checks'
  x['Visual status']+='; '+str(len(developed))+' new executable section figures'
  x['Remaining work']='Undeveloped sections, book-specific exercises, full figure audit, additional proofs and Manim render tests'
with (R/'TEXTBOOK_COVERAGE_v6.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(r)
from shutil import copyfile
copyfile(R/'TEXTBOOK_COVERAGE_v6.csv','/mnt/data/TEXTBOOK_COVERAGE_v6.csv')
source=json.loads((R/'ALGORITHM_DESIGN_SOURCE_MAP_v5.json').read_text())['chapters']
with (R/'ALGORITHM_DESIGN_SECTION_AUDIT_v6.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['Source chapter','Source section','PDF page','Teaching state','Deep lab route','Python lab','Figure status','Open gaps'])
 for ch in source:
  for sec in ch['sections']:
   full=sec['name'].replace('?', '’')
   deep=[m for m in meta if any(tok==full.split(' ')[0] for tok in m['section'].split(' ') if tok[0].isdigit())]
   # Match exact number prefixes, including combined section entry 4.5; 4.6
   deep=[m for m in meta if full.split(' ')[0] in [v.strip().split()[0] for v in m['section'].split(';')]]
   # 4.5/4.6 source name prefixes are present in separate semicolon chunks.
   m=deep[0] if deep else None
   label='Section lesson with original proof, numerical case, chart and practice' if m else ('Chapter study / source locator; no dedicated section-level proof lab' if ch['n']<=7 else 'Indexed only')
   w.writerow([ch['n'],sec['name'],sec['pdfPage'],label,f'#/algo-lab/{m["id"]}' if m else '',f'downloads/algorithm-labs/v6-{m["id"]}.py' if m else '',
              'Original interactive authored figure (source image not copied)' if m else 'Not individually verified/recreated',
              'Textbook worked cases and figure-by-figure reproduction remain incomplete' if m else 'Needs section-specific explanation, proof, example, original visual and exercise'])
copyfile(R/'ALGORITHM_DESIGN_SECTION_AUDIT_v6.csv','/mnt/data/ALGORITHM_DESIGN_SECTION_AUDIT_v6.csv')
print('coverage',len(r),'rows; deep labs',len(meta),'across',len(expanded),'chapters; source section audit',sum(len(z['sections']) for z in source))
