/* Properties of the ML Lab engine that the lesson text, the prediction, the quiz and the transfer scenarios rely on.
   Run: node tests/ml-lab.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'ml-lab.js'), 'utf8'), ctx, { filename: 'ml-lab.js' });
const L = ctx.MLLab, run = o => L.run(o).metrics;

// determinism
assert.deepEqual(JSON.parse(JSON.stringify(run({ degree: 5, n: 30 }))), JSON.parse(JSON.stringify(run({ degree: 5, n: 30 }))));
assert.equal(L.TRAIN.length, 60); assert.equal(L.VAL.length, 60); assert.equal(L.TEST.length, 200);

// underfitting: a straight line is wrong everywhere, and training error is as high as validation error
const d1 = run({ degree: 1, n: 20 });
assert.ok(d1.train > 0.5 && d1.val > 0.5 && Math.abs(d1.gap) < 0.05, JSON.stringify(d1));

// a sensible model comes close to the noise floor
const d3 = run({ degree: 3, n: 20 });
assert.ok(d3.val < 0.45 && d3.deploy < 0.4 && d3.deploy > L.NOISE_FLOOR - 0.05, JSON.stringify(d3));

// overfitting: more flexibility lowers TRAINING error but raises validation error
const d9 = run({ degree: 9, n: 20 });
assert.ok(d9.train < d3.train && d9.val > d3.val * 3 && d9.gap > 1, JSON.stringify(d9));
assert.ok(run({ degree: 12, n: 10 }).train < 0.01, 'a degree-12 polynomial interpolates 10 points');

// the two cures: more data, or regularisation
assert.ok(run({ degree: 9, n: 60 }).deploy < d9.deploy / 3);
assert.ok(run({ degree: 9, n: 20, lambda: 0.01 }).deploy < d9.deploy / 3);
assert.ok(run({ degree: 12, n: 10, lambda: 0.1 }).deploy < run({ degree: 12, n: 10 }).deploy / 1000);

// validation error is a better guide than training error: training error keeps falling with degree
const sw = L.sweep({ n: 15 });
assert.equal(sw.length, 12);
for (let i = 1; i < 12; i++) assert.ok(sw[i].train <= sw[i - 1].train + 0.05, 'training error should fall (roughly) with degree');
const bestVal = sw.reduce((a, b) => b.val < a.val ? b : a);
assert.ok(bestVal.degree >= 2 && bestVal.degree <= 5, 'the best degree on validation is a modest one: ' + bestVal.degree);
assert.equal(sw[11].train < sw[2].train, true); assert.ok(sw[11].val > 100 * sw[2].val);

// leakage: validation looks too good to be true (below the noise floor), deployment collapses
for (const d of [1, 3]) {
  const k = run({ degree: d, n: 20, leak: true });
  assert.ok(k.val < L.NOISE_FLOOR / 3, 'leaked validation error must be implausibly low: ' + k.val);
  assert.ok(k.deploy > 0.7 && k.deploy > 5 * k.val, 'leaked model must collapse in deployment: ' + JSON.stringify(k));
}
assert.ok(run({ degree: 3, n: 20, leak: true }).val < run({ degree: 3, n: 20 }).val / 5, 'leakage makes validation look much better than the honest model');
assert.ok(run({ degree: 3, n: 20, leak: true }).deploy > run({ degree: 3, n: 20 }).deploy * 1.8, 'and deployment much worse');

// the goal is reachable without leakage and not trivially: most settings miss it
let hit = 0, total = 0, leakHit = 0;
for (let n = 8; n <= 60; n += 4) for (let d = 1; d <= 12; d++) for (const lambda of [0, 0.001, 0.01, 0.1, 1]) {
  total++; if (L.GOAL.test(run({ n, degree: d, lambda }))) hit++; if (L.GOAL.test(run({ n, degree: d, lambda, leak: true }))) leakHit++;
}
assert.ok(hit > 10 && hit < total * 0.4, `goal-meeting settings: ${hit}/${total}`);
assert.equal(leakHit, 0, 'no leaked configuration may meet the deployment goal');
console.log(`PASS ML lab: deterministic, under/overfitting, two cures, leakage red flag, goal met by ${hit}/${total} honest settings and 0 leaked ones`);
