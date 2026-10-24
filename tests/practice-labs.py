"""Proves that every hands-on algorithm lab of the Practice hub grades correctly, in real Python:
the sample solution passes, the starter fails, and each deliberately wrong variant fails. Also checks hints, attribution and that the
bundled upstream reference file exists. Run: python tests/practice-labs.py"""
import ast, json, pathlib, sys, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
sys.dont_write_bytecode = True
from practice_labs_def import LABS

def run(code, test):
    ns = {}
    exec(compile(code, '<learner>', 'exec'), ns)
    exec(compile(test, '<hidden-test>', 'exec'), ns)

def passes(code, test):
    try:
        run(code, test); return True
    except BaseException:
        return False

ids = [l['id'] for l in LABS]
assert len(ids) == len(set(ids)) and len(LABS) >= 15, len(LABS)
slow = []
for l in LABS:
    t0 = time.time()
    assert passes(l['solution'], l['test']), f"{l['id']}: the sample solution must pass its own test"
    elapsed = time.time() - t0
    assert elapsed < 8, f"{l['id']}: test takes {elapsed:.1f}s, too slow for a browser"
    slow.append((elapsed, l['id']))
    assert not passes(l['starter'], l['test']), f"{l['id']}: the starter must NOT pass"
    assert len(l['mutants']) >= 2, f"{l['id']}: needs at least two wrong variants"
    for i, m in enumerate(l['mutants']):
        assert not passes(m, l['test']), f"{l['id']}: wrong variant {i} passes the tests, so the tests are too weak:\n{m}"
    for code in (l['starter'], l['solution'], l['test'], *l['mutants']): ast.parse(code)
    assert f"def {l['fn']}(" in l['starter'] and f"def {l['fn']}(" in l['solution'], l['id']
    assert 'TODO' in l['starter'], l['id'] + ' starter should say what to do'
    assert len(l['hints']) >= 2 and all(len(h) > 20 for h in l['hints']), l['id']
    assert l['level'] in ('Beginner', 'Intermediate', 'Advanced') and l['prompt'].count('<code>') >= 1
    r = l['reference']
    assert r['license'] == 'MIT' and r['url'].startswith('https://github.com/TheAlgorithms/Python/blob/master/')
    assert (ROOT / r['local']).is_file(), 'missing bundled reference ' + r['local']
    # the learner must not be able to pass by calling the reference solution through the standard library only
    for banned in ('sorted(', '.sort()'):
        if l['track'] == 'Sorting': assert banned not in l['solution'], f"{l['id']}: sample solution should not use {banned}"
# the shared licence texts must be present
assert 'MIT License' in (ROOT / 'third_party/thealgorithms-python/LICENSE.md').read_text(encoding='utf-8')
print(f"PASS practice labs: {len(LABS)} labs; solution passes, starter and {sum(len(l['mutants']) for l in LABS)} wrong variants fail; slowest {max(slow)[0]:.1f}s ({max(slow)[1]})")
