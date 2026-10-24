/* Interactive widgets for the Machine Learning course. Registers into window.WIDGETS. */
(() => {
  'use strict';
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, l]) => `<button type="button" data-${name}="${v}" class="${String(v) === String(active) ? 'on' : ''}" aria-pressed="${String(v) === String(active)}">${l}</button>`).join('')}</div>`;
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = r => () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const C3 = ['#3d6df2', '#e8505b', '#16a37f', '#f39a3c', '#8b6cff'];
  const fmt = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : '∞';
  const keepFocus = (el, sel) => { const n = el.querySelector(sel); if (n) n.focus(); };

  /* 1. Types of ML */
  T.mltypes = 'Interactive: what kind of learning is it?';
  W.mltypes = el => {
    const K = [['sup', 'Supervised'], ['unsup', 'Unsupervised'], ['self', 'Self-supervised'], ['rl', 'Reinforcement']];
    const S = [['📧 Flag spam using 50,000 emails marked spam/not-spam', 'sup'], ['🛍 Group customers into segments with no predefined groups', 'unsup'], ['💬 Pretrain a language model to predict the next word in raw text', 'self'], ['🤖 A robot learns to walk from rewards for moving forward', 'rl'], ['🏠 Predict house prices from past sales', 'sup'], ['💳 Flag unusual credit-card transactions, no fraud labels available', 'unsup'], ['🖼 Learn image features by reconstructing masked image patches', 'self'], ['♟ An agent learns chess by playing itself and winning or losing', 'rl']];
    const ans = {};
    const draw = () => {
      const done = Object.keys(ans).length, right = Object.entries(ans).filter(([i, a]) => S[i][1] === a).length;
      el.innerHTML = `<div class="ml-cards">${S.map((s, i) => `<div class="ml-card ${ans[i] ? (ans[i] === s[1] ? 'ok' : 'no') : ''}"><p>${esc(s[0])}</p><div class="ml-opts">${K.map(([k, l]) => `<button type="button" data-q="${i}" data-a="${k}" class="${ans[i] === k ? 'on' : ''} ${ans[i] && k === s[1] ? 'right' : ''}">${l}</button>`).join('')}</div></div>`).join('')}</div>
      <p class="w-status ${done === S.length ? (right === S.length ? 'good' : 'warn') : ''}">${done ? `${right} / ${done} correct${done < S.length ? `, ${S.length - done} to go` : ''}.` : 'Pick the learning type for each scenario.'} ${done === S.length ? (right === S.length ? '🎉 Perfect.' : 'Hint: if the labels come from the data itself, it is self-supervised.') : ''}</p>
      <div class="w-nav"><button type="button" data-reset>↺ Reset</button></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { ans[b.dataset.q] = b.dataset.a; draw(); } if (e.target.closest('[data-reset]')) { for (const k in ans) delete ans[k]; draw(); } });
    draw();
  };

  /* 2. Preprocessing pipeline */
  T.pipeline = 'Step through: a preprocessing pipeline';
  W.pipeline = el => {
    const raw = [[4, 3.2, 'INLAND'], [6, 8.1, 'NEAR BAY'], [null, 5.0, 'INLAND'], [5, null, 'NEAR OCEAN'], [3, 2.1, 'INLAND'], [7, 9.4, 'NEAR BAY']];
    const cats = ['INLAND', 'NEAR BAY', 'NEAR OCEAN'];
    const med = j => { const v = raw.map(r => r[j]).filter(x => x !== null).sort((a, b) => a - b); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
    const imp = raw.map(r => [r[0] ?? med(0), r[1] ?? med(1), r[2]]);
    const stat = j => { const v = imp.map(r => r[j]), mu = v.reduce((a, b) => a + b) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length); return [mu, sd]; };
    const st = [stat(0), stat(1)];
    const scaled = imp.map(r => [(r[0] - st[0][0]) / st[0][1], (r[1] - st[1][0]) / st[1][1], r[2]]);
    const steps = [
      ['Raw data', ['rooms', 'income', 'ocean'], raw.map(r => r.map(v => v === null ? null : v)), [], 'Missing values (NULL) and a text column: no model can use this yet.'],
      ['① SimpleImputer(median)', ['rooms', 'income', 'ocean'], imp, raw.flatMap((r, i) => r.map((v, j) => v === null ? `${i},${j}` : null)).filter(Boolean), `NaNs replaced with the training median (rooms ${med(0)}, income ${med(1)}). The median is learned in fit() and reused at predict time.`],
      ['② StandardScaler', ['rooms', 'income', 'ocean'], scaled.map(r => [r[0].toFixed(2), r[1].toFixed(2), r[2]]), raw.flatMap((_, i) => [`${i},0`, `${i},1`]), 'Each numeric column now has mean 0 and std 1, so gradient-based models and distances treat features fairly.'],
      ['③ OneHotEncoder', ['rooms', 'income', ...cats.map(c => 'ocean_' + c.replace(' ', '_'))], scaled.map(r => [r[0].toFixed(2), r[1].toFixed(2), ...cats.map(c => r[2] === c ? 1 : 0)]), raw.flatMap((_, i) => [2, 3, 4].map(j => `${i},${j}`)), 'Categories become 0/1 columns. handle_unknown="ignore" maps an unseen category to all zeros instead of crashing.'],
      ['④ → Model', ['features (5)', '→', 'LinearRegression'], [['all numeric', '→', 'fit / predict']], [], 'One Pipeline object now does all of this identically on training folds, test data and in production. No leakage.']
    ];
    let i = 0;
    const draw = () => {
      const s = steps[i];
      el.innerHTML = `<div class="w-head"><div class="w-steps">${steps.map((x, k) => `<button type="button" data-st="${k}" class="${k === i ? 'on' : k < i ? 'done' : ''}">${k ? k : 'Raw'}</button>`).join('')}</div><strong>${s[0]}</strong></div>
      <div class="w-tablewrap"><table class="w-table"><thead><tr>${s[1].map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s[2].map((r, ri) => `<tr>${r.map((v, ci) => `<td class="${s[3].includes(`${ri},${ci}`) ? 'hl' : ''}">${v === null ? '<span class="null">NaN</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="w-status">${s[4]}</p>
      <div class="w-nav"><button type="button" data-st="${Math.max(0, i - 1)}" ${i ? '' : 'disabled'}>← Back</button><button type="button" class="primary" data-st="${Math.min(steps.length - 1, i + 1)}" ${i < steps.length - 1 ? '' : 'disabled'}>Next step →</button></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (b && !b.disabled) { i = +b.dataset.st; draw(); } });
    draw();
  };

  /* 3. Threshold / precision-recall */
  T.threshold = 'Interactive: the precision/recall trade-off';
  W.threshold = el => {
    const r = rng(7), D = [];
    for (let i = 0; i < 24; i++) { const pos = i % 3 === 0; D.push([pos ? 0.35 + r() * 0.6 : r() * 0.7, pos ? 1 : 0]); }
    let th = 0.5;
    const metrics = t => { let tp = 0, fp = 0, fn = 0, tn = 0; D.forEach(([s, y]) => { const p = s >= t; if (p && y) tp++; else if (p) fp++; else if (y) fn++; else tn++; }); const P = tp + fp ? tp / (tp + fp) : 1, R = tp / (tp + fn); return { tp, fp, fn, tn, P, R, F: P + R ? 2 * P * R / (P + R) : 0 }; };
    const curve = Array.from({ length: 101 }, (_, k) => metrics(k / 100));
    const draw = () => {
      const m = metrics(th);
      el.innerHTML = `<label class="w-field">Decision threshold: <b>${th.toFixed(2)}</b><input type="range" min="0" max="1" step="0.01" value="${th}" data-th></label>
      <svg viewBox="0 0 600 70" class="w-svg"><line x1="20" y1="35" x2="580" y2="35" stroke="var(--line-strong)"/>${D.map(([s, y], k) => `<circle cx="${20 + s * 560}" cy="${35 + (k % 3 - 1) * 12}" r="7" fill="${y ? 'var(--accent)' : 'var(--muted)'}" opacity="${(s >= th) ? 1 : .35}" stroke="${s >= th ? 'var(--ink)' : 'none'}"/>`).join('')}
        <line x1="${20 + th * 560}" y1="4" x2="${20 + th * 560}" y2="66" stroke="var(--ink)" stroke-width="2" stroke-dasharray="4 3"/><text x="${20 + th * 560 + 6}" y="12" font-size="11" fill="var(--ink)">predict positive →</text></svg>
      <p class="w-small">● colored = actual positive, ● grey = actual negative. Points right of the line are predicted positive.</p>
      <div class="ml-split"><div class="ml-cm"><div></div><b>pred +</b><b>pred −</b><b>actual +</b><span class="tp">TP ${m.tp}</span><span class="fn">FN ${m.fn}</span><b>actual −</b><span class="fp">FP ${m.fp}</span><span class="tn">TN ${m.tn}</span></div>
      <svg viewBox="0 0 160 130" class="ml-pr"><rect x="30" y="5" width="120" height="100" fill="var(--bg-soft)" stroke="var(--line)"/><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${curve.map(c => `${30 + c.R * 120},${105 - c.P * 100}`).join(' ')}"/><circle cx="${30 + m.R * 120}" cy="${105 - m.P * 100}" r="5" fill="var(--ink)"/><text x="90" y="124" font-size="10" text-anchor="middle" fill="var(--muted)">recall →</text><text x="12" y="55" font-size="10" fill="var(--muted)" transform="rotate(-90 12 55)" text-anchor="middle">precision</text></svg></div>
      <div class="ag-stats"><div><b>${fmt(m.P)}</b><small>precision</small></div><div><b>${fmt(m.R)}</b><small>recall</small></div><div><b>${fmt(m.F)}</b><small>F1</small></div><div><b>${fmt((m.tp + m.tn) / D.length)}</b><small>accuracy</small></div></div>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-th]')) { th = +e.target.value; draw(); keepFocus(el, '[data-th]'); } });
    draw();
  };

  /* 4. Gradient descent on a 1-D loss */
  T.gd = 'Simulation: gradient descent and the learning rate';
  W.gd = el => {
    const r = rng(3), xs = Array.from({ length: 30 }, () => 0.2 + r() * 1.8), mx2 = xs.reduce((a, x) => a + x * x, 0) / xs.length;
    const ys = xs.map(x => 3 * x + (r() - 0.5) * 0.6), wStar = xs.reduce((a, x, i) => a + x * ys[i], 0) / xs.reduce((a, x) => a + x * x, 0);
    const L = w => xs.reduce((a, x, i) => a + (w * x - ys[i]) ** 2, 0) / xs.length, G = w => 2 * xs.reduce((a, x, i) => a + x * (w * x - ys[i]), 0) / xs.length;
    let eta = 0.1, path = [-1], timer;
    const draw = () => {
      const X = w => 40 + (w + 2) / 10 * 520, Y = l => 190 - Math.min(l, 60) / 60 * 170;
      const w = path[path.length - 1], div = !Number.isFinite(w) || Math.abs(w) > 1e3, crit = 2 / (2 * mx2);
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Learning rate η <input type="range" min="0.01" max="0.9" step="0.01" value="${eta}" data-eta> <b>${eta.toFixed(2)}</b></label><div class="w-nav"><button type="button" data-g="step" class="primary">Step ▸</button><button type="button" data-g="run">Run 30</button><button type="button" data-g="reset">↺</button></div></div>
      <svg viewBox="0 0 600 210" class="w-svg"><polyline fill="none" stroke="var(--line-strong)" stroke-width="2" points="${Array.from({ length: 121 }, (_, k) => { const ww = -2 + k / 12; return `${X(ww)},${Y(L(ww))}`; }).join(' ')}"/>
        <line x1="${X(wStar)}" y1="195" x2="${X(wStar)}" y2="20" stroke="var(--ok)" stroke-dasharray="3 3"/><text x="${X(wStar) + 4}" y="30" font-size="11" fill="var(--ok)">optimum w*</text>
        <polyline fill="none" stroke="var(--accent)" stroke-width="1.5" points="${path.filter(p => Number.isFinite(p) && Math.abs(p) < 20).map(p => `${X(p)},${Y(L(p))}`).join(' ')}"/>
        ${path.filter(p => Number.isFinite(p) && Math.abs(p) < 20).map((p, k, a) => `<circle cx="${X(p)}" cy="${Y(L(p))}" r="${k === a.length - 1 ? 6 : 3.5}" fill="${k === a.length - 1 ? 'var(--ink)' : 'var(--accent)'}"/>`).join('')}
        <text x="300" y="207" font-size="10" text-anchor="middle" fill="var(--muted)">weight w →   (cost = MSE)</text></svg>
      <div class="ag-stats"><div><b>${path.length - 1}</b><small>steps</small></div><div><b>${div ? '∞' : fmt(w, 3)}</b><small>w (target ${fmt(wStar, 3)})</small></div><div><b>${div ? '∞' : fmt(L(w), 3)}</b><small>MSE</small></div></div>
      <p class="w-status ${div ? 'bad' : eta > crit / 2 ? 'warn' : 'good'}">${div ? '💥 Diverged! Each step overshoots further than the last.' : eta > crit / 2 ? `Oscillating: η is above half the critical value (${crit.toFixed(2)}), so it zig-zags across the valley. Above ${crit.toFixed(2)} it diverges.` : eta < 0.05 ? 'Converging, but slowly. Small steps waste compute.' : 'Converging smoothly toward the minimum.'}</p>`;
    };
    const step = () => { const w = path[path.length - 1]; if (Number.isFinite(w) && Math.abs(w) < 1e6) path.push(w - eta * G(w)); };
    el.addEventListener('input', e => { if (e.target.matches('[data-eta]')) { eta = +e.target.value; clearInterval(timer); path = [-1]; draw(); keepFocus(el, '[data-eta]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; clearInterval(timer); if (b.dataset.g === 'reset') path = [-1]; if (b.dataset.g === 'step') step(); if (b.dataset.g === 'run') { let n = 0; timer = setInterval(() => { step(); draw(); if (++n >= 30) clearInterval(timer); }, 80); } draw(); });
    draw();
  };

  /* 5. Decision tree split */
  T.tree = 'Interactive: find the best split';
  W.tree = el => {
    const r = rng(11), P = [];
    for (let i = 0; i < 40; i++) { const a = r() * 10, b = r() * 10; P.push([a, b, (a > 6 || (a > 3 && b > 6.5)) ? 1 : 0]); }
    let f = 0, t = 5;
    const gini = s => { if (!s.length) return 0; const p = s.filter(q => q[2]).length / s.length; return 1 - p * p - (1 - p) * (1 - p); };
    const score = (f, t) => { const L = P.filter(p => p[f] <= t), R = P.filter(p => p[f] > t); return { L, R, g: (L.length * gini(L) + R.length * gini(R)) / P.length }; };
    const draw = () => {
      const { L, R, g } = score(f, t), S = v => 20 + v * 26;
      el.innerHTML = `<div class="w-head">${seg('feat', [[0, 'Split on x₁'], [1, 'Split on x₂']], f)}<button type="button" class="w-go" data-best>✨ Find best split</button></div>
      <label class="w-field">Threshold: <b>${(f ? 'x₂' : 'x₁')} ≤ ${t.toFixed(2)}</b><input type="range" min="0" max="10" step="0.05" value="${t}" data-t></label>
      <div class="ml-split"><svg viewBox="0 0 300 300" class="ml-plot"><rect x="20" y="20" width="260" height="260" fill="var(--bg-soft)" stroke="var(--line)"/>
        ${f === 0 ? `<rect x="20" y="20" width="${S(t) - 20}" height="260" fill="#3d6df2" opacity=".06"/><line x1="${S(t)}" y1="20" x2="${S(t)}" y2="280" stroke="var(--ink)" stroke-width="2"/>` : `<rect x="20" y="${300 - S(t)}" width="260" height="${S(t) - 20}" fill="#3d6df2" opacity=".06"/><line x1="20" y1="${300 - S(t)}" x2="280" y2="${300 - S(t)}" stroke="var(--ink)" stroke-width="2"/>`}
        ${P.map(p => p[2] ? `<rect x="${S(p[0]) - 5}" y="${300 - S(p[1]) - 5}" width="10" height="10" fill="${C3[1]}"/>` : `<circle cx="${S(p[0])}" cy="${300 - S(p[1])}" r="5.5" fill="${C3[0]}"/>`).join('')}
        <text x="150" y="296" font-size="11" text-anchor="middle" fill="var(--muted)">x₁ →</text><text x="10" y="150" font-size="11" fill="var(--muted)" transform="rotate(-90 10 150)" text-anchor="middle">x₂ →</text></svg>
      <div class="ml-side"><div class="w-card"><span class="w-label">Left (≤)</span>${L.filter(p => !p[2]).length} ● · ${L.filter(p => p[2]).length} ■<br>Gini <b>${gini(L).toFixed(3)}</b></div><div class="w-card"><span class="w-label">Right (&gt;)</span>${R.filter(p => !p[2]).length} ● · ${R.filter(p => p[2]).length} ■<br>Gini <b>${gini(R).toFixed(3)}</b></div><div class="w-card"><span class="w-label">Weighted impurity</span><b class="big">${g.toFixed(3)}</b><span class="w-small">lower is better (parent ${gini(P).toFixed(3)})</span></div></div></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-feat]'); if (b) { f = +b.dataset.feat; draw(); } if (e.target.closest('[data-best]')) { let best = [1e9, 0, 0]; [0, 1].forEach(ff => { for (let tt = 0; tt <= 10; tt += 0.05) { const s = score(ff, tt).g; if (s < best[0] - 1e-9) best = [s, ff, tt]; } }); f = best[1]; t = +best[2].toFixed(2); draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-t]')) { t = +e.target.value; draw(); keepFocus(el, '[data-t]'); } });
    draw();
  };

  /* 6. Ensemble: wisdom of the crowd */
  T.ensemble = 'Simulation: why ensembles work (and when they don\'t)';
  W.ensemble = el => {
    let n = 25, p = 0.6, rho = 0;
    const lc = (a, b) => { let r = 0; for (let i = 1; i <= b; i++) r += Math.log(a - b + i) - Math.log(i); return r; };
    const maj = (n, p) => { let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += Math.exp(lc(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); return s; };
    const eff = n => Math.max(1, Math.round(n / (1 + (n - 1) * rho)) | 1);
    const acc = n => p === 0.5 ? 0.5 : maj(eff(n), p);
    const draw = () => {
      const pts = Array.from({ length: 50 }, (_, k) => 2 * k + 1), X = k => 40 + (k - 1) / 98 * 520, Y = a => 180 - (a - 0.5) / 0.5 * 160;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Voters <input type="range" min="1" max="99" step="2" value="${n}" data-n> <b>${n}</b></label><label class="w-field inline">Each voter's accuracy <input type="range" min="0.5" max="0.75" step="0.01" value="${p}" data-p> <b>${Math.round(p * 100)}%</b></label>${seg('rho', [[0, 'Independent errors'], [0.3, 'Correlated (ρ=0.3)']], rho)}</div>
      <svg viewBox="0 0 600 200" class="w-svg"><line x1="40" y1="180" x2="560" y2="180" stroke="var(--line-strong)"/><line x1="40" y1="20" x2="40" y2="180" stroke="var(--line-strong)"/>
        <line x1="40" y1="${Y(p)}" x2="560" y2="${Y(p)}" stroke="var(--muted)" stroke-dasharray="4 3"/><text x="564" y="${Y(p) + 4}" font-size="10" fill="var(--muted)">1 voter</text>
        <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pts.map(k => `${X(k)},${Y(acc(k))}`).join(' ')}"/><circle cx="${X(n)}" cy="${Y(acc(n))}" r="6" fill="var(--ink)"/>
        <text x="300" y="196" font-size="10" text-anchor="middle" fill="var(--muted)">number of voters →</text><text x="34" y="24" font-size="10" text-anchor="end" fill="var(--muted)">100%</text><text x="34" y="183" font-size="10" text-anchor="end" fill="var(--muted)">50%</text></svg>
      <div class="ag-stats"><div><b>${Math.round(p * 100)}%</b><small>single model</small></div><div><b>${(acc(n) * 100).toFixed(1)}%</b><small>majority vote of ${n}</small></div><div><b>${eff(n)}</b><small>effectively independent</small></div></div>
      <p class="w-status ${rho ? 'warn' : 'good'}">${rho ? 'Correlated models make the same mistakes, so adding more barely helps. That is why random forests inject randomness (bootstrap samples + random features).' : 'With independent errors, many weak learners at 60% become a strong one. That is the law of large numbers.'}</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-n]')) { n = +e.target.value; draw(); keepFocus(el, '[data-n]'); } if (e.target.matches('[data-p]')) { p = +e.target.value; draw(); keepFocus(el, '[data-p]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-rho]'); if (b) { rho = +b.dataset.rho; draw(); } });
    draw();
  };

  /* 7. PCA projection */
  T.pca = 'Interactive: find the axis of maximum variance';
  W.pca = el => {
    const g = gauss(rng(5)), P = Array.from({ length: 70 }, () => { const a = g() * 2.2, b = g() * 0.7; return [a * 0.85 - b * 0.5, a * 0.5 + b * 0.85]; });
    const mx = P.reduce((s, p) => s + p[0], 0) / P.length, my = P.reduce((s, p) => s + p[1], 0) / P.length; P.forEach(p => { p[0] -= mx; p[1] -= my; });
    const sxx = P.reduce((s, p) => s + p[0] * p[0], 0), syy = P.reduce((s, p) => s + p[1] * p[1], 0), sxy = P.reduce((s, p) => s + p[0] * p[1], 0);
    const pc1 = 0.5 * Math.atan2(2 * sxy, sxx - syy) * 180 / Math.PI, total = sxx + syy;
    let ang = 100;
    const draw = () => {
      const a = ang * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], S = 30, cx = 160, cy = 150;
      const proj = P.map(p => p[0] * u[0] + p[1] * u[1]), v = proj.reduce((s, x) => s + x * x, 0) / total;
      el.innerHTML = `<label class="w-field">Projection axis angle: <b>${ang.toFixed(0)}°</b><input type="range" min="0" max="179" step="1" value="${ang}" data-a></label>
      <div class="ml-split"><svg viewBox="0 0 320 300" class="ml-plot"><rect width="320" height="300" fill="var(--bg-soft)" rx="10"/>
        <line x1="${cx - u[0] * 200}" y1="${cy + u[1] * 200}" x2="${cx + u[0] * 200}" y2="${cy - u[1] * 200}" stroke="var(--accent)" stroke-width="2.5"/>
        ${P.map((p, k) => `<line x1="${cx + p[0] * S}" y1="${cy - p[1] * S}" x2="${cx + proj[k] * u[0] * S}" y2="${cy - proj[k] * u[1] * S}" stroke="var(--muted)" opacity=".35"/><circle cx="${cx + p[0] * S}" cy="${cy - p[1] * S}" r="3.5" fill="${C3[0]}"/><circle cx="${cx + proj[k] * u[0] * S}" cy="${cy - proj[k] * u[1] * S}" r="2.5" fill="var(--accent)"/>`).join('')}</svg>
      <div class="ml-side"><div class="w-card"><span class="w-label">Variance preserved</span><b class="big">${(v * 100).toFixed(1)}%</b><div class="ag-hbar"><i style="width:${v * 100}%"></i></div></div><div class="w-card"><span class="w-small">Projecting 2-D points onto one axis. PCA picks the axis that keeps the <b>most</b> variance, i.e. the most spread-out shadows.</span></div><button type="button" class="w-go" data-pc1>Snap to PC1</button><button type="button" class="w-chip" data-pc2>PC2 (orthogonal)</button></div></div>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-a]')) { ang = +e.target.value; draw(); keepFocus(el, '[data-a]'); } });
    el.addEventListener('click', e => { if (e.target.closest('[data-pc1]')) { ang = Math.round((pc1 + 180) % 180); draw(); } if (e.target.closest('[data-pc2]')) { ang = Math.round((pc1 + 270) % 180); draw(); } });
    draw();
  };

  /* 8. k-means step by step */
  T.kmeans = 'Simulation: k-means, one step at a time';
  W.kmeans = el => {
    const g = gauss(rng(9)), P = [];
    [[2.5, 7], [7, 7.5], [5, 2.5]].forEach(([x, y]) => { for (let i = 0; i < 25; i++) P.push([x + g() * 0.9, y + g() * 0.9]); });
    let k = 3, C, lab, phase, it, seed = 1;
    const init = () => { const r = rng(seed * 97 + k); C = Array.from({ length: k }, () => [...P[Math.floor(r() * P.length)]]); lab = P.map(() => -1); phase = 'assign'; it = 0; };
    const assign = () => { lab = P.map(p => { let b = 0, bd = 1e9; C.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; }); };
    const update = () => { C = C.map((c, j) => { const m = P.filter((_, i) => lab[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; }); };
    const inertia = () => lab[0] < 0 ? NaN : P.reduce((s, p, i) => s + (p[0] - C[lab[i]][0]) ** 2 + (p[1] - C[lab[i]][1]) ** 2, 0);
    const step = () => { if (phase === 'assign') { assign(); phase = 'update'; } else { const old = JSON.stringify(C); update(); it++; phase = JSON.stringify(C) === old ? 'done' : 'assign'; } };
    const draw = () => {
      const S = v => 15 + v * 27;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">k <input type="range" min="2" max="5" value="${k}" data-k> <b>${k}</b></label><div class="w-nav"><button type="button" class="primary" data-km="step" ${phase === 'done' ? 'disabled' : ''}>${phase === 'assign' ? '① Assign points' : phase === 'update' ? '② Move centroids' : 'Converged ✓'}</button><button type="button" data-km="run">Run to convergence</button><button type="button" data-km="new">🎲 New init</button></div></div>
      <svg viewBox="0 0 300 300" class="ml-plot" style="max-width:380px;margin:0 auto;display:block"><rect width="300" height="300" fill="var(--bg-soft)" rx="10"/>${P.map((p, i) => `<circle cx="${S(p[0])}" cy="${300 - S(p[1])}" r="4.5" fill="${lab[i] < 0 ? 'var(--muted)' : C3[lab[i]]}" opacity=".85"/>`).join('')}
        ${C.map((c, j) => `<g transform="translate(${S(c[0])} ${300 - S(c[1])})"><circle r="11" fill="var(--panel)" stroke="${C3[j]}" stroke-width="3"/><path d="M-5 -5L5 5M5 -5L-5 5" stroke="${C3[j]}" stroke-width="3"/></g>`).join('')}</svg>
      <div class="ag-stats"><div><b>${it}</b><small>iterations</small></div><div><b>${Number.isFinite(inertia()) ? inertia().toFixed(1) : '-'}</b><small>inertia</small></div><div><b>${phase === 'done' ? '✓' : phase}</b><small>next step</small></div></div>
      <p class="w-small">Try k = 2, 4 or 5, and new random initializations. k-means always converges, but not always to the best clustering, so scikit-learn runs it several times (<code>n_init</code>).</p>`;
    };
    init();
    el.addEventListener('input', e => { if (e.target.matches('[data-k]')) { k = +e.target.value; init(); draw(); keepFocus(el, '[data-k]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-km]'); if (!b) return; if (b.dataset.km === 'step') step(); if (b.dataset.km === 'run') { let n = 0; while (phase !== 'done' && n++ < 100) step(); } if (b.dataset.km === 'new') { seed++; init(); } draw(); });
    draw();
  };

  /* 9. Single neuron */
  T.neuron = 'Interactive: tune a neuron by hand';
  W.neuron = el => {
    const D = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0] }, X = [[0, 0], [0, 1], [1, 0], [1, 1]];
    let ds = 'AND', w1 = 1, w2 = 1, b = -1.5, act = 'step';
    const f = z => act === 'step' ? (z > 0 ? 1 : 0) : 1 / (1 + Math.exp(-z));
    const draw = () => {
      const out = X.map(([a, c]) => f(w1 * a + w2 * c + b)), ok = out.filter((o, i) => (o > 0.5 ? 1 : 0) === D[ds][i]).length, S = v => 40 + v * 200;
      const cells = []; for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) { const a = -0.2 + i * 0.06, c = -0.2 + j * 0.06, o = f(w1 * a + w2 * c + b); cells.push(`<rect x="${S(a)}" y="${280 - S(c) - 12}" width="12.5" height="12.5" fill="${C3[1]}" opacity="${(o * 0.45).toFixed(2)}"/>`); }
      el.innerHTML = `<div class="w-head">${seg('ds', Object.keys(D).map(k => [k, k]), ds)}${seg('act', [['step', 'Step'], ['sigmoid', 'Sigmoid']], act)}</div>
      <div class="ml-split"><svg viewBox="0 0 280 280" class="ml-plot">${cells.join('')}<rect x="28" y="28" width="225" height="225" fill="none" stroke="var(--line-strong)"/>${X.map(([a, c], i) => `<g><circle cx="${S(a)}" cy="${280 - S(c)}" r="13" fill="${D[ds][i] ? C3[1] : 'var(--panel)'}" stroke="var(--ink)" stroke-width="2"/><text x="${S(a)}" y="${280 - S(c) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${D[ds][i] ? '#fff' : 'var(--ink)'}">${D[ds][i]}</text></g>`).join('')}
        <text x="140" y="276" font-size="11" text-anchor="middle" fill="var(--muted)">x₁</text><text x="12" y="140" font-size="11" fill="var(--muted)">x₂</text></svg>
      <div class="ml-side">${[['w1', 'w₁', w1], ['w2', 'w₂', w2], ['b', 'bias b', b]].map(([k, l, v]) => `<label class="w-field">${l} = <b>${v.toFixed(1)}</b><input type="range" min="-3" max="3" step="0.1" value="${v}" data-w="${k}"></label>`).join('')}
      <pre class="snip">ŷ = ${act}(${w1.toFixed(1)}·x₁ + ${w2.toFixed(1)}·x₂ ${b < 0 ? '−' : '+'} ${Math.abs(b).toFixed(1)})</pre>
      <p class="w-status ${ok === 4 ? 'good' : ds === 'XOR' ? 'warn' : ''}">${ok}/4 correct. ${ok === 4 ? '✓ The shaded region matches the targets.' : ds === 'XOR' ? 'No single straight line separates XOR. You need a hidden layer.' : 'Adjust the weights so only the "1"s fall in the shaded region.'}</p></div></div>`;
    };
    el.addEventListener('input', e => { const k = e.target.dataset.w; if (k) { const v = +e.target.value; if (k === 'w1') w1 = v; else if (k === 'w2') w2 = v; else b = v; draw(); keepFocus(el, `[data-w="${k}"]`); } });
    el.addEventListener('click', e => { const d = e.target.closest('[data-ds]'), a = e.target.closest('[data-act]'); if (d) ds = d.dataset.ds; if (a) act = a.dataset.act; if (d || a) draw(); });
    draw();
  };

  /* 10. Autograd on a tiny graph */
  T.autograd = 'Interactive: forward & backward through a computation graph';
  W.autograd = el => {
    let x = 2, w = 0.5, b = 0, y = 4, steps = 0;
    const draw = () => {
      const z = w * x + b, L = (z - y) ** 2, dz = 2 * (z - y), dw = dz * x, db = dz, dx = dz * w;
      const N = (cx, cy, label, val, grad, kind) => `<g><rect x="${cx - 52}" y="${cy - 26}" width="104" height="52" rx="12" fill="var(--panel)" stroke="${kind === 'param' ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="2"/><text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${label}</text><text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="11" fill="var(--ok)">= ${val.toFixed(2)}</text>${grad == null ? '' : `<text x="${cx}" y="${cy + 21}" text-anchor="middle" font-size="10.5" fill="var(--bad)">∂L = ${grad.toFixed(2)}</text>`}</g>`;
      el.innerHTML = `<svg viewBox="0 0 640 230" class="w-svg"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
        ${[[110, 40, 250, 80], [110, 120, 250, 100], [380, 100, 250, 190], [110, 200, 250, 110], [300, 100, 400, 100], [490, 100, 550, 100]].slice(0, 6).map(([a, b2, c, d], i) => i === 2 ? '' : `<line x1="${a + 52}" y1="${b2}" x2="${c - 52}" y2="${d}" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#ah)"/>`).join('')}
        ${N(110, 40, 'x', x, dx)}${N(110, 120, 'w (param)', w, dw, 'param')}${N(110, 200, 'b (param)', b, db, 'param')}${N(300, 100, 'z = w·x + b', z, dz)}${N(440, 100, 'L = (z − y)²', L, 1)}${N(580, 100, 'target y', y, null)}</svg>
      <div class="ml-grid4">${[['x', 'x', x], ['w', 'w', w], ['b', 'b', b], ['y', 'y', y]].map(([k, l, v]) => `<label class="w-field">${l} = <b>${v.toFixed(2)}</b><input type="range" min="-5" max="5" step="0.1" value="${v}" data-v="${k}"></label>`).join('')}</div>
      <div class="w-nav"><button type="button" class="primary" data-sgd>optimizer.step() (lr = 0.05)</button><span class="w-meter">steps ${steps} · loss ${L.toFixed(3)}</span></div>
      <p class="w-small"><span style="color:var(--ok)">Green</span> = forward values. <span style="color:var(--bad)">Red</span> = gradients from <code>loss.backward()</code> via the chain rule: ∂L/∂w = 2(z − y)·x. A step moves w and b against their gradients.</p>`;
    };
    el.addEventListener('input', e => { const k = e.target.dataset.v; if (k) { const v = +e.target.value; ({ x: () => x = v, w: () => w = v, b: () => b = v, y: () => y = v })[k](); steps = 0; draw(); keepFocus(el, `[data-v="${k}"]`); } });
    el.addEventListener('click', e => { if (e.target.closest('[data-sgd]')) { const dz = 2 * (w * x + b - y); w -= 0.05 * dz * x; b -= 0.05 * dz; steps++; draw(); } });
    draw();
  };

  /* 11. Optimizer race */
  T.optimizers = 'Simulation: SGD vs. Momentum vs. Adam';
  W.optimizers = el => {
    let lr = 0.08;
    const grad = ([x, y]) => [2 * x, 20 * y], f = ([x, y]) => x * x + 10 * y * y;
    const run = kind => { let p = [-4.5, 1.8], v = [0, 0], m = [0, 0], s = [0, 0]; const out = [p]; for (let t = 1; t <= 60; t++) { const g = grad(p);
      if (kind === 'sgd') p = [p[0] - lr * g[0], p[1] - lr * g[1]];
      else if (kind === 'mom') { v = [0.9 * v[0] - lr * g[0], 0.9 * v[1] - lr * g[1]]; p = [p[0] + v[0], p[1] + v[1]]; }
      else { m = m.map((mi, i) => 0.9 * mi + 0.1 * g[i]); s = s.map((si, i) => 0.999 * si + 0.001 * g[i] * g[i]); const a = lr * 4; p = p.map((pi, i) => pi - a * (m[i] / (1 - 0.9 ** t)) / (Math.sqrt(s[i] / (1 - 0.999 ** t)) + 1e-8)); }
      if (!p.every(Number.isFinite) || Math.abs(p[0]) > 50 || Math.abs(p[1]) > 50) break; out.push(p); } return out; };
    const draw = () => {
      const X = x => 300 + x * 55, Y = y => 120 - y * 55, R = { sgd: run('sgd'), mom: run('mom'), adam: run('adam') }, col = { sgd: '#e8505b', mom: '#3d6df2', adam: '#16a37f' }, nm = { sgd: 'SGD', mom: 'Momentum', adam: 'Adam' };
      el.innerHTML = `<label class="w-field">Learning rate: <b>${lr.toFixed(3)}</b><input type="range" min="0.005" max="0.11" step="0.005" value="${lr}" data-lr></label>
      <svg viewBox="0 0 600 240" class="w-svg" style="max-height:280px"><rect width="600" height="240" fill="var(--bg-soft)" rx="10"/>${[0.5, 2, 5, 10, 18, 30].map(l => `<ellipse cx="300" cy="120" rx="${Math.sqrt(l) * 55}" ry="${Math.sqrt(l / 10) * 55}" fill="none" stroke="var(--line-strong)" opacity=".7"/>`).join('')}
        <circle cx="300" cy="120" r="4" fill="var(--ink)"/>${Object.keys(R).map(k => `<polyline fill="none" stroke="${col[k]}" stroke-width="2" points="${R[k].map(p => `${X(p[0])},${Y(p[1])}`).join(' ')}"/>${R[k].map(p => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="2" fill="${col[k]}"/>`).join('')}`).join('')}</svg>
      <div class="ag-stats">${Object.keys(R).map(k => { const last = R[k][R[k].length - 1], div = R[k].length < 61; return `<div style="border-color:${col[k]}"><b style="color:${col[k]}">${div ? '💥' : f(last).toExponential(1)}</b><small>${nm[k]} loss after 60 steps</small></div>`; }).join('')}</div>
      <p class="w-small">Loss f = x² + 10y², a long, narrow valley. SGD zig-zags across the steep direction and crawls along the flat one; momentum builds speed; Adam rescales each axis. Push the learning rate up and watch SGD blow up first.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-lr]')) { lr = +e.target.value; draw(); keepFocus(el, '[data-lr]'); } });
    draw();
  };

  /* 12. Convolution */
  T.conv = 'Interactive: draw, convolve, pool';
  W.conv = el => {
    const N = 10, K = { 'Vertical edge': [[1, 0, -1], [1, 0, -1], [1, 0, -1]], 'Horizontal edge': [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], 'Blur': [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map(r => r.map(v => v / 9)), 'Sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] };
    let img = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i >= 2 && i <= 7 && (j === 2 || j === 7)) || ((i === 2 || i === 7) && j >= 2 && j <= 7) ? 1 : 0)), kn = 'Vertical edge', drawing = false, val = 1;
    const conv = () => Array.from({ length: N - 2 }, (_, i) => Array.from({ length: N - 2 }, (_, j) => { let s = 0; for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) s += img[i + a][j + c] * K[kn][a][c]; return s; }));
    const pool = fm => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => Math.max(fm[2 * i][2 * j], fm[2 * i + 1][2 * j], fm[2 * i][2 * j + 1], fm[2 * i + 1][2 * j + 1])));
    const heat = v => v >= 0 ? `rgba(232,80,91,${Math.min(1, v / 3)})` : `rgba(61,109,242,${Math.min(1, -v / 3)})`;
    const grid = (m, cls, cell) => `<div class="ml-grid ${cls}" style="grid-template-columns:repeat(${m.length},1fr)">${m.map((r, i) => r.map((v, j) => cell(v, i, j)).join('')).join('')}</div>`;
    const draw = () => {
      const fm = conv(), pl = pool(fm);
      el.innerHTML = `<div class="w-head">${seg('kn', Object.keys(K).map(k => [k, k]), kn)}<button type="button" class="w-chip" data-clear>Clear</button></div>
      <div class="ml-conv"><div><span class="w-label">Input 10×10 (draw!)</span>${grid(img, 'draw', (v, i, j) => `<i data-px="${i},${j}" class="${v ? 'on' : ''}"></i>`)}</div>
      <div><span class="w-label">Kernel 3×3</span>${grid(K[kn], 'kern', v => `<i>${+v.toFixed(2)}</i>`)}</div>
      <div><span class="w-label">Feature map 8×8</span>${grid(fm, 'fm', v => `<i style="background:${heat(v)}" title="${v.toFixed(2)}"></i>`)}</div>
      <div><span class="w-label">Max-pool 2×2 → 4×4</span>${grid(pl, 'fm', v => `<i style="background:${heat(v)}" title="${v.toFixed(2)}"></i>`)}</div></div>
      <p class="w-small">Red = strong positive response, blue = negative. The edge filters light up only where intensity changes in their direction, wherever that happens in the image (weight sharing).</p>`;
    };
    const paint = t => { const p = t.closest && t.closest('[data-px]'); if (!p) return; const [i, j] = p.dataset.px.split(',').map(Number); if (img[i][j] !== val) { img[i][j] = val; draw(); } };
    el.addEventListener('pointerdown', e => { const p = e.target.closest('[data-px]'); if (!p) return; e.preventDefault(); const [i, j] = p.dataset.px.split(',').map(Number); val = img[i][j] ? 0 : 1; drawing = true; paint(e.target); });
    el.addEventListener('pointerover', e => { if (drawing) paint(e.target); });
    window.addEventListener('pointerup', () => { drawing = false; });
    el.addEventListener('click', e => { const b = e.target.closest('[data-kn]'); if (b) { kn = b.dataset.kn; draw(); } if (e.target.closest('[data-clear]')) { img = img.map(r => r.map(() => 0)); draw(); } });
    draw();
  };

  /* 13. Forecasting baselines */
  T.forecast = 'Interactive: forecasting baselines';
  W.forecast = el => {
    const g = gauss(rng(21)), s = Array.from({ length: 72 }, (_, t) => 20 + 0.15 * t + 4 * Math.sin(2 * Math.PI * t / 12) + g() * 0.8), split = 48;
    const M = {
      naive: ['Naive (last value)', t => s[t - 1]],
      seasonal: ['Seasonal naive (12 ago)', t => s[t - 12]],
      ma: ['Moving average (12)', t => s.slice(t - 12, t).reduce((a, b) => a + b) / 12],
      sdrift: ['Seasonal naive + trend', t => s[t - 12] + (s[t - 1] - s[t - 13])]
    };
    let k = 'seasonal';
    const mae = key => { let e = 0; for (let t = split; t < 72; t++) e += Math.abs(M[key][1](t) - s[t]); return e / (72 - split); };
    const draw = () => {
      const X = t => 30 + t * 7.6, mn = Math.min(...s) - 2, mxv = Math.max(...s) + 2, Y = v => 190 - (v - mn) / (mxv - mn) * 170;
      el.innerHTML = `<div class="w-head">${seg('fm', Object.entries(M).map(([kk, v]) => [kk, v[0]]), k)}</div>
      <svg viewBox="0 0 600 210" class="w-svg"><rect x="${X(split)}" y="10" width="${X(71) - X(split)}" height="185" fill="var(--accent-soft)"/><text x="${X(split) + 6}" y="24" font-size="11" fill="var(--accent)">test period</text>
        <polyline fill="none" stroke="var(--ink)" stroke-width="2" points="${s.map((v, t) => `${X(t)},${Y(v)}`).join(' ')}"/>
        <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="5 3" points="${Array.from({ length: 72 - split }, (_, i) => split + i).map(t => `${X(t)},${Y(M[k][1](t))}`).join(' ')}"/></svg>
      <div class="w-tablewrap"><table class="w-table"><thead><tr><th>Model</th><th>Test MAE</th><th></th></tr></thead><tbody>${Object.keys(M).map(kk => { const best = Object.keys(M).reduce((a, b) => mae(a) < mae(b) ? a : b); return `<tr class="${kk === k ? 'sel' : ''}"><td>${M[kk][0]}</td><td>${mae(kk).toFixed(2)}</td><td>${kk === best ? '🏆' : ''}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="w-small">Monthly data with trend + yearly seasonality. Any fancy model (ARIMA, RNN, transformer) must beat these baselines to be worth it.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-fm]'); if (b) { k = b.dataset.fm; draw(); } });
    draw();
  };

  /* 14. Attention */
  T.attention = 'Interactive: what does each word attend to?';
  W.attention = el => {
    const tok = ['The', 'animal', 'didn\'t', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
    const links = { 1: { 0: 1 }, 2: { 3: 1.2, 1: .6 }, 3: { 5: 1.4, 1: .8 }, 5: { 4: 1, 3: 1 }, 6: { 10: 1, 3: .5 }, 7: { 1: 2.2, 5: .4 }, 8: { 7: 1.2, 10: .8 }, 9: { 10: 1.4 }, 10: { 1: 1.6, 7: 1.4, 9: .6 } };
    let q = 7, causal = false;
    const weights = i => { const sc = tok.map((_, j) => (j === i ? 1 : 0) + (Math.abs(i - j) === 1 ? 0.4 : 0) + ((links[i] || {})[j] || 0)); const ex = sc.map((v, j) => causal && j > i ? 0 : Math.exp(v * 1.6)); const z = ex.reduce((a, b) => a + b); return ex.map(v => v / z); };
    const draw = () => {
      const w = weights(q);
      el.innerHTML = `<div class="w-head"><strong>Query word:</strong><label class="w-chip ${causal ? 'on' : ''}"><input type="checkbox" data-c ${causal ? 'checked' : ''}> Causal mask (GPT-style)</label></div>
      <div class="ml-toks">${tok.map((t, j) => `<button type="button" data-tok="${j}" class="${j === q ? 'q' : ''}" style="--w:${w[j].toFixed(3)}"><span>${esc(t)}</span><small>${(w[j] * 100).toFixed(0)}%</small></button>`).join('')}</div>
      <div class="w-tablewrap"><table class="w-table ml-heat"><thead><tr><th></th>${tok.map(t => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${tok.map((t, i) => { const r = weights(i); return `<tr class="${i === q ? 'sel' : ''}"><th>${esc(t)}</th>${r.map(v => `<td style="background:rgba(232,80,91,${Math.min(1, v * 1.8).toFixed(2)})">${v > 0.005 ? (v * 100).toFixed(0) : ''}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>
      <p class="w-small">Each row is softmax(q·kᵀ/√d) for one query word: a probability distribution over the words. Click <b>it</b>: the model resolves the pronoun by attending to <b>animal</b>. With the causal mask, words can't see the future (upper-right triangle is zero).</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-tok]'); if (b) { q = +b.dataset.tok; draw(); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-c]')) { causal = e.target.checked; draw(); } });
    draw();
  };

  /* 15. Diffusion forward/reverse */
  T.diffusion = 'Simulation: the diffusion noise schedule';
  W.diffusion = el => {
    const N = 16, x0 = Array.from({ length: N * N }, (_, k) => { const i = k / N | 0, j = k % N, d = Math.hypot(i - 7.5, j - 7.5); const eye = (Math.hypot(i - 5.5, j - 5) < 1.4) || (Math.hypot(i - 5.5, j - 10) < 1.4), mouth = i >= 9.5 && i <= 11 && Math.abs(d - 4.6) < 0.9 && j > 3 && j < 12; return d < 7.3 ? (eye || mouth ? -1 : 0.9) : -1; });
    const g = gauss(rng(13)), eps = x0.map(() => g());
    const ab = []; let acc = 1; for (let t = 0; t < 1000; t++) { acc *= 1 - (1e-4 + (0.02 - 1e-4) * t / 999); ab.push(acc); }
    let t = 0, timer;
    const draw = () => {
      const a = ab[t], xt = x0.map((v, k) => Math.sqrt(a) * v + Math.sqrt(1 - a) * eps[k]);
      const px = v => { const c = Math.max(0, Math.min(255, Math.round((v + 1) / 2 * 255))); return `rgb(${c},${Math.round(c * 0.92)},${Math.round(c * 0.55 + 40)})`; };
      el.innerHTML = `<label class="w-field">Timestep t = <b>${t}</b> / 999<input type="range" min="0" max="999" step="1" value="${t}" data-t></label>
      <div class="ml-split"><div class="ml-img" style="grid-template-columns:repeat(${N},1fr)">${xt.map(v => `<i style="background:${px(v)}"></i>`).join('')}</div>
      <div class="ml-side"><div class="w-card"><span class="w-label">x_t = √ᾱ·x₀ + √(1−ᾱ)·ε</span><div class="ml-snr"><span>signal √ᾱ</span><div class="ag-hbar"><i style="width:${Math.sqrt(a) * 100}%"></i><span>${Math.sqrt(a).toFixed(3)}</span></div><span>noise √(1−ᾱ)</span><div class="ag-hbar"><i style="width:${Math.sqrt(1 - a) * 100}%;background:var(--muted)"></i><span>${Math.sqrt(1 - a).toFixed(3)}</span></div></div></div>
      <div class="w-nav"><button type="button" data-dif="fwd">▶ Add noise (forward)</button><button type="button" class="primary" data-dif="rev">◀ Denoise (reverse)</button></div>
      <p class="w-small">Training teaches a network to predict ε from x_t and t. Generation runs the reverse process from pure noise. (Here the "denoiser" is perfect because we know x₀; a real model must learn it.)</p></div></div>`;
    };
    const anim = dir => { clearInterval(timer); timer = setInterval(() => { t = Math.max(0, Math.min(999, t + dir * 25)); draw(); if (t === 0 || t === 999) clearInterval(timer); }, 40); };
    el.addEventListener('input', e => { if (e.target.matches('[data-t]')) { clearInterval(timer); t = +e.target.value; draw(); keepFocus(el, '[data-t]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-dif]'); if (b) anim(b.dataset.dif === 'fwd' ? 1 : -1); });
    draw();
  };

  /* 16. Gridworld Q-learning */
  T.gridworld = 'Simulation: Q-learning in a gridworld';
  W.gridworld = el => {
    const R = 5, Cc = 5, goal = [0, 4], pit = [1, 4], walls = ['1,1', '2,1', '3,3'], start = [4, 0], A = [[-1, 0], [0, 1], [1, 0], [0, -1]], AR = ['↑', '→', '↓', '←'];
    let Q, eps = 0.2, eps_n = 0, r, steps = 0, lastPath = [];
    const reset = () => { Q = Array.from({ length: R * Cc }, () => [0, 0, 0, 0]); eps_n = 0; r = rng(3); lastPath = []; steps = 0; };
    const id = (i, j) => i * Cc + j, term = (i, j) => (i === goal[0] && j === goal[1]) || (i === pit[0] && j === pit[1]);
    const episode = () => { let [i, j] = start, n = 0; lastPath = [[i, j]]; while (!term(i, j) && n++ < 100) { const s = id(i, j), q = Q[s]; const a = r() < eps || q.every(v => v === q[0]) ? Math.floor(r() * 4) : q.indexOf(Math.max(...q)); let ni = i + A[a][0], nj = j + A[a][1]; if (ni < 0 || nj < 0 || ni >= R || nj >= Cc || walls.includes(`${ni},${nj}`)) { ni = i; nj = j; } const rew = ni === goal[0] && nj === goal[1] ? 1 : ni === pit[0] && nj === pit[1] ? -1 : -0.01; const tgt = term(ni, nj) ? rew : rew + 0.9 * Math.max(...Q[id(ni, nj)]); q[a] += 0.5 * (tgt - q[a]); i = ni; j = nj; lastPath.push([i, j]); steps++; } eps_n++; };
    const draw = () => {
      el.innerHTML = `<div class="w-head"><label class="w-field inline">ε (explore) <input type="range" min="0" max="0.6" step="0.05" value="${eps}" data-eps> <b>${eps.toFixed(2)}</b></label><div class="w-nav"><button type="button" class="primary" data-gw="1">Run 1 episode</button><button type="button" data-gw="50">Run 50</button><button type="button" data-gw="reset">↺</button></div></div>
      <div class="ml-split"><div class="ml-gw" style="grid-template-columns:repeat(${Cc},1fr)">${Array.from({ length: R * Cc }, (_, k) => { const i = k / Cc | 0, j = k % Cc, key = `${i},${j}`, v = Math.max(...Q[k]), onPath = lastPath.some(p => p[0] === i && p[1] === j);
        if (walls.includes(key)) return '<i class="wall"></i>'; if (i === goal[0] && j === goal[1]) return '<i class="goal">🏁<small>+1</small></i>'; if (i === pit[0] && j === pit[1]) return '<i class="pit">🔥<small>−1</small></i>';
        return `<i class="${onPath ? 'path' : ''}" style="--v:${Math.max(0, v).toFixed(2)}">${i === start[0] && j === start[1] ? '<b>🤖</b>' : ''}<span>${Q[k].some(x => x !== 0) ? AR[Q[k].indexOf(v)] : ''}</span><small>${v ? v.toFixed(2) : ''}</small></i>`; }).join('')}</div>
      <div class="ml-side"><div class="ag-stats"><div><b>${eps_n}</b><small>episodes</small></div><div><b>${lastPath.length ? lastPath.length - 1 : '-'}</b><small>steps last episode</small></div></div><p class="w-small">Green intensity = max Q-value, arrows = greedy policy, outline = last episode's path. Values spread backwards from the goal one update at a time. Optimal path: 8 steps.</p></div></div>`;
    };
    reset();
    el.addEventListener('input', e => { if (e.target.matches('[data-eps]')) { eps = +e.target.value; e.target.nextElementSibling.textContent = eps.toFixed(2); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-gw]'); if (!b) return; if (b.dataset.gw === 'reset') reset(); else for (let k = 0; k < +b.dataset.gw; k++) episode(); draw(); });
    draw();
  };
})();
