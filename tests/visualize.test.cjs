/* Guards the Visualization lab: the bundled libraries and the playground are the pinned, hash-recorded files; the playground differs from its
   original by exactly one line (no analytics); every textbook chapter has a diagram; every referenced chart exists.
   Run: node tests/visualize.test.cjs */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const manifest = JSON.parse(read('third_party/MANIFEST.json')).files;

// 1. pinned libraries are bundled with their licence and recorded in the manifest
const libs = { 'third_party/mermaid/mermaid.min.js': /MIT/, 'third_party/mermaid/LICENSE': /MIT License/, 'third_party/observable-plot/plot.umd.min.js': null, 'third_party/observable-plot/LICENSE': /Permission to use, copy, modify/,
  'third_party/d3/d3.min.js': null, 'third_party/d3/LICENSE': /Permission to use, copy, modify/, 'third_party/tensorflow-playground/LICENSE': /Apache License/ };
for (const [file, re] of Object.entries(libs)) {
  assert.ok(manifest[file], file + ' must be in the manifest');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex'), manifest[file], file + ' changed');
  if (re) assert.match(read(file), re);
}
assert.match(read('third_party/mermaid/mermaid.min.js').slice(0, 600), /mermaid|Mermaid|@license/i);
assert.match(read('third_party/observable-plot/plot.umd.min.js').slice(0, 300), /Observable|plot/i);

// 2. the playground: the original and the shipped page differ by exactly one line, and nothing sends data to an analytics service
const orig = read('third_party/tensorflow-playground/index.original.html').split('\n'), ship = read('third_party/tensorflow-playground/index.html').split('\n');
assert.equal(orig.length, ship.length);
const changed = orig.map((l, i) => [l, ship[i]]).filter(([a, b]) => a !== b);
assert.equal(changed.length, 1, 'exactly one line may differ');
assert.match(changed[0][0], /analytics\.js/); assert.match(changed[0][1], /window\.ga = function \(\) \{\}/);
assert.ok(!fs.existsSync(path.join(ROOT, 'third_party/tensorflow-playground/analytics.js')), 'the analytics script must not be shipped');
for (const f of ['index.html', 'bundle.js', 'lib.js']) assert.ok(!/google-analytics\.com|googletagmanager|UA-\d{5,}-\d/.test(read('third_party/tensorflow-playground/' + f)), f + ' must not contain an analytics endpoint or id');
assert.match(read('third_party/tensorflow-playground/CHANGES.md'), /exactly one line/);
for (const f of ['bundle.js', 'bundle.css', 'lib.js']) assert.ok(manifest['third_party/tensorflow-playground/' + f], f);

// 3. chapter diagrams: every guided chapter of the seven books has one, and the charts they reference exist
const load = f => { const ctx = { window: {} }; ctx.window = ctx; vm.runInNewContext(read(f), ctx); return ctx; };
const viz = JSON.parse(JSON.stringify(load('assets/chapter-viz-data.js').CHAPTER_VIZ));
const masterclass = JSON.parse(JSON.stringify(load('assets/book-masterclass-data.js').BOOK_MASTERCLASS));
const expected = { islr: 10, algo: 7 };
for (const [book, list] of Object.entries(masterclass)) expected[book] = list.length;
let total = 0;
for (const [book, n] of Object.entries(expected)) {
  for (let i = 1; i <= n; i++) {
    const z = viz[book] && viz[book][i]; assert.ok(z, `${book} chapter ${i} has no diagram`); total++;
    assert.ok(z.t.length > 8 && z.d.length > 30, `${book} ${i}`);
    assert.match(z.d, /^(flowchart|sequenceDiagram|stateDiagram-v2|erDiagram|gantt)\b/, `${book} ${i}: unknown diagram type`);
    assert.ok(!/<script|javascript:|onerror=|<img|<iframe/i.test(z.d), `${book} ${i}: diagram text must be plain`);
  }
  assert.equal(Object.keys(viz[book]).length, n, book + ' has a diagram for a chapter that does not exist');
}
assert.equal(total, 70);
const vizSource = read('assets/visualize.js');
const chartIds = new Set([...vizSource.matchAll(/\{ id: '([a-z]+)', title:/g)].map(m => m[1]));
assert.ok(chartIds.size >= 8, 'charts: ' + [...chartIds]);
for (const [book, ch] of Object.entries(viz)) for (const [n, z] of Object.entries(ch)) if (z.c) assert.ok(chartIds.has(z.c), `${book} ${n}: unknown chart ${z.c}`);
// the playground is offered in the deep-learning chapters that are about neural networks
assert.ok(viz.d2l[5].p && viz.d2l[6].p);

// 4. safety: Mermaid runs in strict mode, and library code is never fed page text
assert.match(vizSource, /securityLevel: 'strict'/); assert.ok(!/eval\(|new Function\(/.test(vizSource));
console.log(`PASS visualization: 3 libraries and the playground verified (one-line change, no analytics), ${total} chapter diagrams for 7 books, ${chartIds.size} charts`);
