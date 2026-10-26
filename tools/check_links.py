"""Checks that every relative link and image in the project's Markdown files points at a file that exists.
Run: python tools/check_links.py        (exit code 1 if anything is broken)
External (http) links are not fetched; anchors inside the same file are not checked."""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINK = re.compile(r'(?<!\\)!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
HTML = re.compile(r'(?:src|href)="([^"#]+)(?:#[^"]*)?"')
SKIP_DIRS = {'third_party', 'node_modules', '.git', '_backup_old_site', 'artifacts', 'agents-course'}


def files():
    for p in sorted(ROOT.rglob('*.md')):
        if SKIP_DIRS & set(p.relative_to(ROOT).parts):
            continue
        yield p


def main():
    bad, checked = [], 0
    for md in files():
        text = md.read_text(encoding='utf-8')
        text = re.sub(r'```.*?```', '', text, flags=re.S)           # links inside code blocks are examples
        text = re.sub(r'`[^`\n]*`', '', text)
        for target in LINK.findall(text) + HTML.findall(text):
            t = target.split('#')[0].strip()
            if not t or re.match(r'^[a-z][a-z0-9+.-]*:', t, re.I) or t.startswith('/'):
                continue
            checked += 1
            if not (md.parent / t).exists():
                bad.append(f'{md.relative_to(ROOT)}: {target}')
    for b in bad:
        print('BROKEN', b)
    print(f'{checked} relative links checked in {len(list(files()))} Markdown files: {len(bad)} broken')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
