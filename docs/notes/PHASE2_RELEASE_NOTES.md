# LearningAi Phase 2 — Interactive Lab Studio

**Release date:** 2026-10-22  
**Scope:** Builds on and preserves the Phase 1 learning fundamentals release.

## What is new

Phase 2 implements three original, browser-local interactive laboratory experiences, connected to the existing lessons and progress system.

1. **Python Execution Tracer** (`#/studio/python`)
   - An editable teaching subset of Python, with a strictly bounded interpreter (not `eval`, arbitrary code execution, Pyodide, or CPython).
   - Line-by-line execution, line highlighting, variable table, stdout, trace replay, and three sample programs.
   - Supported: numeric arithmetic, string/list literals, list indexing, assignment, `+=`, `-=`, `*=`, `for` over a list or `range(...)`, `if`, `len(...)`, `.append(...)`, and `print(...)`.
   - Learner must correctly predict two unrevealed state changes for its checkpoint. Trace compilation errors are displayed with source-line information when available.
   - Bounded source length, step count, and iteration count. This is **not** a general-purpose Python interpreter; imports, definitions, comprehensions, arbitrary function calls, and unsafe execution are intentionally unavailable.

2. **Neural Network Playground** (`#/studio/neural`)
   - A real, deterministic full-batch gradient-descent implementation of a small 2D classifier (binary cross-entropy, sigmoid output, optionally one tanh hidden layer).
   - Switch task (XOR/OR/AND), choose hidden width (0/2/4/8) and learning rate (0.10/0.35/0.70/1.20), train in 100- or 500-epoch increments, reset to a deterministic initialization.
   - Interactive 2D probability surface, observation-level predictions, training-accuracy / training-loss cards, historical loss plot.
   - Independent concept checkpoint on linear separability of XOR.
   - **Training-only metrics:** just four synthetic points; results say nothing about out-of-sample generalization or real-world accuracy.

3. **ER Model & SQL Design Studio** (`#/studio/er`)
   - University-enrollment scenario with a many-to-many relationship resolved by an associative entity.
   - Learners choose the associative table, candidate primary key, and cardinalities; the diagram updates to show their attempted design.
   - Per-decision formative feedback, guided hint, and generated SQLite-compatible schema DDL after validation.
   - INNER vs LEFT JOIN demonstration with a deterministic three-student dataset including an unmatched student.
   - This is a schema decision activity and in-memory join preview, **not** a general ER drag-and-drop builder or a live SQLite query runner. The original course still offers a separate live SQL lab requiring a CDN.

## Integration

- `#/studio` is accessible through desktop and mobile header navigation.
- The corresponding labs appear as explicit launch links in the relevant lessons:
  - Python Essentials: `hello-variables` and `lists-loops`
  - Machine Learning: `neural-networks`
  - Database Systems: `er-modeling` and `sql-joins`
- Course landing pages for those courses expose the interactive laboratory hub.
- Studio checkpoint attempts update the existing `LearningEngine.recordAttempt(...)` practice records for the mapped lesson, including Phase 1 review scheduling. The studio also keeps lightweight local checkpoint summaries under `learnai-phase2-record-v1`.
- Phase 1 progress, existing content, widgets and lab executors are retained.

## Files introduced

- `assets/phase2-core.js` — dependency-free and Node-testable Python trace, neural train/predict, ER checks and join preview.
- `assets/phase2-ui.js` — lab hub, simulation controls, accessibility labels, checkpoints, local record storage.
- `assets/phase2.css` — responsive visual components, desktop and mobile layouts, reduced motion.
- `tests/phase2-core.test.cjs` — parser, math, network and ER unit tests.
- `tests/phase2-studio.py` — real Chromium interaction and mobile-layout tests.

Modified: `index.html`, `assets/app.js`, `README.md`.

## Launch

```bash
cd LearningAi
python -m http.server 8000
```

Open **http://localhost:8000/#/studio**. No backend, API key, paid model, or account is needed for the Phase 2 studio. Existing Python/SQL lab execution elsewhere in the website continues to require the relevant third-party CDN resources on first access.

## Verification

Run:

```bash
node tests/learning-engine.test.cjs
node tests/phase2-core.test.cjs
python tests/browser-smoke.py
python tests/course-regression.py
python tests/phase2-studio.py
```

- Existing Phase 1 learning-engine tests: passed.
- Existing Phase 1 diagnostic/hint/review/browser tests: passed.
- Existing 11-course / 129-lesson regression: passed, no uncaught page JavaScript exceptions.
- New core tests for safe Python tracing, deterministic network training, ER decisions and join results: passed.
- New Chromium lab workflows: hub, Python predictions, neural training comparison, ER corrections and DDL, SQL joins, cross-links, repeated navigation: passed.
- Mobile viewport tests (390px) across lab hub and all three labs: passed, no page overflow; no uncaught page JavaScript errors.
- Automated accessibility conformance testing, screen-reader testing, production network deployment, CDN-based Python/SQL runtime execution, human usability studies, and learning-outcome validation have **not** been completed.

## Constraints and research cautions

- Client-side answer keys can be inspected; assessment is formative, not high stakes.
- Learning progress is stored only on the current browser/device; clearing site data removes it.
- A passed checkpoint represents an attempted activity, not a validated learner skill estimate.
- Python subset has nonidentical semantics to CPython in some edge cases and is intentionally limited.
- Neural predictions are trained on four toy observations; they must not be presented as external performance.
- Diagram covers one specifically authored domain scenario; it is not an arbitrary schema design tool.
- The original third-party textbook PDF remains excluded because redistribution permissions were not established.
