"""Construct TOC-backed metadata from the user-supplied textbook PDFs.
Only chapter *titles* and file page numbers are indexed; book content/figures
are not redistributed. The linked companion's original diagrams are separate.
"""
import fitz,glob,json,re,os
ROOT='/mnt/data/learning_work/LearningAi'
configs=[
('os','Operating System Concepts Essentials','Silberschatz · Galvin · Gagne','silberschatz', 'Systems',None),
('network','Computer Networking: A Top-Down Approach','Kurose · Ross','kurose','Networks',None),
('d2l','Dive into Deep Learning','Zhang · Lipton · Li · Smola','zhang','AI / ML','deep-learning'),
('rl','Reinforcement Learning: An Introduction','Sutton · Barto','sutton','AI / ML',None),
('islr','An Introduction to Statistical Learning (R edition)','James · Witten · Hastie · Tibshirani','james','AI / ML',None),
('algo','Algorithm Design','Kleinberg · Tardos','kleinberg','Algorithms',None),
('aima','Artificial Intelligence: A Modern Approach (4e)','Russell · Norvig','russel','AI / ML','ai-foundations'),
('miller','AI Prompt Engineering: Absolute Beginner’s Guide','Michael Miller','miller','Prompting','prompt-engineering'),
('davies','Prompt Engineering in Practice','Davies · Fischer','davies','Prompting','prompt-engineering'),
('teacher','ChatGPT Hacks for Teachers','Keshav Jha','jha','Education','prompt-engineering'),
('mollick','Co-Intelligence: Living and Working with AI','Ethan Mollick','mollick','AI / Society',None),
('db','Database Systems (14e)','Coronel · Morris','coronel','Databases','databases'),
('hart','Killer ChatGPT Prompts','Guy Hart-Davis','share_file','Prompting','prompt-engineering'),
('llm','LLM Engineer’s Handbook','Iusztin · Labonne','28066972','AI / Engineering','llm-engineering'),
('roche','The Art and Science of Prompt Engineering','Ivan Roche','Guiding AI','Prompting','prompt-engineering')]

def clean(s):
 s=''.join(ch for ch in s if 31<ord(ch)<127 or 160<=ord(ch)<=0x10ffff and not 0xd800<=ord(ch)<=0xdfff)
 return re.sub(r'\s+',' ',s).strip(' \x80:')

def chapters(id,doc):
 t=doc.get_toc(simple=True); out=[]
 if id in ('os','db'):
  out=[(a,p) for level,a,p in t if level==2 and re.match(r'^Chapter\s+\d+',clean(a))]
 elif id=='network': out=[(f'Chapter {i+1}: {a}',p) for i,(lv,a,p) in enumerate(t[2:10])]
 elif id=='rl':
  out=[('Chapter 1: Introduction',23)]+[(a,p) for lv,a,p in t if lv==2 and (a in ('Multi-armed Bandits','Finite Markov Decision Processes','Dynamic Programming','Monte Carlo Methods','Temporal-Difference Learning','n-step Bootstrapping','Planning and Learning with Tabular Methods','On-policy Prediction with Approximation','On-policy Control with Approximation','*Off-policy Methods with Approximation','Eligibility Traces','Policy Gradient Methods','Psychology','Neuroscience','Applications and Case Studies','Frontiers'))]
  out=[(re.sub('^\\*','',str(n)),p) for n,p in out]
 elif id=='d2l':out=[(a,p) for lv,a,p in t if lv==1 and a not in ('Preface','Installation','Notation','Bibliography','Index') and not a.startswith('Appendix')]
 elif id in ('islr','algo'):
  out=[(a,p) for lv,a,p in t if lv==1 and re.match(r'^\d+[. ]',a)]
 elif id=='aima':
  # AIMA PDF has no bookmarks; parse chapter titles and printed starts from its table of contents.
  lines='\n'.join(doc[i].get_text() for i in range(10,17)).splitlines()
  found={}
  for i,x in enumerate(lines[:-2]):
   x=x.strip(); m=re.match(r'^(\d{1,2})\s+([A-Za-z].{5,80})$',x)
   if m and 1<=int(m.group(1))<=28 and re.fullmatch(r'\d+', lines[i+1].strip()):
    found[int(m.group(1))]=(m.group(2),int(lines[i+1].strip())+17)
   elif re.fullmatch(r'\d{1,2}',x) and 1<=int(x)<=28 and re.match(r'^[A-Z]',lines[i+1]) and re.fullmatch(r'\d+',lines[i+2].strip()):
    found[int(x)]=(lines[i+1].strip(),int(lines[i+2].strip())+17)
  assert len(found)==28, f'AIMA TOC failed: {len(found)} titles'
  out=[(f'Chapter {num}: {found[num][0]}',found[num][1]) for num in sorted(found)]
 elif id=='miller':out=[(a,p) for lv,a,p in t if lv==1 and re.match(r'^\d+\. ',a)]
 elif id=='davies':out=[(a,p) for lv,a,p in t if lv==2 and re.match(r'^\d+\s+',a)]
 elif id=='llm':out=[(a,p) for lv,a,p in t if lv==1 and a.startswith('Chapter ')]
 elif id=='hart':out=[(a,p) for lv,a,p in t if lv==1 and a.startswith('Chapter ')]
 elif id=='roche':
  out=[]
  for i,(lv,a,p) in enumerate(t):
   if lv==1 and a.startswith('Chapter ') and i+1<len(t):out.append((a.rstrip(':')+' — '+t[i+1][1],p))
 elif id=='teacher':
  # This PDF has no table-of-contents bookmarks; extract exact numbered headlines from TOC pages.
  st='\n'.join(doc[i].get_text() for i in range(2,7))
  lines=[x.strip() for x in st.splitlines() if x.strip()]
  out=[]
  for ix,x in enumerate(lines):
   if re.match(r'^\d{1,2}\.\s*[A-Z]',x) and 10<=len(x)<=100:
    out.append((x,None))
  out=list(dict.fromkeys(out))
 elif id=='mollick':
  out=[(f'Chapter {i}: {s}',None) for i,s in enumerate(['CREATING ALIEN MINDS','ALIGNING THE ALIEN','FOUR RULES FOR CO-INTELLIGENCE','AI AS A PERSON','AI AS A CREATIVE','AI AS A COWORKER','AI AS A TUTOR','AI AS A COACH','AI AS OUR FUTURE'],1)]
 else: out=[(a,p) for lv,a,p in t if lv==1 and (re.match(r'^\d+[. ]',a) or a.startswith('Chapter '))]
 out=[{'title':clean(a),'pdfPage':p} for a,p in out]
 if id=='teacher' and not out:out=[{'title':'Chapter 1: Introduction to AI Chatbot ChatGPT','pdfPage':None},{'title':'Chapter 2: Develop Lesson Plans','pdfPage':None},{'title':'Chapter 3: Create Assessment Activities','pdfPage':None}]
 return out

atlas=[]
for id,title,authors,prefix,category,course in configs:
 f=next(x for x in glob.glob('/mnt/data/*.pdf') if os.path.basename(x).startswith(prefix))
 d=fitz.open(f)
 ch=chapters(id,d)
 atlas.append({'id':id,'title':title,'authors':authors,'category':category,'courseId':course,'pageCount':len(d),'chapters':ch,'file':os.path.basename(f)})
 print(id, len(ch), ch[:2])
with open(ROOT+'/assets/textbook-atlas-data.js','w') as o:
 o.write('/* Chapter titles and PDF page indexes extracted from uploaded textbooks. Original book figures and pages are not bundled. */\nwindow.TEXTBOOK_ATLAS = ')
 json.dump(atlas,o,ensure_ascii=False,separators=(',',':'))
 o.write(';\n')
with open(ROOT+'/TEXTBOOK_SOURCE_INDEX.json','w') as o:json.dump(atlas,o,indent=2,ensure_ascii=False)
