import pathlib,json,csv
root=pathlib.Path(__file__).resolve().parents[1]
atlas=json.loads((root/'assets/textbook-atlas-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
sections=json.loads((root/'assets/book-source-map.json').read_text())
figs=json.loads((root/'assets/book-figure-map.json').read_text())
guided={'db':16,'rl':8,'d2l':6,'os':15,'network':8}
rows=[]
for book in atlas:
 for num,ch in enumerate(book['chapters'],1):
  guide=num<=guided.get(book['id'],0)
  src=next((x for x in sections.get(book['id'],[]) if x['n']==num),{})
  figure=next((x for x in figs.get(book['id'],[]) if x['n']==num),{})
  rows.append([book['id'],book['title'],num,ch['title'],ch.get('pdfPage'), 'Guided study—NOT fully taught' if guide else 'Indexed only—NOT taught in new guides',len(src.get('sections',[])),len(figure.get('figures',[])),f'#/book/{book["id"]}/chapter/{num}' if guide else '', 'Subsection-by-subsection content and most source figures/exercises remain' if guide else 'Develop detailed teaching, source mappings, examples and diagrams'])
with (root/'TEXTBOOK_COVERAGE_v3.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['Book ID','Textbook','Chapter no.','Source TOC chapter title','PDF chapter page','Current teaching status','Section locators','Candidate figure locators','Companion route','Remaining work']);w.writerows(rows)
scount=sum(len(c['sections']) for chapters in sections.values() for c in chapters)
fcount=sum(len(c['figures']) for chapters in figs.values() for c in chapters)
notes=f'''# LearningAI v3 — Textbook rebuild and coverage audit

## What has been updated

- **15 distinct textbooks** and **{len(rows)} chapter entries** are indexed. Indexing is not teaching.
- **{sum(guided.values())} chapter study guides across five textbooks**: Coronel & Morris Database Systems ({guided['db']}), Sutton & Barto Reinforcement Learning ({guided['rl']}), Zhang et al. Dive into Deep Learning ({guided['d2l']}), Silberschatz et al. Operating System Concepts Essentials ({guided['os']}), Kurose & Ross Computer Networking ({guided['network']}). Each is an **original concise guide**, not a complete textbook chapter.
- **{scount} book subsection title and source-PDF-page references** mapped for those five books. Those subsections have not all been fully taught.
- **{fcount} automatically detected figure-caption candidates**, with PDF page locations. These are navigation aids, **not reproduced figures**. They have not all been individually checked visually; verify caption and graphic in source.
- **Two entirely new standalone courses**: Operating Systems (15 lessons) and Computer Networking (8 lessons), bringing the existing seven-course site to nine courses. Existing Database Systems and Deep Learning lessons now incorporate additional textbook reading materials, and RL has eight guided chapters accessible from the textbook library.
- Original interactive diagrams/graphs built with local JavaScript/SVG, including synchronization and scheduling, virtual memory, transport-delay illustrations, relational joins and normalization, dynamic programming, TD learning and gradient descent.
- **Local original-PDF reader:** students choose their own PDF and open source chapter/figure pages, retaining textbook illustrations in their authorized local copy without bundling them in the website or uploading to a server.
- Four original Python/Manim animation scene sources are supplied (`video/manim/learning_scenes.py`). Syntax validated, **not rendered**, because Manim is not installed in this environment. Browser diagrams work without Manim.

## Material still missing

1. **Full textbook chapters are not reproduced**. These guided lessons do not cover every derivation, example, proof, algorithm, experiment or exercise. Each guide has 2–4 explanatory concept sections, a worked example and one practice question. Full fidelity requires continuing a manual source-grounded section-by-section rewrite.
2. **Ten of the 15 books** still lack new chapter-by-chapter guided study content. Their earlier brief focus notes and table-of-contents indexes remain.
3. **Original publisher images** are not included in the distributable website; the student can view them by selecting the source PDF using the local reader.
4. Source figure-caption locators are automatically gathered and require per-figure quality control.
5. Only four Manim scenes have been authored; no complete animated-video sequence for every chapter exists.
6. To update a hosted GitHub Pages instance, deploy the files in the ZIP. This package alone does not change an online website.

## Tests run

- Existing 137-lesson content-bank tests and 15-book textbook library tests.
- Browser checks for all 53 guided chapters and the two new courses, desktop and mobile render, interactive controls, practice answer reveal.
- Local-PDF reader browser test: selecting a PDF uses a `blob:` source with a page fragment; no file upload request occurs. Existing fonts and editor assets may still load from external public CDNs.
- Manim Python source syntax validation only; no runtime video render.

## Learning pathway

Unzip, open `LearningAi/index.html`, choose **Courses** for subject lessons or **Textbooks** for guided reading. On any guided textbook chapter select **Read the entire original chapter in your PDF**, choose the matching book file, and use the source-page buttons next to figure references. Locally attached books are retained during hash navigation but must be selected again after reloading the website.

## Next review priority

Begin by completing the Database Systems book's sections for relational modeling, normalization and concurrency. Then expand Operating Systems and Computer Networking section-by-section, followed by ISLR, AIMA, Algorithm Design and LLM Engineer's Handbook. Mark a chapter complete only after its explanations, source figures, worked exercises and tests have been individually verified.

**The CSV gives one row per chapter with its current honest coverage state.**
'''
(root/'TEXTBOOK_REBUILD_STATUS_v3.md').write_text(notes,encoding='utf-8')
print('books',len(atlas),'TOC chapters',len(rows),'guided',sum(guided.values()),'section locators',scount,'figure candidates',fcount)
