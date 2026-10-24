# LLM Engineering: experiments, a realistic project, personalised explanations, evidence of understanding

**Date:** 2026-10-23. The same layer that Phases 4 and 5 added to AI Agents and Machine Learning, now for LLM Engineering. Everything is deterministic and browser-local: no LLM, no account, no server.

## Why a different experiment
The course already has labs for chunking, rank fusion, prompt building and a release gate, so the new layer targets what it covers least: the **cost, quality and latency trade-off** of serving a model (inference, quantization, deployment).

## What was added

### 1. An experiment: the LLM Service Lab (`llm-lab.js`, lesson "Experiment: the cost, quality and latency triangle")
A fixed queue of 40 requests (FAQs with 12 repeats, summaries, reasoning, code and very hard ones) is served by a chosen model (small, medium, large), a precision (fp16, int8, int4), an optional response cache and an optional small-then-large cascade. A model is correct exactly when its effective skill reaches the request's difficulty; latency and cost follow per-token formulas; the small model is overconfident on three requests. The learner serves the queue, clicks any request to see what happened to it, and compares runs in a log. A stated goal (at least 85% correct, p95 at most 1,500 ms, cost at most $0.05) is met by only 2 of the 24 settings.
- The claims in the lesson are properties of the engine and are tested: bigger models cost more and are slower; quantization lowers cost and latency and never raises quality (a 70B model survives int4 at 100%, a small model loses 17.5 points at int8); a cache cuts cost on repeats but changes neither quality nor p95 latency; **the cascade costs about five times as much as the medium model alone and has a p95 about 2.7 times higher** ($0.0755 against $0.0148, 3,535 ms against 1,298 ms), because 19 of 40 requests pay for both models, and all three wrong cascade answers are overconfident small-model answers; no cascade setting is on the Pareto front.
- A predict-first prompt gates the widget (cascade against medium: which costs less, and what happens to p95?).
- A 2-task lab has the learner **rebuild the serving rules** (cache, plain model, cascade with the overconfident case), and then compute quality, nearest-rank p95, the **Pareto front** and the cheapest setting that meets a target. The hidden tests embed numbers computed by the JavaScript engine at build time, so the Python labs and the widget cannot drift apart.

### 2. A realistic project: "An LLM gateway with budgets" (Part 6, 60 minutes, 5 milestones with hidden tests)
A response cache with a size limit, least-recently-used eviction and an expiry time; a token-bucket rate limiter that says how long to wait; a model cascade with a cost cap that checks the budget **before** paying for the next model and returns the best answer so far; a per-tenant cost ledger with budgets and a month-end forecast; and a canary decision that holds on too little traffic and otherwise promotes or rolls back from quality, latency, cost and error rate. Pure Python with injected clocks, so every milestone is exact. Each has an authored concept hint plus generated "where to work" and "outline" hints.

### 3. Personalised explanations (`llm-coach.js`)
All 16 lessons have the "Explain it differently" panel (analogy, worked example, common mistake, stretch question), recommended from the learner's own quiz tries, hint use and prediction record, with the reason shown. Registered through the shared `AgentsCoach.register`.

### 4. Evidence of understanding (`llm-evidence.js`, `#/evidence/llm-engineering`)
Per course part: first-try quiz answers, labs solved without hints, prediction accuracy, **8 new situations** (every part has at least one, parts 5 and 6 two each; none repeats a lesson question) and **6 written teach-backs** checked against a keyword rubric. Records are stored under `llm-engineering:<part>` keys, separate from AI Agents and Machine Learning, and the JSON export contains only this course's records.

### 5. Quizzes
The four new quiz questions were written to the standard of Phase 6 and are covered by the guard (`tests/quiz-guessability.test.cjs`, now 266 questions in seven courses).

## Verification (run on 2026-10-23)

| Check | Result |
|---|---|
| `node tests/llm-lab.test.cjs` | pass: determinism, size ladder, quantization, cache, costly cascade with overconfident misses, goal met by 2 of 24 settings and by no cascade or large-model setting, Pareto front |
| `node tests/llm-coach-evidence.test.cjs` | pass: 16 lessons x 4 explanations, 8 situations (correct option never the longest), rubrics (a model answer hits every idea, nonsense hits none), summary arithmetic, separate storage keys, and the cascade claim in scenario l6 matches the engine |
| `node tests/quiz-guessability.test.cjs` | pass for all seven courses (266 questions) |
| `python tests/llm-labs.py` | pass: 7 tasks in real Pyodide, every solution passes and every starter fails |
| `python tests/llm-experience.py` | pass: lab flow with prediction lock and exact numbers, coach follows a wrong quiz answer, evidence page and export, no mixing with the other courses, 390 px width, zero JS exceptions |
| All earlier suites | pass; the regression renders 12 courses and 153 lessons |

## Honest limits
- **Not a validated assessment.** Nothing has been tested with real learners, and answer keys are visible in the page source.
- **The lab is a model, not a benchmark.** A request is either solvable by a model or not, confidence is a simple rule, latency and price are made-up per-token formulas, and the traffic is 40 fixed requests. Real quality is graded, real latency depends on load and batching, real prices change, and the cache hit rate depends on your traffic. In particular the headline result (the cascade losing to the medium model) depends on this queue's mix of hard requests; with mostly easy traffic a cascade can win. The lesson's "what this model leaves out" section says that results depend on the traffic, and the coach's stretch question asks the learner to reason about an easier mix, but the lesson text does not state this particular dependence outright.
- The goal is met by only 2 of 24 settings (both the medium model at full precision), so it rewards the "right-sizing" insight but leaves little room for other good answers; the Pareto table is where the other reasonable settings appear.
- The project tests that the controls are implemented correctly, not that they suit your traffic. The teach-back check matches words, not reasoning, and personalisation chooses which of four fixed texts you see.
- Only the Service Lab has a predict-first prompt in this course; the other 13 LLM widgets do not.
- The deep layer exists for AI Agents, Machine Learning and LLM Engineering, and was added to Prompt Engineering afterwards (see `PHASE8_PROMPT_ENGINEERING_NOTES.md`). Databases, AI Foundations and Deep Learning do not have it yet.
