"""Render a LOW-RESOLUTION, SILENT preview of the cascade storyboard with ai-youtube-studio's own fixed templates.

It does what `ai-studio draft` + `ai-studio render-preview` do, except that the scenes come from video/out/cascade-cost.scenes.json
instead of an AI agent: each scene is turned into Manim code by studio.animation.build_scene (text is data, never executable
Python), written to <data>/scenes/, rendered scene by scene with `manim -ql`, and joined with FFmpeg by studio.pipeline.render.

Run it with the studio's isolated environment, never the global Python:
    D:/AutoResearch/studio-venv/Scripts/python.exe video/render-preview.py
Everything is written under video/studio-data/ (git-ignored). Nothing is written inside the studio's own folder.
Not production: no narration, no 4K, no captions, no human review (the studio's own QA record says so)."""
import asyncio, json, os, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDIO_SRC = Path(os.environ.get("STUDIO_SRC", "D:/AutoResearch/ai-youtube-studio-v0.6-hybrid/ai-youtube-studio-v0.6"))
DATA = HERE / "studio-data"
os.environ["STUDIO_DATA_DIR"] = str(DATA)
os.environ["STUDIO_ENABLE_EXECUTION"] = "true"                  # allows only the studio's own Manim render step, in this process
os.environ["PATH"] = str(Path(sys.executable).parent) + os.pathsep + os.environ["PATH"]   # so that `manim` is the one in this environment
sys.dont_write_bytecode = True                                  # leave no __pycache__ inside the studio's folder
sys.path.insert(0, str(STUDIO_SRC))

from studio.animation import build_scene                       # noqa: E402
from studio.models import Project, Scene, Source, Status       # noqa: E402
from studio.pipeline import digest, preflight, render           # noqa: E402
from studio.storage import directory, save                     # noqa: E402


def main():
    # optional: <storyboard file name in video/out> <project id>; the lesson-templates storyboard needs STUDIO_SRC=video/studio-patched
    name = sys.argv[1] if len(sys.argv) > 1 else "cascade-cost.scenes.json"
    project_id = sys.argv[2] if len(sys.argv) > 2 else "cascade-cost-preview"
    board = json.loads((HERE / "out" / name).read_text(encoding="utf-8"))
    scenes = [Scene(id=s["id"], objective=s["objective"], narration=s["narration"], visual_type=s["visual_type"], expression=s["expression"], duration_seconds=s["duration_seconds"], sources=s["sources"],
                    **({"data": s["data"]} if s.get("data") else {})) for s in board["scenes"]]
    project = Project(id=project_id, topic=board["topic"], audience=board["audience"], scenes=scenes,
                      script="\n\n".join(s.narration for s in scenes),
                      sources=[Source(title="LLM Service Lab engine (assets/llm-lab.js)", verified=False)])
    out = directory(project.id)
    (out / "scenes").mkdir(exist_ok=True)
    for sc in project.scenes:                                   # exactly what studio.pipeline.draft does after the agent step
        sc.code = build_scene(sc)
        (out / "scenes" / f"{sc.id}.py").write_text(sc.code, encoding="utf-8")
    project.status = Status.drafted
    save(project)
    print("preflight:", json.dumps(preflight(project)["issues"]))
    project = asyncio.run(render(project))
    print("status:", project.status.value, "| qa:", json.dumps(project.qa))
    print("preview:", out / "preview.mp4")


if __name__ == "__main__":
    main()
