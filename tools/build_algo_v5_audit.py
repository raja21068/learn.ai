from pathlib import Path
import json,csv,ast,subprocess
root=Path(__file__).resolve().parents[1]
idx=json.loads((root/'ALGORITHM_DESIGN_SOURCE_MAP_v5.json').read_text())['chapters']
prev=Path('/mnt/data/TEXTBOOK_COVERAGE_v4.csv')
with prev.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
fields=list(rows[0])
figs={1:2,2:1,3:2,4:2,5:2,6:1,7:1}
for row in rows:
 if row['Book ID']!='algo':continue
 n=int(row['Chapter no.']);ch=idx[n-1]
 row['Section locators']=str(len(ch['sections']))
 row['Candidate figure locators']=str(figs.get(n,0))
 row['Source basis']='PDF bookmark hierarchy from uploaded Kleinberg & Tardos, Algorithm Design; section page anchors 1-indexed'
 if n<=7:
  row['Current teaching status']='Guided original chapter study—NOT exhaustive section coverage'
  row['Companion route']=f'#/book/algo/chapter/{n}'
  row['Practice code']=f'Executable Python lab ch{n:02d}; passed local assertions'
  row['Visual status']='Original interactive step-trace with numerical test'
  row['Remaining work']='Detailed individual treatment of all section examples, exercises and textbook figures; render Manim locally'
 else:
  row['Current teaching status']='Indexed only—NO chapter guide'
  row['Companion route']=''
  row['Practice code']='None'
  row['Visual status']='No new original chart'
  row['Remaining work']='Full explanation, proofs, executable labs, section-by-section figure audit and exercises'
with (root/'TEXTBOOK_COVERAGE_v5.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
with Path('/mnt/data/TEXTBOOK_COVERAGE_v5.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
core={1:['1.1'],2:['2.1','2.2','2.3','2.4','2.5'],3:['3.1','3.2','3.3','3.4','3.5','3.6'],4:['4.1'],5:['5.1','5.3'],6:['6.1','6.2'],7:['7.1','7.2']}
with (root/'ALGORITHM_DESIGN_SECTION_AUDIT_v5.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['Source chapter','Section heading from PDF bookmark','PDF page','Current explanation level','Figure-by-figure checked?','Remaining work'])
 for ch in idx:
  for x in ch['sections']:
   prefix=x['name'].lstrip('*').split(' ')[0]
   level=('Original substantial conceptual explanation, not full section reproduction' if ch['n']<=7 and prefix in core.get(ch['n'],[])
    else 'Contextual mention only or source locator' if ch['n']<=7 else 'Indexed only, not taught')
   w.writerow([ch['n'],x['name'],x['pdfPage'],level,'No (selected figure locators only)','Read subsection, check proofs/examples, add independent exercises/figure interactive'])
report=f'''# LearningAI v5 — Algorithm Design source-first extension

## Scope and verifiable deliverables

- Continued **v4**, not a replacement: existing 63 chapter guides in six textbooks retained.
- Introduced **Algorithm Design** by Jon Kleinberg and Éva Tardos (uploaded 864-page PDF) as a normal course with **7 lessons** (`#/course/algorithm-design`) and seven corresponding guided long-form pages (`#/book/algo/chapter/1` through `/7`).
- Seven new pages contain **44 separately authored concept explanations, 7 pseudocode walkthroughs, 7 explicit correctness arguments, 7 numerical worked examples, 7 original interactive SVG step-traces, 7 exercises with answers, 14 critical-review questions, and 7 in-course quizzes**.
- Indexed **13 source chapters and 98 primary section bookmarks**, with exact PDF page locations. This is a navigable source map, **not 98 completed lessons**.
- Added 11 selected source-figure locators from captions in the uploaded PDF (no publisher artwork or original PDF redistributed). The original figures are accessible by selecting the book in the browser's existing local-only PDF reader.
- Added seven runnable standalone Python labs with deterministic assertions in `downloads/algorithm-labs/`. Each was run successfully with local Python 3.
- Added four Manim Community animation **source** scenes in `video/manim/algorithm_design_scenes.py`. Python parser check passed; actual rendered videos have **not** been tested because Manim is not installed.

## Textbook accuracy

| Chapter | Added instructional focus | Sections in source map | Status |
|---|---|---:|---|
'''
for ch in idx:
 focus=['Stable matching, proofs and proposer optimality','Asymptotic analysis and implementation','BFS/DFS and graph structure','Interval greedy proof and limits','Divide-and-conquer and inversions','Weighted scheduling DP with traceback','Augmenting paths and min-cut proof'][ch['n']-1] if ch['n']<=7 else 'No long-form lesson yet'
 report+=f"| {ch['n']} | {focus} | {len(ch['sections'])} | {'Guided—partial' if ch['n']<=7 else 'Indexed only'} |\n"
report+='''
### Verification performed

- New Chromium smoke test: 7 guided routes, 7 course lesson routes, SVG controls respond, code blocks, source links, quizzes, mobile viewport and answer reveals.
- Independent JavaScript state tests: deferred-acceptance partners, interval scheduling decisions, weighted interval DP values, BFS ordering and max-flow endpoint.
- Seven local Python labs executed and all built-in assertion tests passed.
- Existing v4 ISLR and v3 textbook guides passed browser regression tests.
- SVG charts are original; illustrative data are invented explicitly and are not represented as publisher study results.

### Remaining gaps and risks

1. **Chapters 8–13 are indexed but do not have full guided pages**: NP-completeness, PSPACE, parameterized tractability, approximation, local search and randomized algorithms.
2. **The first seven chapters are not exhaustive**: for example, Chapter 4 does not fully teach Huffman, minimum-cost arborescence, caching or Union-Find; Chapter 5 does not fully teach FFT or closest pair; Chapter 6 does not fully teach sequence alignment and knapsack. The detailed per-section status is in `ALGORITHM_DESIGN_SECTION_AUDIT_v5.csv`.
3. Full publisher figures and exercises are not copied into this redistributable static website. The local PDF viewer can display them on the user's computer. Eleven figures have selected locators; full figure inspection remains open.
4. Manim scenes are syntax-validated only; render quality requires a local Manim test. Additional animation videos are not shipped.
5. No deployment of the user's public GitHub Pages site was attempted. Extract and open `LearningAi/index.html` to run locally, or deploy the contents as static files.

### Recommended next task

Finish the remaining sections inside Chapters 1–7 before claiming comprehensive coverage; then develop Chapter 8 (polynomial-time reductions and NP-completeness), paying particular attention to formal reduction correctness and direction.
'''
(root/'TEXTBOOK_REBUILD_STATUS_v5.md').write_text(report,encoding='utf-8')
Path('/mnt/data/TEXTBOOK_REBUILD_STATUS_v5.md').write_text(report,encoding='utf-8')
print('v5 tracker rows',len(rows),'figures',sum(figs.values()),'guided chapters',7)
