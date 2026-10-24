/* Guards the lesson-templates storyboard variant (needs video/proposed/lesson-templates.patch): every bar value and every number
   in a title or narration comes from the lab engine, labels pass the patch's own label rules, and each duration follows its
   narration. Run: node tests/video-lesson-templates.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildLessonTemplates, facts } = require('../video/build-storyboards.cjs');

const v = buildLessonTemplates(), f = facts(), S = v.scenes;
const LABEL = /^[A-Za-z0-9 .,:%$()/+&-]{1,24}$/;          // studio/animation.py LABEL_PATTERN in the patch
const bars = S.filter(s => s.visual_type === 'bars'), flows = S.filter(s => s.visual_type === 'flow');

assert.deepEqual(S.map(s => s.id), ['title', 'setup', 'medium', 'cost', 'latency', 'why', 'trap', 'lesson']);
assert.deepEqual(S.map(s => s.visual_type), ['text', 'flow', 'bars', 'bars', 'bars', 'bars', 'bars', 'flow'], 'only the title card is still text');
assert.equal(new Set(S.map(s => s.id)).size, S.length);
assert.equal(bars.length, 5); assert.equal(flows.length, 2);

// bar values are the engine's numbers, not typed ones
const cost = bars.find(s => s.id === 'cost').data, lat = bars.find(s => s.id === 'latency').data;
assert.deepEqual(cost.bars.map(b => b.value), [f.medium.cost, f.cascade.cost]);
assert.deepEqual(lat.bars.map(b => b.value), [f.medium.p95, f.cascade.p95]);
assert.equal(cost.unit, '$'); assert.equal(lat.unit, 'ms');
const dat = id => bars.find(s => s.id === id).data;
assert.deepEqual(dat('medium').bars.map(b => b.value), [f.medium.quality, f.cascade.quality]); assert.equal(dat('medium').unit, '%');
assert.deepEqual(dat('why').bars.map(b => b.value), [f.stayed, f.cascade.escalations]);
assert.equal(f.stayed + f.cascade.escalations, f.requests, 'every request is either kept or escalated');
assert.deepEqual(dat('trap').bars.map(b => b.value), [f.smallRight, f.confidentWrong]);
assert.equal(f.smallRight + f.confidentWrong, f.stayed, 'the kept requests are either right or confidently wrong');
for (const s of bars) {
  assert.ok(s.data.bars.length >= 2 && s.data.bars.length <= 6);
  assert.equal(new Set(s.data.bars.map(b => b.label)).size, s.data.bars.length, 'labels must be unique');
  for (const b of s.data.bars) { assert.match(b.label, LABEL); assert.ok(Number.isFinite(b.value) && b.value >= 0 && b.value <= 1e9); }
  assert.match(s.data.title, /^[A-Za-z0-9 .,:%$()/+&-]{1,60}$/);
  assert.deepEqual(Object.keys(s.data).sort(), ['bars', 'title', 'unit']);
}
assert.deepEqual(S.find(s => s.id === 'setup').data, { labels: ['Request', 'Small model', 'Large model'] });
assert.deepEqual(S.find(s => s.id === 'lesson').data, { labels: ['Measure traffic', 'Right-size first', 'Cascade if easy'] });
for (const fl of flows) { assert.ok(fl.data.labels.length >= 2 && fl.data.labels.length <= 4); for (const l of fl.data.labels) assert.match(l, /^[A-Za-z0-9 .,:%$()/+&-]{1,20}$/); }
for (const s of S) if (!['bars', 'flow'].includes(s.visual_type)) assert.equal(s.data, undefined, s.id + ' must not carry data');

// every number spoken or shown comes from the engine
const allowed = new Set([f.requests, f.medium.quality, f.medium.cost.toFixed(4), f.medium.p95.toLocaleString('en-US'), f.cascade.quality, f.cascade.cost.toFixed(4),
  f.cascade.p95.toLocaleString('en-US'), f.cascade.escalations, f.stayed, f.smallRight, f.confidentWrong, f.costRatio, f.p95Ratio, 19, 20].map(String));
for (const s of S) for (const n of (s.narration + ' ' + s.objective + ' ' + (s.data && s.data.title || '')).match(/\d[\d,]*(?:\.\d+)?/g) || []) assert.ok(allowed.has(n), `${s.id}: ${n} is not from the engine`);

// duration follows the narration (150 words a minute plus 2 s of animation), within the patch's 3 to 90 s
for (const s of S) {
  const words = s.narration.trim().split(/\s+/).length;
  assert.equal(s.duration_seconds, Math.round((words / 2.5 + 2) * 10) / 10, s.id);
  assert.ok(s.duration_seconds >= 3 && s.duration_seconds <= 90);
  if (s.visual_type === 'text') assert.ok(s.objective.length <= 100);
}
assert.ok(v.total_seconds >= 100 && v.total_seconds <= 140);

// determinism and files not stale
const dir = path.join(__dirname, '..', 'video', 'out');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'cascade-cost.lesson-templates.scenes.json'), 'utf8')), JSON.parse(JSON.stringify(v)), 'video/out is stale: run node video/build-storyboards.cjs');
console.log(`PASS lesson-templates storyboard: ${S.length} scenes, about ${v.total_seconds} s, ${bars.length} bar and ${flows.length} flow scenes with engine values`);
