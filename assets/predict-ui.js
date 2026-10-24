/* Predict-then-run: a card shown above an interactive widget. The widget stays locked (inert) until the learner
   commits to a prediction or chooses to skip. The result is stored separately from the learning engine on purpose:
   a wrong prediction is expected and useful, so it must not lower practice status or change review scheduling. */
(() => {
  'use strict';
  const KEY = 'learnai-predict-v1';
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bank = () => window.PREDICT_BANK || {};
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: still works for this view */ } };
  const keyOf = (c, l) => c.id + '/' + l.id;

  function revealHTML(p, choice) {
    const ok = choice === p.correct;
    return `<div class="predict-reveal ${ok ? 'good' : 'warn'}" role="status">
      <b>${ok ? 'Your prediction matched.' : 'Not quite, and that is useful.'}</b>
      <p>You predicted: <em>${esc(p.options[choice])}</em>${ok ? '' : `<br>Observed: <em>${esc(p.options[p.correct])}</em>`}</p>
      <p>${esc(p.reveal)}</p>
      <p class="predict-try"><b>Now run it:</b> ${esc(p.try)}</p></div>`;
  }

  function card(c, l) {
    const p = bank()[keyOf(c, l)];
    if (!p) return '';
    const done = load()[keyOf(c, l)];
    const answered = done && Number.isInteger(done.choice) && done.choice < p.options.length;
    return `<div class="predict-card" data-predict="${esc(keyOf(c, l))}" data-state="${answered ? 'done' : 'open'}">
      <div class="predict-head"><span class="predict-tag">Predict first</span><span class="w-small predict-hint">The interactive stays hidden until you answer, so its readouts cannot give the answer away.</span></div>
      <fieldset class="predict-form"${answered ? ' hidden' : ''}>
        <legend>${esc(p.q)}</legend>
        ${p.options.map((o, i) => `<label class="predict-opt"><input type="radio" name="predict-${esc(l.id)}" value="${i}"> <span>${esc(o)}</span></label>`).join('')}
        <div class="predict-actions"><button type="button" class="primary" data-predict-lock disabled>Lock in my prediction</button>
        <button type="button" class="predict-skip" data-predict-skip>Skip and explore</button></div>
      </fieldset>
      <div class="predict-out">${answered ? revealHTML(p, done.choice) : ''}</div></div>`;
  }

  function setLocked(figure, locked) {
    const w = figure.querySelector('.w');
    if (!w) return;
    w.classList.toggle('predict-locked', locked);
    if (locked) { w.setAttribute('inert', ''); w.setAttribute('aria-hidden', 'true'); } else { w.removeAttribute('inert'); w.removeAttribute('aria-hidden'); }
  }

  /* Called after the page HTML is in the DOM. */
  function init() {
    document.querySelectorAll('.predict-card').forEach(cardEl => {
      const fig = cardEl.closest('figure.widget');
      setLocked(fig, cardEl.dataset.state === 'open');
    });
  }

  document.addEventListener('change', e => {
    const r = e.target.closest('.predict-card input[type=radio]');
    if (r) r.closest('.predict-card').querySelector('[data-predict-lock]').disabled = false;
  });

  document.addEventListener('click', e => {
    const lock = e.target.closest('[data-predict-lock]'), skip = e.target.closest('[data-predict-skip]');
    if (!lock && !skip) return;
    const cardEl = e.target.closest('.predict-card'), fig = cardEl.closest('figure.widget'), key = cardEl.dataset.predict;
    const p = bank()[key];
    if (lock) {
      const picked = cardEl.querySelector('input[type=radio]:checked');
      if (!picked || !p) return;
      const choice = +picked.value, store = load();
      store[key] = { choice, correct: choice === p.correct, at: Date.now() };
      save(store);
      cardEl.querySelector('.predict-out').innerHTML = revealHTML(p, choice);
    }
    cardEl.querySelector('.predict-form').hidden = true;
    cardEl.dataset.state = 'done';
    if (skip) cardEl.hidden = true;                 // skipped: nothing to show, the widget is simply unlocked
    setLocked(fig, false);
    const target = lock ? cardEl.querySelector('.predict-reveal') : fig.querySelector('.w');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  });

  window.PredictUI = { card, init, stats: () => { const s = load(); const v = Object.values(s); return { answered: v.length, correct: v.filter(x => x.correct).length }; } };
})();
