/* Prompt Engineering: personalised explanations + evidence of understanding.  Run: node tests/prompt-coach-evidence.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }, Element: class {} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['prompt-course', 'prompt-deep', 'prompt-lab', 'agents-coach', 'agents-evidence', 'prompt-coach', 'prompt-evidence'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const C = ctx.PROMPT_COURSE, K = ctx.AgentsCoach, E = ctx.AgentsEvidence, LAB = ctx.PromptLab, cfg = E.CONFIGS['prompt-engineering'];

/* ---------------- coach ---------------- */
assert.equal(C.lessons.length, 24);
const bank = K.BANKS['prompt-engineering'].bank;
for (const l of C.lessons) {
  const b = bank[l.id]; assert.ok(b, 'no coach entry for ' + l.id);
  for (const m of ['analogy', 'example', 'mistake', 'stretch']) assert.ok(b[m] && b[m].length >= 60, `${l.id}.${m} is missing or too short`);
  assert.equal(new Set([b.analogy, b.example, b.mistake, b.stretch]).size, 4, l.id + ' explanations must differ');
}
for (const k of Object.keys(bank)) assert.ok(C.lessons.some(l => l.id === k), 'coach entry for unknown lesson ' + k);
const html = K.html(C, C.lessons[0]);
assert.ok(html.includes('data-coach-course="prompt-engineering"') && html.includes('Explain it differently'));
assert.equal(K.html({ id: 'databases' }, { id: 'x' }), '', 'other courses get no panel');

/* ---------------- transfer scenarios ---------------- */
const T = cfg.transfer;
assert.equal(new Set(T.map(t => t.id)).size, T.length);
assert.deepEqual([...new Set(T.map(t => t.part))].sort(), [0, 1, 2, 3, 4], 'every course part has a new situation');
const pos = {}; let longest = 0;
const quizQs = new Set(C.lessons.flatMap(l => (l.quiz || []).map(q => q.q)));
for (const t of T) {
  assert.ok(t.scenario.length > 80 && t.q && t.why.length > 60, t.id);
  assert.ok(t.options.length === 4 && new Set(t.options).size === 4 && t.correct >= 0 && t.correct < 4, t.id + ' options');
  pos[t.correct] = (pos[t.correct] || 0) + 1;
  const L = t.options.map(o => o.length); if (L[t.correct] >= Math.max(...L.filter((_, i) => i !== t.correct))) longest++;
  assert.ok(!quizQs.has(t.q), 'transfer question repeats a quiz question: ' + t.id);
}
assert.ok(Math.max(...Object.values(pos)) <= T.length * 0.4, 'correct answers cluster on one position: ' + JSON.stringify(pos));
assert.ok(longest <= T.length * 0.3, `the correct option is the longest in ${longest}/${T.length} situations (guessable by length)`);

// p1/p2 claims: delimiters are what task 4 needs, and skewed examples break the sentiment task even with a precise instruction
const full = { instruction: 'precise', context: 'full', format: 'schema', examples: 'none', constraints: true, delimiters: true, reasoning: true, abstain: true, temperature: 'medium' };
assert.ok(LAB.run(Object.assign({}, full, { delimiters: false })).results[3].ok === false && LAB.run(full).results[3].ok === true);
assert.ok(LAB.run(Object.assign({}, full, { examples: 'skewed' })).results[1].ok === false);

/* ---------------- teach-back rubric ---------------- */
const GOOD = [
  'The role sets the persona and tone, the task and context say what to do and what background to use, and the output format such as a JSON schema makes the result usable by code. A vague request leaves every decision to the model, so it has to guess.',
  'Examples that are skewed toward one label bias the model so it leans toward the majority label. I choose balanced, representative examples, remember that they cost tokens, and test against a precise instruction with no examples.',
  'For a creative task I raise the temperature for variety and ask for several options with a constraint. For a factual task I require sources and citations, allow I do not know, and have a human verify the facts.',
  'The application assembles the prompt from a template, the retrieved context and the history. There is a token budget, so snippets get priorities and shorter versions, and the order and position in the prompt also matter.',
  'I run a test set with cases in several categories, compare it with the old version to find any regression, also check flaky cases, cost and injection risk, and keep prompt versions in a registry with an owner so I can roll back.'
];
assert.equal(cfg.teach.length, 5);
cfg.teach.forEach((t, i) => {
  assert.equal(t.part, i); assert.ok(t.points.length >= 4);
  assert.equal(E.teachCheck(t, GOOD[i]).filter(x => x.hit).length, t.points.length, `sample answer for part ${i} should hit every idea`);
  assert.equal(E.teachCheck(t, 'bananas are yellow and the sky is blue today').filter(x => x.hit).length, 0, `nonsense must not match in part ${i}`);
  assert.ok(E.wordCount(GOOD[i]) >= 25);
});

/* ---------------- summary maths and storage keys ---------------- */
assert.equal(E.supports(C), true);
const skills = {
  'prompt-engineering/how-llms-read-prompts': { attempts: { 'quiz:0': { correct: true, firstCorrect: true }, 'quiz:1': { correct: true, firstCorrect: false }, 'lab:0': { correct: true, assisted: false } } },
  'prompt-engineering/prompt-anatomy': { attempts: { 'lab:0': { correct: true, assisted: true } } }
};
const rows = E.summarize(C, skills, { transfer: { p1: { correct: true } }, teach: { 'prompt-engineering:0': { matched: 3, of: 4, words: 50 }, 0: { matched: 1, of: 4, words: 40 } } },
  { 'prompt-engineering/prompt-anatomy': { correct: false } });
assert.equal(rows.length, 5);
assert.deepEqual([rows[0].quizAnswered, rows[0].quizFirstTry, rows[0].labSolved, rows[0].labUnassisted], [2, 1, 2, 1]);
assert.deepEqual([rows[0].transferTotal, rows[0].transferAnswered, rows[0].transferCorrect, rows[0].predAnswered, rows[0].predCorrect], [1, 1, 1, 1, 0]);
assert.deepEqual(JSON.parse(JSON.stringify(rows[0].teach)), { matched: 3, of: 4, words: 50 }, 'LLM must use course-prefixed keys');
assert.equal(rows[1].transferTotal, 2); assert.equal(rows[3].transferTotal, 2); assert.equal(rows[4].transferTotal, 2);
assert.equal(rows.reduce((a, r) => a + r.lessons, 0), 24);
assert.equal(rows.reduce((a, r) => a + r.labTotal, 0), C.lessons.reduce((a, l) => a + l.lab.tasks.length, 0));
assert.ok(E.CONFIGS['ai-agents'] && E.CONFIGS['prompt-engineering'], 'both courses are registered side by side');
console.log(`PASS Prompt coach + evidence: ${Object.keys(bank).length} lessons x 4 explanations, ${T.length} new situations (longest-option ${longest}), 5 teach-backs, summary maths`);
