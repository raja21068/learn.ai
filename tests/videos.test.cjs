/* Guards the Videos feature: the list is well-formed, every placement points at a listed video, the player is YouTube's privacy-enhanced embed
   created only on a click, and no video file is part of the repository. Run: node tests/videos.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const ctx = { window: {} }; ctx.window = ctx; vm.runInNewContext(read('assets/videos-data.js'), ctx);
const L = JSON.parse(JSON.stringify(ctx.VIDEO_LIB));

// 1. the list
assert.equal(L.channel.name, '3Blue1Brown'); assert.equal(L.channel.url, 'https://www.youtube.com/@3blue1brown');
assert.match(L.checked, /^\d{4}-\d{2}-\d{2}$/);
const ids = [], titles = {};
for (const t of L.topics) {
  assert.match(t.id, /^[a-z-]+$/); assert.ok(t.title.length > 5 && t.blurb.length > 30, t.id);
  assert.ok(t.videos.length >= 3, t.id + ' needs at least 3 videos');
  for (const v of t.videos) {
    assert.match(v.id, /^[A-Za-z0-9_-]{11}$/, 'bad YouTube id ' + v.id); assert.ok(v.title.length > 3 && !/[<>]/.test(v.title), v.id);
    ids.push(v.id); titles[v.id] = v.title;
  }
}
assert.equal(new Set(ids).size, ids.length, 'a video appears in two topics'); assert.equal(ids.length, 52);
assert.equal(L.topics.length, 6);
assert.ok(ids.includes('aircAruvnKk') && titles['aircAruvnKk'].startsWith('But what is a neural network?'));

// 2. placements: every id exists, every chapter and course exists
const chapters = { d2l: 6, islr: 10, algo: 7, db: 16, rl: 8, os: 15, network: 8 };
for (const [course, list] of Object.entries(L.courses)) { assert.ok(list.length >= 2 && list.length <= 6, course); for (const id of list) assert.ok(titles[id], `${course}: ${id} is not in the list`); }
for (const [book, map] of Object.entries(L.chapters)) {
  assert.ok(chapters[book], 'unknown book ' + book);
  for (const [n, list] of Object.entries(map)) { assert.ok(+n >= 1 && +n <= chapters[book], `${book} chapter ${n}`); for (const id of list) assert.ok(titles[id], `${book} ${n}: ${id}`); }
}
const courseIds = ['deep-learning', 'machine-learning', 'llm-engineering', 'ai-foundations', 'statistical-learning', 'algorithm-design'];
assert.deepEqual(Object.keys(L.courses).sort(), courseIds.sort());
// lessons: videos placed on individual lessons (the outline badge and the strip inside the lesson)
assert.deepEqual(Object.keys(L.lessons).sort(), courseIds.slice().sort());
let lessonCount = 0;
for (const [course, map] of Object.entries(L.lessons)) for (const [lesson, list] of Object.entries(map)) {
  assert.match(lesson, /^[a-z0-9-]+$/); assert.ok(list.length >= 1 && list.length <= 3, `${course}/${lesson}`); lessonCount++;
  assert.equal(new Set(list).size, list.length); for (const id of list) assert.ok(titles[id], `${course}/${lesson}: ${id} is not in the list`);
}
assert.equal(lessonCount, 27);

// 3. privacy and safety: the privacy-enhanced domain, an iframe only inside the click handler, no YouTube address in the static page
const js = read('assets/videos.js');
assert.ok(js.includes("https://www.youtube-nocookie.com/embed/")); assert.ok(!/youtube\.com\/embed/.test(js), 'use the nocookie embed domain');
assert.equal((js.match(/createElement\('iframe'\)/g) || []).length, 1, 'exactly one place creates a player');
assert.ok(js.includes('function play(') && /click.*\.yt-play/.test(js), 'the player is created from a click handler');
assert.ok(!/ytimg|i\.ytimg|hqdefault|maxresdefault|googlevideo/.test(js + read('assets/videos.css')), 'no thumbnail may be fetched before a click');
assert.ok(js.includes('ID.test(id)'), 'ids are validated before they are put in a URL');
for (const f of ['index.html', 'assets/app.js']) assert.ok(!/youtube(-nocookie)?\.com/i.test(read(f)), f + ' must not contain a YouTube address: players are created only by videos.js, after a click');
assert.ok(!/<iframe[^>]*youtube/i.test(read('index.html')));

// 4. nothing to download or copy: no video or audio files shipped in the site folders
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['node_modules', '.git', 'studio-data', 'studio-patched', 'artifacts'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const media = walk(path.join(ROOT, 'assets')).concat(walk(path.join(ROOT, 'downloads')), walk(path.join(ROOT, 'third_party'))).filter(f => /\.(mp4|webm|mkv|mov|mp3|m4a)$/i.test(f));
assert.deepEqual(media, [], 'no video or audio files in the site');
assert.ok(fs.existsSync(path.join(ROOT, 'tools/build_videos.py')));
// the start scripts and the notes that explain why the site must not be opened as a file
const bat = read('start-site.bat'), sh = read('start-site.sh');
assert.match(bat, /http\.server 8000/); assert.match(bat, /localhost:8000/); assert.match(sh, /http\.server 8000/); assert.match(sh, /^#!\/usr\/bin\/env sh/);
assert.match(read('README.md'), /start-site\.bat/); assert.match(read('README.md'), /Error 153/);
assert.match(js, /location\.protocol === 'file:'/, 'videos.js must handle a page opened as a file');
assert.match(read('index.html'), /location\.protocol === 'file:'/, 'the file banner must exist');
console.log(`PASS videos: ${ids.length} verified 3Blue1Brown videos in ${L.topics.length} topics, ${lessonCount} lessons, ${Object.keys(L.courses).length} courses and ${Object.values(L.chapters).reduce((n, m) => n + Object.keys(m).length, 0)} chapters linked, nocookie embed on click only, no media files`);
