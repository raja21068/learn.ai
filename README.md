## v4 — Statistical Learning textbook course (October 2026)

This version extends v3 with a ten-lesson **Statistical Learning (ISLR with R)** course inside **Courses**, detailed guided study under **Textbooks**, ten original interactive SVG figures and ten downloadable **base-R practice scripts** (`downloads/r-labs/`). Original Manim source animations live in `video/manim/islr_scenes.py` (syntax checked, not rendered). Source subsection locators from the uploaded ISLR edition are available in each guided chapter and open the original pages through the local PDF reader.

For the honest chapter-by-chapter progress and limitations, see [`TEXTBOOK_REBUILD_STATUS_v4.md`](TEXTBOOK_REBUILD_STATUS_v4.md) and [`TEXTBOOK_COVERAGE_v4.csv`](TEXTBOOK_COVERAGE_v4.csv). Indexed source subsections are not automatically considered taught. No source PDFs are bundled.

# learn/ai: interactive courses

An interactive, deeplearning.ai-style learning site. **New flagship course: Database Systems** (18 lessons following the chapter structure of Coronel & Morris, *Database Systems: Design, Implementation & Management*). Every lesson has original explanations, an interactive simulation, an auto-graded SQL lab running on a real in-browser SQLite engine, and a quiz. The five original AI/Python courses use the same 3-pane lesson player, and their code runs in-browser via Pyodide.

**Second flagship course: AI Agents: From Tools to Autonomous Teammates** (19 lessons in 8 parts). It merges the AGENTIFY outline (A-chapters: strategy, product, risk) with a hands-on agent-engineering outline (B-chapters: LLMs, MCP, multi-agent, RAG, evals, deployment). It has 15 interactive simulations and 20 auto-graded Python labs; hidden tests run in-browser via Pyodide. Files: `assets/agents-course.js`, `assets/agent-widgets.js`, `assets/agents.css`.

**Third flagship course: Machine Learning: From Data to Deep Learning** (16 lessons in 6 parts). It follows the topic sequence of Géron's *Hands-On Machine Learning with Scikit-Learn and PyTorch*: Part I (landscape, end-to-end projects, classification, training, trees, ensembles, PCA, clustering) and Part II (neural nets, PyTorch-style training, optimizers, CNNs, sequences, attention/transformers, diffusion, RL). It has 16 interactive simulations and 16 auto-graded labs that run real NumPy, pandas, SciPy and scikit-learn in the browser; Pyodide loads packages from each lab's imports (~30 MB on first run). PyTorch can't run in the browser, so the deep-learning labs implement the same mechanics in NumPy. Files: `assets/ml-course.js`, `assets/ml-widgets.js`, `assets/ml.css`.

**Fourth flagship course (featured first): LLM Engineering: From Prompt to Production** (14 lessons in 6 parts). It follows the chapter sequence of Iusztin & Labonne's *LLM Engineer's Handbook*: FTI architecture, the LLMOps toolbox, data engineering, the RAG feature pipeline, advanced RAG, instruction datasets, LoRA/QLoRA, DPO, evaluation, inference optimization, quantization, the RAG inference pipeline, deployment and LLMOps. The course is built around one capstone ("your AI writing twin"), and its page has a "What you'll build" system map that links each architecture component to its lessons. It has 14 interactive simulations and 14 auto-graded Python labs. Files: `assets/llm-course.js`, `assets/llm-widgets.js`, `assets/llm.css` (which also holds the site-wide hero, dropdown and system-map styles).

**Fifth flagship course: Prompt Engineering: From First Prompt to Production** (22 lessons in 5 parts). It synthesizes the topics of seven books: *Prompt Engineering in Practice* (Davies & Fischer), *AI Prompt Engineering: Absolute Beginner's Guide* (Miller), *Prompt Engineering for Beginners* (Baars), *Killer ChatGPT Prompts* (Hart-Davis), *ChatGPT Hacks for Teachers* (Jha), *Prompt Engineering for LLMs* (Berryman & Ziegler, which became Part 4, "Building LLM applications") and *The Art and Science of Prompt Engineering: Guiding AI* (Roche, which added the case-studies lesson). It has 22 interactive simulations and 22 auto-graded Python labs. Files: `assets/prompt-course.js`, `assets/prompt-widgets.js`, `assets/prompt-apps-widgets.js`, `assets/prompt.css`.

**Prompt Library** (`#/prompts`, `assets/prompt-library.js`): 100 original, fill-in-the-blank prompt templates in 16 categories (job search, email, business, research, communication, web, programming, HR, marketing, teachers, students, creative, media, home, personal growth, prompt building), with search, filters and copy buttons. The prompts are written for this site; none are copied from the books.

**Sixth flagship course: Artificial Intelligence: Search, Reasoning, Uncertainty & Learning** ("AI Foundations", 20 lessons in 7 parts). It follows the part and chapter sequence of Russell & Norvig's *Artificial Intelligence: A Modern Approach* (4th ed.): agents, uninformed and informed search, local search, games, CSPs, logic, FOL, planning, probability, Bayes nets, HMMs, MDPs, game theory, decision trees, Bayesian learning, NLP, robotics and ethics. It has 20 interactive simulations (grid search, tic-tac-toe vs. minimax, map-coloring backtracking, cave model checking, a Bayes net, value iteration and more) and 20 auto-graded Python labs that implement the classic algorithms. Files: `assets/ai-course.js`, `assets/ai-widgets.js`, `assets/ai.css`.

**Seventh flagship course: Deep Learning: From Tensors to Transformers** (18 lessons in 7 parts). It follows the chapter sequence of Zhang, Lipton, Li & Smola's *Dive into Deep Learning* (free online at https://d2l.ai): tensors and autograd, linear and softmax regression, MLPs, modules, convolutions, modern CNNs, RNNs, LSTM/GRU and beam search, attention and transformers, optimization and LR schedules, multi-GPU training, detection, NLP pretraining and fine-tuning, RL/GPs/HPO, and GANs and recommenders. It has 18 interactive simulations (including an MLP playground that trains live in the browser, a Gaussian-process editor and a matrix-factorization recommender) and 18 auto-graded NumPy labs. Files: `assets/dl-course.js`, `assets/dl-widgets.js`, `assets/dl.css`.

## Learning features (Phases 1-3)

- **Placement checks** per course part (`#/diagnostic/<course>`), **My learning** (`#/my-learning`) and **spaced review** (`#/review`), all stored locally in the browser.
- **Three-stage hints** on every lab task (idea, where to work, outline) before the worked solution; hint-assisted solves are recorded separately.
- **Two practice activities and a review pool** on each of the 127 flagship lessons (ordering, select-all, short answer; some generated from key terms and labeled as such).
- **Interactive Lab Studio** (`#/studio`): Python tracer, neural-network playground, ER/SQL design lab.
- Details, limits and the list of unfinished work: `PHASE1_RELEASE_NOTES.md`, `PHASE2_RELEASE_NOTES.md`, `PHASE3_RELEASE_NOTES.md`.
- Tests: `node tests/content-bank.test.cjs`, `node tests/learning-engine.test.cjs`, `node tests/phase2-core.test.cjs`, then `python tests/browser-smoke.py`, `python tests/course-regression.py`, `python tests/phase2-studio.py` (these need Python Playwright and an installed Edge/Chrome, or `CHROMIUM_PATH`).
- Third-party books are never included in this folder; `.gitignore` blocks `*.pdf` and `*.epub`.

The home hero heading now reads "Learn ___ by building it.", naming whichever flagship course is in the featured card.

New files: `assets/db-course.js` (course content + sample database), `assets/widgets.js` (15 interactive simulations). The previous site version is saved in `_backup_old_site/`.

External libraries are loaded from CDNs: CodeMirror 5.65.16 (cdnjs), sql.js 1.10.3 (cdnjs, loaded on first SQL lesson) and Pyodide 0.26.4 (jsDelivr, loaded only when a Python lab is run). Lessons stay readable offline; labs need internet the first time.

> Copyright note: the textbook PDF in `downloads/` is **not** linked by the site and should not be published to GitHub Pages. Delete it from the upload or add it to `.gitignore`.

---


A responsive static learning website containing **5 beginner learning paths, 20 original lessons, 20 downloadable Jupyter notebooks, 20 runnable Python scripts, and five original six-slide PPTX decks**.

## Open the website

Open `index.html` in a modern browser. There is no server, package install, account, or API key required to read lessons and take challenges. You can also start a local server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ .

The website uses HTML/CSS/vanilla JS and hash-based routes so deep links work on GitHub Pages. It stores completed challenges in browser `localStorage` only. No analytics or external JavaScript libraries.

## Publish free on GitHub Pages

1. Create a new public GitHub repository such as `ai-learning-center`.
2. Upload the **contents of this directory** to the repository root (not the parent folder).
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. When GitHub provides a Pages URL, open it and test the lessons and downloads.

If publishing under a repository subpath, relative asset paths and hash routes already support that layout. No build step is required.

## What's included

- `index.html`: entry point and page shell
- `assets/style.css`, `assets/app.js`, `assets/catalog.js`: UI and curriculum
- `downloads/notebooks/`: 20 Jupyter notebooks, one per lesson
- `downloads/code/`: 20 standalone Python 3 scripts
- `downloads/slides/`: five original PPTX decks
- `downloads/starter-pack.zip`: combined teaching resources (no duplicate site files)
- `LICENSE.md`: licensing details and external material caveat

Run every code example with `python downloads/code/python-hello-variables.py` (adjust path for the lesson). All examples only use the standard library; LLM/agent examples are deliberately small *simulations of concepts*, not actual calls to an LLM API.

## Verified public repositories linked in the website

- https://github.com/raja21068/Machine-Learning-For-Beginerrs-Course-PPT
- https://github.com/raja21068/Network-Security-Course_PPT
- https://github.com/raja21068/Big-Data-Analytics-and-Mining-Course-PPT
- https://github.com/raja21068/Federated-Learning-Framework (alternative to unavailable requested PPT repository)
- https://github.com/raja21068/Smart-Contract-Blockchain

**Important:** The originally supplied `raja21068/Federated-learning-PPT` URL returned a 404 during verification. The framework repo is a verified *alternative*, not that missing slide collection. External repository resources remain linked at their original source; their license has not been assumed.

The original agentic-AI lessons draw on the concepts of reasoning, memory, environments, tools, and evaluation. They do not reproduce the supplied Stanford CS329Z screenshots or claim Stanford affiliation.

## Content editing

Edit the data in `assets/catalog.json`, then update `assets/catalog.js` so the browser sees identical data. `build_content.py` is the source authoring script for the present catalog; `generate_downloads.py` generates the original notebooks, scripts and slides from it (requires `python-pptx` for slide generation). The deployed site needs neither script nor Python.

**Predict-then-run:** AI Foundations and Deep Learning widgets start with a prediction prompt (see `PHASE3_RELEASE_NOTES.md`). Verify with `python tests/predict-widgets.py` while `python -m http.server 8765` is running.

**AI Agents deep layer:** a guardrail experiment (Agent Arena), a five-milestone support-desk project, personalised explanations on every lesson and an evidence-of-understanding page at `#/evidence/ai-agents`. See `PHASE4_AI_AGENTS_NOTES.md`. Tests: `node tests/agents-arena.test.cjs`, `node tests/agents-coach-evidence.test.cjs`, `python tests/agents-labs.py`, `python tests/agents-experience.py`.

**Machine Learning deep layer:** an ML Lab experiment (overfitting, regularisation, leakage), a five-milestone honest-churn-model project, personalised explanations on every lesson, an evidence page at `#/evidence/machine-learning`, and fixed quiz distractors. See `PHASE5_MACHINE_LEARNING_NOTES.md`. Tests: `node tests/ml-lab.test.cjs`, `node tests/ml-coach-evidence.test.cjs`, `node tests/quiz-guessability.test.cjs`, `python tests/ml-labs.py`, `python tests/ml-experience.py`.

**Quizzes:** all 262 questions of the seven main courses have plausible distractors, balanced answer positions and an enforced guard against guessing by length or position. See `PHASE6_QUIZ_NOTES.md`. Test: `node tests/quiz-guessability.test.cjs`.

**LLM Engineering deep layer:** an LLM Service Lab experiment (cost, quality and latency), a five-milestone LLM-gateway project, personalised explanations on every lesson and an evidence page at `#/evidence/llm-engineering`. See `PHASE7_LLM_ENGINEERING_NOTES.md`. Tests: `node tests/llm-lab.test.cjs`, `node tests/llm-coach-evidence.test.cjs`, `python tests/llm-labs.py`, `python tests/llm-experience.py`.

**Prompt Engineering deep layer:** a Prompt Lab experiment (which parts of a prompt do the work), a five-milestone reliable-extraction project, personalised explanations on every lesson and an evidence page at `#/evidence/prompt-engineering`. See `PHASE8_PROMPT_ENGINEERING_NOTES.md`. Tests: `node tests/prompt-lab.test.cjs`, `node tests/prompt-coach-evidence.test.cjs`, `python tests/prompt-labs.py`, `python tests/prompt-experience.py`.

**Databases deep layer:** an Index Lab that runs on real SQLite query plans, a five-milestone booking-database project, personalised explanations on every lesson and an evidence page at `#/evidence/databases`. See `PHASE9_DATABASES_NOTES.md`. Tests: `python tests/db-labs.py`, `python tests/db-experience.py`, `node tests/db-coach-evidence.test.cjs`.

## Source-first textbook curriculum update — v5 (Algorithm Design)

A new **Algorithm Design** course based on the uploaded Kleinberg & Tardos edition is integrated into Courses and Textbooks. It contains 7 original guided chapters, linked to 98 original PDF-bookmark section locations across 13 indexed chapters, 7 interactive algorithm-state diagrams, proofs/pseudocode, quizzes and 7 independently authored Python practice labs. The chapters are **guided but not exhaustive**; Algorithms Chapters 8–13 are currently indexed only.

See `TEXTBOOK_REBUILD_STATUS_v5.md`, `TEXTBOOK_COVERAGE_v5.csv`, and `ALGORITHM_DESIGN_SECTION_AUDIT_v5.csv` for precise source and coverage status. Manim scene sources exist in `video/manim/algorithm_design_scenes.py` but have not been rendered. Publisher PDF files and figures are not included.

## v6 algorithm design depth (2026-10-24)

Six new source-grounded proof labs are available in **Courses → Algorithm Design** and at
`#/algo-lab/dijkstra`, `/mst`, `/closest-pair`, `/subset-sum`, `/alignment`, and
`/matching-flow`. These include executable SVG step controls, original worked
examples, independently tested Python implementations, assessments, and source PDF
page locators. The source book is **not** part of the distributable ZIP. For
coverage limitations and test results see `TEXTBOOK_REBUILD_STATUS_v6.md`.

## Algorithm Design textbook depth — v7

Eight new sections now appear **inside** Courses → Algorithm Design, and each has a standalone interactive lab under `#/algo-lab/<id>`: Section 4.2 deadline scheduling, 4.3 caching, 4.8 Huffman, 5.5 integer multiplication, 5.6 FFT, 6.3 segmented least squares, 6.5 RNA interval DP, and 7.11 prerequisite project selection. The source edition pages are recorded in `ALGORITHM_DESIGN_DEPTH_v7.json` and `ALGORITHM_DESIGN_SECTION_AUDIT_v7.csv`.

The added SVG visualizations compute discrete states from authored example data; eight standalone Python labs pass independent brute-force/randomized checking. `video/manim/algorithm_design_v7_scenes.py` contains four original animation scenes that **require local rendering**; syntax checking is not a runtime guarantee. No original publisher PDF page, copied chart, or textbook figure is distributed in this website ZIP. Use the local PDF reader to see the original source figures. These eight lessons expand the original seven chapter studies and six v6 laboratories, but are **not a complete replacement for a textbook**.
