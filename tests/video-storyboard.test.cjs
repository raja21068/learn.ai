/* Guards the lesson-explainer storyboard: it must fit the ai-youtube-studio Scene format, and every number it says or shows
   must come from the tested lab engine. Run: node tests/video-storyboard.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build, facts, markdown } = require('../video/build-storyboards.cjs');

const STUDIO_TYPES = ['text', 'equation', 'graph', 'vector', 'neural_network', 'sorting', 'probability', 'flow'];   // studio/skills.py
const b = build(), f = facts(), S = b.scenes;

// 1. Scene format (studio/models.py: Scene) and template limits (studio/animation.py)
assert.ok(S.length >= 5 && S.length <= 10);
assert.equal(new Set(S.map(s => s.id)).size, S.length, 'scene ids must be unique');
for (const s of S) {
  assert.match(s.id, /^[a-z0-9-]+$/, 'ids become Python class names, so keep them plain: ' + s.id);
  assert.ok(STUDIO_TYPES.includes(s.visual_type), 'unsupported visual_type ' + s.visual_type);
  assert.ok(typeof s.objective === 'string' && s.objective.length >= 5, s.id + ' objective');
  if (s.visual_type === 'text') assert.ok(s.objective.length <= 100, s.id + ': a text scene shows only the first 100 characters of its objective');
  assert.ok(s.narration.split(/\s+/).length >= 20, s.id + ' narration too short');
  assert.ok(s.duration_seconds >= 5 && s.duration_seconds <= 40, s.id + ' duration');
  assert.ok(s.expression === null || ['graph', 'equation'].includes(s.visual_type), 'only graph and equation scenes take an expression');
  assert.ok(Array.isArray(s.sources) && s.sources.length >= 1, s.id + ' must cite its source');
}
// the narration must leave time for the animation, at a calm 150 words per minute
for (const s of S) assert.ok(s.duration_seconds >= s.narration.split(/\s+/).length / 2.5, s.id + ' is shorter than its narration');

// 2. Every number a viewer hears or reads comes from the engine
const allowed = new Set([f.requests, f.medium.quality, f.medium.cost.toFixed(4), f.medium.p95.toLocaleString('en-US'), f.cascade.quality, f.cascade.cost.toFixed(4), f.cascade.p95.toLocaleString('en-US'),
  f.cascade.escalations, f.confidentWrong, f.costRatio, f.p95Ratio, 19, 20].map(String));          // 19 out of 20 is the definition of p95
const numbers = text => (text.match(/\d[\d,]*(?:\.\d+)?/g) || []);
for (const s of S) for (const n of numbers(s.narration + ' ' + s.objective)) assert.ok(allowed.has(n), `${s.id}: the number ${n} does not come from the lab engine`);
for (const key of ['quality', 'cost', 'p95']) assert.ok(numbers(S.map(s => s.narration).join(' ')).includes(key === 'cost' ? f.medium.cost.toFixed(4) : String(f.medium[key]).replace(/\B(?=(\d{3})+$)/g, ',')), 'the medium ' + key + ' must be stated');

// 3. The claims themselves are true in the engine
assert.equal(f.medium.quality, f.cascade.quality, 'the script says that the quality is the same');
assert.ok(f.cascade.cost > 4.5 * f.medium.cost && f.cascade.cost < 5.6 * f.medium.cost, 'the title says "about five times"');
assert.ok(f.p95Ratio > 2.5 && f.p95Ratio < 3);
assert.ok(f.cascade.escalations / f.requests > 0.4);
assert.equal(f.confidentWrong, 3);

// 4. Determinism, and the generated files are not stale
assert.deepEqual(JSON.parse(JSON.stringify(build())), JSON.parse(JSON.stringify(build())));
const onDisk = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'video', 'out', 'cascade-cost.scenes.json'), 'utf8'));
assert.deepEqual(onDisk, JSON.parse(JSON.stringify(b)), 'video/out is stale: run node video/build-storyboards.cjs');
assert.equal(fs.readFileSync(path.join(__dirname, '..', 'video', 'out', 'cascade-cost.script.md'), 'utf8'), markdown(b));

// 5. The honest compatibility record
assert.equal(b.studio_compatibility.fits_project_config, false);
assert.ok(b.total_seconds >= 90 && b.total_seconds <= 130 && b.total_seconds < b.studio_compatibility.project_config_min_seconds);
console.log(`PASS video storyboard: ${S.length} scenes, about ${b.total_seconds} s, studio Scene format, every number traced to the engine`);
