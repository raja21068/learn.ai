/* Guards the quizzes of all seven main courses against answers that can be guessed without knowing the material.
   A learner who always picks "the longest option", "option B" or "the one that is not a joke" must not do well.
   Rules, applied to every quiz question of all seven main courses (Databases, AI Agents, Machine Learning, LLM Engineering,
   Prompt Engineering, AI Foundations, Deep Learning; including the lessons added later):
     1. the correct option is the longest (or tied) in at most 15% of questions, and never longer than the next one by more than 25%
     2. the correct answers are spread over the positions (no position above 35%)
     3. every distractor is a real sentence-sized option: at least 12 characters and at least 30% of the correct option's length
     4. no throwaway options such as "Nothing", "None of the above" or "It is not needed"
   The five short legacy courses (ALC_DATA) are not covered.  Run: node tests/quiz-guessability.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
['db-course', 'db-deep', 'agents-course', 'agents-deep', 'ml-course', 'ml-deep', 'llm-course', 'llm-deep', 'prompt-course', 'prompt-deep', 'ai-course', 'dl-course'].forEach(load);

const ENFORCED = { databases: [ctx.DB_COURSE, 40], 'ai-agents': [ctx.AGENTS_COURSE, 42], 'machine-learning': [ctx.ML_COURSE, 36], 'llm-engineering': [ctx.LLM_COURSE, 32],
  'prompt-engineering': [ctx.PROMPT_COURSE, 48], 'ai-foundations': [ctx.AI_COURSE, 40], 'deep-learning': [ctx.DL_COURSE, 36] };
const THROWAWAY = /^(nothing|none( of the above)?|all of the above|it is not needed|not needed|no effect|it'?s not needed)\.?$/i;

function analyse(course) {
  const qs = course.lessons.flatMap(l => (l.quiz || []).map((q, i) => ({ key: l.id + '#' + i, q })));
  const pos = {}; let longest = 0; const problems = [];
  for (const { key, q } of qs) {
    const L = q.options.map(o => o.length), right = L[q.correct], others = L.filter((_, i) => i !== q.correct), maxOther = Math.max(...others);
    pos[q.correct] = (pos[q.correct] || 0) + 1;
    if (right >= maxOther) longest++;
    if (right > maxOther * 1.25) problems.push(key + ': correct option is more than 25% longer than every distractor');
    q.options.forEach((o, i) => {
      if (THROWAWAY.test(o.trim())) problems.push(key + ': throwaway option "' + o + '"');
      if (i !== q.correct && (o.length < 12 || o.length < right * 0.3)) problems.push(key + ': distractor too short to be plausible: "' + o + '"');
    });
  }
  return { n: qs.length, longest, pos, problems };
}

for (const [id, [course, expected]] of Object.entries(ENFORCED)) {
  const r = analyse(course);
  assert.equal(r.n, expected, `expected ${expected} ${id} quiz questions, found ${r.n}`);
  assert.ok(r.longest <= r.n * 0.15, `${id}: the correct option is the longest in ${r.longest}/${r.n} questions`);
  assert.ok(Math.max(...Object.values(r.pos)) <= r.n * 0.35, `${id}: correct answers cluster on one position ${JSON.stringify(r.pos)}`);
  assert.deepEqual(r.problems, [], id + ' quiz problems:\n' + r.problems.join('\n'));
  console.log(`PASS ${id} quizzes: ${r.n} questions, correct option longest in ${r.longest}, positions ${JSON.stringify(r.pos)}, no throwaway or outlier options`);
}
console.log(`PASS all ${Object.keys(ENFORCED).length} main courses: ${Object.values(ENFORCED).reduce((a, [, n]) => a + n, 0)} quiz questions are not guessable by length, position or throwaway options`);
