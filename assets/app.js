(() => {
  'use strict';
  const base = window.ALC_DATA || { courses: [], resources: [] };
  const app = document.querySelector('#app');
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

  /* ---------- Catalog: DB course + legacy courses normalized to one shape ---------- */
  const legacy = base.courses.map(c => ({
    ...c, lang: 'python', short: c.title,
    learn: c.lessons.map(l => l.goal),
    lessons: c.lessons.map(l => ({
      ...l,
      sections: [
        { h: 'The big idea', html: `<p>${esc(l.explain)}</p>` },
        { h: 'Think of it this way', html: `<div class="callout">${esc(l.analogy)}</div>` },
        { h: 'Remember', html: `<ul>${l.points.map(p => `<li>${md(p)}</li>`).join('')}</ul>` },
        { h: 'Key takeaway', html: `<p>${esc(l.takeaway)}</p>` }
      ],
      lab: { code: l.code, practice: l.practice },
      quiz: [{ q: l.challenge.question, options: l.challenge.options, correct: l.challenge.correct, why: l.challenge.explanation }]
    }))
  }));
  legacy.forEach(c => { c.downloads = true; });
  const courses = [window.DB_COURSE, window.OS_COURSE, window.NETWORK_COURSE, window.ISLR_COURSE, window.ALGO_COURSE, window.AI_COURSE, window.AGENTS_COURSE, window.ML_COURSE, window.LLM_COURSE, window.PROMPT_COURSE, window.DL_COURSE, ...legacy].filter(Boolean);
  const BOOK_FOR_COURSE = {'operating-systems':'os','computer-networking':'network','statistical-learning':'islr','algorithm-design':'algo',databases:'db','deep-learning':'d2l','ai-foundations':'aima','machine-learning':'islr','llm-engineering':'llm','prompt-engineering':'davies'};
  const bookFor = c => BOOK_FOR_COURSE[c.id] || null;
  // Practice hub links (quizzes and coding labs) for the courses they match
  const PRACTICE_FOR_COURSE = { 'machine-learning': ['Practice quizzes', '#/practice/quizzes/ml'], 'ai-foundations': ['Practice quizzes', '#/practice/quizzes/ai'], 'algorithm-design': ['Coding labs', '#/practice/labs'], 'deep-learning': ['Coding lab: autograd', '#/practice/lab/autograd-value'] };
  const practiceLink = c => PRACTICE_FOR_COURSE[c.id] ? `<a class="btn full" href="${PRACTICE_FOR_COURSE[c.id][1]}">${PRACTICE_FOR_COURSE[c.id][0]} →</a>` : '';
  const CATS = [['all', 'All courses'], ['databases', 'Databases'], ['foundations', 'Foundations'], ['generative', 'Generative AI'], ['systems', 'Systems']];
  const getCourse = id => courses.find(c => c.id === id);
  const minutes = c => c.lessons.reduce((a, l) => a + (l.minutes || 5), 0);
  const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`.trim() : `${m} min`;
  const courseURL = c => '#/course/' + c.id;
  const lessonURL = (c, l) => courseURL(c) + '/' + l.id;

  /* ---------- Progress (localStorage, with migration from v1) ---------- */
  const KEY = 'learnai-progress-v2';
  let P = { done: {}, quiz: {}, lab: {}, last: null };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') P = { ...P, ...s }; else { const old = JSON.parse(localStorage.getItem('free-ai-learning-center-completed-v1') || '[]'); if (Array.isArray(old)) old.forEach(k => P.done[k] = true); } } catch (_) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (_) {} };
  window.LearningEngine.importExisting(courses, P);
  const k = (c, l) => c.id + '/' + l.id;
  const isDone = (c, l) => !!P.done[k(c, l)];
  const countDone = c => c.lessons.filter(l => isDone(c, l)).length;
  const pct = c => Math.round(countDone(c) / c.lessons.length * 100);
  const labTasks = l => (l.lab && l.lab.tasks) ? l.lab.tasks.length : 0;
  function checkComplete(c, l) {
    const quizOk = (l.quiz || []).every((_, i) => P.quiz[k(c, l) + '#' + i]);
    const labOk = Array.from({ length: labTasks(l) }, (_, i) => P.lab[k(c, l) + '#' + i]).every(Boolean);
    if (quizOk && labOk && !isDone(c, l)) { P.done[k(c, l)] = true; save(); toast('🎉 Lesson complete!'); refreshProgressUI(c); }
  }

  /* ---------- Small UI helpers ---------- */
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2400); }
  const ring = (p, size = 44) => `<svg class="ring" viewBox="0 0 36 36" width="${size}" height="${size}" aria-hidden="true"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="${p} 100" stroke-linecap="round" transform="rotate(-90 18 18)"/><text x="18" y="21.5" text-anchor="middle" font-size="9" font-weight="700" fill="var(--ink)">${p}%</text></svg>`;
  const courseVars = c => `--accent:${c.accent};--accent-soft:${c.accent}22`;
  const art = c => `<div class="course-art" style="${courseVars(c)}"><span class="art-sym">${esc(c.symbol)}</span><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 Q50 30 100 60 T200 40 V100 H0Z" fill="currentColor" opacity=".18"/><path d="M0 85 Q60 55 120 78 T200 66 V100 H0Z" fill="currentColor" opacity=".28"/></svg>${c.tag ? `<span class="art-tag">${esc(c.tag)}</span>` : ''}</div>`;

  /* ---------- HOME ---------- */
  let cat = 'all', query = '';
  const featured = [window.LLM_COURSE, window.DL_COURSE, window.AI_COURSE, window.PROMPT_COURSE, window.ML_COURSE, window.AGENTS_COURSE, window.DB_COURSE].filter(Boolean).map(c => getCourse(c.id));
  let featuredId = featured[0] && featured[0].id, featureTimer = null, featureTouched = false;

  /* ---------- Learning paths: start from the student's goal, then follow courses in order ---------- */
  const ICO = d => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const PATHS = [
    { id: 'ai-beginner', title: 'AI Beginner', blurb: 'Python, machine learning and AI foundations',
      who: 'No programming experience needed. Start with Python basics, then learn to train and evaluate machine-learning models, then the core ideas of AI.',
      icon: ICO('<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6Z"/><path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z"/>'),
      courses: ['python', 'machine-learning', 'ai-foundations'] },
    { id: 'ai-engineer', title: 'AI Engineer', blurb: 'Prompts, deep learning, LLMs and agents',
      who: 'For learners who can write some Python and want to build with modern models, from prompt design to deployed agents.',
      icon: ICO('<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
      courses: ['prompt-engineering', 'deep-learning', 'llm-engineering', 'ai-agents'] },
    { id: 'computer-science', title: 'Computer Science', blurb: 'Databases, operating systems, networking and algorithms',
      who: 'Core computer-science courses that follow standard university textbooks, with labs you run in the browser.',
      icon: ICO('<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 5-4 14"/>'),
      courses: ['databases', 'operating-systems', 'computer-networking', 'algorithm-design'] },
    { id: 'ai-researcher', title: 'AI Researcher', blurb: 'Statistics, deep learning and agents in depth, with research case studies',
      who: 'For students heading into research: rigorous statistical learning and modern models, then real case studies showing how published work was done.',
      icon: ICO('<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>'),
      courses: ['statistical-learning', 'deep-learning', 'ai-agents'],
      extra: { label: 'Research case studies', href: 'https://raja21068.github.io/raja/Research_Lab/#case-studies',
               text: 'Problem, method, results and reproducibility for ResearchLedger, AutoResearch and a published medical-imaging paper.' } }
  ];
  const pathCourses = p => p.courses.map(getCourse).filter(Boolean);
  const pathSummary = p => { const cs = pathCourses(p); return `${cs.length} courses · ${cs.reduce((a, c) => a + c.lessons.length, 0)} lessons · ${fmtMin(cs.reduce((a, c) => a + minutes(c), 0))}`; };
  const pathsSection = () => `<section class="container section-sm" id="paths" aria-labelledby="paths-h">
      <span class="kicker">Start here</span><h2 class="h2" id="paths-h">Choose your learning path</h2>
      <p class="paths-lead">Not sure where to begin? Pick a goal and follow its courses in order.</p>
      <div class="paths">${PATHS.filter(p => pathCourses(p).length).map(p => `<a class="path-card" href="#/path/${p.id}"><span class="path-ico">${p.icon}</span><h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p><small>${pathSummary(p)}</small></a>`).join('')}</div>
    </section>`;
  function pathPage(p) {
    const cs = pathCourses(p);
    document.title = `${p.title} learning path · learn/ai`;
    const next = cs.find(c => countDone(c) < c.lessons.length) || cs[0];
    app.innerHTML = `<section class="container section path-page">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/" data-goto="paths">Learning paths</a> / ${esc(p.title)}</nav>
      <div class="path-head"><span class="path-ico lg">${p.icon}</span><div><span class="kicker">Learning path</span><h1 class="h2">${esc(p.title)}</h1><p>${esc(p.who)}</p><small>${pathSummary(p)}</small></div></div>
      <a class="btn primary" href="${courseURL(next)}">${cs.some(c => countDone(c)) ? 'Continue with ' : 'Start with '}${esc(next.short || next.title)} →</a>
      <ol class="path-steps">${cs.map((c, i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><a class="step-card" href="${courseURL(c)}" style="${courseVars(c)}">
        <div><span class="card-level">Step ${i + 1} · ${esc(c.level)}</span><h3>${esc(c.title)}</h3><p>${esc(c.outcome || c.subtitle)}</p>
        <small>${c.lessons.length} lessons · ${fmtMin(minutes(c))}${countDone(c) ? ` · ${countDone(c)}/${c.lessons.length} done` : ''}</small></div>${countDone(c) ? ring(pct(c)) : ''}</a></li>`).join('')}
        ${p.extra ? `<li><span class="step-n" aria-hidden="true">${cs.length + 1}</span><a class="step-card" href="${p.extra.href}" target="_blank" rel="noopener"><div><span class="card-level">Then · applied research</span><h3>${esc(p.extra.label)} ↗</h3><p>${esc(p.extra.text)}</p></div></a></li>` : ''}
      </ol>
      <p class="path-other">Other paths: ${PATHS.filter(q => q !== p && pathCourses(q).length).map(q => `<a href="#/path/${q.id}">${esc(q.title)}</a>`).join(' · ')} · <a href="#/" data-goto="courses">All courses</a></p>
    </section>`;
  }
  const MOCKS = {
    databases: c => `<div class="mock-main"><b>${esc(c.lessons[7].title)}</b><span></span><span></span><span class="short"></span><div class="mock-venn"><i></i><i></i></div></div><div class="mock-lab"><code>SELECT V_NAME<br>FROM VENDOR V<br>LEFT JOIN PRODUCT P…</code><div class="mock-grid">${'<i></i>'.repeat(9)}</div><span class="mock-ok">✓ Correct</span></div>`,
    'machine-learning': c => `<div class="mock-main"><b>${esc(c.lessons[3].title)}</b><span></span><span class="short"></span><svg viewBox="0 0 100 50" class="mock-curve"><path d="M5 8 Q50 70 95 8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="27" r="3.5"/><circle cx="35" cy="38" r="3.5"/><circle cx="48" cy="41" r="4.5" fill="var(--ink)"/></svg></div><div class="mock-lab"><code>from sklearn.ensemble import<br>&nbsp;&nbsp;RandomForestClassifier<br>forest.fit(X_train, y_train)</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ All tests passed</span></div>`,
    'prompt-engineering': c => `<div class="mock-main"><b>${esc(c.lessons[1].title)}</b><span class="short"></span><div class="mock-prompt"><i>Role</i><i>Task</i><i>Context</i><i>Format</i></div><span></span></div><div class="mock-lab"><code>render("Write a {{length}}-word<br>{{tone}} email to {{who}}")</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ 100 prompts in the library</span></div>`,
    'llm-engineering': c => `<div class="mock-main"><b>${esc(c.lessons[0].title)}</b><span class="short"></span><div class="mock-fti"><i>🕸</i><i>🧩</i><i>🏋</i><i>⚡</i></div><span></span></div><div class="mock-lab"><code>margin = beta * (dc - dr)<br>loss = logaddexp(0, -margin)</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ All tests passed</span></div>`,
    'deep-learning': c => `<div class="mock-main"><b>${esc(c.lessons[10].title)}</b><span class="short"></span><div class="mock-layers">${[3, 5, 5, 2].map(n => `<i>${'<b></b>'.repeat(n)}</i>`).join('')}</div></div><div class="mock-lab"><code>def softmax(Z):<br>&nbsp;&nbsp;E = np.exp(Z - Z.max(1, keepdims=True))</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ All tests passed</span></div>`,
    'ai-foundations': c => `<div class="mock-main"><b>${esc(c.lessons[5].title)}</b><span class="short"></span><div class="mock-tree"><div><i class="on"></i></div><div><i class="on"></i><i></i><i></i></div><div><i></i><i class="on"></i><i></i><i></i></div></div></div><div class="mock-lab"><code>def alphabeta(b, player,<br>&nbsp;&nbsp;alpha, beta): …</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ All tests passed</span></div>`,
    'ai-agents': c => `<div class="mock-main"><b>${esc(c.lessons[1].title)}</b><span></span><span class="short"></span><div class="mock-loop"><i></i><b>🤖</b></div></div><div class="mock-lab"><code>def to_schema(fn):<br>&nbsp;&nbsp;sig = inspect…<br>&nbsp;&nbsp;return {"name": …</code><div class="mock-grid">${'<i></i>'.repeat(6)}</div><span class="mock-ok">✓ All tests passed</span></div>`
  };
  function featureCard(c) {
    const labs = c.lessons.reduce((a, l) => a + labTasks(l), 0);
    return `<a class="feature" href="${courseURL(c)}" style="${courseVars(c)}">
      <div class="feature-top"><span class="pill accent">★ Featured · ${esc(c.tag || c.level)}</span><span class="pill">${c.lessons.length} lessons · ${labs} labs · ${fmtMin(minutes(c))}</span></div>
      <div class="feature-mock"><div class="mock-side">${c.lessons.slice(0, 6).map((l, i) => `<i class="${i === 2 ? 'on' : ''}"></i>`).join('')}</div>${(MOCKS[c.id] || MOCKS.databases)(c)}</div>
      <h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><span class="btn primary">${countDone(c) ? 'Continue course' : 'Start learning'} →</span></a>`;
  }
  function showFeature(id) {
    const slot = document.getElementById('feature-slot'); if (!slot || !getCourse(id)) return;
    featuredId = id;
    slot.innerHTML = featureCard(getCourse(id));
    setHeroWord(getCourse(id));
    document.querySelectorAll('[data-feature]').forEach(b => { const on = b.dataset.feature === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  }
  // The hero heading names the featured course, with a short swap animation.
  function setHeroWord(c) {
    const el = document.getElementById('hero-rot'); if (!el || el.textContent === c.short) return;
    el.classList.add('out');
    setTimeout(() => { el.textContent = c.short; el.style.setProperty('--rc', c.accent); el.classList.remove('out'); }, 280);
  }
  // Rotate the featured card until the visitor interacts with it (skipped for reduced motion).
  function startFeatureRotation() {
    clearInterval(featureTimer);
    if (featured.length < 2 || featureTouched || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    featureTimer = setInterval(() => {
      const wrap = document.querySelector('.feature-wrap');
      if (!wrap) return clearInterval(featureTimer);
      if (wrap.matches(':hover, :focus-within')) return;
      showFeature(featured[(featured.findIndex(c => c.id === featuredId) + 1) % featured.length].id);
    }, 5000);
  }
  function home() {
    document.title = 'learn/ai · Free interactive courses in AI, machine learning, LLMs & computer science';
    if (!getCourse(featuredId)) featuredId = featured[0] && featured[0].id;
    const started = courses.filter(c => countDone(c) > 0 || (P.last && P.last.startsWith(c.id + '/')));
    app.innerHTML = `
    <section class="hero"><div class="container hero-grid">
      <div><span class="eyebrow">Free · Project-based · Runs in your browser</span>
        <h1>Learn <span class="rot-wrap"><span class="rot" id="hero-rot" style="--rc:${featured[0] ? featured[0].accent : 'var(--accent)'}">${esc(featured[0] ? featured[0].short : 'AI')}</span></span><br>by <em>building</em> it.</h1>
        <p class="lead">From SQL to shipping LLMs: concise lessons, live simulations, and auto-graded labs on real Python, scikit-learn and SQLite. No sign-up, no installs.</p>
        <div class="hero-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" type="search" placeholder="What do you want to learn? Try “joins” or “agents”" value="${esc(query)}" aria-label="Search courses"></div>
        <div class="learn-hero-links"><a class="btn sm" href="#/my-learning">My learning dashboard →</a><a class="btn sm" href="#/review">Spaced review →</a></div>
        <div class="hero-stats"><div><b>${courses.length}</b><span>courses</span></div><div><b>${courses.reduce((a, c) => a + c.lessons.length, 0)}</b><span>lessons</span></div><div><b>${courses.reduce((a, c) => a + c.lessons.reduce((x, l) => x + labTasks(l) + (l.lab ? (labTasks(l) ? 0 : 1) : 0), 0), 0)}</b><span>hands-on labs</span></div></div>
      </div>
      ${featured.length ? `<div class="feature-wrap">
        ${featured.length > 1 ? `<div class="feature-tabs" role="tablist" aria-label="Featured courses">${featured.map(c => `<button type="button" role="tab" data-feature="${c.id}" aria-selected="${c.id === featuredId}" class="${c.id === featuredId ? 'on' : ''}" style="${courseVars(c)}"><i class="ft-dot"></i>${esc(c.tabLabel || c.short || c.title)}</button>`).join('')}</div>` : ''}
        <div id="feature-slot" role="tabpanel">${featureCard(getCourse(featuredId))}</div></div>` : ''}
    </div></section>
    ${pathsSection()}
    ${started.length ? `<section class="container section-sm"><h2 class="h2">Continue learning</h2><div class="continue">${started.map(c => { const next = c.lessons.find(l => !isDone(c, l)) || c.lessons[0]; return `<a class="cont-card" href="${lessonURL(c, next)}" style="${courseVars(c)}">${ring(pct(c))}<div><small>${esc(c.short || c.title)}</small><b>${esc(next.title)}</b></div><span>→</span></a>`; }).join('')}</div></section>` : ''}
    <section class="container section" id="courses">
      <div class="sec-head"><div><span class="kicker">Course catalog</span><h2 class="h2">Explore courses</h2></div>
      <div class="chips" role="group" aria-label="Filter courses">${CATS.map(([v, t]) => `<button type="button" class="chip ${v === cat ? 'on' : ''}" data-cat="${v}" aria-pressed="${v === cat}">${t}</button>`).join('')}</div></div>
      <div class="grid" id="grid"></div>
    </section>
    ${window.PROMPT_LIBRARY ? `<section class="container section-sm"><a class="pl-promo" href="#/prompts" style="${window.PROMPT_COURSE ? courseVars(window.PROMPT_COURSE) : ''}"><div><span class="kicker">New · free</span><h2>The Prompt Library</h2><p>${window.PROMPT_LIBRARY.prompts.length} ready-to-use prompt templates across ${window.PROMPT_LIBRARY.cats.length} categories: job search, email, teaching, studying, code, marketing, images and more. Fill in the blanks and copy.</p><span class="btn primary">Browse prompts →</span></div><div class="pl-promo-cards">${window.PROMPT_LIBRARY.cats.slice(0, 8).map(c => `<span>${c[1]} ${esc(c[2])}</span>`).join('')}</div></a></section>` : ''}
    <section class="how"><div class="container">
      <span class="kicker">How it works</span><h2 class="h2">Every lesson is a mini-lab</h2>
      <div class="how-grid">
        <div><span class="how-n">1</span><h3>Learn the concept</h3><p>Concise explanations organized like a textbook chapter, with key terms you can review.</p></div>
        <div><span class="how-n">2</span><h3>Play with it</h3><p>Interactive diagrams and simulations: build ER diagrams, step through normalization, cause a lost update.</p></div>
        <div><span class="how-n">3</span><h3>Code in the lab</h3><p>A real SQLite or Python runtime sits beside every lesson. Run code and get your answer checked automatically.</p></div>
        <div><span class="how-n">4</span><h3>Check yourself</h3><p>Quick quizzes with explanations. Progress is saved in your browser.</p></div>
      </div></div></section>
    <section class="container section-sm about-block" id="about"><span class="kicker">About</span><h2 class="h2">Created by <a href="https://raja21068.github.io/raja/" target="_blank" rel="noopener">Dr. Rajesh Kumar</a></h2>
      <p>learn/ai is a free, independent learning site made by <b>Dr. Rajesh Kumar</b>, a postdoctoral researcher in AI at Beihang University (Hangzhou). See the <a href="https://raja21068.github.io/raja/" target="_blank" rel="noopener">academic portfolio</a> for research, publications and collaboration. The lessons are original; the open-source material it builds on is credited, with licences, on the <a href="#/practice/sources">Sources &amp; licences</a> page. Found a mistake or have an idea? <a href="https://github.com/raja21068" target="_blank" rel="noopener noreferrer">Reach out on GitHub</a>.</p></section>
    ${base.resources && base.resources.length ? `<section class="container section" id="resources"><span class="kicker">Open library</span><h2 class="h2">More free resources</h2><div class="res-grid">${base.resources.map(r => `<a class="res" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><span class="pill">${esc(r.kind)}</span><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><span class="res-link">GitHub ↗</span></a>`).join('')}</div>
      <div class="kit"><div><h3>Take it offline</h3><p>Starter kit: Jupyter notebooks, Python scripts and slide decks for the AI courses.</p></div><a class="btn" href="downloads/starter-pack.zip" download>↓ Download starter kit</a></div></section>` : ''}`;
    drawGrid();
    startFeatureRotation();
  }
  function drawGrid() {
    const g = document.getElementById('grid'); if (!g) return;
    const q = query.toLowerCase().trim();
    const list = courses.filter(c => (cat === 'all' || c.category === cat) && (!q || [c.title, c.subtitle, c.outcome, ...c.lessons.map(l => l.title + ' ' + l.goal)].join(' ').toLowerCase().includes(q)));
    g.innerHTML = list.length ? list.map(c => `<a class="card" href="${courseURL(c)}" style="${courseVars(c)}">${art(c)}<div class="card-body"><span class="card-level">${esc(c.level)}</span><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p></div><div class="card-foot"><span>${c.lessons.length} lessons · ${fmtMin(minutes(c))}${c.lessons.some(l=>l.lab) ? (c.lang === 'sql' ? ' · SQL labs' : ' · Python labs') : ' · interactive reading'}</span>${countDone(c) ? `<span class="mini-bar"><i style="width:${pct(c)}%"></i></span>` : ''}</div></a>`).join('') : '<p class="empty">No courses match. Try another keyword.</p>';
    document.querySelectorAll('[data-cat]').forEach(b => { b.classList.toggle('on', b.dataset.cat === cat); b.setAttribute('aria-pressed', b.dataset.cat === cat); });
  }

  // Per-lesson practice evidence for one course part (a formative signal, not a mastery score).
  const skillDots = (c, ls) => {
    const inf = ls.map(l => window.LearningEngine.info(c.id, l.id)), practiced = inf.filter(x => x.attempts).length, due = inf.filter(x => x.due).length;
    return `<span class="rm-skill" title="Practice evidence from your attempts, not a measure of mastery"><span class="rm-dots">${inf.map(x => `<i class="${x.code}"></i>`).join('')}</span><small>${practiced}/${ls.length} practiced${due ? ' · ' + due + ' due' : ''}</small></span>`;
  };

  /* ---------- Course at a glance: the six-part course structure, counted from the course data ---------- */
  function glanceHTML(c) {
    const M = window.COURSE_META || { courses: {}, status: {} }, m = M.courses[c.id] || {};
    const labs = c.lessons.reduce((a, l) => a + (labTasks(l) || (l.lab ? 1 : 0)), 0);
    const widgets = c.lessons.filter(l => l.widget).length;
    const quizzed = c.lessons.filter(l => (l.quiz || []).length).length;
    const project = c.lessons.find(l => /project|capstone/i.test(l.title));
    const demos = widgets ? `${widgets} interactive simulations` : (bookFor(c) ? 'Interactive chapter figures' : '');
    const pre = (m.prereq || []).map(getCourse).filter(Boolean).map(p => `<a href="${courseURL(p)}">${esc(p.short || p.title)}</a>`).join(', ');
    const preText = [pre, esc(m.note || '')].filter(Boolean).join('. ') || 'None.';
    const parts = [
      ['Introduction and learning outcomes', `${(c.learn || []).length} stated outcomes`, (c.learn || []).length > 0],
      ['Short lessons with visual explanations', `${c.lessons.length} lessons`, true],
      ['Interactive demonstrations', demos || 'Not in this course', !!demos],
      ['Coding exercises with feedback', labs ? `${labs} auto-graded ${c.lang === 'sql' ? 'SQL' : 'Python'} labs` : 'Not in this course: guided reading', !!labs],
      ['Concept quizzes and review', `Quizzes in ${quizzed} of ${c.lessons.length} lessons, <a href="#/review">spaced review</a>${window.Mastery ? ', and an end-of-part mastery check for each part' : ''}`, quizzed > 0],
      ['Final mini-project and assessment', [project ? `Mini-project: <a href="${lessonURL(c, project)}">${esc(project.title)}</a>` : 'No mini-project yet', window.Mastery && quizzed ? `<a href="#/check/${esc(c.id)}/final">final course check</a>` : ''].filter(Boolean).join(' · '), !!project]
    ];
    return `<section class="panel glance" aria-labelledby="glance-h"><h2 id="glance-h">Course at a glance</h2>
      <dl class="glance-facts">
        <div><dt>Level</dt><dd>${esc(c.level)}</dd></div>
        <div><dt>Estimated time</dt><dd>${fmtMin(minutes(c))}</dd></div>
        <div><dt>Prerequisites</dt><dd>${preText}</dd></div>
        ${m.status ? `<div><dt>Status</dt><dd>${esc(M.status[m.status] || m.status)}</dd></div>` : ''}
        ${M.updated ? `<div><dt>Last updated</dt><dd>${esc(M.updated)}</dd></div>` : ''}
      </dl>
      ${c.outcome ? `<div class="glance-outcome"><b>Learning outcome</b><p>${esc(c.outcome)}</p></div>` : ''}
      <ol class="glance-parts">${parts.map(([t, d, ok], i) => `<li class="${ok ? 'yes' : 'no'}"><span class="gp-mark" aria-hidden="true">${ok ? '✓' : '–'}</span><div><b>${i + 1}. ${t}</b><small>${d}</small></div><span class="sr-only">${ok ? 'Included' : 'Not included'}</span></li>`).join('')}</ol>
    </section>`;
  }

  /* ---------- Mastery checks: end-of-part checks and a final course check (logic in assets/mastery.js) ---------- */
  const statusText = r => r ? (r.mastered ? `Mastered ✓ · best ${r.best}%` : `Best ${r.best}% · aim for ${window.Mastery.PASS}%`) : 'Not attempted';
  function masteryPanel(c) {
    if (!window.Mastery) return '';
    const M = window.Mastery, parts = M.parts(c), fin = M.get(c.id, 'final');
    return `<section class="panel mastery" aria-labelledby="mastery-h"><h2 id="mastery-h">Check your mastery</h2>
      <p class="w-small">After each part, answer ${M.PART_SIZE} mixed questions from its lessons. ${M.PASS}% or more shows mastery; missed questions link back to the lesson that teaches them.</p>
      <ul class="mastery-list">${parts.map(p => { const r = M.get(c.id, p.index); return `<li class="${r && r.mastered ? 'done' : ''}"><div><b>${c.parts ? `Part ${p.index + 1} · ${esc(p.name)}` : 'Course check'}</b><small>${statusText(r)}</small></div><a class="btn sm" href="#/check/${esc(c.id)}/${p.index}">${r ? 'Retake' : 'Take check'}</a></li>`; }).join('')}
        ${parts.length > 1 ? `<li class="final ${fin && fin.mastered ? 'done' : ''}"><div><b>Final course check</b><small>${M.FINAL_SIZE} questions from the whole course · ${statusText(fin)}</small></div><a class="btn sm" href="#/check/${esc(c.id)}/final">${fin ? 'Retake' : 'Take check'}</a></li>` : ''}</ul>
    </section>`;
  }
  let currentCheck = null;
  function checkPage(c, scope, fresh) {
    const M = window.Mastery, final = scope === 'final';
    const part = final ? null : M.parts(c).find(p => p.index === +scope);
    if (!M || (!final && !part)) return notFound();
    if (fresh || !currentCheck || currentCheck.c !== c || currentCheck.scope !== String(scope)) currentCheck = { c, scope: String(scope), items: M.build(c, final ? 'final' : +scope), graded: null };
    const { items, graded } = currentCheck, title = final ? 'Final course check' : (c.parts ? `Part ${part.index + 1}: ${part.name}` : 'Course check');
    const lessonOf = id => c.lessons.find(x => x.id === id);
    document.title = `${title} · ${c.short || c.title} · learn/ai`;
    const prev = M.get(c.id, final ? 'final' : part.index);
    const head = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="${courseURL(c)}">${esc(c.short || c.title)}</a> / Mastery check</nav>
      <span class="kicker">Mastery check</span><h1 class="h2">${esc(title)}</h1>`;
    if (!graded) {
      app.innerHTML = `<section class="container section check-page">${head}
        <p class="check-intro">${items.length} questions from across this ${final ? 'course' : 'part'}. Answer them all, then submit: feedback comes afterwards, as in a real test. ${M.PASS}% or more shows mastery.${prev ? ` Your best so far: ${prev.best}%.` : ''}</p>
        <form id="check-form" novalidate>${items.map((it, i) => `<fieldset class="ck-q"><legend><span>Q${i + 1}</span> ${md(it.q.q)}</legend>${it.q.options.map((o, oi) => `<label class="ck-opt"><input type="radio" name="ck${i}" value="${oi}"> <span>${md(o)}</span></label>`).join('')}</fieldset>`).join('')}
          <p class="ck-warn" id="ck-warn" role="alert" hidden></p>
          <button type="submit" class="btn primary">Submit answers</button></form></section>`;
      return;
    }
    const { g, rec } = graded, missedLessons = [...new Set(g.missed.map(r => r.lessonId))].map(lessonOf).filter(Boolean);
    app.innerHTML = `<section class="container section check-page">${head}
      <div class="ck-result ${g.passed ? 'pass' : 'fail'}" role="status"><b>${g.passed ? 'Mastered ✓' : 'Not yet'}: ${g.pct}% (${g.right} of ${g.total})</b>
        <span>${g.passed ? 'You have shown mastery of this ' + (final ? 'course' : 'part') + '. Come back in a few days and retake it: spacing makes it stick.' : `Aim for ${M.PASS}%. Review the lessons below, then try a new set of questions.`}${rec.attempts > 1 ? ` Best so far: ${rec.best}%.` : ''}</span></div>
      ${missedLessons.length ? `<div class="ck-review"><b>Lessons to review</b>${missedLessons.map(x => `<a href="${lessonURL(c, x)}">${esc(x.title)} →</a>`).join('')}</div>` : ''}
      <ol class="ck-answers">${g.results.map(r => { const lsn = lessonOf(r.lessonId), mis = !r.ok && r.pick != null ? misconception(c, lsn, r.qi, r.q, r.pick) : ''; return `<li class="${r.ok ? 'ok' : 'no'}"><p class="ck-qt"><span aria-hidden="true">${r.ok ? '✓' : '✗'}</span><span class="sr-only">${r.ok ? 'Correct' : 'Incorrect'}.</span> ${md(r.q.q)}</p>
        ${r.ok ? '' : `<p><b>Your answer:</b> ${r.pick == null ? 'not answered' : md(r.q.options[r.pick])}${mis ? ` <span class="ck-mis">${md(mis)}</span>` : ''}</p>`}
        <p><b>Correct answer:</b> ${md(r.q.options[r.q.correct])}${r.q.why ? ` <span class="ck-why">${md(r.q.why)}</span>` : ''}</p>
        ${r.ok ? '' : `<a href="${lessonURL(c, lsn)}">Review: ${esc(lsn.title)} →</a>`}</li>`; }).join('')}</ol>
      <div class="ck-actions"><a class="btn primary" href="#/check/${esc(c.id)}/${esc(currentCheck.scope)}" data-check-new>Try a new set</a><a class="btn" href="${courseURL(c)}">Back to course</a></div></section>`;
    window.scrollTo(0, 0);
  }
  document.addEventListener('submit', e => {
    if (e.target.id !== 'check-form' || !currentCheck) return;
    e.preventDefault();
    const form = e.target, answers = currentCheck.items.map((_, i) => { const x = form.querySelector(`input[name="ck${i}"]:checked`); return x ? +x.value : null; });
    const blank = answers.filter(a => a == null).length, warn = document.getElementById('ck-warn');
    if (blank && !form.dataset.warned) { form.dataset.warned = '1'; warn.hidden = false; warn.textContent = `${blank} question${blank > 1 ? 's are' : ' is'} unanswered and will count as missed. Submit again to finish anyway.`; return; }
    const g = window.Mastery.grade(currentCheck.items, answers);
    const rec = window.Mastery.record(currentCheck.c.id, currentCheck.scope === 'final' ? 'final' : +currentCheck.scope, g.pct);
    currentCheck.graded = { g, rec };
    checkPage(currentCheck.c, currentCheck.scope);
  });

  /* ---------- COURSE LANDING ---------- */
  function coursePage(c) {
    document.title = c.title + ' · learn/ai';
    const next = c.lessons.find(l => !isDone(c, l)) || c.lessons[0];
    const groups = c.parts ? c.parts.map((p, i) => [p, c.lessons.filter(l => l.part === i)]).filter(g => g[1].length) : [['Lessons', c.lessons]];
    const labs = c.lessons.reduce((a, l) => a + (labTasks(l) || (l.lab ? 1 : 0)), 0);
    const widgets = c.lessons.filter(l => l.widget).length;
    let n = 0;
    app.innerHTML = `<section class="c-hero" style="${courseVars(c)}"><div class="container c-hero-grid">
      <div><nav class="crumbs"><a href="#/">Home</a> / <a href="#/" data-goto="courses">Courses</a> / <span>${esc(c.short || c.title)}</span></nav>
      <span class="pill accent">${esc(c.tag || c.level)}</span><h1>${esc(c.title)}</h1><p class="lead">${esc(c.subtitle)}</p>
      <div class="meta"><span>📶 ${esc(c.level)}</span><span>⏱ ${fmtMin(minutes(c))}</span><span>📚 ${c.lessons.length} lessons</span>${labs ? `<span>🧪 ${labs} labs</span>` : `<span>🕹 Original interactive chapter figures</span>`}${widgets ? `<span>🕹 ${widgets} interactives</span>` : ''}</div>
      <div class="c-cta"><a class="btn primary big" href="${lessonURL(c, next)}">${countDone(c) ? 'Continue' : 'Start course'} →</a>${countDone(c) ? `<span class="c-prog">${ring(pct(c), 52)} ${countDone(c)} of ${c.lessons.length} lessons done</span>` : '<span class="c-free">Free · no sign-up</span>'}</div></div>
      <div class="c-art">${art(c)}</div></div></section>
    ${c.systemMap ? `<div class="container sm-wrap">${systemMapHTML(c)}</div>` : ''}
    <div class="container c-body">
      <div>
        ${window.VideoLib?window.VideoLib.courseStrip(c.id):''}
        ${window.BookMasterclass&&bookFor(c)?window.BookMasterclass.chapterStrip(bookFor(c),6):''}
        ${c.parts ? `<section class="panel"><h2>Your roadmap</h2><div class="roadmap">${groups.map(([name, ls], gi) => { const d = ls.filter(l => isDone(c, l)).length, first = ls.find(l => !isDone(c, l)) || ls[0]; return `<a class="rm-step ${d === ls.length ? 'done' : d ? 'part' : ''}" href="${lessonURL(c, first)}"><span class="rm-n">${d === ls.length ? '✓' : gi + 1}</span><b>${esc(name)}</b><small>${ls.length} lesson${ls.length > 1 ? 's' : ''} · ${fmtMin(ls.reduce((a, l) => a + (l.minutes || 5), 0))}</small>${skillDots(c, ls)}<span class="mini-bar"><i style="width:${Math.round(d / ls.length * 100)}%"></i></span></a>`; }).join('')}</div></section>` : ''}
        ${glanceHTML(c)}
        <section class="panel"><h2>What you'll learn</h2><ul class="learn">${c.learn.slice(0, 8).map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
        <section class="panel"><h2>Course outline</h2>${groups.map(([name, ls], gi) => `<details class="part" ${gi < 2 || ls.some(l => l === next) ? 'open' : ''}><summary><span>${c.parts ? `Part ${gi + 1} · ` : ''}${esc(name)}</span><small>${ls.length} lessons · ${fmtMin(ls.reduce((a, l) => a + (l.minutes || 5), 0))}</small></summary>
          ${ls.map(l => { n++; return `<a class="o-row ${isDone(c, l) ? 'done' : ''}" href="${lessonURL(c, l)}"><span class="o-n">${isDone(c, l) ? '✓' : n}</span><span class="o-t"><b>${esc(l.title)}</b><small>${esc(l.chapter ? l.chapter + ' · ' : '')}${esc(l.goal)}</small></span><span class="o-badges">${l.widget ? '<i title="Interactive">🕹</i>' : ''}${l.lab ? `<i title="Lab">🧪${labTasks(l) > 1 ? '×' + labTasks(l) : ''}</i>` : ''}${window.VideoLib ? window.VideoLib.badge(c.id, l.id) : ''}<i title="Quiz">✎</i></span><span class="o-m">${l.minutes || 5} min</span></a>`; }).join('')}</details>`).join('')}</section>
        ${masteryPanel(c)}
      </div>
      <aside class="c-aside">
        <div class="panel sticky"><h3>This course includes</h3><ul class="incl"><li>${c.lessons.length} concise lessons</li>${widgets ? `<li>${widgets} interactive simulations</li>` : ''}${labs ? `<li>${labs} auto-graded ${c.lang === 'sql' ? 'SQL' : 'Python'} labs in the browser</li>` : `<li>Source-linked diagrams and worked exercises</li>`}<li>${c.lessons.reduce((a, l) => a + (l.quiz || []).length, 0)} quiz questions</li><li>Progress saved locally</li></ul>
        ${c.lessons.some(l => studioFor(c, l)) ? `<div class="studio-course-link"><a href="#/studio">◉ Phase 2 interactive laboratories →</a></div>` : ''}
        <div class="learn-course-cta"><a class="btn sm" href="#/diagnostic/${esc(c.id)}">${window.LearningEngine.diagnostic(c.id) ? 'View placement result' : 'Take placement check'}</a><a class="btn sm" href="#/my-learning">Study progress</a>${window.AgentsEvidence && window.AgentsEvidence.supports(c) ? `<a class="btn sm" href="#/evidence/${esc(c.id)}">Evidence of understanding</a>` : ''}</div>
        ${c.reference ? `<p class="ref">📖 ${esc(c.reference)}</p>` : ''}
        <a class="btn full" href="${bookFor(c) ? '#/book/' + bookFor(c) : '#/books'}">${bookFor(c) ? 'Related textbook &amp; figures' : 'Browse textbook chapter indexes'} →</a>
        ${practiceLink(c)}
        ${c.lang === 'python' && !['operating-systems','computer-networking'].includes(c.id) ? `<a class="btn full" href="downloads/slides/${c.id}-quickstart.pptx" download>↓ Course slides (.pptx)</a>` : ''}
        <p class="outcome"><b>Outcome:</b> ${esc(c.outcome)}</p></div>
      </aside></div>`;
  }

  // "What you'll build": the course's system architecture, each component linking to the lessons that build it.
  function systemMapHTML(c) {
    const by = id => c.lessons.filter(l => (l.builds || []).includes(id));
    const node = n => { const ls = by(n.id), d = ls.filter(l => isDone(c, l)).length; return `<div class="sm-node ${n.store ? 'store' : ''} ${ls.length && d === ls.length ? 'done' : ''}"><div class="sm-top"><b>${n.icon}</b><span>${esc(n.label)}<small>${esc(n.sub || '')}</small></span></div>${ls.length ? `<div class="sm-links">${ls.map(l => `<a href="${lessonURL(c, l)}" class="${isDone(c, l) ? 'done' : ''}">${isDone(c, l) ? '✓' : c.lessons.indexOf(l) + 1}. ${esc(l.title)}</a>`).join('')}</div>` : ''}</div>`; };
    return `<section class="panel sm"><div class="sm-head"><div><span class="kicker">The project</span><h2>What you'll build: ${esc(c.project ? c.project.name : 'the system')}</h2>${c.project ? `<p>${esc(c.project.blurb)}</p>` : ''}</div></div>
      <div class="sm-flow">${Array.from({ length: Math.ceil(c.systemMap.length / 2) }, (_, k) => `<div class="sm-col">${c.systemMap.slice(k * 2, k * 2 + 2).map(node).join('<span class="sm-down" aria-hidden="true">↓</span>')}</div>`).join('')}</div>
      ${c.systemOps ? `<div class="sm-ops">${c.systemOps.map(n => { const ls = by(n.id); return `<div><b>${n.icon} ${esc(n.label)}</b>${ls.map(l => `<a href="${lessonURL(c, l)}">${c.lessons.indexOf(l) + 1}. ${esc(l.title)}</a>`).join('')}</div>`; }).join('')}</div>` : ''}</section>`;
  }

  /* ---------- PROMPT LIBRARY PAGE ---------- */
  function promptLibraryPage() {
    document.title = 'Prompt Library · learn/ai';
    const lib = window.PROMPT_LIBRARY, pc = window.PROMPT_COURSE;
    app.innerHTML = `<section class="c-hero pl-hero" style="${pc ? courseVars(pc) : ''}"><div class="container">
      <nav class="crumbs"><a href="#/">Home</a> / <span>Prompt Library</span></nav>
      <span class="pill accent">${lib ? lib.prompts.length : 0} prompts · ${lib ? lib.cats.length : 0} categories · free to copy</span>
      <h1>The Prompt Library</h1>
      <p class="lead">Ready-to-use prompt templates for work, teaching, studying, code, creative media and everyday life. Click <b>Fill in</b> to customize the highlighted blanks, then <b>Copy</b> and paste into ChatGPT, Claude, Gemini or any assistant.</p>
      ${pc ? `<a class="btn primary" href="${courseURL(pc)}">Learn to write your own → ${esc(pc.short)} course</a>` : ''}</div></section>
      <div class="container pl-page" id="pl-root"></div>`;
    if (window.renderPromptLibrary) window.renderPromptLibrary(document.getElementById('pl-root'), {});
  }

  /* ---------- Phase 2: standalone labs integrated into existing course pathways ---------- */
  const studioLessons = {
    'python/lists-loops': 'python', 'python/hello-variables': 'python',
    'machine-learning/neural-networks': 'neural',
    'databases/er-modeling': 'er', 'databases/sql-joins': 'er'
  };
  const studioFor = (c, l) => studioLessons[k(c, l)];
  const studioLessonHTML = (c, l) => {
    const labId = studioFor(c, l), lab = labId && window.Phase2UI.labs[labId];
    return lab ? `<section class="studio-lesson-launch"><h2>Interactive Lab Studio · ${esc(lab.name)}</h2>
      <p>${esc(lab.sub)} Experiment with real computation or schema design, then take a formative checkpoint.</p>
      <a href="#/studio/${labId}">Open the interactive laboratory →</a></section>` : '';
  };

  /* ---------- LESSON PLAYER ---------- */
  let current = null; // {c, l}
  function lessonPage(c, l) {
    current = { c, l };
    P.last = k(c, l); save();
    document.title = l.title + ' · ' + (c.short || c.title);
    const i = c.lessons.indexOf(l), prev = c.lessons[i - 1], next = c.lessons[i + 1];
    const groups = c.parts ? c.parts.map((p, gi) => [p, c.lessons.filter(x => x.part === gi)]).filter(g => g[1].length) : [[null, c.lessons]];
    let n = 0;
    const labOpen = (() => { try { return localStorage.getItem('learnai-lab') !== 'closed'; } catch (_) { return true; } })();
    app.innerHTML = `<div class="player ${labOpen ? '' : 'lab-closed'}" style="${courseVars(c)}">
      <header class="p-top"><button type="button" class="icon-btn" data-toggle-side aria-label="Toggle lesson list">☰</button>
        <a class="p-back" href="${courseURL(c)}">← <span>${esc(c.short || c.title)}</span></a>
        <div class="p-prog"><span id="p-count">${countDone(c)}/${c.lessons.length}</span><span class="mini-bar"><i id="p-bar" style="width:${pct(c)}%"></i></span></div>
        <div class="p-tabs" role="tablist"><button type="button" data-mtab="lesson" class="on">Lesson</button><button type="button" data-mtab="lab">${l.lab ? 'Lab' : 'Interactive'}</button></div>
        <button type="button" class="icon-btn theme-btn" data-theme-toggle aria-label="Toggle light/dark theme" title="Toggle light/dark theme"><span class="moon">🌙</span><span class="sun">☀️</span></button>
        <button type="button" class="btn sm" data-toggle-lab>${labOpen ? (l.lab ? 'Hide lab ⇥' : 'Hide interactive ⇥') : (l.lab ? 'Open lab ⇤' : 'Open interactive ⇤')}</button></header>
      <aside class="p-side" id="p-side">${groups.map(([name, ls], gi) => `${name ? `<div class="s-part">Part ${gi + 1} · ${esc(name)}</div>` : ''}${ls.map(x => { n++; return `<a href="${lessonURL(c, x)}" class="s-item ${x === l ? 'on' : ''} ${isDone(c, x) ? 'done' : ''}" data-lid="${x.id}"><span class="s-n">${isDone(c, x) ? '✓' : n}</span><span>${esc(x.title)}<small>${x.minutes || 5} min${x.lab ? ' · Lab' : ''}</small></span></a>`; }).join('')}`).join('')}</aside>
      <main class="p-main" id="p-main"><article class="lesson">
        <div class="l-meta">${l.chapter ? `<span class="pill accent">${esc(l.chapter)}</span>` : ''}<span>Lesson ${i + 1} of ${c.lessons.length}</span><span>· ${l.minutes || 5} min</span></div>
        ${l.builds && c.systemMap ? `<div class="l-builds"><span>You're building</span>${l.builds.map(id => [...c.systemMap, ...(c.systemOps || [])].find(n => n.id === id)).filter(Boolean).map(n => `<b>${n.icon} ${esc(n.label)}</b>`).join('')}</div>` : ''}
        <h1>${esc(l.title)}</h1><p class="lead">${esc(l.goal)}</p>
        ${window.BookMasterclass&&bookFor(c)?window.BookMasterclass.lessonLink(bookFor(c),l.chapter):''}
        ${bookFor(c) ? `<div class="tb-lesson-ref">📖 <a href="#/book/${bookFor(c)}">Read the source-indexed textbook companion</a> · Cross-check the full chapter and visual explanations.</div>` : ''}
        <div class="learn-lesson-meta"><span id="skill-stage">${esc(window.LearningEngine.info(c.id, l.id).label)}</span><span id="skill-review">${window.LearningEngine.info(c.id, l.id).nextReviewAt ? 'Next review ' + new Date(window.LearningEngine.info(c.id, l.id).nextReviewAt).toLocaleDateString() : 'First successful attempt schedules review'}</span><a href="#/my-learning">My learning ↗</a></div>
        ${l.sections.map((s, si) => `<section><h2>${esc(s.h)}</h2>${s.html}</section>${si === 1 && l.widget ? widgetSlot(c, l) : ''}`).join('')}
        ${l.widget && l.sections.length < 2 ? widgetSlot(c, l) : ''}
        ${window.VideoLib ? window.VideoLib.lessonStrip(c.id, l.id) : ''}
        ${window.BookMasterclass&&bookFor(c)?window.BookMasterclass.inline(bookFor(c),l.chapter):''}
        ${l.terms ? `<section class="terms"><h2>Key terms</h2><dl>${l.terms.map(t => `<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl></section>` : ''}
        ${l.lab && l.lab.practice ? `<section class="callout practice"><b>Practice in the lab →</b> ${esc(l.lab.practice)}</section>` : ''}
        ${studioLessonHTML(c, l)}
        ${window.AgentsCoach ? window.AgentsCoach.html(c, l) : ''}
        ${window.LearningUI.activityHTML(c, l)}
        <section class="quiz" id="quiz"><h2>Check your understanding</h2>${(l.quiz || []).length && window.Confidence ? '<p class="q-intro">Before each answer, say how sure you are. It helps you notice what you only think you know.</p>' : ''}${(l.quiz || []).map((q, qi) => quizHTML(c, l, q, qi)).join('')}${calibHTML(c)}</section>
        ${partCheckPrompt(c, l)}
        <div class="l-done">${isDone(c, l) ? '<span class="pill ok">✓ Completed</span>' : `<span class="w-small">Complete the quiz${labTasks(l) ? ' and lab tasks' : ''} to finish this lesson.</span>`}</div>
        <nav class="l-nav">${prev ? `<a href="${lessonURL(c, prev)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn primary" href="${lessonURL(c, next)}">Next: ${esc(next.title)} →</a>` : `<a class="btn primary" href="${courseURL(c)}">Finish course →</a>`}</nav>
      </article></main>
      <section class="p-lab" id="p-lab">${!l.lab ? `<div class="lab-head">Interactive source guide</div><p style="padding:22px">This chapter is theory-focused. Use the companion's editable SVG simulation instead of a placeholder programming lab.</p><p style="padding:0 22px"><a class="btn" href="${l.deepLab ? '#/algo-lab/'+l.deepLab : '#/book/'+bookFor(c)+'/chapter/'+(String(l.chapter).match(/\d+/)||[])[0]}">${l.deepLab ? 'Open section proof lab and interactive trace →' : 'Open original interactive figure →'}</a></p>` : c.lang === 'sql' ? sqlLabHTML(c, l) : pyLabHTML(c, l)}</section>
    </div>`;
    document.getElementById('p-main').scrollTop = 0;
    document.querySelectorAll('[data-widget]').forEach(el => { try { window.WIDGETS[el.dataset.widget](el); } catch (e) { el.textContent = 'Interactive failed to load.'; console.error(e); } });
    if (window.PredictUI) window.PredictUI.init();
    if (l.lab) { c.lang === 'sql' ? initSqlLab(c, l) : initPyLab(c, l); }
    const side = document.getElementById('p-side'), on = side.querySelector('.s-item.on');
    if (on) side.scrollTop = on.offsetTop - side.clientHeight / 2;
    document.getElementById('p-main').scrollTop = 0;
  }
  const widgetSlot = (c, l) => `<figure class="widget"><figcaption>🕹 ${esc((window.WIDGET_TITLES || {})[l.widget] || 'Interactive')}</figcaption>${window.PredictUI ? window.PredictUI.card(c, l) : ''}<div class="w" data-widget="${l.widget}"></div></figure>`;
  // Why a particular wrong option is wrong: inline q.wrong, or a course's misconception bank (window.MISCONCEPTIONS).
  const misconception = (c, l, qi, q, pick) => (q.wrong && q.wrong[pick]) || ((((window.MISCONCEPTIONS || {})[c.id] || {})[l.id] || {})[qi] || {})[pick] || '';
  const confRow = () => window.Confidence ? `<div class="q-conf" role="group" aria-label="How sure are you before answering?"><span>How sure are you?</span>${window.Confidence.LEVELS.map(([v, t]) => `<button type="button" data-conf="${v}" aria-pressed="false">${t}</button>`).join('')}</div>` : '';
  const calibHTML = c => { const m = window.Confidence ? window.Confidence.message(window.Confidence.summary(c.id)) : ''; return `<p class="calib" id="calib" aria-live="polite" ${m ? '' : 'hidden'}>${m ? '🧭 ' + esc(m) : ''}</p>`; };
  function quizHTML(c, l, q, qi) {
    const ok = P.quiz[k(c, l) + '#' + qi];
    return `<div class="q ${ok ? 'answered' : ''}" data-q="${qi}"><p class="q-text"><span>Q${qi + 1}</span> ${md(q.q)}</p>${ok ? '' : confRow()}<div class="q-opts">${q.options.map((o, oi) => `<button type="button" data-opt="${oi}" class="${ok && oi === q.correct ? 'right' : ''}">${md(o)}</button>`).join('')}</div><p class="q-why" ${ok ? '' : 'hidden'}>${ok ? '✓ ' + md(q.why || '') : ''}</p></div>`;
  }
  // After the last lesson of a part, invite the learner to show mastery of the whole part.
  function partCheckPrompt(c, l) {
    if (!window.Mastery) return '';
    const part = window.Mastery.parts(c).find(p => p.lessons[p.lessons.length - 1] === l);
    if (!part) return '';
    const res = window.Mastery.get(c.id, part.index);
    return `<div class="part-check-cta"><div><b>${c.parts ? `End of Part ${part.index + 1}: ${esc(part.name)}` : 'End of the course'}</b><span>${res && res.mastered ? `Mastered ✓ (best ${res.best}%)` : `Show you've mastered it: ${window.Mastery.PART_SIZE} mixed questions, ${window.Mastery.PASS}% to pass.`}</span></div><a class="btn" href="#/check/${esc(c.id)}/${part.index}">${res && res.mastered ? 'Retake check' : 'Take the check'} →</a></div>`;
  }
  function updateSkillUI(c, l) {
    const info = window.LearningEngine.info(c.id, l.id), stage = document.getElementById('skill-stage'), review = document.getElementById('skill-review');
    if (stage) stage.textContent = info.label;
    if (review) review.textContent = info.nextReviewAt ? 'Next review ' + new Date(info.nextReviewAt).toLocaleDateString() : 'First successful attempt schedules review';
  }
  function refreshProgressUI(c) {
    const cnt = document.getElementById('p-count'), bar = document.getElementById('p-bar');
    if (cnt) cnt.textContent = `${countDone(c)}/${c.lessons.length}`; if (bar) bar.style.width = pct(c) + '%';
    if (current) { const s = document.querySelector(`.s-item[data-lid="${current.l.id}"]`); if (s && isDone(c, current.l)) { s.classList.add('done'); s.querySelector('.s-n').textContent = '✓'; } const d = document.querySelector('.l-done'); if (d && isDone(c, current.l)) d.innerHTML = '<span class="pill ok">✓ Completed</span>'; }
  }

  /* ---------- Editors (CodeMirror if available, textarea fallback) ---------- */
  function makeEditor(ta, mode, onRun) {
    if (window.CodeMirror) {
      const cm = CodeMirror.fromTextArea(ta, { mode, lineNumbers: true, indentUnit: 2, lineWrapping: true, viewportMargin: Infinity, extraKeys: { 'Ctrl-Enter': onRun, 'Cmd-Enter': onRun, 'Shift-Enter': onRun } });
      return { get: () => cm.getValue(), set: v => cm.setValue(v), refresh: () => cm.refresh() };
    }
    ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === 'Enter') { e.preventDefault(); onRun(); } });
    return { get: () => ta.value, set: v => { ta.value = v; }, refresh: () => {} };
  }

  /* ---------- SQL lab ---------- */
  let sqlPromise = null;
  window.loadSQL = () => sqlPromise || (sqlPromise = new Promise((res, rej) => {
    const go = () => window.initSqlJs({ locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + f }).then(res, rej);
    if (window.initSqlJs) return go();
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js'; s.onload = go; s.onerror = () => { sqlPromise = null; rej(new Error('Could not load the SQL engine. Check your internet connection.')); }; document.head.appendChild(s);
  }));
  const freshDB = SQL => { const d = new SQL.Database(); d.exec(window.DB_SEED); return d; };
  function sqlLabHTML(c, l) {
    const tasks = (l.lab && l.lab.tasks) || [];
    return `<div class="lab-head"><span class="lab-title">🧪 SQL Lab</span><span class="lab-status" id="lab-status">Loading SQLite…</span></div>
      ${l.lab ? `<p class="lab-intro">${l.lab.intro}</p>` : ''}
      <div class="lab-tasks" role="tablist">${tasks.map((t, i) => `<button type="button" data-task="${i}" class="${i === 0 ? 'on' : ''} ${P.lab[k(c, l) + '#' + i] ? 'passed' : ''}">${P.lab[k(c, l) + '#' + i] ? '✓ ' : ''}Task ${i + 1}</button>`).join('')}<button type="button" data-task="schema" class="ghost">Schema</button></div>
      <div id="task-body"></div>
      <div class="editor-wrap"><textarea id="ed" spellcheck="false" aria-label="SQL editor"></textarea></div>
      <div class="lab-actions"><button type="button" class="btn primary sm" data-run>▶ Run <kbd>Ctrl+↵</kbd></button><button type="button" class="btn sm accent-outline" data-check>✓ Check answer</button><span class="sp"></span><button type="button" class="btn sm ghost" data-hint>💡 Hint 1/3</button><button type="button" class="btn sm ghost" data-reset title="Restore starter code">↺</button></div>
      <div class="out" id="out"><p class="muted">Results appear here. Each run uses a fresh copy of the database.</p></div>`;
  }
  function initSqlLab(c, l) {
    const tasks = (l.lab && l.lab.tasks) || [];
    let ti = null; const drafts = {}, hintsUsed = {};
    const ed = makeEditor(document.getElementById('ed'), 'text/x-sqlite', () => run());
    const body = document.getElementById('task-body'), out = document.getElementById('out'), status = document.getElementById('lab-status');
    const showTask = i => {
      if (ti !== null && ti !== 'schema') drafts[ti] = ed.get();
      ti = i;
      const hintButton = document.querySelector('#p-lab [data-hint]'); if (hintButton) hintButton.textContent = '💡 Hint ' + (Math.min(3, (hintsUsed[i] || 0) + 1)) + '/3';
      document.querySelectorAll('[data-task]').forEach(b => b.classList.toggle('on', String(b.dataset.task) === String(i)));
      if (i === 'schema') { body.innerHTML = '<div class="task" id="schema">Loading…</div>'; window.loadSQL().then(SQL => { const d = freshDB(SQL); const t = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0].values.map(r => r[0]); document.getElementById('schema').innerHTML = `<p class="muted">Click a table to preview it.</p><div class="schema">${t.map(n => { const cols = d.exec(`PRAGMA table_info(${n})`)[0].values; const fks = (d.exec(`PRAGMA foreign_key_list(${n})`)[0] || { values: [] }).values.map(r => r[3]); return `<button type="button" class="tbl" data-peek="${n}"><b>${n}</b>${cols.map(r => `<span class="${r[5] ? 'pk' : ''} ${fks.includes(r[1]) ? 'fk' : ''}">${r[1]} <small>${r[2]}</small></span>`).join('')}</button>`; }).join('')}</div>`; d.close(); }); return; }
      const t = tasks[i];
      body.innerHTML = t ? `<div class="task"><span class="t-label">Task ${i + 1} of ${tasks.length}</span><p>${t.prompt}</p></div>` : '<div class="task"><p>Free play: write any SQL you like.</p></div>';
      ed.set(drafts[i] ?? (t ? t.starter : 'SELECT * FROM PRODUCT;'));
    };
    const render = (results, msg) => {
      out.innerHTML = (msg ? `<p class="msg">${msg}</p>` : '') + results.slice(-3).map(r => `<div class="res-meta">${r.values.length} row${r.values.length === 1 ? '' : 's'}</div><div class="w-tablewrap"><table class="w-table"><thead><tr>${r.columns.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, 200).map(row => `<tr>${row.map(v => `<td>${v === null ? '<span class="null">NULL</span>' : esc(typeof v === 'number' && !Number.isInteger(v) ? +v.toFixed(4) : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('');
    };
    const exec = (SQL, code, check) => { const d = freshDB(SQL); try { const r = d.exec(code); const changed = d.getRowsModified(); const chk = check ? d.exec(check) : null; return { r, changed, chk }; } finally { d.close(); } };
    async function run() {
      try { const SQL = await window.loadSQL(); const { r, changed } = exec(SQL, ed.get()); render(r, r.length ? '' : `✓ Statement executed.${changed ? ` ${changed} row(s) affected.` : ''}`); }
      catch (e) { out.innerHTML = `<p class="err">⚠ ${esc(e.message)}</p>`; }
    }
    const norm = res => { const rs = res && res.length ? res[res.length - 1] : { columns: [], values: [] }; return { n: rs.columns.length, rows: rs.values.map(r => r.map(v => typeof v === 'number' ? Math.round(v * 100) / 100 : v === null ? null : String(v).trim())) }; };
    const same = (a, b, ordered) => { if (a.n !== b.n || a.rows.length !== b.rows.length) return false; const s = x => x.map(r => JSON.stringify(r)); const A = s(a.rows), B = s(b.rows); if (!ordered) { A.sort(); B.sort(); } return A.every((v, i) => v === B[i]); };
    async function check() {
      const t = tasks[ti]; if (!t) { toast('Pick a task to check.'); return; }
      try {
        const SQL = await window.loadSQL();
        let mine; try { mine = exec(SQL, ed.get(), t.check); } catch (e) { out.innerHTML = `<p class="err">⚠ ${esc(e.message)}</p><p class="msg">Fix the error, then check again.</p>`; return; }
        const sol = exec(SQL, t.solution, t.check);
        const a = norm(t.check ? mine.chk : mine.r), b = norm(t.check ? sol.chk : sol.r);
        render(mine.r, '');
        if (same(a, b, t.ordered)) {
          out.insertAdjacentHTML('afterbegin', '<p class="ok-msg">✓ Correct! Nicely done.</p>');
          P.lab[k(c, l) + '#' + ti] = true; save();
          window.LearningEngine.recordAttempt(c.id, l.id, 'lab', ti, true, { assisted: (hintsUsed[ti] || 0) > 0 }); updateSkillUI(c, l);
          const btn = document.querySelector(`[data-task="${ti}"]`); btn.classList.add('passed'); btn.textContent = '✓ Task ' + (ti + 1);
          checkComplete(c, l);
        } else { window.LearningEngine.recordAttempt(c.id, l.id, 'lab', ti, false); updateSkillUI(c, l); out.insertAdjacentHTML('afterbegin', `<p class="err">✗ Not quite. Expected ${b.rows.length} row(s) × ${b.n} column(s)${t.ordered ? ' in a specific order' : ''}; you returned ${a.rows.length} × ${a.n}. Read the task and try a progressive hint.</p>`); }
      } catch (e) { out.innerHTML = `<p class="err">⚠ ${esc(e.message)}</p>`; }
    }
    document.getElementById('p-lab').addEventListener('click', e => {
      const tb = e.target.closest('[data-task]'); if (tb) { showTask(tb.dataset.task === 'schema' ? 'schema' : +tb.dataset.task); return; }
      if (e.target.closest('[data-run]')) run();
      if (e.target.closest('[data-check]')) check();
      if (e.target.closest('[data-hint]')) {
        const t = tasks[ti]; if (!t) return;
        const level = hintsUsed[ti] = Math.min(3, (hintsUsed[ti] || 0) + 1);
        window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, level);
        out.innerHTML = `<p class="msg"><b>${['Idea','Where to work','Outline'][level - 1]} · hint ${level}/3</b></p>${(() => { const h = window.LearningHints.hints(t, 'sql', c.id + '/' + l.id + '#' + ti)[level - 1]; return level === 3 ? '<pre class="snip">' + esc(h) + '</pre>' : '<p>' + esc(h) + '</p>'; })()}${level === 3 ? '<button type="button" class="btn sm" data-reveal>Show full worked solution</button>' : ''}`;
        e.target.closest('[data-hint]').textContent = level === 3 ? '💡 Hints used' : `💡 Hint ${level + 1}/3`;
      }
      if (e.target.closest('[data-reveal]')) { const t = tasks[ti]; if (!t) return; hintsUsed[ti] = 4; window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, 4); out.innerHTML = `<p class="msg">Worked solution (assisted practice):</p><pre class="snip">${esc(t.solution)}</pre><button type="button" class="btn sm" data-use>Use this solution</button>`; }
      if (e.target.closest('[data-use]')) { hintsUsed[ti] = 4; window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, 4); ed.set(tasks[ti].solution.replace(/;\s*/g, ';\n')); }
      if (e.target.closest('[data-reset]')) { const t = tasks[ti]; ed.set(t ? t.starter : ''); }
      const pk = e.target.closest('[data-peek]'); if (pk) { showTask(ti === 'schema' ? 0 : ti); ed.set(`SELECT * FROM ${pk.dataset.peek} LIMIT 20;`); run(); }
    });
    showTask(0);
    window.loadSQL().then(() => { status.textContent = '● SQLite ready'; status.classList.add('ready'); }, e => { status.textContent = '⚠ offline'; out.innerHTML = `<p class="err">${esc(e.message)}</p>`; });
    labEditor = ed;
  }

  /* ---------- Python lab (Pyodide, loaded on first run) ---------- */
  let pyPromise = null;
  const loadPy = () => pyPromise || (pyPromise = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    s.onload = () => window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' }).then(res, rej);
    s.onerror = () => { pyPromise = null; rej(new Error('Could not load Python. Check your internet connection, or download the script and run it locally.')); };
    document.head.appendChild(s);
  }));
  // Run code (then optional hidden test) in a fresh namespace; returns { ok, out, err }.
  async function runPython(code, test) {
    const py = await loadPy();
    let buf = ''; py.setStdout({ batched: s => buf += s + '\n' }); py.setStderr({ batched: s => buf += s + '\n' });
    await py.loadPackagesFromImports(code + '\n' + (test || ''), { messageCallback: m => window.__pyMsg && window.__pyMsg(m) });
    const ns = py.globals.get('dict')();
    try { await py.runPythonAsync(code, { globals: ns }); if (test) await py.runPythonAsync(test, { globals: ns }); return { ok: true, out: buf }; }
    catch (e) { return { ok: false, out: buf, err: String(e.message || e).trim().split('\n').filter(x => !/^\s*File "\/lib\//.test(x)).slice(-4).join('\n') }; }
    finally { ns.destroy(); }
  }
  // Replace the starter's top-level def/class blocks with the solution's, keeping the starter's data and demo code.
  function mergeSolution(starter, solution) {
    const chunks = src => { const out = []; let cur = null;
      src.split('\n').forEach(line => {
        const top = line.length && !/^\s/.test(line), m = top && line.match(/^(?:def|class)\s+(\w+)/);
        if (top && line.startsWith('@')) { cur = { name: null, deco: true, lines: [line] }; out.push(cur); }
        else if (m && cur && cur.deco && !cur.name) { cur.name = m[1]; cur.lines.push(line); }
        else if (m) { cur = { name: m[1], lines: [line] }; out.push(cur); }
        else if (top || !cur) { cur = { name: null, lines: [line] }; out.push(cur); }
        else cur.lines.push(line);
      }); return out; };
    const sol = {}; chunks(solution).forEach(c => { if (c.name) sol[c.name] = c.lines.join('\n').replace(/\s+$/, '') + '\n'; });
    return chunks(starter).map(c => c.name && sol[c.name] ? sol[c.name] : c.lines.join('\n')).join('\n');
  }
  window.__mergeSolution = mergeSolution; window.__runPython = runPython;
  function pyLabHTML(c, l) {
    const head = `<div class="lab-head"><span class="lab-title">🐍 Python Lab</span><span class="lab-status" id="lab-status">Python loads on first run (~10 MB)</span></div>`;
    if (l.lab && l.lab.tasks) {
      const tasks = l.lab.tasks;
      return `${head}${l.lab.intro ? `<p class="lab-intro">${l.lab.intro}</p>` : ''}
      <div class="lab-tasks" role="tablist">${tasks.map((t, i) => `<button type="button" data-task="${i}" class="${i === 0 ? 'on' : ''} ${P.lab[k(c, l) + '#' + i] ? 'passed' : ''}">${P.lab[k(c, l) + '#' + i] ? '✓ ' : ''}Task ${i + 1}</button>`).join('')}</div>
      <div id="task-body"></div>
      <div class="editor-wrap"><textarea id="ed" spellcheck="false" aria-label="Python editor"></textarea></div>
      <div class="lab-actions"><button type="button" class="btn primary sm" data-run>▶ Run <kbd>Ctrl+↵</kbd></button><button type="button" class="btn sm accent-outline" data-check>✓ Check</button><span class="sp"></span><button type="button" class="btn sm ghost" data-hint>💡 Hint 1/3</button><button type="button" class="btn sm ghost" data-reset title="Restore starter code">↺</button></div>
      <div class="out mono" id="out"><p class="muted">Run prints output here. Check runs hidden tests against your code.</p></div>`;
    }
    return `${head}
      <div class="task"><span class="t-label">Try it</span><p>${esc(l.lab.practice || 'Run the example, then change it.')}</p></div>
      <div class="editor-wrap"><textarea id="ed" spellcheck="false" aria-label="Python editor">${esc(l.lab.code)}</textarea></div>
      <div class="lab-actions"><button type="button" class="btn primary sm" data-run>▶ Run <kbd>Ctrl+↵</kbd></button><span class="sp"></span><button type="button" class="btn sm ghost" data-reset>↺ Reset</button></div>
      <div class="out mono" id="out"><p class="muted">Output appears here.</p></div>
      ${c.downloads ? `<div class="dl"><a href="downloads/notebooks/${c.id}-${l.id}.ipynb" download>↓ Notebook (.ipynb)</a><a href="downloads/code/${c.id}-${l.id}.py" download>↓ Script (.py)</a></div>` : ''}`;
  }
  function initPyLab(c, l) {
    const out = document.getElementById('out'), status = document.getElementById('lab-status');
    const tasks = (l.lab && l.lab.tasks) || null;
    let ti = null; const drafts = {}, hintsUsed = {};
    const ed = makeEditor(document.getElementById('ed'), 'python', () => run());
    const ready = () => { status.textContent = '● Python ready'; status.classList.add('ready'); };
    window.__pyMsg = m => { if (/^Loading|^Loaded/.test(m)) out.innerHTML = `<p class="muted">⏳ ${esc(m.length > 140 ? m.slice(0, 140) + '…' : m)}</p>`; };
    const showTask = i => {
      if (ti !== null) drafts[ti] = ed.get();
      ti = i; const t = tasks[i];
      const hintButton = document.querySelector('#p-lab [data-hint]'); if (hintButton) hintButton.textContent = '💡 Hint ' + Math.min(3, (hintsUsed[i] || 0) + 1) + '/3';
      document.querySelectorAll('[data-task]').forEach(b => b.classList.toggle('on', +b.dataset.task === i));
      document.getElementById('task-body').innerHTML = `<div class="task"><span class="t-label">Task ${i + 1} of ${tasks.length}</span><p>${t.prompt}</p></div>`;
      ed.set(drafts[i] ?? t.starter);
    };
    async function run() {
      out.innerHTML = '<p class="muted">Running…</p>'; if (!status.classList.contains('ready')) status.textContent = 'Loading Python…';
      try { const r = await runPython(ed.get()); ready(); out.innerHTML = r.ok ? `<pre>${esc(r.out || '(no output)')}</pre>` : `${r.out ? `<pre>${esc(r.out)}</pre>` : ''}<pre class="err">${esc(r.err)}</pre>`; }
      catch (e) { out.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
    }
    async function check() {
      const t = tasks[ti]; out.innerHTML = '<p class="muted">Running hidden tests…</p>';
      try {
        const r = await runPython(ed.get(), t.test); ready();
        if (r.ok) {
          out.innerHTML = `<p class="ok-msg">✓ All tests passed. Nicely done!</p>${r.out ? `<pre>${esc(r.out)}</pre>` : ''}`;
          P.lab[k(c, l) + '#' + ti] = true; save();
          window.LearningEngine.recordAttempt(c.id, l.id, 'lab', ti, true, { assisted: (hintsUsed[ti] || 0) > 0 }); updateSkillUI(c, l);
          const btn = document.querySelector(`[data-task="${ti}"]`); btn.classList.add('passed'); btn.textContent = '✓ Task ' + (ti + 1);
          checkComplete(c, l);
        } else { window.LearningEngine.recordAttempt(c.id, l.id, 'lab', ti, false); updateSkillUI(c, l); out.innerHTML = `<p class="err">✗ Not yet. A test failed:</p><pre class="err">${esc(r.err)}</pre><p class="msg">Read the TODOs, run your code, or request a strategy hint.</p>`; }
      } catch (e) { out.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
    }
    document.getElementById('p-lab').addEventListener('click', e => {
      const tb = e.target.closest('[data-task]'); if (tb && tasks) { showTask(+tb.dataset.task); return; }
      if (e.target.closest('[data-run]')) run();
      if (e.target.closest('[data-check]')) check();
      if (e.target.closest('[data-hint]') && tasks) {
        const t = tasks[ti], level = hintsUsed[ti] = Math.min(3, (hintsUsed[ti] || 0) + 1);
        window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, level);
        out.innerHTML = `<p class="msg"><b>${['Idea','Where to work','Outline'][level - 1]} · hint ${level}/3</b></p>${(() => { const h = window.LearningHints.hints(t, 'python', c.id + '/' + l.id + '#' + ti)[level - 1]; return level === 3 ? '<pre class="snip">' + esc(h) + '</pre>' : '<p>' + esc(h) + '</p>'; })()}${level === 3 ? '<button type="button" class="btn sm" data-reveal>Show full worked solution</button>' : ''}`;
        e.target.closest('[data-hint]').textContent = level === 3 ? '💡 Hints used' : `💡 Hint ${level + 1}/3`;
      }
      if (e.target.closest('[data-reveal]') && tasks) { hintsUsed[ti] = 4; window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, 4); out.innerHTML = `<p class="msg">Worked solution (assisted practice):</p><pre>${esc(tasks[ti].solution)}</pre><button type="button" class="btn sm" data-use>Use this solution</button>`; }
      if (e.target.closest('[data-use]') && tasks) { hintsUsed[ti] = 4; window.LearningEngine.hint(c.id, l.id, 'lab:' + ti, 4); ed.set(mergeSolution(tasks[ti].starter, tasks[ti].solution)); }
      if (e.target.closest('[data-reset]')) ed.set(tasks ? tasks[ti].starter : l.lab.code);
    });
    if (tasks) showTask(0);
    labEditor = ed;
  }
  let labEditor = null;

  /* ---------- On-demand scripts: pages load their extra files the first time they open ---------- */
  window.__learnaiLazy = true;  // tells index.html's fallback that this app.js loads page scripts itself
  const LAZY = (() => { try { return JSON.parse(document.getElementById('lazy-scripts').textContent); } catch (_) { return {}; } })();
  const READY = { editor: () => !!window.CodeMirror, practice: () => !!window.PracticeHub, atlas: () => !!window.TextbookAtlas, videos: () => !!window.VideoLib, viz: () => !!window.CHAPTER_VIZ };
  const OPTIONAL = { editor: true };  // labs fall back to a plain textarea without CodeMirror
  const loading = {}, settled = {};  // settled: a load was attempted, so never retry in a loop
  function loadGroup(name) {
    if (!loading[name]) loading[name] = new Promise((resolve, reject) => {
      const list = LAZY[name] || []; let left = list.length;
      if (!left) { settled[name] = true; return resolve(); }
      list.forEach(src => {  // download in parallel, run in listed order
        const el = document.createElement('script'); el.src = src; el.async = false;
        el.onload = () => { if (!--left) { settled[name] = true; resolve(); } };
        el.onerror = () => { delete loading[name]; reject(new Error('Could not load ' + src)); };
        document.body.appendChild(el);
      });
    });
    return loading[name];
  }
  const NEEDS = { course: ['editor', 'videos', 'viz'], practice: ['practice'], books: ['atlas', 'videos', 'viz'], book: ['atlas', 'videos', 'viz'], videos: ['videos'], visualize: ['viz'] };
  function ensureFor(parts) {
    const missing = (NEEDS[parts[0]] || []).filter(g => !READY[g]() && !settled[g]);
    if (!missing.length) return true;
    app.innerHTML = '<div class="container notfound" role="status" aria-live="polite"><p>Loading…</p></div>';
    Promise.all(missing.map(g => loadGroup(g).catch(err => { if (!OPTIONAL[g]) throw err; settled[g] = true; })))
      .then(route, () => { app.innerHTML = '<div class="container notfound"><h1>This page could not load.</h1><p>Check your connection and try again.</p><a class="btn primary" href="#/">Back home</a></div>'; });
    return false;
  }

  /* ---------- Router & events ---------- */
  function route() {
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    document.body.classList.toggle('in-player', parts[0] === 'course' && !!parts[2]);
    current = null; app.onclick = null; app.onchange = null; app.oninput = null;
    if (!ensureFor(parts)) return;
    if (!parts.length) home();
    else if (parts[0] === 'algo-lab') window.AlgorithmDepth.render(app, parts[1]);
    else if (parts[0] === 'studio') window.Phase2UI.render(app, parts[1]);
    else if (parts[0] === 'my-learning') window.LearningUI.dashboardPage(app, courses, countDone);
    else if (parts[0] === 'diagnostic' && getCourse(parts[1])) window.LearningUI.diagnosticPage(app, getCourse(parts[1]));
    else if (parts[0] === 'review') window.LearningUI.reviewPage(app, courses, parts);
    else if (parts[0] === 'evidence' && getCourse(parts[1]) && window.AgentsEvidence && window.AgentsEvidence.supports(getCourse(parts[1]))) window.AgentsEvidence.page(app, getCourse(parts[1]));
    else if (parts[0] === 'books' || parts[0] === 'book') window.TextbookAtlas.render(app, parts[0] === 'book' ? parts[1] : null);
    else if (parts[0] === 'videos' && window.VideoLib) window.VideoLib.render(app, parts.slice(1));
    else if (parts[0] === 'visualize' && window.VisualizationLab) window.VisualizationLab.render(app, parts.slice(1));
    else if (parts[0] === 'practice' && window.PracticeHub) window.PracticeHub.render(app, parts.slice(1));
    else if (parts[0] === 'prompts') promptLibraryPage();
    else if (parts[0] === 'path' && PATHS.find(p => p.id === parts[1])) pathPage(PATHS.find(p => p.id === parts[1]));
    else if (parts[0] === 'check' && getCourse(parts[1])) checkPage(getCourse(parts[1]), parts[2] === undefined ? 'final' : parts[2], true);  // arriving at a check always starts a fresh set
    else if (parts[0] === 'course' && getCourse(parts[1])) {
      const c = getCourse(parts[1]); const l = parts[2] && c.lessons.find(x => x.id === parts[2]);
      if (parts[2] && !l) notFound(); else l ? lessonPage(c, l) : coursePage(c);
    } else notFound();
    if (!document.body.classList.contains('in-player')) window.scrollTo(0, 0);
    if (pendingGoto) { const t = pendingGoto; pendingGoto = null; requestAnimationFrame(() => document.getElementById(t)?.scrollIntoView({ behavior: 'smooth' })); }
  }
  let pendingGoto = null;
  function notFound() { document.title = 'Not found · learn/ai'; app.innerHTML = '<div class="container notfound"><h1>That page isn\'t here.</h1><p>Pick a course from the catalog.</p><a class="btn primary" href="#/">Back home</a></div>'; }

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-goto]');
    if (go) { e.preventDefault(); document.getElementById('mobile-nav')?.setAttribute('hidden', ''); if (location.hash && location.hash !== '#/') { pendingGoto = go.dataset.goto; location.hash = '#/'; } else document.getElementById(go.dataset.goto)?.scrollIntoView({ behavior: 'smooth' }); return; }
    const fb = e.target.closest('[data-feature]'); if (fb) { featureTouched = true; clearInterval(featureTimer); showFeature(fb.dataset.feature); return; }
    const cb = e.target.closest('[data-cat]'); if (cb) { cat = cb.dataset.cat; drawGrid(); return; }
    if (window.LearningUI.handleChallenge(e, current)) { if (current) updateSkillUI(current.c, current.l); return; }
    const newSet = e.target.closest('[data-check-new]');
    if (newSet && currentCheck) { e.preventDefault(); checkPage(currentCheck.c, currentCheck.scope, true); window.scrollTo(0, 0); return; }
    const confBtn = e.target.closest('.q [data-conf]');
    if (confBtn) {
      const box = confBtn.closest('.q'); box.dataset.conf = confBtn.dataset.conf;
      box.querySelectorAll('[data-conf]').forEach(b => { const on = b === confBtn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      return;
    }
    const opt = e.target.closest('.q [data-opt]');
    if (opt && current) {
      const box = opt.closest('.q'), qi = +box.dataset.q, q = current.l.quiz[qi], pick = +opt.dataset.opt, why = box.querySelector('.q-why');
      box.querySelectorAll('[data-opt]').forEach(b => b.classList.remove('right', 'wrong'));
      opt.classList.add(pick === q.correct ? 'right' : 'wrong'); why.hidden = false;
      const cal = window.Confidence ? window.Confidence.record(current.c.id, current.l.id, qi, box.dataset.conf, pick === q.correct) : null;
      const mis = pick === q.correct ? '' : misconception(current.c, current.l, qi, q, pick);
      why.innerHTML = pick === q.correct ? '✓ ' + md(q.why || 'Correct!')
        : '✗ ' + (mis ? md(mis) + ' Try again.' : 'Not quite. Try again.')
          + (cal && cal.confidentMistake ? '<span class="q-flag">You felt sure about this one. Confident mistakes are the most useful to revisit: reread the idea before retrying.</span>' : '');
      box.querySelector('.q-conf')?.remove();
      const calEl = document.getElementById('calib');
      if (calEl && cal && cal.first) { const m = window.Confidence.message(window.Confidence.summary(current.c.id)); calEl.hidden = !m; calEl.textContent = m ? '🧭 ' + m : ''; }
      window.LearningEngine.recordAttempt(current.c.id, current.l.id, 'quiz', qi, pick === q.correct); updateSkillUI(current.c, current.l);
      if (pick === q.correct) { box.classList.add('answered'); P.quiz[k(current.c, current.l) + '#' + qi] = true; save(); checkComplete(current.c, current.l); }
      return;
    }
    if (e.target.closest('[data-toggle-lab]')) { const p = document.querySelector('.player'); const closed = p.classList.toggle('lab-closed'); e.target.closest('[data-toggle-lab]').textContent = closed ? 'Open lab ⇤' : 'Hide lab ⇥'; try { localStorage.setItem('learnai-lab', closed ? 'closed' : 'open'); } catch (_) {} setTimeout(() => labEditor && labEditor.refresh(), 50); return; }
    if (e.target.closest('[data-theme-toggle]')) { window.toggleTheme && window.toggleTheme(); return; }
    if (e.target.closest('[data-toggle-side]')) { document.querySelector('.player').classList.toggle('side-open'); return; }
    const mt = e.target.closest('[data-mtab]'); if (mt) { const p = document.querySelector('.player'); p.classList.toggle('show-lab', mt.dataset.mtab === 'lab'); document.querySelectorAll('[data-mtab]').forEach(b => b.classList.toggle('on', b === mt)); if (mt.dataset.mtab === 'lab') setTimeout(() => labEditor && labEditor.refresh(), 30); return; }
    if (e.target.closest('.s-item')) document.querySelector('.player')?.classList.remove('side-open');
    if (e.target.closest('#menu-toggle')) { const n = document.getElementById('mobile-nav'); n.hidden = !n.hidden; }
  });
  document.addEventListener('input', e => { if (e.target.id === 'q') { query = e.target.value; if (query && cat !== 'all') cat = 'all'; drawGrid(); } });
  document.addEventListener('keydown', e => {
    const ft = e.target.closest && e.target.closest('[data-feature]');
    if (ft && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault(); featureTouched = true; clearInterval(featureTimer);
      const i = featured.findIndex(c => c.id === ft.dataset.feature), n = featured[(i + (e.key === 'ArrowRight' ? 1 : featured.length - 1)) % featured.length];
      showFeature(n.id); document.querySelector(`[data-feature="${n.id}"]`).focus();
    }
  });
  document.addEventListener('keydown', e => { if (e.target.id === 'q' && e.key === 'Enter') document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); });
  window.addEventListener('hashchange', route);
  route();
})();
