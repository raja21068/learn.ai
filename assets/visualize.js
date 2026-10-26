/* Visualization Lab: interactive charts (Observable Plot), diagrams (Mermaid, with a live editor) and the TensorFlow Playground.
   Routes: #/visualize, #/visualize/charts[/<id>], #/visualize/diagrams[/<id>], #/visualize/playground.
   Libraries are bundled under third_party/ (pinned versions, licences included) and loaded only when a page needs them.
   Every chart is computed in the browser from seeded random numbers or exact formulas: nothing is uploaded. */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const crumbs = (...p) => `<nav class="crumbs"><a href="#/">Home</a> / ${p.join(' / ')}</nav>`;
  const wrap = h => `<div class="container vz">${h}</div>`;

  /* ---------- lazy library loading ---------- */
  const scripts = {};
  const loadScript = src => scripts[src] || (scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res;
    s.onerror = () => { delete scripts[src]; rej(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  }));
  const loadPlot = () => loadScript('third_party/d3/d3.min.js').then(() => loadScript('third_party/observable-plot/plot.umd.min.js'));
  const loadMermaid = () => loadScript('third_party/mermaid/mermaid.min.js');
  const isDark = () => { const t = document.documentElement.dataset.theme; return t === 'dark' || (t !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); };

  /* ---------- seeded random numbers and small maths helpers ---------- */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const gauss = r => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
  function polyfit(xs, ys, deg) {                       // least squares through the normal equations with a tiny ridge; fine up to degree 10 on [0, 1]
    const n = deg + 1, A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
    for (let k = 0; k < xs.length; k++) { const p = [1]; for (let i = 1; i < 2 * n; i++) p.push(p[i - 1] * xs[k]); for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += p[i + j]; A[i][n] += p[i] * ys[k]; } }
    for (let i = 0; i < n; i++) A[i][i] += 1e-9;
    for (let c = 0; c < n; c++) { let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]];
      for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; } }
    const w = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
    return w;
  }
  const polyval = (w, x) => w.reduceRight((s, c) => s * x + c, 0);

  /* ---------- the chart demos ---------- */
  const plotBase = W => ({ width: W, style: { background: 'transparent', color: 'currentColor', fontSize: '12px' }, marginLeft: 46, marginBottom: 40 });
  const CHARTS = [
    { id: 'regression', title: 'Fitting a line to noisy data', blurb: 'Least squares draws the straight line that minimises the squared vertical errors. More noise gives a worse fit and a wider confidence band.',
      notice: 'Raise the noise: the fitted slope drifts from the true value of 2 and R² falls. Raise the number of points: the estimate settles down.',
      controls: [{ id: 'n', label: 'Points', min: 5, max: 200, step: 1, value: 40 }, { id: 'noise', label: 'Noise', min: 0, max: 8, step: 0.1, value: 3 }, { id: 'seed', label: 'Random seed', min: 1, max: 99, step: 1, value: 7 }],
      render(P, v, W) {
        const r = rng(v.seed), data = Array.from({ length: v.n }, () => { const x = r() * 10; return { x, y: 2 * x + 3 + v.noise * gauss(r) }; });
        const mx = mean(data.map(d => d.x)), my = mean(data.map(d => d.y));
        const slope = data.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0) / data.reduce((s, d) => s + (d.x - mx) ** 2, 0), icpt = my - slope * mx;
        const ssr = data.reduce((s, d) => s + (d.y - (icpt + slope * d.x)) ** 2, 0), sst = data.reduce((s, d) => s + (d.y - my) ** 2, 0), r2 = sst ? 1 - ssr / sst : 1;
        return { chart: P.plot({ ...plotBase(W), height: 360, grid: true, x: { label: 'x' }, y: { label: 'y' }, marks: [
            P.linearRegressionY(data, { x: 'x', y: 'y', stroke: '#e8505b', fill: '#e8505b', fillOpacity: 0.15 }),
            P.line([{ x: 0, y: 3 }, { x: 10, y: 23 }], { x: 'x', y: 'y', stroke: 'currentColor', strokeDasharray: '5 4', strokeOpacity: 0.7 }),
            P.dot(data, { x: 'x', y: 'y', fill: '#3d5af1', r: 3.5, fillOpacity: 0.8 })] }),
          readout: `Fitted line: y = ${slope.toFixed(2)}·x + ${icpt.toFixed(2)} (dashed: the true line y = 2x + 3) · R² = ${r2.toFixed(3)}` };
      } },
    { id: 'gradient', title: 'Gradient descent on a stretched bowl', blurb: 'The loss is f(x, y) = ½(x² + c·y²). The rings are lines of equal loss. Each step moves against the gradient by the learning rate.',
      notice: 'With c = 1 the rings are circles and descent goes straight to the minimum. Raise c: the path zig-zags. Raise the learning rate above 2 / c and it diverges.',
      controls: [{ id: 'c', label: 'Stretch c', min: 1, max: 30, step: 1, value: 10 }, { id: 'lr', label: 'Learning rate', min: 0.01, max: 1.2, step: 0.01, value: 0.15 }, { id: 'steps', label: 'Steps', min: 1, max: 80, step: 1, value: 40 }],
      render(P, v, W) {
        let x = -4, y = 3; const path = [{ x, y, i: 0 }];
        for (let i = 1; i <= v.steps; i++) { x -= v.lr * x; y -= v.lr * v.c * y; path.push({ x, y, i }); }
        const loss = p => 0.5 * (p.x * p.x + v.c * p.y * p.y), end = loss(path[path.length - 1]), diverged = !isFinite(end) || end > 1e4;
        const rings = [0.5, 1.5, 3, 6, 10, 15].map(L => Array.from({ length: 91 }, (_, k) => { const t = k / 90 * 2 * Math.PI; return { x: Math.sqrt(2 * L) * Math.cos(t), y: Math.sqrt(2 * L / v.c) * Math.sin(t), L }; }));
        const shown = diverged ? path.filter(p => Math.abs(p.x) < 6 && Math.abs(p.y) < 6) : path;
        return { chart: P.plot({ ...plotBase(W), height: 380, aspectRatio: 1, x: { domain: [-6, 6], label: 'x' }, y: { domain: [-6, 6], label: 'y' }, grid: true, marks: [
            ...rings.map(r => P.line(r, { x: 'x', y: 'y', stroke: 'currentColor', strokeOpacity: 0.28 })),
            P.line(shown, { x: 'x', y: 'y', stroke: '#e8505b', strokeWidth: 1.6, marker: 'dot' }),
            P.dot([{ x: 0, y: 0 }], { x: 'x', y: 'y', symbol: 'star', r: 7, fill: '#12a26a' })] }),
          readout: diverged ? `Diverged: the loss is exploding (learning rate ${v.lr} is above 2 / c = ${(2 / v.c).toFixed(2)}).` : `After ${v.steps} steps the loss is ${end < 1e-3 ? end.toExponential(2) : end.toFixed(3)} (start: ${loss(path[0]).toFixed(2)}). Stable while the learning rate stays below 2 / c = ${(2 / v.c).toFixed(2)}.` };
      } },
    { id: 'overfit', title: 'Underfitting and overfitting', blurb: '20 noisy points from a sine wave. A polynomial of low degree misses the curve; a high degree chases the noise. The test error tells the truth.',
      notice: 'Raise the degree: training error keeps falling, but test error falls, then rises. The best degree is where test error is lowest, not where the curve passes through the most points.',
      controls: [{ id: 'deg', label: 'Polynomial degree', min: 1, max: 10, step: 1, value: 3 }, { id: 'noise', label: 'Noise', min: 0.05, max: 0.6, step: 0.05, value: 0.25 }, { id: 'seed', label: 'Random seed', min: 1, max: 99, step: 1, value: 3 }],
      render(P, v, W) {
        const r = rng(v.seed), f = x => Math.sin(2 * Math.PI * x);
        const tr = Array.from({ length: 20 }, () => { const x = r(); return { x, y: f(x) + v.noise * gauss(r) }; });
        const te = Array.from({ length: 200 }, () => { const x = r(); return { x, y: f(x) + v.noise * gauss(r) }; });
        const mse = (w, d) => mean(d.map(p => (polyval(w, p.x) - p.y) ** 2));
        const errs = Array.from({ length: 10 }, (_, k) => { const w = polyfit(tr.map(p => p.x), tr.map(p => p.y), k + 1); return { deg: k + 1, train: mse(w, tr), test: mse(w, te) }; });
        const w = polyfit(tr.map(p => p.x), tr.map(p => p.y), v.deg), curve = Array.from({ length: 101 }, (_, k) => ({ x: k / 100, y: polyval(w, k / 100) })), truth = Array.from({ length: 101 }, (_, k) => ({ x: k / 100, y: f(k / 100) }));
        const long = errs.flatMap(e => [{ deg: e.deg, error: e.train, set: 'training error' }, { deg: e.deg, error: e.test, set: 'test error' }]);
        const best = errs.reduce((a, b) => (b.test < a.test ? b : a));
        const top = P.plot({ ...plotBase(W), height: 300, grid: true, x: { label: 'x' }, y: { domain: [-2, 2], label: 'y' }, marks: [
          P.line(truth, { x: 'x', y: 'y', stroke: 'currentColor', strokeDasharray: '5 4', strokeOpacity: 0.7 }), P.dot(tr, { x: 'x', y: 'y', fill: '#3d5af1', r: 4 }),
          P.line(curve.map(p => ({ ...p, y: Math.max(-2, Math.min(2, p.y)) })), { x: 'x', y: 'y', stroke: '#e8505b', strokeWidth: 2 })] });
        const bottom = P.plot({ ...plotBase(W), height: 220, grid: true, x: { label: 'degree', ticks: 10 }, y: { type: 'log', label: 'mean squared error' }, color: { legend: true, domain: ['training error', 'test error'], range: ['#3d5af1', '#e8505b'] }, marks: [
          P.line(long, { x: 'deg', y: 'error', stroke: 'set', marker: 'dot' }), P.ruleX([v.deg], { stroke: 'currentColor', strokeOpacity: 0.4, strokeDasharray: '3 3' })] });
        const box = document.createElement('div'); box.append(top, bottom);
        return { chart: box, readout: `Degree ${v.deg}: training error ${errs[v.deg - 1].train.toFixed(3)}, test error ${errs[v.deg - 1].test.toFixed(3)}. Lowest test error: degree ${best.deg} (${best.test.toFixed(3)}). The noise itself limits any model to about ${(v.noise ** 2).toFixed(3)}.` };
      } },
    { id: 'clt', title: 'Averages become bell-shaped (central limit theorem)', blurb: 'Draw n numbers from a skewed distribution and take their average. Repeat 2,000 times and plot the averages.',
      notice: 'At n = 1 you see the original distribution. As n grows the histogram becomes a bell curve whose width shrinks like 1/√n, even though the source is far from bell-shaped.',
      controls: [{ id: 'n', label: 'Numbers per average', min: 1, max: 60, step: 1, value: 1 }, { id: 'dist', label: 'Source (0 uniform, 1 exponential, 2 two-peaked)', min: 0, max: 2, step: 1, value: 1 }],
      render(P, v, W) {
        const r = rng(11), draw = [() => r(), () => -Math.log(1 - r()), () => (r() < 0.5 ? 0.15 : 0.85) + 0.05 * gauss(r)][v.dist];
        const mu = [0.5, 1, 0.5][v.dist], sig = [Math.sqrt(1 / 12), 1, Math.sqrt(0.35 ** 2 + 0.0025)][v.dist];
        const means = Array.from({ length: 2000 }, () => { let s = 0; for (let i = 0; i < v.n; i++) s += draw(); return s / v.n; });
        const dom = [Math.max(-0.5, mu - 4 * sig / Math.sqrt(1)), mu + 4 * sig];
        return { chart: P.plot({ ...plotBase(W), height: 340, grid: true, x: { label: 'average', domain: dom }, y: { label: 'count' }, marks: [
            P.rectY(means.filter(m => m >= dom[0] && m <= dom[1]), P.binX({ y: 'count' }, { x: d => d, thresholds: 40, fill: '#3d5af1', fillOpacity: 0.75 })), P.ruleY([0])] }),
          readout: `Average of the averages: ${mean(means).toFixed(3)} (theory ${mu.toFixed(3)}). Spread: ${sd(means).toFixed(3)} (theory σ/√n = ${(sig / Math.sqrt(v.n)).toFixed(3)}).` };
      } },
    { id: 'complexity', title: 'How running time grows', blurb: 'Operation counts for log n, n, n log n and n². The gap between them is why algorithm choice matters more than a faster computer.',
      notice: 'On the linear axis n² soon leaves the chart. Switch to the log axis: each growth rate becomes a distinct shape. Try n = 1000 for sorting: n log n is about 10,000 steps, n² is 1,000,000.',
      controls: [{ id: 'n', label: 'Maximum n', min: 10, max: 1000, step: 10, value: 100 }, { id: 'log', label: 'Log scale on y (0 = linear, 1 = log)', min: 0, max: 1, step: 1, value: 0 }],
      render(P, v, W) {
        const rows = []; for (let i = 1; i <= 100; i++) { const n = Math.max(1, Math.round(i * v.n / 100)); rows.push({ n, ops: Math.log2(n) + 1, f: 'log n' }, { n, ops: n, f: 'n' }, { n, ops: n * (Math.log2(n) + 1), f: 'n log n' }, { n, ops: n * n, f: 'n²' }); }
        return { chart: P.plot({ ...plotBase(W), height: 360, grid: true, x: { label: 'input size n' }, y: { type: v.log ? 'log' : 'linear', label: 'operations', ...(v.log ? {} : { domain: [0, 6 * v.n] }) }, color: { legend: true, domain: ['log n', 'n', 'n log n', 'n²'], range: ['#12a26a', '#3d5af1', '#c98a12', '#e8505b'] }, marks: [P.line(rows, { x: 'n', y: 'ops', stroke: 'f', strokeWidth: 2, clip: true })] }),
          readout: `At n = ${v.n}: log n ≈ ${(Math.log2(v.n) + 1).toFixed(0)}, n = ${v.n}, n log n ≈ ${Math.round(v.n * (Math.log2(v.n) + 1)).toLocaleString('en-US')}, n² = ${(v.n * v.n).toLocaleString('en-US')} operations.` };
      } },
    { id: 'softmax', title: 'Softmax turns scores into probabilities', blurb: 'A classifier outputs raw scores (logits). Softmax exponentiates them and divides by the total, so they become positive numbers that add up to 1. The temperature controls how decisive the result is.',
      notice: 'Lower the temperature: the largest score takes almost all the probability. Raise it: the probabilities even out. Temperature 1 is the standard softmax.',
      controls: [{ id: 't', label: 'Temperature', min: 0.1, max: 5, step: 0.1, value: 1 }],
      render(P, v, W) {
        const logits = [['cat', 2.0], ['dog', 1.0], ['bird', 0.1], ['fish', -1.0]], ex = logits.map(([, z]) => Math.exp(z / v.t)), tot = ex.reduce((a, b) => a + b, 0);
        const rows = logits.map(([name, z], i) => ({ class: name, p: ex[i] / tot, z }));
        return { chart: P.plot({ ...plotBase(W), height: 300, grid: true, x: { label: null }, y: { domain: [0, 1], label: 'probability' }, marks: [P.barY(rows, { x: 'class', y: 'p', fill: '#3d5af1' }), P.text(rows, { x: 'class', y: 'p', text: d => d.p.toFixed(2), dy: -8 }), P.ruleY([0])] }),
          readout: `Scores: ${logits.map(([n, z]) => n + ' ' + z).join(', ')} · temperature ${v.t} · the probabilities add up to ${rows.reduce((a, r) => a + r.p, 0).toFixed(3)}.` };
      } },
    { id: 'bandit', title: 'Exploring versus exploiting (a 10-armed bandit)', blurb: 'Ten slot machines with hidden average payouts. Each step you pick one. With probability epsilon you try a random arm; otherwise you pick the arm that looks best so far. Curves are averages over many random problems.',
      notice: 'A purely greedy player (epsilon 0) locks onto the first decent arm and stops learning. A little exploration finds better arms and wins in the long run. Too much keeps wasting pulls.',
      controls: [{ id: 'eps', label: 'Your epsilon', min: 0, max: 0.5, step: 0.01, value: 0.05 }, { id: 'runs', label: 'Problems averaged', min: 50, max: 400, step: 50, value: 150 }],
      render(P, v, W) {
        const STEPS = 400;
        const sim = (eps, seed) => { const r = rng(seed), q = Array.from({ length: 10 }, () => gauss(r)), est = new Array(10).fill(0), n = new Array(10).fill(0), out = [];
          for (let t = 0; t < STEPS; t++) { let a; if (r() < eps) a = Math.floor(r() * 10); else { let m = -Infinity, ix = []; for (let i = 0; i < 10; i++) { if (est[i] > m) { m = est[i]; ix = [i]; } else if (est[i] === m) ix.push(i); } a = ix[Math.floor(r() * ix.length)]; }
            const rew = q[a] + gauss(r); n[a]++; est[a] += (rew - est[a]) / n[a]; out.push(rew); } return out; };
        const names = ['greedy (0)', 'epsilon 0.01', 'epsilon 0.1', 'your epsilon'], eps = [0, 0.01, 0.1, v.eps], rows = [], last = [];
        eps.forEach((e, k) => { const avg = new Array(STEPS).fill(0); for (let run = 0; run < v.runs; run++) sim(e, 1000 + run).forEach((x, t) => { avg[t] += x / v.runs; });
          avg.forEach((y, t) => { if (t % 4 === 0) rows.push({ step: t + 1, reward: y, policy: names[k] }); }); last.push(mean(avg.slice(-100))); });
        return { chart: P.plot({ ...plotBase(W), height: 340, grid: true, x: { label: 'step' }, y: { label: 'average reward' }, color: { legend: true, domain: names, range: ['#c98a12', '#12a26a', '#3d5af1', '#e8505b'] }, marks: [P.line(rows, { x: 'step', y: 'reward', stroke: 'policy', strokeWidth: 1.8 })] }),
          readout: `Average reward over the last 100 steps: ${names.map((n, k) => `${n} ${last[k].toFixed(2)}`).join(' · ')}.` };
      } },
    { id: 'queue', title: 'Why delay explodes near full utilisation', blurb: 'On a link with random arrivals (an M/M/1 queue) the average time a packet spends in the system is the time to send it divided by (1 minus the utilisation).',
      notice: 'Delay barely moves up to about 50% utilisation, then climbs steeply. At 90% it is ten times the sending time; at 98% fifty times. This is why networks and servers are kept well below full load.',
      controls: [{ id: 'u', label: 'Utilisation (%)', min: 5, max: 98, step: 1, value: 70 }, { id: 's', label: 'Time to send one packet (ms)', min: 1, max: 20, step: 1, value: 5 }],
      render(P, v, W) {
        const rows = Array.from({ length: 94 }, (_, i) => { const u = (i + 5) / 100; return { u: u * 100, d: v.s / (1 - u) }; }), u = v.u / 100, d = v.s / (1 - u);
        return { chart: P.plot({ ...plotBase(W), height: 340, grid: true, x: { label: 'utilisation (%)' }, y: { label: 'average delay (ms)', domain: [0, v.s * 50] }, marks: [P.line(rows, { x: 'u', y: 'd', stroke: '#3d5af1', strokeWidth: 2, clip: true }), P.ruleX([v.u], { stroke: '#e8505b', strokeOpacity: 0.6 }), P.dot([{ u: v.u, d }], { x: 'u', y: 'd', fill: '#e8505b', r: 6, clip: true })] }),
          readout: `At ${v.u}% utilisation the average delay is ${d.toFixed(1)} ms, which is ${(d / v.s).toFixed(1)} times the time to send one packet.` };
      } }
  ];

  /* ---------- diagrams ---------- */
  const DIAGRAMS = [
    { id: 'ml-workflow', title: 'Machine learning workflow', src: 'flowchart LR\n  A[Collect data] --> B[Split into train and test]\n  B --> C[Train a model]\n  C --> D{Test error good enough?}\n  D -- no --> E[Change features or model]\n  E --> C\n  D -- yes --> F[Deploy and monitor]' },
    { id: 'agent-loop', title: 'An AI agent loop', src: 'sequenceDiagram\n  participant U as User\n  participant A as Agent\n  participant T as Tools\n  U->>A: Goal\n  loop until the goal is met\n    A->>A: Plan the next step\n    A->>T: Call a tool\n    T-->>A: Result\n  end\n  A-->>U: Answer' },
    { id: 'cascade', title: 'An LLM cascade (see the LLM Service Lab)', src: 'flowchart TD\n  R[Request] --> S[Small model]\n  S --> C{Confident?}\n  C -- yes --> A1[Answer: cheap and fast]\n  C -- no --> L[Large model]\n  L --> A2[Answer: pays for both models]' },
    { id: 'index-choice', title: 'Should this column get an index?', src: 'flowchart TD\n  Q[A slow query] --> W{Does it filter on a column?}\n  W -- no --> F[A full scan is fine]\n  W -- yes --> S{Do few rows match?}\n  S -- no --> F\n  S -- yes --> I[Create an index on that column]\n  I --> E[Check EXPLAIN QUERY PLAN]' },
    { id: 'transformer', title: 'One transformer block', src: 'flowchart LR\n  X[Token embeddings and positions] --> A[Multi-head self-attention]\n  A --> N1[Add and normalise]\n  X -. residual .-> N1\n  N1 --> F[Feed-forward network]\n  F --> N2[Add and normalise]\n  N1 -. residual .-> N2\n  N2 --> Y[Next block or output]' },
    { id: 'network', title: 'A small neural network', src: 'flowchart LR\n  subgraph Input\n    i1((x1))\n    i2((x2))\n  end\n  subgraph Hidden\n    h1((h1))\n    h2((h2))\n    h3((h3))\n  end\n  subgraph Output\n    o1((y))\n  end\n  i1 --> h1 & h2 & h3\n  i2 --> h1 & h2 & h3\n  h1 & h2 & h3 --> o1' },
    { id: 'tcp', title: 'TCP connection states', src: 'stateDiagram-v2\n  [*] --> Closed\n  Closed --> SynSent: connect, send SYN\n  SynSent --> Established: receive SYN+ACK, send ACK\n  Established --> FinWait: close, send FIN\n  FinWait --> Closed: receive FIN+ACK' },
    { id: 'orders-er', title: 'Entities of the Index Lab database', src: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains\n  PRODUCT ||--o{ ORDER_ITEM : "is in"\n  CUSTOMER {\n    int id\n    string name\n  }\n  ORDER {\n    int id\n    int customer_id\n    string status\n  }' },
    { id: 'study-plan', title: 'A study plan', src: 'gantt\n  title Study plan\n  dateFormat YYYY-MM-DD\n  section Foundations\n  Python basics :a1, 2026-11-02, 7d\n  Machine learning basics :after a1, 10d\n  section Practice\n  Quizzes and coding labs :2026-11-09, 14d' }
  ];
  let mermaidReady = null, mermaidSeq = 0;
  async function renderMermaid(src, into) {
    await loadMermaid();
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark() ? 'dark' : 'default' });
    const id = 'vzm' + (++mermaidSeq);
    try {
      await mermaid.parse(src);
      const { svg } = await mermaid.render(id, src);
      into.innerHTML = svg; into.classList.remove('vz-error');
      const el = into.querySelector('svg'), vb = el && el.viewBox && el.viewBox.baseVal;
      if (vb && vb.width) { el.style.maxWidth = Math.round(vb.width) + 'px'; el.style.minWidth = Math.round(Math.min(vb.width, 600)) + 'px'; }   // keep text readable on a phone: scroll sideways instead of shrinking
      return true;
    } catch (e) {
      const stray = document.getElementById('d' + id); if (stray) stray.remove();
      into.innerHTML = `<p class="vz-err"><b>This diagram has a syntax error.</b><br>${esc(String(e.message || e).split('\n').slice(0, 4).join(' '))}</p>`; into.classList.add('vz-error');
      return false;
    }
  }

  /* ---------- pages ---------- */
  function hub(app) {
    document.title = 'Visualization lab · learn/ai';
    app.innerHTML = wrap(`${crumbs('Visualize')}
      <header class="vz-hero"><span class="kicker">See it, then understand it</span><h1>Visualization lab</h1><p>Interactive charts you can change, diagrams you can edit, and a neural network you can train and watch learn. Everything runs in your browser.</p></header>
      <div class="vz-cards">
        <a class="vz-card" href="#/visualize/charts"><span class="vz-ico">📈</span><h2>Interactive charts</h2><p>${CHARTS.length} experiments with sliders: regression, gradient descent, overfitting, the central limit theorem and algorithm growth. Drawn with Observable Plot.</p></a>
        <a class="vz-card" href="#/visualize/diagrams"><span class="vz-ico">🧩</span><h2>Diagrams</h2><p>${DIAGRAMS.length} diagrams of workflows, agents, databases and networks, plus a live editor to write your own. Drawn with Mermaid.</p></a>
        <a class="vz-card" href="#/visualize/playground"><span class="vz-ico">🧠</span><h2>Neural network playground</h2><p>Train a small neural network on toy data and watch the decision boundary change. The original TensorFlow Playground, running here.</p></a>
      </div>
      <p class="vz-credit">Libraries bundled with their licences: <a href="https://github.com/observablehq/plot" target="_blank" rel="noopener noreferrer">Observable Plot</a> (ISC) with <a href="https://github.com/d3/d3" target="_blank" rel="noopener noreferrer">d3</a> (ISC), <a href="https://github.com/mermaid-js/mermaid" target="_blank" rel="noopener noreferrer">Mermaid</a> (MIT) and <a href="https://github.com/tensorflow/playground" target="_blank" rel="noopener noreferrer">TensorFlow Playground</a> (Apache-2.0). See <a href="THIRD_PARTY_NOTICES.md">THIRD_PARTY_NOTICES.md</a>.</p>`);
  }

  /* Mounts one chart demo (controls, chart, readout, "what to notice") into `host`. Used by the chart page and inside textbook chapters. */
  async function mountChart(host, cur) {
    const vals = {}; cur.controls.forEach(c => { vals[c.id] = c.value; });
    host.innerHTML = `<div class="vz-controls">${cur.controls.map(c => `<label><span>${esc(c.label)}: <b data-v="${c.id}">${c.value}</b></span><input type="range" data-c="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" aria-label="${esc(c.label)}"></label>`).join('')}</div>
      <div class="vz-chart" data-chart aria-live="polite"><p class="vz-muted">Loading the chart library…</p></div><p class="vz-readout" data-readout></p><p class="vz-notice"><b>What to notice:</b> ${esc(cur.notice)}</p>`;
    const box = host.querySelector('[data-chart]'), read = host.querySelector('[data-readout]');
    let P;
    try { await loadPlot(); P = window.Plot; } catch (e) { box.innerHTML = `<p class="vz-err">${esc(e.message)}</p>`; return; }
    if (!P) { box.innerHTML = '<p class="vz-err">The chart library did not start.</p>'; return; }
    const draw = () => { const W = Math.max(280, Math.min(900, box.clientWidth || 600)); const out = cur.render(P, vals, W); box.replaceChildren(out.chart); read.textContent = out.readout; };
    cur.controls.forEach(c => host.querySelector(`[data-c="${c.id}"]`).addEventListener('input', e => { vals[c.id] = +e.target.value; host.querySelector(`[data-v="${c.id}"]`).textContent = e.target.value; draw(); }));
    draw();
    let t; window.addEventListener('resize', function onResize() { if (!host.isConnected) { window.removeEventListener('resize', onResize); return; } clearTimeout(t); t = setTimeout(draw, 150); });
  }

  function charts(app, id) {
    const cur = CHARTS.find(c => c.id === id) || CHARTS[0];
    document.title = `${cur.title} · Visualization lab · learn/ai`;
    app.innerHTML = wrap(`${crumbs('<a href="#/visualize">Visualize</a>', 'Charts')}
      <div class="vz-tabs" role="group" aria-label="Chart">${CHARTS.map(c => `<a class="vz-tab ${c.id === cur.id ? 'on' : ''}" href="#/visualize/charts/${c.id}">${esc(c.title.split(' (')[0])}</a>`).join('')}</div>
      <div class="vz-panel"><h1>${esc(cur.title)}</h1><p>${esc(cur.blurb)}</p><div id="vz-host"></div></div>`);
    return mountChart(app.querySelector('#vz-host'), cur);
  }

  async function diagrams(app, id) {
    const cur = DIAGRAMS.find(d => d.id === id) || DIAGRAMS[0];
    document.title = `${cur.title} · Diagrams · learn/ai`;
    app.innerHTML = wrap(`${crumbs('<a href="#/visualize">Visualize</a>', 'Diagrams')}
      <div class="vz-tabs" role="group" aria-label="Diagram">${DIAGRAMS.map(d => `<a class="vz-tab ${d.id === cur.id ? 'on' : ''}" href="#/visualize/diagrams/${d.id}">${esc(d.title.split(' (')[0])}</a>`).join('')}</div>
      <div class="vz-panel"><h1>${esc(cur.title)}</h1>
        <div class="vz-diagram" id="vz-diagram"><p class="vz-muted">Loading Mermaid (about 5 MB, once)…</p></div>
        <h2 class="vz-h2">Edit it</h2><p class="vz-muted">The diagram is plain text. Change it below and it redraws. <a href="https://mermaid.js.org/intro/syntax-reference.html" target="_blank" rel="noopener noreferrer">Mermaid syntax</a></p>
        <textarea id="vz-src" class="vz-src" spellcheck="false" rows="12" aria-label="Mermaid diagram source">${esc(cur.src)}</textarea>
        <div class="vz-actions"><button type="button" class="btn sm primary" id="vz-render">Redraw</button><button type="button" class="btn sm ghost" id="vz-reset">Reset</button></div></div>`);
    const out = app.querySelector('#vz-diagram'), src = app.querySelector('#vz-src');
    try { await renderMermaid(cur.src, out); } catch (e) { out.innerHTML = `<p class="vz-err">${esc(e.message)}</p>`; return; }
    let t; const redraw = () => renderMermaid(src.value, out).catch(e => { out.innerHTML = `<p class="vz-err">${esc(e.message)}</p>`; });
    src.addEventListener('input', () => { clearTimeout(t); t = setTimeout(redraw, 500); });
    app.querySelector('#vz-render').addEventListener('click', redraw);
    app.querySelector('#vz-reset').addEventListener('click', () => { src.value = cur.src; redraw(); });
  }

  function playground(app) {
    document.title = 'Neural network playground · learn/ai';
    app.innerHTML = wrap(`${crumbs('<a href="#/visualize">Visualize</a>', 'Neural network playground')}
      <header class="vz-hero"><h1>Neural network playground</h1><p>This is the TensorFlow Playground, bundled with this site (Apache-2.0). Press ▶ to train. Each neuron shows what it has learned; the big picture on the right is the decision boundary.</p></header>
      <ul class="vz-try"><li><b>Easy:</b> pick the circle data and the default network, then train. One hidden layer with 2 neurons is enough for a straight-line problem but not for a circle.</li>
        <li><b>Why hidden layers matter:</b> choose the spiral data. Add layers and neurons, switch on the x², y² and x·y features, and see which setup learns it.</li>
        <li><b>Overfitting:</b> raise the noise and use many neurons. Training loss falls but test loss rises.</li>
        <li><b>Learning rate:</b> set it very high and watch training become unstable (the same effect as in the gradient descent chart).</li></ul>
      <div class="vz-frame"><iframe src="third_party/tensorflow-playground/index.html" title="TensorFlow Playground" loading="lazy" allow="fullscreen"></iframe></div>
      <p class="vz-credit">TensorFlow Playground, Copyright 2016 Google Inc., <a href="https://github.com/tensorflow/playground" target="_blank" rel="noopener noreferrer">source</a>, Apache-2.0. The only change is that its Google Analytics tracking was replaced by an empty function, so nothing is sent to Google Analytics (<a href="third_party/tensorflow-playground/CHANGES.md">CHANGES.md</a>). <a href="https://playground.tensorflow.org" target="_blank" rel="noopener noreferrer">Open the original site</a>.</p>`);
  }

  /* ---------- inside the textbook chapters ---------- */
  function chapterSection(bookId, n) {
    const z = ((window.CHAPTER_VIZ || {})[bookId] || {})[n];
    if (!z) return '';
    const chart = z.c && CHARTS.find(c => c.id === z.c);
    return `<section class="vz-chapter" data-vz-book="${esc(bookId)}" data-vz-n="${n}"><span class="bm-section-no">See it</span><h2>Visual summary</h2>
      <figure class="vz-fig"><div class="vz-diagram" data-vz-diagram><p class="vz-muted">The diagram draws when you scroll here.</p></div><figcaption>${esc(z.t)}</figcaption></figure>
      <details class="vz-details"><summary>Show or edit the diagram text</summary><textarea class="vz-src" data-vz-src rows="8" spellcheck="false" aria-label="Diagram source">${esc(z.d)}</textarea></details>
      ${chart ? `<h3 class="vz-h3">Try it: ${esc(chart.title)}</h3><div class="vz-panel vz-inline" data-vz-chart-host="${chart.id}"></div>` : ''}
      ${z.p ? `<details class="vz-details vz-playground"><summary>Open the neural network playground</summary><div class="vz-frame"><iframe data-src="third_party/tensorflow-playground/index.html" title="TensorFlow Playground"></iframe></div></details>` : ''}
      <p class="vz-fine">Diagram: Mermaid · chart: Observable Plot · playground: TensorFlow Playground · <a href="#/visualize">more in the Visualization lab</a></p></section>`;
  }
  function mountChapter(root) {
    root.querySelectorAll('.vz-chapter').forEach(sec => {
      const go = () => {
        if (sec.dataset.mounted) return; sec.dataset.mounted = '1';
        const z = ((window.CHAPTER_VIZ || {})[sec.dataset.vzBook] || {})[sec.dataset.vzN]; if (!z) return;
        const out = sec.querySelector('[data-vz-diagram]'), src = sec.querySelector('[data-vz-src]');
        renderMermaid(z.d, out).catch(e => { out.innerHTML = `<p class="vz-err">${esc(e.message)}</p>`; });
        let t; src.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => renderMermaid(src.value, out).catch(() => {}), 500); });
        const host = sec.querySelector('[data-vz-chart-host]'); if (host) mountChart(host, CHARTS.find(c => c.id === host.dataset.vzChartHost));
        const pd = sec.querySelector('.vz-playground'); if (pd) pd.addEventListener('toggle', () => { const f = pd.querySelector('iframe'); if (pd.open && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src); });
      };
      if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '400px' }); io.observe(sec); } else go();
    });
  }

  function render(app, parts) {
    const [a, b] = parts || [];
    if (!a) hub(app);
    else if (a === 'charts') charts(app, b);
    else if (a === 'diagrams') diagrams(app, b);
    else if (a === 'playground') playground(app);
    else hub(app);
  }
  window.VisualizationLab = { render, charts: CHARTS, diagrams: DIAGRAMS, chapterSection, mountChapter, renderMermaid };
})();
