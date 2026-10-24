# Proposed studio changes (a patch, not applied)

`lesson-templates.patch` is a proposal for **ai-youtube-studio v0.6**. It has **not** been applied: the studio folder was only read and copied. Apply it yourself, in a copy or after review, with:

```bash
cd <studio folder>
git apply --check -p1 <path>/lesson-templates.patch
git apply -p1 <path>/lesson-templates.patch
```

## What it changes (9 files, +346/-6 lines)
| Change | Files |
|---|---|
| `Scene.data`: an optional plain dict of short labels and numbers | `studio/models.py` |
| New `bars` template (skill `bar-comparison`): 2 to 6 labelled non-negative numbers, optional title and unit (`$`, `ms`, `%`). Not offered to the AI planner | `studio/animation.py`, `studio/skills.py`, `skills/bar-comparison/SKILL.md` |
| `flow` accepts `data.labels` (2 to 4 labels). Without `data` it still shows Input, Process, Output | `studio/animation.py` |
| `duration_seconds` (3 to 90) now stretches the final wait, so a scene lasts about as long as its narration | `studio/animation.py` |
| `plan_collaboration` reports invalid data or duration before anything renders | `studio/skill_collaboration.py` |
| Two existing tests now expect 9 skills; 56 new tests; short docs | `tests/`, `docs/LESSON_TEMPLATES.md` |

## Safety rules kept
Model text stays data and is never executed. Labels allow only letters, digits, space and `. , : % $ ( ) / + & -` (quotes, backslashes, brackets and non-ASCII are rejected, not escaped); numbers must be finite and between 0 and 1,000,000,000; `data` is rejected on any other visual type; unknown keys are rejected.

## Verified
`python video/proposed/verify-patch.py` (run with the studio environment) copies the studio to a temp folder, runs its tests (**32 pass**), applies the patch, runs them again (**88 pass**: the 32 plus 56 new), deletes the copy and checks that the studio folder is byte-for-byte and timestamp-for-timestamp unchanged. A test also pins the SHA-256 of the code all eight existing templates generate, so they are proven backward compatible.

Rendered from the patched copy: a 2-bar cost chart with `duration_seconds=10` came out at exactly 10.0 s; a 3-bar latency chart and a `Request / Small model / Large model` flow rendered with the right numbers and labels.

## Not covered
- `duration_seconds` is computed from the template's fixed animation times, not from the length of spoken audio; there is still no voice-over or caption alignment.
- Bars only (no grouped or stacked bars, no axis ticks); labels are ASCII only.
- The whole-project 300 to 600 second rule (`VideoConfig.target_seconds`) is **not** changed, so a 2-minute lesson clip still cannot be a studio `Project` through the studio's own API. That would be a separate, third change.
