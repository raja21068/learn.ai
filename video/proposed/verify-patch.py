"""Apply lesson-templates.patch to a TEMPORARY COPY of the studio and run the studio's tests there.

The studio's own folder is only read (copied); a before/after fingerprint proves it was not changed.
    D:/AutoResearch/studio-venv/Scripts/python.exe video/proposed/verify-patch.py
Optional: STUDIO_SRC=<studio folder>. Needs git (for `git apply`) on PATH."""
import hashlib, os, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = Path(os.environ.get("STUDIO_SRC", "D:/AutoResearch/ai-youtube-studio-v0.6-hybrid/ai-youtube-studio-v0.6"))
PATCH = HERE / "lesson-templates.patch"


def fingerprint(root: Path) -> str:
    h = hashlib.sha256()
    for p in sorted(root.rglob("*")):
        h.update(str(p.relative_to(root)).encode())
        if p.is_file():
            h.update(p.read_bytes())
            h.update(str(p.stat().st_mtime_ns).encode())
    return h.hexdigest()


def run(cmd, cwd, **env):
    return subprocess.run(cmd, cwd=cwd, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1", **env}, capture_output=True, text=True)


def main():
    before = fingerprint(SRC)
    tmp = Path(tempfile.mkdtemp(prefix="studio-patch-check-"))
    work = tmp / "studio"
    try:
        shutil.copytree(SRC, work, ignore=shutil.ignore_patterns("__pycache__", ".pytest_cache", "*.egg-info", ".git"))
        data = str(tmp / "data")
        pytest = [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider"]
        base = run(pytest, work, STUDIO_DATA_DIR=data)
        print("before the patch :", base.stdout.strip().splitlines()[-1])
        check = run(["git", "apply", "--check", "-p1", str(PATCH)], work)
        if check.returncode:
            print("patch does not apply:", check.stderr)
            return 1
        applied = run(["git", "apply", "-p1", str(PATCH)], work)
        assert applied.returncode == 0, applied.stderr
        after = run(pytest, work, STUDIO_DATA_DIR=data)
        print("after the patch  :", after.stdout.strip().splitlines()[-1])
        ok = base.returncode == 0 and after.returncode == 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    untouched = fingerprint(SRC) == before
    print("studio folder unchanged (content and timestamps):", untouched)
    return 0 if ok and untouched else 1


if __name__ == "__main__":
    sys.exit(main())
