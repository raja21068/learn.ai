/* Prompt Lab: a deterministic experiment for the Prompt Engineering course.
   A toy "literal assistant" does exactly what a prompt makes unambiguous and fails in the classic ways when something is
   missing. The learner builds a prompt from components (instruction, context, output format, examples, constraints,
   delimiters, reasoning, permission to abstain, temperature), runs it on eight fixed tasks, and sees which tasks pass and
   why the others fail. Prompt length (in tokens) is counted, so cheaper sufficient prompts can be compared with bloated
   ones. The rules encode common failure patterns taught in the course; they are NOT measurements of any real model, and
   the same settings always give the same result (tests/prompt-lab.test.cjs). */
(() => {
  'use strict';
  const COMPONENTS = {
    instruction: { label: 'Instruction', options: [['vague', 'Vague ("do a good job")', 5], ['clear', 'Clear (task stated)', 12], ['precise', 'Precise (task, labels and criteria defined)', 25]] },
    context: { label: 'Context', options: [['none', 'None', 0], ['some', 'Some background', 30], ['full', 'Full details (names, dates, facts)', 80]] },
    format: { label: 'Output format', options: [['none', 'Not specified', 0], ['described', 'Described in words', 15], ['schema', 'Exact schema and "return only JSON"', 45]] },
    examples: { label: 'Examples', options: [['none', 'None', 0], ['balanced', 'Three examples, balanced across labels', 60], ['skewed', 'Three examples, mostly one label', 60]] },
    constraints: { label: 'Constraints (length, tone)', bool: 12 },
    delimiters: { label: 'Delimiters around pasted data', bool: 6 },
    reasoning: { label: 'Ask for step-by-step reasoning', bool: 8 },
    abstain: { label: 'Allow "I don\'t know"', bool: 10 },
    temperature: { label: 'Temperature', options: [['low', 'Low (0.2)', 0], ['medium', 'Medium (0.7)', 0], ['high', 'High (1.2)', 0]] }
  };
  const DEFAULT = { instruction: 'clear', context: 'some', format: 'described', examples: 'none', constraints: false, delimiters: false, reasoning: false, abstain: false, temperature: 'medium' };
  const OFF = { instruction: 'vague', context: 'none', format: 'none', examples: 'none', constraints: false, delimiters: false, reasoning: false, abstain: false, temperature: 'medium' };

  // Each task: a name, what it needs, and the reason it fails. `ok(c)` is the whole rule.
  const TASKS = [
    { id: 1, name: 'Extract invoice fields as JSON', needs: 'an exact schema and a temperature that is not high',
      ok: c => c.format === 'schema' && c.temperature !== 'high',
      why: c => c.temperature === 'high' && c.format === 'schema' ? 'High temperature produced a malformed JSON object.' : 'The reply had chatty text around the data, so the parser could not read it.' },
    { id: 2, name: 'Classify 10 reviews as positive or negative', needs: 'balanced examples, or a precise instruction that defines the labels',
      ok: c => c.examples === 'balanced' || (c.examples === 'none' && c.instruction === 'precise'),
      why: c => c.examples === 'skewed' ? 'The examples were mostly one label, so the model leaned toward it and mislabeled the others.' : 'The labels and criteria were never defined, so borderline reviews were guessed.' },
    { id: 3, name: 'Summarize an article in 50 words', needs: 'a length constraint and a non-vague instruction',
      ok: c => c.constraints && c.instruction !== 'vague',
      why: c => c.instruction === 'vague' ? 'The request was too vague to know what a good summary is.' : 'No length limit was given, so the summary ran to 130 words.' },
    { id: 4, name: 'Reply to an email that contains a hidden instruction', needs: 'delimiters that mark the email as data',
      ok: c => c.delimiters,
      why: () => 'The hidden instruction in the email was obeyed, because nothing marked the email as data rather than orders.' },
    { id: 5, name: 'Write an apology email with the order details', needs: 'full context and a non-vague instruction',
      ok: c => c.context === 'full' && c.instruction !== 'vague',
      why: c => c.instruction === 'vague' ? 'The request was too vague to know the purpose or the tone.' : 'Details about the order were missing, so the email was generic or invented facts.' },
    { id: 6, name: 'Solve a multi-step word problem', needs: 'step-by-step reasoning and a temperature that is not high',
      ok: c => c.reasoning && c.temperature !== 'high',
      why: c => c.reasoning ? 'High temperature made the arithmetic wander off.' : 'The model jumped straight to an answer and made an arithmetic slip.' },
    { id: 7, name: 'Brainstorm 10 different slogans', needs: 'a temperature above low and a non-vague instruction',
      ok: c => c.temperature !== 'low' && c.instruction !== 'vague',
      why: c => c.instruction === 'vague' ? 'The request did not say what the slogans are for.' : 'Low temperature produced ten near-identical slogans.' },
    { id: 8, name: 'Answer a question whose answer is not in the sources', needs: 'permission to say "I don\'t know"',
      ok: c => c.abstain,
      why: () => 'The model invented a confident answer, because it was never allowed to say it did not know.' }
  ];

  function tokens(c) {
    let t = 0;
    for (const [k, def] of Object.entries(COMPONENTS)) {
      if (def.bool) { if (c[k]) t += def.bool; } else if (def.options) { const o = def.options.find(x => x[0] === c[k]); t += o ? o[2] : 0; }
    }
    return t;
  }
  function run(config) {
    const c = Object.assign({}, DEFAULT, config);
    const results = TASKS.map(t => { const ok = !!t.ok(c); return { id: t.id, name: t.name, ok, note: ok ? 'passed' : t.why(c) }; });
    return { config: c, results, metrics: { passed: results.filter(r => r.ok).length, tokens: tokens(c) } };
  }
  const GOAL = { text: 'pass at least 7 of the 8 tasks with a prompt of at most 150 tokens', test: m => m.passed >= 7 && m.tokens <= 150 };

  window.PromptLab = { COMPONENTS, DEFAULT, OFF, TASKS, run, tokens, GOAL };

  /* ---------------- widget ---------------- */
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  T.promptlab = 'Experiment: which parts of a prompt do the work?';
  W.promptlab = el => {
    const p = Object.assign({}, DEFAULT);
    let last = null, log = [];
    const describe = c => { const d = []; for (const [k, def] of Object.entries(COMPONENTS)) { if (def.bool) { if (c[k]) d.push(def.label.split(' (')[0].toLowerCase()); } else if (c[k] !== OFF[k]) d.push(c[k]); } return d.join(', ') || 'bare'; };
    const draw = () => {
      const m = last && last.metrics;
      el.innerHTML = `<div class="ar-controls">${Object.entries(COMPONENTS).map(([k, def]) => def.bool
        ? `<label class="w-chip ${p[k] ? 'on' : ''}"><input type="checkbox" data-k="${k}" ${p[k] ? 'checked' : ''}> ${esc(def.label)} <small>+${def.bool}</small></label>`
        : `<label class="w-field inline">${esc(def.label)} <select data-s="${k}">${def.options.map(o => `<option value="${o[0]}" ${p[k] === o[0] ? 'selected' : ''}>${esc(o[1])}${o[2] ? ' (+' + o[2] + ')' : ''}</option>`).join('')}</select></label>`).join('')}
        <div class="w-nav"><button type="button" class="primary" data-run>▶ Run the 8 tasks</button><button type="button" data-clear ${log.length ? '' : 'disabled'}>Clear log</button></div>
        <p class="w-small">This prompt would be about <b>${tokens(p)}</b> tokens long.</p></div>
      ${m ? `<div class="ag-stats ar-stats"><div class="${m.passed >= 7 ? 'good' : 'bad'}"><b>${m.passed}/8</b><small>tasks passed</small></div><div><b>${m.tokens}</b><small>prompt tokens</small></div></div>
        <ul class="pl-results" aria-label="Result of each task">${last.results.map(r => `<li class="${r.ok ? 'ok' : 'no'}"><span class="pl-mark" aria-hidden="true">${r.ok ? '✓' : '✗'}</span><span><b>${esc(r.name)}</b><br><small>${esc(r.ok ? 'passed' : r.note)}</small></span></li>`).join('')}</ul>
        <p class="w-status ${GOAL.test(m) ? 'good' : 'warn'}">${GOAL.test(m) ? '✓ Goal met: ' : 'Goal not met yet: '}${esc(GOAL.text)}.</p>`
        : '<p class="w-small">Build a prompt from the components above and run the eight tasks. Every failure says why. Each run is added to the log so you can compare prompts. Nothing is random: the same prompt always gives the same result.</p>'}
      ${log.length ? `<div class="w-tablewrap"><table class="w-table ar-log"><thead><tr><th>#</th><th>Prompt</th><th>Passed</th><th>Tokens</th></tr></thead><tbody>${log.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(describe(r.config))}</td><td class="${r.metrics.passed < 7 ? 'no' : ''}">${r.metrics.passed}/8</td><td>${r.metrics.tokens}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
    };
    const focusBack = sel => { const n = el.querySelector(sel); if (n) n.focus(); };
    el.addEventListener('change', e => {
      const s = e.target.closest('[data-s]'), k = e.target.closest('[data-k]');
      if (s) { p[s.dataset.s] = s.value; draw(); focusBack(`[data-s="${s.dataset.s}"]`); } else if (k) { p[k.dataset.k] = k.checked; draw(); focusBack(`[data-k="${k.dataset.k}"]`); }
    });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-run]')) { last = run(p); log.push(last); log = log.slice(-8); draw(); focusBack('[data-run]'); }
      else if (e.target.closest('[data-clear]')) { log = []; last = null; draw(); }
    });
    draw();
  };
})();
