/* Interactive widgets for the LLM Engineering course. Registers into window.WIDGETS. */
(() => {
  'use strict';
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, l]) => `<button type="button" data-${name}="${v}" class="${String(v) === String(active) ? 'on' : ''}" aria-pressed="${String(v) === String(active)}">${l}</button>`).join('')}</div>`;
  const keepFocus = (el, sel) => { const n = el.querySelector(sel); if (n) n.focus(); };
  const fmtB = b => b >= 2 ** 30 ? (b / 2 ** 30).toFixed(1) + ' GB' : b >= 2 ** 20 ? (b / 2 ** 20).toFixed(0) + ' MB' : b.toFixed(0) + ' B';
  const words = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

  /* 1. FTI architecture flow */
  T.fti = 'Simulation: data flowing through the FTI pipelines';
  W.fti = el => {
    const S = [
      ['collect', 'Crawlers fetch your articles, posts and repos', 'raw → 🗄 warehouse'],
      ['feature', 'Feature pipeline cleans, chunks and embeds; builds instruct datasets', '🗄 → 📐 vector DB + datasets'],
      ['training', 'Training pipeline fine-tunes the LLM (LoRA → DPO)', 'datasets → 📦 model registry v1.2'],
      ['eval', 'Evaluation compares v1.2 vs. v1.1 with task evals', '✓ release gate passed'],
      ['inference', 'Inference pipeline loads v1.2 and retrieves from the vector DB', '📦 + 📐 → answer'],
      ['api', 'REST API serves users and logs traces for monitoring', '👤 "Write a post about RAG in my style"']
    ];
    const N = [['collect', '🕸', 'Data collection'], ['feature', '🧩', 'Feature pipeline'], ['training', '🏋', 'Training pipeline'], ['eval', '🧪', 'Evaluation'], ['inference', '⚡', 'Inference pipeline'], ['api', '🌐', 'REST API']];
    const stores = { feature: '🗄 Warehouse', training: '📐 Feature store', inference: '📦 Registry' };
    let i = -1, timer;
    const draw = () => {
      const cur = i >= 0 ? S[i][0] : null;
      el.innerHTML = `<div class="llm-fti">${N.map(([id, ic, l], k) => `${stores[id] ? `<span class="llm-store ${k <= N.findIndex(n => n[0] === cur) ? 'lit' : ''}">${stores[id]}</span>` : k ? '<span class="llm-arr">→</span>' : ''}<div class="llm-stage ${id === cur ? 'cur' : ''} ${i >= 0 && k <= N.findIndex(n => n[0] === cur) ? 'lit' : ''}"><b>${ic}</b><span>${l}</span></div>`).join('')}</div>
      <div class="w-card llm-log">${i >= 0 ? `<span class="w-label">Step ${i + 1} of ${S.length}</span><p>${esc(S[i][1])}</p><code>${esc(S[i][2])}</code>` : '<p>Press play to send data through the system.</p>'}</div>
      <div class="w-nav"><button type="button" class="primary" data-fti="play">▶ Play</button><button type="button" data-fti="step">Step ▸</button><button type="button" data-fti="reset">↺</button></div>
      <p class="w-small">Note how nothing talks directly: each pipeline reads and writes <b>storage</b>. You could retrain nightly on GPUs while inference keeps serving from CPU-friendly retrieval plus a GPU endpoint.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-fti]'); if (!b) return; clearInterval(timer); const a = b.dataset.fti; if (a === 'reset') i = -1; if (a === 'step') i = Math.min(S.length - 1, i + 1); if (a === 'play') { i = -1; timer = setInterval(() => { i++; draw(); if (i >= S.length - 1) clearInterval(timer); }, 1100); } draw(); });
    draw();
  };

  /* 2. Tool stack */
  T.toolstack = 'Explore: the LLMOps tool stack';
  W.toolstack = el => {
    const L = [
      ['🐍', 'Environment', 'Poetry / uv + a task runner', 'Locked dependencies and one-line commands: <code>poe run-feature-pipeline</code>.', 'Everyone runs the same versions.'],
      ['🎼', 'Orchestrator', 'ZenML · Airflow · Prefect', 'Pipelines as steps, local or cloud stacks, artifact caching and lineage.', 'Answers "what produced this dataset?"'],
      ['🗄', 'Data warehouse', 'MongoDB (NoSQL)', 'Raw crawled documents with flexible schemas, accessed through an ODM.', 'Source of truth for re-processing.'],
      ['📐', 'Vector DB', 'Qdrant', 'Embeddings + metadata, fast ANN search with filters.', 'The RAG feature store.'],
      ['📦', 'Model registry', 'Hugging Face Hub', 'Versioned models and datasets, shared publicly or privately.', 'Training writes, inference reads.'],
      ['📈', 'Experiment tracker', 'Comet ML · W&B · MLflow', 'Losses, hyperparameters, system metrics per run.', 'Pick the best fine-tune with evidence.'],
      ['🔭', 'Prompt monitoring', 'Opik · Langfuse', 'Traces of prompts, context, answers, latency, cost; evals on traces.', 'Debug quality in production.'],
      ['☁️', 'Cloud', 'AWS SageMaker · S3 · ECR', 'Training jobs, GPU inference endpoints, container registry.', 'Scale beyond your laptop.']
    ];
    let i = 1;
    const draw = () => {
      el.innerHTML = `<div class="llm-stack">${L.map((l, k) => `<button type="button" data-ts="${k}" class="${k === i ? 'on' : ''}"><b>${l[0]}</b><span>${l[1]}</span></button>`).join('')}</div>
      <div class="w-card"><span class="w-label">${L[i][1]} · e.g. ${L[i][2]}</span><p>${L[i][3]}</p><p class="w-small"><b>Why it matters:</b> ${L[i][4]}</p></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-ts]'); if (b) { i = +b.dataset.ts; draw(); } });
    draw();
  };

  /* 3. ETL & cleaning */
  T.etl = 'Step through: crawl → clean → dedupe → load';
  W.etl = el => {
    const raw = [
      { src: 'medium.com', text: '<h1>Fine-tuning   Llama</h1><p>LoRA lets you <b>adapt</b> big models cheaply 🚀 https://bit.ly/x</p>' },
      { src: 'linkedin.com', text: 'LoRA lets you adapt big models cheaply 🚀 #llm #ai' },
      { src: 'github.com', text: '# README\nA RAG pipeline: crawl, clean, chunk, embed.' },
      { src: 'substack.com', text: '<p>Fine-tuning Llama: LoRA lets you adapt big models cheaply.</p>' },
      { src: 'x.com', text: 'gm 👋' }
    ];
    const clean = t => t.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, '').replace(/#\w+/g, '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/\s+/g, ' ').trim();
    const sh = t => { const w = words(t); return new Set(w.slice(0, -2).map((_, i) => w.slice(i, i + 3).join(' '))); };
    const jac = (a, b) => { const u = new Set([...a, ...b]); let n = 0; a.forEach(x => b.has(x) && n++); return u.size ? n / u.size : 1; };
    const steps = ['Crawl', 'Clean', 'Filter short', 'Dedupe', 'Load'];
    let s = 0;
    const draw = () => {
      let docs = raw.map(d => ({ ...d, out: d.text, state: '' }));
      if (s >= 1) docs.forEach(d => { d.out = clean(d.text); d.state = d.out !== d.text ? 'changed' : ''; });
      if (s >= 2) docs.forEach(d => { if (words(d.out).length < 4) d.state = 'drop-short'; });
      if (s >= 3) { const kept = []; docs.forEach(d => { if (d.state.startsWith('drop')) return; const dup = kept.find(k => jac(sh(k.out), sh(d.out)) >= 0.5); if (dup) d.state = 'drop-dup'; else kept.push(d); }); }
      const alive = docs.filter(d => !d.state.startsWith('drop'));
      el.innerHTML = `<div class="w-head"><div class="w-steps">${steps.map((x, k) => `<button type="button" data-etl="${k}" class="${k === s ? 'on' : k < s ? 'done' : ''}">${k + 1}. ${x}</button>`).join('')}</div></div>
      <div class="llm-docs">${docs.map(d => `<div class="llm-doc ${d.state}"><span class="pill">${d.src}</span><code>${esc(d.out)}</code><small>${d.state === 'drop-short' ? '✗ too short' : d.state === 'drop-dup' ? '✗ near-duplicate (Jaccard ≥ 0.5)' : d.state === 'changed' ? '✓ cleaned' : ''}</small></div>`).join('')}</div>
      <p class="w-status ${s === 4 ? 'good' : ''}">${s === 4 ? `✓ Loaded ${alive.length} clean, unique documents into the warehouse (from ${raw.length} crawled).` : `${alive.length} documents remaining.`}</p>
      <div class="w-nav"><button type="button" data-etl="${Math.max(0, s - 1)}" ${s ? '' : 'disabled'}>← Back</button><button type="button" class="primary" data-etl="${Math.min(4, s + 1)}" ${s < 4 ? '' : 'disabled'}>Next step →</button></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-etl]'); if (b && !b.disabled) { s = +b.dataset.etl; draw(); } });
    draw();
  };

  /* 4. Chunking */
  T.chunking = 'Interactive: chunk size & overlap';
  W.chunking = el => {
    const text = 'Retrieval augmented generation grounds a language model in your own knowledge. Documents are cleaned and split into chunks. Each chunk is embedded into a vector and stored with metadata. At query time the question is embedded too, and the nearest chunks are retrieved. Overlap between chunks keeps sentences that cross a boundary retrievable. Chunks that are too small lose context, while chunks that are too large blur several topics into one vector.';
    const W0 = text.split(' ');
    let size = 18, overlap = 4;
    const COL = ['#e8711c', '#3d6df2', '#16a37f', '#8b6cff', '#e8505b', '#0ea5b7', '#c08a00'];
    const draw = () => {
      const step = Math.max(1, size - overlap), chunks = [];
      for (let s = 0; s < W0.length; s += step) { chunks.push([s, Math.min(W0.length, s + size)]); if (s + size >= W0.length) break; }
      const owner = W0.map((_, i) => chunks.map((c, k) => i >= c[0] && i < c[1] ? k : -1).filter(k => k >= 0));
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Chunk size <input type="range" min="6" max="40" value="${size}" data-sz> <b>${size} words</b></label><label class="w-field inline">Overlap <input type="range" min="0" max="${Math.min(15, size - 1)}" value="${overlap}" data-ov> <b>${overlap}</b></label></div>
      <p class="llm-chunktext">${W0.map((w, i) => { const o = owner[i]; const c = COL[o[0] % COL.length]; return `<span style="background:${c}${o.length > 1 ? '55' : '22'};${o.length > 1 ? `box-shadow:inset 0 -3px 0 ${COL[o[1] % COL.length]}` : ''}">${esc(w)}</span>`; }).join(' ')}</p>
      <div class="ag-stats"><div><b>${chunks.length}</b><small>chunks</small></div><div><b>${chunks.length * size - (chunks.length ? size - (chunks[chunks.length - 1][1] - chunks[chunks.length - 1][0]) : 0)}</b><small>words embedded (vs ${W0.length})</small></div><div><b>${overlap ? Math.round(overlap / size * 100) : 0}%</b><small>overlap</small></div></div>
      <p class="w-small">Underlined words belong to two chunks (overlap). Try tiny chunks (6 words: context lost) and huge ones (40 words: topics blur together).</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-sz]')) { size = +e.target.value; overlap = Math.min(overlap, size - 1); draw(); keepFocus(el, '[data-sz]'); } if (e.target.matches('[data-ov]')) { overlap = +e.target.value; draw(); keepFocus(el, '[data-ov]'); } });
    draw();
  };

  /* 5. Hybrid search */
  T.hybrid = 'Interactive: keyword + vector = hybrid search';
  W.hybrid = el => {
    const D = [
      ['d1', 'Fix error E-4012 by updating the CUDA driver', 0.35],
      ['d2', 'GPU crashes during fine-tuning are often driver problems', 0.82],
      ['d3', 'How to resolve out of memory issues when training on a GPU', 0.74],
      ['d4', 'Error codes reference: E-4011, E-4012, E-4013', 0.30],
      ['d5', 'Our favorite pizza places near the office', 0.05]
    ];
    const q = 'GPU training crashes with error E-4012';
    let alpha = 0.5, rerank = false;
    const qw = new Set(words(q));
    const kw = D.map(d => { const w = words(d[1]); return w.filter(x => qw.has(x)).length / Math.sqrt(w.length); });
    const kmax = Math.max(...kw);
    const draw = () => {
      let rows = D.map((d, i) => ({ id: d[0], text: d[1], k: kw[i] / kmax, v: d[2] })).map(r => ({ ...r, h: alpha * r.k + (1 - alpha) * r.v }));
      rows.sort((a, b) => b.h - a.h);
      if (rerank) { const rr = { d1: 0.97, d2: 0.8, d4: 0.55, d3: 0.5, d5: 0.01 }; rows = rows.slice(0, 4).map(r => ({ ...r, rr: rr[r.id] })).sort((a, b) => b.rr - a.rr).concat(rows.slice(4)); }
      el.innerHTML = `<div class="ag-req">Query: “${esc(q)}”</div>
      <div class="w-head"><label class="w-field inline">α <small>(vector ← → keyword)</small><input type="range" min="0" max="1" step="0.05" value="${alpha}" data-al> <b>${alpha.toFixed(2)}</b></label><label class="w-chip ${rerank ? 'on' : ''}"><input type="checkbox" data-rr ${rerank ? 'checked' : ''}> Cross-encoder rerank top 4</label></div>
      <div class="llm-rank">${rows.map((r, k) => `<div class="${k < 3 ? 'top' : ''}"><b>#${k + 1}</b><span>${esc(r.text)}</span><div class="llm-bars"><i class="kw" style="width:${r.k * 100}%" title="keyword ${r.k.toFixed(2)}"></i><i class="vec" style="width:${r.v * 100}%" title="vector ${r.v.toFixed(2)}"></i></div><code>${rerank && r.rr != null ? 'rr ' + r.rr.toFixed(2) : r.h.toFixed(2)}</code></div>`).join('')}</div>
      <p class="w-small"><i class="llm-key kw"></i> keyword (BM25-like) score &nbsp; <i class="llm-key vec"></i> vector similarity. α = 0 is pure semantic search: the exact error code gets buried. α = 1 is pure keyword search: the paraphrased GPU-crash advice drops. A blend plus reranking surfaces the best chunk first.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-al]')) { alpha = +e.target.value; draw(); keepFocus(el, '[data-al]'); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-rr]')) { rerank = e.target.checked; draw(); } });
    draw();
  };

  /* 6. Dataset curation funnel */
  T.datacurate = 'Interactive: curating an instruction dataset';
  W.datacurate = el => {
    const F = [['Generated from your articles', 12000, null], ['Length & format rules', 10400, 'Drop empty, truncated or overlong answers'], ['Exact dedup', 9100, 'Same instruction twice'], ['Fuzzy dedup (MinHash)', 7600, 'Paraphrased near-copies'], ['Decontamination', 7450, 'Overlaps with the eval set'], ['Quality score ≥ threshold', null, 'LLM judge rates 1–5']];
    let th = 3;
    const qual = { 1: 1, 2: 0.86, 3: 0.68, 4: 0.41, 5: 0.12 };
    const draw = () => {
      const vals = F.map(f => f[1] ?? Math.round(7450 * qual[th]));
      el.innerHTML = `<label class="w-field">Minimum quality score: <b>${th} / 5</b><input type="range" min="1" max="5" step="1" value="${th}" data-qt></label>
      <div class="llm-funnel">${F.map((f, k) => `<div><span>${f[0]}${f[2] ? `<small>${f[2]}</small>` : ''}</span><div class="ag-hbar"><i style="width:${vals[k] / 12000 * 100}%"></i><span>${vals[k].toLocaleString()}</span></div></div>`).join('')}</div>
      <p class="w-status ${th === 5 ? 'warn' : th <= 1 ? 'bad' : 'good'}">${th <= 1 ? 'Keeping everything: noisy samples teach noisy behavior.' : th === 5 ? 'Only the very best survive, but 900 samples may be too few and too narrow. Balance quality and diversity.' : `${vals[5].toLocaleString()} curated samples, a solid size for LoRA fine-tuning on one style.`}</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-qt]')) { th = +e.target.value; draw(); keepFocus(el, '[data-qt]'); } });
    draw();
  };

  /* 7. LoRA memory calculator */
  T.lora = 'Interactive: full fine-tuning vs. LoRA vs. QLoRA';
  W.lora = el => {
    const M = { '1B': [1.2e9, 16, 2048], '8B': [8e9, 32, 4096], '70B': [70e9, 80, 8192] };
    let m = '8B', r = 16;
    const draw = () => {
      const [P, L, d] = M[m], lora = L * 7 * r * (d + d) * 0.85;
      const full = P * 16, lo = P * 2 + lora * 16, q = P * 0.55 + lora * 16, act = 2.5e9 * (P / 8e9) ** 0.5;
      const rows = [['Full fine-tuning (fp16 + Adam)', full + act, P], ['LoRA (fp16 base)', lo + act, lora], ['QLoRA (4-bit base)', q + act, lora]], mx = Math.max(...rows.map(x => x[1]));
      el.innerHTML = `<div class="w-head">${seg('m', Object.keys(M).map(k => [k, k + ' model']), m)}<label class="w-field inline">LoRA rank r <input type="range" min="2" max="128" step="2" value="${r}" data-r> <b>${r}</b></label></div>
      <div class="llm-mem">${rows.map(x => { const g = x[1] / 1e9; const fits = g <= 24 ? '🎮 fits a 24 GB GPU' : g <= 80 ? '🖥 needs an 80 GB GPU' : `🏢 needs ~${Math.ceil(g / 80)}× 80 GB GPUs`; return `<div><span>${x[0]}</span><div class="ag-hbar"><i style="width:${x[1] / mx * 100}%;background:${g <= 24 ? 'var(--ok)' : g <= 80 ? 'var(--warn)' : 'var(--bad)'}"></i><span>~${g.toFixed(0)} GB</span></div><small>${fits} · trainable ${x[2] >= 1e9 ? (x[2] / 1e9).toFixed(1) + 'B' : (x[2] / 1e6).toFixed(1) + 'M'} (${(x[2] / P * 100).toFixed(2)}%)</small></div>`; }).join('')}</div>
      <p class="w-small">Rough estimates: full FT ≈ 16 bytes/param (weights, gradients, Adam states), plus activations. LoRA adapters on attention and MLP projections. QLoRA stores the frozen base in ~4.5 bits.</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { m = b.dataset.m; draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-r]')) { r = +e.target.value; draw(); keepFocus(el, '[data-r]'); } });
    draw();
  };

  /* 8. DPO loss explorer */
  T.dpo = 'Interactive: the DPO loss';
  W.dpo = el => {
    let dc = 1.0, dr = -1.0, beta = 0.1;
    const draw = () => {
      const margin = beta * (dc - dr), loss = Math.log1p(Math.exp(-margin)), X = z => 40 + (z + 6) / 12 * 520, Y = l => 170 - Math.min(l, 6) / 6 * 150;
      el.innerHTML = `<div class="ml-grid4" style="grid-template-columns:repeat(3,1fr)"><label class="w-field">Δ chosen = log π − log π_ref: <b>${dc.toFixed(1)}</b><input type="range" min="-20" max="20" step="0.5" value="${dc}" data-k="dc"></label><label class="w-field">Δ rejected: <b>${dr.toFixed(1)}</b><input type="range" min="-20" max="20" step="0.5" value="${dr}" data-k="dr"></label><label class="w-field">β: <b>${beta.toFixed(2)}</b><input type="range" min="0.01" max="0.5" step="0.01" value="${beta}" data-k="beta"></label></div>
      <svg viewBox="0 0 600 190" class="w-svg"><line x1="40" y1="170" x2="560" y2="170" stroke="var(--line-strong)"/><line x1="${X(0)}" y1="15" x2="${X(0)}" y2="170" stroke="var(--line)" stroke-dasharray="3 3"/>
        <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${Array.from({ length: 121 }, (_, k) => { const z = -6 + k / 10; return `${X(z)},${Y(Math.log1p(Math.exp(-z)))}`; }).join(' ')}"/>
        <circle cx="${X(Math.max(-6, Math.min(6, margin)))}" cy="${Y(loss)}" r="7" fill="var(--ink)"/><text x="300" y="186" font-size="10" text-anchor="middle" fill="var(--muted)">margin = β·(Δchosen − Δrejected) →</text><text x="${X(0) + 4}" y="26" font-size="10" fill="var(--muted)">ln 2</text></svg>
      <div class="ag-stats"><div><b>${margin.toFixed(2)}</b><small>reward margin</small></div><div><b>${loss.toFixed(3)}</b><small>DPO loss</small></div><div><b>${(1 / (1 + Math.exp(-margin)) * 100).toFixed(0)}%</b><small>P(chosen ≻ rejected)</small></div></div>
      <p class="w-status ${margin > 0 ? 'good' : margin < 0 ? 'bad' : ''}">${margin > 0 ? 'The policy raised the chosen answer\'s likelihood (relative to the reference) more than the rejected one\'s, so the loss is low.' : margin < 0 ? 'The policy prefers the rejected answer more than the reference did. Big loss, big gradient.' : 'Policy = reference: loss is ln 2 ≈ 0.693.'} A higher β makes the same log-prob shift count more.</p>`;
    };
    el.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { const v = +e.target.value; if (k === 'dc') dc = v; else if (k === 'dr') dr = v; else beta = v; draw(); keepFocus(el, `[data-k="${k}"]`); } });
    draw();
  };

  /* 9. RAG evaluation scorecard */
  T.ragas = 'Interactive: scoring RAG answers';
  W.ragas = el => {
    const Q = 'What does QLoRA change compared to LoRA?';
    const ctx = [['c1', 'QLoRA loads the frozen base model in 4-bit NF4 precision.', true], ['c2', 'LoRA trains low-rank adapter matrices while the base stays frozen.', true], ['c3', 'Our team retreat was in Lisbon last spring.', false]];
    const A = {
      good: ['QLoRA keeps LoRA\'s low-rank adapters but loads the frozen base model in 4-bit NF4, cutting memory. [c1][c2]', ['c1', 'c2'], 1.0, 0.95],
      halluc: ['QLoRA quantizes the adapters to 2-bit and doubles training speed. [c1]', ['c1', 'c2'], 0.2, 0.8],
      offtopic: ['LoRA is a popular technique. Our team retreat was in Lisbon! [c3]', ['c2', 'c3'], 1.0, 0.15],
      missing: ['QLoRA loads the base model in 4-bit. [c1]', ['c1', 'c3'], 1.0, 0.75]
    };
    const relevant = ['c1', 'c2'];
    let k = 'good';
    const draw = () => {
      const a = A[k], prec = a[1].filter(x => relevant.includes(x)).length / a[1].length, rec = relevant.filter(x => a[1].includes(x)).length / relevant.length;
      const M = [['Context precision', prec], ['Context recall', rec], ['Faithfulness', a[2]], ['Answer relevancy', a[3]]];
      el.innerHTML = `<div class="ag-req">“${esc(Q)}”</div><div class="w-head">${seg('ans', [['good', '✅ Grounded'], ['halluc', '🌀 Hallucinated'], ['offtopic', '🏖 Off-topic'], ['missing', '🕳 Bad retrieval']], k)}</div>
      <div class="ml-split"><div><span class="w-label">Retrieved context</span>${ctx.map(c => `<div class="llm-ctx ${a[1].includes(c[0]) ? 'in' : ''}"><code>${c[0]}</code> ${esc(c[1])}</div>`).join('')}<span class="w-label" style="margin-top:10px">Answer</span><div class="w-card">${esc(a[0])}</div></div>
      <div class="llm-score">${M.map(([n, v]) => `<div><span>${n}</span><div class="ag-hbar"><i style="width:${v * 100}%;background:${v >= 0.8 ? 'var(--ok)' : v >= 0.5 ? 'var(--warn)' : 'var(--bad)'}"></i><span>${v.toFixed(2)}</span></div></div>`).join('')}</div></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-ans]'); if (b) { k = b.dataset.ans; draw(); } });
    draw();
  };

  /* 10. KV cache */
  T.kvcache = 'Simulation: generating with and without a KV cache';
  W.kvcache = el => {
    let cache = true, prompt = 6, n = 0, timer;
    const NEW = 10;
    const draw = () => {
      const total = prompt + n, work = cache ? (n ? prompt + n : 0) : Array.from({ length: n }, (_, i) => prompt + i).reduce((a, b) => a + b, 0);
      const kvMB = 2 * 32 * 8 * 128 * total * 2 / 2 ** 20;
      el.innerHTML = `<div class="w-head">${seg('kc', [['1', 'With KV cache'], ['0', 'Without cache']], cache ? '1' : '0')}<div class="w-nav"><button type="button" class="primary" data-kv="gen">▶ Generate ${NEW} tokens</button><button type="button" data-kv="reset">↺</button></div></div>
      <div class="llm-toks">${Array.from({ length: prompt + NEW }, (_, i) => `<span class="${i < prompt ? 'p' : i < total ? 'g' : 'f'} ${!cache && i < total && n ? 'recompute' : ''} ${cache && i === total - 1 && n ? 'new' : ''}">${i < prompt ? 'P' + (i + 1) : i < total ? 'T' + (i - prompt + 1) : ''}</span>`).join('')}</div>
      <div class="ag-stats"><div><b>${n}</b><small>tokens generated</small></div><div><b>${work}</b><small>token positions processed</small></div><div><b>${cache ? kvMB.toFixed(1) + ' MB' : '0 MB'}</b><small>KV cache (8B model)</small></div></div>
      <p class="w-status ${cache ? 'good' : 'warn'}">${cache ? 'Each step only processes the newest token. Past keys/values come from the cache, so total work grows linearly, but cache memory grows with every token (and every user in the batch).' : 'Without a cache, every step re-processes the entire sequence: total work grows quadratically. Red = recomputed each step.'}</p>`;
    };
    el.addEventListener('click', e => { const s = e.target.closest('[data-kc]'); if (s) { cache = s.dataset.kc === '1'; n = 0; clearInterval(timer); draw(); } const b = e.target.closest('[data-kv]'); if (!b) return; clearInterval(timer); if (b.dataset.kv === 'reset') { n = 0; draw(); } else { n = 0; timer = setInterval(() => { n++; draw(); if (n >= NEW) clearInterval(timer); }, 300); } });
    draw();
  };

  /* 11. Quantization */
  T.quant = 'Interactive: quantizing weights';
  W.quant = el => {
    const w = [-0.82, -0.41, -0.2, -0.07, 0.03, 0.12, 0.28, 0.45, 0.61, 2.9];
    let bits = 4, method = 'absmax', block = false;
    const draw = () => {
      const lv = 2 ** (bits - 1) - 1;
      const qz = (arr) => { if (method === 'absmax') { const s = lv / Math.max(...arr.map(Math.abs)); return arr.map(x => ({ q: Math.round(x * s), d: Math.round(x * s) / s })); } const mn = Math.min(...arr), mx = Math.max(...arr), s = (2 ** bits - 1) / (mx - mn), zp = Math.round(-s * mn) - 2 ** (bits - 1); return arr.map(x => { const q = Math.max(-(2 ** (bits - 1)), Math.min(2 ** (bits - 1) - 1, Math.round(x * s + zp))); return { q, d: (q - zp) / s }; }); };
      const out = block ? [...qz(w.slice(0, 5)), ...qz(w.slice(5))] : qz(w);
      const err = out.reduce((a, o, i) => a + Math.abs(o.d - w[i]), 0) / w.length, X = v => 30 + (v + 1) / 4 * 540;
      el.innerHTML = `<div class="w-head"><label class="w-field inline">Bits <input type="range" min="2" max="8" value="${bits}" data-b> <b>${bits}-bit</b></label>${seg('qm', [['absmax', 'Absmax'], ['zp', 'Zero-point']], method)}<label class="w-chip ${block ? 'on' : ''}"><input type="checkbox" data-blk ${block ? 'checked' : ''}> Block-wise (2 blocks)</label></div>
      <svg viewBox="0 0 600 120" class="w-svg"><line x1="30" y1="60" x2="570" y2="60" stroke="var(--line-strong)"/>${w.map((v, i) => `<line x1="${X(v)}" y1="40" x2="${X(out[i].d)}" y2="80" stroke="var(--muted)" opacity=".5"/><circle cx="${X(v)}" cy="40" r="5" fill="#3d6df2"/><rect x="${X(out[i].d) - 4}" y="76" width="8" height="8" fill="var(--accent)"/>`).join('')}
        <text x="30" y="22" font-size="11" fill="#3d6df2">● original fp16 weights</text><text x="30" y="108" font-size="11" fill="var(--accent)">■ dequantized ${bits}-bit values</text><text x="${X(2.9)}" y="22" font-size="10" fill="var(--bad)" text-anchor="middle">outlier</text></svg>
      <div class="w-tablewrap"><table class="w-table"><thead><tr><th>w</th>${w.map(v => `<td>${v}</td>`).join('')}</tr></thead><tbody><tr><th>q</th>${out.map(o => `<td>${o.q}</td>`).join('')}</tr><tr><th>ŵ</th>${out.map(o => `<td>${o.d.toFixed(2)}</td>`).join('')}</tr></tbody></table></div>
      <div class="ag-stats"><div><b>${err.toFixed(3)}</b><small>mean abs error</small></div><div><b>${(16 / bits).toFixed(1)}×</b><small>smaller than fp16</small></div></div>
      <p class="w-small">The outlier (2.9) stretches the scale, so the small weights collapse onto a few levels. Turn on block-wise quantization: each block gets its own scale, which is how GGUF, GPTQ and NF4 keep 4-bit quality high.</p>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-b]')) { bits = +e.target.value; draw(); keepFocus(el, '[data-b]'); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-blk]')) { block = e.target.checked; draw(); } });
    el.addEventListener('click', e => { const b = e.target.closest('[data-qm]'); if (b) { method = b.dataset.qm; draw(); } });
    draw();
  };

  /* 12. RAG inference flow */
  T.ragflow = 'Step through: one request in the RAG inference pipeline';
  W.ragflow = el => {
    const S = [
      ['👤 Query', 'Write a LinkedIn post about how Maxime fine-tunes with DPO', ''],
      ['🔎 Self-query', 'Extract metadata filters with a small LLM call', 'author = "Maxime Labonne"'],
      ['🌱 Query expansion', 'Generate 3 variants to widen recall', '1. DPO fine-tuning process\n2. preference alignment with chosen/rejected pairs\n3. direct preference optimization tips'],
      ['📐 Filtered vector search', 'Search each variant in parallel, filtered by author', '3 × top-3 = 9 chunks (6 unique)'],
      ['🏅 Rerank', 'Cross-encoder rescores the 6 unique chunks, keep top 3', 'post-17 (0.94) · article-4 (0.88) · post-22 (0.81)'],
      ['🧾 Prompt', 'System + instruction + numbered context within the token budget', '≈ 1,150 tokens'],
      ['🤖 LLM service', 'Fine-tuned model on a GPU endpoint generates the post', '"Most people stop at SFT. Here\'s why I add DPO…"'],
      ['🔭 Trace', 'Log prompt, chunks, answer, latency and cost to prompt monitoring', 'latency 2.4 s · 1,430 tokens · $0.0011']
    ];
    let i = 0;
    const draw = () => {
      el.innerHTML = `<div class="llm-flow">${S.map((s, k) => `<button type="button" data-rf="${k}" class="${k === i ? 'cur' : k < i ? 'done' : ''}">${s[0]}</button>`).join('<span>›</span>')}</div>
      <div class="w-card"><span class="w-label">Step ${i + 1} · ${S[i][0]}</span><p>${esc(S[i][1])}</p>${S[i][2] ? `<pre class="snip">${esc(S[i][2])}</pre>` : ''}</div>
      <div class="w-nav"><button type="button" data-rf="${Math.max(0, i - 1)}" ${i ? '' : 'disabled'}>← Back</button><button type="button" class="primary" data-rf="${Math.min(S.length - 1, i + 1)}" ${i < S.length - 1 ? '' : 'disabled'}>Next →</button><span class="w-meter">${i < 6 ? 'business service · CPU' : i === 6 ? 'LLM service · GPU' : 'LLMOps'}</span></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-rf]'); if (b && !b.disabled) { i = +b.dataset.rf; draw(); } });
    draw();
  };

  /* 13. Autoscaling simulation */
  T.autoscale = 'Simulation: autoscaling through a traffic spike';
  W.autoscale = el => {
    const traffic = [20, 22, 25, 30, 60, 110, 160, 170, 165, 120, 70, 40, 30, 25, 22, 20];
    let target = 0.6, maxR = 6, auto = true;
    const sim = () => { let rep = 1, pending = [], cool = 0; return traffic.map((rps, t) => { pending = pending.filter(p => { if (p.at <= t) { rep += p.d; return false; } return true; }); const cap = rep * 40, util = rps / cap; if (auto && cool <= 0) { const want = Math.max(1, Math.min(maxR, Math.ceil(rep * util / target))); const planned = rep + pending.reduce((a, p) => a + p.d, 0); if (want > planned) { pending.push({ at: t + 2, d: want - planned }); cool = 2; } else if (want < rep && util < target * 0.7) { rep = want; cool = 3; } } cool--; const lat = util <= 0.8 ? 0.9 + util : 0.9 + util ** 3 * 2; return { t, rps, rep, util, lat, drop: Math.max(0, rps - cap) }; }); };
    const draw = () => {
      const R = sim(), X = t => 40 + t * 34, mxr = 180, drops = R.reduce((a, r) => a + r.drop, 0), cost = R.reduce((a, r) => a + r.rep, 0);
      el.innerHTML = `<div class="w-head"><label class="w-chip ${auto ? 'on' : ''}"><input type="checkbox" data-au ${auto ? 'checked' : ''}> Autoscaling</label><label class="w-field inline">Target util <input type="range" min="0.3" max="0.9" step="0.05" value="${target}" data-tg> <b>${Math.round(target * 100)}%</b></label><label class="w-field inline">Max replicas <input type="range" min="1" max="8" value="${maxR}" data-mx> <b>${maxR}</b></label></div>
      <svg viewBox="0 0 600 200" class="w-svg">${R.map(r => `<rect x="${X(r.t) - 13}" y="${180 - r.rep * 40 / mxr * 160}" width="26" height="${r.rep * 40 / mxr * 160}" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="${X(r.t)}" y="195" font-size="9" text-anchor="middle" fill="var(--muted)">${r.rep}</text>`).join('')}
        <polyline fill="none" stroke="var(--ink)" stroke-width="2.5" points="${R.map(r => `${X(r.t)},${180 - r.rps / mxr * 160}`).join(' ')}"/>${R.filter(r => r.drop).map(r => `<circle cx="${X(r.t)}" cy="${180 - r.rps / mxr * 160}" r="5" fill="var(--bad)"/>`).join('')}</svg>
      <p class="w-small">Line = requests/s · bars = capacity (replicas × 40 rps, count below) · red = overloaded (dropped or slow requests). New replicas take 2 steps to boot.</p>
      <div class="ag-stats"><div class="${drops ? 'bad' : 'good'}"><b>${drops}</b><small>requests over capacity</small></div><div><b>${cost}</b><small>replica-steps (cost)</small></div><div><b>${Math.max(...R.map(r => r.lat)).toFixed(1)} s</b><small>worst latency</small></div></div>`;
    };
    el.addEventListener('input', e => { if (e.target.matches('[data-tg]')) { target = +e.target.value; draw(); keepFocus(el, '[data-tg]'); } if (e.target.matches('[data-mx]')) { maxR = +e.target.value; draw(); keepFocus(el, '[data-mx]'); } });
    el.addEventListener('change', e => { if (e.target.matches('[data-au]')) { auto = e.target.checked; draw(); } });
    draw();
  };

  /* 14. CI/CD/CT pipeline with eval gate */
  T.cicd = 'Simulation: CI/CD/CT with an evaluation gate';
  W.cicd = el => {
    const C = { safe: ['✨ Better prompt template', { tests: true, faithfulness: 0.88, style: 0.81, latency: 1.9 }], regress: ['🎨 Aggressive style fine-tune', { tests: true, faithfulness: 0.79, style: 0.9, latency: 1.8 }], bug: ['🐛 Refactor retrieval', { tests: false, faithfulness: 0.86, style: 0.79, latency: 2.0 }], slow: ['🐢 Bigger reranker', { tests: true, faithfulness: 0.9, style: 0.8, latency: 3.6 }] };
    const base = { faithfulness: 0.86, style: 0.78, latency: 2.1 };
    let k = 'safe', i = -1, timer;
    const stages = c => [['Lint & unit tests', c.tests, c.tests ? 'all green' : '3 tests failed in retriever'], ['Build & push container', true, 'image:sha-7f3a'], ['Offline evals', c.faithfulness >= base.faithfulness - 0.02, `faithfulness ${c.faithfulness} (baseline ${base.faithfulness}) · style ${c.style}`], ['Latency check', c.latency <= 2.5, `p95 ${c.latency}s (budget 2.5s)`], ['Deploy canary 10%', true, 'monitor traces 30 min'], ['Promote to 100%', true, '🚀 live']];
    const draw = () => {
      const st = stages(C[k][1]), fail = st.findIndex(s => !s[1]);
      el.innerHTML = `<div class="w-head">${seg('ch', Object.entries(C).map(([kk, v]) => [kk, v[0]]), k)}<button type="button" class="w-go" data-run>▶ Push to main</button></div>
      <div class="llm-ci">${st.map((s, j) => { const state = i < j ? '' : fail >= 0 && j > fail ? 'skip' : !s[1] ? 'fail' : 'pass'; return `<div class="${state} ${i === j ? 'cur' : ''}"><b>${state === 'pass' ? '✓' : state === 'fail' ? '✗' : state === 'skip' ? '–' : j + 1}</b><span>${s[0]}</span><small>${i >= j && state !== 'skip' ? esc(s[2]) : ''}</small></div>`; }).join('')}</div>
      ${i >= st.length - 1 || (fail >= 0 && i >= fail) ? `<p class="w-status ${fail >= 0 ? 'bad' : 'good'}">${fail >= 0 ? `Blocked at “${st[fail][0]}”. Users never see this regression. ${k === 'regress' ? 'Style improved, but faithfulness dropped beyond tolerance.' : ''}` : 'Shipped safely: every gate passed and the canary looked healthy.'}</p>` : ''}`;
    };
    const run = () => { clearInterval(timer); i = -1; const st = stages(C[k][1]), fail = st.findIndex(s => !s[1]), last = fail >= 0 ? fail : st.length - 1; timer = setInterval(() => { i++; draw(); if (i >= last) clearInterval(timer); }, 550); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) { k = b.dataset.ch; clearInterval(timer); i = -1; draw(); } if (e.target.closest('[data-run]')) run(); });
    draw();
  };
})();
