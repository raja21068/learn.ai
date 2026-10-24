/* Interactive widgets for the Deep Learning course. Registers into window.WIDGETS. */
(() => {
  'use strict';
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, l]) => `<button type="button" data-${name}="${v}" class="${String(v) === String(active) ? 'on' : ''}" aria-pressed="${String(v) === String(active)}">${l}</button>`).join('')}</div>`;
  const keepFocus = (el, sel) => { const n = el.querySelector(sel); if (n) n.focus(); };
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = r => () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* 1. Data-model-loss-optimizer loop */
  T.dlloop = 'Explore: the four components of learning';
  W.dlloop = el => {
    const S = [['📦', 'Data', 'Examples with features (and labels): 60,000 images of handwritten digits, each 28×28 pixels with a label 0–9.', 'X: (60000, 784), y: (60000,)'], ['🧠', 'Model', 'A parameterized function. Here, a 2-layer MLP with ~100k weights that maps pixels to 10 scores.', 'ŷ = W₂·ReLU(W₁x + b₁) + b₂'], ['🎯', 'Objective', 'A loss measuring how wrong the model is: cross-entropy between predicted probabilities and true labels.', 'L = −log softmax(ŷ)[y]'], ['🧭', 'Optimizer', 'Adjusts parameters to reduce the loss: minibatch SGD computes gradients with backprop and steps downhill.', 'θ ← θ − η ∇θ L']];
    let i = 0, epoch = 0, timer;
    const draw = () => {
      const loss = (2.3 * Math.exp(-epoch / 3) + 0.08).toFixed(2), acc = Math.min(98.5, 10 + 88 * (1 - Math.exp(-epoch / 2.5))).toFixed(1);
      el.innerHTML = `<div class="dl-loop">${S.map((s, k) => `<button type="button" data-s="${k}" class="${k === i ? 'on' : ''}"><b>${s[0]}</b><span>${s[1]}</span></button>`).join('<em>→</em>')}<em>↺</em></div>
      <div class="w-card"><span class="w-label">${S[i][1]}</span><p>${esc(S[i][2])}</p><code>${esc(S[i][3])}</code></div>
      <div class="w-nav"><button type="button" class="primary" data-train>▶ Train 10 epochs</button><span class="w-meter">epoch ${epoch} · loss ${loss} · accuracy ${acc}%</span></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) { i = +b.dataset.s; draw(); } if (e.target.closest('[data-train]')) { clearInterval(timer); epoch = 0; timer = setInterval(() => { epoch++; i = (i + 1) % 4; draw(); if (epoch >= 10) clearInterval(timer); }, 350); } });
    draw();
  };

  /* 2. Broadcasting visualizer */
  T.broadcasting = 'Interactive: tensor broadcasting';
  W.broadcasting = el => {
    let a = [3, 1], b = [1, 4];
    const bshape = () => { const n = Math.max(a.length, b.length), A = Array(n - a.length).fill(1).concat(a), B = Array(n - b.length).fill(1).concat(b), out = []; for (let i = 0; i < n; i++) { if (A[i] === B[i] || A[i] === 1 || B[i] === 1) out.push(Math.max(A[i], B[i])); else return null; } return out; };
    const grid = (r, c, cls, fn) => `<div class="dl-mat" style="grid-template-columns:repeat(${c},1fr)">${Array.from({ length: r * c }, (_, k) => `<i class="${fn(k / c | 0, k % c)}">${cls(k / c | 0, k % c)}</i>`).join('')}</div>`;
    const draw = () => {
      const out = bshape(), ar = a.length === 2 ? a : [1, a[0]], br = b.length === 2 ? b : [1, b[0]];
      el.innerHTML = `<div class="w-head">${['a', 'b'].map(n => `<label class="w-field inline">${n} shape (<input data-${n}="0" type="number" min="1" max="5" value="${(n === 'a' ? a : b)[0]}">, <input data-${n}="1" type="number" min="1" max="5" value="${(n === 'a' ? a : b)[1]}">)</label>`).join('')}</div>
      <div class="dl-bc"><div><span class="w-label">a ${JSON.stringify(a)}</span>${grid(ar[0], ar[1], (r, c) => r * ar[1] + c, () => 'a')}</div><b>+</b><div><span class="w-label">b ${JSON.stringify(b)}</span>${grid(br[0], br[1], (r, c) => (r * br[1] + c) * 10, () => 'b')}</div><b>=</b>
      <div>${out ? `<span class="w-label">result ${JSON.stringify(out)}</span>${grid(out[0], out[1], (r, c) => (ar[0] === 1 ? 0 : r) * ar[1] + (ar[1] === 1 ? 0 : c) + ((br[0] === 1 ? 0 : r) * br[1] + (br[1] === 1 ? 0 : c)) * 10, (r, c) => (ar[0] === 1 && r > 0) || (ar[1] === 1 && c > 0) || (br[0] === 1 && r > 0) || (br[1] === 1 && c > 0) ? 'stretched' : 'res')}` : '<p class="w-status bad">✗ Shapes are incompatible: dimensions must be equal or 1.</p>'}</div></div>
      <p class="w-small">Rule: compare shapes from the right; each pair of dimensions must be equal or one of them must be 1, which gets stretched (shaded) without copying memory.</p>`;
    };
    el.addEventListener('change', e => { const t = e.target; const v = Math.max(1, Math.min(5, +t.value || 1)); if (t.dataset.a != null) a[+t.dataset.a] = v; if (t.dataset.b != null) b[+t.dataset.b] = v; draw(); });
    draw();
  };

  /* 3. Linear regression SGD */
  T.linreg = 'Simulation: minibatch SGD fitting a line';
  W.linreg = el => {
    const r = rng(4), g = gauss(r), pts = Array.from({ length: 40 }, () => { const x = r() * 10; return [x, 1.5 * x + 2 + g() * 1.6]; });
    let w = 0, b = 0, lr = 0.01, bs = 4, wd = 0, step = 0, hist = [], timer;
    const loss = () => pts.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / pts.length / 2;
    const sgd = () => { const batch = Array.from({ length: bs }, () => pts[Math.floor(r() * pts.length)]); let gw = 0, gb = 0; batch.forEach(([x, y]) => { const e = w * x + b - y; gw += e * x; gb += e; }); w -= lr * (gw / bs + wd * w); b -= lr * gb / bs; step++; hist.push(loss()); };
    const draw = () => {
      const X = x => 30 + x * 52, Y = y => 190 - y * 9;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">lr <input type="range" min="0.001" max="0.03" step="0.001" value="${lr}" data-lr> <b>${lr}</b></label><label class="w-field inline">batch <input type="range" min="1" max="40" value="${bs}" data-bs> <b>${bs}</b></label><label class="w-field inline">weight decay <input type="range" min="0" max="2" step="0.1" value="${wd}" data-wd> <b>${wd}</b></label><div class="w-nav"><button type="button" class="primary" data-go>▶ Train</button><button type="button" data-rs>↺</button></div></div>
      <div class="ml-split"><svg viewBox="0 0 580 200" class="w-svg">${pts.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="3.5" fill="var(--muted)"/>`).join('')}<line x1="${X(0)}" y1="${Y(b)}" x2="${X(10)}" y2="${Y(w * 10 + b)}" stroke="var(--accent)" stroke-width="3"/></svg>
      <svg viewBox="0 0 200 120" class="w-svg"><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${hist.map((l, k) => `${10 + k / Math.max(1, hist.length - 1) * 180},${110 - Math.min(1, l / 50) * 100}`).join(' ')}"/><text x="100" y="12" text-anchor="middle" font-size="10" fill="var(--muted)">loss over steps</text></svg></div>
      <div class="ag-stats"><div><b>${w.toFixed(2)}</b><small>w (true 1.5)</small></div><div><b>${b.toFixed(2)}</b><small>b (true 2)</small></div><div><b>${loss().toFixed(2)}</b><small>loss after ${step} steps</small></div></div>
      <p class="w-small">Small batches give noisy, cheap steps; large batches give smooth, costly ones. Too high a learning rate oscillates. Strong weight decay pulls w toward 0 and underfits.</p>`;
    };
    el.addEventListener('input', e => { const t = e.target; if (t.matches('[data-lr]')) lr = +t.value; if (t.matches('[data-bs]')) bs = +t.value; if (t.matches('[data-wd]')) wd = +t.value; if (t.matches('input[type=range]')) { draw(); keepFocus(el, `[${[...t.attributes].find(x => x.name.startsWith('data-')).name}]`); } });
    el.addEventListener('click', e => { if (e.target.closest('[data-go]')) { clearInterval(timer); let n = 0; timer = setInterval(() => { for (let k = 0; k < 5; k++) sgd(); draw(); if ((n += 5) >= 300) clearInterval(timer); }, 30); } if (e.target.closest('[data-rs]')) { clearInterval(timer); w = b = 0; step = 0; hist = []; draw(); } });
    draw();
  };

  /* 4. Softmax & cross-entropy */
  T.softmax = 'Interactive: softmax and cross-entropy';
  W.softmax = el => {
    const C = ['cat', 'dog', 'bird', 'fish'];
    let z = [2.0, 1.0, 0.2, -1.0], y = 0, temp = 1;
    const draw = () => {
      const m = Math.max(...z.map(v => v / temp)), e = z.map(v => Math.exp(v / temp - m)), s = e.reduce((a, b) => a + b, 0), p = e.map(v => v / s), loss = -Math.log(p[y]);
      el.innerHTML = `<div class="dl-soft">${C.map((c, k) => `<div class="${k === y ? 'true' : ''}"><label class="w-field">logit "${c}": <b>${z[k].toFixed(1)}</b><input type="range" min="-4" max="6" step="0.1" value="${z[k]}" data-z="${k}"></label><div class="ag-hbar"><i style="width:${p[k] * 100}%"></i><span>${(p[k] * 100).toFixed(1)}%</span></div><button type="button" data-y="${k}" class="w-chip ${k === y ? 'on' : ''}">${k === y ? '✓ true label' : 'set as label'}</button><small>∂L/∂z = ${(p[k] - (k === y ? 1 : 0)).toFixed(3)}</small></div>`).join('')}</div>
      <label class="w-field inline">Temperature <input type="range" min="0.2" max="4" step="0.1" value="${temp}" data-t> <b>${temp}</b></label>
      <div class="ag-stats"><div><b>${loss.toFixed(3)}</b><small>cross-entropy loss</small></div><div><b>${C[p.indexOf(Math.max(...p))]}</b><small>prediction</small></div></div>
      <p class="w-small">Gradient = probability − (1 if true class): raise the true logit and the loss falls. Adding the same constant to every logit changes nothing (shift invariance), which is why subtracting the max is safe.</p>`;
    };
    el.addEventListener('input', e => { const k = e.target.dataset.z; if (k != null) { z[+k] = +e.target.value; draw(); keepFocus(el, `[data-z="${k}"]`); } if (e.target.matches('[data-t]')) { temp = +e.target.value; draw(); keepFocus(el, '[data-t]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-y]'); if (b) { y = +b.dataset.y; draw(); } });
    draw();
  };

  /* 5. MLP playground (trains a tiny MLP in JS) */
  T.playground = 'Playground: train a tiny MLP in your browser';
  W.playground = el => {
    let H = 8, act = 'relu', ds = 'circle', net, epoch = 0, timer, lossV = 0;
    const r0 = rng(21);
    const data = () => { const r = rng(ds.length * 13), g = gauss(r), pts = []; for (let i = 0; i < 160; i++) { if (ds === 'circle') { const rad = i % 2 ? 0.5 + r() * 0.3 : r() * 0.3, a = r() * 6.283; pts.push([rad * Math.cos(a), rad * Math.sin(a), i % 2]); } else if (ds === 'xor') { const x = r() * 2 - 1, y2 = r() * 2 - 1; pts.push([x, y2, x * y2 > 0 ? 1 : 0]); } else { const t = (i >> 1) / 80 * 3.5, k = i % 2; pts.push([t / 3.5 * Math.cos(t * 2 + k * Math.PI) * 0.9 + g() * 0.03, t / 3.5 * Math.sin(t * 2 + k * Math.PI) * 0.9 + g() * 0.03, k]); } } return pts; };
    let D = data();
    const f = v => act === 'relu' ? Math.max(0, v) : act === 'tanh' ? Math.tanh(v) : 1 / (1 + Math.exp(-v));
    const df = (v, a) => act === 'relu' ? (v > 0 ? 1 : 0) : act === 'tanh' ? 1 - a * a : a * (1 - a);
    const init = () => { const g = gauss(r0); net = { W1: Array.from({ length: H }, () => [g() * 1.2, g() * 1.2]), b1: Array(H).fill(0).map(() => g() * 0.1), W2: Array.from({ length: H }, () => g() * 0.5), b2: 0 }; epoch = 0; };
    const fwd = (x, y) => { const z = net.W1.map((w, j) => w[0] * x + w[1] * y + net.b1[j]), h = z.map(f), o = h.reduce((s, v, j) => s + v * net.W2[j], net.b2); return { z, h, p: 1 / (1 + Math.exp(-o)) }; };
    const train = () => { const lr = 0.15; let L = 0; for (const [x, y, t] of D) { const { z, h, p } = fwd(x, y); L += -(t ? Math.log(p + 1e-9) : Math.log(1 - p + 1e-9)); const d = p - t; for (let j = 0; j < H; j++) { const dh = d * net.W2[j] * df(z[j], h[j]); net.W2[j] -= lr * d * h[j]; net.W1[j][0] -= lr * dh * x; net.W1[j][1] -= lr * dh * y; net.b1[j] -= lr * dh; } net.b2 -= lr * d; } lossV = L / D.length; epoch++; };
    const draw = () => {
      const cells = []; const S = 26; for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) { const x = -1 + (j + 0.5) / S * 2, y = 1 - (i + 0.5) / S * 2, p = fwd(x, y).p; cells.push(`<rect x="${j * 300 / S}" y="${i * 300 / S}" width="${300 / S + 0.5}" height="${300 / S + 0.5}" fill="${p > 0.5 ? '#e8505b' : '#3d6df2'}" opacity="${(Math.abs(p - 0.5) * 0.8 + 0.05).toFixed(2)}"/>`); }
      const acc = D.filter(([x, y, t]) => (fwd(x, y).p > 0.5) === !!t).length / D.length;
      el.innerHTML = `<div class="w-head">${seg('ds', [['circle', 'Circle'], ['xor', 'XOR'], ['spiral', 'Spiral']], ds)}${seg('act', [['relu', 'ReLU'], ['tanh', 'tanh'], ['sigmoid', 'sigmoid']], act)}<label class="w-field inline">hidden units <input type="range" min="1" max="24" value="${H}" data-h> <b>${H}</b></label></div>
      <div class="ml-split"><svg viewBox="0 0 300 300" class="ml-plot" style="max-width:340px">${cells.join('')}${D.map(([x, y, t]) => `<circle cx="${(x + 1) * 150}" cy="${(1 - y) * 150}" r="3.5" fill="${t ? '#e8505b' : '#3d6df2'}" stroke="#fff" stroke-width="1"/>`).join('')}</svg>
      <div class="ml-side"><div class="ag-stats"><div><b>${epoch}</b><small>epochs</small></div><div><b>${lossV.toFixed(3)}</b><small>loss</small></div><div><b>${(acc * 100).toFixed(0)}%</b><small>accuracy</small></div></div><div class="w-nav"><button type="button" class="primary" data-go>▶ Train 150 epochs</button><button type="button" data-rs>↺ Re-init</button></div><p class="w-small">A 2 → ${H} → 1 network trained with full SGD and backprop, live in JavaScript. One hidden unit can only draw a straight-ish boundary; more units can carve circles and spirals.</p></div></div>`;
    };
    init();
    el.addEventListener('click', e => { const d = e.target.closest('[data-ds]'), a = e.target.closest('[data-act]'); if (d) { ds = d.dataset.ds; D = data(); init(); draw(); } if (a) { act = a.dataset.act; init(); draw(); } if (e.target.closest('[data-rs]')) { clearInterval(timer); init(); draw(); } if (e.target.closest('[data-go]')) { clearInterval(timer); let n = 0; timer = setInterval(() => { for (let k = 0; k < 5; k++) train(); draw(); if ((n += 5) >= 150) clearInterval(timer); }, 30); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-h]')) { H = +e.target.value; init(); draw(); keepFocus(el, '[data-h]'); } });
    draw();
  };

  /* 6. Parameter counter */
  T.paramcount = 'Interactive: build a network, count its parameters';
  W.paramcount = el => {
    let layers = [['Linear', 784, 256], ['ReLU'], ['Dropout'], ['Linear', 256, 10]];
    const P = l => l[0] === 'Linear' ? l[1] * l[2] + l[2] : 0;
    const draw = () => {
      const total = layers.reduce((s, l) => s + P(l), 0);
      el.innerHTML = `<div class="dl-layers">${layers.map((l, i) => `<div><b>${l[0]}</b>${l[0] === 'Linear' ? `<input type="number" data-i="${i}" data-k="1" value="${l[1]}" aria-label="in"> → <input type="number" data-i="${i}" data-k="2" value="${l[2]}" aria-label="out">` : ''}<span>${P(l).toLocaleString()} params</span><button type="button" class="ag-x" data-del="${i}">✕</button></div>`).join('')}</div>
      <div class="w-nav"><button type="button" data-add="Linear">+ Linear</button><button type="button" data-add="ReLU">+ ReLU</button><button type="button" data-add="Dropout">+ Dropout</button><span class="w-meter">total ${total.toLocaleString()} parameters · ${(total * 4 / 2 ** 20).toFixed(2)} MB in fp32</span></div>
      <p class="w-small">Linear(in, out) has in × out weights + out biases. Activations and dropout have none. Edit sizes; keep consecutive Linear layers compatible (one\'s out = next\'s in).</p>`;
    };
    el.addEventListener('change', e => { const i = e.target.dataset.i; if (i != null) { layers[+i][+e.target.dataset.k] = Math.max(1, +e.target.value || 1); draw(); } });
    el.addEventListener('click', e => { const d = e.target.closest('[data-del]'); if (d) { layers.splice(+d.dataset.del, 1); draw(); } const a = e.target.closest('[data-add]'); if (a) { const last = [...layers].reverse().find(l => l[0] === 'Linear'); layers.push(a.dataset.add === 'Linear' ? ['Linear', last ? last[2] : 64, 64] : [a.dataset.add]); draw(); } });
    draw();
  };

  /* 7. Convolution shapes */
  T.convshape = 'Interactive: padding, stride and the sliding window';
  W.convshape = el => {
    let n = 7, k = 3, p = 1, s = 2, pos = 0, timer;
    const draw = () => {
      const o = Math.floor((n - k + 2 * p) / s) + 1, N = n + 2 * p, oi = Math.floor(pos / o), oj = pos % o;
      el.innerHTML = `<div class="ml-grid4">${[['n', 'input size n', n, 3, 12], ['k', 'kernel k', k, 1, 7], ['p', 'padding p', p, 0, 3], ['s', 'stride s', s, 1, 4]].map(([key, l, v, mn, mx]) => `<label class="w-field">${l}: <b>${v}</b><input type="range" min="${mn}" max="${mx}" value="${v}" data-v="${key}"></label>`).join('')}</div>
      ${o >= 1 ? `<div class="dl-conv"><div><span class="w-label">padded input ${N}×${N}</span><div class="dl-cells" style="grid-template-columns:repeat(${N},1fr)">${Array.from({ length: N * N }, (_, q) => { const r = q / N | 0, c = q % N, pad = r < p || c < p || r >= N - p || c >= N - p, inWin = r >= oi * s && r < oi * s + k && c >= oj * s && c < oj * s + k; return `<i class="${pad ? 'pad' : ''} ${inWin ? 'win' : ''}"></i>`; }).join('')}</div></div>
      <div><span class="w-label">output ${o}×${o}</span><div class="dl-cells out" style="grid-template-columns:repeat(${o},1fr)">${Array.from({ length: o * o }, (_, q) => `<i class="${q === pos ? 'win' : q < pos ? 'done' : ''}"></i>`).join('')}</div></div></div>
      <pre class="snip">out = ⌊(n − k + 2p) / s⌋ + 1 = ⌊(${n} − ${k} + ${2 * p}) / ${s}⌋ + 1 = ${o}</pre>` : '<p class="w-status bad">Kernel larger than the padded input: no valid output.</p>'}
      <div class="w-nav"><button type="button" class="primary" data-play>▶ Slide</button></div>`;
    };
    el.addEventListener('input', e => { const key = e.target.dataset.v; if (key) { ({ n: () => n = +e.target.value, k: () => k = +e.target.value, p: () => p = +e.target.value, s: () => s = +e.target.value })[key](); pos = 0; draw(); keepFocus(el, `[data-v="${key}"]`); } });
    el.addEventListener('click', e => { if (e.target.closest('[data-play]')) { clearInterval(timer); pos = 0; const o = Math.floor((n - k + 2 * p) / s) + 1; timer = setInterval(() => { draw(); pos++; if (pos >= o * o) { clearInterval(timer); pos = o * o - 1; } }, 260); } });
    draw();
  };

  /* 8. CNN architecture timeline */
  T.cnnzoo = 'Explore: a decade of CNN architectures';
  W.cnnzoo = el => {
    const A = [['LeNet', 1998, 0.06, null, 'Conv + pooling + dense; read handwritten digits.'], ['AlexNet', 2012, 61, 16.4, 'GPUs, ReLU, dropout, data augmentation; won ImageNet by a wide margin.'], ['VGG-16', 2014, 138, 7.3, 'Deep stacks of repeated 3×3 conv blocks. Simple, but heavy.'], ['NiN', 2013, 7.6, 10.9, '1×1 convolutions and global average pooling replace big dense layers.'], ['GoogLeNet', 2014, 6.8, 6.7, 'Inception blocks: parallel 1×1, 3×3, 5×5 and pooling branches.'], ['ResNet-50', 2015, 25.6, 3.6, 'Residual connections make 50–152 layers trainable; BatchNorm everywhere.'], ['DenseNet-121', 2016, 8, 5.3, 'Each layer receives all previous feature maps (concatenation).'], ['RegNet / ConvNeXt', 2020, 20, 3.0, 'Designed by exploring design spaces; modernized with transformer-era tricks.']];
    let i = 5, res = true;
    const draw = () => {
      const mx = 140;
      el.innerHTML = `<div class="dl-zoo">${A.map((a, k) => `<button type="button" data-a="${k}" class="${k === i ? 'on' : ''}"><b>${a[0]}</b><small>${a[1]}</small><span class="ag-hbar"><i style="width:${Math.max(2, Math.sqrt(a[2] / mx) * 100)}%"></i><span>${a[2]}M</span></span></button>`).join('')}</div>
      <div class="w-card"><span class="w-label">${A[i][0]} (${A[i][1]}) · ${A[i][2]}M params${A[i][3] != null ? ` · ImageNet top-5 error ≈ ${A[i][3]}%` : ''}</span><p>${esc(A[i][4])}</p></div>
      <div class="w-card"><span class="w-label">Why residual connections matter</span><label class="w-chip ${res ? 'on' : ''}"><input type="checkbox" data-res ${res ? 'checked' : ''}> Residual (skip) connections</label>
      <div class="dl-grad">${Array.from({ length: 20 }, (_, l) => { const g = res ? 1 * Math.pow(0.97, l) : Math.pow(0.62, l); return `<i style="height:${Math.max(2, g * 100)}%" title="layer ${20 - l}: ${g.toExponential(1)}"></i>`; }).join('')}</div>
      <p class="w-small">Gradient magnitude reaching each layer of a 20-layer net (output on the left). Without skips it shrinks geometrically; with identity shortcuts it flows almost unchanged.</p></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { i = +b.dataset.a; draw(); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-res]')) { res = e.target.checked; draw(); } });
    draw();
  };

  /* 9. RNN unrolled + gradient flow */
  T.rnnunroll = 'Interactive: unrolling an RNN and its gradients';
  W.rnnunroll = el => {
    const seq = 'learning'.split('');
    let wh = 0.9, clip = false;
    const draw = () => {
      let h = 0; const hs = seq.map((c, t) => (h = Math.tanh(0.6 * ((c.charCodeAt(0) - 100) / 10) + wh * h)));
      const grads = Array.from({ length: 30 }, (_, t) => { let g = Math.pow(Math.abs(wh) * 1.0, t); if (clip) g = Math.min(g, 5); return g; });
      el.innerHTML = `<div class="dl-rnn">${seq.map((c, t) => `<div><b>${c}</b><span>↓</span><i style="--h:${hs[t].toFixed(2)}">h${t + 1}<small>${hs[t].toFixed(2)}</small></i>${t < seq.length - 1 ? '<em>→</em>' : ''}</div>`).join('')}</div>
      <div class="w-head"><label class="w-field inline">|W_hh| (recurrent weight scale) <input type="range" min="0.3" max="1.6" step="0.05" value="${wh}" data-w> <b>${wh.toFixed(2)}</b></label><label class="w-chip ${clip ? 'on' : ''}"><input type="checkbox" data-c ${clip ? 'checked' : ''}> Gradient clipping (θ = 5)</label></div>
      <div class="dl-grad wide">${grads.map(g => `<i style="height:${Math.max(1, Math.min(100, Math.log10(g + 1e-12) * 12 + 50))}%" class="${g > 5 ? 'hot' : g < 1e-3 ? 'cold' : ''}"></i>`).join('')}</div>
      <p class="w-status ${wh > 1.02 ? (clip ? 'warn' : 'bad') : wh < 0.98 ? 'warn' : 'good'}">Gradient after 30 steps ≈ |W|³⁰ = ${Math.pow(wh, 30).toExponential(1)}: ${wh > 1.02 ? (clip ? 'it would explode, but clipping caps it.' : 'exploding gradients.') : wh < 0.98 ? 'vanishing gradients, so early steps barely learn.' : 'stable (a narrow sweet spot, which is why gates help).'}</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-w]')) { wh = +e.target.value; draw(); keepFocus(el, '[data-w]'); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-c]')) { clip = e.target.checked; draw(); } });
    draw();
  };

  /* 10. Beam search tree */
  T.beamsearch = 'Interactive: greedy vs. beam search decoding';
  W.beamsearch = el => {
    const TB = { '': { the: 0.5, a: 0.4, my: 0.1 }, the: { cat: 0.35, dog: 0.33, end: 0.32 }, a: { cat: 0.8, dog: 0.15, end: 0.05 }, my: { dog: 0.9, cat: 0.1 } };
    let k = 1;
    const run = () => { let beams = [[[], 0]]; const levels = []; for (let d = 0; d < 2; d++) { const c = []; beams.forEach(([s, lp]) => Object.entries(TB[s.join(' ')] || {}).forEach(([t, p]) => c.push([[...s, t], lp + Math.log(p)]))); c.sort((a, b) => b[1] - a[1]); levels.push(c.map((x, i) => [...x, i < k])); beams = c.slice(0, k); } return { levels, best: beams[0] }; };
    const draw = () => {
      const { levels, best } = run();
      el.innerHTML = `<label class="w-field">Beam width k: <b>${k}${k === 1 ? ' (greedy)' : ''}</b><input type="range" min="1" max="4" value="${k}" data-k></label>
      <div class="dl-beam">${levels.map((lv, d) => `<div><span class="w-label">step ${d + 1}: ${lv.length} candidates, keep ${Math.min(k, lv.length)}</span>${lv.map(([s, lp, kept]) => `<span class="${kept ? 'kept' : ''}">${s.join(' ')} <small>p=${Math.exp(lp).toFixed(3)}</small></span>`).join('')}</div>`).join('')}</div>
      <p class="w-status ${best[0].join(' ') === 'a cat' ? 'good' : 'warn'}">Output: <b>"${best[0].join(' ')}"</b> with probability ${Math.exp(best[1]).toFixed(3)}. ${best[0].join(' ') === 'a cat' ? 'Beam search found the most likely sequence.' : 'Greedy took "the" (0.5), but every continuation of "the" is weak, so it missed "a cat" (0.32).'}</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-k]')) { k = +e.target.value; draw(); keepFocus(el, '[data-k]'); } });
    draw();
  };

  /* 11. Positional encoding heatmap */
  T.posenc = 'Interactive: sinusoidal positional encodings';
  W.posenc = el => {
    let n = 40, d = 32, hp = 10;
    const draw = () => {
      const P = (pos, j) => { const i = Math.floor(j / 2), v = pos / Math.pow(10000, 2 * i / d); return j % 2 ? Math.cos(v) : Math.sin(v); };
      const cell = 300 / Math.max(n, d);
      const dot = q => Array.from({ length: d }, (_, j) => P(hp, j) * P(q, j)).reduce((a, b) => a + b, 0);
      const dots = Array.from({ length: n }, (_, q) => dot(q)), mx = Math.max(...dots);
      el.innerHTML = `<div class="w-head"><label class="w-field inline">positions <input type="range" min="10" max="80" value="${n}" data-n> <b>${n}</b></label><label class="w-field inline">dimensions d <input type="range" min="8" max="64" step="8" value="${d}" data-d> <b>${d}</b></label><label class="w-field inline">compare position <input type="range" min="0" max="${n - 1}" value="${Math.min(hp, n - 1)}" data-p> <b>${hp}</b></label></div>
      <svg viewBox="0 0 ${d * cell + 10} ${n * cell + 10}" class="w-svg" style="max-height:300px">${Array.from({ length: n * d }, (_, q) => { const pos = q / d | 0, j = q % d, v = P(pos, j); return `<rect x="${j * cell}" y="${pos * cell}" width="${cell}" height="${cell}" fill="${v >= 0 ? '#e8505b' : '#3d6df2'}" opacity="${Math.abs(v).toFixed(2)}"/>`; }).join('')}<rect x="0" y="${hp * cell}" width="${d * cell}" height="${cell}" fill="none" stroke="var(--ink)" stroke-width="1.5"/></svg>
      <div class="dl-sim">${dots.map((v, q) => `<i style="height:${Math.max(2, (v / mx) * 100)}%" class="${q === hp ? 'me' : ''}"></i>`).join('')}</div>
      <p class="w-small">Rows = positions, columns = dimensions. Low dimensions oscillate fast, high ones slowly, like the hands of a clock. Bottom: the dot product between position ${hp}\'s encoding and every other position. Nearby positions are most similar, so relative distance is easy to read off.</p>`;
    };
    el.addEventListener('input', e => { const t = e.target; if (t.matches('[data-n]')) { n = +t.value; hp = Math.min(hp, n - 1); } if (t.matches('[data-d]')) d = +t.value; if (t.matches('[data-p]')) hp = +t.value; if (t.matches('input[type=range]')) { draw(); keepFocus(el, `[${[...t.attributes].find(x => x.name.startsWith('data-')).name}]`); } });
    draw();
  };

  /* 12. LR schedules */
  T.lrschedule = 'Interactive: learning-rate schedules';
  W.lrschedule = el => {
    let warm = 10, kind = 'cosine';
    const total = 100, base = 1;
    const lr = s => { if (s < warm) return base * (s + 1) / warm; const p = (s - warm) / Math.max(1, total - warm); return kind === 'cosine' ? 0.5 * base * (1 + Math.cos(Math.PI * p)) : kind === 'step' ? base * Math.pow(0.3, Math.floor(p * 3)) : kind === 'poly' ? base * Math.pow(1 - p, 2) : kind === 'onecycle' ? (p < 0.4 ? base * (0.4 + 0.6 * p / 0.4) * 1.5 : base * 1.5 * (1 - (p - 0.4) / 0.6)) : base; };
    const draw = () => {
      el.innerHTML = `<div class="w-head">${seg('k', [['const', 'Constant'], ['step', 'Step decay'], ['poly', 'Polynomial'], ['cosine', 'Cosine'], ['onecycle', 'One-cycle']], kind)}<label class="w-field inline">warmup steps <input type="range" min="0" max="40" value="${warm}" data-w> <b>${warm}</b></label></div>
      <svg viewBox="0 0 600 200" class="w-svg"><line x1="40" y1="180" x2="580" y2="180" stroke="var(--line-strong)"/><line x1="40" y1="20" x2="40" y2="180" stroke="var(--line-strong)"/>${warm ? `<rect x="40" y="20" width="${warm / total * 540}" height="160" fill="var(--warn-soft)"/><text x="${44}" y="34" font-size="10" fill="var(--muted)">warmup</text>` : ''}
        <polyline fill="none" stroke="var(--accent)" stroke-width="3" points="${Array.from({ length: total + 1 }, (_, s) => `${40 + s / total * 540},${180 - Math.min(1.5, lr(s)) / 1.5 * 155}`).join(' ')}"/><text x="310" y="196" text-anchor="middle" font-size="10" fill="var(--muted)">training steps →</text></svg>
      <p class="w-small">Warmup avoids big unstable updates while statistics (Adam\'s moments, batch norm) are still poorly estimated. Decay lets the model settle into a minimum. Cosine with warmup is the default for transformers; one-cycle trains quickly with large peak rates.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { kind = b.dataset.k; draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-w]')) { warm = +e.target.value; draw(); keepFocus(el, '[data-w]'); } });
    draw();
  };

  /* 13. Data parallel speedup */
  T.dataparallel = 'Simulation: data-parallel speedup vs. communication';
  W.dataparallel = el => {
    let comm = 0.15, batch = 256;
    const draw = () => {
      const comp1 = batch / 256, sp = n => comp1 / (comp1 / n + comm * (n > 1 ? Math.log2(n) * 0.5 + 0.5 : 0));
      const ns = [1, 2, 4, 8, 16, 32], X = i => 60 + i * 100, Y = v => 180 - v / 32 * 160;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">communication cost <input type="range" min="0" max="0.6" step="0.01" value="${comm}" data-c> <b>${comm.toFixed(2)}</b></label><label class="w-field inline">batch size <input type="range" min="64" max="2048" step="64" value="${batch}" data-b> <b>${batch}</b></label></div>
      <svg viewBox="0 0 620 200" class="w-svg"><polyline fill="none" stroke="var(--line-strong)" stroke-dasharray="4 3" points="${ns.map((n, i) => `${X(i)},${Y(n)}`).join(' ')}"/><polyline fill="none" stroke="var(--accent)" stroke-width="3" points="${ns.map((n, i) => `${X(i)},${Y(sp(n))}`).join(' ')}"/>${ns.map((n, i) => `<circle cx="${X(i)}" cy="${Y(sp(n))}" r="4.5" fill="var(--accent)"/><text x="${X(i)}" y="196" text-anchor="middle" font-size="11" fill="var(--muted)">${n} GPU${n > 1 ? 's' : ''}</text><text x="${X(i)}" y="${Y(sp(n)) - 10}" text-anchor="middle" font-size="10.5" fill="var(--ink)">${sp(n).toFixed(1)}×</text>`).join('')}</svg>
      <p class="w-small">Dashed = ideal linear speedup. Each step, GPUs compute on their shard in parallel, then all-reduce the gradients, and that communication doesn\'t shrink with more GPUs. Bigger batches (more compute per sync) and faster interconnects (NVLink) push the curve toward ideal.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-c]')) { comm = +e.target.value; draw(); keepFocus(el, '[data-c]'); } if (e.target.matches('[data-b]')) { batch = +e.target.value; draw(); keepFocus(el, '[data-b]'); } });
    draw();
  };

  /* 14. NMS */
  T.nms = 'Interactive: non-maximum suppression';
  W.nms = el => {
    const B = [[40, 40, 150, 160, 0.95, 'dog'], [50, 50, 160, 165, 0.88, 'dog'], [35, 60, 140, 170, 0.71, 'dog'], [200, 70, 300, 170, 0.91, 'cat'], [210, 60, 310, 160, 0.67, 'cat'], [120, 90, 230, 170, 0.42, 'dog']];
    let th = 0.5, minScore = 0.3;
    const iou = (a, b) => { const w = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])), h = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1])), i = w * h; return i / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i); };
    const draw = () => {
      let order = B.map((_, i) => i).filter(i => B[i][4] >= minScore).sort((a, b) => B[b][4] - B[a][4]); const keep = [];
      while (order.length) { const i = order.shift(); keep.push(i); order = order.filter(j => iou(B[i], B[j]) <= th); }
      el.innerHTML = `<div class="w-head"><label class="w-field inline">IoU threshold <input type="range" min="0.1" max="0.95" step="0.05" value="${th}" data-t> <b>${th.toFixed(2)}</b></label><label class="w-field inline">min score <input type="range" min="0" max="0.9" step="0.05" value="${minScore}" data-m> <b>${minScore.toFixed(2)}</b></label></div>
      <svg viewBox="0 0 340 200" class="w-svg" style="max-height:280px"><rect width="340" height="200" fill="var(--bg-soft)" rx="10"/><text x="95" y="120" font-size="54" text-anchor="middle">🐕</text><text x="255" y="130" font-size="50" text-anchor="middle">🐈</text>
        ${B.map((b, i) => { const k = keep.includes(i); return `<g opacity="${k ? 1 : 0.35}"><rect x="${b[0]}" y="${b[1]}" width="${b[2] - b[0]}" height="${b[3] - b[1]}" fill="none" stroke="${k ? (b[5] === 'dog' ? '#e8505b' : '#3d6df2') : 'var(--muted)'}" stroke-width="${k ? 3 : 1.5}" stroke-dasharray="${k ? '' : '4 3'}"/><text x="${b[0] + 3}" y="${b[1] - 4}" font-size="10" fill="var(--ink)">${b[5]} ${b[4]}</text></g>`; }).join('')}</svg>
      <p class="w-small">Kept ${keep.length} of ${B.length} boxes (solid). NMS keeps the highest-scoring box, removes others that overlap it with IoU above the threshold, and repeats. Too low a threshold can delete nearby real objects; too high leaves duplicates.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-t]')) { th = +e.target.value; draw(); keepFocus(el, '[data-t]'); } if (e.target.matches('[data-m]')) { minScore = +e.target.value; draw(); keepFocus(el, '[data-m]'); } });
    draw();
  };

  /* 15. BPE merges */
  T.bpe = 'Step through: byte-pair encoding merges';
  W.bpe = el => {
    const V0 = { 'r a t </w>': 5, 'r a t s </w>': 2, 'c a t </w>': 6, 'c a t s </w>': 3, 'c a r </w>': 4, 'b a t s </w>': 2 };
    let vocab = { ...V0 }, merges = [];
    const pairs = v => { const c = {}; Object.entries(v).forEach(([w, f]) => { const s = w.split(' '); for (let i = 0; i < s.length - 1; i++) { const k = s[i] + ' ' + s[i + 1]; c[k] = (c[k] || 0) + f; } }); return c; };
    const merge = (p, v) => { const [a, b] = p.split(' '), out = {}; Object.entries(v).forEach(([w, f]) => { const s = w.split(' '), m = []; for (let i = 0; i < s.length; i++) { if (i < s.length - 1 && s[i] === a && s[i + 1] === b) { m.push(a + b); i++; } else m.push(s[i]); } out[m.join(' ')] = f; }); return out; };
    const draw = () => {
      const c = pairs(vocab), top = Object.entries(c).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 6);
      const tokens = new Set(Object.keys(vocab).flatMap(w => w.split(' ')));
      el.innerHTML = `<div class="ml-split" style="align-items:start"><div><span class="w-label">Corpus (word → frequency), symbols separated</span>${Object.entries(vocab).map(([w, f]) => `<div class="dl-word">${w.split(' ').map(t => `<i class="${t.length > 1 && t !== '</w>' ? 'm' : ''}">${esc(t)}</i>`).join('')}<small>×${f}</small></div>`).join('')}</div>
      <div><span class="w-label">Most frequent adjacent pairs</span>${top.map(([p, n], k) => `<div class="dl-pair ${k === 0 ? 'top' : ''}"><code>${esc(p)}</code><b>${n}</b></div>`).join('')}</div></div>
      <div class="w-nav"><button type="button" class="primary" data-m ${top.length ? '' : 'disabled'}>Merge top pair ▸</button><button type="button" data-rs>↺</button><span class="w-meter">${merges.length} merges · ${tokens.size} distinct symbols</span></div>
      <p class="w-small">Merges so far: ${merges.map(m => `<code>${esc(m.replace(' ', '+'))}</code>`).join(' → ') || '-'}. Frequent words become single tokens, while rare words still split into known pieces.</p>`;
    };
    el.addEventListener('click', e => { if (e.target.closest('[data-m]')) { const c = pairs(vocab), best = Object.entries(c).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]; if (best) { merges.push(best[0]); vocab = merge(best[0], vocab); } draw(); } if (e.target.closest('[data-rs]')) { vocab = { ...V0 }; merges = []; draw(); } });
    draw();
  };

  /* 16. Fine-tuning vs. from scratch */
  T.finetune = 'Interactive: fine-tuning vs. training from scratch';
  W.finetune = el => {
    let n = 1000;
    const draw = () => {
      const L = Math.log10(n), scratch = Math.min(93, 50 + 14 * (L - 2) ** 1.25), ft = Math.min(95, 78 + 5 * (L - 2)), cnn = Math.min(91, 55 + 11 * (L - 2) ** 1.1);
      const rows = [['Train a transformer from scratch', scratch, '#9aa6bf'], ['CNN/RNN on pretrained word vectors', cnn, '#3d6df2'], ['Fine-tune a pretrained BERT-style encoder', ft, 'var(--accent)']];
      el.innerHTML = `<label class="w-field">Labeled training examples: <b>${n.toLocaleString()}</b><input type="range" min="2" max="5" step="0.1" value="${Math.log10(n)}" data-n></label>
      <div class="llm-mem">${rows.map(r => `<div><span>${r[0]}</span><div class="ag-hbar"><i style="width:${r[1]}%;background:${r[2]}"></i><span>${r[1].toFixed(1)}% accuracy</span></div></div>`).join('')}</div>
      <p class="w-small">Illustrative sentiment-classification curves. With little labeled data, pretrained knowledge dominates; with huge data the gap narrows, but fine-tuning still wins on cost and quality. Typical recipe: 2–4 epochs, learning rate ~2e-5, small task head on [CLS].</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-n]')) { n = Math.round(10 ** +e.target.value); draw(); keepFocus(el, '[data-n]'); } });
    draw();
  };

  /* 17. Gaussian process regression */
  T.gp = 'Interactive: Gaussian process regression (click to add data)';
  W.gp = el => {
    let pts = [[-2, 0.5], [0, -0.4], [1.5, 0.9]], ell = 1, noise = 0.05;
    const k = (a, b) => Math.exp(-((a - b) ** 2) / (2 * ell * ell));
    const solve = (A, b) => { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; [M[i], M[p]] = [M[p], M[i]]; for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; } } return M.map((r, i) => r[n] / r[i]); };
    const draw = () => {
      const K = pts.map(a => pts.map(b => k(a[0], b[0]))).map((r, i) => r.map((v, j) => v + (i === j ? noise : 0)));
      const alpha = pts.length ? solve(K, pts.map(p => p[1])) : [];
      const xs = Array.from({ length: 121 }, (_, i) => -3 + i * 0.05);
      const pred = xs.map(x => { const ks = pts.map(p => k(x, p[0])); const mu = ks.reduce((s, v, i) => s + v * alpha[i], 0); const v = pts.length ? solve(K, ks) : []; const varr = Math.max(1e-6, 1 - ks.reduce((s, kv, i) => s + kv * v[i], 0)); return [x, mu, Math.sqrt(varr)]; });
      const X = x => 20 + (x + 3) / 6 * 560, Y = y => 110 - y * 40;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">length-scale ℓ <input type="range" min="0.2" max="3" step="0.1" value="${ell}" data-l> <b>${ell.toFixed(1)}</b></label><label class="w-field inline">noise <input type="range" min="0.001" max="0.5" step="0.01" value="${noise}" data-n> <b>${noise.toFixed(2)}</b></label><button type="button" class="w-chip" data-clear>Clear points</button></div>
      <svg viewBox="0 0 600 220" class="w-svg dl-gp" data-plot style="cursor:crosshair"><rect width="600" height="220" fill="var(--bg-soft)" rx="10"/>
        <polygon fill="var(--accent-soft)" points="${pred.map(([x, m, s]) => `${X(x)},${Y(m + 2 * s)}`).join(' ')} ${pred.slice().reverse().map(([x, m, s]) => `${X(x)},${Y(m - 2 * s)}`).join(' ')}"/>
        <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pred.map(([x, m]) => `${X(x)},${Y(m)}`).join(' ')}"/>
        ${pts.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="var(--ink)"/>`).join('')}</svg>
      <p class="w-small">Click inside the plot to add observations. Line = posterior mean; band = ±2 standard deviations. Uncertainty pinches near data and widens away from it. A short length-scale gives wiggly functions; a long one gives smooth ones.</p>`;
    };
    el.addEventListener('click', e => { const svg = e.target.closest('[data-plot]'); if (svg) { const r = svg.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width * 600 - 20) / 560 * 6 - 3, y = (110 - (e.clientY - r.top) / r.height * 220) / 40; if (x > -3 && x < 3) { pts.push([x, y]); draw(); } } if (e.target.closest('[data-clear]')) { pts = []; draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-l]')) { ell = +e.target.value; draw(); keepFocus(el, '[data-l]'); } if (e.target.matches('[data-n]')) { noise = +e.target.value; draw(); keepFocus(el, '[data-n]'); } });
    draw();
  };

  /* 18. Matrix factorization */
  T.matfact = 'Simulation: matrix factorization fills in missing ratings';
  W.matfact = el => {
    const users = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli'], items = ['🚀 Action1', '🚀 Action2', '🚀 Action3', '💕 Romance1', '💕 Romance2'];
    const R = [[5, 5, null, 1, 1], [4, null, 5, 1, 2], [1, 1, 2, null, 5], [null, 1, 1, 5, 4], [5, 4, 5, 2, null]];
    let P, Q, ep = 0, timer, r;
    const reset = () => { r = rng(17); const g = gauss(r); P = users.map(() => [g() * 0.1, g() * 0.1]); Q = items.map(() => [g() * 0.1, g() * 0.1]); ep = 0; };
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    const epoch = () => { const known = []; R.forEach((row, u) => row.forEach((v, i) => v != null && known.push([u, i, v]))); for (let k = known.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [known[k], known[j]] = [known[j], known[k]]; } known.forEach(([u, i, v]) => { const e = v - dot(P[u], Q[i]), pu = [...P[u]]; for (let d = 0; d < 2; d++) { P[u][d] += 0.02 * (e * Q[i][d] - 0.02 * P[u][d]); Q[i][d] += 0.02 * (e * pu[d] - 0.02 * Q[i][d]); } }); ep++; };
    const draw = () => {
      let se = 0, n = 0; R.forEach((row, u) => row.forEach((v, i) => { if (v != null) { se += (v - dot(P[u], Q[i])) ** 2; n++; } }));
      el.innerHTML = `<div class="w-tablewrap"><table class="w-table dl-mf"><thead><tr><th></th>${items.map(i => `<th>${i}</th>`).join('')}</tr></thead><tbody>${users.map((u, ui) => `<tr><th>${u}</th>${items.map((_, ii) => { const v = R[ui][ii], p = dot(P[ui], Q[ii]); return v != null ? `<td>${v}<small>${ep ? p.toFixed(1) : ''}</small></td>` : `<td class="miss">${ep ? `<b>${p.toFixed(1)}</b>` : '?'}<small>predicted</small></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="w-nav"><button type="button" class="primary" data-go>▶ Train 600 epochs</button><button type="button" data-rs>↺</button><span class="w-meter">epoch ${ep} · train RMSE ${Math.sqrt(se / n).toFixed(3)}</span></div>
      <p class="w-small">Each user and movie gets 2 learned numbers (latent factors, think "likes action" and "likes romance"). Their dot product reproduces known ratings (small grey numbers) and predicts the missing ones (bold): action fans get high action predictions, romance fans high romance ones.</p>`;
    };
    reset();
    el.addEventListener('click', e => { if (e.target.closest('[data-go]')) { clearInterval(timer); let n = 0; timer = setInterval(() => { for (let k = 0; k < 20; k++) epoch(); draw(); if ((n += 20) >= 600) clearInterval(timer); }, 30); } if (e.target.closest('[data-rs]')) { clearInterval(timer); reset(); draw(); } });
    draw();
  };
})();
