/* Practice hub: pre/post-lesson practice quizzes (three imported MIT quiz sets, attributed), hands-on Python labs (original tasks with hidden tests)
   and a Sources page that states what was copied and what is only linked.
   Routes: #/practice, #/practice/quizzes[/<set>], #/practice/quiz/<set>/<lesson>/<pre|post>, #/practice/labs, #/practice/lab/<id>, #/practice/sources.
   Imported quiz text is treated as data and always escaped. Progress is stored only in this browser (localStorage). */
(function () {
  'use strict';
  const SETS = (window.PRACTICE_QUIZZES || { sets: [] }).sets;
  const LABS = window.PRACTICE_LABS || [];
  const SRC = window.PRACTICE_SOURCES || { checked: '', sources: [] };
  const KEY = 'learnai-practice-v1';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let P = { quiz: {}, labs: {}, drafts: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') P = { quiz: s.quiz || {}, labs: s.labs || {}, drafts: s.drafts || {} }; } catch (_) {}
  Object.keys(P.quiz).forEach(k => { if (!k.includes('/')) { P.quiz['ml/' + k] = P.quiz[k]; delete P.quiz[k]; } });     // first version stored only the ML set
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (_) {} };

  const setById = id => SETS.find(s => s.id === id);
  const lessonOf = (set, id) => set && set.lessons.find(l => l.id === id);
  const bestOf = (setId, lessonId, phase) => (P.quiz[setId + '/' + lessonId] || {})[phase] || null;
  const labDone = id => !!(P.labs[id] && P.labs[id].passed);
  const crumbs = (...parts) => `<nav class="crumbs"><a href="#/">Home</a> / ${parts.join(' / ')}</nav>`;
  const wrap = html => `<div class="container ph">${html}</div>`;
  const countQ = set => set.lessons.reduce((n, l) => n + Object.values(l.quizzes).reduce((m, q) => m + q.questions.length, 0), 0);
  const countQuizzes = set => set.lessons.reduce((n, l) => n + Object.keys(l.quizzes).length, 0);
  const totalQuestions = SETS.reduce((n, s) => n + countQ(s), 0), totalQuizzes = SETS.reduce((n, s) => n + countQuizzes(s), 0);
  const PHASE = { pre: 'Pre-lesson', post: 'Post-lesson' };
  const attribution = set => `<a href="${esc(set.source.url)}" target="_blank" rel="noopener noreferrer">${esc(set.source.name)}</a> (${esc(set.source.license)} licence, ${esc(set.source.copyright)})`;
  const noticeLink = '<a href="THIRD_PARTY_NOTICES.md">THIRD_PARTY_NOTICES.md</a>';

  /* ---------- hub ---------- */
  function hub(app) {
    document.title = 'Practice · learn/ai';
    const taken = SETS.reduce((n, s) => n + s.lessons.reduce((m, l) => m + Object.keys(l.quizzes).filter(p => bestOf(s.id, l.id, p)).length, 0), 0);
    const labsDone = LABS.filter(l => labDone(l.id)).length;
    const tracks = [...new Set(LABS.map(l => l.track))];
    app.innerHTML = wrap(`${crumbs('Practice')}
      <header class="ph-hero"><span class="kicker">Learn by doing</span><h1>Practice hub</h1>
        <p>Short quizzes to check what you know, and hands-on coding labs that grade your own code with hidden tests, right in your browser. Nothing to install and nothing is uploaded.</p></header>
      <div class="ph-cards">
        <a class="ph-card" href="#/practice/quizzes"><span class="ph-ico">📝</span><h2>Practice quizzes</h2>
          <p>${SETS.length} sets (${SETS.map(s => esc(s.name)).join(', ')}): ${SETS.reduce((n, s) => n + s.lessons.length, 0)} lessons, each with a pre-lesson and a post-lesson quiz. ${totalQuestions} questions with instant feedback.</p>
          <div class="ph-meta"><b>${taken}</b> of ${totalQuizzes} quizzes taken</div></a>
        <a class="ph-card" href="#/practice/labs"><span class="ph-ico">🧪</span><h2>Coding labs</h2>
          <p>${LABS.length} labs in Python: ${tracks.map(esc).join(', ').toLowerCase()}. Your function is run against brute-force checks.</p>
          <div class="ph-meta"><b>${labsDone}</b> of ${LABS.length} labs passed</div></a>
        <a class="ph-card" href="#/practice/notebooks"><span class="ph-ico">📓</span><h2>Notebooks &amp; course texts</h2>
          <p>${(window.PRACTICE_NOTEBOOKS || { notebooks: [] }).notebooks.length} Jupyter notebooks (ISLP labs, Hands-On ML, Zero to Hero, LangChain Academy) to open in Colab or download, plus ${(window.PRACTICE_NOTEBOOKS || { texts: [] }).texts.length} readable course texts (Hugging Face Agents Course, OSSU curriculum).</p>
          <div class="ph-meta">copied unchanged, with licences</div></a>
        <a class="ph-card" href="#/practice/sources"><span class="ph-ico">📚</span><h2>Sources &amp; licences</h2>
          <p>Which open-source repositories were used, which files were copied (always with the licence), and which are only linked, and why.</p>
          <div class="ph-meta"><b>${SRC.sources.filter(s => s.status === 'imported').length}</b> imported · <b>${SRC.sources.filter(s => s.status === 'linked').length}</b> linked</div></a>
      </div>
      <p class="ph-credit">Quiz questions are copied unchanged from three Microsoft MIT-licensed repositories; lab tasks and tests are original, and each lab links to a matching open-source reference. See ${noticeLink} and the <a href="#/practice/sources">Sources page</a>. Progress is saved only in this browser.</p>`);
  }

  /* ---------- quiz list ---------- */
  function quizList(app, setId) {
    const set = setById(setId) || SETS[0];
    document.title = 'Practice quizzes · learn/ai';
    const card = l => {
      const btn = phase => { const q = l.quizzes[phase]; if (!q) return ''; const b = bestOf(set.id, l.id, phase);
        return `<a class="btn sm ${b ? '' : 'primary'}" href="#/practice/quiz/${set.id}/${l.id}/${phase}">${PHASE[phase]}${b ? ` · best ${b.best}/${b.total}` : ` · ${q.questions.length} questions`}</a>`; };
      return `<article class="ph-lesson"><h3>${esc(l.title)}</h3><div class="ph-actions">${btn('pre')}${btn('post')}</div></article>`;
    };
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', 'Quizzes')}
      <header class="ph-hero"><h1>Practice quizzes</h1><p>Take the pre-lesson quiz to see what you already know, study the lesson, then take the post-lesson quiz. You can retry as often as you like.</p>
      <div class="ph-tabs" role="group" aria-label="Quiz set">${SETS.map(s => `<a class="ph-tab ${s.id === set.id ? 'on' : ''}" href="#/practice/quizzes/${s.id}">${esc(s.name)} <small>${s.lessons.length} lessons</small></a>`).join('')}</div>
      ${set.course ? `<p class="ph-sub">Goes with the <a href="#/course/${set.course}">${esc(set.name)} course</a>.</p>` : ''}
      <label class="ph-search"><span>Search lessons</span><input id="ph-q" type="search" placeholder="e.g. regression, ethics, neural networks"></label></header>
      <div class="ph-grid" id="ph-grid">${set.lessons.map(card).join('')}</div>
      <p class="ph-credit">Questions: ${attribution(set)}. Copied unchanged; options may be shuffled when you take a quiz.</p>`);
    app.querySelector('#ph-q').addEventListener('input', e => { const t = e.target.value.toLowerCase().trim(); app.querySelector('#ph-grid').innerHTML = set.lessons.filter(l => l.title.toLowerCase().includes(t)).map(card).join('') || '<p>No lesson matches.</p>'; });
  }

  /* ---------- quiz runner ---------- */
  function shuffled(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function quiz(app, setId, lessonId, phase) {
    const set = setById(setId), lesson = lessonOf(set, lessonId);
    if (!lesson || !lesson.quizzes[phase]) { app.innerHTML = wrap('<h1>Quiz not found</h1><a href="#/practice/quizzes">Back to quizzes</a>'); return; }
    const questions = lesson.quizzes[phase].questions.map(q => { const order = q.fixed ? q.options.map((_, i) => i) : shuffled(q.options.length); return { q: q.q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) }; });
    const label = PHASE[phase] + ' quiz', lk = setId + '/' + lessonId;
    document.title = `${lesson.title} · ${label} · learn/ai`;
    let i = 0, score = 0, picked = null; const missed = [];
    const head = `${crumbs('<a href="#/practice">Practice</a>', `<a href="#/practice/quizzes/${set.id}">Quizzes</a>`, esc(lesson.title))}<h1>${esc(lesson.title)}</h1><p class="ph-sub">${esc(set.name)} · ${label}</p>`;
    function show() {
      if (i >= questions.length) return finish();
      const q = questions[i]; picked = null;
      app.innerHTML = wrap(`${head}<section class="ph-q" aria-live="polite"><div class="ph-prog"><span>Question ${i + 1} of ${questions.length}</span><span class="ph-bar"><i style="width:${i / questions.length * 100}%"></i></span></div>
        <h2 class="ph-qtext">${esc(q.q)}</h2>
        <div class="ph-opts" role="radiogroup" aria-label="Answer choices">${q.options.map((o, k) => `<button type="button" class="ph-opt" role="radio" aria-checked="false" data-k="${k}">${esc(o)}</button>`).join('')}</div>
        <div class="ph-fb" id="ph-fb"></div><div class="ph-actions"><button type="button" class="btn primary" id="ph-check" disabled>Check answer</button></div></section>`);
      const check = app.querySelector('#ph-check');
      app.querySelectorAll('.ph-opt').forEach(b => b.addEventListener('click', () => { if (app.querySelector('.ph-opt.locked')) return; picked = +b.dataset.k; app.querySelectorAll('.ph-opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); }); check.disabled = false; }));
      check.addEventListener('click', () => {
        if (check.dataset.next) { i++; show(); return; }
        const ok = picked === q.answer; if (ok) score++; else missed.push({ q: q.q, yours: q.options[picked], right: q.options[q.answer] });
        app.querySelectorAll('.ph-opt').forEach((x, k) => { x.classList.add('locked'); x.disabled = true; if (k === q.answer) x.classList.add('right'); else if (k === picked) x.classList.add('wrong'); });
        app.querySelector('#ph-fb').innerHTML = ok ? '<p class="ph-ok">✓ Correct</p>' : `<p class="ph-bad">✗ Not quite. The correct answer is: <b>${esc(q.options[q.answer])}</b></p>`;
        check.textContent = i + 1 < questions.length ? 'Next question →' : 'See results'; check.dataset.next = '1'; check.focus();
      });
    }
    function finish() {
      const prev = bestOf(setId, lessonId, phase); const best = prev ? Math.max(prev.best, score) : score;
      P.quiz[lk] = Object.assign({}, P.quiz[lk], { [phase]: { best, total: questions.length, last: score } }); save();
      const pct = Math.round(score / questions.length * 100);
      const other = phase === 'pre' ? 'post' : 'pre';
      app.innerHTML = wrap(`${head}<section class="ph-q"><h2>Result: ${score} of ${questions.length} (${pct}%)</h2><p>${score === questions.length ? 'Perfect score. Well done!' : pct >= 60 ? 'Good work. Review the questions below, then try again for a perfect score.' : 'Keep going: review the answers below, study the lesson and retry.'} Your best: ${best} of ${questions.length}.</p>
        ${missed.length ? `<h3>Review</h3><ul class="ph-review">${missed.map(m => `<li><b>${esc(m.q)}</b><br><span class="ph-bad">You chose: ${esc(m.yours)}</span><br><span class="ph-ok">Correct: ${esc(m.right)}</span></li>`).join('')}</ul>` : ''}
        <div class="ph-actions"><a class="btn primary" href="#/practice/quiz/${setId}/${lessonId}/${phase}" id="ph-retry">Retry</a>${lesson.quizzes[other] ? `<a class="btn" href="#/practice/quiz/${setId}/${lessonId}/${other}">${PHASE[other]} quiz</a>` : ''}<a class="btn ghost" href="#/practice/quizzes/${setId}">All ${esc(set.name)} quizzes</a></div>
        <p class="ph-credit">Questions: ${attribution(set)}.</p></section>`);
      app.querySelector('#ph-retry').addEventListener('click', e => { e.preventDefault(); i = 0; score = 0; missed.length = 0; show(); });
    }
    show();
  }

  /* ---------- lab list ---------- */
  function labList(app) {
    document.title = 'Coding labs · learn/ai';
    const tracks = ['All', ...new Set(LABS.map(l => l.track))];
    let active = 'All';
    const card = l => `<a class="ph-lab ${labDone(l.id) ? 'done' : ''}" href="#/practice/lab/${l.id}"><span class="ph-lvl ${l.level.toLowerCase()}">${l.level}</span><h3>${labDone(l.id) ? '✓ ' : ''}${esc(l.title)}</h3><p>${esc(l.concept)}</p><span class="ph-track">${esc(l.track)}</span></a>`;
    const draw = () => { app.querySelector('#ph-grid').innerHTML = LABS.filter(l => active === 'All' || l.track === active).map(card).join(''); app.querySelectorAll('[data-track]').forEach(b => b.classList.toggle('on', b.dataset.track === active)); };
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', 'Coding labs')}
      <header class="ph-hero"><h1>Coding labs</h1><p>Write the function in the editor, press <b>Check</b>, and your code runs against hidden tests that compare it with brute force or an independent reference. Python runs in your browser (about 10 MB, loaded on first use).</p>
      <div class="ph-tabs" role="group" aria-label="Filter by topic">${tracks.map(t => `<button type="button" data-track="${esc(t)}" class="${t === 'All' ? 'on' : ''}">${esc(t)}</button>`).join('')}</div></header>
      <div class="ph-grid" id="ph-grid"></div>
      <p class="ph-credit">Each lab links to a matching open-source reference (licences on the <a href="#/practice/sources">Sources page</a>). The tasks and tests are original.</p>`);
    app.querySelectorAll('[data-track]').forEach(b => b.addEventListener('click', () => { active = b.dataset.track; draw(); }));
    draw();
  }

  /* ---------- lab page ---------- */
  function lab(app, id) {
    const l = LABS.find(x => x.id === id);
    if (!l) { app.innerHTML = wrap('<h1>Lab not found</h1><a href="#/practice/labs">Back to labs</a>'); return; }
    document.title = `${l.title} · Coding lab · learn/ai`;
    let hints = 0, attempts = P.labs[id] ? P.labs[id].attempts || 0 : 0;
    const r = l.reference;
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', '<a href="#/practice/labs">Coding labs</a>', esc(l.title))}
      <div class="ph-labpage"><section class="ph-task"><span class="ph-lvl ${l.level.toLowerCase()}">${l.level}</span> <span class="ph-track">${esc(l.track)}</span>
        <h1>${labDone(id) ? '✓ ' : ''}${esc(l.title)}</h1><p class="ph-concept">${esc(l.concept)}</p><div class="ph-prompt">${l.prompt}</div>
        <div class="ph-hintbox" id="ph-hints"></div>
        <p class="ph-ref">Compare with the reference: <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.repo)}/${esc(r.path)}</a> (${esc(r.license)}${r.local ? '' : ', link only'})${r.local ? ` · <a href="${esc(r.local)}" target="_blank" rel="noopener">local copy</a>` : ''}</p></section>
      <section class="ph-editor"><div class="lab-head"><span class="lab-title">🐍 Python</span><span class="lab-status" id="ph-status">Python loads on first run (~10 MB)</span></div>
        <textarea id="ph-code" spellcheck="false" aria-label="Python code editor" rows="18"></textarea>
        <div class="ph-actions"><button type="button" class="btn primary sm" id="ph-run">▶ Run</button><button type="button" class="btn sm accent-outline" id="ph-checkbtn">✓ Check</button><span class="sp"></span><button type="button" class="btn sm ghost" id="ph-hint">💡 Hint</button><button type="button" class="btn sm ghost" id="ph-reset">↺ Reset</button><button type="button" class="btn sm ghost" id="ph-solution" hidden>Show sample solution</button></div>
        <div class="ph-out" id="ph-out"><p class="muted">Run prints output here. Check runs the hidden tests against your code.</p></div></section></div>`);
    const ed = app.querySelector('#ph-code'), out = app.querySelector('#ph-out'), status = app.querySelector('#ph-status');
    ed.value = P.drafts[id] != null ? P.drafts[id] : l.starter;
    ed.addEventListener('input', () => { P.drafts[id] = ed.value; save(); });
    ed.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('    ', s, ed.selectionEnd, 'end'); ed.dispatchEvent(new Event('input')); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); app.querySelector('#ph-checkbtn').click(); }
    });
    const reveal = () => { if (attempts > 0 || labDone(id)) app.querySelector('#ph-solution').hidden = false; };
    reveal();
    window.__pyMsg = m => { if (/^Loading|^Loaded/.test(m)) out.innerHTML = `<p class="muted">⏳ ${esc(m.length > 140 ? m.slice(0, 140) + '…' : m)}</p>`; };
    const ready = () => { status.textContent = '● Python ready'; status.classList.add('ready'); };
    async function exec(test) {
      if (typeof window.__runPython !== 'function') throw new Error('The Python runner is not available.');
      if (!status.classList.contains('ready')) status.textContent = 'Loading Python…';
      const res = await window.__runPython(ed.value, test); ready(); return res;
    }
    app.querySelector('#ph-run').addEventListener('click', async () => {
      out.innerHTML = '<p class="muted">Running…</p>';
      try { const res = await exec(null); out.innerHTML = res.ok ? `<pre>${esc(res.out || '(no output; define your function, then press Check)')}</pre>` : `${res.out ? `<pre>${esc(res.out)}</pre>` : ''}<pre class="err">${esc(res.err)}</pre>`; }
      catch (e) { out.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
    });
    app.querySelector('#ph-checkbtn').addEventListener('click', async () => {
      out.innerHTML = '<p class="muted">Running hidden tests…</p>';
      try {
        const res = await exec(l.test);
        attempts++; P.labs[id] = Object.assign({}, P.labs[id], { attempts });
        if (res.ok) { P.labs[id].passed = true; P.labs[id].at = new Date().toISOString().slice(0, 10); out.innerHTML = `<p class="ok-msg">✓ All tests passed. Nicely done!</p>${res.out ? `<pre>${esc(res.out)}</pre>` : ''}<p>Next: compare with the <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">reference implementation</a>, or <a href="#/practice/labs">pick another lab</a>.</p>`; app.querySelector('h1').textContent = '✓ ' + l.title; }
        else out.innerHTML = `<p class="err">✗ Not yet. A test failed:</p><pre class="err">${esc(res.err)}</pre><p class="muted">Read the TODOs, run your code, or ask for a hint.</p>`;
        save(); reveal();
      } catch (e) { out.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
    });
    app.querySelector('#ph-hint').addEventListener('click', () => {
      if (hints < l.hints.length) hints++;
      app.querySelector('#ph-hints').innerHTML = l.hints.slice(0, hints).map((h, k) => `<p>💡 <b>Hint ${k + 1}/${l.hints.length}:</b> ${esc(h)}</p>`).join('');
      app.querySelector('#ph-hint').textContent = hints < l.hints.length ? `💡 Hint ${hints + 1}/${l.hints.length}` : '💡 No more hints';
    });
    app.querySelector('#ph-reset').addEventListener('click', () => { if (confirm('Replace your code with the starter?')) { ed.value = l.starter; delete P.drafts[id]; save(); } });
    app.querySelector('#ph-solution').addEventListener('click', () => { out.innerHTML = `<p class="muted">Sample solution (try to understand it, then retype it yourself):</p><pre>${esc(l.solution)}</pre>`; });
  }

  /* ---------- notebooks and course texts (copied unmodified; never executed here) ---------- */
  const NB = window.PRACTICE_NOTEBOOKS || { notebooks: [], texts: [] };
  function notebooks(app, srcFilter) {
    document.title = 'Notebooks & course texts · learn/ai';
    let source = srcFilter || 'all', text = '', onlyBrowser = false;
    const repos = [...new Set(NB.notebooks.map(n => n.repo))];
    const label = r => (NB.notebooks.find(n => n.repo === r) || {}).sourceName || r;
    const nbCard = n => `<article class="ph-nb"><div class="ph-srchead"><h3>${esc(n.title)}</h3><span class="ph-lic">${esc(n.license)}</span><span class="ph-badge ${n.browser === 'likely' ? 'imported' : ''}">${n.browser === 'likely' ? 'Runs in browser Python (likely)' : 'Needs local Python or Colab'}</span></div>
      <p class="ph-srcmeta"><b>${esc(n.sourceName)}</b> · ${esc(n.track)} · ${n.codeCells} code cells · ${n.sizeKB} KB<br><code>${esc(n.file)}</code></p>
      ${n.needs.length ? `<p class="ph-why">Needs: ${n.needs.map(esc).join(', ')}</p>` : ''}
      <div class="ph-actions"><a class="btn sm primary" href="${esc(n.colab)}" target="_blank" rel="noopener noreferrer">Open in Colab</a><a class="btn sm" href="${esc(n.local)}" download>Download .ipynb</a><a class="btn sm ghost" href="${esc(n.github)}" target="_blank" rel="noopener noreferrer">GitHub</a></div></article>`;
    const txtCard = t => `<a class="ph-nb ph-txt" href="#/practice/text/${esc(t.id)}"><h3>${esc(t.title)}</h3><p class="ph-srcmeta"><b>${esc(t.sourceName)}</b>${t.group ? ' · ' + esc(t.group) : ''} · ${t.sizeKB} KB · ${esc(t.license)}</p></a>`;
    const draw = () => {
      const q = text.toLowerCase().trim();
      const ns = NB.notebooks.filter(n => (source === 'all' || n.repo === source) && (!onlyBrowser || n.browser === 'likely') && (!q || (n.title + ' ' + n.file + ' ' + n.imports.join(' ')).toLowerCase().includes(q)));
      const ts = NB.texts.filter(t => (source === 'all' || t.repo === source) && !onlyBrowser && (!q || (t.title + ' ' + t.group).toLowerCase().includes(q)));
      app.querySelector('#ph-nbs').innerHTML = ns.map(nbCard).join('') || '<p>No notebook matches.</p>';
      app.querySelector('#ph-txts').innerHTML = ts.map(txtCard).join('') || '<p>No text matches.</p>';
      app.querySelector('#ph-nbcount').textContent = `${ns.length} notebooks · ${ts.length} course texts`;
    };
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', 'Notebooks &amp; course texts')}
      <header class="ph-hero"><h1>Notebooks &amp; course texts</h1><p>${NB.notebooks.length} Jupyter notebooks and ${NB.texts.length} course texts from open-source projects, copied unchanged with their licences. Open a notebook in Google Colab or download it; nothing here runs the notebooks. The course texts are plain text readable on this site. See <a href="#/practice/sources">Sources &amp; licences</a>.</p>
      <div class="ph-tabs" id="ph-nbtabs" role="group" aria-label="Source"><button type="button" data-s="all" class="on">All</button>${repos.map(r => `<button type="button" data-s="${esc(r)}">${esc(label(r))}</button>`).join('')}<button type="button" data-s="huggingface/agents-course">Agents Course text</button></div>
      <div class="ph-filters"><label class="ph-search"><span>Search</span><input id="ph-nbq" type="search" placeholder="e.g. regression, memory, backprop"></label><label class="ph-check"><input type="checkbox" id="ph-nbbrowser"> Only notebooks that may run with browser Python</label></div>
      <p class="ph-sub" id="ph-nbcount"></p></header>
      <div class="ph-srcs" id="ph-nbs"></div><h2 class="ph-h2">Course texts</h2><div class="ph-srcs" id="ph-txts"></div>
      <p class="ph-credit">All files: see ${noticeLink}. Notebook outputs inside the files are from their authors' runs.</p>`);
    app.querySelectorAll('#ph-nbtabs [data-s]').forEach(b => b.addEventListener('click', () => { source = b.dataset.s; app.querySelectorAll('#ph-nbtabs [data-s]').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    app.querySelector('#ph-nbq').addEventListener('input', e => { text = e.target.value; draw(); });
    app.querySelector('#ph-nbbrowser').addEventListener('change', e => { onlyBrowser = e.target.checked; draw(); });
    draw();
  }
  function textPage(app, id) {
    const t = NB.texts.find(x => x.id === id);
    if (!t) { app.innerHTML = wrap('<h1>Text not found</h1><a href="#/practice/notebooks">Back to notebooks and texts</a>'); return; }
    document.title = `${t.title} · learn/ai`;
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', '<a href="#/practice/notebooks">Notebooks &amp; texts</a>', esc(t.title))}
      <h1>${esc(t.title)}</h1><p class="ph-sub">${esc(t.sourceName)} · ${esc(t.license)} · plain text of the original file (formatting markup is shown as written) · <a href="${esc(t.github)}" target="_blank" rel="noopener noreferrer">original on GitHub</a> · <a href="${esc(t.local)}" download>download</a></p>
      <pre class="ph-reader" id="ph-reader">Loading…</pre>`);
    fetch(t.local).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(body => { const el = app.querySelector('#ph-reader'); if (el) el.textContent = body; })
      .catch(() => { const el = app.querySelector('#ph-reader'); if (el) el.textContent = 'This file could not be loaded here (it needs the site to be served over http). Use the GitHub link above.'; });
  }

  /* ---------- sources ---------- */
  function sources(app) {
    document.title = 'Sources & licences · learn/ai';
    let filter = 'all';
    const row = s => `<article class="ph-src ${s.status}"><div class="ph-srchead"><h3><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a></h3><span class="ph-badge ${s.status}">${s.status === 'imported' ? 'Copied with licence' : 'Link only'}</span><span class="ph-lic">${esc(s.license)}</span></div>
      <p class="ph-srcmeta"><b>For:</b> ${esc(s.target)} · <b>Use:</b> ${esc(s.used)}</p>${s.why ? `<p class="ph-why"><b>Why not copied:</b> ${esc(s.why)}</p>` : ''}</article>`;
    const draw = () => { app.querySelector('#ph-srcs').innerHTML = SRC.sources.filter(s => filter === 'all' || s.status === filter).map(row).join(''); app.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b.dataset.f === filter)); };
    app.innerHTML = wrap(`${crumbs('<a href="#/practice">Practice</a>', 'Sources')}
      <header class="ph-hero"><h1>Sources &amp; licences</h1><p>Open-source repositories from your catalog, checked against GitHub on ${esc(SRC.checked)}. Files were copied only from repositories whose licence allows it, always unchanged and with the licence text (see ${noticeLink}). Everything else is a link, with the reason. This is practical guidance, not legal advice.</p>
      <div class="ph-tabs" role="group" aria-label="Filter"><button type="button" data-f="all" class="on">All ${SRC.sources.length}</button><button type="button" data-f="imported">Copied with licence</button><button type="button" data-f="linked">Link only</button></div></header>
      <div class="ph-srcs" id="ph-srcs"></div>`);
    app.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; draw(); }));
    draw();
  }

  function render(app, parts) {
    const [a, b, c, d] = parts || [];
    if (!a) hub(app);
    else if (a === 'quizzes') quizList(app, b);
    else if (a === 'quiz') quiz(app, b, c, d);
    else if (a === 'labs') labList(app);
    else if (a === 'lab') lab(app, b);
    else if (a === 'sources') sources(app);
    else if (a === 'notebooks') notebooks(app);
    else if (a === 'text') textPage(app, b);
    else hub(app);
  }
  window.PracticeHub = { render, labs: LABS, sets: SETS };
})();
