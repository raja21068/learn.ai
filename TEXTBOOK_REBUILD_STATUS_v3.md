# LearningAI v3 — Textbook rebuild and coverage audit

## What has been updated

- **15 distinct textbooks** and **228 chapter entries** are indexed. Indexing is not teaching.
- **53 chapter study guides across five textbooks**: Coronel & Morris Database Systems (16), Sutton & Barto Reinforcement Learning (8), Zhang et al. Dive into Deep Learning (6), Silberschatz et al. Operating System Concepts Essentials (15), Kurose & Ross Computer Networking (8). Each is an **original concise guide**, not a complete textbook chapter.
- **476 book subsection title and source-PDF-page references** mapped for those five books. Those subsections have not all been fully taught.
- **599 automatically detected figure-caption candidates**, with PDF page locations. These are navigation aids, **not reproduced figures**. They have not all been individually checked visually; verify caption and graphic in source.
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
