/* AI Agents: personalised explanations + evidence of understanding.  Run: node tests/agents-coach-evidence.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }, Element: class {} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['agents-course', 'agents-deep', 'agents-arena', 'agents-coach', 'agents-evidence'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const C = ctx.AGENTS_COURSE, K = ctx.AgentsCoach, E = ctx.AgentsEvidence, A = ctx.AgentArena;

/* ---------------- coach ---------------- */
assert.equal(C.lessons.length, 21);
for (const l of C.lessons) {
  const b = K.BANK[l.id];
  assert.ok(b, 'no coach entry for ' + l.id);
  for (const m of ['analogy', 'example', 'mistake', 'stretch']) assert.ok(b[m] && b[m].length >= 60, `${l.id}.${m} is missing or too short`);
  assert.equal(new Set([b.analogy, b.example, b.mistake, b.stretch]).size, 4, l.id + ' explanations must differ');
}
for (const k of Object.keys(K.BANK)) assert.ok(C.lessons.some(l => l.id === k), 'coach entry for unknown lesson ' + k);

const R = K.recommend;
assert.equal(R(null, null).mode, 'analogy');                                                        // nothing recorded yet
assert.equal(R({ attempts: { 'quiz:0': { correct: true, firstCorrect: true, tries: 1 } }, hinted: {} }, null).mode, 'analogy');
assert.equal(R({ attempts: { 'quiz:0': { correct: true, firstCorrect: false, tries: 2 } }, hinted: {} }, null).mode, 'mistake'); // needed 2 tries
assert.equal(R({ attempts: { 'quiz:0': { correct: false, firstCorrect: false, tries: 1 } }, hinted: {} }, null).mode, 'mistake'); // still wrong
assert.equal(R({ attempts: {}, hinted: { 'lab:0': 2 } }, null).mode, 'example');                  // used a hint
assert.equal(R({ attempts: { 'lab:0': { correct: true, assisted: true } }, hinted: {} }, null).mode, 'example');
assert.equal(R(null, { correct: false }).mode, 'analogy');                                          // missed prediction
assert.equal(R({ attempts: { 'quiz:0': { correct: true, firstCorrect: true, tries: 1 }, 'lab:0': { correct: true, assisted: false } }, hinted: {} }, null).mode, 'stretch');
// priority: a quiz struggle outranks hints, which outrank a missed prediction
assert.equal(R({ attempts: { 'quiz:0': { correct: false, tries: 1 } }, hinted: { 'lab:0': 3 } }, { correct: false }).mode, 'mistake');
assert.equal(R({ attempts: {}, hinted: { 'lab:0': 3 } }, { correct: false }).mode, 'example');
assert.ok(/1 quiz question needed more than one try or is still wrong/.test(R({ attempts: { 'quiz:0': { correct: false, tries: 1 } }, hinted: {} }, null).why));
assert.ok(R(null, null).why.length > 20, 'every recommendation explains itself');

/* ---------------- transfer scenarios ---------------- */
const T = E.TRANSFER;
assert.equal(new Set(T.map(t => t.id)).size, T.length);
assert.deepEqual([...new Set(T.map(t => t.part))].sort(), [0, 1, 2, 3, 4, 5, 6, 7], 'every course part has a new situation');
const pos = {};
for (const t of T) {
  assert.ok(t.scenario.length > 80 && t.q && t.why.length > 60, t.id);
  assert.ok(t.options.length >= 4 && new Set(t.options).size === t.options.length && t.correct >= 0 && t.correct < t.options.length, t.id + ' options');
  pos[t.correct] = (pos[t.correct] || 0) + 1;
}
let longest = 0;
for (const t of T) { const L = t.options.map(o => o.length); if (L[t.correct] === Math.max(...L)) longest++; }
assert.ok(longest <= T.length * 0.3, `the correct option is the longest in ${longest}/${T.length} situations (guessable by length)`);
assert.ok(Math.max(...Object.values(pos)) <= T.length * 0.4, 'correct answers cluster on one position: ' + JSON.stringify(pos));
// Scenarios must be new: none may reuse a quiz question or the arena prediction wording.
const quizQs = new Set(C.lessons.flatMap(l => (l.quiz || []).map(q => q.q)));
for (const t of T) assert.ok(!quizQs.has(t.q), 'transfer question repeats a quiz question: ' + t.id);

// t7 claims what the arena does with the filter and validation on but no retries and no fallback.
const m7 = A.run({ filter: true, validate: true }).metrics;
assert.equal(m7.harm, 0); assert.equal(m7.wrong, 0); assert.ok(m7.failed > 0, 'flaky tickets must still fail in t7');
assert.equal(A.run({ filter: true, validate: true, retries: 3 }).metrics.failed, 0);

/* ---------------- teach-back rubric ---------------- */
assert.equal(E.TEACH.length, 8);
const GOOD = [
  'An agent works toward a goal and keeps going in a loop: it decides its next step, reads the observation from the tool, and repeats until the goal is met.',
  'The model only produces text that matches a JSON schema. I validate the name and the types, treat it as untrusted and possibly invalid, and check permissions against an allowlist.',
  'A plan has sub-goals. When a step fails with an unexpected error I compare the observation with the plan, re-plan that branch, and stop or say I do not know when the budget runs out.',
  'I inspect the log of what was retrieved and compare the retrieved passage with what the model generated, then test whether the answer is grounded in the context.',
  'It is better when roles are separable and specialised and worse because of cost, latency and complexity: someone must route and coordinate, and a single agent can be simpler.',
  'An average mixes many cases, so a slice can regress. Compare each category against the baseline and gate the release so a regression is blocked.',
  'Defence needs several layers: least privilege and approval limit what a successful attack can do, because a filter only detects patterns and attackers rephrase to bypass it.',
  'Before trusting it with real customers I would run a pilot on real traffic, add monitoring and audit logs, keep human review and escalation, and keep running regression evals and adversarial tests.'
];
E.TEACH.forEach((t, i) => {
  assert.equal(t.part, i); assert.ok(t.points.length >= 4);
  assert.equal(E.teachCheck(t, GOOD[i]).filter(x => x.hit).length, t.points.length, `sample answer for part ${i} should hit every idea`);
  assert.equal(E.teachCheck(t, 'bananas are yellow and the sky is blue today').filter(x => x.hit).length, 0, `nonsense must not match in part ${i}`);
  assert.ok(E.wordCount(GOOD[i]) >= 25);
});
assert.equal(E.wordCount('  a  b\nc '), 3);

/* ---------------- summary maths ---------------- */
const skills = {
  'ai-agents/agent-spectrum': { attempts: { 'quiz:0': { correct: true, firstCorrect: true }, 'quiz:1': { correct: true, firstCorrect: false }, 'lab:0': { correct: true, assisted: false } } },
  'ai-agents/true-agency': { attempts: { 'lab:0': { correct: true, assisted: true } } },
  'ai-agents/tool-calling': { attempts: { 'quiz:0': { correct: false, firstCorrect: false } } }
};
const rows = E.summarize(C, skills, { transfer: { t1: { correct: true }, t2: { correct: false } }, teach: { 0: { matched: 3, of: 4, words: 50 } } }, { 'ai-agents/agent-spectrum': { correct: true }, 'ai-agents/true-agency': { correct: false } });
assert.equal(rows.length, 8);
assert.deepEqual([rows[0].quizAnswered, rows[0].quizFirstTry, rows[0].labSolved, rows[0].labUnassisted], [2, 1, 2, 1]);
assert.deepEqual([rows[0].predAnswered, rows[0].predCorrect, rows[0].transferTotal, rows[0].transferAnswered, rows[0].transferCorrect], [2, 1, 1, 1, 1]);
assert.deepEqual(JSON.parse(JSON.stringify(rows[0].teach)), { matched: 3, of: 4, words: 50 });
assert.equal(rows[1].transferCorrect, 0); assert.equal(rows[1].transferAnswered, 1); assert.equal(rows[1].quizAnswered, 1); assert.equal(rows[1].quizFirstTry, 0);
assert.equal(rows[5].transferTotal, 2, 'part 6 (index 5) has two new situations');
assert.equal(rows.reduce((a, r) => a + r.lessons, 0), 21);
assert.equal(rows.reduce((a, r) => a + r.labTotal, 0), C.lessons.reduce((a, l) => a + l.lab.tasks.length, 0));
assert.equal(E.supports(C), true);

console.log(`PASS agents coach + evidence: ${Object.keys(K.BANK).length} lessons x 4 explanations, ${T.length} new situations, 8 teach-backs, rules and summary maths`);
