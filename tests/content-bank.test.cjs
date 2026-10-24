/* Content-bank guarantees, runnable with plain Node: node tests/content-bank.test.cjs
   - every lab task has an authored concept hint, and generated hints 2 and 3 are distinct and non-trivial
   - the outline hint never contains the complete solution
   - every flagship lesson has >= 2 well-formed activities and a review pool
   - generated term questions never contain the answer in their own prompt
   - every AI Foundations / Deep Learning widget has a well-formed predict-then-run prompt */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'assets');
const ctx = { console, setTimeout };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['db-course', 'agents-course', 'ml-course', 'llm-course', 'prompt-course', 'ai-course', 'dl-course',
                 'agents-deep', 'ml-deep', 'llm-deep', 'prompt-deep', 'db-deep', 'challenge-bank', 'challenge-bank-all', 'hints-bank', 'learning-hints', 'predict-bank']) {
  vm.runInContext(fs.readFileSync(path.join(root, f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
}
const COURSES = { databases: ctx.DB_COURSE, 'ai-agents': ctx.AGENTS_COURSE, 'machine-learning': ctx.ML_COURSE, 'llm-engineering': ctx.LLM_COURSE,
                  'prompt-engineering': ctx.PROMPT_COURSE, 'ai-foundations': ctx.AI_COURSE, 'deep-learning': ctx.DL_COURSE };
const B = ctx.LEARNING_CHALLENGES, norm = s => String(s).toLowerCase().replace(/[-_\/]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const squash = s => String(s).replace(/\s+/g, '');

let tasks = 0, lessons = 0, acts = 0, reviews = 0;
for (const [id, c] of Object.entries(COURSES)) {
  assert.ok(c && c.lessons.length, id + ' course missing');
  for (const l of c.lessons) {
    lessons++;
    const key = id + '/' + l.id;
    // ---- hints
    (l.lab && l.lab.tasks || []).forEach((t, i) => {
      tasks++;
      const hk = key + '#' + i;
      assert.ok(ctx.HINT_BANK[hk], 'no authored concept hint for ' + hk);
      const h = ctx.LearningHints.hints(t, id === 'databases' ? 'sql' : 'python', hk);
      assert.equal(h.length, 3, hk);
      assert.equal(new Set(h).size, 3, 'hints must be distinct: ' + hk);
      h.forEach(x => assert.ok(x.length >= 25, 'hint too short: ' + hk));
      assert.ok(!squash(h[2]).includes(squash(t.solution)), 'outline leaks the whole solution: ' + hk);
    });
    // ---- activities
    const A = B.activities[key] || [];
    assert.ok(A.length >= 2, 'fewer than 2 activities: ' + key);
    new Set(A.map(a => a.id)).size === A.length || assert.fail('duplicate activity ids: ' + key);
    for (const a of A) {
      acts++;
      assert.ok(a.prompt && a.why, key + ':' + a.id + ' needs prompt and explanation');
      if (a.type === 'order') {
        assert.ok(a.items.length >= 3 && new Set(a.items).size === a.items.length, key + ' order items');
        // Arrays from the vm sandbox are a different realm, so compare as plain host-realm copies.
        assert.deepEqual(Array.from(a.initial).sort((x, y) => x - y), Array.from(a.items, (_, i) => i), key + ' initial must be a permutation');
        assert.ok(!a.initial.every((x, i) => x === i), key + ' initial order must not already be solved');
      } else if (a.type === 'multi') {
        assert.equal(new Set(a.options).size, a.options.length, key + ' duplicate options');
        assert.ok(a.correct.length >= 1 && a.correct.length < a.options.length && a.correct.every(i => i >= 0 && i < a.options.length), key + ' correct indices');
      } else if (a.type === 'text') {
        assert.ok(a.answers.length && a.answers.every(Boolean), key + ' answers');
        const quoted = (a.prompt.match(/"([^"]*)"/) || [])[1] || '';
        if (a.derived) assert.ok(!norm(quoted).includes(norm(a.answers[0])), 'term question leaks its answer: ' + key);
      } else assert.fail('unknown activity type ' + a.type);
    }
    // ---- reviews
    const R = [].concat(B.reviews[key] || []);
    assert.ok(R.length >= 1, 'no review question: ' + key);
    for (const q of R) {
      reviews++;
      assert.ok(q.options.length >= 3 && new Set(q.options).size === q.options.length, key + ' review options');
      assert.ok(q.correct >= 0 && q.correct < q.options.length && q.why, key + ' review answer');
    }
  }
}
assert.ok(tasks >= 139 && lessons >= 127, `coverage: ${tasks} tasks, ${lessons} lessons`);
console.log(`PASS content bank: ${lessons} lessons, ${tasks} lab tasks with 3-stage hints, ${acts} activities, ${reviews} review questions`);

// ---- predict-then-run: every widget lesson of the two covered courses has a prediction
const PB = ctx.PREDICT_BANK, positions = {};
let predictions = 0, longest = 0;
for (const id of ['ai-foundations', 'deep-learning']) {
  for (const l of COURSES[id].lessons.filter(x => x.widget)) {
    const p = PB[id + '/' + l.id];
    assert.ok(p, 'no prediction for ' + id + '/' + l.id);
    predictions++;
    assert.ok(p.q && p.reveal && p.try, id + '/' + l.id + ' needs q, reveal and try');
    assert.ok(p.options.length >= 3 && new Set(p.options).size === p.options.length, id + '/' + l.id + ' options');
    assert.ok(Number.isInteger(p.correct) && p.correct >= 0 && p.correct < p.options.length, id + '/' + l.id + ' correct index');
    positions[p.correct] = (positions[p.correct] || 0) + 1;
    const L = p.options.map(o => o.length);
    if (L[p.correct] === Math.max(...L) && L.filter(x => x === L[p.correct]).length === 1) longest++;
  }
}
for (const k of ['ai-agents/agent-arena', 'machine-learning/model-lab', 'llm-engineering/llm-service-lab', 'prompt-engineering/prompt-lab', 'databases/index-lab']) { const p = PB[k]; assert.ok(p && p.options.length === 4 && p.correct >= 0 && p.correct < 4 && p.q && p.reveal && p.try, k + ' prediction'); }
for (const k of Object.keys(PB)) assert.ok(/^(ai-foundations|deep-learning|ai-agents|machine-learning|llm-engineering|prompt-engineering|databases)\//.test(k) && COURSES[k.split('/')[0]].lessons.some(l => l.id === k.split('/')[1] && l.widget), 'prediction for unknown lesson ' + k);
assert.ok(Math.max(...Object.values(positions)) <= predictions * 0.5, 'correct answers cluster on one position: ' + JSON.stringify(positions));
assert.ok(longest <= predictions * 0.4, `the correct option is the single longest in ${longest}/${predictions} predictions (guessable)`);
console.log(`PASS predict bank: ${predictions} predictions, correct-answer positions ${JSON.stringify(positions)}, correct is the longest option in ${longest}`);
