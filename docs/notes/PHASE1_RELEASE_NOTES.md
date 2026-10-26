# LearningAi Phase 1 — Learning Fundamentals

**Build:** 2026-10-22 · Browser-only, deterministic adaptive-learning foundation.

## Implemented

1. **AI Foundations is wired into the site** (`assets/ai-course.js`, `assets/ai-widgets.js`, new `assets/ai.css`). The previously unregistered course now has a catalog card, navigation entry, landing page, all 20 lessons, labs, quizzes, and interactive widgets.
2. **Placement checks** at `#/diagnostic/<course-id>` use six existing lesson questions per course, reject partially submitted checks, record a single baseline attempt locally, and recommend the first missed lesson. These are *not standardized placement tests*, and no course content is skipped.
3. **Scaffolded hints** for SQL and Python tasks now reveal three strategy hints first. Full worked code requires another explicit click; hint-assisted completion is recorded separately from unaided first attempts.
4. **Three new activity formats** in eight curated pilot lessons: ordering using accessible up/down buttons, multi-select, and short answer. These activities are supplementary, not prerequisites for the existing lesson-completion badge.
5. **Student dashboard** at `#/my-learning` shows completed lessons, practiced topics, next reviews, diagnostic status, and each lesson's practice status. Retains the existing `learnai-progress-v2` store and adds `learnai-learning-v1`. Pre-existing lesson completions are imported as *legacy assisted evidence*, not treated as independently measured mastery.
6. **Spaced-review queue** at `#/review` schedules first retrieval one day after successful practice; later successful recalls schedule the next at 3, 7, 14, 30, and 60 days. Incorrect reviews are eligible again after at least 10 minutes. Eight pilot topics have alternative review questions. Other topics reuse a course quiz item, explicitly marked as such.
7. **No LLM API / account required.** New logic is rule-based. Learning records remain in browser localStorage.

## Files added

- `assets/learning-engine.js` — persistent attempt/evidence model and review scheduler.
- `assets/learning-hints.js` — three-stage deterministic SQL/Python hint strategy.
- `assets/challenge-bank.js` — authored supplementary challenge and review questions.
- `assets/learning-ui.js` — diagnostic, dashboard, review, and practice user interfaces.
- `assets/learning.css` — responsive components for Phase 1.
- `assets/ai.css` — baseline styling for AI course widgets.
- `tests/learning-engine.test.cjs` — pure Node.js unit tests.
- `tests/browser-smoke.py` — isolated Chromium interaction smoke tests.
- `tests/course-regression.py` — all-course/all-lesson rendering test.

## Quick start

Serve the project folder as a static site:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`, choose **AI Foundations**, take the **Placement check**, try the first lesson and optional practice exercise, visit **My learning**, and return the following day for **Review**. To run tests:

```bash
node tests/learning-engine.test.cjs
python tests/browser-smoke.py
python tests/course-regression.py
```

Browser tests require Python Playwright and Chromium. The test harness deliberately loads HTML, CSS and JavaScript into an isolated Chromium document because navigation to local URLs may be restricted in some testing environments. It does not test CDN-dependent engines.

## Limits and testing honesty

- This is **formative practice software**, not validated adaptive psychometrics. Labels such as *Review scheduled* and *Reviewed twice* represent activity evidence, not proof of proficiency.
- Placement uses a small convenience sample of existing MCQs and cannot diagnose every prerequisite or every misconception.
- Curated alternative challenges currently cover **8 lessons**; all other lessons retain original MCQs/labs. Most review items currently reuse quiz questions and need independent transfer items in Phase 2.
- Local browser storage means no login, device sync, instructor analytics, cloud processing, or reliable backup. Clearing site data removes progress; the previous `learnai-progress-v2` data remains intact.
- Auto-grading is client-side, and source code exposes answer keys; not suitable as a high-stakes exam or cheating-resistant certification tool.
- SQL and Pyodide execution need CDN assets on first use. **The existing runtime-dependent hidden-test execution was not end-to-end tested** in this environment; the tested changes are hint UI and learning-engine integration.
- The third-party *Database Systems* textbook PDF supplied in the original ZIP is **excluded from the new release archive**. Redistribution rights were not established. Students can obtain that book through legitimate channels.

## Verification (2026-10-22)

| Check | Result |
|---|---|
| Syntax check of all site JavaScript | Passed |
| Learning record/scheduler unit tests | Passed |
| Chromium workflow test: diagnostic/quiz/challenges/hints/review/mobile | Passed |
| Rendering test: all 11 courses and 129 lessons, including widgets | Passed: zero uncaught page JavaScript errors |
| CDN-dependent Python/SQL execution | Not verified end-to-end |
| Real users, learning gains, retention effectiveness, accessibility audit | Not evaluated |
