# LearningAI v4 — Source-grounded Statistical Learning revision

## Exactly what changed

This release continues the existing v3 website rather than replacing it. The focus was **one book**: Gareth James, Daniela Witten, Trevor Hastie and Robert Tibshirani, *An Introduction to Statistical Learning with Applications in R*, 2013 / corrected-printing edition (the user's uploaded PDF). The edition in the PDF is the original **R** edition, not the newer Python edition.

- Added a **full ten-lesson Statistical Learning course route** (`#/course/statistical-learning`) *inside Courses*, not just a textbook catalog entry.
- Added ten individual guided reading pages (`#/book/islr/chapter/1` through `/10`) plus 59 independently authored concept-explanation sections, ten worked numerical examples, 30 learning objectives, ten challenge/answer pairs and 20 review checkpoints. Topics align with the source chapter structure: introduction, statistical learning, regression, classification, resampling, linear selection/regularization, nonlinear methods, tree ensembles, SVMs and unsupervised learning.
- Mapped **180 topically specific subsection and lab headings from the PDF's own bookmark tree** to the relevant **PDF pages**. All 180 are navigable; **NOT all have full website explanations**. That distinction is preserved in the progress tracker.
- Authored **ten independent interactive SVG visualizations**, using synthetic—not textbook experimental—data: supervised vs unsupervised scatter, flexibility versus training/test MSE, candidate least-squares line with residuals, logistic response curve, 5-fold holdout matrix, ridge/lasso coefficient paths, piecewise-linear spline knot, regression-tree split RSS, illustrative SVM margin, and PCA projection variance. Visual scripts run offline without an AI API.
- Created **ten original standalone base-R practice scripts** under `downloads/r-labs/`, linked directly from the corresponding course lessons. These do not use publisher datasets or code and avoid extra R packages. **Execution has not been tested** because Rscript is not installed in this environment.
- Inspected PDF page images and hand-mapped **three figures** (Figure 2.10 at PDF p. 48, Figure 5.5 at PDF p. 194, Figure 9.5 at PDF p. 355) as source *locators* through the existing local-PDF reader. Publisher artwork is **not included** in the site.
- Added **four original Manim Community scene source files** (`video/manim/islr_scenes.py`) covering bias-variance, 5-fold CV, logistic probabilities and ridge/lasso. Python syntax validated. **Manim, LaTeX and FFmpeg rendering have not been run**, so no videos have been rendered or visual-QA-checked.
- Existing 53 guides across five previously covered textbooks and all v3 courses remain in place. Total now **63 guided chapter pages across six books**, plus the unchanged browsable chapter title indexes for 15 books. The new course increases website course pathways from nine to **ten**.

## Validation

- All ten new guides rendered in Chromium and expose at least five explanatory concepts, source subsection links, a chart and an answer-reveal interaction.
- All ten new in-course routes display quizzes (with balanced answer positions), a linked R exercise and embedded interactive source reading. Sliders were exercised; mobile viewport width checked against 393 px with no page-level horizontal overflow.
- Numerically focused JS tests verify actual visible polylines (not empty SVG graphs), that five-fold illustration has 100 observation-training/validation blocks, the regression-tree example yields RSS≈4.67 at x=5, SVM margin example is separable at x=5, lasso can zero coefficients, and rotation toward the diagonal increases toy PCA variance.
- Existing v3 guide-course browser tests and previously available textbook/content tests still pass.
- Original PDF references are *local*: the user selects the matching PDF with the existing browser PDF reader. PDF pages and extracted publisher figures are not shipped in this package.

## What remains incomplete (not claimed as done)

1. Even in ISLR, **all ten chapters are guided summaries, not exhaustive section-by-section rewrites**. There are 180 bookmark subsection locators but only 59 new conceptual teaching sections, and not all original derivations and figures have been transcribed into interactive equivalents.
2. **Nine books still lack the new chapter-by-chapter deep-guided format**: Algorithm Design, Artificial Intelligence: A Modern Approach, LLM Engineer's Handbook, and six other prompt/human-AI books. Their v3 companion focus notes and chapter indexes still exist.
3. Existing v3 figure-caption candidates (599) have not all been individually inspected, and should not be treated as verified charts.
4. The ten R practice scripts were syntactically authored but not executed in R; the Manim source files were syntax-compiled, not rendered.
5. New content has not been deployed to the user's hosted GitHub Pages site. This is a local, deployable static-site ZIP; external CDN assets from earlier v3 may still require network access.

## How to use

Unzip and open `LearningAi/index.html`. Select **Courses → Statistical Learning**; each lesson includes a link to the deeper guided chapter and a downloadable R practice file. In **Textbooks → Introduction to Statistical Learning**, choose a chapter and use **Read the entire original chapter** or figure-page buttons to select your local copy of the uploaded PDF. All content is static and does not call a paid AI model for the interactive calculations.

**Next source-first book:** *Algorithm Design* by Kleinberg and Tardos, beginning with stable matching and proof of correctness before continuing to algorithm analysis, graph traversal, greedy algorithms and dynamic programming. No full-book coverage is claimed until independently reviewed and tested.
