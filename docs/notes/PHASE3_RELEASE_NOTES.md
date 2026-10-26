# LearningAi Phase 3: Phase 1 learning features for every flagship course

**Date:** 2026-10-22. Builds on, and merges, the Phase 1 and Phase 2 releases with the Deep Learning course and the layout fixes made after the Phase 1/2 snapshot.

## What changed

### 0. Merge
The Phase 1/2 archives were based on an older copy of the site. They are now merged into the current folder:
Deep Learning (new after the snapshot), the corrected AI Foundations map-coloring and hidden-state labs, and the narrow-column layout fixes are all kept, together with the learning engine, placement checks, dashboard, review queue and the three studio labs. Everything remains deterministic and browser-local (no LLM, account or server).

### 1. Task-specific hints for all 139 lab tasks (`hints-bank.js`, `learning-hints.js`)
The three hint levels are no longer generic text. For every Python and SQL task:

| Level | Content | Source |
|---|---|---|
| 1 · Idea | The key concept, no code | **authored** per task (139 hints) |
| 2 · Where to work | The TODO steps of that starter (Python) or the tables and clauses involved (SQL) | generated from the task's starter / solution |
| 3 · Outline | The solution's structure with details masked (`SELECT … FROM T WHERE …`; Python control flow with bodies elided) | generated from the task's solution; a test asserts it never contains the full solution |

The full worked solution still requires an explicit extra click, and solves that used any hint are recorded as *assisted*.

### 2. Two activities and a review pool for all 127 flagship lessons (`challenge-bank-all.js`)
- **Authored** (121 lessons): one ordering or select-all activity per lesson, plus one review question derived from it. Six pilot lessons keep their Phase 1 activity.
- **Generated from each lesson's key terms** (127 lessons): a short-answer "which term matches this description?" activity and up to two multiple-choice term-recall review questions. These are **vocabulary recall**, are labeled "generated from lesson terms" in the UI, and use distractors from other lessons of the same course. Typed answers ignore case, punctuation and hyphens.
- Reviews rotate through a lesson's pool (one question per scheduled review) instead of repeating one item.
- Totals: **254 activities, 378 review questions**.

### 3. Per-part placement checks and skill indicators
- Courses with parts (the 7 flagship courses) get **1-2 questions per part**; results are shown per part and the suggested starting point is the first part with a miss. Courses without parts keep the first-six-lessons check. The check still never skips content.
- Each roadmap card on a course page shows **per-lesson practice dots** and "x/y practiced · n due". These are labeled practice evidence, not mastery.

### 4. Housekeeping
- The Database Systems textbook PDF was **moved out of the project** to `D:\AutoResearch\_reference_books\`; `.gitignore` now blocks `*.pdf` and `*.epub`.
- The Playwright tests were made portable (UTF-8 reads, uses installed Edge/Chrome, artifacts in `tests/artifacts/`) and updated for the new UI. New `tests/content-bank.test.cjs` locks in the content guarantees.

## Verification (all run on 2026-10-22)

| Check | Result |
|---|---|
| `node tests/content-bank.test.cjs` | pass: 127 lessons, 139 tasks with 3-stage hints, 254 activities, 378 review questions |
| `node tests/learning-engine.test.cjs`, `node tests/phase2-core.test.cjs` | pass |
| `python tests/browser-smoke.py` (Edge) | pass, 13 checks |
| `python tests/course-regression.py` | pass: 12 courses, 147 lessons, zero JS exceptions, 2+ activities on every flagship lesson |
| `python tests/phase2-studio.py` | pass, including 390 px mobile |
| All 139 lab solutions executed in the browser (110 Python, 29 SQL) | all pass; every starter fails |

## Not done yet (honest list)
- **Python tracer extension** (def / dict / return) and a Trace button on lab editors. The existing tracer subset can't run most flagship labs (NumPy, classes).
- **Predict-then-run** prompts for the remaining ~90 widgets (done for AI Foundations and Deep Learning, see the addendum).
- **ER studio scenarios** beyond university enrollment, and merging the Phase 2 neural playground with the Deep Learning one.
- **Application-style review questions**: the review pool is derived from authored activities and key terms; independent transfer questions per lesson are still to be written.
- The **5 legacy courses** (20 short lessons) keep only the Phase 1 pilots.
- Term-recall items test vocabulary, not understanding. Nothing here is a validated mastery measure; no learner study, accessibility audit or screen-reader test has been done. Answer keys are visible in client-side code, so this is formative practice, not a certification tool.

## Addendum: predict-then-run for AI Foundations and Deep Learning (2026-10-22)
Each of the 38 interactive widgets (20 AI Foundations, 18 Deep Learning) now opens with a **"Predict first"** card (`predict-bank.js`, `predict-ui.js`):
- The learner picks an answer and presses *Lock in my prediction* (or *Skip and explore*). Until then the widget is **hidden and inert**, because its own readouts would otherwise give the answer away.
- The reveal states what the widget actually shows, with numbers, and tells the learner what to try next. The choice is kept in `learnai-predict-v1` and is shown again on later visits.
- **Deliberately not recorded in the learning engine.** A wrong prediction is expected and useful, so it does not change practice status or review scheduling.
- **Verified against the live widgets:** `tests/predict-widgets.py` runs every widget and asserts the correct answer and each quoted number (e.g. vacuum 8 vs 13, A* 107 vs BFS 218 cells, alpha-beta 6,138 vs 55,504 positions, beam search "a cat" 0.32). It also tests the lock/commit/persist contract. `tests/content-bank.test.cjs` checks coverage and answer-position balance (8/12/10/8).
- Known limits: the correct option is the single longest in 14 of 38 prompts (a mild guessing cue, capped by a test); a couple of reveals quote single-run figures (local-search 17/20) that depend on the widget's fixed seeds; the Playwright tests need a local server (`python -m http.server 8765`).
- Not yet done: the same prompts for the other ~90 widgets (AI Agents, Machine Learning, LLM, Prompt, Databases).
