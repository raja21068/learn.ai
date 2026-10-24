"""Builds the data files of the Practice hub from the bundled third-party material and the lab definitions.

  python tools/build_practice_hub.py

Reads   third_party/ml-for-beginners/quizzes-en.json          (microsoft/ML-For-Beginners, MIT)
        third_party/ai-for-beginners/en/lesson-*.json         (microsoft/AI-For-Beginners, MIT)
        third_party/data-science-for-beginners/en/group-*.json (microsoft/Data-Science-For-Beginners, MIT)
        tools/practice_labs_def.py                            (original labs; MIT reference files are linked, some are bundled)
Writes  assets/practice-quizzes-data.js, assets/practice-labs-data.js, third_party/MANIFEST.json, THIRD_PARTY_NOTICES.md
Imported text is data: it is escaped when displayed and never executed."""
import glob, hashlib, json, pathlib, re, sys

sys.dont_write_bytecode = True
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from practice_labs_all import LABS

FIXED_ORDER = re.compile(r'\b(both|all of the above|none of the above|neither)\b', re.I)       # these options only make sense in place
TITLE = re.compile(r'^(.*?)\s*[:\-–]?\s*(pre|post)[\s\-]*(?:lecture|lesson)?[\s\-]*quiz\s*$', re.I)

SETS = [
    {'id': 'ml', 'name': 'Machine Learning', 'course': 'machine-learning', 'repo': 'microsoft/ML-For-Beginners', 'dir': 'third_party/ml-for-beginners',
     'files': ['third_party/ml-for-beginners/quizzes-en.json'], 'upstream': 'quiz-app/src/assets/translations/en.json'},
    {'id': 'ai', 'name': 'AI Foundations', 'course': 'ai-foundations', 'repo': 'microsoft/AI-For-Beginners', 'dir': 'third_party/ai-for-beginners',
     'files': sorted(glob.glob(str(ROOT / 'third_party/ai-for-beginners/en/lesson-*.json')), key=lambda p: int(re.search(r'lesson-(\d+)', p).group(1))),
     'upstream': 'etc/quiz-app/src/assets/translations/en/lesson-*.json'},
    {'id': 'ds', 'name': 'Data Science', 'course': None, 'repo': 'microsoft/Data-Science-For-Beginners', 'dir': 'third_party/data-science-for-beginners',
     'files': sorted(glob.glob(str(ROOT / 'third_party/data-science-for-beginners/en/group-*.json'))), 'upstream': 'quiz-app/src/assets/translations/en/group-*.json'},
]

def quiz_set(s):
    raw = []
    for f in s['files']:
        for block in json.loads((ROOT / f if not pathlib.Path(f).is_absolute() else pathlib.Path(f)).read_text(encoding='utf-8')):
            raw += block['quizzes']
    lessons, by = [], {}
    for q in raw:
        m = TITLE.match(q['title'].strip())
        assert m, 'unrecognised quiz title: ' + q['title']
        title, phase = m.group(1).strip(), m.group(2).lower()
        lesson = by.get(title)
        if lesson is None:
            lesson = by[title] = {'id': re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-'), 'title': title, 'quizzes': {}}
            lessons.append(lesson)
        assert phase not in lesson['quizzes'], ('duplicate quiz', title, phase)
        qs = []
        for x in q['quiz']:
            opts = [a['answerText'].strip() for a in x['answerOptions']]
            correct = [i for i, a in enumerate(x['answerOptions']) if str(a['isCorrect']).lower() == 'true']
            assert len(correct) == 1 and len(set(opts)) == len(opts) and x['questionText'].strip() and all(opts), (title, x['questionText'])
            qs.append({'q': x['questionText'].strip(), 'options': opts, 'answer': correct[0], 'fixed': any(FIXED_ORDER.search(o) for o in opts) or {o.lower() for o in opts} == {'true', 'false'}})
        lesson['quizzes'][phase] = {'sourceId': q['id'], 'questions': qs}
    assert len({l['id'] for l in lessons}) == len(lessons)
    return lessons

NOTEBOOK_SOURCES = [   # folder, repo, branch, licence, track, display name
    ('islp-labs', 'intro-stat-learning/ISLP_labs', 'main', 'BSD-2-Clause', 'Statistical learning', 'ISLP labs'),
    ('handson-ml3', 'ageron/handson-ml3', 'main', 'Apache-2.0', 'Machine learning', 'Hands-On ML'),
    ('nn-zero-to-hero', 'karpathy/nn-zero-to-hero', 'master', 'MIT', 'Deep learning', 'Zero to Hero'),
    ('langchain-academy', 'langchain-ai/langchain-academy', 'main', 'MIT', 'AI agents', 'LangChain Academy'),
]
TEXT_SOURCES = [
    ('agents-course', 'huggingface/agents-course', 'main', 'Apache-2.0', 'AI agents', 'Hugging Face Agents Course', lambda p: p.as_posix().startswith('units/en/') and p.suffix in ('.mdx', '.md')),
    ('ossu-computer-science', 'ossu/computer-science', 'master', 'MIT', 'Curriculum', 'OSSU curriculum', lambda p: p.name == 'README.md'),
    ('nn-zero-to-hero', 'karpathy/nn-zero-to-hero', 'master', 'MIT', 'Deep learning', 'Zero to Hero', lambda p: p.name == 'README.md'),
]
BROWSER_SAFE = {'numpy', 'pandas', 'matplotlib', 'scipy', 'sklearn', 'statistics', 'math', 'random', 'itertools', 'collections', 'functools', 're', 'json', 'typing', 'warnings', 'dataclasses', 'time', 'heapq', 'operator', 'string', 'copy', 'io', 'csv', 'pprint', 'abc', 'enum', 'textwrap', 'datetime', 'fractions', 'decimal', 'bisect', 'sys', 'os', 'pathlib', 'seaborn', 'sympy'}

def notebooks():
    out = []
    for folder, repo, branch, lic, track, name in NOTEBOOK_SOURCES:
        base = ROOT / 'third_party' / folder
        for f in sorted(base.rglob('*.ipynb')):
            nb = json.loads(f.read_text(encoding='utf-8'))
            cells = nb.get('cells', [])
            code = [c for c in cells if c.get('cell_type') == 'code']
            title = f.stem.replace('_', ' ').replace('-', ' ')
            for c in cells:
                if c.get('cell_type') == 'markdown':
                    m = re.search(r'^\s*#{1,3}\s+(.+?)\s*$', ''.join(c.get('source', [])), re.M)
                    if m:
                        title = re.sub(r'[*_`\[\]]|<[^>]+>|\(http[^)]*\)|!', '', m.group(1)).strip()[:90] or title
                        break
            imports = sorted({m.group(1) for c in code for line in ''.join(c.get('source', [])).splitlines() for m in [re.match(r'\s*(?:from|import)\s+([A-Za-z_][A-Za-z0-9_]*)', line)] if m and not line.lstrip().startswith(('%', '!'))})
            heavy = [i for i in imports if i not in BROWSER_SAFE and i not in {'IPython', 'builtins', 'ISLP'} and not i.startswith('_')]
            rel = str(f.relative_to(ROOT)).replace('\\', '/'); repo_path = str(f.relative_to(base)).replace('\\', '/')
            out.append({'id': (folder + '-' + repo_path.rsplit('.', 1)[0]).lower().replace('/', '-').replace('_', '-'), 'repo': repo, 'sourceName': name, 'license': lic, 'track': track,
                        'title': title, 'file': repo_path, 'local': rel, 'sizeKB': max(1, round(f.stat().st_size / 1024)), 'cells': len(cells), 'codeCells': len(code),
                        'imports': imports[:14], 'needs': heavy[:8], 'browser': 'likely' if not heavy else 'no',
                        'github': f'https://github.com/{repo}/blob/{branch}/{repo_path}', 'colab': f'https://colab.research.google.com/github/{repo}/blob/{branch}/{repo_path}'})
    return out

def texts():
    out = []
    for folder, repo, branch, lic, track, name, pred in TEXT_SOURCES:
        base = ROOT / 'third_party' / folder
        for f in sorted(p for p in base.rglob('*') if p.is_file()):
            rel_in = f.relative_to(base)
            if not pred(rel_in):
                continue
            body = f.read_text(encoding='utf-8')
            m = re.search(r'^#\s+(.+?)\s*$', body, re.M)
            title = re.sub(r'\s*\[\[[^\]]*\]\]', '', (m.group(1) if m else f.stem.replace('-', ' '))).strip()
            parts = rel_in.parts
            out.append({'id': (folder + '-' + '-'.join(parts)).rsplit('.', 1)[0].lower().replace('_', '-'), 'repo': repo, 'sourceName': name, 'license': lic, 'track': track,
                        'group': parts[2] if folder == 'agents-course' and len(parts) > 3 else '', 'title': title[:90], 'local': str(f.relative_to(ROOT)).replace('\\', '/'),
                        'sizeKB': max(1, round(f.stat().st_size / 1024)), 'github': f'https://github.com/{repo}/blob/{branch}/' + '/'.join(parts)})
    return out

def js(name, obj):
    return f"/* Generated by tools/build_practice_hub.py; do not edit. */\nwindow.{name} = {json.dumps(obj, ensure_ascii=False, indent=1)};\n"

def main():
    sets = []
    for s in SETS:
        lessons = quiz_set(s)
        sets.append({'id': s['id'], 'name': s['name'], 'course': s['course'], 'lessons': lessons,
                     'source': {'name': 'Microsoft ' + s['repo'].split('/')[1], 'url': 'https://github.com/' + s['repo'], 'license': 'MIT', 'copyright': 'Copyright (c) Microsoft Corporation', 'file': s['upstream'], 'licenseFile': s['dir'] + '/LICENSE'}})
    (ROOT / 'assets/practice-quizzes-data.js').write_text(js('PRACTICE_QUIZZES', {'sets': sets}), encoding='utf-8', newline='\n')
    labs = [{k: v for k, v in l.items() if k != 'mutants'} for l in LABS]
    (ROOT / 'assets/practice-labs-data.js').write_text(js('PRACTICE_LABS', labs), encoding='utf-8', newline='\n')
    nbs, txts = notebooks(), texts()
    (ROOT / 'assets/practice-notebooks-data.js').write_text(js('PRACTICE_NOTEBOOKS', {'notebooks': nbs, 'texts': txts}), encoding='utf-8', newline='\n')
    from practice_sources_def import SOURCES, CHECKED
    (ROOT / 'assets/practice-sources-data.js').write_text(js('PRACTICE_SOURCES', {'checked': CHECKED, 'sources': SOURCES}), encoding='utf-8', newline='\n')
    lines = [f'# Sources audit (checked {CHECKED})', '', 'Licences are as reported by the GitHub API (or read from the LICENSE file). `imported` files are bundled unchanged with their licence text; `linked` means no code or text was copied. This is practical guidance, not legal advice.', '',
             '| Repository | Licence | Status | Use | Why not copied |', '|---|---|---|---|---|']
    lines += [f"| [{s['repo']}]({s['url']}) | {s['license']} | {s['status']} | {s['used']} | {s['why']} |" for s in SOURCES]
    (ROOT / 'docs').mkdir(exist_ok=True)
    (ROOT / 'docs/SOURCES_AUDIT.md').write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\n')
    files = sorted(p for p in (ROOT / 'third_party').rglob('*') if p.is_file() and p.name != 'MANIFEST.json')
    manifest = {'note': 'SHA-256 of every bundled third-party file; checked by tests/practice-hub.test.cjs. Each file was downloaded from GitHub and its git blob hash was verified against the repository tree before it was added.',
                'files': {str(p.relative_to(ROOT)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}
    (ROOT / 'third_party/MANIFEST.json').write_text(json.dumps(manifest, indent=1) + '\n', encoding='utf-8', newline='\n')
    count = lambda st: sum(len(q['questions']) for l in st['lessons'] for q in l['quizzes'].values())
    rows = '\n'.join(f"| {count(st)} practice questions in {sum(len(l['quizzes']) for l in st['lessons'])} quizzes ({st['name']}) | [{st['source']['name']}]({st['source']['url']}), `{st['source']['file']}` | MIT, {st['source']['copyright']} | `{st['source']['licenseFile'].rsplit('/', 1)[0]}/` (data copied unchanged), `assets/practice-quizzes-data.js` (generated) |" for st in sets)
    code = [('TheAlgorithms/Python', 'thealgorithms-python', 'MIT, Copyright (c) 2016-2022 TheAlgorithms and contributors'), ('aimacode/aima-python', 'aima-python', 'MIT, Copyright (c) 2016 aima-python contributors'),
            ('ShangtongZhang/reinforcement-learning-an-introduction', 'sutton-barto-python', 'MIT, Copyright (c) 2019 Shangtong Zhang'), ('karpathy/micrograd', 'micrograd', 'MIT, Copyright (c) 2020 Andrej Karpathy'),
            ('intro-stat-learning/ISLP_labs', 'islp-labs', 'BSD 2-Clause, Copyright (c) 2023 intro-stat-learning'), ('ageron/handson-ml3', 'handson-ml3', 'Apache-2.0'),
            ('karpathy/nn-zero-to-hero', 'nn-zero-to-hero', 'MIT, Copyright (c) 2022 Andrej Karpathy'), ('langchain-ai/langchain-academy', 'langchain-academy', 'MIT, Copyright (c) 2026 LangChain, Inc.'),
            ('huggingface/agents-course', 'agents-course', 'Apache-2.0'), ('ossu/computer-science', 'ossu-computer-science', 'MIT, Copyright (c) 2015-2023 Open Source Society University')]
    kinds = {'islp-labs': 'Lab notebooks', 'handson-ml3': 'Chapter notebooks', 'nn-zero-to-hero': 'Lecture notebooks and README', 'langchain-academy': 'LangGraph notebooks', 'agents-course': 'English course text', 'ossu-computer-science': 'Curriculum README'}
    default_kind = 'Reference code files shown as "compare with"'
    crow = '\n'.join(f"| {kinds.get(d, default_kind)} | [{r}](https://github.com/{r}) | {lic} | `third_party/{d}/` (unchanged) |" for r, d, lic in code)
    (ROOT / 'THIRD_PARTY_NOTICES.md').write_text(f"""# Third-party material

The Practice hub (`#/practice`) uses the following open-source material, all under permissive licences (MIT, BSD 2-Clause, Apache-2.0). Every file is copied unchanged and its licence text is bundled next to it. Apache-2.0 requires stating changes: there are none, the files are byte-for-byte the originals (see `third_party/MANIFEST.json`).

| What | Source | Licence | Where in this repository |
|---|---|---|---|
{rows}
{crow}

Repositories with no licence file or an unclear or mixed licence (for example OSTEP, Build Your Own X, Dive into Deep Learning) are only linked, and so are files that were too large to bundle. See `#/practice/sources` and `docs/SOURCES_AUDIT.md`.

The lab prompts, starter code, hidden tests and sample solutions were written for this site. They are not copied from the upstream repositories.
The source code is the property of its authors; this site is not affiliated with any of the projects or companies named above.
`third_party/MANIFEST.json` lists the SHA-256 of every bundled file. Rebuild the generated files with `python tools/build_practice_hub.py`.
""", encoding='utf-8', newline='\n')
    print(' | '.join(f"{st['id']}: {len(st['lessons'])} lessons, {count(st)} questions" for st in sets), f"| {len(labs)} labs | {len(files)} third-party files")

if __name__ == '__main__':
    main()
