import pathlib,csv,json
root=pathlib.Path(__file__).resolve().parents[1]
rows=[]
with (root/'TEXTBOOK_COVERAGE_v3.csv').open('r',encoding='utf-8-sig',newline='') as f:
 rows=list(csv.DictReader(f))
source=json.loads((root/'assets/islr-source-map.json').read_text(encoding='utf-8'))
for row in rows:
 book=row['Book ID'];n=int(row['Chapter no.'])
 if book=='islr':
  src=source[n-1];row['Current teaching status']='Expanded guided study—NOT fully taught'
  row['Section locators']=str(len(src['sections']))
  row['Candidate figure locators']=str(1 if n in (2,5,9) else 0)
  row['Companion route']=f'#/book/islr/chapter/{n}'
  row['Remaining work']='Guide and R example exist; most original book subsections, exercises, figures and labs still require granular audit'
 row['Source basis']='Uploaded ISLR R edition' if book=='islr' else 'Uploaded textbook (v3 source mapping)'
 row['Practice code']='Original base-R practice script' if book=='islr' else 'Prior v3 course examples where present'
 row['Visual status']='Interactive original SVG QA checked' if book=='islr' else ('Prior v3 original interactive diagrams' if row['Companion route'] else 'No new chapter-specific chart')
 row['Completeness']='Not full textbook coverage'
 out=['Book ID','Textbook','Chapter no.','Source TOC chapter title','PDF chapter page','Current teaching status','Section locators','Candidate figure locators','Companion route','Source basis','Practice code','Visual status','Completeness','Remaining work']
 with (root/'TEXTBOOK_COVERAGE_v4.csv').open('w',newline='',encoding='utf-8-sig') as f:
  w=csv.DictWriter(f,fieldnames=out);w.writeheader();w.writerows(rows)
print('records',len(rows),'newly guided',sum(r['Book ID']=='islr' for r in rows))
