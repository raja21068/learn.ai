/* Properties of the Prompt Lab engine that the lesson text, the prediction, the quiz and the transfer scenarios rely on.
   Run: node tests/prompt-lab.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'prompt-lab.js'), 'utf8'), ctx, { filename: 'prompt-lab.js' });
const L = ctx.PromptLab, plain = o => JSON.parse(JSON.stringify(o));
const run = c => L.run(c), failing = c => Array.from(run(c).results.filter(x => !x.ok).map(x => x.id));
const FULL = { instruction: 'precise', context: 'full', format: 'schema', examples: 'none', constraints: true, delimiters: true, reasoning: true, abstain: true, temperature: 'medium' };

assert.equal(L.TASKS.length, 8);
assert.deepEqual(plain(run(FULL)), plain(run(FULL)), 'deterministic');
assert.equal(run({}).metrics.passed, 1);                         // the default prompt of the widget: a typical, careless prompt
assert.equal(run({}).metrics.tokens, 57);
assert.equal(run(L.OFF).metrics.passed, 0, 'a bare prompt fails every task');
assert.equal(run(L.OFF).metrics.tokens, 5);

// the full prompt passes everything, and each component is needed by exactly the tasks the lesson says
assert.deepEqual([run(FULL).metrics.passed, run(FULL).metrics.tokens], [8, 186]);
const NEEDS = { context: [5], format: [1], constraints: [3], delimiters: [4], reasoning: [6], abstain: [8] };
for (const [k, tasks] of Object.entries(NEEDS)) assert.deepEqual(failing(Object.assign({}, FULL, { [k]: L.OFF[k] })), tasks, 'removing ' + k);
assert.deepEqual(failing(Object.assign({}, FULL, { instruction: 'vague' })), [2, 3, 5, 7], 'a vague instruction breaks four tasks');
assert.deepEqual(failing(Object.assign({}, FULL, { instruction: 'clear' })), [2], 'a merely clear instruction needs examples for sentiment');
assert.deepEqual(failing(Object.assign({}, FULL, { temperature: 'low' })), [7]);
assert.deepEqual(failing(Object.assign({}, FULL, { temperature: 'high' })), [1, 6]);

// examples: balanced help, skewed hurt (even with a precise instruction), and they cost tokens either way
const balanced = run(Object.assign({}, FULL, { examples: 'balanced' })).metrics, skewed = run(Object.assign({}, FULL, { examples: 'skewed' })).metrics;
assert.equal(balanced.passed, 8); assert.equal(skewed.passed, 7); assert.equal(balanced.tokens, 186 + 60); assert.equal(skewed.tokens, 186 + 60);
assert.deepEqual(failing(Object.assign({}, FULL, { examples: 'skewed' })), [2]);
assert.equal(run(Object.assign({}, FULL, { instruction: 'clear', examples: 'balanced' })).metrics.passed, 8, 'examples can replace a precise instruction');
assert.equal(run(Object.assign({}, FULL, { instruction: 'clear', examples: 'balanced' })).metrics.tokens, 233);

// exhaustive search over all 3,888 prompts
const keys = Object.keys(L.OFF), values = { instruction: ['vague', 'clear', 'precise'], context: ['none', 'some', 'full'], format: ['none', 'described', 'schema'], examples: ['none', 'balanced', 'skewed'],
  constraints: [false, true], delimiters: [false, true], reasoning: [false, true], abstain: [false, true], temperature: ['low', 'medium', 'high'] };
let total = 0, all8 = 0, goal = 0, min8 = 1e9, min7 = 1e9, skewedAll8 = 0, noExamplesAll8 = 0;
(function rec(i, c) {
  if (i === keys.length) {
    total++; const m = run(c).metrics;
    if (m.passed === 8) { all8++; min8 = Math.min(min8, m.tokens); if (c.examples === 'skewed') skewedAll8++; if (c.examples === 'none') noExamplesAll8++; }
    if (m.passed >= 7) min7 = Math.min(min7, m.tokens);
    if (L.GOAL.test(m)) goal++;
    return;
  }
  for (const v of values[keys[i]]) rec(i + 1, Object.assign({}, c, { [keys[i]]: v }));
})(0, {});
assert.equal(total, 3888);
assert.equal(all8, 3, 'only three prompts pass all eight tasks'); assert.equal(min8, 186); assert.equal(min7, 106);
assert.equal(skewedAll8, 0, 'no prompt with skewed examples passes everything'); assert.equal(noExamplesAll8, 1, 'the cheapest complete prompt uses no examples');
assert.equal(goal, 3, 'the goal (7 of 8 within 150 tokens) is met by three prompts');
assert.equal(L.GOAL.test(run(Object.assign({}, FULL, { context: 'none' })).metrics), true, 'giving up the detail-heavy task makes the goal reachable');
assert.equal(L.GOAL.test(run(FULL).metrics), false, 'the complete prompt is too long for the goal');

// every non-trivial component costs tokens, and tokens never go down when something is added
assert.ok(L.tokens(FULL) > L.tokens(Object.assign({}, FULL, { abstain: false })));
for (const [k, v] of Object.entries(L.OFF)) { const t = L.tokens(Object.assign({}, L.OFF, { [k]: k === 'temperature' ? v : (typeof v === 'boolean' ? true : FULL[k]) })); assert.ok(t >= L.tokens(L.OFF)); }
console.log(`PASS Prompt Lab: deterministic, each component needed by its tasks, skewed examples hurt, 3 of ${total} prompts pass everything (cheapest ${min8} tokens), goal met by ${goal}`);
