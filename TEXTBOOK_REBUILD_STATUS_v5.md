# LearningAI v5 — Algorithm Design source-first extension

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
| 1 | Stable matching, proofs and proposer optimality | 2 | Guided—partial |
| 2 | Asymptotic analysis and implementation | 5 | Guided—partial |
| 3 | BFS/DFS and graph structure | 6 | Guided—partial |
| 4 | Interval greedy proof and limits | 9 | Guided—partial |
| 5 | Divide-and-conquer and inversions | 6 | Guided—partial |
| 6 | Weighted scheduling DP with traceback | 10 | Guided—partial |
| 7 | Augmenting paths and min-cut proof | 13 | Guided—partial |
| 8 | No long-form lesson yet | 10 | Indexed only |
| 9 | No long-form lesson yet | 5 | Indexed only |
| 10 | No long-form lesson yet | 5 | Indexed only |
| 11 | No long-form lesson yet | 8 | Indexed only |
| 12 | No long-form lesson yet | 7 | Indexed only |
| 13 | No long-form lesson yet | 12 | Indexed only |

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
