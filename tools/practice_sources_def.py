"""Every repository of the catalog you supplied, with its licence as reported by the GitHub API on 2026-10-24 (or read from the LICENSE file),
and what LearningAI does with it. Status: imported = files copied unchanged and bundled with the licence text; linked = link only.
`why` explains every link-only choice. This is practical guidance, not legal advice."""

CHECKED = '2026-10-24'

def e(repo, name, target, license, status, used, why=''):
    return dict(repo=repo, name=name, target=target, license=license, status=status, used=used, why=why, url='https://github.com/' + repo)

SOURCES = [
 e('microsoft/ML-For-Beginners', 'Microsoft ML for Beginners', 'Machine Learning', 'MIT', 'imported', '52 pre- and post-lesson quizzes (156 questions), unchanged'),
 e('microsoft/AI-For-Beginners', 'Microsoft AI for Beginners', 'AI Foundations', 'MIT', 'imported', '48 quizzes (145 questions), unchanged'),
 e('microsoft/Data-Science-For-Beginners', 'Microsoft Data Science for Beginners', 'Machine Learning, data', 'MIT', 'imported', '40 quizzes (120 questions), unchanged'),
 e('TheAlgorithms/Python', 'TheAlgorithms Python', 'Algorithm Design', 'MIT', 'imported', '24 reference implementations shown as "compare with" for 19 labs'),
 e('aimacode/aima-python', 'AIMA Python', 'AI Foundations', 'MIT', 'imported', 'search.py, games.py, csp.py, mdp.py as references for 3 labs'),
 e('ShangtongZhang/reinforcement-learning-an-introduction', 'Sutton & Barto implementations', 'Reinforcement Learning', 'MIT', 'imported', 'grid_world.py and ten_armed_testbed.py as references (value-iteration lab)'),
 e('karpathy/micrograd', 'micrograd', 'Deep Learning', 'MIT', 'imported', 'engine.py as the reference for the autograd lab'),
 e('ageron/handson-ml3', 'Hands-On Machine Learning notebooks', 'Machine Learning', 'Apache-2.0', 'imported', '22 chapter, math, tools and extra notebooks (each 1 MB or less), unmodified, on the Notebooks page; also linked from 3 labs', 'The 4 chapters above 2 MB (dimensionality reduction, unsupervised learning, computer vision, generative models) are linked, not copied. Apache-2.0 covers the code; the book itself is not included.'),
 e('microsoft/ai-agents-for-beginners', 'Microsoft AI Agents for Beginners', 'AI Agents', 'MIT', 'linked', 'link only', 'No quiz data; samples need Microsoft Foundry or Azure credentials, which a free static site cannot provide. 3.7 GB with translations.'),
 e('intro-stat-learning/ISLP_labs', 'Official ISLP labs', 'Statistical Learning', 'BSD-2-Clause', 'imported', '9 chapter lab notebooks (each under 1 MB), unmodified, on the Notebooks page', 'Chapters 2, 6 and 7 (1.1 to 1.5 MB with outputs) are linked, not copied. The notebooks need the ISLP package and its datasets.'),
 e('microsoft/generative-ai-for-beginners', 'Microsoft Generative AI for Beginners', 'LLM Engineering', 'MIT', 'linked', 'link only', 'No quiz data; notebooks need cloud API keys. 6.5 GB with translations.'),
 e('karpathy/nn-zero-to-hero', 'Neural Networks: Zero to Hero', 'Deep Learning, LLMs', 'MIT', 'imported', 'all 7 lecture notebooks (micrograd and makemore) and the README, unmodified, on the Notebooks page', 'The lecture videos are on YouTube and are not included.'),
 e('ossu/computer-science', 'Open Source Society University', 'Curriculum', 'MIT', 'imported', 'the curriculum README, unmodified, readable on the Notebooks page', 'The linked courses belong to their own providers and are not copied.'),
 e('algorithm-visualizer/algorithm-visualizer', 'Algorithm Visualizer', 'Algorithm Design', 'MIT', 'linked', 'link only', 'A React application with a server; the site has its own SVG algorithm labs.'),
 e('williamfiset/Algorithms', 'William Fiset Algorithms', 'Algorithm Design', 'MIT', 'linked', 'link only', 'Java code and a 1.2 GB repository; useful for graph, flow and matching ideas.'),
 e('trekhleb/javascript-algorithms', 'JavaScript Algorithms', 'Algorithm Design', 'MIT', 'linked', 'link only', 'Explanations in English with JavaScript code; a good next source for browser-native labs.'),
 e('huggingface/agents-course', 'Hugging Face Agents Course', 'AI Agents', 'Apache-2.0', 'imported', 'the English course units (77 text files), unmodified, readable on the Notebooks page', 'The text refers to images and Space demos that are not included; hands-on parts need a model provider account.'),
 e('langchain-ai/langchain-academy', 'LangChain Academy', 'AI Agents', 'MIT', 'imported', '28 LangGraph notebooks (modules 0 to 6, each 250 KB or less), unmodified, on the Notebooks page', 'Two larger notebooks are linked. The notebooks need API keys, so run them locally or in Colab; they cannot run in the browser here.'),
 e('cmu-db/bustub', 'CMU BusTub', 'Databases', 'MIT', 'linked', 'link only', 'C++ projects on Linux; the course asks that project solutions are not published.'),
 e('anders94/blockchain-demo', 'Blockchain Demo', 'Blockchain', 'MIT', 'linked', 'link only', 'Needs a Node server; a static rewrite would have to be written and its assets checked.'),
 e('tensorflow/playground', 'TensorFlow Playground', 'Deep Learning', 'Apache-2.0', 'linked', 'link only', 'Best used from the original page; embedding it would mean copying its code and assets.'),
 e('jupyterlite/jupyterlite', 'JupyterLite', 'Site engine', 'BSD-3-Clause', 'linked', 'candidate runtime for notebooks', 'Large WebAssembly bundle; the site already runs Python with Pyodide.'),
 e('mermaid-js/mermaid', 'Mermaid', 'Site engine', 'MIT', 'linked', 'candidate for diagrams', 'A library to load from a CDN, not material to copy.'),
 e('observablehq/plot', 'Observable Plot', 'Site engine', 'ISC', 'linked', 'candidate for charts', 'A library to load from a CDN, not material to copy.'),
 e('d2l-ai/d2l-en', 'Dive into Deep Learning', 'Deep Learning', 'NOASSERTION', 'linked', 'link only', 'Mixed licences: the text is CC BY-SA 4.0 and the code is a modified MIT; not copied so as not to mix licences.'),
 e('remzi-arpacidusseau/ostep-code', 'OSTEP source code', 'Operating Systems', 'none', 'linked', 'link only', 'No licence file, so no right to copy.'),
 e('remzi-arpacidusseau/ostep-homework', 'OSTEP homework simulators', 'Operating Systems', 'none', 'linked', 'link only', 'No licence file, so no right to copy.'),
 e('rasbt/LLMs-from-scratch', 'LLMs from Scratch', 'LLM Engineering', 'NOASSERTION', 'linked', 'link only', 'The GitHub API reports no licence; code and book content must be checked separately. Needs PyTorch.'),
 e('vwxyzjn/cleanrl', 'CleanRL', 'Reinforcement Learning', 'NOASSERTION', 'linked', 'link only', 'The GitHub API reports no licence; needs Gymnasium and a GPU for advanced runs.'),
 e('codecrafters-io/build-your-own-x', 'Build Your Own X', 'Portfolio projects', 'none', 'linked', 'link only', 'A list of third-party tutorials with their own copyrights.'),
]
