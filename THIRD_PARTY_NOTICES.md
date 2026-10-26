# Third-party material

The Practice hub (`#/practice`), the Notebooks page and the Visualization lab (`#/visualize`) use the following open-source material, all under permissive licences (MIT, BSD 2-Clause, Apache-2.0). Every file is copied unchanged and its licence text is bundled next to it. Apache-2.0 requires stating changes: there are none, the files are byte-for-byte the originals (see `third_party/MANIFEST.json`).

| What | Source | Licence | Where in this repository |
|---|---|---|---|
| 156 practice questions in 52 quizzes (Machine Learning) | [Microsoft ML-For-Beginners](https://github.com/microsoft/ML-For-Beginners), `quiz-app/src/assets/translations/en.json` | MIT, Copyright (c) Microsoft Corporation | `third_party/ml-for-beginners/` (data copied unchanged), `assets/practice-quizzes-data.js` (generated) |
| 145 practice questions in 48 quizzes (AI Foundations) | [Microsoft AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners), `etc/quiz-app/src/assets/translations/en/lesson-*.json` | MIT, Copyright (c) Microsoft Corporation | `third_party/ai-for-beginners/` (data copied unchanged), `assets/practice-quizzes-data.js` (generated) |
| 120 practice questions in 40 quizzes (Data Science) | [Microsoft Data-Science-For-Beginners](https://github.com/microsoft/Data-Science-For-Beginners), `quiz-app/src/assets/translations/en/group-*.json` | MIT, Copyright (c) Microsoft Corporation | `third_party/data-science-for-beginners/` (data copied unchanged), `assets/practice-quizzes-data.js` (generated) |
| Reference code files shown as "compare with" | [TheAlgorithms/Python](https://github.com/TheAlgorithms/Python) | MIT, Copyright (c) 2016-2022 TheAlgorithms and contributors | `third_party/thealgorithms-python/` (unchanged) |
| Reference code files shown as "compare with" | [aimacode/aima-python](https://github.com/aimacode/aima-python) | MIT, Copyright (c) 2016 aima-python contributors | `third_party/aima-python/` (unchanged) |
| Reference code files shown as "compare with" | [ShangtongZhang/reinforcement-learning-an-introduction](https://github.com/ShangtongZhang/reinforcement-learning-an-introduction) | MIT, Copyright (c) 2019 Shangtong Zhang | `third_party/sutton-barto-python/` (unchanged) |
| Reference code files shown as "compare with" | [karpathy/micrograd](https://github.com/karpathy/micrograd) | MIT, Copyright (c) 2020 Andrej Karpathy | `third_party/micrograd/` (unchanged) |
| Lab notebooks | [intro-stat-learning/ISLP_labs](https://github.com/intro-stat-learning/ISLP_labs) | BSD 2-Clause, Copyright (c) 2023 intro-stat-learning | `third_party/islp-labs/` (unchanged) |
| Chapter notebooks | [ageron/handson-ml3](https://github.com/ageron/handson-ml3) | Apache-2.0 | `third_party/handson-ml3/` (unchanged) |
| Lecture notebooks and README | [karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero) | MIT, Copyright (c) 2022 Andrej Karpathy | `third_party/nn-zero-to-hero/` (unchanged) |
| LangGraph notebooks | [langchain-ai/langchain-academy](https://github.com/langchain-ai/langchain-academy) | MIT, Copyright (c) 2026 LangChain, Inc. | `third_party/langchain-academy/` (unchanged) |
| English course text | [huggingface/agents-course](https://github.com/huggingface/agents-course) | Apache-2.0 | `third_party/agents-course/` (unchanged) |
| Curriculum README | [ossu/computer-science](https://github.com/ossu/computer-science) | MIT, Copyright (c) 2015-2023 Open Source Society University | `third_party/ossu-computer-science/` (unchanged) |
| Neural network playground (built site) | [tensorflow/playground](https://github.com/tensorflow/playground) | Apache-2.0, Copyright 2016 Google Inc.; one change, see CHANGES.md | `third_party/tensorflow-playground/` (unchanged) |
| Diagram library (release file) | [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) | MIT, Copyright (c) 2014-2022 Knut Sveidqvist | `third_party/mermaid/` (unchanged) |
| Chart library (release file) | [observablehq/plot](https://github.com/observablehq/plot) | ISC, Copyright 2020-2025 Observable, Inc. | `third_party/observable-plot/` (unchanged) |
| Chart dependency (release file) | [d3/d3](https://github.com/d3/d3) | ISC, Copyright 2010-2023 Mike Bostock | `third_party/d3/` (unchanged) |

The Videos page and the "Watch" strips embed videos by 3Blue1Brown from YouTube's official player (privacy-enhanced domain), only after a click. Nothing is copied or downloaded; the videos belong to their creator and the list is built by `tools/build_videos.py`.

Repositories with no licence file or an unclear or mixed licence (for example OSTEP, Build Your Own X, Dive into Deep Learning) are only linked, and so are files that were too large to bundle. See `#/practice/sources` and `docs/SOURCES_AUDIT.md`.

The lab prompts, starter code, hidden tests and sample solutions were written for this site. They are not copied from the upstream repositories.
The source code is the property of its authors; this site is not affiliated with any of the projects or companies named above.
`third_party/MANIFEST.json` lists the SHA-256 of every bundled file. Rebuild the generated files with `python tools/build_practice_hub.py`.
