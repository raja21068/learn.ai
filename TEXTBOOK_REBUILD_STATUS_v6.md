# LearningAI v6 — Algorithm Design section-level depth

## What changed relative to v5

The existing site, seven Algorithm Design chapter guides, previous textbook courses, source-indexed PDF reader, existing charts and downloadable resources are retained. v6 does **not** claim that the entire book has been read or converted into a full university course.

Six new authored proof laboratories now live **inside the Algorithm Design course** and are also available as individual interactive routes.

| Exact source section(s) in Kleinberg & Tardos | PDF page(s) in uploaded file | New lab route | Code |
|---|---:|---|---|
| 4.4 Shortest Paths in a Graph | 163 | `#/algo-lab/dijkstra` | `downloads/algorithm-labs/v6-dijkstra.py` |
| 4.5 The Minimum Spanning Tree Problem; 4.6 Implementing Kruskal's Algorithm: The Union-Find Data Structure | 168; 177 | `#/algo-lab/mst` | `downloads/algorithm-labs/v6-mst.py` |
| 5.4 Finding the Closest Pair of Points | 251 | `#/algo-lab/closest-pair` | `downloads/algorithm-labs/v6-closest-pair.py` |
| 6.4 Subset Sums and Knapsacks: Adding a Variable | 292 | `#/algo-lab/subset-sum` | `downloads/algorithm-labs/v6-subset-sum.py` |
| 6.6 Sequence Alignment | 304 | `#/algo-lab/alignment` | `downloads/algorithm-labs/v6-alignment.py` |
| 7.5 A First Application: The Bipartite Matching Problem | 393 | `#/algo-lab/matching-flow` | `downloads/algorithm-labs/v6-matching-flow.py` |

Each of the six lab routes adds **five substantive explanations**, objectives, a full independently authored pseudocode example, a correctness argument, a numerical worked case, a counterexample or assumption check, an original, controllable SVG diagram, a practice question and a revealed answer. All six are also available as lessons under `#/course/algorithm-design/section-<id>` with assessed multiple-choice questions. In-course navigation follows chapter order.

The existing chapter guides under `#/book/algo/chapter/4` through `/7` link to these labs. The desktop Courses navigation now includes Algorithm Design.

### What actually was source-verified

- Source section names and PDF page numbers were checked against the uploaded 864-page `Algorithm Design` file and the extracted bookmarks, including Section 4.6, which begins on PDF page 177.
- Section 5.4's **15 subsequent y-sorted points** bound was checked against the supplied edition; an independent O(n log n) program follows the same conservative constant bound.
- Section 6.4 is the book's **subset sum** recurrence with two-dimensional `(item,capacity)` state; standard 0–1 knapsack with separate values is distinguished, not conflated.
- Section 6.6 uses per-letter mismatch and per-symbol gap costs.
- Section 7.5 uses unit-capacity max flow to express **maximum-cardinality bipartite matching**, not stable matching.

The numerical inputs and figures are newly authored teaching examples, not empirical results, reproductions of original publisher illustrations, or copied publisher exercises. The local browser PDF reader remains available for viewing the original book on the user's own device.

### Verification and scope

- Six Python scripts were executed successfully, including randomized or exhaustive brute-force comparisons: 60 independent Dijkstra/Bellman-Ford checks, 70 MST enumeration checks, 280+ closest-pair comparisons plus tied-coordinate edge cases, 150 subset-sum exhaustive checks, 160 independently recursive sequence-alignment checks, and 130 exhaustive matching checks.
- New Chromium browser smoke tests passed: six standalone routes, six in-course lessons, cross-links from book guides, numeric SVG states, controls, formal proof and answer reveals, quizzes, mobile width, and existing representative course routes.
- Existing standalone ISLR and book-masterclass browser tests passed. A broader old course-regression run exceeded its execution time limit; **full old-course regression is not certified in this release**.
- Added three original Manim scenes: `DijkstraProofScene`, `SubsetCapacityScene`, `MatchingAugmentScene`. Python syntax is checked; **Manim runtime rendering and video quality were not tested** because the Manim environment is unavailable.
- No PDFs or publisher figure files are bundled inside the public website archive. The source PDF stays on the local reader's device.

### Honest coverage accounting

- Existing source index: **13 Algorithm Design chapters, 98 section bookmarks**. Source indexed does not mean taught.
- Existing guided long-form Algorithm Design chapters: **7**, unchanged (Chapters 1–7); v6 adds **6 detailed section lessons covering 7 indexed sections** (4.5 and 4.6 jointly developed).
- Course lesson total for Algorithm Design: **13** (7 original chapter studies + 6 new section-level lessons).
- Site-wide guided chapter-page count remains **70 across seven books**, not 76; new pages are section laboratories, not newly completed full textbook chapters.
- Most sections in Chapters 1–7 remain only partially taught or indexed; Chapters 8–13 remain indexed without developed guides. The six new labs do not settle all exercises, formal proofs, or publisher figures in their chapters.

## Remaining work / recommended v7

1. Complete other unaddressed sections in Chapter 4 (4.2 lateness, 4.3 caching, 4.7 clustering, 4.8 Huffman), Chapter 5 (5.5 integer multiplication, 5.6 FFT), Chapter 6 (6.3 segmented least squares, 6.5 RNA, 6.7 linear-space alignment, 6.8–6.10 paths), and Chapter 7 (7.11 project selection, 7.12 baseball elimination).
2. Expand Chapters 1–3 to the same rigor, with individually checked source examples and counterexample exercises.
3. Visually review each original textbook figure and recreate only independently authored teaching equivalents. Add figure-to-section traceability and accessibility labels.
4. Once Chapters 1–7 are substantially developed, introduce Chapter 8 reductions and NP-completeness carefully; prove both reduction directions and complexity assumptions.

See `ALGORITHM_DESIGN_SECTION_AUDIT_v6.csv` and `TEXTBOOK_COVERAGE_v6.csv` for precise tracked gaps.
