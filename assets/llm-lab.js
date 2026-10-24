/* LLM Service Lab: a deterministic experiment for the LLM Engineering course.
   A fixed queue of 40 requests (FAQs with repeats, summaries, reasoning questions, code and a few very hard ones) is served
   by a model choice, a quantization level, an optional response cache and an optional small-then-large cascade.
   Every request has a difficulty; a model answers correctly exactly when its effective skill (reduced by quantization)
   reaches that difficulty. Latency and cost follow simple per-token formulas. Nothing is random, so the same settings always
   give the same numbers and the lesson's claims are testable (tests/llm-lab.test.cjs). It is a model for building
   intuition about trade-offs, not a benchmark of real models, prices or latencies. */
(() => {
  'use strict';
  const MODELS = {
    small:  { label: 'Small (7B)',    skill: 1.5, base: 40,  perOut: 2, perIn: 0.05, price: 0.0002 },
    medium: { label: 'Medium (30B)',  skill: 2.5, base: 80,  perOut: 4, perIn: 0.1,  price: 0.001 },
    large:  { label: 'Large (70B+)',  skill: 3.5, base: 150, perOut: 9, perIn: 0.2,  price: 0.006 }
  };
  const QUANT = { fp16: { label: 'fp16 (full precision)', penalty: 0, speed: 1, cost: 1 }, int8: { label: 'int8', penalty: 0.1, speed: 0.75, cost: 0.7 }, int4: { label: 'int4', penalty: 0.5, speed: 0.55, cost: 0.5 } };

  // [kind, difficulty, tokens in, tokens out, repeat of request id, overconfident-small flag]
  const SPEC = [
    ['faq', 1, 40, 60], ['faq', 1, 35, 50], ['summarize', 1.5, 900, 120], ['reason', 2, 120, 200], ['faq', 1, 45, 70], ['code', 2.5, 150, 260],
    ['faq', 1, 40, 60, 1], ['summarize', 1.5, 800, 110], ['reason', 2.5, 140, 240], ['faq', 1, 38, 55], ['faq', 1, 35, 50, 2], ['reason', 2, 110, 180, 0, true],
    ['summarize', 1.5, 1000, 130], ['faq', 1, 42, 65], ['code', 3, 200, 320], ['faq', 1, 40, 60, 1], ['reason', 2, 130, 210], ['faq', 1, 45, 70, 5], ['summarize', 1.5, 950, 125, 8],
    ['code', 2.5, 170, 280], ['faq', 1, 36, 52], ['reason', 2.5, 150, 250], ['faq', 1, 35, 50, 2], ['summarize', 1.5, 850, 115], ['reason', 2, 120, 190, 0, true],
    ['faq', 1, 44, 68], ['code', 2, 160, 270], ['faq', 1, 42, 65, 14], ['reason', 3, 180, 300], ['faq', 1, 39, 58], ['summarize', 1.5, 920, 120, 3], ['faq', 1, 40, 60, 1],
    ['reason', 2, 125, 200, 0, true], ['code', 2.5, 175, 285], ['faq', 1, 36, 52, 21], ['summarize', 1.5, 880, 118], ['faq', 1, 41, 62], ['reason', 2.5, 145, 245, 22], ['faq', 1, 35, 50, 2], ['code', 3, 210, 330]
  ];
  const REQUESTS = SPEC.map(([kind, difficulty, tin, tout, repeat, trap], i) => ({ id: i + 1, kind, difficulty, tin, tout, repeatOf: repeat || null, trap: !!trap }));
  REQUESTS.forEach(r => { if (r.repeatOf) { const o = REQUESTS[r.repeatOf - 1]; if (o && !o.repeatOf) { r.kind = o.kind; r.difficulty = o.difficulty; r.tin = o.tin; r.tout = o.tout; r.trap = o.trap; } } });

  const DEFAULT = { model: 'small', quant: 'fp16', cache: false, cascade: false };
  const eff = (m, q) => MODELS[m].skill - QUANT[q].penalty;
  const price = (m, q, r) => MODELS[m].price * QUANT[q].cost * (r.tin + r.tout) / 1000;
  const lat = (m, q, r) => Math.round((MODELS[m].base + MODELS[m].perOut * r.tout + MODELS[m].perIn * r.tin) * QUANT[q].speed);

  function serve(r, p, done) {
    if (p.cache && r.repeatOf && done[r.repeatOf]) { const o = done[r.repeatOf]; return { id: r.id, path: 'cache', correct: o.correct, ms: 5, cost: 0, note: 'served from the cache (same answer as request #' + r.repeatOf + ')' }; }
    const m = p.cascade ? 'small' : p.model, e = eff(m, p.quant);
    if (!p.cascade) { const ok = e >= r.difficulty; return { id: r.id, path: m, correct: ok, ms: lat(m, p.quant, r), cost: price(m, p.quant, r), note: (ok ? 'answered correctly' : 'too hard for this model, answered wrongly') + ' by ' + MODELS[m].label }; }
    const confident = e - r.difficulty >= 0.3 || (r.trap && e < r.difficulty);       // overconfident wrong answers exist
    const ms = lat('small', p.quant, r), c = price('small', p.quant, r);
    if (confident) { const ok = e >= r.difficulty && !r.trap; return { id: r.id, path: 'small', correct: ok, ms, cost: c, note: ok ? 'small model was confident and right' : 'small model was confident but WRONG: the cascade could not tell' }; }
    const ok = eff('large', p.quant) >= r.difficulty;
    return { id: r.id, path: 'small→large', correct: ok, ms: ms + lat('large', p.quant, r), cost: c + price('large', p.quant, r), note: 'small model was unsure, escalated to the large model' };
  }

  function run(policy) {
    const p = Object.assign({}, DEFAULT, policy), done = {}, results = [];
    REQUESTS.forEach(r => { const x = serve(r, p, done); done[r.id] = x; results.push(x); });
    const sorted = results.map(x => x.ms).sort((a, b) => a - b);
    const m = {
      quality: Math.round(results.filter(x => x.correct).length / results.length * 1000) / 10,
      cost: Math.round(results.reduce((a, x) => a + x.cost, 0) * 10000) / 10000,
      p95: sorted[Math.ceil(0.95 * sorted.length) - 1],
      hits: results.filter(x => x.path === 'cache').length,
      escalations: results.filter(x => x.path === 'small→large').length,
      wrong: results.filter(x => !x.correct).length
    };
    return { policy: p, results, metrics: m };
  }
  const GOAL = { text: 'quality of at least 85%, p95 latency of at most 1,500 ms and a total cost of at most $0.05', test: m => m.quality >= 85 && m.p95 <= 1500 && m.cost <= 0.05 };
  // The cheapest-and-fastest set of policies: nothing else is at least as good on all of cost, latency and quality, and better on one.
  function pareto(points) {
    return points.filter(a => !points.some(b => b !== a && b.cost <= a.cost && b.p95 <= a.p95 && b.quality >= a.quality && (b.cost < a.cost || b.p95 < a.p95 || b.quality > a.quality)));
  }

  window.LLMLab = { MODELS, QUANT, REQUESTS, DEFAULT, run, pareto, GOAL };

  /* ---------------- widget ---------------- */
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  T.llmlab = 'Experiment: the cost, quality and latency triangle';
  W.llmlab = el => {
    const p = Object.assign({}, DEFAULT);
    let last = null, log = [], pick = null;
    const name = q => (q.cascade ? 'Cascade small→large' : MODELS[q.model].label) + ', ' + q.quant + (q.cache ? ', cache' : '');
    const draw = () => {
      const m = last && last.metrics;
      el.innerHTML = `<div class="ar-controls">
        <label class="w-field inline">model <select data-s="model" ${p.cascade ? 'disabled' : ''}>${Object.entries(MODELS).map(([k, v]) => `<option value="${k}" ${p.model === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="w-field inline">precision <select data-s="quant">${Object.entries(QUANT).map(([k, v]) => `<option value="${k}" ${p.quant === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="w-chip ${p.cache ? 'on' : ''}" title="Repeated questions are answered from a stored copy"><input type="checkbox" data-k="cache" ${p.cache ? 'checked' : ''}> Response cache</label>
        <label class="w-chip ${p.cascade ? 'on' : ''}" title="Try the small model first; escalate to the large model when it is unsure"><input type="checkbox" data-k="cascade" ${p.cascade ? 'checked' : ''}> Cascade small → large</label>
        <div class="w-nav"><button type="button" class="primary" data-run>▶ Serve the 40 requests</button><button type="button" data-clear ${log.length ? '' : 'disabled'}>Clear log</button></div></div>
      ${m ? `<div class="ag-stats ar-stats"><div class="${m.quality >= 85 ? 'good' : 'bad'}"><b>${m.quality.toFixed(1)}%</b><small>correct answers</small></div><div><b>${m.p95} ms</b><small>p95 latency</small></div>
        <div><b>$${m.cost.toFixed(4)}</b><small>total cost</small></div><div><b>${m.hits}</b><small>cache hits</small></div><div><b>${m.escalations}</b><small>escalated to large</small></div></div>
        <div class="ar-dots" role="list" aria-label="Outcome of each request">${last.results.map(r => `<button type="button" role="listitem" class="ar-dot ${r.correct ? (r.path === 'cache' ? 'degraded' : 'ok') : 'harm'} ${pick === r.id ? 'sel' : ''}" data-t="${r.id}" title="${esc('#' + r.id + ' ' + REQUESTS[r.id - 1].kind + ' (difficulty ' + REQUESTS[r.id - 1].difficulty + ')')}" aria-label="${esc('Request ' + r.id + ': ' + (r.correct ? 'correct' : 'wrong'))}">${r.id}</button>`).join('')}</div>
        <div class="ar-detail" aria-live="polite">${pick ? (r => { const q = REQUESTS[r.id - 1]; return `<b>#${r.id} · ${esc(q.kind)}, difficulty ${q.difficulty}</b> · ${q.tin} tokens in, ${q.tout} out<br>${r.correct ? 'Correct' : 'Wrong'} · ${r.ms} ms · $${r.cost.toFixed(5)}<br><span class="w-small">${esc(r.note)}</span>`; })(last.results[pick - 1]) : '<span class="w-small">Green = correct, amber = correct from the cache, red = wrong. Click a number to see what happened to that request.</span>'}</div>
        <p class="w-status ${GOAL.test(m) ? 'good' : 'warn'}">${GOAL.test(m) ? '✓ Goal met: ' : 'Goal not met yet: '}${esc(GOAL.text)}.</p>` : '<p class="w-small">Pick a model, a precision and optional cache or cascade, then serve the queue. Each run is added to the experiment log so you can compare settings. Nothing is random: the same settings always give the same result.</p>'}
      ${log.length ? `<div class="w-tablewrap"><table class="w-table ar-log"><thead><tr><th>#</th><th>Settings</th><th>Correct</th><th>p95 ms</th><th>Cost</th></tr></thead><tbody>${log.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(name(r.policy))}</td><td class="${r.metrics.quality < 85 ? 'no' : ''}">${r.metrics.quality.toFixed(1)}%</td><td>${r.metrics.p95}</td><td>$${r.metrics.cost.toFixed(4)}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
    };
    const focusBack = sel => { const n = el.querySelector(sel); if (n) n.focus(); };
    el.addEventListener('change', e => {
      const s = e.target.closest('[data-s]'), k = e.target.closest('[data-k]');
      if (s) { p[s.dataset.s] = s.value; draw(); focusBack(`[data-s="${s.dataset.s}"]`); } else if (k) { p[k.dataset.k] = k.checked; draw(); focusBack(`[data-k="${k.dataset.k}"]`); }
    });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-run]')) { last = run(p); log.push(last); log = log.slice(-8); pick = null; draw(); focusBack('[data-run]'); return; }
      if (e.target.closest('[data-clear]')) { log = []; last = null; pick = null; draw(); return; }
      const t = e.target.closest('[data-t]'); if (t) { pick = +t.dataset.t; draw(); focusBack(`[data-t="${pick}"]`); }
    });
    draw();
  };
})();
