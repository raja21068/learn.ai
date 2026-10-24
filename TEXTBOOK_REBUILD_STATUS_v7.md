# LearningAI v7 — Algorithm Design, deeper source-linked sections

## Release scope

This extends the **existing** LearningAI site, retaining the earlier courses, quizzes, source PDF reader, guided book chapters, Python practice files and v6 proof labs. The main Algorithm Design course contains **21 lessons**: seven broad chapter guides + six v6 proof-lab lessons + eight v7 section lessons. The overall number of guided *chapter* pages remains **70 across seven textbooks**; v7 adds section studies rather than certifying new entire chapters. Unmapped textbook sections are not marked taught.

## Sections developed in v7

| Exact uploaded book heading | PDF page, 1-indexed | Interactive route | Independently executable practice lab |
|---|---:|---|---|
| 4.2 Scheduling to Minimize Lateness: An Exchange Argument | 151 | `#/algo-lab/lateness` | `downloads/algorithm-labs/v7-lateness.py` |
| 4.3 Optimal Caching: A More Complex Exchange Argument | 157 | `#/algo-lab/caching` | `downloads/algorithm-labs/v7-caching.py` |
| 4.8 Huffman Codes and Data Compression | 187 | `#/algo-lab/huffman` | `downloads/algorithm-labs/v7-huffman.py` |
| 5.5 Integer Multiplication | 257 | `#/algo-lab/karatsuba` | `downloads/algorithm-labs/v7-karatsuba.py` |
| 5.6 Convolutions and the Fast Fourier Transform | 260 | `#/algo-lab/fft` | `downloads/algorithm-labs/v7-fft.py` |
| 6.3 Segmented Least Squares: Multi-way Choices | 287 | `#/algo-lab/segmented` | `downloads/algorithm-labs/v7-segmented.py` |
| 6.5 RNA Secondary Structure: Dynamic Programming over Intervals | 298 | `#/algo-lab/rna` | `downloads/algorithm-labs/v7-rna.py` |
| 7.11 Project Selection | 422 | `#/algo-lab/project` | `downloads/algorithm-labs/v7-project.py` |

The page numbers were verified using the supplied edition's embedded PDF table-of-contents bookmarks. The corresponding textbook pages were inspected to verify the problem definition and technical conditions; the companion text, pseudocode, examples, SVG figures and exercises are original educational material rather than excerpts or reproductions.

## Mathematical qualification / provenance

- Section 4.2 uses the edition's definition ℓᵢ=max(0,fᵢ−dᵢ), so early jobs have zero lateness (not negative). The deadline algorithm targets **maximum lateness** under a nonpreemptive, single-machine model with all jobs available initially. It is not an optimal algorithm for every scheduling objective.
- Section 4.3's farthest-in-future eviction rule is **offline**; it relies on future knowledge.
- Section 4.8 Huffman solves optimal weighted binary prefix-code length for specified frequencies; the example costs 71 bits.
- Section 5.5 three-product multiplication uses the exact distributive identity and O(n^log2 3) recurrence in the mathematical cost model.
- Section 5.6 zero padding to N≥m+n−1 is essential for nonaliasing *linear* convolution.
- Section 6.3 includes a cost C for **each segment**, avoiding the confusion with penalty per breakpoint; the source notes O(n³) straightforward and O(n²) improved interval SSE preprocessing.
- Section 6.5 uses the book's simplified RNA rules: A–U/C–G complementary pairs, separation ≥5, each base at most once, no crossing arcs, and O(n³) interval DP. This is **not** biological free-energy structure prediction. The original recurrence in the source was visually checked on PDF p. 302 (Figure 6.15 and recurrence (6.13)).
- Section 7.11 uses a high-capacity prerequisite edge for "selecting i requires selecting j". Cut capacity equals total positive value minus selected net value; the illustrative instance optimum is +4, cut cost 11.

## Validation performed

1. Eight downloadable Python labs executed successfully. The checks include exhaustive permutation/eviction/matching comparisons, independent exhaustive merge-cost comparisons, signed multiplication trials, FFT-vs-naive polynomial convolution, segmented regression vs exhaustive cut partitions, RNA vs enumerated noncrossing pair sets, and dependency-constrained project selection vs enumerating subsets.
2. Chromium browser route tests: all eight v7 standalone visualizations, course integration, quiz question rendering, reveal/collapse controls, trace slider updates, source PDF link buttons, download path existence, desktop and narrow/mobile layouts. Representative earlier v6, Statistical Learning, Operating Systems and Database routes also render.
3. `algorithm_design_v7_scenes.py` adds four original Manim storyboard scenes and passes Python compilation. Manim **video rendering was not attempted**; Manim runtime was unavailable.
4. The source PDF and source figure inspection images are **not bundled in the distributed archive**. Use local reader with your lawfully held textbook PDF to inspect original figures.

## What is NOT complete

The updated `ALGORITHM_DESIGN_SECTION_AUDIT_v7.csv` remains the authoritative section-by-section coverage tracker. Only 15 of its 98 source section bookmarks have an associated section lab route (7 source sections from 6 v6 routes + 8 from v7). The other 83 bookmarks are indexed, or covered only briefly within broad chapter studies. Many textbook figures and exercises do not yet have unique treatments. Algorithm Design Chapters 8–13 still have no guided chapter studies. The Manim source scripts have not been rendered or video-QA reviewed.

**Most productive next pass:** Section 4.7 clustering, 6.7 linear-space sequence alignment, 6.8–6.10 shortest paths, 7.12 baseball elimination, then verify the remaining 1–3 chapter proofs and exercises before marking any chapter complete.

## Environment-specific test limitation

An additional attempt to browse the site through a real localhost HTTP server was blocked by the Chromium environment with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. This was a browser-network permission issue, **not an observed JavaScript failure**. The v7 and representative earlier courses were successfully exercised using Chromium with all local CSS and JavaScript files loaded directly, and a separate set of three existing Node-based tests passed. The release has not been verified after deployment to GitHub Pages or with full end-to-end PDF-file selection.
