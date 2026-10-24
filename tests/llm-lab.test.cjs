/* Properties of the LLM Service Lab engine that the lesson text, the prediction, the quiz and the transfer scenarios rely on.
   Run: node tests/llm-lab.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'llm-lab.js'), 'utf8'), ctx, { filename: 'llm-lab.js' });
const L = ctx.LLMLab, run = p => L.run(p).metrics;
const plain = o => JSON.parse(JSON.stringify(o));

assert.equal(L.REQUESTS.length, 40);
assert.equal(L.REQUESTS.filter(r => r.repeatOf).length, 12, 'twelve requests repeat an earlier one');
assert.deepEqual(plain(run({ model: 'medium', quant: 'int8' })), plain(run({ model: 'medium', quant: 'int8' })), 'deterministic');

// the size ladder: more skill costs more money and time
const s = run({ model: 'small' }), m = run({ model: 'medium' }), l = run({ model: 'large' });
assert.ok(s.quality < m.quality && m.quality < l.quality && l.quality === 100, JSON.stringify([s.quality, m.quality, l.quality]));
assert.ok(s.cost < m.cost && m.cost < l.cost && s.p95 < m.p95 && m.p95 < l.p95);
assert.ok(l.cost > 5 * m.cost, 'the large model costs many times the medium one');

// quantization: cheaper and faster, never better; and the biggest model survives it best
for (const model of ['small', 'medium', 'large']) {
  const a = run({ model, quant: 'fp16' }), b = run({ model, quant: 'int8' }), c = run({ model, quant: 'int4' });
  assert.ok(a.cost > b.cost && b.cost > c.cost && a.p95 > b.p95 && b.p95 > c.p95, model + ' cost and latency fall with precision');
  assert.ok(a.quality >= b.quality && b.quality >= c.quality, model + ' quality never improves with fewer bits');
}
assert.equal(run({ model: 'large', quant: 'int4' }).quality, 100, 'a big model has headroom for int4');
assert.ok(run({ model: 'small', quant: 'int8' }).quality < s.quality - 10, 'a small model is hurt badly by quantization');
assert.ok(run({ model: 'medium', quant: 'int8' }).quality < m.quality - 10);

// the cache: saves money on repeats, changes neither quality nor tail latency
for (const model of ['small', 'medium', 'large']) {
  const a = run({ model }), b = run({ model, cache: true });
  assert.equal(b.hits, 12); assert.equal(b.quality, a.quality); assert.equal(b.p95, a.p95); assert.ok(b.cost < a.cost);
}

// the cascade is NOT free: here it costs far more than just using the medium model, is slower, and overconfident small answers slip through
const c = run({ cascade: true });
assert.ok(c.quality >= m.quality && c.cost > 4 * m.cost && c.p95 > 2 * m.p95, JSON.stringify([c, m]));
assert.equal(c.escalations, 19);
const traps = new Set(L.REQUESTS.filter(r => r.trap).map(r => r.id));
const wrongIds = L.run({ cascade: true }).results.filter(x => !x.correct).map(x => x.id);
assert.equal(wrongIds.length, 3); assert.ok(wrongIds.every(id => traps.has(id)), 'every wrong cascade answer is an overconfident small-model answer');
assert.ok(run({ cascade: true, cache: true }).cost < c.cost);

// the goal is reachable but not by the obvious "biggest model" or the "clever cascade"
let hit = 0, total = 0, hitCascade = 0, hitLarge = 0; const pts = [];
for (const model of ['small', 'medium', 'large']) for (const quant of ['fp16', 'int8', 'int4']) for (const cache of [false, true]) for (const cascade of [false, true]) {
  if (cascade && model !== 'small') continue;
  total++; const r = L.run({ model, quant, cache, cascade }); pts.push(Object.assign({ name: [model, quant, cache, cascade].join('/') }, r.metrics));
  if (L.GOAL.test(r.metrics)) { hit++; if (cascade) hitCascade++; if (model === 'large') hitLarge++; }
}
assert.ok(hit >= 2 && hit <= 4 && hitCascade === 0 && hitLarge === 0, `goal met by ${hit}/${total}, cascade ${hitCascade}, large ${hitLarge}`);
assert.equal(L.GOAL.test(run({ model: 'medium', quant: 'fp16' })), true);

// the Pareto helper
const P = L.pareto([{ cost: 1, p95: 100, quality: 90, n: 'a' }, { cost: 2, p95: 100, quality: 90, n: 'dominated' }, { cost: 3, p95: 50, quality: 90, n: 'fast' }, { cost: 1, p95: 100, quality: 95, n: 'better' }]);
assert.deepEqual(P.map(x => x.n).sort(), ['better', 'fast']);
const front = L.pareto(pts).map(x => x.name);
assert.ok(front.includes('medium/fp16/true/false') && !front.some(n => n.endsWith('/true') && n.startsWith('small/') && n.split('/')[3] === 'true'), 'no cascade policy is on the Pareto front');
console.log(`PASS LLM lab: deterministic, size ladder, quantization, cache, costly cascade with overconfident misses, goal met by ${hit}/${total} policies, Pareto front of ${front.length}`);
