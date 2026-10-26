# AI Agents: deeper experiments, personalised explanations, a realistic project and evidence of understanding

**Date:** 2026-10-22. Builds on Phase 3. Everything is deterministic and browser-local: no LLM, no account, no server.

## What was added

### 1. An experiment, not just a demo: the Agent Arena (`agents-arena.js`, lesson "Experiment: which guardrail fixes which failure?")
A support-desk agent works through a fixed queue of 26 tickets containing four failure families (6 flaky tools, 5 malformed tool outputs, 4 prompt injections, 2 loops) plus 4 risky actions. The learner sets retries, a step budget and five guardrails, runs the queue, clicks any ticket to read what happened to it, and compares runs in an experiment log. A stated goal (nothing harmful, nothing silently wrong, at least 24 of 26 handled, cost at most 130) is reachable by 86 of 1,024 policies, so it takes real exploration.
- The lesson's claims are properties of the engine and are tested: each guardrail fixes its own failure family and no single control makes the queue safe; approval instead of the filter works but costs 138 against 98; a small budget causes timeouts while a large one burns more on loops.
- A predict-first prompt gates the widget (it states the filter-only result before the learner sees it).
- A 2-task lab has the learner **rebuild the arena's rules in Python** and then write the **ablation** that measures each control.

### 2. A realistic project: "Ship a support-desk agent" (Part 7, 60 minutes, 5 milestones with hidden tests)
Tool registry with validation, a bounded agent loop that shows tool errors to the agent, retries with a flagged fallback, an injection guard with approval and an audit log, and a release gate (`evaluate` + `gate`) that blocks harm, weak pass rates and regressions. The policy is a plain function, so every milestone is tested the same way every time. Each milestone has an authored concept hint plus generated 'where to work' and 'outline' hints, like every other lab.

### 3. Personalised explanations (`agents-coach.js`)
Every one of the 21 lessons has an "Explain it differently" panel with four authored explanations: analogy, worked example, common mistake and stretch question. Which one is recommended comes from the learner's own record by visible rules (a quiz question that took more than one try or is still wrong, then lab hints, then a missed prediction, then clean quiz and lab, otherwise analogy). The panel always says **why**, re-reads the record each time it is opened, and calls the recommendation a heuristic.

### 4. Evidence of understanding (`agents-evidence.js`, `#/evidence/ai-agents`)
Per course part, the page shows first-try quiz answers, labs solved without hints, prediction accuracy, **10 new situations** (every part has at least one; none repeats a lesson question) and a **written teach-back** (8 prompts, at least 40 words) checked against a keyword rubric that says exactly which key ideas were mentioned. It can export a JSON file of the learner's own evidence and print. It never produces a grade or certificate.

## Verification (run on 2026-10-22)

| Check | Result |
|---|---|
| `node tests/agents-arena.test.cjs` | pass: determinism, one failure family per guardrail, goal reachable but not trivial |
| `node tests/agents-coach-evidence.test.cjs` | pass: 21 lessons x 4 explanations, recommendation rules and priority, 10 situations, 8 rubrics (a model answer hits every idea and nonsense hits none), summary arithmetic, and the arena claim in situation t7 matches the engine |
| `python tests/agents-labs.py` | pass: 7 tasks in real Pyodide, every solution passes and every starter fails |
| `python tests/agents-experience.py` | pass: arena flow with prediction lock, coach follows a wrong quiz answer, evidence page, export, reload persistence, 390 px width, zero JS exceptions |
| Earlier suites (`content-bank`, `learning-engine`, `phase2-core`, `browser-smoke`, `phase2-studio`, `predict-widgets`, `course-regression`) | pass; the regression now renders 12 courses and 149 lessons |

## Honest limits
- **Not a validated assessment.** Nothing here has been tested with real learners, and no study shows that it improves learning or that the evidence predicts competence. Answer keys are visible in the page source and records live in one browser, so a determined learner can look up answers.
- The arena is a small deterministic model. Real tools fail more messily and real injections are harder to spot than a list of phrases. It teaches trade-offs, not how real agents behave.
- The project tests whether the controls are implemented correctly, not whether an agent built on them is safe in production.
- The teach-back check matches words, not reasoning, and can be gamed by keyword stuffing.
- Personalisation is rule-based on quiz, hint, lab and prediction records. It adapts which explanation you see, not the explanation itself, and the four texts are the same for every learner.
- **Quiz guessability (fixed for AI Agents).** The original AI Agents quizzes were guessable: the correct option was the single longest in 38 of 42 questions, nearly always option B, and distractors were often throwaways ("Nothing", "A nicer UI"). All 42 questions now have plausible distractors of similar or greater length, the right answer is the longest in 2 of 42, and positions are spread 10/10/10/12. `tests/quiz-guessability.test.cjs` enforces this for AI Agents (longest-option share, position spread, minimum distractor size, no throwaway options). **The other courses had the same weakness; it was fixed later (see `PHASE5_MACHINE_LEARNING_NOTES.md` and `PHASE6_QUIZ_NOTES.md`).**
- The 10 new situations were also written so the right answer is never the longest option (capped at 30% by a test).
- Only the arena has a predict-first prompt; the other 14 Agents widgets do not yet.
- Machine Learning now has the same layer (see `PHASE5_MACHINE_LEARNING_NOTES.md`, which also fixed its quizzes); the other courses do not.
