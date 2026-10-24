# Lesson explainer videos: first milestone

**Status (2026-10-24):** a storyboard for one explainer, "Why did the cascade cost five times more?", generated from the LLM Service Lab engine in the **scene format of ai-youtube-studio v0.6**, and a **low-resolution, silent preview rendered with the studio's own fixed templates** (see "Preview render" below). Nothing has been narrated, captioned or uploaded.

## What is here
| File | What it is |
|---|---|
| `build-storyboards.cjs` | Builds the storyboard from `assets/llm-lab.js`, so every number comes from tested code |
| `out/cascade-cost.scenes.json` | 7 scenes (`id`, `objective`, `narration`, `visual_type`, `duration_seconds`, `sources`), about 112 seconds |
| `out/cascade-cost.script.md` | The same script for a human to read and approve |
| `../tests/video-storyboard.test.cjs` | Checks the scene format, the 100-character limit of text scenes, that **every number in the script comes from the engine**, that the claims are true, and that the files are not stale |

Regenerate with `node video/build-storyboards.cjs`; test with `node tests/video-storyboard.test.cjs`.

## What this machine already has (read-only check)
Python 3.13 (miniconda; the studio needs 3.11 or newer, and the default 3.10 is too old), FFmpeg and FFprobe, LaTeX (MiKTeX) and Ollama. **Not installed:** Manim and the studio's own Python libraries.

## Where the studio does not fit yet
- **No bar chart.** The studio has eight fixed templates. Cost and latency comparisons need a `bars` template, which does not exist.
- **The flow template is fixed** to "Input, Process, Output", so it cannot say "small model, large model".
- **Text scenes show only the first 100 characters** of their objective, so the narration carries the content.
- **Whole projects must run 300 to 600 seconds** (`VideoConfig.target_seconds`), so a 2-minute lesson clip cannot be a studio Project today.

## Proposed changes (written as a patch; the studio folder was not touched)
1. A `bars` template and `Scene.data` field (a small dict of labelled non-negative numbers, validated like the existing `expression` field, never executed).
2. Optional labels for the `flow` template, validated with strict character rules.
3. Scene length taken from the narration (`duration_seconds`).
Items 1 to 3 are now in `proposed/lesson-templates.patch` with 56 new tests; see `proposed/README.md`. Still **not** done: a `clip` mode that allows 60 to 180 seconds for a whole project (the 300 to 600 second rule remains).
All of them keep the studio's rule that model text is data and never executable Python.

## Environment (created 2026-10-24, with your approval)
`D:\AutoResearch\studio-venv` (Python 3.13, about 52 MB, outside both projects) holds only the studio's own dependencies: fastapi 0.162, uvicorn 0.54, pydantic 2.14, httpx 0.28, python-multipart 0.0.32, pypdf 6.21 and pytest 9.1, installed within the version ranges of the studio's `pyproject.toml`.
The studio's own tests pass there: **32 passed**. They were run with bytecode, cache and data output redirected, and afterwards no file or folder inside `ai-youtube-studio-v0.6-hybrid` is newer than the environment and none of `__pycache__`, `.pytest_cache`, `*.egg-info`, `data` exists there. The studio itself was **not** installed as a package (no editable install), so run its tests like this:
```bash
cd D:/AutoResearch/ai-youtube-studio-v0.6-hybrid/ai-youtube-studio-v0.6
set PYTHONDONTWRITEBYTECODE=1 & set STUDIO_DATA_DIR=D:/AutoResearch/studio-venv/test-data
D:/AutoResearch/studio-venv/Scripts/python.exe -m pytest -q -p no:cacheprovider
```
Later the same day, with your approval, **Manim Community 0.22.0** was added to this environment only (the global Python is untouched), from prebuilt wheels with one exception: `srt` 3.5.3 has no wheel, so its source package was downloaded, its SHA-256 checked, its `setup.py` read (a plain setuptools call) and then installed from that local copy. Still **not installed:** Kokoro, the YouTube adapter.

## Preview render
`D:/AutoResearch/studio-venv/Scripts/python.exe video/render-preview.py` builds the project from `out/cascade-cost.scenes.json`, turns each scene into Manim code with the studio's own `build_scene`, renders it with `manim -ql` through the studio's own `render()` (which requires `STUDIO_ENABLE_EXECUTION=true`, set only inside that process), and joins the clips with FFmpeg. Everything is written under `video/studio-data/cascade-cost-preview/` (git-ignored): `project.json`, `scenes/*.py`, `renders/*.mp4`, `media/` (37 Manim working files), `clips.txt` and `preview.mp4`. Nothing was written inside the studio's folder, the LearningAi root or your home folder.

**Result (checked with ffprobe and by looking at frames):** `preview.mp4` is 29.0 s, 854x480, 30 fps, H.264, 250 KB, **no audio**, 7 clips of 4 to 5 seconds. The numbers on screen are right. But it is a slideshow, not yet an explainer:
- **The "setup" scene is misleading.** The studio's `flow` template is fixed to "Input, Process, Output", so it does not show "small model, then large model".
- **The timing does not follow the narration.** The script needs about 112 seconds to read; each clip lasts 4 to 5 seconds, because the templates use fixed run times and ignore `duration_seconds`. Voice-over would not line up.
- **Every other scene is a single line of text** (a `text` scene shows the first 100 characters of its objective).
- The studio's own QA record says `production_ready: false`, and the preflight flagged "Unverified sources" (the source is the lab engine, which a person has not signed off as a source).
So the pipeline works end to end, but the content needs the template changes proposed above (bars, labelled flow, timing from narration length) before it is worth showing to learners.

## Preview with the proposed templates (2026-10-24)
`video/studio-patched/` (git-ignored) is a **separate copy** of the studio with `proposed/lesson-templates.patch` applied; its tests pass (88). The original studio folder is untouched (checked by `proposed/verify-patch.py`). `node video/build-storyboards.cjs` also writes `out/cascade-cost.lesson-templates.scenes.json` (8 scenes, about 121 s: the cost and latency bars use the engine's values, the setup flow is labelled Request / Small model / Large model, and each `duration_seconds` follows its narration). Guarded by `tests/video-lesson-templates.test.cjs`.
```bash
STUDIO_SRC=D:/AutoResearch/LearningAi/video/studio-patched D:/AutoResearch/studio-venv/Scripts/python.exe video/render-preview.py cascade-cost.lesson-templates.scenes.json cascade-lesson-templates
```
**Result (ffprobe and frames):** `studio-data/cascade-lesson-templates/preview.mp4` is 121.2 s, 854x480, 30 fps, H.264, 473 KB, no audio. Every clip lasts exactly its `duration_seconds` (11.6 to 18.4 s; the first preview was 29 s). The bars show $0.0148 against $0.0755 and 1,298 against 3,535 ms; the flow shows the right labels.
**Second pass (same day):** `medium`, `why`, `trap` and `lesson` now have visuals too, so only the title card is text. Five bar scenes (quality 92.5% and 92.5%; cost; latency; 21 kept against 19 escalated; 18 confident and right against 3 confident and wrong) and two flow scenes (setup, and the lesson checklist Measure traffic / Right-size first / Cascade if easy). Every count comes from the engine's `path` and `correct` fields (`facts().stayed`, `smallRight`), and the test checks that 21 + 19 = 40 and 18 + 3 = 21. Rendered to `studio-data/cascade-lesson-visuals/preview.mp4`: 124.0 s, 854x480, 30 fps, 507 KB, no audio; every clip lasts exactly its `duration_seconds` (10.0 to 19.2 s).
**Still a draft:** the visuals are static end states (bars appear and sit there for up to 15 s), bars all use one fixed palette (a "wrong" bar is not red), the setup flow cannot show the branch, "Confident and right/wrong" labels sit close together, and there is no audio, no captions and no human review (`production_ready: false`). The next templates worth building are listed in the plan (request grid first).

## Next steps that still need your approval (these change the machine)
Manim would be installed into the same environment only for rendering a preview, ideally on a sandboxed worker as the studio's own docs require. Reading the two Manim "skill" packages before installing them is still advisable.

## Not done
No render, no voice-over (Kokoro or ElevenLabs), no captions, no 4K, no upload, no review by a person of the finished video. The script is a draft for a human to approve.
