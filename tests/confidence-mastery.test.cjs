/* Confidence calibration and mastery checks: the learning rules they promise.
   Run: node tests/confidence-mastery.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const Confidence = require('../assets/confidence.js');
const Mastery = require('../assets/mastery.js');

// ---------- Confidence: only first attempts count; confident mistakes are surfaced ----------
Confidence.reset();
let r = Confidence.record('ml', 'l1', 0, 'sure', false);
assert.deepEqual([r.first, r.confidentMistake], [true, true], 'a sure but wrong first attempt is a confident mistake');
r = Confidence.record('ml', 'l1', 0, 'sure', true);
assert.equal(r.first, false, 'a retry after feedback must not be recorded');
Confidence.record('ml', 'l1', 1, 'sure', true);
Confidence.record('ml', 'l2', 0, 'guess', true);
Confidence.record('ml', 'l2', 1, 'bogus-level', true);           // unknown levels are stored as unrated
Confidence.record('db', 'x', 0, 'sure', true);
let s = Confidence.summary('ml');
assert.deepEqual(s.sure, { n: 2, right: 1 });
assert.deepEqual(s.guess, { n: 1, right: 1 });
assert.deepEqual(s.unsure, { n: 0, right: 0 });
assert.equal(Confidence.summary().sure.n, 3, 'summary without a course covers every course');
assert.deepEqual(Confidence.confidentMistakes('ml'), [{ courseId: 'ml', lessonId: 'l1', qi: 0 }]);
assert.match(Confidence.message(s), /when sure you were right 50% of the time \(1\/2\)/);
assert.equal(Confidence.message(Confidence.summary('nothing-here')), '', 'no data, no message');
// Over-confidence tip only with enough evidence (>= 3 sure answers, < 75% right)
Confidence.reset();
['a', 'b', 'c'].forEach((l, i) => Confidence.record('c', l, 0, 'sure', i === 0));
assert.match(Confidence.message(Confidence.summary('c')), /more confident than your answers support/);

// ---------- Mastery: coverage, threshold, sticky mastery ----------
const q = (n) => ({ q: 'Q' + n, options: ['a', 'b', 'c', 'd'], correct: n % 4, why: '' });
const course = {
  id: 'demo', parts: ['One', 'Two'],
  lessons: [
    { id: 'a', part: 0, quiz: [q(0), q(1), q(2)] }, { id: 'b', part: 0, quiz: [q(3), q(4), q(5)] },
    { id: 'c', part: 0, quiz: [q(6), q(7), q(8)] }, { id: 'd', part: 0, quiz: [q(9), q(10), q(11)] },
    { id: 'e', part: 1, quiz: [q(12)] }
  ]
};
assert.deepEqual(Mastery.parts(course).map(p => [p.index, p.lessons.length]), [[0, 4], [1, 1]]);
assert.equal(Mastery.parts({ lessons: [{ id: 'x' }] })[0].name, 'Whole course', 'a course without parts is one part');
let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const items = Mastery.build(course, 0, rand);
assert.equal(items.length, Mastery.PART_SIZE, 'a part check has 8 questions when enough exist');
assert.ok(items.every(it => ['a', 'b', 'c', 'd'].includes(it.lessonId)), 'only questions from that part');
const perLesson = items.reduce((m, it) => (m[it.lessonId] = (m[it.lessonId] || 0) + 1, m), {});
assert.ok(Object.values(perLesson).every(n => n === 2), 'round-robin: every lesson of the part is covered evenly');
assert.equal(new Set(items.map(it => it.lessonId + it.qi)).size, items.length, 'no question repeats within a check');
assert.equal(Mastery.build(course, 1).length, 1, 'a small part yields as many questions as it has');
assert.equal(Mastery.build(course, 'final').length, 13, 'final check is capped by the questions available');

const right = items.map(it => it.q.correct), wrong = it => (it.q.correct + 1) % 4;
let g = Mastery.grade(items, right);
assert.deepEqual([g.pct, g.passed, g.missed.length], [100, true, 0]);
const eightyPct = Array.from({ length: 10 }, (_, i) => ({ lessonId: 'a', qi: i, q: q(i) }));
g = Mastery.grade(eightyPct, eightyPct.map((it, i) => i < 8 ? it.q.correct : wrong(it)));
assert.deepEqual([g.pct, g.passed], [80, true], 'exactly 80% passes');
g = Mastery.grade(eightyPct, eightyPct.map((it, i) => i < 7 ? it.q.correct : null));
assert.deepEqual([g.pct, g.passed, g.missed.length], [70, false, 3], 'skipped questions count as missed');

Mastery.reset();
Mastery.record('demo', 0, 60);
let m = Mastery.record('demo', 0, 85);
assert.deepEqual([m.best, m.mastered, m.attempts], [85, true, 2]);
m = Mastery.record('demo', 0, 40);
assert.deepEqual([m.best, m.last, m.mastered], [85, 40, true], 'mastery, once shown, is kept; best score is kept');

// ---------- Real course data: every course yields usable checks ----------
const ctx = { window: {}, console }; vm.createContext(ctx);
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
for (const src of html.match(/<script src="assets\/[^"]+\.js"><\/script>/g).map(t => t.slice(13, -11))) {
  if (/app\.js$|confidence|mastery/.test(src)) continue;
  try { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', src), 'utf8'), ctx); } catch (_) { /* browser-only modules */ }
}
const W = ctx.window, courses = ['DB_COURSE', 'OS_COURSE', 'NETWORK_COURSE', 'ISLR_COURSE', 'ALGO_COURSE', 'AI_COURSE', 'AGENTS_COURSE', 'ML_COURSE', 'LLM_COURSE', 'PROMPT_COURSE', 'DL_COURSE'].map(k => W[k]).filter(Boolean);
assert.ok(courses.length >= 10, 'course data loaded: ' + courses.length);
for (const c of courses) {
  for (const p of Mastery.parts(c)) {
    const its = Mastery.build(c, p.index);
    assert.ok(its.length >= 1, `${c.id} part ${p.index} has questions`);
    assert.ok(its.every(it => p.lessons.some(l => l.id === it.lessonId)), `${c.id} part ${p.index} stays within the part`);
    assert.ok(its.every(it => Number.isInteger(it.q.correct) && it.q.options[it.q.correct] !== undefined), `${c.id}: answer keys valid`);
  }
  assert.ok(Mastery.build(c, 'final').length >= Math.min(Mastery.FINAL_SIZE, c.lessons.length), `${c.id} final check is substantial`);
}
console.log(`PASS confidence calibration and mastery checks (${courses.length} courses, ${courses.reduce((a, c) => a + Mastery.parts(c).length, 0)} parts)`);
