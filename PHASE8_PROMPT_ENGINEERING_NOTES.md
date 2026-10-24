# Prompt Engineering: experiments, a realistic project, personalised explanations, evidence of understanding

**Date:** 2026-10-23. The same layer that Phases 4, 5 and 7 added to AI Agents, Machine Learning and LLM Engineering, now for Prompt Engineering. Everything is deterministic and browser-local: no LLM, no account, no server.

## Why a different experiment
The course already has labs for a linter, templating, few-shot selection, parsing, a chain runner, checks and a prompt registry. The new layer therefore teaches something those labs do not: **which parts of a prompt do the work**, found by ablation, and what each part costs in tokens.

## What was added

### 1. An experiment: the Prompt Lab (`prompt-lab.js`, lesson "Experiment: which parts of a prompt do the work?")
A deliberately literal toy assistant does what a prompt makes unambiguous and fails in the classic ways when something is missing. The learner builds a prompt from nine components (instruction, context, output format, examples, constraints, delimiters, step-by-step reasoning, permission to say "I don't know", temperature), runs eight fixed tasks, and sees which pass and why each failure happened. Prompt length in tokens is counted.
- The claims in the lesson are properties of the engine and are tested over all 3,888 possible prompts: a typical default prompt passes 1 of 8 tasks (57 tokens); the complete prompt passes all 8 (186 tokens); removing one component breaks exactly the tasks that need it; three examples that are mostly one label break the sentiment task even with a precise instruction; only 3 of 3,888 prompts pass everything, and the cheapest uses no examples at all; the goal (7 of 8 tasks within 150 tokens) is met by 3 prompts, all of which give up the detail-heavy apology email.
- A predict-first prompt gates the widget (adding skewed examples to a prompt that already passes the sentiment task).
- A 1-task lab gives the learner a Python copy of the rules and asks them to write the **ablation** and a **greedy prompt minimiser**. The hidden tests embed numbers computed by the JavaScript engine, including a check that the Python copy matches the engine on eight prompts, and they show a real limitation: greedy removal reaches the true optimum from the precise prompt (186 and 106 tokens) but gets stuck at 233 tokens from the "clear instruction plus examples" prompt, because the cheaper prompt needs a swap, not just a deletion.

### 2. A realistic project: "A reliable extraction feature" (Part 5, 60 minutes, 5 milestones with hidden tests)
Schema validation with a sorted list of problems (a bool is not a number); a repair loop that sends the exact problems back to the model and always stops; a majority merge across several samples that flags disputed fields; an evaluation suite that reports pass rates per category, flaky cases and always-failing cases across seeds; and a change gate that blocks a new prompt for too few cases, a regression, newly flaky cases or a cost increase. The model is a plain function passed in, so every milestone is exact.

### 3. Personalised explanations (`prompt-coach.js`)
All 24 lessons have the "Explain it differently" panel (analogy, worked example, common mistake, stretch question), recommended from the learner's own quiz tries, hint use and prediction record, with the reason shown.

### 4. Evidence of understanding (`prompt-evidence.js`, `#/evidence/prompt-engineering`)
Per course part: first-try quiz answers, labs solved without hints, prediction accuracy, **8 new situations** (every part covered, none repeating a lesson quiz question) and **5 written teach-backs** checked against a keyword rubric. Records are stored under `prompt-engineering:<part>` keys, separate from the other courses, and the JSON export contains only this course's records.

### 5. Quizzes
The four new quiz questions meet the guessing guard (`tests/quiz-guessability.test.cjs`, now 270 questions in seven courses).

## Verification (run on 2026-10-23)

| Check | Result |
|---|---|
| `node tests/prompt-lab.test.cjs` | pass: determinism, each component needed by its tasks, skewed examples hurt, exhaustive search over 3,888 prompts |
| `node tests/prompt-coach-evidence.test.cjs` | pass: 24 lessons x 4 explanations, 8 situations (correct option never the longest), 5 rubrics (a model answer hits every idea, nonsense hits none), summary arithmetic, separate storage keys, scenario claims match the engine |
| `node tests/quiz-guessability.test.cjs` | pass for all seven courses (270 questions) |
| `python tests/prompt-labs.py` | pass: 6 tasks in real Pyodide, every solution passes and every starter fails |
| `python tests/prompt-experience.py` | pass: lab flow with prediction lock and exact numbers, coach follows a wrong quiz answer, evidence page and export, no mixing with the other courses, 390 px width, zero JS exceptions |
| All earlier suites | pass; the regression renders 12 courses and 155 lessons |

## Honest limits
- **The lab's "model" is a rule table, not a language model.** The rules encode failure patterns that are common in practice (missing format, unmarked data, skewed examples, no permission to abstain, temperature), but they are not measurements of any real model. Real models fail only some of the time, react to wording in ways no checklist captures, and have components that interact more than the lab shows. The lesson says so; the transferable part is the method (change one thing, read the failure, count the cost, test on your own cases).
- The goal is met by only 3 of 3,888 prompts, so it rewards the "right-sizing" insight and leaves little room for other good answers.
- The project tests that the controls are implemented correctly, not that the feature is accurate on real documents.
- The teach-back check matches words, not reasoning, and personalisation chooses which of four fixed texts you see.
- Only the Prompt Lab has a predict-first prompt in this course; the other 21 widgets do not.
- Stylesheets are not versioned. A browser that cached an earlier `agents.css` can show the new results list unstyled until the file is refreshed (I saw this in the built-in browser pane, not in the automated tests, which start with a clean cache).
- The deep layer exists for AI Agents, Machine Learning, LLM Engineering and Prompt Engineering, and was added to Databases afterwards (see `PHASE9_DATABASES_NOTES.md`). AI Foundations and Deep Learning do not have it yet.
