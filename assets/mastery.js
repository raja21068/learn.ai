/* End-of-part mastery checks and a final course check, assembled from each course's own lesson quizzes.
   Mastery learning: learners show they can answer a mixed set of questions from a whole part (default 8, 80% to
   pass) before treating it as mastered; missed questions point back to the lesson that teaches them. Feedback is
   given after the whole check is submitted, as in a real test. Results stay in this browser (localStorage).
   Questions are reused from the lessons, so this measures recall of taught material, not a calibrated exam. */
(function (root, factory) {
  const api = factory(root && root.localStorage);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Mastery = api;
})(typeof window !== 'undefined' ? window : null, function (storage) {
  'use strict';
  const KEY = 'learnai-mastery-v1';
  const PASS = 80, PART_SIZE = 8, FINAL_SIZE = 15;
  let mem = {};
  try { const s = storage && JSON.parse(storage.getItem(KEY) || 'null'); if (s && typeof s === 'object') mem = s; } catch (_) { mem = {}; }
  const persist = () => { try { storage && storage.setItem(KEY, JSON.stringify(mem)); } catch (_) {} };

  /* Parts of a course as [{index, name, lessons}]; a course without parts is one part. */
  function parts(course) {
    if (!course.parts || !course.parts.length) return [{ index: 0, name: 'Whole course', lessons: course.lessons }];
    return course.parts.map((name, index) => ({ index, name, lessons: course.lessons.filter(l => l.part === index) }))
      .filter(p => p.lessons.length);
  }

  function shuffle(a, rand) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* Items for a check. scope: a part index, or 'final' for the whole course. */
  function build(course, scope, rand = Math.random) {
    const final = scope === 'final';
    const lessons = final ? course.lessons : ((parts(course).find(p => p.index === +scope) || { lessons: [] }).lessons);
    const size = final ? FINAL_SIZE : PART_SIZE;
    // Round-robin across lessons so a check covers the whole part rather than a few lessons.
    const queues = shuffle(lessons, rand).map(l => shuffle((l.quiz || []).map((q, qi) => ({ lessonId: l.id, qi, q })), rand)).filter(q => q.length);
    const out = [];
    while (out.length < size && queues.some(q => q.length)) for (const q of queues) { if (q.length && out.length < size) out.push(q.shift()); }
    return out;
  }

  /* answers: chosen option index per item (null when skipped). */
  function grade(items, answers) {
    const results = items.map((it, i) => ({ ...it, pick: answers[i] == null ? null : +answers[i], ok: answers[i] != null && +answers[i] === it.q.correct }));
    const right = results.filter(r => r.ok).length, total = items.length, pct = total ? Math.round(100 * right / total) : 0;
    return { results, right, total, pct, passed: total > 0 && pct >= PASS, missed: results.filter(r => !r.ok) };
  }

  function record(courseId, scope, pct) {
    const k = courseId + '#' + scope, prev = mem[k] || { best: 0, attempts: 0, mastered: false };
    mem[k] = { best: Math.max(prev.best, pct), last: pct, attempts: prev.attempts + 1, mastered: prev.mastered || pct >= PASS, t: Date.now() };
    persist();
    return mem[k];
  }
  const get = (courseId, scope) => mem[courseId + '#' + scope] || null;
  const reset = () => { mem = {}; persist(); };
  return { PASS, PART_SIZE, FINAL_SIZE, parts, build, grade, record, get, reset };
});
