/* Phase 1 views and alternative practice activities, all rendered on the existing static site. */
(() => {
  'use strict';
  const E = window.LearningEngine, BANK = window.LEARNING_CHALLENGES;
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (c, l) => '#/course/' + c.id + '/' + l.id;
  const stamp = ms => new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const details = x => `<span class="learn-status ${x.code}">${esc(x.label)}</span>`;
  const state = {};
  const courseQuestions = c => c.lessons.filter(l => l.quiz && l.quiz.length).slice(0, 6);
  // One or two questions per course part (so results say WHICH PART to start from), or the first six lessons for flat courses.
  function placementItems(c) {
    const hasQuiz = l => l.quiz && l.quiz.length;
    if (!c.parts) return c.lessons.filter(hasQuiz).slice(0, 6).map(l => ({ l, qi: 0 }));
    const items = [];
    c.parts.forEach((_, p) => {
      const ls = c.lessons.filter(l => l.part === p && hasQuiz(l)); if (!ls.length) return;
      items.push({ l: ls[0], qi: 0 });
      const last = ls[ls.length - 1];
      if (ls.length >= 3) items.push({ l: last, qi: last.quiz.length > 1 ? 1 : 0 });
    });
    return items;
  }
  function partResults(c, answers) {
    const groups = {};
    answers.forEach(a => { const l = c.lessons.find(x => x.id === a.lessonId); (groups[l ? (l.part || 0) : 0] ||= []).push({ a, l }); });
    return Object.keys(groups).map(Number).sort((x, y) => x - y).map(p => ({ part: p, name: c.parts ? c.parts[p] : 'Questions', items: groups[p], right: groups[p].filter(x => x.a.correct).length }));
  }
  function diagnosticPage(app, c) {
    const items = placementItems(c), saved = E.diagnostic(c.id);
    document.title = 'Placement check · ' + c.title;
    const headline = `<div class="learn-head"><a href="#/course/${esc(c.id)}">← ${esc(c.short || c.title)}</a><h1>Course placement check</h1><p>${c.parts ? 'One or two short questions from each part of the course (' + items.length + ' in total).' : 'Answer ' + items.length + ' short questions before beginning.'} This check suggests where to start and what to revisit; it does not skip lessons or certify competence.</p></div>`;
    if (saved) {
      const n = saved.answers.filter(a => a.correct).length, parts = partResults(c, saved.answers), weak = parts.filter(r => r.right < r.items.length);
      const firstMiss = weak.length ? weak[0].items.find(x => !x.a.correct) : null, start = (firstMiss && firstMiss.l) || c.lessons[0];
      app.innerHTML = `<div class="container learn-page">${headline}<section class="learn-panel"><span class="kicker">Your baseline</span><h2>${n} / ${saved.answers.length} correct</h2><p>This result is a single low-stakes baseline, not a reliable mastery score.</p>
        <div class="learn-part-results">${parts.map(r => `<div class="learn-part-result ${r.right === r.items.length ? 'ok' : 'gap'}"><b>${c.parts ? 'Part ' + (r.part + 1) + ' · ' : ''}${esc(r.name)}</b><span class="rm-dots">${r.items.map(x => `<i class="${x.a.correct ? 'scheduled' : 'due'}"></i>`).join('')}</span><small>${r.right}/${r.items.length} correct</small></div>`).join('')}</div>
        <p class="learn-recommend">${weak.length ? `<b>Suggested starting point:</b> ${c.parts ? 'Part ' + (weak[0].part + 1) + ' · ' : ''}<a href="${link(c, start)}">${esc(start.title)}</a>. ${weak.length > 1 ? 'Then revisit: ' + weak.slice(1).map(r => 'Part ' + (r.part + 1)).join(', ') + '.' : ''}` : '<b>No gaps found</b> in this short check. Skim the parts you know and try the labs; deeper gaps may still exist.'}</p>
        <div class="learn-actions"><a class="btn primary" href="${link(c, start)}">Open suggested lesson →</a> <a class="btn" href="#/course/${esc(c.id)}">Course overview</a></div></section></div>`;
      return;
    }
    app.innerHTML = `<div class="container learn-page">${headline}<section class="learn-panel"><p class="learn-muted">No timer and no grades. Choose an answer for every item before submitting. Your answers are saved locally on this device.</p>
      ${items.map(({ l, qi }, i) => { const q = l.quiz[qi]; return `<fieldset class="learn-diag-q"><legend><b>${i + 1}. ${c.parts ? 'Part ' + ((l.part || 0) + 1) + ' · ' : ''}${esc(l.title)}</b><span>${esc(q.q)}</span></legend>${q.options.map((opt, j) => `<label><input type="radio" name="diag-${i}" value="${j}"/> <span>${esc(opt)}</span></label>`).join('')}</fieldset>`; }).join('')}
      <p id="diag-error" role="status" class="learn-error" hidden></p><button type="button" class="btn primary" id="submit-diagnostic">Submit placement check</button></section></div>`;
    app.onclick = e => {
      if (!e.target.closest('#submit-diagnostic')) return;
      const answers = items.map(({ l, qi }, i) => {
        const picked = app.querySelector(`input[name="diag-${i}"]:checked`);
        return picked ? { lessonId: l.id, correct: +picked.value === l.quiz[qi].correct } : null;
      });
      if (answers.some(x => !x)) { const err = app.querySelector('#diag-error'); err.hidden = false; err.textContent = 'Answer all questions before submitting.'; return; }
      E.recordDiagnostic(c.id, answers);
      diagnosticPage(app, c);
    };
  }
  function dashboardPage(app, courses, doneCount) {
    document.title = 'My learning · learn/ai';
    const scheduled = E.due(courses, true), due = scheduled.filter(x => x.due);
    app.innerHTML = `<div class="container learn-page"><div class="learn-head"><span class="kicker">Learning progress</span><h1>My learning</h1><p>Track what you completed, what you practiced, and when to revisit it. Progress is stored only in this browser, not synced between devices.</p></div>
      <div class="learn-metrics"><div><b>${courses.reduce((a, c) => a + doneCount(c), 0)}</b><span>Lessons completed</span></div><div><b>${due.length}</b><span>Reviews due</span></div><div><b>${scheduled.length - due.length}</b><span>Reviews scheduled</span></div></div>
      <div class="learn-actions"><a class="btn primary" href="#/review">Review due skills →</a><span class="learn-muted">Practice labels reflect completed attempts, not a validated competence score.</span></div>
      <h2>Your courses</h2><div class="learn-course-grid">${courses.map(c => { const sm = E.summary(c); return `<article class="learn-panel"><div class="learn-course-top"><b>${esc(c.short || c.title)}</b><span>${doneCount(c)}/${c.lessons.length} complete</span></div><p>${sm.started} topics practiced · ${sm.due} reviews due · ${sm.reviewed} reviewed twice</p><div class="learn-actions"><a class="btn sm" href="#/diagnostic/${esc(c.id)}">${sm.diagnostic ? 'View baseline' : 'Placement check'}</a><a class="btn sm" href="#/course/${esc(c.id)}">Course →</a></div><details class="learn-skill-details"><summary>Topic practice status</summary><ul>${c.lessons.map(l => `<li><a href="${link(c, l)}">${esc(l.title)}</a>${details(E.info(c.id, l.id))}</li>`).join('')}</ul></details></article>`; }).join('')}</div>
      <h2>Next reviews</h2>${scheduled.length ? `<div class="learn-panel learn-review-list">${scheduled.slice(0, 12).map(x => `<a href="${x.due ? '#/review/' + x.course.id + '/' + x.lesson.id : link(x.course, x.lesson)}"><b>${esc(x.lesson.title)}</b><span>${esc(x.course.short || x.course.title)} · ${x.due ? 'Due now' : stamp(x.nextReviewAt)}</span></a>`).join('')}</div>` : '<div class="learn-panel">No scheduled reviews yet. Complete a quiz, optional challenge, or graded lab to schedule your first review for tomorrow.</div>'}
      </div>`;
  }
  function reviewPage(app, courses, parts) {
    document.title = 'Spaced review · learn/ai';
    const all = E.due(courses, true), due = all.filter(x => x.due);
    if (!parts[1]) {
      app.innerHTML = `<div class="container learn-page"><div class="learn-head"><a href="#/my-learning">← My learning</a><h1>Spaced review</h1><p>Retrieve earlier concepts without opening the lesson first. A correct answer schedules the next review later; an incorrect answer recommends restudy and reschedules practice.</p></div><div class="learn-panel"><h2>${due.length ? due.length + ' skills due now' : 'All caught up'}</h2>${due.length ? due.map(x => `<a class="learn-review-row" href="#/review/${esc(x.course.id)}/${esc(x.lesson.id)}"><b>${esc(x.lesson.title)}</b><small>${esc(x.course.short || x.course.title)}</small><span>Review →</span></a>`).join('') : '<p>There are no due reviews. Review dates are based on a simple 1–3–7–14–30-day schedule, not an optimized memory model.</p>'}</div><p class="learn-muted">${all.length - due.length} other reviews scheduled. <a href="#/my-learning">View schedule</a></p></div>`;
      return;
    }
    const c = courses.find(x => x.id === parts[1]), l = c && c.lessons.find(x => x.id === parts[2]);
    if (!c || !l) { app.innerHTML = '<div class="container learn-page"><h1>Review not found</h1><a href="#/review">Return to reviews</a></div>'; return; }
    const record = E.info(c.id, l.id);
    const rv = BANK.reviews[c.id + '/' + l.id], q = Array.isArray(rv) ? rv[record.reviews % rv.length] : (rv || (l.quiz && l.quiz[0]));
    if (!record.due || !q) {
      app.innerHTML = `<div class="container learn-page"><div class="learn-panel"><h1>This topic is not due</h1><p>Next review: ${record.nextReviewAt ? stamp(record.nextReviewAt) : 'not scheduled'}.</p><a class="btn" href="${link(c, l)}">Open lesson</a> <a class="btn primary" href="#/review">Other reviews</a></div></div>`; return;
    }
    app.innerHTML = `<div class="container learn-page"><div class="learn-head"><a href="#/review">← Review queue</a><h1>Recall: ${esc(l.title)}</h1><p>Choose without checking the lesson. This is a formative review, not an independent examination.${rv ? (q.derived ? ' This question is generated from the key terms of this lesson.' : ' This question uses alternative wording for recall.') : ' This course currently reuses a lesson quiz item; broader transfer questions remain to be authored.'}</p></div><section class="learn-panel"><h2>${esc(q.prompt || q.q)}</h2><div class="learn-review-options">${q.options.map((opt, i) => `<button type="button" data-review-option="${i}">${esc(opt)}</button>`).join('')}</div><div id="review-feedback" role="status" aria-live="polite"></div></section></div>`;
    app.onclick = e => {
      const b = e.target.closest('[data-review-option]'); if (!b || app.querySelector('[data-review-result]')) return;
      const success = +b.dataset.reviewOption === q.correct;
      if (!E.review(c.id, l.id, success)) return;
      app.querySelectorAll('[data-review-option]').forEach(x => { x.disabled = true; if (+x.dataset.reviewOption === q.correct) x.classList.add('correct'); });
      if (!success) b.classList.add('incorrect');
      app.querySelector('#review-feedback').innerHTML = `<div class="learn-feedback" data-review-result="true"><b>${success ? 'Correct.' : 'Not yet.'}</b> ${esc(q.why || '')}<p>${success ? 'Review scheduled with a longer interval.' : 'Review this lesson and try again in at least ten minutes.'}</p><a class="btn" href="${link(c, l)}">Study this lesson</a> <a class="btn primary" href="#/review">Continue reviews →</a></div>`;
    };
  }
  const normText = x => String(x).toLowerCase().replace(/[-_\/]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const kindLabel = e => (e.type === 'order' ? 'sequence' : e.type === 'multi' ? 'select all' : 'short answer') + (e.derived ? ' · generated from lesson terms' : '');
  const entriesFor = (c, l) => BANK.activities[c.id + '/' + l.id] || [];
  const stateKey = (c, l, e) => c.id + '/' + l.id + '/' + e.id;
  function entryHTML(c, l, entry, n) {
    const key = stateKey(c, l, entry), uid = 'challenge-text-' + n;
    if (!state[key]) state[key] = entry.initial ? entry.initial.slice() : entry.items ? entry.items.map((_, i) => i) : [];
    const opts = entry.type === 'order' ? `<ol class="learn-order challenge-order">${orderItems(entry, state[key])}</ol>` :
      entry.type === 'multi' ? `<div class="learn-choice-list">${entry.options.map((x, i) => `<label><input type="checkbox" value="${i}" data-challenge-select><span>${esc(x)}</span></label>`).join('')}</div>` :
      `<label class="learn-text-label" for="${uid}">Your short answer</label><input type="text" id="${uid}" class="challenge-text" autocomplete="off" spellcheck="false" placeholder="Type one term"/>`;
    return `<section class="learn-challenge" data-challenge-entry="${n}"><span class="kicker">Active practice · ${kindLabel(entry)}</span><p>${esc(entry.prompt)}</p>${opts}<button type="button" class="btn primary sm" data-challenge-check>Check challenge</button><p role="status" class="learn-feedback-text challenge-feedback"></p></section>`;
  }
  function activityHTML(c, l) {
    const entries = entriesFor(c, l);
    if (!entries.length) return '';
    return `<div class="learn-challenges" id="practice-challenge"><h2>Try different kinds of challenge</h2>${entries.map((e, n) => entryHTML(c, l, e, n)).join('')}</div>`;
  }
  function orderItems(entry, order) {
    return order.map((index, pos) => `<li><span>${esc(entry.items[index])}</span><div class="learn-reorder"><button type="button" data-challenge-move="${pos}" data-direction="up" aria-label="Move ${esc(entry.items[index])} up" ${pos === 0 ? 'disabled' : ''}>↑</button><button type="button" data-challenge-move="${pos}" data-direction="down" aria-label="Move ${esc(entry.items[index])} down" ${pos === order.length - 1 ? 'disabled' : ''}>↓</button></div></li>`).join('');
  }
  function handleChallenge(e, current) {
    if (!current) return false;
    const area = e.target.closest('[data-challenge-entry]'); if (!area) return false;
    const c = current.c, l = current.l, entry = entriesFor(c, l)[+area.dataset.challengeEntry]; if (!entry) return false;
    const order = state[stateKey(c, l, entry)];
    const move = e.target.closest('[data-challenge-move]');
    if (move) {
      const a = +move.dataset.challengeMove, b = a + (move.dataset.direction === 'up' ? -1 : 1);
      if (b >= 0 && b < order.length) { [order[a], order[b]] = [order[b], order[a]]; area.querySelector('.challenge-order').innerHTML = orderItems(entry, order); }
      return true;
    }
    if (!e.target.closest('[data-challenge-check]')) return false;
    let correct = false;
    if (entry.type === 'order') correct = order.every((x, i) => x === i);
    else if (entry.type === 'multi') {
      const selected = [...area.querySelectorAll('[data-challenge-select]:checked')].map(x => +x.value).sort((a, b) => a - b);
      correct = JSON.stringify(selected) === JSON.stringify(entry.correct.slice().sort((a, b) => a - b));
    } else {
      const v = normText(area.querySelector('.challenge-text')?.value || '');
      correct = !!v && entry.answers.some(x => normText(x) === v);
    }
    E.recordAttempt(c.id, l.id, 'challenge', entry.id, correct);
    const f = area.querySelector('.challenge-feedback'); f.className = 'learn-feedback-text challenge-feedback ' + (correct ? 'success' : 'error');
    f.textContent = correct ? '✓ Correct. ' + entry.why : 'Not yet. Adjust your answer and try again.';
    if (correct) area.querySelector('[data-challenge-check]').disabled = true;
    return true;
  }
  window.LearningUI = { diagnosticPage, dashboardPage, reviewPage, activityHTML, handleChallenge, placementItems };
})();
