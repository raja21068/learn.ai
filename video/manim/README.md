# Manim-based animation source (optional)

The website's interactive simulations are SVG/JavaScript because a GitHub Pages visitor can change parameters without a server or API key. Manim is a **video-rendering** library; its output is useful for narrated explanations but is not itself an editable interactive graph.

Four original Manim Community scenes are provided in `learning_scenes.py`:

- `NormalizeOrderLines` — key dependencies and 3NF-oriented decomposition (Database Systems, chapter 6)
- `TransactionLostUpdate` — two-transaction lost-update schedule (Database Systems, chapter 10)
- `TDUpdate` — TD(0) calculation (Sutton & Barto, chapter 6)
- `GradientSteps` — toy learning-rate trajectories (Dive into Deep Learning, chapter 3)

These scenes redraw concepts using original examples, not published figures. They **have been syntax-checked, but not rendered in this environment**, because Manim and its dependencies are not installed. To render on a compatible local machine, install Manim Community Edition and its FFmpeg/LaTeX requirements; then:

```bash
manim -pqh learning_scenes.py NormalizeOrderLines
manim -pqh learning_scenes.py TransactionLostUpdate
manim -pqh learning_scenes.py TDUpdate
manim -pqh learning_scenes.py GradientSteps
```

Rendered videos are not bundled. No paid services or API keys are required; rendering consumes local CPU/GPU depending on scene and backend. Interactive SVG figures are already live in the offline site.

## v4 Statistical Learning animation sources

`islr_scenes.py` adds four original chapters-2/4/5/6 Manim teaching scenes:
`BiasVarianceTeaching`, `FiveFoldTeaching`, `LogisticTeaching`, `RegularizationTeaching`.

These are **animation source files only**. Python syntax was checked. Manim, LaTeX,
FFmpeg and runtime rendering are not available in this environment, so the
completed scenes have **not** been rendered or visually QA-checked. The website's
SVG interactive graphs work immediately without Manim and do not use AI APIs.


## v6 Algorithm Design proof animations

`algorithm_design_scenes.py` now also provides `DijkstraProofScene`,
`SubsetCapacityScene`, and `MatchingAugmentScene`, using original numerical
examples consistent with the six interactive source-grounded section labs.
These scenes are **syntax checked only**, not rendered. Manim Community Edition
and its rendering dependencies must be installed locally. For instance:

```bash
manim -pqh algorithm_design_scenes.py DijkstraProofScene
manim -pqh algorithm_design_scenes.py SubsetCapacityScene
manim -pqh algorithm_design_scenes.py MatchingAugmentScene
```

The browser SVG figures remain usable without Manim, remote services or API keys.

### v7 Algorithm Design Manim scenes

`algorithm_design_v7_scenes.py` includes `LatenessExchangeScene`, `HuffmanMergeScene`, `FFTButterflyScene` and `ProjectCutScene`. These are original standalone educational animations, not direct textbook figures. The source code is syntax-checked, but **runtime rendering is untested** because Manim is not installed in the current environment. Install Manim Community Edition and run, for example, `manim -pql algorithm_design_v7_scenes.py HuffmanMergeScene` to inspect rendered output.
