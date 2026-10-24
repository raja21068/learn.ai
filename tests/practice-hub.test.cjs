/* Guards the Practice hub data: every bundled third-party file still matches the SHA-256 recorded when it was added, the generated
   quiz data equals the bundled MIT source (nothing invented or edited), every quiz is well-formed, labs are attributed and complete,
   and the generated files are current. Run: node tests/practice-hub.test.cjs */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p));
const load = f => { const ctx = { window: {} }; ctx.window = ctx; vm.runInNewContext(read(f).toString('utf8'), ctx); const out = {}; for (const k of Object.keys(ctx)) if (/^PRACTICE_/.test(k)) out[k] = JSON.parse(JSON.stringify(ctx[k])); return out; };

// 1. third-party files are intact and licensed
const manifest = JSON.parse(read('third_party/MANIFEST.json'));
for (const [file, sha] of Object.entries(manifest.files)) assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'), sha, file + ' changed since it was bundled');
assert.ok(Object.keys(manifest.files).length >= 25);
for (const lic of ['third_party/ml-for-beginners/LICENSE', 'third_party/thealgorithms-python/LICENSE.md']) assert.match(read(lic).toString(), /MIT License/);
assert.match(read('third_party/ml-for-beginners/LICENSE').toString(), /Microsoft Corporation/);
const notices = read('THIRD_PARTY_NOTICES.md').toString();
assert.match(notices, /ML-For-Beginners/); assert.match(notices, /TheAlgorithms/); assert.match(notices, /not affiliated/);

// 2. quiz data = the bundled sources, reshaped (three sets)
const sourceFiles = {
  ml: ['third_party/ml-for-beginners/quizzes-en.json'],
  ai: fs.readdirSync(path.join(ROOT, 'third_party/ai-for-beginners/en')).filter(f => /^lesson-\d+\.json$/.test(f)).map(f => 'third_party/ai-for-beginners/en/' + f),
  ds: fs.readdirSync(path.join(ROOT, 'third_party/data-science-for-beginners/en')).filter(f => /^group-\d+\.json$/.test(f)).map(f => 'third_party/data-science-for-beginners/en/' + f)
};
const { PRACTICE_QUIZZES: Q } = load('assets/practice-quizzes-data.js');
assert.deepEqual(Q.sets.map(s => s.id), ['ml', 'ai', 'ds']);
const expected = { ml: [26, 52, 156], ai: [24, 48, 145], ds: [20, 40, 120] };
let flatCount = 0;
for (const set of Q.sets) {
  assert.equal(set.source.license, 'MIT'); assert.match(set.source.url, /^https:\/\/github\.com\/microsoft\//); assert.match(set.source.copyright, /Microsoft/);
  assert.ok(fs.existsSync(path.join(ROOT, set.source.licenseFile)), 'licence file for ' + set.id);
  const src = sourceFiles[set.id].flatMap(f => JSON.parse(read(f).toString('utf8')).flatMap(b => b.quizzes));
  let quizzes = 0, questions = 0;
  assert.equal(new Set(set.lessons.map(l => l.id)).size, set.lessons.length, 'lesson ids unique in ' + set.id);
  for (const l of set.lessons) {
    assert.match(l.id, /^[a-z0-9-]+$/); assert.ok(Object.keys(l.quizzes).length >= 1);
    for (const [phase, qz] of Object.entries(l.quizzes)) {
      assert.ok(phase === 'pre' || phase === 'post'); assert.ok(qz.questions.length >= 2, `${set.id}/${l.id} ${phase}`);
      const orig = src.find(x => x.id === qz.sourceId && x.quiz[0].questionText.trim() === qz.questions[0].q);
      assert.ok(orig, `${set.id}/${l.id} ${phase}: no matching source quiz`);
      assert.equal(orig.quiz.length, qz.questions.length); quizzes++;
      qz.questions.forEach((q, i) => {
        const o = orig.quiz[i]; questions++;
        assert.equal(q.q, o.questionText.trim());
        assert.deepEqual(Array.from(q.options), o.answerOptions.map(a => a.answerText.trim()), 'options must be unchanged and in source order');
        assert.equal(String(o.answerOptions[q.answer].isCorrect).toLowerCase(), 'true', 'the stored answer must be the source answer');
        assert.equal(o.answerOptions.filter(a => String(a.isCorrect).toLowerCase() === 'true').length, 1);
        assert.equal(new Set(q.options).size, q.options.length, 'options must be distinct');
        assert.ok(q.options.length >= 2 && q.options.length <= 4);
        if (q.options.some(t => /(both|all of the above|none of the above|neither)/i.test(t))) assert.equal(q.fixed, true, 'order-dependent options must not be shuffled');
      });
    }
  }
  assert.deepEqual([set.lessons.length, quizzes, questions], expected[set.id], set.id);
  assert.equal(quizzes, src.length, set.id + ': every source quiz is used exactly once');
  flatCount += questions;
}
assert.equal(flatCount, 421);

// 3. labs
const { PRACTICE_LABS: LABS } = load('assets/practice-labs-data.js');
assert.equal(LABS.length, 27); assert.equal(new Set(LABS.map(l => l.id)).size, LABS.length);
for (const l of LABS) {
  for (const k of ['id', 'title', 'track', 'level', 'concept', 'prompt', 'fn', 'starter', 'solution', 'test']) assert.ok(typeof l[k] === 'string' && l[k].length > 3, l.id + ' ' + k);
  const defines = c => c.includes('def ' + l.fn + '(') || c.includes('class ' + l.fn); assert.ok(defines(l.starter) && defines(l.solution), l.id);
  assert.equal(l.mutants, undefined, 'wrong variants must not be shipped to the browser');
  assert.ok(l.hints.length >= 2);
  assert.ok(l.reference.url.startsWith('https://github.com/' + l.reference.repo + '/blob/'), l.id);
  if (l.reference.local) { assert.match(l.reference.license, /^(MIT|Apache-2\.0|BSD-2-Clause)$/); assert.ok(fs.existsSync(path.join(ROOT, l.reference.local)), 'bundled reference missing: ' + l.reference.local); } else assert.match(l.reference.license, /^(MIT|Apache-2\.0|BSD-\d-Clause)$/);
  assert.ok(!/\b(import os|import subprocess|open\(|__import__|eval\(|exec\()/.test(l.test + l.solution + l.starter), l.id + ' must not touch files or the system');
}

// 4. the generated files are current: regenerate in memory by running the same generator is Python-side; here we check the sources agree
const stale = (gen, ...deps) => deps.some(d => fs.statSync(path.join(ROOT, d)).mtimeMs > fs.statSync(path.join(ROOT, gen)).mtimeMs + 2000);
assert.ok(!stale('assets/practice-labs-data.js', 'tools/practice_labs_def.py'), 'tools/practice_labs_def.py is newer than assets/practice-labs-data.js: run python tools/build_practice_hub.py');
assert.ok(!stale('assets/practice-quizzes-data.js', 'third_party/ml-for-beginners/quizzes-en.json'), 'quiz data is stale: run python tools/build_practice_hub.py');
// 5. the sources page: every bundled third-party folder is declared imported, licences are named, link-only entries explain themselves
const { PRACTICE_SOURCES: SRC } = load('assets/practice-sources-data.js');
const bundled = new Set(Object.keys(manifest.files).map(f => f.split('/')[1]));
assert.ok(SRC.sources.length >= 25); assert.equal(new Set(SRC.sources.map(s => s.repo)).size, SRC.sources.length);
for (const s of SRC.sources) {
  assert.ok(['imported', 'linked'].includes(s.status)); assert.ok(s.license && s.url.startsWith('https://github.com/' + s.repo));
  if (s.status === 'linked') assert.ok(s.why.length > 20, s.repo + ' must say why it is only linked');
  if (s.status === 'imported') assert.ok(['MIT', 'BSD-2-Clause', 'Apache-2.0'].includes(s.license), s.repo + ': only permissively licensed material is copied');
  if (['NOASSERTION', 'none'].includes(s.license)) assert.equal(s.status, 'linked', s.repo + ': unclear licence means link only');
}
assert.equal(SRC.sources.filter(s => s.status === 'imported').length, bundled.size - 0, 'every bundled folder is an imported source: ' + [...bundled]);
for (const lab of LABS) { const src = SRC.sources.find(s => s.repo === lab.reference.repo); assert.ok(src, lab.id + ': reference repository missing from the sources page'); if (lab.reference.local) assert.equal(src.status, 'imported', lab.id + ': a bundled reference needs an imported source'); }
// 6. notebooks and course texts: real, unmodified, licensed files; links point at the right repository; never executed here
const { PRACTICE_NOTEBOOKS: NB } = load('assets/practice-notebooks-data.js');
assert.equal(NB.notebooks.length, 65); assert.equal(NB.texts.length, 79);
const PERMISSIVE = ['MIT', 'BSD-2-Clause', 'Apache-2.0'];
for (const n of NB.notebooks) {
  assert.ok(manifest.files[n.local], n.id + ' must be in the manifest (hash-checked above)');
  const nb = JSON.parse(read(n.local).toString('utf8'));
  assert.ok(nb.nbformat >= 4 && Array.isArray(nb.cells), n.id + ' is not a notebook'); assert.equal(nb.cells.length, n.cells);
  assert.ok(PERMISSIVE.includes(n.license)); assert.ok(n.sizeKB <= 1000, n.id + ' is larger than the 1 MB limit');
  assert.equal(n.github.startsWith('https://github.com/' + n.repo + '/blob/'), true);
  assert.equal(n.colab, n.github.replace('https://github.com/', 'https://colab.research.google.com/github/'));
  assert.ok(['likely', 'no'].includes(n.browser)); assert.equal(n.browser === 'likely', n.needs.length === 0);
  const src = SRC.sources.find(s => s.repo === n.repo); assert.ok(src && src.status === 'imported', n.id + ': its repository must be listed as imported');
}
assert.equal(new Set(NB.notebooks.map(n => n.id)).size, NB.notebooks.length); assert.equal(new Set(NB.texts.map(t => t.id)).size, NB.texts.length);
for (const t of NB.texts) { assert.ok(manifest.files[t.local], t.id); assert.ok(PERMISSIVE.includes(t.license)); assert.ok(t.title.length > 1 && !/\[\[/.test(t.title), t.id + ' title'); assert.ok(SRC.sources.find(s => s.repo === t.repo && s.status === 'imported'), t.id); }
for (const repo of ['intro-stat-learning/ISLP_labs', 'ageron/handson-ml3', 'karpathy/nn-zero-to-hero', 'langchain-ai/langchain-academy', 'huggingface/agents-course', 'ossu/computer-science']) {
  const folder = SRC.sources.find(s => s.repo === repo); assert.equal(folder.status, 'imported', repo);
}
// nothing in the page code can run a notebook or its outputs: the page only links, downloads and shows text
const hubSource = read('assets/practice-hub.js').toString('utf8');
assert.ok(!/innerHTML\s*=\s*[^;]*nbformat|\.outputs|eval\(|new Function\(/.test(hubSource), 'the hub must never render or execute notebook content');
console.log(`PASS notebooks: ${NB.notebooks.length} notebooks and ${NB.texts.length} texts identical to their sources, all permissive, ${NB.notebooks.filter(n => n.browser === 'likely').length} flagged as browser-runnable`);
console.log(`PASS practice hub data: ${Object.keys(manifest.files).length} bundled files verified, ${Q.sets.length} quiz sets / ${flatCount} questions identical to the MIT sources, ${LABS.length} attributed labs, ${SRC.sources.length} sources audited`);
