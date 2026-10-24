/* LLM Engineering: personalised explanations + evidence of understanding.  Run: node tests/llm-coach-evidence.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }, Element: class {} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['llm-course', 'llm-deep', 'llm-lab', 'agents-coach', 'agents-evidence', 'llm-coach', 'llm-evidence'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const C = ctx.LLM_COURSE, K = ctx.AgentsCoach, E = ctx.AgentsEvidence, LAB = ctx.LLMLab, cfg = E.CONFIGS['llm-engineering'];

/* ---------------- coach ---------------- */
assert.equal(C.lessons.length, 16);
const bank = K.BANKS['llm-engineering'].bank;
for (const l of C.lessons) {
  const b = bank[l.id]; assert.ok(b, 'no coach entry for ' + l.id);
  for (const m of ['analogy', 'example', 'mistake', 'stretch']) assert.ok(b[m] && b[m].length >= 60, `${l.id}.${m} is missing or too short`);
  assert.equal(new Set([b.analogy, b.example, b.mistake, b.stretch]).size, 4, l.id + ' explanations must differ');
}
for (const k of Object.keys(bank)) assert.ok(C.lessons.some(l => l.id === k), 'coach entry for unknown lesson ' + k);
const html = K.html(C, C.lessons[0]);
assert.ok(html.includes('data-coach-course="llm-engineering"') && html.includes('Explain it differently'));
assert.equal(K.html({ id: 'databases' }, { id: 'x' }), '', 'other courses get no panel');

/* ---------------- transfer scenarios ---------------- */
const T = cfg.transfer;
assert.equal(new Set(T.map(t => t.id)).size, T.length);
assert.deepEqual([...new Set(T.map(t => t.part))].sort(), [0, 1, 2, 3, 4, 5], 'every course part has a new situation');
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

// l6 claims: a cascade can cost several times more than one mid-sized model, with a high escalation rate
const casc = LAB.run({ cascade: true }).metrics, med = LAB.run({ model: 'medium' }).metrics;
assert.ok(casc.cost > 4 * med.cost && casc.p95 > 2 * med.p95 && casc.escalations / 40 > 0.4);

/* ---------------- teach-back rubric ---------------- */
const GOOD = [
  'The three pipelines stay independent and decoupled. The feature store holds the data and features, the registry stores each model version, and inference loads the latest version, so I can rerun, scale or replace one pipeline and still reproduce results.',
  'Chunk size and overlap keep an answer together, hybrid keyword search with BM25 catches exact terms, and a reranker raises the precision of the final few chunks. I measure each change on an evaluation set with recall and precision metrics.',
  'LoRA trains small low-rank adapter matrices while the base weights stay frozen, which saves GPU memory. DPO learns directly from chosen and rejected preference pairs, so there is no separate reward model or RL loop.',
  'Fluent text is only plausible and confident, so I check faithfulness, whether claims are supported by the context. I track context precision and recall for retrieval, and task-specific evaluations on my own use case, not only a benchmark.',
  'A bigger model gives better quality at a higher cost, quantization to int8 or int4 saves memory but can lose quality, a cache helps repeated requests but not tail latency, and a cascade only pays when the small model handles most requests.',
  'I send a small share of traffic to a canary first and wait for enough requests to have evidence. Then I compare quality, latency, cost and errors with the baseline, and a clear gate decides to promote, hold or roll back.'
];
assert.equal(cfg.teach.length, 6);
cfg.teach.forEach((t, i) => {
  assert.equal(t.part, i); assert.ok(t.points.length >= 4);
  assert.equal(E.teachCheck(t, GOOD[i]).filter(x => x.hit).length, t.points.length, `sample answer for part ${i} should hit every idea`);
  assert.equal(E.teachCheck(t, 'bananas are yellow and the sky is blue today').filter(x => x.hit).length, 0, `nonsense must not match in part ${i}`);
  assert.ok(E.wordCount(GOOD[i]) >= 25);
});

/* ---------------- summary maths and storage keys ---------------- */
assert.equal(E.supports(C), true);
const skills = {
  'llm-engineering/ai-twin-architecture': { attempts: { 'quiz:0': { correct: true, firstCorrect: true }, 'quiz:1': { correct: true, firstCorrect: false }, 'lab:0': { correct: true, assisted: false } } },
  'llm-engineering/llmops-toolbox': { attempts: { 'lab:0': { correct: true, assisted: true } } }
};
const rows = E.summarize(C, skills, { transfer: { l1: { correct: true } }, teach: { 'llm-engineering:0': { matched: 3, of: 4, words: 50 }, 0: { matched: 1, of: 4, words: 40 } } },
  { 'llm-engineering/llmops-toolbox': { correct: false } });
assert.equal(rows.length, 6);
assert.deepEqual([rows[0].quizAnswered, rows[0].quizFirstTry, rows[0].labSolved, rows[0].labUnassisted], [2, 1, 2, 1]);
assert.deepEqual([rows[0].transferTotal, rows[0].transferAnswered, rows[0].transferCorrect, rows[0].predAnswered, rows[0].predCorrect], [1, 1, 1, 1, 0]);
assert.deepEqual(JSON.parse(JSON.stringify(rows[0].teach)), { matched: 3, of: 4, words: 50 }, 'LLM must use course-prefixed keys');
assert.equal(rows[4].transferTotal, 2); assert.equal(rows[5].transferTotal, 2);
assert.equal(rows.reduce((a, r) => a + r.lessons, 0), 16);
assert.equal(rows.reduce((a, r) => a + r.labTotal, 0), C.lessons.reduce((a, l) => a + l.lab.tasks.length, 0));
assert.ok(E.CONFIGS['ai-agents'] && E.CONFIGS['llm-engineering'], 'both courses are registered side by side');
console.log(`PASS LLM coach + evidence: ${Object.keys(bank).length} lessons x 4 explanations, ${T.length} new situations (longest-option ${longest}), 6 teach-backs, summary maths`);
