/* Databases: personalised explanations + evidence of understanding.  Run: node tests/db-coach-evidence.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }, Element: class {} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['db-course', 'db-deep', 'index-lab', 'agents-coach', 'agents-evidence', 'db-coach', 'db-evidence'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const C = ctx.DB_COURSE, K = ctx.AgentsCoach, E = ctx.AgentsEvidence, LAB = ctx.IndexLab, cfg = E.CONFIGS['databases'];

/* ---------------- coach ---------------- */
assert.equal(C.lessons.length, 20);
const bank = K.BANKS['databases'].bank;
for (const l of C.lessons) {
  const b = bank[l.id]; assert.ok(b, 'no coach entry for ' + l.id);
  for (const m of ['analogy', 'example', 'mistake', 'stretch']) assert.ok(b[m] && b[m].length >= 60, `${l.id}.${m} is missing or too short`);
  assert.equal(new Set([b.analogy, b.example, b.mistake, b.stretch]).size, 4, l.id + ' explanations must differ');
}
for (const k of Object.keys(bank)) assert.ok(C.lessons.some(l => l.id === k), 'coach entry for unknown lesson ' + k);
const html = K.html(C, C.lessons[0]);
assert.ok(html.includes('data-coach-course="databases"') && html.includes('Explain it differently'));
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

// the Index Lab data the lesson and scenarios rely on (the plans themselves are checked in the browser by tests/db-experience.py)
assert.equal(LAB.QUERIES.length, 8); assert.equal(LAB.INDEXES.length, 8);
assert.equal(LAB.GOAL.test({ indexes: 3, scans: 3, sorts: 0 }), true); assert.equal(LAB.GOAL.test({ indexes: 4, scans: 3, sorts: 0 }), false);
assert.equal(LAB.GOAL.test({ indexes: 3, scans: 4, sorts: 0 }), false); assert.equal(LAB.GOAL.test({ indexes: 3, scans: 3, sorts: 1 }), false);
const cl = LAB.classify(['SCAN orders USING INDEX idx_created', 'USE TEMP B-TREE FOR ORDER BY']);
assert.ok(cl.scansOrders && cl.indexScan && cl.sorts && !cl.indexed, 'an index scan still reads every row');
assert.ok(LAB.classify(['SEARCH orders USING COVERING INDEX idx_cust_total (customer_id=?)']).covering);
assert.ok(!LAB.classify(['SCAN c', 'SEARCH o USING INDEX idx_cust (customer_id=?)']).scansOrders, 'scanning the small table is not scanning orders');

/* ---------------- teach-back rubric ---------------- */
const GOOD = [
  'A company should use a database because separate files hold the same data in many places, which creates redundancy and inconsistency when one copy is changed and the others are not. A database stores shared data once for every application and can enforce integrity rules such as a constraint, which a file cannot.',
  'A primary key identifies each row uniquely. A foreign key points to a row in another table. A many-to-many relationship such as students and classes needs a separate bridge table that holds a foreign key to each, and referential integrity makes sure that no row points to something that does not exist.',
  'WHERE filters rows before they are grouped, while HAVING filters the groups after aggregation. An INNER JOIN keeps only the matching rows, while a LEFT JOIN keeps every row of the left table and fills the unmatched columns with NULL.',
  'Atomicity means a transaction is all or nothing, isolation keeps concurrent users from seeing half-finished work, and durability means a commit survives a crash. An index speeds up reads but every insert and update must also maintain the index, which is extra work on each write.',
  'SQL injection happens when user text is concatenated into the SQL string, so the attacker text is executed as SQL code. Parameterized queries keep values separate from the code through placeholders. Hiding error messages only hides information and does not stop the attack.',
  'Least privilege means users get only the access their work needs, through roles and specific grants such as SELECT. A DBA handles security tasks such as audit, encryption and backups, and managerial tasks such as setting policies and standards.'
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
  'databases/why-databases': { attempts: { 'quiz:0': { correct: true, firstCorrect: true }, 'quiz:1': { correct: true, firstCorrect: false }, 'lab:0': { correct: true, assisted: false } } },
  'databases/data-models': { attempts: { 'lab:0': { correct: true, assisted: true } } }
};
const rows = E.summarize(C, skills, { transfer: { d1: { correct: true } }, teach: { 'databases:0': { matched: 3, of: 4, words: 50 }, 0: { matched: 1, of: 4, words: 40 } } },
  { 'databases/data-models': { correct: false } });
assert.equal(rows.length, 6);
assert.deepEqual([rows[0].quizAnswered, rows[0].quizFirstTry, rows[0].labSolved, rows[0].labUnassisted], [2, 1, 2, 1]);
assert.deepEqual([rows[0].transferTotal, rows[0].transferAnswered, rows[0].transferCorrect, rows[0].predAnswered, rows[0].predCorrect], [1, 1, 1, 1, 0]);
assert.deepEqual(JSON.parse(JSON.stringify(rows[0].teach)), { matched: 3, of: 4, words: 50 }, 'LLM must use course-prefixed keys');
assert.equal(rows[2].transferTotal, 2); assert.equal(rows[3].transferTotal, 2);
assert.equal(rows.reduce((a, r) => a + r.lessons, 0), 20);
assert.equal(rows.reduce((a, r) => a + r.labTotal, 0), C.lessons.reduce((a, l) => a + l.lab.tasks.length, 0));
assert.ok(E.CONFIGS['ai-agents'] && E.CONFIGS['databases'], 'both courses are registered side by side');
console.log(`PASS Databases coach + evidence: ${Object.keys(bank).length} lessons x 4 explanations, ${T.length} new situations (longest-option ${longest}), 6 teach-backs, summary maths`);
