/* Misconception feedback must match the quizzes it explains.
   Run: node tests/misconceptions.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const srcs = (html.match(/<script src="assets\/[^"]+\.js"><\/script>/g) || []).map(t => t.slice(13, -11));
assert.ok(srcs.some(s => /misconceptions-/.test(s)), 'index.html loads the misconception data');
for (const src of srcs) {
  if (/app\.js$/.test(src)) continue;
  try { vm.runInContext(fs.readFileSync(path.join(root, src), 'utf8'), ctx); } catch (_) { /* browser-only modules */ }
}
const W = ctx.window, M = W.MISCONCEPTIONS || {};
const byId = {};
['DB_COURSE', 'OS_COURSE', 'NETWORK_COURSE', 'ISLR_COURSE', 'ALGO_COURSE', 'AI_COURSE', 'AGENTS_COURSE', 'ML_COURSE', 'LLM_COURSE', 'PROMPT_COURSE', 'DL_COURSE']
  .map(k => W[k]).filter(Boolean).forEach(c => { byId[c.id] = c; });

let entries = 0;
for (const [courseId, lessons] of Object.entries(M)) {
  const course = byId[courseId];
  assert.ok(course, `misconceptions for unknown course ${courseId}`);
  for (const [lessonId, questions] of Object.entries(lessons)) {
    const lesson = course.lessons.find(l => l.id === lessonId);
    assert.ok(lesson, `${courseId}: unknown lesson ${lessonId}`);
    for (const [qi, opts] of Object.entries(questions)) {
      const q = (lesson.quiz || [])[+qi];
      assert.ok(q, `${courseId}/${lessonId}: no question #${qi}`);
      for (const [oi, text] of Object.entries(opts)) {
        assert.ok(q.options[+oi] !== undefined, `${lessonId}#${qi}: no option ${oi}`);
        assert.notEqual(+oi, q.correct, `${lessonId}#${qi}: feedback attached to the CORRECT option ${oi}`);
        assert.ok(typeof text === 'string' && text.length >= 30 && text.length <= 260, `${lessonId}#${qi}.${oi}: feedback should be one or two sentences`);
        assert.ok(!/<|javascript:/i.test(text), `${lessonId}#${qi}.${oi}: plain text only`);
        entries++;
      }
    }
  }
}
// The Machine Learning course is fully covered: every wrong option of every question.
const ml = byId['machine-learning'];
for (const l of ml.lessons) (l.quiz || []).forEach((q, qi) => q.options.forEach((_, oi) => {
  if (oi === q.correct) return;
  assert.ok(M['machine-learning']?.[l.id]?.[qi]?.[oi], `machine-learning ${l.id}#${qi} option ${oi} has no misconception feedback`);
}));
console.log(`PASS misconception feedback (${entries} wrong-option explanations; Machine Learning fully covered)`);
