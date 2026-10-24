/* Widgets for the "Building LLM applications" part of the Prompt Engineering course (+ case studies). */
(() => {
  'use strict';
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, l]) => `<button type="button" data-${name}="${v}" class="${String(v) === String(active) ? 'on' : ''}" aria-pressed="${String(v) === String(active)}">${l}</button>`).join('')}</div>`;
  const keepFocus = (el, sel) => { const n = el.querySelector(sel); if (n) n.focus(); };
  const words = t => t.split(/\s+/).filter(Boolean).length;

  /* Case studies: diagnose the failure */
  T.casestudy = 'Case studies: diagnose the failure, pick the fix';
  W.casestudy = el => {
    const C = [
      { t: '✍️ Creative flop', prompt: 'Write a poem.', out: 'Roses are red, the sky is blue, I wrote this poem just for you…', fixes: ['Ask it to "be more creative"', 'Add a sparking constraint: "a 12-line poem about a lighthouse keeper\'s last night, no rhyming, ending on an image of light"', 'Lower the temperature to 0'], ok: 1, why: 'Open prompts produce the most average (cliché) text. Specific, generative constraints give the model something interesting to work with.' },
      { t: '🧮 Wrong math', prompt: 'A jacket costs $80, is discounted 25%, then taxed 10%. Final price? Just the number.', out: '$90', fixes: ['Ask for the reasoning steps before a marked final answer', 'Repeat the question twice', 'Ask for the answer in bold'], ok: 0, why: '"Just the number" forbids reasoning. Letting the model work step by step (80 → 60 → 66) fixes multi-step arithmetic.' },
      { t: '📚 Invented facts', prompt: 'List 3 studies proving our app improves sleep.', out: '1. Harvard Sleep Study (2021) found a 34% improvement…', fixes: ['Ask for "more recent" studies', 'Supply the real sources, ask for citations to them only, and allow "no evidence found"', 'Use a friendlier tone'], ok: 1, why: 'The prompt presupposes evidence exists, so the model invents it. Ground it in provided sources and permit a "not found" answer.' },
      { t: '⚖️ Wrong domain', prompt: 'Is this clause okay? "Tenant waives all rights to repairs."', out: 'Yes, that looks fine and clear!', fixes: ['Add "be careful"', 'Name the jurisdiction and role ("review as a tenant-rights advisor in Ontario"), ask for risks and a recommendation to consult a lawyer', 'Ask for a shorter answer'], ok: 1, why: 'Domain prompts need the jurisdiction, perspective and risk framing, plus a pointer to professional advice for high stakes.' }
    ];
    const pick = {};
    const draw = () => {
      const done = Object.keys(pick).length, right = Object.entries(pick).filter(([i, a]) => C[i].ok === a).length;
      el.innerHTML = `<div class="ml-cards">${C.map((c, i) => `<div class="ml-card ${pick[i] != null ? (pick[i] === c.ok ? 'ok' : 'no') : ''}"><b>${c.t}</b><pre class="snip">Prompt: ${esc(c.prompt)}\nOutput: ${esc(c.out)}</pre><div class="pe-opts">${c.fixes.map((f, k) => `<button type="button" data-c="${i}" data-k="${k}" class="${pick[i] === k ? 'on' : ''} ${pick[i] != null && k === c.ok ? 'right' : ''}">${esc(f)}</button>`).join('')}</div>${pick[i] != null ? `<p class="w-small">${pick[i] === c.ok ? '✓ ' : '✗ '}${esc(c.why)}</p>` : ''}</div>`).join('')}</div>
      <p class="w-status ${done === C.length ? (right === C.length ? 'good' : 'warn') : ''}">${done ? `${right}/${done} diagnosed correctly.` : 'Pick the smallest fix that addresses the root cause.'}</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { pick[b.dataset.c] = +b.dataset.k; draw(); } });
    draw();
  };

  /* The application loop */
  T.apploop = 'Step through: one request in an LLM application';
  W.apploop = el => {
    const S = [
      ['user', '🧑 User problem', 'In the app: "Plan our first evening in Lisbon."', ''],
      ['ff', '① Retrieve context', 'The app gathers: user profile, trip dates, a guidebook search, past chats.', 'profile · dates · 6 guide passages · 14 past messages'],
      ['ff', '② Snippetize', 'Cut everything into prompt-sized snippets, some with long/short versions.', '23 snippets'],
      ['ff', '③ Score & prioritize', 'Rank by relevance to "first evening": sunset spots and dinner > museums.', 'top: Alfama sunset, fado dinner, profile'],
      ['ff', '④ Assemble prompt', 'Fit the best snippets into the token budget, laid out as a familiar document.', '# Trip notes … ## Question … ## Answer'],
      ['model', '🤖 Model completion', 'The model continues the document after "## Answer".', '"Start at Miradouro da Senhora do Monte for sunset, then…"'],
      ['ff', '⑤ Post-process', 'Stop at the next heading, parse places, add map links, check opening hours.', '3 stops, 2 map links, 1 booking link'],
      ['user', '🧑 Answer', 'The user sees a tidy plan in the app, not raw model text.', '']
    ];
    let i = 0;
    const draw = () => {
      el.innerHTML = `<div class="pe-loop">${S.map((s, k) => `<button type="button" data-s="${k}" class="${s[0]} ${k === i ? 'cur' : k < i ? 'done' : ''}">${s[1]}</button>`).join('<span>→</span>')}</div>
      <div class="pe-domains"><span class="${S[i][0] === 'user' ? 'on' : ''}">User domain</span><span class="${S[i][0] === 'ff' ? 'on' : ''}">Application code</span><span class="${S[i][0] === 'model' ? 'on' : ''}">Model domain (text)</span></div>
      <div class="w-card"><span class="w-label">${S[i][1]}</span><p>${esc(S[i][2])}</p>${S[i][3] ? `<code>${esc(S[i][3])}</code>` : ''}</div>
      <div class="w-nav"><button type="button" data-s="${Math.max(0, i - 1)}" ${i ? '' : 'disabled'}>← Back</button><button type="button" class="primary" data-s="${Math.min(S.length - 1, i + 1)}" ${i < S.length - 1 ? '' : 'disabled'}>Next →</button></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b && !b.disabled) { i = +b.dataset.s; draw(); } });
    draw();
  };

  /* Prompt assembly under a token budget */
  T.assembly = 'Interactive: assembling a prompt within a token budget';
  W.assembly = el => {
    const S = [
      { id: 'Instructions', pr: 10, pos: 0, v: ['You are a travel concierge. Recommend specific places with times, and say when something is closed.'] },
      { id: 'Question', pr: 9, pos: 9, v: ['Question: plan our first evening in Lisbon (Friday).'] },
      { id: 'Profile', pr: 7, pos: 1, v: ['Traveler profile: two adults in their 30s who love food markets, tile museums and sunset viewpoints; vegetarian.', 'Traveler: vegetarian foodie couple.'] },
      { id: 'Guide: Alfama', pr: 6, pos: 2, v: ['Guide: Alfama is the oldest district, with narrow lanes, fado houses and several viewpoints; best at sunset; steep cobbled streets.', 'Guide: Alfama, old district, sunset viewpoints.'] },
      { id: 'Guide: dining', pr: 5, pos: 3, v: ['Guide: Time Out Market (open until midnight) has many vegetarian stalls; book fado dinners in advance on Fridays.', 'Guide: Time Out Market, vegetarian options.'] },
      { id: 'Example answer', pr: 3, pos: 4, v: ['Example of a good answer: "18:30 — sunset at Miradouro X. 20:00 — dinner at Y (book ahead)."'] },
      { id: 'Chat history', pr: 2, pos: 5, v: ['Earlier: user said they land at 15:00 and prefer walking over taxis; they disliked crowded bars last trip.', 'Earlier: lands 15:00, prefers walking.'] }
    ];
    let budget = 70;
    const draw = () => {
      let left = budget; const pick = {};
      [...S].sort((a, b) => b.pr - a.pr).forEach(s => { for (let k = 0; k < s.v.length; k++) { if (words(s.v[k]) <= left) { pick[s.id] = k; left -= words(s.v[k]); break; } } });
      const inc = S.filter(s => pick[s.id] != null).sort((a, b) => a.pos - b.pos);
      el.innerHTML = `<label class="w-field">Token budget (≈ words): <b>${budget}</b><input type="range" min="15" max="110" step="1" value="${budget}" data-b></label>
      <div class="ml-split" style="align-items:start"><div class="pe-snips">${[...S].sort((a, b) => b.pr - a.pr).map(s => { const k = pick[s.id]; return `<div class="${k == null ? 'out' : k > 0 ? 'short' : 'in'}"><b>${esc(s.id)}</b><small>priority ${s.pr} · ${s.v.map(v => words(v)).join(' / ')} tok</small><span>${k == null ? '✗ dropped' : k > 0 ? '↘ short version' : '✓ full'}</span></div>`; }).join('')}</div>
      <div><span class="w-label">Assembled prompt (ordered by position) · ${budget - left}/${budget}</span><pre class="snip pe-prompt">${esc(inc.map(s => s.v[pick[s.id]]).join('\n\n'))}</pre></div></div>
      <p class="w-small">Highest priority first, longest version that fits, then laid out by position, so the question always ends the prompt even though it was chosen second.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-b]')) { budget = +e.target.value; draw(); keepFocus(el, '[data-b]'); } });
    draw();
  };

  /* Logprobs & confidence */
  T.logprobs = 'Interactive: logprobs, confidence & abstaining';
  W.logprobs = el => {
    const X = [
      ['"My card was charged twice for one order."', { billing: -0.05, shipping: -3.4, other: -4.1 }],
      ['"Where is my parcel? Tracking hasn\'t moved."', { billing: -3.9, shipping: -0.08, other: -3.0 }],
      ['"The refund for my late delivery never arrived."', { billing: -0.9, shipping: -0.8, other: -3.2 }],
      ['"Can you recommend a good book on gardening?"', { billing: -2.6, shipping: -2.9, other: -0.3 }],
      ['"I got charged a customs fee on delivery?"', { billing: -1.0, shipping: -1.2, other: -1.6 }]
    ];
    const tokens = [['The', -0.01], [' order', -0.2], [' shipped', -1.9], [' on', -0.1], [' Tuesday', -2.6], [' via', -0.4], [' DHL', -3.3], ['.', -0.02]];
    let th = 0.7;
    const norm = o => { const m = Math.max(...Object.values(o)); const e = Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.exp(v - m)])); const z = Object.values(e).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v / z])); };
    const draw = () => {
      el.innerHTML = `<span class="w-label">Per-token confidence in a completion (redder = less sure)</span>
      <div class="pe-toks">${tokens.map(([t, lp]) => `<span style="--u:${Math.min(1, -lp / 3.5).toFixed(2)}" title="logprob ${lp} · p=${Math.exp(lp).toFixed(2)}">${esc(t)}</span>`).join('')}</div>
      <p class="w-small">Sequence probability = exp(Σ logprobs) = ${Math.exp(tokens.reduce((a, t) => a + t[1], 0)).toFixed(4)}. The uncertain spots ("Tuesday", "DHL") are where the model may be guessing: verify them or retrieve facts.</p>
      <label class="w-field">Auto-route threshold: <b>${Math.round(th * 100)}%</b><input type="range" min="0.34" max="0.95" step="0.01" value="${th}" data-th></label>
      <div class="w-tablewrap"><table class="w-table ag-ev"><thead><tr><th>Ticket</th><th>billing</th><th>shipping</th><th>other</th><th>Decision</th></tr></thead><tbody>${X.map(([t, lp]) => { const p = norm(lp), best = Object.keys(p).reduce((a, b) => p[a] > p[b] ? a : b), ok = p[best] >= th; return `<tr class="${ok ? 'ok' : 'no'}"><td>${esc(t)}</td>${['billing', 'shipping', 'other'].map(k => `<td style="background:rgba(14,165,183,${(p[k] * 0.5).toFixed(2)})">${Math.round(p[k] * 100)}%</td>`).join('')}<td>${ok ? '→ ' + best : '🙋 human review'}</td></tr>`; }).join('')}</tbody></table></div>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-th]')) { th = +e.target.value; draw(); keepFocus(el, '[data-th]'); } });
    draw();
  };

  /* Tool design */
  T.tooldesign = 'Interactive: designing tools the model can use';
  W.tooldesign = el => {
    const F = [['name', 'Specific snake_case name', 14], ['desc', 'Description says what AND when', 22], ['few', 'Few, focused parameters', 14], ['pdesc', 'Every parameter described', 12], ['enum', 'Enums instead of free text', 10], ['errors', 'Actionable error messages', 8]];
    const on = { name: false, desc: false, few: false, pdesc: false, enum: false, errors: false };
    const draw = () => {
      const acc = 20 + F.reduce((a, f) => a + (on[f[0]] ? f[2] : 0), 0);
      const def = {
        name: on.name ? 'get_order_status' : 'doLookup',
        description: on.desc ? 'Look up the current shipping status of a customer order by order ID. Use when the user asks where an order is or when it will arrive.' : 'looks things up',
        parameters: { type: 'object', properties: Object.assign({ order_id: Object.assign({ type: 'string' }, on.pdesc ? { description: 'Order ID like "BL-10423"' } : {}) }, on.enum ? { detail: { type: 'string', enum: ['summary', 'full_tracking'], description: on.pdesc ? 'How much tracking detail to return' : undefined } } : { detail: { type: 'string' } }, on.few ? {} : { region: { type: 'string' }, format: { type: 'string' }, legacy_flag: { type: 'boolean' }, user_note: { type: 'string' } }), required: ['order_id'] }
      };
      el.innerHTML = `<div class="w-chips">${F.map(f => `<label class="w-chip ${on[f[0]] ? 'on' : ''}"><input type="checkbox" data-f="${f[0]}" ${on[f[0]] ? 'checked' : ''}> ${f[1]}</label>`).join('')}</div>
      <div class="ml-split" style="align-items:start"><pre class="snip json">${esc(JSON.stringify(def, null, 2))}${on.errors ? '\n\n// on failure returns:\n{"error": "Order BL-1 not found. Ask the user to check the ID (format BL-#####)."}' : '\n\n// on failure returns:\n{"error": "500"}'}</pre>
      <div><div class="ag-stats"><div><b>${acc}%</b><small>correct tool calls (simulated)</small></div></div><p class="w-small">The model only sees this definition. Vague names and descriptions cause wrong or missing calls; extra parameters invite made-up values; actionable errors let the model recover on its own.</p></div></div>`;
    };
    el.addEventListener('change', e => { const k = e.target.dataset.f; if (k) { on[k] = e.target.checked; draw(); } });
    draw();
  };

  /* Workflow DAG */
  T.workflow = 'Simulation: running an LLM workflow in waves';
  W.workflow = el => {
    const N = { research: ['🔎 Research products', 0, 0, []], voice: ['🎨 Brand voice', 0, 1, []], desc: ['✍️ Product descriptions', 1, 0.5, ['research', 'voice']], ads: ['📣 Ad variants', 2, 0, ['desc']], email: ['📧 Email draft', 2, 1, ['desc']], review: ['✅ Review (human)', 3, 0.5, ['ads', 'email']] };
    let wave = -1, timer;
    const draw = () => {
      const X = c => 20 + c * 150, Y = r => 20 + r * 90;
      el.innerHTML = `<svg viewBox="0 0 600 210" class="w-svg" style="max-height:260px">${Object.entries(N).flatMap(([k, n]) => n[3].map(d => `<line x1="${X(N[d][1]) + 120}" y1="${Y(N[d][2]) + 22}" x2="${X(n[1])}" y2="${Y(n[2]) + 22}" stroke="var(--line-strong)" stroke-width="2"/>`)).join('')}
        ${Object.entries(N).map(([k, n]) => { const st = n[1] < wave ? 'done' : n[1] === wave ? 'run' : ''; return `<g><rect x="${X(n[1])}" y="${Y(n[2])}" width="120" height="44" rx="10" fill="${st === 'done' ? 'var(--ok-soft)' : st === 'run' ? 'var(--accent-soft)' : 'var(--panel)'}" stroke="${st === 'done' ? 'var(--ok)' : st === 'run' ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="2"/><text x="${X(n[1]) + 60}" y="${Y(n[2]) + 27}" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--ink)">${n[0]}</text></g>`; }).join('')}</svg>
      <div class="w-nav"><button type="button" class="primary" data-run>▶ Run workflow</button><span class="w-meter">${wave < 0 ? 'idle' : wave > 3 ? '✓ done in 4 waves' : 'wave ' + (wave + 1) + ' running'}</span></div>
      <p class="w-small">Tasks in the same column have no dependency on each other, so they run in parallel. Each task has its own prompt, validation and stored output, so a failure in "Email draft" can be retried without redoing research.</p>`;
    };
    el.addEventListener('click', e => { if (e.target.closest('[data-run]')) { clearInterval(timer); wave = 0; draw(); timer = setInterval(() => { wave++; draw(); if (wave > 3) clearInterval(timer); }, 800); } });
    draw();
  };

  /* Offline (SOMA judge) & online (A/B) evaluation */
  T.soma = 'Interactive: offline judge & online A/B test';
  W.soma = el => {
    let mode = 'offline', traffic = 2000;
    const asp = ['Correctness', 'Helpfulness', 'Tone', 'Format'], A = [3.6, 3.4, 4.1, 3.0], B = [4.2, 4.1, 4.0, 4.6];
    const draw = () => {
      let body;
      if (mode === 'offline') body = `<p class="w-small">An LLM judge rates 40 example-suite answers per version, one specific question per aspect, on a 1–5 scale.</p>
        <div class="pe-soma">${asp.map((a, i) => `<div><span>${a}</span><div class="ag-hbar"><i style="width:${A[i] / 5 * 100}%;background:var(--muted)"></i><span>A ${A[i].toFixed(1)}</span></div><div class="ag-hbar"><i style="width:${B[i] / 5 * 100}%"></i><span>B ${B[i].toFixed(1)}</span></div></div>`).join('')}</div>
        <p class="w-status warn">B is better overall but slightly worse on Tone: check those cases before shipping.</p>`;
      else { const n = traffic / 2, ca = Math.round(n * 0.12), cb = Math.round(n * 0.14), pa = ca / n, pb = cb / n, p = (ca + cb) / traffic, z = (pb - pa) / Math.sqrt(p * (1 - p) * (2 / n));
        body = `<label class="w-field">Users in the experiment: <b>${traffic.toLocaleString()}</b><input type="range" min="200" max="20000" step="200" value="${traffic}" data-tr></label>
        <div class="ag-stats"><div><b>${(pa * 100).toFixed(1)}%</b><small>A: suggestion accepted</small></div><div><b>${(pb * 100).toFixed(1)}%</b><small>B: suggestion accepted</small></div><div class="${Math.abs(z) >= 1.96 ? 'good' : 'bad'}"><b>z = ${z.toFixed(2)}</b><small>${Math.abs(z) >= 1.96 ? 'significant (95%)' : 'not significant yet'}</small></div></div>
        <p class="w-small">Same true effect (+2 points), but with few users it can't be told apart from noise. Run the test until it's significant before deciding.</p>`; }
      el.innerHTML = `<div class="w-head">${seg('m', [['offline', '🧪 Offline: SOMA judge'], ['online', '📈 Online: A/B test']], mode)}</div>${body}`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-tr]')) { traffic = +e.target.value; draw(); keepFocus(el, '[data-tr]'); } });
    draw();
  };
})();
