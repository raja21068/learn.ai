/* Videos: a curated, verified list of 3Blue1Brown videos (data in videos-data.js, built by tools/build_videos.py).
   Nothing is downloaded or copied: each card is a plain button, and only when it is pressed does the site insert YouTube's official player
   (privacy-enhanced domain youtube-nocookie.com). Until then no request is made to YouTube or Google, not even for a thumbnail.
   Routes: #/videos and #/videos/<topic>. Also used inside course pages and textbook chapters (courseStrip, chapterStrip). */
(function () {
  'use strict';
  const L = window.VIDEO_LIB || { topics: [], courses: {}, chapters: {}, channel: { name: '3Blue1Brown', url: 'https://www.youtube.com/@3blue1brown' } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = {}; L.topics.forEach(t => t.videos.forEach(v => { byId[v.id] = v; }));
  const EMBED = 'https://www.youtube-nocookie.com/embed/';
  const ID = /^[A-Za-z0-9_-]{11}$/;
  const crumbs = (...p) => `<nav class="crumbs"><a href="#/">Home</a> / ${p.join(' / ')}</nav>`;

  function card(v) {
    return `<div class="yt-card" data-yt="${esc(v.id)}"><div class="yt-stage"><button type="button" class="yt-play" aria-label="Play video: ${esc(v.title)}"><span class="yt-ico" aria-hidden="true">▶</span><span class="yt-title">${esc(v.title)}</span></button></div>
      <div class="yt-meta"><span>${esc(L.channel.name)}</span><a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></div></div>`;
  }
  function play(cardEl) {
    const id = cardEl.dataset.yt, v = byId[id];
    if (!ID.test(id) || !v || cardEl.querySelector('iframe') || cardEl.querySelector('.yt-fallback')) return;
    if (location.protocol === 'file:') {      // YouTube answers "Error 153" to pages without a web address, so do not embed: link out and explain
      cardEl.querySelector('.yt-stage').innerHTML = `<div class="yt-fallback"><p><b>This page was opened as a file.</b> YouTube cannot play embedded videos here (Error 153).</p><a class="btn sm primary" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a><p>To play videos inside the site, double-click <code>start-site.bat</code> (Windows) or run <code>python -m http.server 8000</code> and open http://localhost:8000</p></div>`;
      cardEl.classList.add('playing'); return;
    }
    const f = document.createElement('iframe');
    f.src = EMBED + id + '?autoplay=1&rel=0';
    f.title = v.title; f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen'; f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.setAttribute('allowfullscreen', '');
    cardEl.querySelector('.yt-stage').replaceChildren(f); cardEl.classList.add('playing');
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.yt-play'); if (b) play(b.closest('.yt-card')); });

  const note = () => `<p class="yt-note">Videos by <a href="${esc(L.channel.url)}" target="_blank" rel="noopener noreferrer">${esc(L.channel.name)}</a>, embedded from YouTube. They load only after you press play. <a href="#/videos">All videos</a></p>`;
  const strip = (heading, ids) => ids && ids.length ? `<section class="yt-strip"><span class="bm-section-no">Watch</span><h2>${esc(heading)}</h2><div class="yt-grid">${ids.filter(id => byId[id]).map(id => card(byId[id])).join('')}</div>${note()}</section>` : '';
  const lessonIds = (courseId, lessonId) => ((L.lessons || {})[courseId] || {})[lessonId] || [];
  const hasLesson = (courseId, lessonId) => lessonIds(courseId, lessonId).length > 0;
  const badge = (courseId, lessonId) => { const ids = lessonIds(courseId, lessonId).filter(id => byId[id]); return ids.length ? `<i class="yt-badge" title="${esc(ids.length === 1 ? 'Video: ' + byId[ids[0]].title : ids.length + ' videos: ' + ids.map(id => byId[id].title.split(' | ')[0]).join('; '))}">🎬${ids.length > 1 ? '×' + ids.length : ''}</i>` : ''; };
  const lessonStrip = (courseId, lessonId) => strip(lessonIds(courseId, lessonId).length > 1 ? 'Watch: videos for this lesson' : 'Watch: a video for this lesson', lessonIds(courseId, lessonId)).replace('class="yt-strip"', 'class="yt-strip yt-lesson"');
  const courseStrip = courseId => strip('Watch: the ideas behind this course', L.courses[courseId]);
  const chapterStrip = (book, n) => strip('Watch: this chapter explained visually', (L.chapters[book] || {})[n]);

  function page(app, topicId) {
    const topics = topicId ? L.topics.filter(t => t.id === topicId) : L.topics;
    const shown = topics.length ? topics : L.topics;
    document.title = (topics.length && topicId ? topics[0].title + ' · ' : '') + 'Videos · learn/ai';
    const total = L.topics.reduce((n, t) => n + t.videos.length, 0);
    const section = t => `<section class="yt-topic" data-topic="${esc(t.id)}"><h2>${esc(t.title)}</h2><p class="yt-blurb">${esc(t.blurb)}</p><div class="yt-grid">${t.videos.map(card).join('')}</div></section>`;
    app.innerHTML = `<div class="container yt-page">${crumbs('Videos')}
      <header class="yt-hero"><span class="kicker">Watch, then try it</span><h1>Videos by 3Blue1Brown</h1>
        <p>${total} hand-picked videos that show the mathematics behind neural networks, language models and machine learning. They are made by <a href="${esc(L.channel.url)}" target="_blank" rel="noopener noreferrer">${esc(L.channel.name)}</a>, not by this site: the player is YouTube's own, and nothing is copied or downloaded. If you enjoy them, support the channel.</p>
        <p class="yt-privacy">🔒 Nothing contacts YouTube until you press play. Then the video loads from YouTube's privacy-enhanced domain (youtube-nocookie.com); YouTube's own policies apply from that moment.</p>
        <div class="yt-tabs" role="group" aria-label="Topic"><a class="yt-tab ${topicId ? '' : 'on'}" href="#/videos">All topics</a>${L.topics.map(t => `<a class="yt-tab ${t.id === topicId ? 'on' : ''}" href="#/videos/${esc(t.id)}">${esc(t.title.split(',')[0])}</a>`).join('')}</div>
        <label class="yt-search"><span>Search video titles</span><input id="yt-q" type="search" placeholder="e.g. backpropagation, eigenvectors, Fourier"></label></header>
      <div id="yt-topics">${shown.map(section).join('')}</div><p class="yt-empty" id="yt-empty" hidden>No video matches your search.</p>
      <p class="yt-note">List checked on ${esc(L.checked)} against YouTube: every video is by ${esc(L.channel.name)} and allows embedding. Related courses: <a href="#/course/deep-learning">Deep Learning</a>, <a href="#/course/machine-learning">Machine Learning</a>, <a href="#/course/llm-engineering">LLM Engineering</a>.</p></div>`;
    const q = app.querySelector('#yt-q');
    q.addEventListener('input', () => {
      const t = q.value.toLowerCase().trim(); let any = false;
      app.querySelectorAll('.yt-card').forEach(c => { const hit = !t || byId[c.dataset.yt].title.toLowerCase().includes(t); c.hidden = !hit; if (hit) any = true; });
      app.querySelectorAll('.yt-topic').forEach(s => { s.hidden = ![...s.querySelectorAll('.yt-card')].some(c => !c.hidden); });
      app.querySelector('#yt-empty').hidden = any;
    });
  }

  window.VideoLib = { render: (app, parts) => page(app, (parts || [])[0]), courseStrip, chapterStrip, lessonStrip, hasLesson, badge, lessonIds, card, data: L };
})();
