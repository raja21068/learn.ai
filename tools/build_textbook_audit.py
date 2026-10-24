"""Emit a machine-checkable chapter gap tracker and honest migration audit."""
import csv,json,os,datetime
root='/mnt/data/learning_work/LearningAi'
a=json.load(open(root+'/TEXTBOOK_SOURCE_INDEX.json'))
example_pages={'os':[291,393], 'network':[213], 'd2l':[124,466], 'rl':[141,95], 'islr':[30,188], 'algo':[141,277], 'aima':[80,429], 'db':[220,501], 'llm':[128,290], 'davies':[214,190], 'miller':[110], 'teacher':[], 'mollick':[53], 'hart':[87], 'roche':[25]}
with open(root+'/CHAPTER_COVERAGE_TRACKER.csv','w',newline='',encoding='utf-8-sig') as out:
 w=csv.writer(out);w.writerow(['Book','Source PDF page count','Chapter / contents entry','Start page in supplied PDF','Related existing course','Chapter-level status','Expanded original topic guide','Next required work'])
 for b in a:
  for c in b['chapters']:
   focus=(c['pdfPage'] in example_pages.get(b['id'],[]) if c['pdfPage'] is not None else False)
   w.writerow([b['title'],b['pageCount'],c['title'],c['pdfPage'] or 'not indexed',b['courseId'] or 'No related full course','INDEX ONLY — chapter not fully audited','Yes, one worked topic example' if focus else 'No mapped example','Read whole section; capture subtopics/formulas/figures; rewrite as original lesson; verify labs and references'])
legacy= [b for b in a if not b['courseId']]
lines=['# LearningAI textbook and figure coverage audit', '', 'Audit date: 2026-10-24.', '',
'## What the ZIP actually contained', '',
'- Seven advanced course files initially defined 127 lessons; feature scripts append ten project/experiment lessons at browser runtime, for **137** lessons in the seven courses. There are additional legacy introductory courses in the catalog. This is not a measure of book coverage.',
'- Existing code includes simulations, quizzes and labs, but these do not systematically trace every source chapter, mathematical derivation, book figure or experiment.',
'- Several site reference strings cite books that were **not** included in the uploaded material (such as *Hands-On Machine Learning* by Géron and *Agentify*). Those alignments were not treated as verified against a PDF.',
'- Of the 16 uploaded PDF files, two files named `28066972.pdf` and `28066972(1).pdf` appear to be duplicate copies of the *LLM Engineer’s Handbook*; one was indexed. **15 distinct titles** are represented.',
'', '## What this revision adds', '',
'- A searchable textbook library in the existing single-page application, `#/books`, with 228 source-indexed table-of-contents entries across 15 books.',
'- Fifteen first-topic worked guides with original self-contained SVG figures/graphs, plus ten further concept guides with worked reasoning and original pipeline diagrams: **25** topic guides total.',
'- Editable five interactive figure types: FCFS/SJF CPU scheduling, simplified M/M/1 queueing load, TD(0) learning update, illustrative bias–variance curves, gradient-descent step sizes. Other diagrams include search/shortest paths and ER-normalization.',
'- Direct companion cross-links from the six existing courses that have a compatible uploaded book; the rest link to the library.',
'- A chapter-coverage CSV containing every source entry, location and unmet verification steps, without claiming chapters are fully covered.',
'- The provided publisher PDFs and their copyrighted figures are **not** redistributed in the site ZIP. New illustrations are independently drawn.',
'', '## Source index (not a chapter-completeness score)', '',
'| Uploaded textbook | PDF pages | Chapter / contents entries | Related course already in site |',
'|---|---:|---:|---|']
for b in a:
 lines.append(f"| {b['title']} | {b['pageCount']} | {len(b['chapters'])} | {b['courseId'] or 'None'} |")
lines+=['','**Important:** A row in this list means a chapter heading was retrieved from the PDF table of contents or bookmarks; it does **not** mean the whole chapter has been studied, rewritten, or illustrated.',
'', '## Highest-priority remaining omissions', '',
'1. **Operating systems — 15 chapters:** expand processes/threads, race conditions, semaphores, deadlock, scheduling, paging, TLB, page replacement, file systems, protection and Linux case study into stepwise lessons with schedulers and memory traces.',
'2. **Networking — 8 chapters:** add top-down protocol-stack course with encapsulation, HTTP/DNS, reliable data transfer, retransmission timelines, TCP congestion plots, routing, LAN/Wi-Fi and security. Separate analytical plots from real-world measurements.',
'3. **Reinforcement learning — 17 chapter-scale topics:** bandits, MDPs, Bellman equations, DP, Monte Carlo, TD, SARSA/Q-learning, function approximation, eligibility traces, and policy gradients; provide reproducible episode traces with seeds.',
'4. **Statistical learning — 10 chapters:** train/test splitting and data leakage, regression/classification, model-selection, cross-validation, regularization, GAMs, trees, SVMs and clustering; add model/diagnostic graphs using actual runnable data rather than illustrative curves.',
'5. **Algorithm design — 13 chapters:** proofs and counterexamples for greedy algorithms, recurrence tracing for dynamic programming, flow-network residuals and cuts, NP-completeness reductions, approximation bounds and randomized algorithms.',
'6. **Existing AI / DL / DB courses:** add source-specific derivations and figure/algorithm cross-references, and verify equivalence of their examples to the uploaded edition; one short course lesson cannot substitute for a full textbook chapter.',
'7. **Prompting/LLM/teacher resources:** expand structured test sets, prompt regressions, prompt-injection threat models, practical educator rubrics, engineering failure traces and corrected outputs; do not copy publisher prompt collections wholesale.',
'', '## Verification and limitations', '',
'- Ran JavaScript syntax checks; original course Node test suites; existing end-to-end offline Chromium course checks; and new desktop/mobile companion smoke tests.',
'- The new chapter indexes are generated directly from PDF bookmarks or page-extracted contents, but not every subsection or embedded figure was individually catalogued. Some books lack usable bookmarks and not every chapter has a PDF start-page locator.',
'- Focal studies use textbook concepts and original worked values, not claims about data from published experiments. Schematic plots (M/M/1, bias–variance, gradient descent) are labelled as examples and do not assert source-published data.',
'- No claim is made that all 228 chapters have been fully converted. The coverage tracker explicitly marks **all entries as incomplete at chapter level**, which is the appropriate baseline for a true full-book migration.',
'- This ZIP remains a static website; optional CDN dependencies for its original SQL/Python labs still need network access. The new textbook library and SVG diagrams require no CDN.',
'', '## Reproducing the checks', '',
'```bash', 'python tools/build_textbook_atlas.py    # Needs the input PDFs in /mnt/data; prebuilt JS+JSON are included',
'python tools/build_textbook_audit.py', 'node tests/content-bank.test.cjs',
'python tests/browser-smoke.py','python tests/textbook-atlas-smoke.py','```','']
open(root+'/TEXTBOOK_AUDIT_AND_BACKLOG.md','w',encoding='utf-8').write('\n'.join(lines))
print('Wrote audit for',len(a),'books and',sum(len(b['chapters']) for b in a),'chapter entries')
