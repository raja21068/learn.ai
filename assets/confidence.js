/* Confidence ratings and calibration for lesson quizzes.
   Before answering, a learner may say how sure they are (sure / unsure / guess). Only the FIRST attempt at each
   question is recorded, so retries after seeing feedback do not inflate the numbers. Confident mistakes are the most
   useful errors to revisit, so they are surfaced explicitly. Data stays in this browser (localStorage).
   This is a self-awareness aid, not a grade. */
(function (root, factory) {
  const api = factory(root && root.localStorage);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Confidence = api;
})(typeof window !== 'undefined' ? window : null, function (storage) {
  'use strict';
  const KEY = 'learnai-confidence-v1';
  const LEVELS = [['sure', 'Sure'], ['unsure', 'Unsure'], ['guess', 'Guessing']];
  let mem = {};
  try { const s = storage && JSON.parse(storage.getItem(KEY) || 'null'); if (s && typeof s === 'object') mem = s; } catch (_) { mem = {}; }
  const persist = () => { try { storage && storage.setItem(KEY, JSON.stringify(mem)); } catch (_) {} };
  const key = (courseId, lessonId, qi) => `${courseId}/${lessonId}#${qi}`;

  /* Record a first attempt. Returns {first, conf, correct, confidentMistake}. Later attempts are not recorded. */
  function record(courseId, lessonId, qi, conf, correct) {
    const k = key(courseId, lessonId, qi);
    if (mem[k]) return { first: false, conf: mem[k].c, correct: mem[k].r, confidentMistake: false };
    const c = LEVELS.some(([v]) => v === conf) ? conf : 'none';
    mem[k] = { c, r: !!correct, t: Date.now() };
    persist();
    return { first: true, conf: c, correct: !!correct, confidentMistake: c === 'sure' && !correct };
  }

  /* Per-level totals for a course (or every course when courseId is omitted). */
  function summary(courseId) {
    const out = {}; LEVELS.forEach(([v]) => { out[v] = { n: 0, right: 0 }; });
    Object.entries(mem).forEach(([k, v]) => {
      if (courseId && !k.startsWith(courseId + '/')) return;
      if (!out[v.c]) return;
      out[v.c].n++; if (v.r) out[v.c].right++;
    });
    return out;
  }

  /* First-attempt questions answered wrongly while "sure": the ones most worth revisiting. */
  function confidentMistakes(courseId) {
    return Object.entries(mem).filter(([k, v]) => v.c === 'sure' && !v.r && (!courseId || k.startsWith(courseId + '/')))
      .map(([k]) => { const [path, qi] = k.split('#'); const [c, l] = path.split('/'); return { courseId: c, lessonId: l, qi: +qi }; });
  }

  /* One plain-language sentence describing calibration, or '' when there is too little data. */
  function message(s) {
    const pct = x => Math.round(100 * x.right / x.n);
    const parts = [];
    if (s.sure.n) parts.push(`when sure you were right ${pct(s.sure)}% of the time (${s.sure.right}/${s.sure.n})`);
    if (s.unsure.n) parts.push(`when unsure, ${pct(s.unsure)}% (${s.unsure.right}/${s.unsure.n})`);
    if (s.guess.n) parts.push(`when guessing, ${pct(s.guess)}% (${s.guess.right}/${s.guess.n})`);
    if (!parts.length) return '';
    let tip = '';
    if (s.sure.n >= 3 && pct(s.sure) < 75) tip = ' You may be more confident than your answers support: slow down on questions that feel obvious.';
    else if (s.unsure.n + s.guess.n >= 3 && (s.unsure.right + s.guess.right) / (s.unsure.n + s.guess.n) >= 0.8) tip = ' You know more than you think: trust your reasoning a little more.';
    return 'On first attempts, ' + parts.join('; ') + '.' + tip;
  }

  const reset = () => { mem = {}; persist(); };
  return { LEVELS, record, summary, confidentMistakes, message, reset, _key: key };
});
