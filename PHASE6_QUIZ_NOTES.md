# Quiz distractors fixed in all seven main courses, with an enforced guard

**Date:** 2026-10-23. Completes the quiz work started for AI Agents (Phase 4) and Machine Learning (Phase 5).

## The problem
In a review of the existing quizzes, the correct option was the single longest in 19 of 36 questions in Databases, 25 of 28 in LLM Engineering, 40 of 44 in Prompt Engineering, 33 of 40 in AI Foundations and 32 of 36 in Deep Learning, and it was almost always option B. Many distractors were throwaways ("Nothing", "A nicer UI", "Never", "It is required by Python"). A learner who always picked the longest sensible-looking option could score well without knowing the material, which also made the first-try quiz numbers on the evidence pages weaker evidence than they looked.

## What changed
- **All 184 questions in Databases (36), LLM Engineering (28), Prompt Engineering (44), AI Foundations (40) and Deep Learning (36) were rewritten.** Each wrong option is now a plausible misconception of similar or greater length, for example "Because models refuse to read text that has no XML tags" instead of "Models require XML".
- **Correct answers were kept word for word** in 174 of them. The rewrite script refuses to run if a correct answer differs from the source unless the change is listed explicitly. Ten long correct answers were tightened without changing their meaning, so that a natural-sounding distractor could be longer than them: nine in Prompt Engineering (for example "Prompt hardening is one layer; combine it with permissions, validation and monitoring" became "Hardening is one layer; combine it with permissions, validation and monitoring", and a tool description lost its last sentence) and one in AI Foundations. The script printed each before/after pair. One of them also fixes a typo ("sparking constraint" became "creative constraint").
- **Positions are balanced exactly:** each course now has its correct answers spread evenly over the four positions (for example 9/9/9/9 in Databases and 11/11/11/11 in Prompt Engineering).
- With AI Agents (42) and Machine Learning (36), that makes **262 questions in seven courses**.

## The guard (`tests/quiz-guessability.test.cjs`)
Now enforced for all seven main courses, with exact expected question counts so that a new question cannot slip in unchecked:
1. the correct option is the longest or tied in at most 15% of questions, and never more than 25% longer than every distractor;
2. no answer position holds more than 35% of the correct answers;
3. every distractor has at least 12 characters and at least 30% of the correct option's length;
4. no throwaway options such as "Nothing", "None of the above" or "It is not needed".

Result: the correct option is the longest or tied in 0 questions in five courses, 2 of 42 in AI Agents and 3 of 36 in Machine Learning.

## Verification (2026-10-23)
All Node suites and all eight browser suites pass again after the change, including the course regression (12 courses, 151 lessons, no JavaScript errors) and the placement checks, which read quiz answers at run time.

## Honest limits
- **The distractors were written by me and have not been tested with learners.** Plausible wrong answers can make a question harder, and some may be arguable. No item analysis, difficulty estimate or discrimination measure exists. Expect to revise questions once real answer data is available.
- **Length is only one cue.** The guard cannot detect other giveaways, such as a correct answer that is more specific or more qualified than the rest, a distractor that is obviously absurd, or two distractors that are near-duplicates.
- **Not covered:** the five short legacy courses (`ALC_DATA`), the practice activities, the term-recall review questions that are generated from lesson terms (their distractors come from other lessons' terms), and the new transfer scenarios beyond their own tests in the AI Agents and Machine Learning evidence modules.
- Answer keys are still visible in the page source, so the quizzes remain a practice tool, not a test.

**Update:** the four quiz questions in the two new LLM Engineering lessons are covered by the same guard, which now enforces 266 questions in the seven courses.

**Update:** the four quiz questions in the two new Prompt Engineering lessons are covered by the same guard, which now enforces 270 questions in the seven courses.

**Update:** the four quiz questions in the two new Databases lessons are covered by the same guard, which now enforces 274 questions in the seven courses.
