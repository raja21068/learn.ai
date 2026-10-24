# Machine Learning: experiments, a realistic project, personalised explanations, evidence of understanding, honest quizzes

**Date:** 2026-10-23. The same layer that Phase 4 added to AI Agents, now for Machine Learning. Everything is deterministic and browser-local: no LLM, no account, no server.

## What was added

### 1. An experiment: the ML Lab (`ml-lab.js`, lesson "Experiment: why does a model that looks great fail in deployment?")
A noisy sine curve is fitted with polynomials. The learner changes the **degree**, the **number of training examples**, the **ridge strength**, and whether a **leaked feature** (a noisy copy of the label that will not exist in deployment) is included. The lab reports training, validation and deployment error, draws the fitted curve against the truth, sweeps all twelve degrees, and keeps an experiment log. A stated goal (deployment RMSE of at most 0.36, no leakage) is met by 263 of 840 honest settings and by none of the leaked ones.
- The claims in the lesson are properties of the engine and are tested: a straight line underfits (about 0.60 everywhere), degree 9 on 20 points overfits (training 0.16, validation 2.60), more data or a ridge penalty each cure it, and the leaked feature gives a validation error of 0.06, far below the 0.30 noise floor, while deployment collapses to 0.80.
- A predict-first prompt gates the widget.
- A 2-task lab turns the warning signs into code (`diagnose`, using numbers copied from real runs of the widget) and rebuilds the engine (ridge regression with the normal equations, and degree selection by validation error).

### 2. A realistic project: "An honest churn model" (Part 6, 60 minutes, 5 milestones with hidden tests)
A chronological split with a leakage check, a scaler that learns from the training rows only, precision/recall/F1 with a threshold chosen against the business's required recall, cross-validation folds that never leak, and a release gate that blocks for leakage, no gain over the baseline, low recall or an unfair gap between groups. Pure Python, so every milestone is tested the same way every time. Each milestone has an authored concept hint plus generated "where to work" and "outline" hints.

### 3. Personalised explanations (`ml-coach.js`)
Every one of the 18 lessons has the "Explain it differently" panel (analogy, worked example, common mistake, stretch question), with the recommendation chosen from the learner's own quiz tries, hint use and prediction record, exactly as in AI Agents. The coach module was generalised (`AgentsCoach.register`) so a course only has to supply its texts.

### 4. Evidence of understanding (`ml-evidence.js`, `#/evidence/machine-learning`)
Per course part: first-try quiz answers, labs solved without hints, prediction accuracy, **8 new situations** (every part has at least one; none repeats a lesson question) and **6 written teach-backs** checked against a keyword rubric. The evidence module was generalised (`AgentsEvidence.register`). Records for different courses are stored under separate keys, and each course's JSON export contains only that course's records. AI Agents keeps its original keys, so nothing recorded earlier is lost.

### 5. Quiz distractors fixed and guarded
All 32 original ML quiz questions and the 4 new ones now have plausible distractors of similar length. Before: the correct option was the longest in 26 of 32 questions and was option B in 31 of 32. After: the correct option is the longest or tied in 3 of 36, and the positions are exactly 9/9/9/9. `tests/quiz-guessability.test.cjs` now **enforces** the rules for both AI Agents and Machine Learning (longest-option share, position spread, no outlier-long answer, no throwaway options). The same test reports, but does not enforce, the remaining courses.

## Verification (run on 2026-10-23)

| Check | Result |
|---|---|
| `node tests/ml-lab.test.cjs` | pass: determinism, underfit, overfit, two cures, leakage red flag, goal reachable but not trivial and never by a leaked configuration |
| `node tests/ml-coach-evidence.test.cjs` | pass: 18 lessons x 4 explanations, 8 situations (correct option never the longest), rubrics (a model answer hits every idea, nonsense hits none), summary arithmetic, separate storage keys |
| `node tests/quiz-guessability.test.cjs` | pass for AI Agents (42 questions) and Machine Learning (36 questions) |
| `python tests/ml-labs.py` | pass: 7 tasks in real Pyodide, every solution passes and every starter fails (includes the numpy ridge task) |
| `python tests/ml-experience.py` | pass: lab flow with prediction lock, coach follows a wrong quiz answer, evidence page and export, no mixing with AI Agents, 390 px width, zero JS exceptions |
| All earlier suites | pass; the regression renders 12 courses and 151 lessons |

Two defects were found and fixed by these tests along the way: a rubric pattern for "NaN" that matched inside the word "bananas", and a new quiz question of mine whose correct answer was far longer than its distractors.

## Honest limits
- **Not a validated assessment.** Nothing has been tested with real learners, and no study shows that this improves learning. Answer keys are visible in the page source and records live in one browser.
- The ML Lab is one-dimensional and synthetic. Real overfitting happens in thousands of dimensions and real leakage is subtler (scaling before the split, duplicate rows, post-outcome features). It teaches the pattern to look for, not a method that finds every leak. The goal is met by about 31% of honest settings, so it takes some exploration but is not hard.
- The project tests that the evaluation controls are implemented correctly. It does not show that a churn model built on them is valuable: that needs real data, monitoring and an experiment against the status quo.
- The teach-back check matches words, not reasoning, and can be gamed by keyword stuffing. Personalisation chooses which of four fixed texts you see, not the text itself.
- Only the ML Lab has a predict-first prompt in this course; the other 15 ML widgets do not.
- **Quizzes in the other courses** were fixed afterwards (see `PHASE6_QUIZ_NOTES.md`). The deep layer (experiment, project, coach, evidence) was extended to LLM Engineering in `PHASE7_LLM_ENGINEERING_NOTES.md`; the other courses do not have it yet.
