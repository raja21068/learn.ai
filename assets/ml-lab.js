/* ML Lab: a deterministic generalisation experiment for the Machine Learning course.
   A noisy sine curve is fitted with polynomials. The learner changes model complexity (degree), the amount of training
   data, ridge regularisation, and whether a leaked feature (a noisy copy of the label that will NOT exist in
   deployment) is included. Training, validation and "deployment" errors are reported separately, and a sweep over all
   degrees shows the classic curves. No randomness at run time: the same settings always give the same numbers, so the
   claims in the lesson are testable (tests/ml-lab.test.cjs). It is a model for building intuition, not a benchmark. */
(() => {
  'use strict';
  const SIGMA = 0.3, NOISE_FLOOR = SIGMA;                       // the best any model can do on noisy data is an RMSE of about 0.3
  const f = x => Math.sin(2 * Math.PI * x);
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = r => () => { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  function stream(seed, n, evenly) {
    const r = rng(seed), g = gauss(rng(seed + 7)), out = [];
    for (let i = 0; i < n; i++) { const x = evenly ? (i + 0.5) / n : r(); out.push({ x, y: f(x) + SIGMA * g(), leak: 0 }); }
    out.forEach(p => { p.leak = p.y + 0.05 * g(); });             // the leaked feature is the label plus a hint of noise
    return out;
  }
  const TRAIN = stream(11, 60), VAL = stream(23, 60), TEST = stream(37, 200, true);

  const legendre = (k, z) => { let a = 1, b = z; if (k === 0) return 1; for (let i = 2; i <= k; i++) { const c = ((2 * i - 1) * z * b - (i - 1) * a) / i; a = b; b = c; } return b; };
  const row = (p, d, leak, deployed) => { const z = 2 * p.x - 1, r = []; for (let k = 0; k <= d; k++) r.push(legendre(k, z)); if (leak) r.push(deployed ? 0 : p.leak); return r; };

  function solve(A, b) {                                         // Gaussian elimination with partial pivoting
    const n = b.length, M = A.map((r, i) => r.concat(b[i]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = c + 1; r < n; r++) { const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
    return x;
  }
  function fit(data, d, lambda, leak) {
    const X = data.map(p => row(p, d, leak, false)), m = X[0].length;
    const A = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => X.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? lambda : 0)));
    const b = Array.from({ length: m }, (_, i) => X.reduce((s, r, k) => s + r[i] * data[k].y, 0));
    return solve(A, b);
  }
  const predict = (w, p, d, leak, deployed) => row(p, d, leak, deployed).reduce((s, v, i) => s + v * w[i], 0);
  const rmse = (w, data, d, leak, deployed) => Math.sqrt(data.reduce((s, p) => s + (predict(w, p, d, leak, deployed) - p.y) ** 2, 0) / data.length);
  const r3 = x => Math.round(x * 1000) / 1000;
  const fmt = v => v >= 100 ? v.toExponential(1) : v.toFixed(2);

  function run(opts) {
    const o = Object.assign({ n: 20, degree: 3, lambda: 0, leak: false }, opts);
    const train = TRAIN.slice(0, o.n), w = fit(train, o.degree, o.lambda, o.leak);
    const m = {
      train: r3(rmse(w, train, o.degree, o.leak, false)),
      val: r3(rmse(w, VAL, o.degree, o.leak, false)),                       // validation data carries the leaked column too, as it would in a careless pipeline
      deploy: r3(rmse(w, TEST, o.degree, o.leak, true))                      // in deployment the leaked column does not exist
    };
    m.gap = r3(m.val - m.train);
    const curve = Array.from({ length: 101 }, (_, i) => { const p = { x: i / 100, y: 0, leak: 0 }; return [p.x, predict(w, p, o.degree, o.leak, true)]; });
    return { opts: o, metrics: m, curve, train };
  }
  function sweep(opts) { return Array.from({ length: 12 }, (_, i) => Object.assign({ degree: i + 1 }, run(Object.assign({}, opts, { degree: i + 1 })).metrics)); }
  const GOAL = { text: 'a model that will really work in deployment: deployment RMSE of at most 0.36, with no leaked feature', test: m => m.deploy <= 0.36 };

  window.MLLab = { run, sweep, GOAL, f, SIGMA, NOISE_FLOOR, TRAIN, VAL, TEST };

  /* ---------------- widget ---------------- */
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  T.mllab = 'Experiment: why does a model that looks great fail in deployment?';
  W.mllab = el => {
    const p = { n: 20, degree: 3, lambda: 0, leak: false };
    let log = [], last = null, showSweep = false;
    const LAMBDAS = [0, 0.001, 0.01, 0.1, 1];
    const draw = () => {
      const r = last, m = r && r.metrics;
      const X = x => 20 + x * 560, Y = y => 110 - y * 55;
      el.innerHTML = `<div class="ar-controls">
        <label class="w-field inline">training examples <input type="range" min="8" max="60" value="${p.n}" data-n="n"> <b>${p.n}</b></label>
        <label class="w-field inline">polynomial degree <input type="range" min="1" max="12" value="${p.degree}" data-n="degree"> <b>${p.degree}</b></label>
        <label class="w-field inline">ridge strength <input type="range" min="0" max="4" value="${LAMBDAS.indexOf(p.lambda)}" data-n="lambdaIdx"> <b>${p.lambda}</b></label>
        <label class="w-chip ${p.leak ? 'on' : ''}" title="Adds a column that is computed from the label. It will not exist when the model is used for real."><input type="checkbox" data-leak ${p.leak ? 'checked' : ''}> Include a leaked feature</label>
        <div class="w-nav"><button type="button" class="primary" data-run>▶ Train and evaluate</button><button type="button" data-sweep>Sweep degrees 1-12</button><button type="button" data-clear ${log.length ? '' : 'disabled'}>Clear log</button></div></div>
      ${m ? `<svg viewBox="0 0 600 220" class="w-svg" role="img" aria-label="Fitted curve against the true curve and the training points">
          <rect width="600" height="220" rx="10" fill="var(--bg-soft)"/>
          <polyline fill="none" stroke="var(--line-strong)" stroke-width="2" stroke-dasharray="5 4" points="${Array.from({ length: 101 }, (_, i) => X(i / 100) + ',' + Y(f(i / 100))).join(' ')}"/>
          <polyline fill="none" stroke="var(--accent)" stroke-width="3" points="${r.curve.map(([x, y]) => X(x) + ',' + Y(Math.max(-1.9, Math.min(1.9, y)))).join(' ')}"/>
          ${r.train.map(q => `<circle cx="${X(q.x)}" cy="${Y(q.y)}" r="3.5" fill="var(--muted)"/>`).join('')}</svg>
        <div class="ag-stats ar-stats"><div><b>${fmt(m.train)}</b><small>training RMSE</small></div><div><b>${fmt(m.val)}</b><small>validation RMSE</small></div>
          <div class="${m.deploy > 0.6 ? 'bad' : m.deploy <= 0.36 ? 'good' : ''}"><b>${fmt(m.deploy)}</b><small>deployment RMSE</small></div><div><b>${fmt(m.gap)}</b><small>validation minus training</small></div></div>
        <p class="w-status ${GOAL.test(m) && !p.leak ? 'good' : 'warn'}">${GOAL.test(m) && !p.leak ? '✓ Goal met: ' : 'Goal not met yet: '}${esc(GOAL.text)}. The best any model can do on this noisy data is about ${NOISE_FLOOR.toFixed(2)}.</p>`
        : '<p class="w-small">Dashed line = the true curve, blue = your fitted model, dots = the training data. Train a model, then change one setting at a time. Nothing is random: the same settings always give the same result.</p>'}
      ${showSweep ? (() => { const s = sweep(p), bv = s.reduce((a, b) => b.val < a.val ? b : a), bt = s.reduce((a, b) => b.deploy < a.deploy ? b : a); return `<div class="w-tablewrap"><table class="w-table ar-log"><caption>Every degree with ${p.n} examples, ridge ${p.lambda}${p.leak ? ', leaked feature ON' : ''}</caption><thead><tr><th>Degree</th><th>Train</th><th>Validation</th><th>Deployment</th></tr></thead><tbody>${s.map(x => `<tr class="${x.degree === bv.degree ? 'ok' : ''}"><td>${x.degree}${x.degree === bv.degree ? ' (best on validation)' : ''}${x.degree === bt.degree ? ' (best in deployment)' : ''}</td><td>${fmt(x.train)}</td><td>${fmt(x.val)}</td><td>${fmt(x.deploy)}</td></tr>`).join('')}</tbody></table></div>`; })() : ''}
      ${log.length ? `<div class="w-tablewrap"><table class="w-table ar-log"><thead><tr><th>#</th><th>Settings</th><th>Train</th><th>Valid.</th><th>Deploy</th></tr></thead><tbody>${log.map((r, i) => `<tr><td>${i + 1}</td><td>n=${r.opts.n}, degree ${r.opts.degree}, ridge ${r.opts.lambda}${r.opts.leak ? ', leaked feature' : ''}</td><td>${fmt(r.metrics.train)}</td><td>${fmt(r.metrics.val)}</td><td class="${r.metrics.deploy > 0.6 ? 'no' : ''}">${fmt(r.metrics.deploy)}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
    };
    const focusBack = sel => { const n = el.querySelector(sel); if (n) n.focus(); };
    el.addEventListener('input', e => { const t = e.target.closest('[data-n]'); if (!t) return; if (t.dataset.n === 'lambdaIdx') p.lambda = LAMBDAS[+t.value]; else p[t.dataset.n] = +t.value; draw(); focusBack(`[data-n="${t.dataset.n}"]`); });
    el.addEventListener('change', e => { const t = e.target.closest('[data-leak]'); if (t) { p.leak = t.checked; draw(); focusBack('[data-leak]'); } });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-run]')) { last = run(p); log.push(last); log = log.slice(-8); draw(); focusBack('[data-run]'); }
      else if (e.target.closest('[data-sweep]')) { showSweep = !showSweep; draw(); focusBack('[data-sweep]'); }
      else if (e.target.closest('[data-clear]')) { log = []; last = null; draw(); }
    });
    draw();
  };
})();
