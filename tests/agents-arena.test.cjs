/* Properties of the Agent Arena engine that the lesson text, the prediction and the quiz rely on.
   Run: node tests/agents-arena.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'agents-arena.js'), 'utf8'), ctx, { filename: 'agents-arena.js' });
const A = ctx.AgentArena, run = p => A.run(p).metrics;

assert.equal(A.TICKETS.length, 26);
const fam = f => A.TICKETS.filter(t => t.fault === f).length;
assert.deepEqual([fam('flaky'), fam('bad'), fam('inj'), fam('loop'), A.TICKETS.filter(t => t.risky).length], [6, 5, 4, 2, 4]);

// determinism: same policy, same result, every time
assert.deepEqual(JSON.parse(JSON.stringify(A.run({ retries: 2, validate: true }))), JSON.parse(JSON.stringify(A.run({ retries: 2, validate: true }))));

// baseline: every failure family shows up
const base = run({});
assert.deepEqual([base.ok, base.wrong, base.harm, base.timeout, base.failed, base.cost], [7, 5, 4, 4, 6, 86]);

// each guardrail removes its own failure family (and only that one)
assert.equal(run({ filter: true }).harm, 0);        assert.equal(run({ filter: true }).wrong, base.wrong);
assert.equal(run({ approval: true }).harm, 0);      assert.equal(run({ approval: true }).reviews, 8);
assert.equal(run({ validate: true }).wrong, 0);     assert.equal(run({ validate: true }).harm, base.harm);
assert.equal(run({ retries: 3 }).failed, 0);        assert.equal(run({ retries: 3 }).wrong, base.wrong);
assert.equal(run({ fallback: true }).failed, 0);    assert.equal(run({ fallback: true }).degraded, 6);
assert.equal(run({ loopGuard: true }).timeout, 2);
// no single control makes the queue safe
for (const p of [{ filter: true }, { approval: true }, { validate: true }, { retries: 3 }, { fallback: true }, { loopGuard: true }]) assert.equal(run(p).safe, false);

// budget trade-off: too small times out the long tickets; larger budgets burn more on unguarded loops
assert.ok(run({ budget: 3 }).timeout >= base.timeout);
assert.ok(run({ budget: 10 }).cost > run({ budget: 6 }).cost);

// the lesson's headline comparison: approval instead of a filter works but costs more
const full = { retries: 3, validate: true, fallback: true, loopGuard: true, budget: 9 };
const withFilter = run({ ...full, filter: true }), withApproval = run({ ...full, approval: true }), both = run({ ...full, filter: true, approval: true });
assert.equal(withFilter.cost, 98); assert.equal(withFilter.safe, true); assert.equal(A.GOAL.test(withFilter), true);
assert.equal(run({ ...full, approval: true }).harm, 0);
assert.equal(run({ ...full, filter: false, approval: true }).cost, 138); assert.equal(A.GOAL.test(run({ ...full, approval: true })), false);
assert.ok(both.cost > withFilter.cost);

// the goal is reachable, and not trivially: many policies miss it
let hit = 0, total = 0;
for (let r = 0; r <= 3; r++) for (let b = 3; b <= 10; b++) for (let m = 0; m < 32; m++) {
  total++; if (A.GOAL.test(run({ retries: r, budget: b, validate: !!(m & 1), filter: !!(m & 2), approval: !!(m & 4), fallback: !!(m & 8), loopGuard: !!(m & 16) }))) hit++;
}
assert.ok(hit > 0 && hit < total * 0.2, `goal-meeting policies: ${hit}/${total}`);
console.log(`PASS agent arena: deterministic engine, one failure family per guardrail, goal met by ${hit}/${total} policies`);
