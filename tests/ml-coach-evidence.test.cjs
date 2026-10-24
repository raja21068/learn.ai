/* Machine Learning: personalised explanations + evidence of understanding.  Run: node tests/ml-coach-evidence.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }, Element: class {} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['ml-course', 'ml-deep', 'ml-lab', 'agents-coach', 'agents-evidence', 'ml-coach', 'ml-evidence'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const C = ctx.ML_COURSE, K = ctx.AgentsCoach, E = ctx.AgentsEvidence, M = ctx.MLLab, cfg = E.CONFIGS['machine-learning'];

/* ---------------- coach ---------------- */
assert.equal(C.lessons.length, 18);
const bank = K.BANKS['machine-learning'].bank;
for (const l of C.lessons) {
  const b = bank[l.id]; assert.ok(b, 'no coach entry for ' + l.id);
  for (const m of ['analogy', 'example', 'mistake', 'stretch']) assert.ok(b[m] && b[m].length >= 60, `${l.id}.${m} is missing or too short`);
  assert.equal(new Set([b.analogy, b.example, b.mistake, b.stretch]).size, 4, l.id + ' explanations must differ');
}
for (const k of Object.keys(bank)) assert.ok(C.lessons.some(l => l.id === k), 'coach entry for unknown lesson ' + k);
const html = K.html(C, C.lessons[0]);
assert.ok(html.includes('data-coach-course="machine-learning"') && html.includes('Explain it differently'));
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

// m1 claims: a leaked feature gives an implausibly low validation error and a collapse in deployment
const leaked = M.run({ degree: 3, n: 20, leak: true }).metrics;
assert.ok(leaked.val < M.NOISE_FLOOR / 3 && leaked.deploy > 5 * leaked.val);

/* ---------------- teach-back rubric ---------------- */
const GOOD = [
  'A training score only measures how well the model fits data it has seen and can memorise. I need held-out validation data to detect overfitting, and if the result is suspiciously too good I look for leakage.',
  'Each tree overfits but the trees are diverse because they use different bootstrap samples, so averaging their votes cancels the noise and lowers variance. More correlated trees or boosting rounds can still overfit.',
  'Features with large values dominate the distance, so I standardise every column. The scaler is fit on the training rows only to avoid leakage, and k-means still assumes round clusters and is hurt by outliers.',
  'Backprop applies the chain rule layer by layer. Gradients can vanish and become tiny, or explode and give NaN. Residual connections, normalisation, ReLU, clipping and a smaller learning rate help.',
  'A random split leaks the future into training. I use chronological validation, walk forward in time, and compare with a naive baseline such as yesterday value so the result is realistic for production.',
  'Exploration tries actions the agent has not tried. Without it the agent gets stuck on a mediocre route and never finds the better reward. Epsilon decay balances it with exploiting the best known action.'
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
  'machine-learning/ml-landscape': { attempts: { 'quiz:0': { correct: true, firstCorrect: true }, 'quiz:1': { correct: true, firstCorrect: false }, 'lab:0': { correct: true, assisted: false } } },
  'machine-learning/model-lab': { attempts: { 'lab:0': { correct: true, assisted: true } } }
};
const rows = E.summarize(C, skills, { transfer: { m1: { correct: true }, m2: { correct: false } }, teach: { 'machine-learning:0': { matched: 3, of: 4, words: 50 }, 0: { matched: 1, of: 4, words: 40 } } },
  { 'machine-learning/model-lab': { correct: false } });
assert.equal(rows.length, 6);
assert.deepEqual([rows[0].quizAnswered, rows[0].quizFirstTry, rows[0].labSolved, rows[0].labUnassisted], [2, 1, 2, 1]);
assert.deepEqual([rows[0].transferTotal, rows[0].transferAnswered, rows[0].transferCorrect, rows[0].predAnswered, rows[0].predCorrect], [2, 2, 1, 1, 0]);
assert.deepEqual(JSON.parse(JSON.stringify(rows[0].teach)), { matched: 3, of: 4, words: 50 }, 'ML must use course-prefixed keys, not the AI Agents numeric ones');
assert.equal(rows.reduce((a, r) => a + r.lessons, 0), 18);
assert.equal(rows.reduce((a, r) => a + r.labTotal, 0), C.lessons.reduce((a, l) => a + l.lab.tasks.length, 0));
assert.ok(E.CONFIGS['ai-agents'] && E.CONFIGS['machine-learning']);
console.log(`PASS ML coach + evidence: ${Object.keys(bank).length} lessons x 4 explanations, ${T.length} new situations (longest-option ${longest}), 6 teach-backs, summary maths`);
