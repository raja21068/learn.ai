/* Interactive widgets for the AI Foundations course. Registers into window.WIDGETS. */
(() => {
  'use strict';
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, l]) => `<button type="button" data-${name}="${v}" class="${String(v) === String(active) ? 'on' : ''}" aria-pressed="${String(v) === String(active)}">${l}</button>`).join('')}</div>`;
  const keepFocus = (el, sel) => { const n = el.querySelector(sel); if (n) n.focus(); };
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* 1. Four approaches to AI */
  T.aiapproaches = 'Explore: four ways to define AI';
  W.aiapproaches = el => {
    const Q = [['Thinking humanly', 'Cognitive modeling', 'Build programs that think the way people think, tested against experiments in psychology and neuroscience.', 'Cognitive architectures; brain-inspired models'], ['Thinking rationally', 'Laws of thought', 'Reason with logic from premises to correct conclusions.', 'Logic programming; theorem provers'], ['Acting humanly', 'The Turing test', 'Behave so that a human interrogator can\'t tell the machine from a person. Needs language, knowledge, reasoning and learning.', 'Conversational agents'], ['Acting rationally', 'Rational agents ★', 'Act to achieve the best expected outcome. General, measurable, and the approach this course follows.', 'Self-driving planners, game AI, recommender systems']];
    const H = [[1943, 'Artificial neurons (McCulloch & Pitts)'], [1950, 'Turing proposes the imitation game'], [1956, 'Dartmouth workshop names "AI"'], [1980, 'Expert systems boom'], [1997, 'Deep Blue beats the world chess champion'], [2012, 'Deep learning breakthrough in vision'], [2016, 'AlphaGo beats a Go champion'], [2022, 'Large language models go mainstream']];
    let i = 3;
    const draw = () => {
      el.innerHTML = `<div class="ai-quad"><span class="ai-ax ax1">human-like</span><span class="ai-ax ax2">rational</span><span class="ai-ax ax3">thinking</span><span class="ai-ax ax4">acting</span>${Q.map((q, k) => `<button type="button" data-q="${k}" class="${k === i ? 'on' : ''}"><b>${q[0]}</b><small>${q[1]}</small></button>`).join('')}</div>
      <div class="w-card"><span class="w-label">${Q[i][0]} · ${Q[i][1]}</span><p>${esc(Q[i][2])}</p><p class="w-small"><b>Examples:</b> ${esc(Q[i][3])}</p></div>
      <div class="ai-timeline">${H.map(h => `<div><b>${h[0]}</b><span>${esc(h[1])}</span></div>`).join('')}</div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) { i = +b.dataset.q; draw(); } });
    draw();
  };

  /* 2. Vacuum world */
  T.vacuum = 'Simulation: reflex vs. model-based vacuum agent';
  W.vacuum = el => {
    let kind = 'reflex', st, timer;
    const reset = () => { clearInterval(timer); st = { loc: 0, dirt: [true, true], known: new Set(), t: 0, score: 0, log: [] }; };
    const act = () => {
      const d = st.dirt[st.loc]; let a;
      if (d) { a = 'Suck'; } else if (kind === 'model' && st.known.size === 2) a = 'NoOp'; else a = st.loc === 0 ? 'Right' : 'Left';
      if (kind === 'model') st.known.add(st.loc);
      if (a === 'Suck') st.dirt[st.loc] = false; else if (a === 'Right') st.loc = 1; else if (a === 'Left') st.loc = 0;
      st.score += st.dirt.filter(x => !x).length - (a === 'Right' || a === 'Left' ? 1 : 0); st.t++; st.log.push(a);
      if (st.t % 4 === 0 && Math.random() < 0.0) st.dirt[1] = true;
    };
    const draw = () => {
      el.innerHTML = `<div class="w-head">${seg('k', [['reflex', 'Simple reflex agent'], ['model', 'Model-based agent']], kind)}<div class="w-nav"><button type="button" class="primary" data-go>▶ Run 8 steps</button><button type="button" data-rs>↺</button></div></div>
      <div class="ai-rooms">${[0, 1].map(r => `<div class="${st.dirt[r] ? 'dirty' : ''}"><span>${'AB'[r]}</span>${st.dirt[r] ? '🟫🟫' : '✨'}${st.loc === r ? '<b>🤖</b>' : ''}</div>`).join('')}</div>
      <div class="ag-stats"><div><b>${st.t}</b><small>steps</small></div><div><b>${st.score}</b><small>performance (+1 per clean square/step, −1 per move)</small></div></div>
      <p class="w-small">Actions: ${st.log.map(a => `<code>${a}</code>`).join(' ') || '-'}</p>
      <p class="w-status ${kind === 'model' ? 'good' : 'warn'}">${kind === 'model' ? 'The model-based agent remembers both squares are clean and stops (NoOp), saving energy.' : 'The reflex agent only sees its current square, so it shuttles back and forth forever, paying for every move.'}</p>`;
    };
    reset();
    el.addEventListener('click', e => { const k = e.target.closest('[data-k]'); if (k) { kind = k.dataset.k; reset(); draw(); } if (e.target.closest('[data-rs]')) { reset(); draw(); } if (e.target.closest('[data-go]')) { reset(); draw(); let n = 0; timer = setInterval(() => { act(); draw(); if (++n >= 8) clearInterval(timer); }, 380); } });
    draw();
  };

  /* 3–4. Grid search visualizer */
  const gridSearch = defaultAlg => el => {
    const R = 12, C = 22;
    let walls = new Set(), start = [6, 2], goal = [6, 19], alg = defaultAlg, timer, visited = [], path = [], frontierMax = 0;
    [[2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [8, 9], [8, 10], [8, 11], [8, 12], [3, 13], [4, 13], [5, 13], [6, 13], [7, 13], [2, 13], [1, 13], [9, 16], [8, 16], [7, 16], [6, 16], [5, 16], [4, 16]].forEach(([r, c]) => walls.add(r + ',' + c));
    const key = (r, c) => r + ',' + c;
    const run = () => {
      const h = (r, c) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
      const pri = (g, r, c) => alg === 'bfs' ? 0 : alg === 'dfs' ? 0 : alg === 'ucs' ? g : alg === 'greedy' ? h(r, c) : g + h(r, c);
      let fr = [[pri(0, ...start), 0, start[0], start[1]]], par = { [key(...start)]: null }, g = { [key(...start)]: 0 }, done = new Set(), order = [], cnt = 0;
      frontierMax = 0;
      while (fr.length) {
        frontierMax = Math.max(frontierMax, fr.length);
        let item;
        if (alg === 'bfs') item = fr.shift(); else if (alg === 'dfs') item = fr.pop(); else { fr.sort((a, b) => a[0] - b[0] || a[4] - b[4]); item = fr.shift(); }
        const [, gc, r, c] = item, k = key(r, c);
        if (done.has(k)) continue; done.add(k); order.push(k);
        if (r === goal[0] && c === goal[1]) { const p = []; let x = k; while (x) { p.push(x); x = par[x]; } return [order, p]; }
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const nr = r + dr, nc = c + dc, nk = key(nr, nc); if (nr < 0 || nc < 0 || nr >= R || nc >= C || walls.has(nk) || done.has(nk)) continue; if ((alg === 'bfs' || alg === 'dfs') && nk in par) continue; if (alg !== 'bfs' && alg !== 'dfs' && gc + 1 >= (g[nk] ?? Infinity)) continue; par[nk] = k; g[nk] = gc + 1; fr.push([pri(gc + 1, nr, nc), gc + 1, nr, nc, cnt++]); }
      }
      return [order, []];
    };
    const draw = () => {
      const vs = new Set(visited), ps = new Set(path);
      el.innerHTML = `<div class="w-head">${seg('alg', [['bfs', 'Breadth-first'], ['dfs', 'Depth-first'], ['ucs', 'Uniform-cost'], ['greedy', 'Greedy best-first'], ['astar', 'A*']], alg)}<div class="w-nav"><button type="button" class="primary" data-go>▶ Search</button><button type="button" data-clear>Clear walls</button></div></div>
      <div class="ai-grid" style="grid-template-columns:repeat(${C},minmax(0,1fr))">${Array.from({ length: R * C }, (_, i) => { const r = i / C | 0, c = i % C, k = key(r, c); const cls = r === start[0] && c === start[1] ? 's' : r === goal[0] && c === goal[1] ? 'g' : walls.has(k) ? 'w' : ps.has(k) ? 'p' : vs.has(k) ? 'v' : ''; return `<i data-cell="${k}" class="${cls}"></i>`; }).join('')}</div>
      <div class="ag-stats"><div><b>${visited.length}</b><small>cells expanded</small></div><div><b>${path.length ? path.length - 1 : '-'}</b><small>path length</small></div><div><b>${frontierMax || '-'}</b><small>max frontier size</small></div></div>
      <p class="w-small">Click cells to draw or erase walls. Green = start, red = goal. BFS and UCS find shortest paths; DFS wanders; greedy rushes toward the goal (not always optimally); A* is optimal and focused.</p>`;
    };
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-alg]'); if (a) { alg = a.dataset.alg; visited = []; path = []; draw(); return; }
      if (e.target.closest('[data-clear]')) { walls = new Set(); visited = []; path = []; draw(); return; }
      const cell = e.target.closest('[data-cell]'); if (cell) { const k = cell.dataset.cell; if (k === key(...start) || k === key(...goal)) return; walls.has(k) ? walls.delete(k) : walls.add(k); visited = []; path = []; draw(); return; }
      if (e.target.closest('[data-go]')) { clearInterval(timer); const [order, p] = run(); visited = []; path = []; let i = 0; const step = Math.max(1, Math.ceil(order.length / 60)); timer = setInterval(() => { i += step; visited = order.slice(0, i); if (i >= order.length) { clearInterval(timer); path = p; } draw(); }, 25); }
    });
    draw();
  };
  T.gridsearch = 'Interactive: uninformed search on a grid';
  W.gridsearch = gridSearch('bfs');
  T['gridsearch-informed'] = 'Interactive: greedy vs. A* search';
  W['gridsearch-informed'] = gridSearch('astar');

  /* 5. Local search landscape */
  T.landscape = 'Simulation: hill climbing vs. simulated annealing';
  W.landscape = el => {
    const f = x => 40 * Math.sin(x / 9) + 22 * Math.sin(x / 3.1) + 0.6 * x + 30;
    const N = 100; const best = Array.from({ length: N }, (_, x) => f(x)).reduce((a, v, x, arr) => v > arr[a] ? x : a, 0);
    let alg = 'hill', trail = [], seed = 3, temp0 = 40;
    const run = () => {
      const r = rng(seed * 101); let x = Math.floor(r() * N); trail = [x];
      if (alg === 'hill') { while (true) { const nb = [x - 1, x + 1].filter(v => v >= 0 && v < N).sort((a, b) => f(b) - f(a))[0]; if (f(nb) <= f(x)) break; x = nb; trail.push(x); } }
      else if (alg === 'restart') { let bx = x; for (let k = 0; k < 6; k++) { x = Math.floor(r() * N); trail.push(x); while (true) { const nb = [x - 1, x + 1].filter(v => v >= 0 && v < N).sort((a, b) => f(b) - f(a))[0]; if (f(nb) <= f(x)) break; x = nb; trail.push(x); } if (f(x) > f(bx)) bx = x; } trail.push(bx); }
      else { let T = temp0; for (let k = 0; k < 400 && T > 0.05; k++) { const nx = Math.min(N - 1, Math.max(0, x + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 3)))); const d = f(nx) - f(x); if (d > 0 || r() < Math.exp(d / T)) { x = nx; trail.push(x); } T *= 0.985; } }
    };
    const draw = () => {
      const X = x => 20 + x * 5.6, Y = v => 190 - v * 1.4, end = trail[trail.length - 1];
      el.innerHTML = `<div class="w-head">${seg('al', [['hill', 'Hill climbing'], ['restart', 'Random restarts'], ['sa', 'Simulated annealing']], alg)}<button type="button" class="w-go" data-run>🎲 New random start</button></div>
      <svg viewBox="0 0 600 200" class="w-svg"><polyline fill="none" stroke="var(--line-strong)" stroke-width="2.5" points="${Array.from({ length: N }, (_, x) => `${X(x)},${Y(f(x))}`).join(' ')}"/>
        <circle cx="${X(best)}" cy="${Y(f(best)) - 10}" r="4" fill="var(--ok)"/><text x="${X(best)}" y="${Y(f(best)) - 18}" text-anchor="middle" font-size="10" fill="var(--ok)">global max</text>
        ${trail.slice(-60).map(x => `<circle cx="${X(x)}" cy="${Y(f(x))}" r="2.5" fill="var(--accent)" opacity=".45"/>`).join('')}
        ${end != null ? `<circle cx="${X(end)}" cy="${Y(f(end))}" r="7" fill="var(--ink)"/>` : ''}</svg>
      ${end != null ? `<p class="w-status ${end === best ? 'good' : 'warn'}">${end === best ? '✓ Found the global maximum.' : `Stuck at a ${alg === 'hill' ? 'local maximum: every neighbor is lower' : 'good but not best peak'} (value ${f(end).toFixed(0)} vs best ${f(best).toFixed(0)}). Try again or switch strategy.`}</p>` : '<p class="w-small">Press the button to start from a random point.</p>'}`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-al]'); if (b) { alg = b.dataset.al; run(); draw(); } if (e.target.closest('[data-run]')) { seed++; run(); draw(); } });
    run(); draw();
  };

  /* 6. Tic-tac-toe vs minimax */
  T.tictactoe = 'Play: tic-tac-toe vs. minimax (with alpha-beta)';
  W.tictactoe = el => {
    const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let b = Array(9).fill(''), ab = true, nodes = 0, msg = 'You are X. Click a square.';
    const win = s => { for (const [i, j, k] of L) if (s[i] && s[i] === s[j] && s[j] === s[k]) return s[i]; return s.every(Boolean) ? 'draw' : null; };
    const mm = (s, p, a, bt) => { nodes++; const w = win(s); if (w) return w === 'O' ? 1 : w === 'X' ? -1 : 0; let best = p === 'O' ? -2 : 2; for (let i = 0; i < 9; i++) { if (s[i]) continue; s[i] = p; const v = mm(s, p === 'O' ? 'X' : 'O', a, bt); s[i] = ''; if (p === 'O') { best = Math.max(best, v); if (ab) { a = Math.max(a, v); if (a >= bt) break; } } else { best = Math.min(best, v); if (ab) { bt = Math.min(bt, v); if (a >= bt) break; } } } return best; };
    const ai = () => { nodes = 0; let bm = -1, bv = -2; for (let i = 0; i < 9; i++) { if (b[i]) continue; b[i] = 'O'; const v = mm(b, 'X', -2, 2); b[i] = ''; if (v > bv) { bv = v; bm = i; } } b[bm] = 'O'; msg = `AI examined ${nodes.toLocaleString()} positions${ab ? ' (alpha-beta)' : ' (plain minimax)'}. Value: ${bv > 0 ? 'AI wins' : bv < 0 ? 'you win' : 'draw'} with best play.`; };
    const draw = () => {
      const w = win(b);
      el.innerHTML = `<div class="w-head"><label class="w-chip ${ab ? 'on' : ''}"><input type="checkbox" data-ab ${ab ? 'checked' : ''}> Alpha-beta pruning</label><button type="button" class="w-go" data-new>New game</button></div>
      <div class="ai-ttt">${b.map((v, i) => `<button type="button" data-i="${i}" ${v || w ? 'disabled' : ''} class="${v === 'X' ? 'x' : v === 'O' ? 'o' : ''}">${v}</button>`).join('')}</div>
      <p class="w-status ${w === 'O' ? 'bad' : w === 'X' ? 'good' : ''}">${w ? (w === 'draw' ? '🤝 Draw. Against perfect play that\'s the best you can do.' : w === 'X' ? '🎉 You win!' : '🤖 The AI wins.') : esc(msg)}</p>
      <p class="w-small">Toggle alpha-beta and compare position counts: it plays exactly the same moves, while examining far fewer positions.</p>`;
    };
    el.addEventListener('click', e => { const c = e.target.closest('[data-i]'); if (c && !c.disabled) { b[+c.dataset.i] = 'X'; if (!win(b)) ai(); draw(); } if (e.target.closest('[data-new]')) { b = Array(9).fill(''); msg = 'You are X. Click a square.'; draw(); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-ab]')) { ab = e.target.checked; draw(); } });
    draw();
  };

  /* 7. Map coloring CSP */
  T.mapcolor = 'Simulation: backtracking search for map coloring';
  W.mapcolor = el => {
    const R = { North: [150, 40], Lakes: [60, 100], Hills: [170, 120], Coast: [270, 90], Plains: [80, 200], Valley: [220, 205], Isle: [320, 200] };
    const NB = { North: ['Lakes', 'Hills', 'Coast'], Lakes: ['North', 'Hills', 'Plains'], Hills: ['North', 'Lakes', 'Plains', 'Coast', 'Valley'], Coast: ['North', 'Hills'], Plains: ['Lakes', 'Hills', 'Valley'], Valley: ['Hills', 'Plains'], Isle: [] };
    const COL = ['#e8505b', '#16a37f', '#3d6df2'];
    let heur = true, trace = [], i = 0, timer;
    const solve = () => {
      trace = []; const order = Object.keys(R);
      const bt = (asg, dom) => {
        if (Object.keys(asg).length === order.length) return asg;
        const un = order.filter(v => !(v in asg));
        const v = heur ? un.sort((a, b) => dom[a].length - dom[b].length || NB[b].length - NB[a].length)[0] : un[0];
        for (const c of dom[v]) {
          if (NB[v].some(n => asg[n] === c)) { trace.push({ ...asg, [v]: -1 - c }); continue; }
          const nd = Object.fromEntries(Object.entries(dom).map(([k, d]) => [k, [...d]])); nd[v] = [c]; let ok = true;
          if (heur) NB[v].forEach(n => { if (!(n in asg)) { nd[n] = nd[n].filter(x => x !== c); if (!nd[n].length) ok = false; } });
          trace.push({ ...asg, [v]: c });
          if (ok) { const r = bt({ ...asg, [v]: c }, nd); if (r) return r; }
        }
        trace.push({ ...asg, __back: v }); return null;
      };
      bt({}, Object.fromEntries(order.map(v => [v, [0, 1, 2]])));
    };
    const draw = () => {
      const st = trace[Math.min(i, trace.length - 1)] || {};
      const backs = trace.slice(0, i + 1).filter(t => t.__back).length;
      el.innerHTML = `<div class="w-head"><label class="w-chip ${heur ? 'on' : ''}"><input type="checkbox" data-h ${heur ? 'checked' : ''}> MRV + degree + forward checking</label><div class="w-nav"><button type="button" class="primary" data-go>▶ Solve</button><button type="button" data-st>Step ▸</button></div></div>
      <svg viewBox="0 0 380 250" class="w-svg" style="max-height:280px">${Object.entries(NB).flatMap(([a, ns]) => ns.filter(b => a < b).map(b => `<line x1="${R[a][0]}" y1="${R[a][1]}" x2="${R[b][0]}" y2="${R[b][1]}" stroke="var(--line-strong)" stroke-width="2"/>`)).join('')}
        ${Object.entries(R).map(([n, [x, y]]) => { const v = st[n]; const fill = v == null ? 'var(--panel)' : v < 0 ? 'var(--bad-soft)' : COL[v]; return `<g><circle cx="${x}" cy="${y}" r="30" fill="${fill}" stroke="${v != null && v < 0 ? 'var(--bad)' : 'var(--ink)'}" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${v != null && v >= 0 ? '#fff' : 'var(--ink)'}">${n}</text></g>`; }).join('')}</svg>
      <div class="ag-stats"><div><b>${Math.min(i + 1, trace.length)}/${trace.length}</b><small>search steps</small></div><div><b>${backs}</b><small>backtracks so far</small></div></div>
      <p class="w-small">Red outline = a color rejected because a neighbor already has it. Without heuristics, plain ordering explores more dead ends; with MRV and forward checking it goes almost straight to a solution.</p>`;
    };
    solve();
    el.addEventListener('click', e => { if (e.target.closest('[data-st]')) { i = Math.min(trace.length - 1, i + 1); draw(); } if (e.target.closest('[data-go]')) { clearInterval(timer); i = 0; timer = setInterval(() => { i++; draw(); if (i >= trace.length - 1) clearInterval(timer); }, 220); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-h]')) { heur = e.target.checked; solve(); i = 0; draw(); } });
    draw();
  };

  /* 8. Wumpus-style cave: model checking for safe squares */
  T.wumpus = 'Interactive: inferring safe squares by model checking';
  W.wumpus = el => {
    const N = 4, PITS = new Set(['2,0', '2,2', '3,3']);
    let visited = new Set(['0,0']);
    const nb = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N).map(([a, b]) => a + ',' + b);
    const breeze = k => { const [x, y] = k.split(',').map(Number); return nb(x, y).some(n => PITS.has(n)); };
    const infer = () => {
      const frontier = [...new Set([...visited].flatMap(k => { const [x, y] = k.split(',').map(Number); return nb(x, y); }))].filter(k => !visited.has(k));
      const models = [];
      for (let m = 0; m < 1 << frontier.length; m++) { const pits = new Set(frontier.filter((_, i) => m >> i & 1)); const ok = [...visited].every(k => { const [x, y] = k.split(',').map(Number); return breeze(k) === nb(x, y).some(n => pits.has(n)); }); if (ok) models.push(pits); }
      const res = {}; frontier.forEach(k => { const n = models.filter(p => p.has(k)).length; res[k] = n === 0 ? 'safe' : n === models.length ? 'pit' : (n / models.length); });
      return { res, models: models.length };
    };
    const draw = () => {
      const { res, models } = infer(); const dead = [...visited].some(k => PITS.has(k));
      el.innerHTML = `<div class="ai-cave" style="grid-template-columns:repeat(${N},1fr)">${Array.from({ length: N * N }, (_, i) => { const y = N - 1 - (i / N | 0), x = i % N, k = x + ',' + y, v = visited.has(k), r = res[k];
        return `<button type="button" data-k="${k}" class="${v ? (PITS.has(k) ? 'fell' : 'vis') : r === 'safe' ? 'safe' : r === 'pit' ? 'pit' : r != null ? 'risk' : ''}">${v ? (PITS.has(k) ? '🕳' : breeze(k) ? '💨' : '·') : r === 'safe' ? '✓ safe' : r === 'pit' ? '🕳 pit!' : r != null ? `${Math.round(r * 100)}% pit*` : '?'}<small>${x},${y}</small></button>`; }).join('')}</div>
      <p class="w-status ${dead ? 'bad' : ''}">${dead ? '💀 You fell into a pit. Logic said it wasn\'t safe!' : `${models} pit arrangements are consistent with the percepts. A square is <b>provably safe</b> only if it has no pit in every one of them.`}</p>
      <div class="w-nav"><button type="button" data-reset>↺ Restart</button></div>
      <p class="w-small">Click an unvisited square next to the explored area to move there. 💨 = breeze (a pit is adjacent). *Share of consistent models with a pit there. Logic alone can\'t say more; probability (Part 4) can.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { const k = b.dataset.k; if (!visited.has(k) && [...visited].some(v => { const [x, y] = v.split(',').map(Number); return nb(x, y).includes(k); }) && ![...visited].some(v => PITS.has(v))) { visited.add(k); draw(); } } if (e.target.closest('[data-reset]')) { visited = new Set(['0,0']); draw(); } });
    draw();
  };

  /* 9. Forward chaining */
  T.chaining = 'Step through: forward chaining in first-order logic';
  W.chaining = el => {
    const rules = [['Parent(x,y) ∧ Parent(y,z)', 'Grandparent(x,z)', (F) => { const out = []; F.filter(f => f[0] === 'Parent').forEach(a => F.filter(f => f[0] === 'Parent' && f[1] === a[2]).forEach(b => out.push(['Grandparent', a[1], b[2]]))); return out; }], ['Parent(x,y)', 'Ancestor(x,y)', F => F.filter(f => f[0] === 'Parent').map(f => ['Ancestor', f[1], f[2]])], ['Ancestor(x,y) ∧ Parent(y,z)', 'Ancestor(x,z)', F => { const out = []; F.filter(f => f[0] === 'Ancestor').forEach(a => F.filter(f => f[0] === 'Parent' && f[1] === a[2]).forEach(b => out.push(['Ancestor', a[1], b[2]]))); return out; }]];
    const base = [['Parent', 'Ada', 'Ben'], ['Parent', 'Ben', 'Cleo'], ['Parent', 'Cleo', 'Dev']];
    let facts = base.map(f => [...f, 0]), round = 0;
    const s = f => `${f[0]}(${f[1]}, ${f[2]})`;
    const step = () => { round++; const known = new Set(facts.map(s)); const added = []; rules.forEach(r => r[2](facts).forEach(f => { if (!known.has(s(f))) { known.add(s(f)); added.push([...f, round]); } })); facts = facts.concat(added); return added.length; };
    const draw = (msg) => {
      el.innerHTML = `<div class="ml-split" style="align-items:start"><div><span class="w-label">Rules (∀ implied)</span>${rules.map(r => `<pre class="snip">${r[0]} ⇒ ${r[1]}</pre>`).join('')}</div>
      <div><span class="w-label">Known facts</span><div class="ai-facts">${facts.map(f => `<span class="r${Math.min(f[3], 3)}">${s(f)}${f[3] ? `<small>round ${f[3]}</small>` : ''}</span>`).join('')}</div></div></div>
      <div class="w-nav"><button type="button" class="primary" data-fc>Fire rules ▸</button><button type="button" data-rs>↺</button><span class="w-meter">query Ancestor(Ada, Dev): ${facts.some(f => s(f) === 'Ancestor(Ada, Dev)') ? '✓ proved' : '?'}</span></div>
      ${msg ? `<p class="w-small">${msg}</p>` : '<p class="w-small">Each round unifies rule premises with known facts (e.g. x/Ada, y/Ben, z/Cleo) and adds new conclusions, until nothing new can be derived: a <b>fixed point</b>.</p>'}`;
    };
    el.addEventListener('click', e => { if (e.target.closest('[data-fc]')) { const n = step(); draw(n ? `Round ${round}: ${n} new fact(s) derived.` : 'Fixed point reached: no new facts can be derived.'); } if (e.target.closest('[data-rs]')) { facts = base.map(f => [...f, 0]); round = 0; draw(); } });
    draw();
  };

  /* 10. Blocks world planner */
  T.blocksworld = 'Simulation: a STRIPS planner in the blocks world';
  W.blocksworld = el => {
    const init = { C: 'A', A: 'T', B: 'T' };
    const goals = { 'A on B on C': { A: 'B', B: 'C' }, 'C on B on A': { C: 'B', B: 'A' }, 'All on table': { A: 'T', B: 'T', C: 'T' } };
    let gk = 'A on B on C', plan = [], i = 0, timer, explored = 0;
    const clear = (s, x) => !Object.values(s).includes(x);
    const solve = () => { const g = goals[gk], key = s => JSON.stringify(s), q = [[init, []]], seen = new Set([key(init)]); explored = 0; while (q.length) { const [s, p] = q.shift(); explored++; if (Object.entries(g).every(([b, v]) => s[b] === v)) return p; for (const b of 'ABC') { if (!clear(s, b)) continue; for (const d of ['T', ...'ABC']) { if (d === b || d === s[b] || (d !== 'T' && !clear(s, d))) continue; const n = { ...s, [b]: d }; if (!seen.has(key(n))) { seen.add(key(n)); q.push([n, [...p, [b, s[b], d, n]]]); } } } } return []; };
    const stacks = s => { const tow = []; 'ABC'.split('').filter(b => s[b] === 'T').forEach(b => { const t = [b]; let top = b; while (true) { const up = 'ABC'.split('').find(x => s[x] === top); if (!up) break; t.push(up); top = up; } tow.push(t); }); return tow; };
    const draw = () => {
      const s = i === 0 ? init : plan[i - 1][3];
      el.innerHTML = `<div class="w-head">${seg('g', Object.keys(goals).map(k => [k, 'Goal: ' + k]), gk)}<div class="w-nav"><button type="button" class="primary" data-go>▶ Plan & execute</button></div></div>
      <div class="ai-blocks">${stacks(s).map(t => `<div>${t.slice().reverse().map(b => `<span class="b${b}">${b}</span>`).join('')}</div>`).join('')}<i></i></div>
      <ol class="ai-plan">${plan.map((p, k) => `<li class="${k < i ? 'done' : ''}">Move(${p[0]}, from ${p[1] === 'T' ? 'Table' : p[1]}, to ${p[2] === 'T' ? 'Table' : p[2]})</li>`).join('')}</ol>
      <p class="w-small">Breadth-first progression planning explored ${explored} states and found a ${plan.length}-step plan. Preconditions: the block and its destination must be clear.</p>`;
    };
    const go = () => { clearInterval(timer); plan = solve(); i = 0; draw(); timer = setInterval(() => { i++; draw(); if (i >= plan.length) clearInterval(timer); }, 700); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { gk = b.dataset.g; plan = []; i = 0; draw(); } if (e.target.closest('[data-go]')) go(); });
    draw();
  };

  /* 11. Bayes rule calculator */
  T.bayes = 'Interactive: Bayes\' rule and the base-rate trap';
  W.bayes = el => {
    let prev = 0.01, sens = 0.9, spec = 0.95;
    const draw = () => {
      const N = 1000, sick = Math.round(prev * N), tp = Math.round(sick * sens), fp = Math.round((N - sick) * (1 - spec)), post = tp / Math.max(1, tp + fp);
      el.innerHTML = `<div class="ml-grid4" style="grid-template-columns:repeat(3,1fr)">${[['prev', 'Prevalence', prev, 0.001, 0.5, 0.001], ['sens', 'Sensitivity P(+|disease)', sens, 0.5, 1, 0.01], ['spec', 'Specificity P(−|healthy)', spec, 0.5, 1, 0.01]].map(([k, l, v, mn, mx, st]) => `<label class="w-field">${l}: <b>${(v * 100).toFixed(k === 'prev' ? 1 : 0)}%</b><input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-k="${k}"></label>`).join('')}</div>
      <div class="ai-dots">${Array.from({ length: 200 }, (_, i) => { const id = i * 5; const isSick = id < sick, pos = isSick ? id < tp : id - sick < fp; return `<i class="${isSick ? 'sick' : ''} ${pos ? 'pos' : ''}"></i>`; }).join('')}</div>
      <p class="w-small">200 dots ≈ 1,000 people. Red fill = has the disease; ringed = tests positive. Of ${tp + fp} positives, only ${tp} are sick.</p>
      <div class="ag-stats"><div><b>${(post * 100).toFixed(1)}%</b><small>P(disease | positive)</small></div><div><b>${tp}</b><small>true positives</small></div><div><b>${fp}</b><small>false positives</small></div></div>`;
    };
    el.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { const v = +e.target.value; if (k === 'prev') prev = v; else if (k === 'sens') sens = v; else spec = v; draw(); keepFocus(el, `[data-k="${k}"]`); } });
    draw();
  };

  /* 12. Bayesian network */
  T.bayesnet = 'Interactive: inference in a Bayesian network';
  W.bayesnet = el => {
    const V = ['Storm', 'Outage', 'Traffic', 'Late'], P_S = 0.1, P_O = { true: 0.6, false: 0.05 }, P_T = { true: 0.7, false: 0.2 }, P_L = { 'true,true': 0.9, 'true,false': 0.6, 'false,true': 0.5, 'false,false': 0.05 };
    const ev = {};
    const pr = (p, v) => v ? p : 1 - p;
    const joint = (s, o, t, l) => pr(P_S, s) * pr(P_O[s], o) * pr(P_T[s], t) * pr(P_L[o + ',' + t], l);
    const post = v => { let num = 0, den = 0; for (let m = 0; m < 16; m++) { const a = [m & 1, m >> 1 & 1, m >> 2 & 1, m >> 3 & 1].map(Boolean), asg = Object.fromEntries(V.map((n, i) => [n, a[i]])); if (Object.entries(ev).some(([k, x]) => asg[k] !== x)) continue; const p = joint(...a); den += p; if (asg[v]) num += p; } return num / den; };
    const pos = { Storm: [300, 40], Outage: [150, 130], Traffic: [450, 130], Late: [300, 220] };
    const draw = () => {
      el.innerHTML = `<svg viewBox="0 0 600 270" class="w-svg" style="max-height:300px"><defs><marker id="bn" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
        ${[['Storm', 'Outage'], ['Storm', 'Traffic'], ['Outage', 'Late'], ['Traffic', 'Late']].map(([a, b]) => `<line x1="${pos[a][0]}" y1="${pos[a][1] + 24}" x2="${pos[b][0]}" y2="${pos[b][1] - 26}" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#bn)"/>`).join('')}
        ${V.map(n => { const p = post(n), e = ev[n]; return `<g data-n="${n}" style="cursor:pointer"><rect x="${pos[n][0] - 80}" y="${pos[n][1] - 24}" width="160" height="48" rx="12" fill="${e === true ? 'var(--accent)' : e === false ? 'var(--ink)' : 'var(--panel)'}" stroke="var(--accent)" stroke-width="2"/><text x="${pos[n][0]}" y="${pos[n][1] - 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${e != null ? 'var(--bg)' : 'var(--ink)'}">${n}${e != null ? (e ? ' = true' : ' = false') : ''}</text><rect x="${pos[n][0] - 60}" y="${pos[n][1] + 6}" width="120" height="8" rx="4" fill="var(--line)"/><rect x="${pos[n][0] - 60}" y="${pos[n][1] + 6}" width="${120 * p}" height="8" rx="4" fill="${e != null ? 'var(--bg)' : 'var(--accent)'}"/><text x="${pos[n][0] + 68}" y="${pos[n][1] + 14}" font-size="10" fill="${e != null ? 'var(--bg)' : 'var(--muted)'}">${(p * 100).toFixed(0)}%</text></g>`; }).join('')}</svg>
      <p class="w-small">Click a node to cycle evidence: unknown → true → false. Try <b>Late = true</b> (belief in Storm and Outage rises), then add <b>Traffic = true</b>: Outage <i>drops</i>. That is explaining away. All numbers come from exact inference by enumeration over the 16-row joint.</p>`;
    };
    el.addEventListener('click', e => { const g = e.target.closest('[data-n]'); if (g) { const n = g.dataset.n; ev[n] = ev[n] == null ? true : ev[n] ? false : undefined; if (ev[n] === undefined) delete ev[n]; draw(); } });
    draw();
  };

  /* 13. HMM filtering */
  T.hmm = 'Interactive: filtering a hidden state over time';
  W.hmm = el => {
    const TR = { H: { H: 0.9, D: 0.1 }, D: { H: 0.3, D: 0.7 } }, SE = { H: { alert: 0.1, quiet: 0.9 }, D: { alert: 0.7, quiet: 0.3 } };
    let obs = [];
    const filter = () => { let b = { H: 0.8, D: 0.2 }; return obs.map(e => { const p = { H: b.H * TR.H.H + b.D * TR.D.H, D: b.H * TR.H.D + b.D * TR.D.D }; const u = { H: p.H * SE.H[e], D: p.D * SE.D[e] }; const z = u.H + u.D; b = { H: u.H / z, D: u.D / z }; return b.D; }); };
    const draw = () => {
      const f = filter();
      el.innerHTML = `<div class="w-head"><strong>Observe:</strong><div class="w-nav"><button type="button" data-o="quiet">🔕 quiet</button><button type="button" data-o="alert" class="primary">🚨 alert</button><button type="button" data-rs>↺</button></div></div>
      <div class="ai-hmm">${f.length ? f.map((p, i) => `<div><span class="ai-bar" style="--p:${p}"><i></i></span><b>${Math.round(p * 100)}%</b><small>${obs[i] === 'alert' ? '🚨' : '🔕'} t=${i + 1}</small></div>`).join('') : '<p class="w-small">Add observations to see the belief P(Degraded) evolve.</p>'}</div>
      <p class="w-small">Each step: <b>predict</b> with the transition model (a degraded server tends to stay degraded), then <b>update</b> with the sensor model (alerts are 7× likelier when degraded) and normalize. One alert isn\'t conclusive; several in a row are.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b && obs.length < 14) { obs.push(b.dataset.o); draw(); } if (e.target.closest('[data-rs]')) { obs = []; draw(); } });
    draw();
  };

  /* 14. MDP grid with value iteration */
  T.mdpgrid = 'Interactive: value iteration on a grid world';
  W.mdpgrid = el => {
    const Wd = 4, Hd = 3, WALL = '1,1', TERM = { '3,2': 1, '3,1': -1 };
    const MV = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }, SD = { U: ['L', 'R'], D: ['L', 'R'], L: ['U', 'D'], R: ['U', 'D'] }, AR = { U: '↑', D: '↓', L: '←', R: '→' };
    let r = -0.04, noise = 0.2, iters = 0, U = {};
    const S = []; for (let x = 0; x < Wd; x++) for (let y = 0; y < Hd; y++) if (x + ',' + y !== WALL) S.push([x, y]);
    const stp = ([x, y], a) => { const nx = x + MV[a][0], ny = y + MV[a][1]; return nx >= 0 && ny >= 0 && nx < Wd && ny < Hd && nx + ',' + ny !== WALL ? nx + ',' + ny : x + ',' + y; };
    const q = (s, a) => r + (1 - noise) * U[stp(s, a)] + noise / 2 * (U[stp(s, SD[a][0])] + U[stp(s, SD[a][1])]);
    const reset = () => { iters = 0; S.forEach(s => U[s.join(',')] = TERM[s.join(',')] ?? 0); };
    const iterate = n => { for (let k = 0; k < n; k++) { const nu = { ...U }; S.forEach(s => { const key = s.join(','); if (!(key in TERM)) nu[key] = Math.max(...'UDLR'.split('').map(a => q(s, a))); }); U = nu; iters++; } };
    const draw = () => {
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Living reward <input type="range" min="-2" max="0.1" step="0.01" value="${r}" data-r> <b>${r.toFixed(2)}</b></label><label class="w-field inline">Noise <input type="range" min="0" max="0.6" step="0.05" value="${noise}" data-n> <b>${Math.round(noise * 100)}%</b></label></div>
      <div class="ai-mdp">${Array.from({ length: Wd * Hd }, (_, i) => { const y = Hd - 1 - (i / Wd | 0), x = i % Wd, key = x + ',' + y; if (key === WALL) return '<i class="wall"></i>'; if (key in TERM) return `<i class="${TERM[key] > 0 ? 'win' : 'lose'}">${TERM[key] > 0 ? '+1' : '−1'}</i>`; const v = U[key], best = 'UDLR'.split('').reduce((a, b) => q([x, y], b) > q([x, y], a) ? b : a); return `<i style="--v:${Math.max(-1, Math.min(1, v)).toFixed(2)}"><b>${iters ? AR[best] : ''}</b><small>${v.toFixed(3)}</small></i>`; }).join('')}</div>
      <div class="w-nav"><button type="button" class="primary" data-it="1">Iterate ×1</button><button type="button" data-it="50">×50</button><button type="button" data-rs>↺ Reset</button><span class="w-meter">iterations: ${iters}</span></div>
      <p class="w-small">Values spread back from the exits with each Bellman update. Try living reward −0.04 (careful routes), −2 (rush to any exit, even −1) and +0.05 (never leave, enjoy living).</p>`;
    };
    reset();
    el.addEventListener('input', e => { if (e.target.matches('[data-r]')) { r = +e.target.value; reset(); iterate(60); draw(); keepFocus(el, '[data-r]'); } if (e.target.matches('[data-n]')) { noise = +e.target.value; reset(); iterate(60); draw(); keepFocus(el, '[data-n]'); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-it]'); if (b) { iterate(+b.dataset.it); draw(); } if (e.target.closest('[data-rs]')) { reset(); draw(); } });
    draw();
  };

  /* 15. Game theory payoff matrix */
  T.gametheory = 'Interactive: find the Nash equilibria';
  W.gametheory = el => {
    const G = { "Prisoner's dilemma": [['Cooperate', 'Defect'], [[[-1, -1], [-10, 0]], [[0, -10], [-5, -5]]]], 'Coordination': [['Left', 'Right'], [[[2, 2], [0, 0]], [[0, 0], [1, 1]]]], 'Chicken': [['Swerve', 'Straight'], [[[0, 0], [-1, 1]], [[1, -1], [-10, -10]]]], 'Matching pennies': [['Heads', 'Tails'], [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]]] };
    let g = "Prisoner's dilemma", M = JSON.parse(JSON.stringify(G[g][1]));
    const draw = () => {
      const A = G[g][0], br1 = [0, 1].map(c => Math.max(M[0][c][0], M[1][c][0])), br2 = [0, 1].map(r => Math.max(M[r][0][1], M[r][1][1]));
      const ne = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) if (M[r][c][0] === br1[c] && M[r][c][1] === br2[r]) ne.push([r, c]);
      el.innerHTML = `<div class="w-head">${seg('g', Object.keys(G).map(k => [k, k]), g)}</div>
      <div class="w-tablewrap"><table class="w-table ai-pay"><thead><tr><th>Row \\ Column</th>${A.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${[0, 1].map(r => `<tr><th>${A[r]}</th>${[0, 1].map(c => `<td class="${ne.some(([a, b]) => a === r && b === c) ? 'ne' : ''}"><input type="number" data-rc="${r},${c},0" value="${M[r][c][0]}" class="${M[r][c][0] === br1[c] ? 'br' : ''}" aria-label="row payoff"> , <input type="number" data-rc="${r},${c},1" value="${M[r][c][1]}" class="${M[r][c][1] === br2[r] ? 'br' : ''}" aria-label="column payoff"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="w-status ${ne.length ? 'good' : 'warn'}">${ne.length ? `Pure Nash equilibri${ne.length > 1 ? 'a' : 'um'}: ${ne.map(([r, c]) => `(${A[r]}, ${A[c]})`).join(', ')}` : 'No pure-strategy equilibrium: players must randomize (a mixed equilibrium).'}</p>
      <p class="w-small">Highlighted numbers are best responses (row player picks the row given the column, and vice versa). Cells where both are best responses are equilibria. Edit the payoffs to experiment.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { g = b.dataset.g; M = JSON.parse(JSON.stringify(G[g][1])); draw(); } });
    el.addEventListener('change', e => { const k = e.target.dataset.rc; if (k) { const [r, c, p] = k.split(',').map(Number); M[r][c][p] = +e.target.value || 0; draw(); } });
    draw();
  };

  /* 16. Information gain */
  T.infogain = 'Interactive: choose the best decision-tree split';
  W.infogain = el => {
    const R = [['rain', 'yes', 'weekday', 1], ['rain', 'no', 'weekday', 1], ['sun', 'yes', 'weekday', 1], ['sun', 'no', 'weekday', 0], ['sun', 'no', 'weekend', 0], ['cloud', 'yes', 'weekday', 1], ['cloud', 'no', 'weekend', 0], ['rain', 'no', 'weekday', 0]];
    const A = ['weather', 'rush hour', 'day'];
    const H = ys => { if (!ys.length) return 0; const p = ys.filter(Boolean).length / ys.length; return p === 0 || p === 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)); };
    let a = null;
    const gain = i => { const vals = [...new Set(R.map(r => r[i]))]; return H(R.map(r => r[3])) - vals.reduce((s, v) => { const sub = R.filter(r => r[i] === v).map(r => r[3]); return s + sub.length / R.length * H(sub); }, 0); };
    const draw = () => {
      el.innerHTML = `<div class="w-head"><strong>Will the bus be late?</strong>${seg('a', A.map((n, i) => [i, `Split on ${n}`]), a)}</div>
      ${tbl()}
      ${a != null ? `<div class="ai-split">${[...new Set(R.map(r => r[a]))].map(v => { const sub = R.filter(r => r[a] === v).map(r => r[3]); return `<div><b>${A[a]} = ${v}</b><span>${sub.map(y => y ? '🟥' : '🟩').join('')}</span><small>entropy ${H(sub).toFixed(3)}</small></div>`; }).join('')}</div>` : ''}
      <div class="ag-stats">${A.map((n, i) => `<div class="${i === a ? 'good' : ''}"><b>${gain(i).toFixed(3)}</b><small>gain(${n})</small></div>`).join('')}</div>
      <p class="w-small">Root entropy is 1 bit (4 late 🟥, 4 on time 🟩). Information gain = root entropy − weighted entropy after the split. The greedy learner picks the highest gain, here rush hour, then recurses on each branch.</p>`;
    };
    const tbl = () => `<div class="w-tablewrap"><table class="w-table"><thead><tr>${A.map(x => `<th>${x}</th>`).join('')}<th>late?</th></tr></thead><tbody>${R.map(r => `<tr>${r.slice(0, 3).map((v, i) => `<td class="${i === a ? 'hl' : ''}">${v}</td>`).join('')}<td>${r[3] ? 'yes' : 'no'}</td></tr>`).join('')}</tbody></table></div>`;
    el.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { a = +b.dataset.a; draw(); } });
    draw();
  };

  /* 17. Beta-Bernoulli coin */
  T.betacoin = 'Interactive: Bayesian learning of a coin\'s bias';
  W.betacoin = el => {
    let h = 0, n = 0, a = 2, b = 2, trueP = 0.7, r = rng(5);
    const lgamma = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (const k of c) ser += k / ++y; return -tmp + Math.log(2.5066282746310005 * ser / x); };
    const pdf = (x, A, B) => Math.exp((A - 1) * Math.log(x) + (B - 1) * Math.log(1 - x) - (lgamma(A) + lgamma(B) - lgamma(A + B)));
    const draw = () => {
      const A = a + h, B = b + n - h, xs = Array.from({ length: 99 }, (_, i) => (i + 1) / 100), ys = xs.map(x => pdf(x, A, B)), my = Math.max(...ys);
      el.innerHTML = `<div class="w-head"><div class="w-nav"><button type="button" class="primary" data-f="1">Flip ×1</button><button type="button" data-f="10">×10</button><button type="button" data-f="100">×100</button><button type="button" data-rs>↺</button></div>${seg('pr', [['1,1', 'Uniform prior Beta(1,1)'], ['2,2', 'Weak prior Beta(2,2)'], ['20,20', 'Strong "fair coin" prior Beta(20,20)']], a + ',' + b)}</div>
      <svg viewBox="0 0 600 180" class="w-svg"><polyline fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5" points="20,160 ${xs.map((x, i) => `${20 + x * 560},${160 - ys[i] / my * 140}`).join(' ')} 580,160"/><line x1="${20 + trueP * 560}" y1="10" x2="${20 + trueP * 560}" y2="160" stroke="var(--ok)" stroke-dasharray="4 3"/><text x="${24 + trueP * 560}" y="22" font-size="10" fill="var(--ok)">true bias 0.7 (hidden)</text>${n ? `<line x1="${20 + h / n * 560}" y1="10" x2="${20 + h / n * 560}" y2="160" stroke="var(--bad)" stroke-dasharray="2 3"/>` : ''}<text x="300" y="176" font-size="10" text-anchor="middle" fill="var(--muted)">P(heads) →</text></svg>
      <div class="ag-stats"><div><b>${h}/${n}</b><small>heads / flips</small></div><div><b>${n ? (h / n).toFixed(2) : '-'}</b><small>MLE (red)</small></div><div><b>${(A / (A + B)).toFixed(2)}</b><small>posterior mean</small></div></div>
      <p class="w-small">The curve is the posterior Beta(${A}, ${B}) over the coin\'s bias. Early on, the prior keeps estimates sensible (no "100% heads after 3 heads"); as data grows, the posterior narrows around the truth whatever the prior.</p>`;
    };
    el.addEventListener('click', e => { const f = e.target.closest('[data-f]'); if (f) { for (let i = 0; i < +f.dataset.f; i++) { n++; if (r() < trueP) h++; } draw(); } if (e.target.closest('[data-rs]')) { h = n = 0; draw(); } const p = e.target.closest('[data-pr]'); if (p) { [a, b] = p.dataset.pr.split(',').map(Number); draw(); } });
    draw();
  };

  /* 18. N-gram language model */
  T.ngram = 'Interactive: a bigram language model';
  W.ngram = el => {
    const corpus = 'the robot sees the ball . the robot grabs the ball . a robot sees a cup . the cup is red . the ball is blue . a child sees the robot . the child grabs a cup .';
    const toks = corpus.split(' '), bi = {}, uni = {};
    for (let i = 0; i < toks.length - 1; i++) { const a = toks[i], b = toks[i + 1]; (bi[a] = bi[a] || {})[b] = (bi[a][b] || 0) + 1; uni[a] = (uni[a] || 0) + 1; }
    const V = [...new Set(toks)];
    let prev = 'the', smooth = false, gen = [], r = rng(11);
    const dist = p => V.map(w => [w, ((bi[p] || {})[w] || 0) + (smooth ? 1 : 0)]).filter(x => x[1] > 0).map(([w, c]) => [w, c / ((uni[p] || 0) + (smooth ? V.length : 0))]).sort((a, b) => b[1] - a[1]);
    const generate = () => { let w = '.', out = []; for (let k = 0; k < 14; k++) { const d = dist(w); let x = r(), acc = 0, pick = d[0][0]; for (const [t, p] of d) { acc += p; if (x <= acc) { pick = t; break; } } if (pick === '.' && out.length > 2) break; if (pick !== '.') out.push(pick); w = pick; } return out.join(' '); };
    const draw = () => {
      const d = dist(prev);
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Previous word <select data-p>${V.filter(w => w !== '.').map(w => `<option ${w === prev ? 'selected' : ''}>${w}</option>`).join('')}</select></label><label class="w-chip ${smooth ? 'on' : ''}"><input type="checkbox" data-s ${smooth ? 'checked' : ''}> Add-one smoothing</label></div>
      <div class="pe-bars">${d.slice(0, 8).map(([w, p]) => `<div><span>${w === '.' ? '&lt;/s&gt;' : w}</span><div class="ag-hbar"><i style="width:${p * 100}%"></i><span>${(p * 100).toFixed(1)}%</span></div></div>`).join('')}${d.length > 8 ? `<p class="w-small">…and ${d.length - 8} more words with small probabilities</p>` : ''}</div>
      <div class="w-nav"><button type="button" class="primary" data-g>🎲 Generate a sentence</button></div>
      ${gen.length ? `<div class="ai-gen">${gen.map(s => `<p>“${esc(s)}”</p>`).join('')}</div>` : ''}
      <p class="w-small">P(next | previous) = count(previous, next) / count(previous), learned from 7 tiny sentences. Without smoothing, any unseen pair has probability 0; smoothing gives every word a little mass. LLMs are, at heart, vastly better next-token predictors.</p>`;
    };
    el.addEventListener('change', e => { if (e.target.matches('[data-p]')) { prev = e.target.value; draw(); } if (e.target.matches('[data-s]')) { smooth = e.target.checked; draw(); } });
    el.addEventListener('click', e => { if (e.target.closest('[data-g]')) { gen = [generate(), ...gen].slice(0, 4); draw(); } });
    draw();
  };

  /* 19. Particle filter localization */
  T.particlefilter = 'Simulation: particle-filter robot localization';
  W.particlefilter = el => {
    const N = 60, DOORS = [8, 22, 40], NP = 150;
    let r = rng(7), robot = 3, parts, t = 0;
    const isDoor = x => DOORS.some(d => Math.abs(((x % N) + N) % N - d) <= 1.5);
    const reset = () => { r = rng(7 + t); robot = 3; t = 0; parts = Array.from({ length: NP }, () => r() * N); };
    const step = () => {
      robot = (robot + 2) % N;
      const z = isDoor(robot) ? r() < 0.9 : r() < 0.1;
      parts = parts.map(p => (p + 2 + (r() - 0.5) * 1.2 + N) % N);
      const w = parts.map(p => (isDoor(p) === z ? 0.9 : 0.1));
      const tot = w.reduce((a, b) => a + b, 0), out = []; let u = r() / NP, c = w[0] / tot, i = 0;
      for (let k = 0; k < NP; k++) { const target = u + k / NP; while (target > c && i < NP - 1) { i++; c += w[i] / tot; } out.push((parts[i] + (r() - 0.5) * 0.6 + N) % N); }
      parts = out; t++;
      return z;
    };
    let lastZ = null;
    const draw = () => {
      const X = x => 20 + x / N * 560, hist = Array(N).fill(0); parts.forEach(p => hist[Math.floor(p) % N]++); const mx = Math.max(...hist);
      el.innerHTML = `<svg viewBox="0 0 600 150" class="w-svg"><rect x="20" y="88" width="560" height="10" rx="5" fill="var(--line)"/>${DOORS.map(d => `<rect x="${X(d - 1.5)}" y="60" width="${560 / N * 3}" height="38" fill="var(--warn-soft)" stroke="var(--warn)"/><text x="${X(d)}" y="56" text-anchor="middle" font-size="10" fill="var(--muted)">door</text>`).join('')}
        ${hist.map((h, i) => h ? `<rect x="${X(i)}" y="${148 - h / mx * 40}" width="${560 / N - 1}" height="${h / mx * 40}" fill="var(--accent)" opacity=".75"/>` : '').join('')}
        <text x="${X(robot)}" y="84" text-anchor="middle" font-size="22">🤖</text></svg>
      <div class="w-nav"><button type="button" class="primary" data-step>Move & sense ▸</button><button type="button" data-rs>↺ Reset</button><span class="w-meter">t=${t} · sensor: ${lastZ == null ? '-' : lastZ ? '🚪 door' : '🧱 wall'}</span></div>
      <p class="w-small">Bars = where the ${NP} particles think the robot is. At first they are spread everywhere; each step they move (with noise), get weighted by how well they explain the door sensor, and are resampled. After passing a couple of doors, the cloud collapses onto the true position.</p>`;
    };
    reset();
    el.addEventListener('click', e => { if (e.target.closest('[data-step]')) { lastZ = step(); draw(); } if (e.target.closest('[data-rs]')) { lastZ = null; reset(); draw(); } });
    draw();
  };

  /* 20. Fairness trade-offs */
  T.fairness = 'Interactive: fairness metrics for a loan model';
  W.fairness = el => {
    const mk = (seed, mu1, mu0, n) => { const r = rng(seed), g = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }; return Array.from({ length: n }, (_, i) => { const y = i < n * 0.5; return [Math.min(1, Math.max(0, (y ? mu1 : mu0) + g() * 0.15)), y]; }); };
    const A = mk(3, 0.62, 0.38, 200), B = mk(9, 0.52, 0.3, 200);
    let ta = 0.5, tb = 0.5;
    const stats = (D, t) => { const sel = D.filter(d => d[0] >= t).length / D.length, pos = D.filter(d => d[1]), tpr = pos.filter(d => d[0] >= t).length / pos.length, acc = D.filter(d => (d[0] >= t) === d[1]).length / D.length; return { sel, tpr, acc }; };
    const draw = () => {
      const a = stats(A, ta), b = stats(B, tb), di = Math.min(a.sel, b.sel) / Math.max(a.sel, b.sel), eo = Math.abs(a.tpr - b.tpr);
      el.innerHTML = `<div class="ml-grid4" style="grid-template-columns:1fr 1fr"><label class="w-field">Group A threshold: <b>${ta.toFixed(2)}</b><input type="range" min="0.1" max="0.9" step="0.01" value="${ta}" data-a></label><label class="w-field">Group B threshold: <b>${tb.toFixed(2)}</b><input type="range" min="0.1" max="0.9" step="0.01" value="${tb}" data-b></label></div>
      <div class="w-tablewrap"><table class="w-table"><thead><tr><th></th><th>Approval rate</th><th>TPR (approved | would repay)</th><th>Accuracy</th></tr></thead><tbody><tr><th>Group A</th><td>${(a.sel * 100).toFixed(0)}%</td><td>${(a.tpr * 100).toFixed(0)}%</td><td>${(a.acc * 100).toFixed(0)}%</td></tr><tr><th>Group B</th><td>${(b.sel * 100).toFixed(0)}%</td><td>${(b.tpr * 100).toFixed(0)}%</td><td>${(b.acc * 100).toFixed(0)}%</td></tr></tbody></table></div>
      <div class="ag-stats"><div class="${di >= 0.8 ? 'good' : 'bad'}"><b>${di.toFixed(2)}</b><small>disparate impact (≥ 0.8 passes the "4/5 rule")</small></div><div class="${eo <= 0.05 ? 'good' : 'bad'}"><b>${(eo * 100).toFixed(0)} pts</b><small>equal-opportunity gap</small></div></div>
      <p class="w-small">The model\'s scores run lower for group B. One shared threshold gives unequal outcomes; per-group thresholds can equalize approval rates <i>or</i> TPRs, but usually not both, and each choice has costs. Fairness is a design decision to make explicitly and transparently.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-a]')) { ta = +e.target.value; draw(); keepFocus(el, '[data-a]'); } if (e.target.matches('[data-b]')) { tb = +e.target.value; draw(); keepFocus(el, '[data-b]'); } });
    draw();
  };
})();
