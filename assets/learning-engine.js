/* Phase 1 learning records. Deliberately dependency-free; no user data leaves the browser.
   A practice-status heuristic, NOT a psychometrically calibrated mastery estimate. */
(() => {
  'use strict';
  const KEY = 'learnai-learning-v1';
  const DAY = 86400000;
  const clean = () => ({ version: 1, skills: {}, diagnostics: {} });
  let state = clean();
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (parsed && parsed.version === 1 && parsed.skills && parsed.diagnostics &&
        typeof parsed.skills === 'object' && typeof parsed.diagnostics === 'object') state = parsed;
  } catch (_) { /* Storage is optional, e.g., privacy mode. */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  const id = (courseId, lessonId) => courseId + '/' + lessonId;
  const get = (courseId, lessonId) => state.skills[id(courseId, lessonId)] || null;
  const ensure = (courseId, lessonId) => state.skills[id(courseId, lessonId)] ||= { attempts: {}, hinted: {}, nextReviewAt: null, reviewStreak: 0, totalReviews: 0, lastPracticedAt: null };
  const now = () => Date.now();
  const statuses = { unseen: 'Not started', diagnostic: 'Needs practice', practicing: 'Practicing', scheduled: 'Review scheduled', due: 'Review due', retained: 'Reviewed twice' };
  function hint(courseId, lessonId, taskId, level) {
    const s = ensure(courseId, lessonId);
    s.hinted[taskId] = Math.max(s.hinted[taskId] || 0, level);
    persist();
  }
  function recordAttempt(courseId, lessonId, kind, itemId, correct, details = {}) {
    if (!['quiz', 'lab', 'challenge'].includes(kind)) return;
    const s = ensure(courseId, lessonId);
    const key = kind + ':' + itemId;
    const a = s.attempts[key];
    if (!a) s.attempts[key] = { correct: !!correct, firstCorrect: !!correct, tries: 1, assisted: !!details.assisted, at: now() };
    else if (!a.correct) { a.tries++; if (correct) { a.correct = true; a.assisted = !!details.assisted; } }
    else return; // Re-answering a solved item does not inflate strength.
    s.lastPracticedAt = now();
    if (correct && !s.nextReviewAt) s.nextReviewAt = now() + DAY;
    persist();
  }
  function recordDiagnostic(courseId, answers) {
    // Diagnostic is one attempt per course. Never unlocks lessons or counts as a course completion.
    if (state.diagnostics[courseId]) return false;
    if (!Array.isArray(answers) || !answers.length || answers.some(a => !a.lessonId || typeof a.correct !== 'boolean')) return false;
    state.diagnostics[courseId] = { at: now(), answers: answers.map(a => ({ lessonId: a.lessonId, correct: a.correct })) };
    persist(); return true;
  }
  function review(courseId, lessonId, correct) {
    const s = get(courseId, lessonId);
    if (!s || s.nextReviewAt === null || s.nextReviewAt > now()) return false;
    s.totalReviews++;
    s.reviewStreak = correct ? s.reviewStreak + 1 : 0;
    const days = [3, 7, 14, 30, 60];
    s.nextReviewAt = correct ? now() + days[Math.min(s.reviewStreak - 1, days.length - 1)] * DAY : now() + 10 * 60000;
    s.lastPracticedAt = now(); persist(); return true;
  }
  function info(courseId, lessonId) {
    const s = get(courseId, lessonId), d = state.diagnostics[courseId];
    const diag = d && d.answers.find(a => a.lessonId === lessonId);
    if (!s || !Object.keys(s.attempts).length) return { code: diag && !diag.correct ? 'diagnostic' : 'unseen', label: diag && !diag.correct ? statuses.diagnostic : statuses.unseen, passed: 0, attempts: 0, reviews: 0, due: false };
    const a = Object.values(s.attempts), passed = a.filter(x => x.correct).length;
    const due = s.nextReviewAt !== null && s.nextReviewAt <= now();
    const code = due ? 'due' : s.reviewStreak >= 2 ? 'retained' : s.nextReviewAt ? 'scheduled' : 'practicing';
    return { code, label: statuses[code], passed, attempts: a.length, reviews: s.totalReviews, due,
      nextReviewAt: s.nextReviewAt, assisted: a.filter(x => x.correct && x.assisted).length };
  }
  function due(courses, includeUpcoming = false) {
    const entries = [];
    (courses || []).forEach(c => c.lessons.forEach(l => {
      const s = get(c.id, l.id);
      if (s && s.nextReviewAt !== null && (includeUpcoming || s.nextReviewAt <= now()))
        entries.push({ course: c, lesson: l, nextReviewAt: s.nextReviewAt, due: s.nextReviewAt <= now() });
    }));
    return entries.sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }
  function summary(course) {
    const inf = course.lessons.map(l => info(course.id, l.id));
    return { started: inf.filter(s => s.attempts).length, due: inf.filter(s => s.due).length,
      reviewed: inf.filter(s => s.reviews >= 2).length,
      diagnostic: state.diagnostics[course.id] || null };
  }
  // Optional migration: respect old completion but never pretend a retrospective check was independent.
  function importExisting(courses, progress) {
    let dirty = false;
    (courses || []).forEach(c => c.lessons.forEach(l => {
      const key = id(c.id, l.id);
      if (!progress.done || !progress.done[key] || get(c.id, l.id)) return;
      const s = ensure(c.id, l.id);
      s.attempts['legacy:completion'] = { correct: true, firstCorrect: false, tries: 1, assisted: true, at: now() };
      s.lastPracticedAt = now(); s.nextReviewAt = now() + DAY;
      dirty = true;
    }));
    if (dirty) persist();
  }
  window.LearningEngine = { recordAttempt, hint, recordDiagnostic, review, info, due, summary, importExisting,
    diagnostic: courseId => state.diagnostics[courseId] || null,
    exportData: () => JSON.parse(JSON.stringify(state)),
    __testReset: () => { state = clean(); persist(); } };
})();
