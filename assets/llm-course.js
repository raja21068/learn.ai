/* LLM Engineering course: an original curriculum that follows the chapter sequence of
   Iusztin & Labonne, "LLM Engineer's Handbook" (Packt, 2024). Lessons, labs, data and visuals are original. */
window.LLM_COURSE = {
  id: 'llm-engineering',
  title: 'LLM Engineering: From Prompt to Production',
  short: 'LLM Engineering',
  tabLabel: 'LLMs',
  subtitle: 'Build your own AI writing twin end to end: data pipelines, RAG, fine-tuning, preference alignment, evaluation, inference optimization, deployment and LLMOps.',
  tag: 'New · Project-based',
  category: 'generative',
  accent: '#e8711c',
  symbol: 'LLM',
  level: 'Intermediate',
  lang: 'python',
  outcome: 'Design and reason about a production LLM system: collect and clean data, build RAG pipelines, fine-tune with LoRA and DPO, evaluate rigorously, optimize and quantize inference, deploy behind an autoscaling API, and operate it with LLMOps.',
  reference: 'Follows the chapter sequence of Iusztin & Labonne, LLM Engineer\'s Handbook (Packt, 2024). Lessons, labs and visuals are original. The book\'s full code base and cloud setup go much deeper.',
  project: { name: 'Your AI writing twin', blurb: 'One system, built piece by piece: it learns from your articles and posts, retrieves your knowledge, writes in your voice, and runs as a monitored API.' },
  systemMap: [
    { id: 'collect', icon: '🕸', label: 'Data collection', sub: 'crawlers · ETL' },
    { id: 'warehouse', icon: '🗄', label: 'Data warehouse', sub: 'raw documents', store: true },
    { id: 'feature', icon: '🧩', label: 'Feature pipeline', sub: 'clean · chunk · embed' },
    { id: 'vectordb', icon: '📐', label: 'Vector DB', sub: 'chunks + instruct data', store: true },
    { id: 'training', icon: '🏋', label: 'Training pipeline', sub: 'SFT · LoRA · DPO' },
    { id: 'registry', icon: '📦', label: 'Model registry', sub: 'versioned models', store: true },
    { id: 'inference', icon: '⚡', label: 'Inference pipeline', sub: 'RAG · optimized LLM' },
    { id: 'api', icon: '🌐', label: 'REST API', sub: 'autoscaling service' }
  ],
  systemOps: [{ id: 'eval', icon: '🧪', label: 'Evaluation' }, { id: 'ops', icon: '🛰', label: 'LLMOps: orchestration · CI/CD · monitoring' }],
  learn: [
    'Architect LLM systems with feature / training / inference pipelines',
    'Build crawl → clean → dedupe data pipelines',
    'Chunk, embed and retrieve with hybrid search and reranking',
    'Create instruction datasets and fine-tune with LoRA / QLoRA',
    'Align models to preferences with DPO',
    'Evaluate LLMs and RAG with benchmarks, judges and RAG metrics',
    'Optimize inference: KV cache, batching, speculative decoding, quantization',
    'Deploy, autoscale, monitor and gate releases with LLMOps'
  ],
  parts: ['Architecture & tooling', 'Data & RAG', 'Fine-tuning', 'Evaluation', 'Inference', 'Deployment & LLMOps'],
  lessons: [
  /* ---------- PART 1 ---------- */
  {
    id: 'ai-twin-architecture', part: 0, chapter: 'Ch. 1', builds: ['collect', 'feature', 'training', 'inference'], title: 'Your AI twin & the FTI architecture', minutes: 14,
    goal: 'Scope an LLM product as an MVP and design it with feature, training and inference pipelines.',
    sections: [
      { h: 'The project: an AI that writes like you', html: '<p>Throughout this course you design one realistic product: an <b>AI writing twin</b>. It learns from your articles, posts and code, then drafts new content in your voice, grounded in what you actually know. Generic chatbots can\'t do this: they don\'t know your style or your private knowledge, and they hallucinate about you.</p><p>Start like a product engineer: define a <b>minimum viable product</b>. Collect your public writing, fine-tune an open model on it, add retrieval over your content, and serve it through an API with monitoring.</p>' },
      { h: 'Why ML systems are hard', html: '<p>The model is the small part. The rest is data collection, feature computation, training, versioning, serving, scaling and monitoring. A monolithic "notebook in production" couples them all, and every change breaks something. The opposite extreme, a separate service per tiny concern, drowns in glue code.</p>' },
      { h: 'The FTI pattern', html: '<p>Split the system into three independent pipelines that communicate only through storage:</p><ul><li><b>Feature pipeline</b>: raw data → features/datasets in a <b>feature store</b> (here: a vector DB and instruct datasets).</li><li><b>Training pipeline</b>: features → trained model in a <b>model registry</b>.</li><li><b>Inference pipeline</b>: model + features → predictions for users.</li></ul><p>Each pipeline can be built by a different team, run on different hardware (CPU vs. GPU), scale independently and be versioned separately. Play the data flow below.</p>' }
    ],
    widget: 'fti',
    terms: [['MVP', 'The smallest product that delivers real value and can be tested with users.'], ['Feature store', 'Versioned storage of features/datasets shared by pipelines.'], ['Model registry', 'Versioned storage of trained models and their metadata.']],
    lab: { intro: 'Every lab runs real Python in your browser. <b>Run</b> to experiment, <b>Check</b> to run hidden tests, and <b>💡</b> if you get stuck.', tasks: [
      { prompt: 'Implement the three FTI pipelines. They may <b>only</b> talk through <code>feature_store</code> and <code>model_registry</code>. Inference must always load the <b>latest</b> model version.',
        starter: `feature_store, model_registry = {}, {}

def feature_pipeline(raw_docs):
    """Clean docs and store them as lists of lowercase words."""
    pass  # TODO: feature_store["features"] = [doc.lower().split() for doc in raw_docs]

def training_pipeline():
    """'Train' a word-frequency model from the feature store; register it as a new version."""
    counts = {}
    for words in feature_store["features"]:
        for w in words:
            counts[w] = counts.get(w, 0) + 1
    version = len(model_registry) + 1
    # TODO: model_registry[version] = counts and return version

def inference_pipeline(word):
    """Load the latest model from the registry; return how often the word appears (0 if unseen)."""
    return 0  # TODO

feature_pipeline(["LLMs need data", "Data pipelines feed LLMs"])
print("trained version", training_pipeline())
print("count('llms') =", inference_pipeline("LLMs"))`,
        solution: `def feature_pipeline(raw_docs):
    feature_store["features"] = [doc.lower().split() for doc in raw_docs]

def training_pipeline():
    counts = {}
    for words in feature_store["features"]:
        for w in words:
            counts[w] = counts.get(w, 0) + 1
    version = len(model_registry) + 1
    model_registry[version] = counts
    return version

def inference_pipeline(word):
    latest = model_registry[max(model_registry)]
    return latest.get(word.lower(), 0)`,
        test: `feature_store.clear(); model_registry.clear()
feature_pipeline(["A b", "b c"])
assert training_pipeline() == 1 and inference_pipeline("B") == 2
feature_pipeline(["b b b"])
assert training_pipeline() == 2
assert inference_pipeline("b") == 3, "inference must use the latest model version"
assert inference_pipeline("zzz") == 0` }
    ] },
    quiz: [
      { q: 'In the FTI architecture, how do the pipelines communicate?', options: ['Direct function calls between the three pipelines at run time, in one process', 'Only through shared storage: feature store and model registry', 'Through the user, who copies each result into the next pipeline by hand', 'They do not communicate at all, because each pipeline runs on its own data'], correct: 1, why: 'Decoupling through storage lets each pipeline evolve, scale and deploy independently.' },
      { q: 'Which pipeline typically needs GPUs most?', options: ['Feature pipeline, because embedding every document is slow', 'Data collection, because crawlers need many cores', 'None of them, since the pipelines run on CPUs only', 'Training pipeline'], correct: 3, why: 'Fine-tuning is the most compute-heavy step; features often run on CPUs.' }
    ]
  },
  {
    id: 'llmops-toolbox', part: 0, chapter: 'Ch. 2', builds: ['ops', 'registry'], title: 'The LLMOps toolbox', minutes: 12,
    goal: 'Know what each tool in a modern LLM stack is for, and build a caching pipeline runner.',
    sections: [
      { h: 'Reproducible Python', html: '<p>Lock dependencies with a manager such as <b>Poetry</b> or uv, so every machine runs identical versions. Define common commands (run pipeline, start API, run tests) with a <b>task runner</b>. Boring, and essential: most "works on my machine" bugs are environment bugs.</p>' },
      { h: 'The MLOps stack by role', html: '<ul><li><b>Orchestrator</b> (e.g. ZenML, Airflow, Prefect): defines pipelines as steps, runs them locally or in the cloud, tracks <b>artifacts</b> and metadata, and skips cached steps.</li><li><b>Model registry</b> (e.g. Hugging Face Hub): versioned models and datasets.</li><li><b>Experiment tracker</b> (e.g. Comet, W&B, MLflow): compares training runs and metrics.</li><li><b>Prompt monitoring</b> (e.g. Opik, Langfuse): traces of prompts, answers, latency and cost.</li><li><b>Databases</b>: a NoSQL document store for raw data, and a <b>vector database</b> (e.g. Qdrant) for embeddings.</li><li><b>Cloud</b> (e.g. AWS SageMaker): training jobs and inference endpoints.</li></ul><p>Explore the stack below.</p>' },
      { h: 'Artifacts and caching', html: '<p>Every step output, from cleaned documents to datasets and models, is an <b>artifact</b> with lineage: which code and inputs produced it. When neither code nor inputs change, the orchestrator reuses the cached artifact instead of recomputing. That saves hours of GPU time and makes results reproducible. You will build that logic in the lab.</p>' }
    ],
    widget: 'toolstack',
    terms: [['Orchestrator', 'Runs pipeline steps in order, locally or in the cloud, tracking artifacts.'], ['Artifact', 'A versioned output of a pipeline step, with lineage.'], ['Experiment tracker', 'Logs hyperparameters and metrics to compare runs.']],
    lab: { tasks: [
      { prompt: 'Implement <code>run_pipeline(steps, cache)</code>: run each <code>(name, fn, input_names)</code> step in order, storing outputs in <code>artifacts</code>. Skip a step when the cache already has the same <code>(name, inputs)</code> key. Return <code>(artifacts, executed_names)</code>.',
        starter: `def run_pipeline(steps, cache):
    artifacts, executed = {}, []
    for name, fn, input_names in steps:
        inputs = [artifacts[i] for i in input_names]
        key = (name, repr(inputs))
        # TODO: if key in cache -> reuse cache[key]
        #       else -> run fn(*inputs), store in cache, record name in executed
        artifacts[name] = fn(*inputs)
    return artifacts, executed

steps = [
    ("crawl", lambda: ["Post A", "Post B"], []),
    ("clean", lambda docs: [d.lower() for d in docs], ["crawl"]),
    ("count", lambda docs: len(docs), ["clean"]),
]
cache = {}
print(run_pipeline(steps, cache))
print(run_pipeline(steps, cache))   # second run: everything cached`,
        solution: `def run_pipeline(steps, cache):
    artifacts, executed = {}, []
    for name, fn, input_names in steps:
        inputs = [artifacts[i] for i in input_names]
        key = (name, repr(inputs))
        if key in cache:
            artifacts[name] = cache[key]
        else:
            artifacts[name] = cache[key] = fn(*inputs)
            executed.append(name)
    return artifacts, executed`,
        test: `cache = {}
a, ex = run_pipeline(steps, cache)
assert a["count"] == 2 and ex == ["crawl", "clean", "count"]
a2, ex2 = run_pipeline(steps, cache)
assert ex2 == [] and a2 == a, "second run should be fully cached"
steps3 = steps + [("report", lambda n: f"{n} docs", ["count"])]
a3, ex3 = run_pipeline(steps3, cache)
assert ex3 == ["report"] and a3["report"] == "2 docs", "only the new step should run: " + str(ex3)` }
    ] },
    quiz: [
      { q: 'Which tool would you use to compare the loss curves of five fine-tuning runs?', options: ['Vector database, which stores embeddings for search', 'Task runner, which executes commands in order', 'Experiment tracker', 'Model registry, which stores versioned model files'], correct: 2, why: 'Experiment trackers log and compare hyperparameters and metrics.' },
      { q: 'Why do orchestrators track artifact lineage?', options: ['To reproduce results and safely reuse cached outputs', 'To produce prettier dashboards for the whole team to look at', 'To compress the model files before they are stored', 'Because Python refuses to run a pipeline without lineage metadata'], correct: 0, why: 'Lineage tells you exactly what produced each output.' }
    ]
  },
  /* ---------- PART 2 ---------- */
  {
    id: 'data-engineering', part: 1, chapter: 'Ch. 3', builds: ['collect', 'warehouse'], title: 'Data engineering: crawl, clean, dedupe', minutes: 15,
    goal: 'Design a data collection pipeline and clean and deduplicate raw text.',
    sections: [
      { h: 'Collect from where your voice lives', html: '<p>The twin needs your content: blog articles, social posts, code repositories. A <b>dispatcher</b> looks at each URL\'s domain and routes it to the right <b>crawler</b>: a headless browser for dynamic pages, an HTML scraper for static ones, git for repositories. Each crawler maps its source into a common document model (author, platform, link, content).</p>' },
      { h: 'ETL into a document warehouse', html: '<p><b>Extract</b> raw pages, <b>transform</b> them into structured documents, and <b>load</b> them into a NoSQL data warehouse such as MongoDB, with an <b>ODM</b> layer that maps Python classes to collections. Keep the raw data: you will re-process it many times as the pipeline improves. Respect robots.txt, terms of service and personal data rules.</p>' },
      { h: 'Cleaning and deduplication', html: '<p>Garbage in, garbage out, and with LLMs that includes your twin\'s style. Strip HTML and boilerplate, normalize whitespace and unicode, drop URLs and emojis where they add noise, filter very short or very long documents, and remove <b>near-duplicates</b> (cross-posted articles) with shingles and Jaccard similarity or MinHash. Step through the pipeline below.</p>' }
    ],
    widget: 'etl',
    terms: [['Dispatcher', 'Routes each link to the appropriate crawler.'], ['ETL', 'Extract, transform, load.'], ['Near-duplicate', 'Documents that are almost identical, e.g. cross-posts.']],
    lab: { tasks: [
      { prompt: 'Implement <code>clean_text</code> (remove HTML tags, drop words starting with <code>http</code>, collapse whitespace) and <code>dedupe(docs, threshold)</code>, which keeps a document only if its word-3-shingle Jaccard similarity to every kept document is below the threshold.',
        starter: `import re

def clean_text(text):
    text = re.sub(r"<[^>]+>", " ", text)          # strip HTML tags
    # TODO: drop words starting with "http", collapse whitespace with " ".join(...split())
    return text

def shingles(text, k=3):
    w = text.lower().split()
    return {tuple(w[i:i + k]) for i in range(len(w) - k + 1)}

def jaccard(a, b):
    return len(a & b) / len(a | b) if a | b else 1.0

def dedupe(docs, threshold=0.8):
    kept = []
    # TODO: keep doc only if jaccard(shingles(doc), shingles(k)) < threshold for all kept k
    return docs

raw = ["<p>Building   LLM systems is mostly <b>data</b> work. See https://x.io</p>",
       "Building LLM systems is mostly data work. See it.",
       "Fine-tuning needs a clean instruction dataset."]
cleaned = [clean_text(d) for d in raw]
print(cleaned)
print(dedupe(cleaned))`,
        solution: `def clean_text(text):
    text = re.sub(r"<[^>]+>", " ", text)
    return " ".join(w for w in text.split() if not w.startswith("http"))

def dedupe(docs, threshold=0.8):
    kept = []
    for d in docs:
        if all(jaccard(shingles(d), shingles(k)) < threshold for k in kept):
            kept.append(d)
    return kept`,
        test: `assert clean_text("<p>Hi   <b>there</b></p>  https://a.b x") == "Hi there x"
c = [clean_text(d) for d in raw]
d = dedupe(c, 0.6)
assert len(d) == 2 and d[0] == c[0] and d[1] == c[2], d
assert dedupe(["a b c d", "a b c d"]) == ["a b c d"]` }
    ] },
    quiz: [
      { q: 'Why keep raw crawled data in the warehouse after cleaning?', options: ['MongoDB requires the raw documents to stay next to the cleaned ones', 'To make marketing reports that quote the original crawled pages', 'So you can re-process it as cleaning and features improve', 'To slow down the next crawl so the target sites are not overloaded'], correct: 2, why: 'Pipelines evolve; raw data lets you recompute everything downstream.' },
      { q: 'An article cross-posted to two blogs should be…', options: ['Detected as a near-duplicate and kept once', 'Kept twice, to emphasise the article in the training set', 'Translated into another language before it is stored', 'Deleted entirely, since it appears on more than one site'], correct: 0, why: 'Duplicates skew training and waste tokens.' }
    ]
  },
  {
    id: 'rag-fundamentals', part: 1, chapter: 'Ch. 4', builds: ['feature', 'vectordb'], title: 'RAG feature pipeline: chunk & embed', minutes: 15,
    goal: 'Turn documents into retrievable chunks and embeddings in a vector database.',
    sections: [
      { h: 'Why RAG', html: '<p>Fine-tuning teaches <i>style</i>; <b>retrieval-augmented generation</b> supplies <i>facts</i>. It is fresh, private, cheap to update and citable. The naive RAG system has three parts: an <b>ingestion</b> pipeline (clean, chunk, embed, load), a <b>retrieval</b> step (nearest neighbors to the query embedding), and <b>generation</b> (the LLM answers using the retrieved context).</p>' },
      { h: 'Embeddings and vector databases', html: '<p>An <b>embedding model</b> maps text to a vector in which similar meanings are close. Sentence-transformer models are fast and good; choose by your domain, language and context length. <b>Vector databases</b> store vectors with metadata (author, platform, date) and answer approximate-nearest-neighbor queries quickly, using indexes such as HNSW. Metadata enables <b>filtered</b> search.</p>' },
      { h: 'Chunking decides quality', html: '<p>Embeddings have a context limit, and a whole article blurs many topics into one vector. Split documents into <b>chunks</b>: too small loses context, too large dilutes relevance. <b>Overlap</b> keeps sentences that straddle a boundary retrievable. Different content types (articles, posts, code) deserve different strategies. Tune the chunker below.</p>' }
    ],
    widget: 'chunking',
    terms: [['Chunk', 'A piece of a document embedded and retrieved as a unit.'], ['Chunk overlap', 'Shared text between consecutive chunks to preserve context.'], ['HNSW', 'Graph-based index for fast approximate nearest-neighbor search.']],
    lab: { tasks: [
      { prompt: 'Implement <code>chunk_words(text, size, overlap)</code>: windows of <code>size</code> words that advance by <code>size − overlap</code>; the last chunk may be shorter, and no chunk may be fully contained in the previous one.',
        starter: `def chunk_words(text, size=8, overlap=2):
    words = text.split()
    chunks = []
    step = size - overlap
    # TODO: for start in range(0, len(words), step): take words[start:start+size]
    #       stop once a chunk reaches the end of the text
    return chunks

doc = ("Retrieval augmented generation grounds a language model in external knowledge "
       "by fetching relevant chunks at query time and adding them to the prompt")
for c in chunk_words(doc, size=8, overlap=2):
    print(repr(c))`,
        solution: `def chunk_words(text, size=8, overlap=2):
    words = text.split()
    chunks = []
    step = size - overlap
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):
            break
    return chunks`,
        test: `w = " ".join(str(i) for i in range(10))
assert chunk_words(w, 4, 1) == ["0 1 2 3", "3 4 5 6", "6 7 8 9"], chunk_words(w, 4, 1)
assert chunk_words(w, 5, 0) == ["0 1 2 3 4", "5 6 7 8 9"]
assert chunk_words("a b", 8, 2) == ["a b"]
assert all(len(c.split()) <= 8 for c in chunk_words(doc))` }
    ] },
    quiz: [
      { q: 'Your RAG answers miss details that sit across two paragraphs. A likely fix is…', options: ['Switching to a smaller model, so each paragraph costs less', 'Adding chunk overlap or larger chunks', 'Removing the metadata, so that the prompt has more room', 'Lowering the temperature, so the model reads more carefully'], correct: 1, why: 'Boundary-crossing context needs overlap or bigger chunks.' },
      { q: 'Metadata such as author or platform in a vector DB enables…', options: ['Faster embeddings, because metadata shortens the text', 'Quantization of the vectors to save disk space', 'Fine-tuning the embedding model on the author names', 'Filtered vector search'], correct: 3, why: 'Filter first, then search by similarity within the subset.' }
    ]
  },
  {
    id: 'advanced-rag', part: 1, chapter: 'Ch. 4 & 9', builds: ['vectordb', 'inference'], title: 'Advanced RAG: hybrid search & reranking', minutes: 16,
    goal: 'Improve retrieval before, during and after the search.',
    sections: [
      { h: 'Pre-retrieval', html: '<p>Improve the query and the index before searching. <b>Query rewriting</b> clarifies vague questions; <b>query expansion</b> generates several phrasings to widen recall; <b>self-querying</b> extracts metadata filters ("posts by Maxime about DPO" → author = Maxime). On the index side, use smarter chunking and enrich chunks with summaries or titles.</p>' },
      { h: 'Retrieval: hybrid and filtered', html: '<p>Vector search captures meaning but can miss exact terms (product codes, names). Keyword search (<b>BM25</b>) nails exact terms but misses paraphrases. <b>Hybrid search</b> runs both and fuses the rankings, for example with a weighted score or <b>reciprocal rank fusion (RRF)</b>. Add metadata <b>filters</b> to restrict the search space. Blend the two below.</p>' },
      { h: 'Post-retrieval: rerank and compress', html: '<p>Retrieve generously (say the top 20), then <b>rerank</b> with a cross-encoder that reads query and chunk together and is much more accurate than embedding similarity. Keep the top 3–5 and optionally compress them. Fewer, better chunks mean cheaper prompts and fewer distractions for the LLM.</p>' }
    ],
    widget: 'hybrid',
    terms: [['Query expansion', 'Generating multiple query variants to improve recall.'], ['Hybrid search', 'Combining keyword and vector retrieval.'], ['Reranker', 'Model that rescores query–chunk pairs for precision.']],
    lab: { tasks: [
      { prompt: 'Implement <b>reciprocal rank fusion</b>: each document scores Σ 1 / (k + rank) over all rankings (rank starts at 1). Return ids sorted by fused score, highest first; break ties by id.',
        starter: `def rrf(rankings, k=60):
    scores = {}
    # TODO: for each ranking list, for rank, doc in enumerate(ranking, start=1): add 1/(k+rank)
    return sorted(scores, key=lambda d: (-scores[d], d))

keyword_hits = ["dpo-post", "lora-guide", "rag-intro"]
vector_hits  = ["rag-intro", "dpo-post", "eval-notes"]
print(rrf([keyword_hits, vector_hits]))`,
        solution: `def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))`,
        test: `assert rrf([keyword_hits, vector_hits]) == ["dpo-post", "rag-intro", "lora-guide", "eval-notes"], rrf([keyword_hits, vector_hits])
assert rrf([["a", "b"], ["b", "a"]]) == ["a", "b"]
assert rrf([["x"], ["y", "x"]], k=0) == ["x", "y"]` }
    ] },
    quiz: [
      { q: 'Users search for an exact error code like "E-4012". Pure vector search struggles. Best fix?', options: ['A bigger embedding model, which captures rare tokens better', 'Smaller chunks, so the code appears in more passages', 'More training epochs for the embedding model on the corpus', 'Hybrid search with a keyword (BM25) component'], correct: 3, why: 'Keyword retrieval excels at exact tokens; hybrid gets the best of both.' },
      { q: 'Why retrieve 20 chunks and then rerank to 5?', options: ['Rerankers are cheap at scale, so they can score every document in the whole index', 'To use up more of the tokens in the context window on purpose', 'High recall first, then high precision from a more accurate but slower model', 'Vector databases cannot return fewer than twenty chunks at a time'], correct: 2, why: 'Cheap recall + expensive precision on a small set.' }
    ]
  },
  /* ---------- PART 3 ---------- */
  {
    id: 'instruction-datasets', part: 2, chapter: 'Ch. 5', builds: ['feature', 'vectordb'], title: 'Instruction datasets & chat templates', minutes: 15,
    goal: 'Create, curate and format the data that fine-tuning learns from.',
    sections: [
      { h: 'From documents to instruction pairs', html: '<p>Supervised fine-tuning learns from <b>instruction → answer</b> pairs. Your raw articles aren\'t in that shape, so you generate it: an LLM reads each chunk and writes plausible instructions ("Write a paragraph about chunk overlap in RAG") with your original text as the answer. That way the style stays yours. This is <b>synthetic data generation</b> grounded in real content.</p>' },
      { h: 'Quality over quantity', html: '<p>A few thousand excellent samples often beat a million mediocre ones. Curate with rules (length, language, format), <b>exact and fuzzy deduplication</b>, <b>decontamination</b> (remove anything overlapping your evaluation set), and quality scoring by heuristics or an LLM judge. Aim for accuracy, diversity and complexity. Watch the funnel shrink below.</p>' },
      { h: 'Chat templates', html: '<p>Models are trained with a specific <b>chat template</b> that marks roles and turns, such as Alpaca-style headers or <b>ChatML</b> tokens (<code>&lt;|im_start|&gt;user … &lt;|im_end|&gt;</code>). Fine-tuning and inference must use exactly the same template, or quality drops sharply. Most libraries apply it from the tokenizer\'s configuration.</p>' }
    ],
    widget: 'datacurate',
    terms: [['Instruction dataset', 'Pairs of instructions and desired answers for SFT.'], ['Decontamination', 'Removing training samples that overlap evaluation data.'], ['Chat template', 'Exact text format marking system/user/assistant turns.']],
    lab: { tasks: [
      { prompt: 'Implement <code>to_chatml(system, instruction, answer)</code> in ChatML format (one <code>&lt;|im_start|&gt;role</code> block per turn, newline after the role and after <code>&lt;|im_end|&gt;</code>) and <code>curate(samples, min_words, max_words)</code>: drop duplicate instructions (case-insensitive, keep the first) and answers outside the word range.',
        starter: `def to_chatml(system, instruction, answer):
    def block(role, text):
        return "<|im_start|>" + role + "\\n" + text + "<|im_end|>\\n"
    return ""   # TODO: system block + user block + assistant block

def curate(samples, min_words=3, max_words=60):
    out, seen = [], set()
    # TODO
    return samples

data = [
    {"instruction": "Explain chunk overlap", "answer": "Overlap keeps boundary sentences retrievable in RAG."},
    {"instruction": "explain chunk overlap", "answer": "Duplicate question, different casing."},
    {"instruction": "Say hi", "answer": "Hi"},
    {"instruction": "What is DPO?", "answer": "Direct preference optimization aligns a model with chosen vs rejected answers."},
]
clean = curate(data)
print(len(clean), "samples kept")
print(to_chatml("You write like Ada.", clean[0]["instruction"], clean[0]["answer"]))`,
        solution: `def to_chatml(system, instruction, answer):
    def block(role, text):
        return "<|im_start|>" + role + "\\n" + text + "<|im_end|>\\n"
    return block("system", system) + block("user", instruction) + block("assistant", answer)

def curate(samples, min_words=3, max_words=60):
    out, seen = [], set()
    for s in samples:
        key = s["instruction"].strip().lower()
        n = len(s["answer"].split())
        if key in seen or not (min_words <= n <= max_words):
            continue
        seen.add(key)
        out.append(s)
    return out`,
        test: `t = to_chatml("S", "U", "A")
assert t == "<|im_start|>system\\nS<|im_end|>\\n<|im_start|>user\\nU<|im_end|>\\n<|im_start|>assistant\\nA<|im_end|>\\n", repr(t)
c = curate(data)
assert [s["instruction"] for s in c] == ["Explain chunk overlap", "What is DPO?"], c` }
    ] },
    quiz: [
      { q: 'Your eval set questions accidentally appear in the training data. What do you need?', options: ['Decontamination', 'More training epochs to dilute the leaked questions', 'A larger LoRA rank so the model memorises less', 'Quantization to hide the overlap from the evaluation'], correct: 0, why: 'Contaminated evals give misleadingly high scores.' },
      { q: 'You fine-tune with ChatML but serve with an Alpaca-style prompt. Expect…', options: ['Better results, because the model adapts to any template', 'Degraded, erratic outputs', 'No difference, since the tokenizer normalises prompts', 'Faster inference, because Alpaca prompts are shorter'], correct: 1, why: 'Templates must match between training and inference.' }
    ]
  },
  {
    id: 'sft-lora', part: 2, chapter: 'Ch. 5', builds: ['training', 'registry'], title: 'Supervised fine-tuning with LoRA & QLoRA', minutes: 16,
    goal: 'Choose between full fine-tuning, LoRA and QLoRA, and implement a LoRA layer.',
    sections: [
      { h: 'When to fine-tune', html: '<p>Try prompting and RAG first. Fine-tune when you need a consistent <b>style or format</b>, domain behavior, or a smaller model that matches a bigger one on your task. SFT trains the model to produce the answer given the instruction, usually computing the loss on the <b>answer tokens</b> only.</p>' },
      { h: 'Full vs. LoRA vs. QLoRA', html: '<ul><li><b>Full fine-tuning</b> updates every weight. It is the best quality ceiling, but needs memory for weights + gradients + optimizer states (≈16 bytes per parameter with Adam in mixed precision).</li><li><b>LoRA</b> freezes W and learns a low-rank update ΔW = B·A with rank r ≪ d, often &lt;1% of the parameters. It is fast, cheap, and adapters can be swapped and merged.</li><li><b>QLoRA</b> loads the frozen base in 4-bit and trains LoRA adapters on top, so an 8B model fine-tunes on a single consumer GPU.</li></ul><p>Compare memory and trainable parameters below.</p>' },
      { h: 'Hyperparameters that matter', html: '<p>Learning rate (≈1e-4 to 3e-4 for LoRA), schedule with warmup, batch size and gradient accumulation, number of epochs (1–3), max sequence length, and <b>packing</b> several short samples into one sequence for efficiency. Watch training and validation loss, and keep a few qualitative prompts to read after each run.</p>' }
    ],
    widget: 'lora',
    terms: [['LoRA', 'Low-rank adapters: train B·A instead of the full weight matrix.'], ['QLoRA', 'LoRA on top of a 4-bit quantized frozen base model.'], ['Packing', 'Concatenating short samples to fill the context window.']],
    lab: { tasks: [
      { prompt: 'Implement a LoRA linear layer <code>y = x·W + (alpha/r)·x·A·B</code> and <code>trainable_params(d_in, d_out, r)</code>. With B initialized to zeros, the layer must equal the frozen base at the start of training.',
        starter: `import numpy as np
rng = np.random.default_rng(0)
d_in, d_out, r, alpha = 64, 64, 8, 16
W = rng.normal(0, 0.02, (d_in, d_out))      # frozen pretrained weight
A = rng.normal(0, 0.02, (d_in, r))          # trainable
B = np.zeros((r, d_out))                     # trainable, zero-init

def lora_forward(x, W, A, B, alpha, r):
    return x @ W   # TODO: add the scaled low-rank update

def trainable_params(d_in, d_out, r):
    return d_in * d_out   # TODO: parameters in A and B only

x = rng.normal(size=(2, d_in))
print("equals base at init:", np.allclose(lora_forward(x, W, A, B, alpha, r), x @ W))
print("LoRA params:", trainable_params(4096, 4096, 16), "vs full:", 4096 * 4096)`,
        solution: `def lora_forward(x, W, A, B, alpha, r):
    return x @ W + (alpha / r) * (x @ A @ B)

def trainable_params(d_in, d_out, r):
    return r * (d_in + d_out)`,
        test: `import numpy as np
x = rng.normal(size=(3, d_in))
assert np.allclose(lora_forward(x, W, A, B, alpha, r), x @ W)
B2 = rng.normal(size=(r, d_out))
assert np.allclose(lora_forward(x, W, A, B2, alpha, r), x @ W + 2.0 * x @ A @ B2)
assert trainable_params(4096, 4096, 16) == 131072
assert trainable_params(4096, 4096, 16) / (4096 * 4096) < 0.01` }
    ] },
    quiz: [
      { q: 'Why is LoRA\'s B matrix initialized to zero?', options: ['So the adapted model starts exactly equal to the base model', 'To save memory, because zeros need no storage at all', 'Because the matrix has to be sparse for the update to work', 'To speed up inference by skipping the adapter entirely at first'], correct: 0, why: 'ΔW = B·A = 0 at the start, so training begins from the pretrained behavior.' },
      { q: 'You have one 24 GB GPU and an 8B model. The most practical approach is…', options: ['Full fine-tuning in fp32, which needs far more memory', 'Pretraining a new model from scratch on one GPU', 'QLoRA', 'No fine-tuning is possible on a single 24 GB card'], correct: 2, why: '4-bit base + LoRA adapters fits comfortably.' }
    ]
  },
  {
    id: 'preference-alignment', part: 2, chapter: 'Ch. 6', builds: ['training', 'registry'], title: 'Preference alignment with DPO', minutes: 15,
    goal: 'Build preference datasets and understand and implement the DPO loss.',
    sections: [
      { h: 'Beyond imitation', html: '<p>SFT teaches the model to imitate answers. But many qualities, such as tone, helpfulness, safety and conciseness, are easier to express as <b>preferences</b>: given two answers, which is better? A <b>preference dataset</b> holds (prompt, chosen, rejected) triples, collected from humans, from LLM judges, or generated (e.g. your real text as "chosen" and a bland model draft as "rejected").</p>' },
      { h: 'RLHF vs. DPO', html: '<p><b>RLHF</b> trains a separate reward model and then optimizes the LLM with reinforcement learning (PPO). It is powerful, but complex and unstable. <b>Direct Preference Optimization</b> skips both: a simple classification-style loss directly increases the likelihood of chosen answers relative to rejected ones, measured against a frozen <b>reference</b> model so the policy doesn\'t drift too far.</p>' },
      { h: 'The DPO loss', html: '<pre class="snip">margin = β · [(log π(chosen) − log π_ref(chosen)) − (log π(rejected) − log π_ref(rejected))]\nloss   = −log σ(margin)</pre><p>β controls how strongly the policy may deviate from the reference. Push the sliders below to see the loss fall as the model prefers the chosen answer more than the reference did.</p>' }
    ],
    widget: 'dpo',
    terms: [['Preference dataset', 'Triples of prompt, chosen answer and rejected answer.'], ['Reference model', 'Frozen copy of the SFT model used as an anchor.'], ['β (beta)', 'Strength of the constraint keeping the policy near the reference.']],
    lab: { tasks: [
      { prompt: 'Implement the DPO loss with NumPy for a batch of log-probabilities. Use a numerically stable −log σ(z) = <code>np.logaddexp(0, -z)</code>, and return the mean loss and the mean <b>reward margin</b>.',
        starter: `import numpy as np

def dpo_loss(pi_chosen, pi_rejected, ref_chosen, ref_rejected, beta=0.1):
    pi_chosen, pi_rejected = np.asarray(pi_chosen), np.asarray(pi_rejected)
    ref_chosen, ref_rejected = np.asarray(ref_chosen), np.asarray(ref_rejected)
    margin = 0.0   # TODO: beta * ((pi_c - ref_c) - (pi_r - ref_r))
    loss = 0.0     # TODO: mean of -log(sigmoid(margin)), computed stably
    return loss, float(np.mean(margin))

# log-probs of whole answers under the policy and the frozen reference
print(dpo_loss([-12.0, -20.0], [-15.0, -18.0], [-13.0, -19.0], [-14.0, -18.5]))`,
        solution: `def dpo_loss(pi_chosen, pi_rejected, ref_chosen, ref_rejected, beta=0.1):
    pi_chosen, pi_rejected = np.asarray(pi_chosen), np.asarray(pi_rejected)
    ref_chosen, ref_rejected = np.asarray(ref_chosen), np.asarray(ref_rejected)
    margin = beta * ((pi_chosen - ref_chosen) - (pi_rejected - ref_rejected))
    loss = float(np.mean(np.logaddexp(0, -margin)))
    return loss, float(np.mean(margin))`,
        test: `import numpy as np
l, m = dpo_loss([0.0], [0.0], [0.0], [0.0])
assert abs(l - np.log(2)) < 1e-9 and m == 0, "equal to reference -> loss ln 2"
l1, m1 = dpo_loss([-1.0], [-9.0], [-5.0], [-5.0], beta=0.5)
assert abs(m1 - 4.0) < 1e-9 and l1 < 0.05
l2, _ = dpo_loss([-9.0], [-1.0], [-5.0], [-5.0], beta=0.5)
assert l2 > 3.9
assert np.isfinite(dpo_loss([1e4], [-1e4], [0.0], [0.0])[0]), "must be numerically stable"` }
    ] },
    quiz: [
      { q: 'DPO avoids which component of classic RLHF?', options: ['The preference dataset of chosen and rejected answers', 'The base model that is being aligned with the data', 'Tokenization of the prompts and answers in training', 'A separately trained reward model and RL loop'], correct: 3, why: 'DPO optimizes preferences directly with a classification-style loss.' },
      { q: 'If the policy equals the reference on both answers, the DPO loss is…', options: ['0, because the two models already agree perfectly', 'ln 2 ≈ 0.693', '1, because each answer has probability one half', 'Infinite, because the log of the ratio is undefined'], correct: 1, why: 'margin = 0 → −log σ(0) = ln 2.' }
    ]
  },
  /* ---------- PART 4 ---------- */
  {
    id: 'evaluating-llms', part: 3, chapter: 'Ch. 7', builds: ['eval'], title: 'Evaluating LLMs and RAG', minutes: 16,
    goal: 'Measure models with benchmarks, task evals, LLM judges and RAG metrics.',
    sections: [
      { h: 'Three kinds of model evaluation', html: '<ul><li><b>General benchmarks</b> (MMLU, ARC, IFEval, Arena-style human votes): useful for picking a base model, but beware contamination and saturation.</li><li><b>Domain-specific</b> evals: questions from your field.</li><li><b>Task-specific</b> evals: your actual use case, e.g. "does it write like the author and stay factual?". These are the ones that matter for shipping.</li></ul>' },
      { h: 'LLM-as-a-judge', html: '<p>For open-ended text, a strong model grades outputs against a rubric (accuracy, style, relevance) and returns scores with justifications. Make judges reliable with clear criteria and few-shot examples, score one criterion at a time, mitigate position and length bias, and spot-check against human ratings.</p>' },
      { h: 'Evaluating RAG', html: '<p>Score retrieval and generation separately. Frameworks such as Ragas or ARES compute: <b>context precision</b> (are retrieved chunks relevant?), <b>context recall</b> (did we retrieve everything needed?), <b>faithfulness</b> (is every claim supported by the context?) and <b>answer relevancy</b> (does it address the question?). Compare answers in the scorecard below.</p>' }
    ],
    widget: 'ragas',
    terms: [['Benchmark contamination', 'Test questions leaking into training data.'], ['Faithfulness', 'Share of answer claims supported by retrieved context.'], ['Context recall', 'Share of needed information that was retrieved.']],
    lab: { tasks: [
      { prompt: 'Implement <code>context_precision</code> and <code>context_recall</code> over chunk ids, and <code>faithfulness(claims, context)</code>: the share of claims whose content words (lowercase, longer than 3 letters) all appear in the context.',
        starter: `def context_precision(retrieved, relevant):
    return 0.0   # TODO: fraction of retrieved ids that are relevant

def context_recall(retrieved, relevant):
    return 0.0   # TODO: fraction of relevant ids that were retrieved

def faithfulness(claims, context):
    words = set(context.lower().replace(".", " ").replace(",", " ").split())
    return 0.0   # TODO: fraction of claims fully supported

context = "LoRA trains small adapter matrices. QLoRA loads the base model in four bit precision."
claims = ["LoRA trains adapter matrices", "QLoRA loads the base model in four bit", "LoRA doubles inference latency"]
print(context_precision(["c1", "c2", "c7"], {"c1", "c2", "c3"}),
      context_recall(["c1", "c2", "c7"], {"c1", "c2", "c3"}),
      faithfulness(claims, context))`,
        solution: `def context_precision(retrieved, relevant):
    return sum(1 for r in retrieved if r in relevant) / len(retrieved) if retrieved else 0.0

def context_recall(retrieved, relevant):
    return sum(1 for r in relevant if r in retrieved) / len(relevant) if relevant else 1.0

def faithfulness(claims, context):
    words = set(context.lower().replace(".", " ").replace(",", " ").split())
    ok = [all(w in words for w in c.lower().split() if len(w) > 3) for c in claims]
    return sum(ok) / len(ok) if ok else 1.0`,
        test: `assert abs(context_precision(["c1", "c2", "c7"], {"c1", "c2", "c3"}) - 2 / 3) < 1e-9
assert abs(context_recall(["c1", "c7"], {"c1", "c2"}) - 0.5) < 1e-9
assert abs(faithfulness(claims, context) - 2 / 3) < 1e-9
assert context_precision([], {"a"}) == 0.0` }
    ] },
    quiz: [
      { q: 'A RAG answer is fluent and on topic, but cites a number not in any retrieved chunk. Which metric drops?', options: ['Context recall, because the chunk list is incomplete', 'Answer relevancy, because the answer is off topic', 'Faithfulness', 'Latency, because the answer took longer to generate'], correct: 2, why: 'Unsupported claims reduce faithfulness.' },
      { q: 'Which evaluation matters most before shipping your AI twin?', options: ['Task-specific evals on your real use case', 'The MMLU score, because it measures general knowledge well', 'The parameter count, because bigger models always win', 'The training loss, because lower is always better'], correct: 0, why: 'General benchmarks don\'t measure your product.' }
    ]
  },
  /* ---------- PART 5 ---------- */
  {
    id: 'inference-optimization', part: 4, chapter: 'Ch. 8', builds: ['inference'], title: 'Inference optimization: KV cache, batching & parallelism', minutes: 16,
    goal: 'Understand why LLM inference is slow and the techniques that make it fast.',
    sections: [
      { h: 'Why decoding is expensive', html: '<p>LLMs generate one token at a time, and each new token attends to all previous ones. Decoding is usually <b>memory-bandwidth bound</b>: every step streams the whole model through the GPU. So latency is about memory as much as compute.</p>' },
      { h: 'The big wins', html: '<ul><li><b>KV cache</b>: store attention keys and values of past tokens so each step only processes the new token. It is a huge speedup that costs memory (see the lab).</li><li><b>Continuous batching</b>: add and remove requests in the batch at every step, keeping the GPU busy (vLLM, TGI).</li><li><b>Speculative decoding</b>: a small draft model proposes several tokens and the big model verifies them in one pass. The output is identical and faster.</li><li><b>Optimized attention</b> such as FlashAttention and PagedAttention, plus static caches and compilation.</li></ul><p>Compare generation with and without a KV cache below.</p>' },
      { h: 'Model parallelism', html: '<p>When a model doesn\'t fit or is too slow on one GPU: <b>data parallelism</b> copies the model (for throughput), <b>pipeline parallelism</b> splits layers across GPUs, and <b>tensor parallelism</b> splits individual weight matrices across GPUs (lowest latency, needs fast interconnect).</p>' }
    ],
    widget: 'kvcache',
    terms: [['KV cache', 'Stored keys/values of past tokens reused at each decoding step.'], ['Continuous batching', 'Dynamically adding/removing requests per decoding step.'], ['Speculative decoding', 'Draft model proposes, target model verifies in parallel.']],
    lab: { tasks: [
      { prompt: 'Implement <code>kv_cache_bytes</code> = 2 (K and V) × layers × kv_heads × head_dim × seq_len × batch × bytes_per_value, and <code>tokens_processed(prompt, new, cache)</code>: without a cache every step reprocesses the whole sequence so far; with a cache it\'s the prompt once plus one token per step.',
        starter: `def kv_cache_bytes(n_layers, n_kv_heads, head_dim, seq_len, batch=1, bytes_per=2):
    return 0   # TODO

def tokens_processed(prompt_len, new_tokens, cache=True):
    return 0   # TODO

# A Llama-3-8B-style config: 32 layers, 8 KV heads (GQA), head_dim 128, fp16
gib = kv_cache_bytes(32, 8, 128, 8192) / 2**30
print(f"KV cache for one 8k-token sequence: {gib:.2f} GiB")
print("tokens processed, no cache:", tokens_processed(1000, 200, cache=False))
print("tokens processed, cache:   ", tokens_processed(1000, 200, cache=True))`,
        solution: `def kv_cache_bytes(n_layers, n_kv_heads, head_dim, seq_len, batch=1, bytes_per=2):
    return 2 * n_layers * n_kv_heads * head_dim * seq_len * batch * bytes_per

def tokens_processed(prompt_len, new_tokens, cache=True):
    if cache:
        return prompt_len + new_tokens
    return sum(prompt_len + i for i in range(new_tokens))`,
        test: `assert kv_cache_bytes(32, 8, 128, 8192) == 2 ** 30
assert kv_cache_bytes(32, 8, 128, 8192, batch=4, bytes_per=1) == 2 ** 31
assert tokens_processed(10, 3, cache=True) == 13
assert tokens_processed(10, 3, cache=False) == 10 + 11 + 12` }
    ] },
    quiz: [
      { q: 'What does the KV cache trade?', options: ['Accuracy for speed, by approximating the attention', 'Memory for compute', 'Disk space for network bandwidth between servers', 'Nothing, because the cache is a free speed-up for decoding'], correct: 1, why: 'It stores past keys/values (memory) to avoid recomputing them.' },
      { q: 'Speculative decoding changes the generated text…', options: ['Always, because the draft model changes the wording', 'Only for long prompts, where the draft is less accurate', 'Only when combined with quantization of the target model', 'Not at all, when verification is exact'], correct: 3, why: 'The target model accepts or rejects draft tokens, preserving its distribution.' }
    ]
  },
  {
    id: 'quantization', part: 4, chapter: 'Ch. 8', builds: ['inference', 'registry'], title: 'Quantization: smaller, faster models', minutes: 14,
    goal: 'Quantize weights to 8 and 4 bits and understand GGUF, GPTQ and AWQ.',
    sections: [
      { h: 'Why quantize', html: '<p>An 8B model in fp16 needs ~16 GB just for weights. Store weights in <b>8 or 4 bits</b> instead and it shrinks 2–4×, loads faster and often runs faster, because decoding is memory-bound. The cost is a small, usually acceptable quality loss.</p>' },
      { h: 'The basic recipes', html: '<ul><li><b>Absmax (symmetric)</b>: scale = 127 / max|x|, q = round(x · scale). Simple, but one outlier wastes the range.</li><li><b>Zero-point (asymmetric)</b>: map [min, max] to [−128, 127] with a scale and an offset. Better for skewed distributions.</li></ul><p>Real methods quantize in small <b>blocks</b> or groups (each with its own scale) and handle <b>outlier</b> features specially. Slide the bit width below and watch the error.</p>' },
      { h: 'Formats you will meet', html: '<p><b>GGUF</b> (llama.cpp) is for CPU and edge inference with many k-quant levels. <b>GPTQ</b> uses layer-wise quantization that minimizes output error with a calibration set. <b>AWQ</b> protects salient weights based on activations. <b>bitsandbytes</b> NF4 is used in QLoRA, and EXL2 offers mixed precision. Always evaluate the quantized model on your task.</p>' }
    ],
    widget: 'quant',
    terms: [['Absmax quantization', 'Symmetric scaling by the maximum absolute value.'], ['Zero-point quantization', 'Asymmetric mapping of [min, max] with an offset.'], ['GGUF', 'File format for quantized models used by llama.cpp.']],
    lab: { tasks: [
      { prompt: 'Implement absmax and zero-point int8 quantization with dequantization. Values must be <code>int8</code>, and the round-trip error must stay small.',
        starter: `import numpy as np

def absmax_quantize(x):
    scale = 127 / np.max(np.abs(x))
    q = x   # TODO: round(x * scale) as int8
    return q, scale

def absmax_dequantize(q, scale):
    return q   # TODO

def zeropoint_quantize(x):
    scale = 255 / (np.max(x) - np.min(x))
    zp = 0     # TODO: zero point = round(-scale * min(x)) - 128
    q = x      # TODO: clip(round(x * scale + zp), -128, 127) as int8
    return q, scale, zp

def zeropoint_dequantize(q, scale, zp):
    return q   # TODO

w = np.array([-0.62, 0.11, 0.03, 1.47, -0.08, 0.5])
q, s = absmax_quantize(w)
print("absmax  :", q, np.round(absmax_dequantize(q, s), 3))
q2, s2, z = zeropoint_quantize(w)
print("zero-pt :", q2, np.round(zeropoint_dequantize(q2, s2, z), 3))`,
        solution: `def absmax_quantize(x):
    scale = 127 / np.max(np.abs(x))
    return np.round(x * scale).astype(np.int8), scale

def absmax_dequantize(q, scale):
    return q.astype(np.float64) / scale

def zeropoint_quantize(x):
    scale = 255 / (np.max(x) - np.min(x))
    zp = int(np.round(-scale * np.min(x)) - 128)
    q = np.clip(np.round(x * scale + zp), -128, 127).astype(np.int8)
    return q, scale, zp

def zeropoint_dequantize(q, scale, zp):
    return (q.astype(np.float64) - zp) / scale`,
        test: `import numpy as np
x = np.random.default_rng(0).normal(size=1000)
q, s = absmax_quantize(x)
assert q.dtype == np.int8 and q.max() == 127 or q.min() == -127
assert np.max(np.abs(absmax_dequantize(q, s) - x)) <= 0.5 / s + 1e-9
q2, s2, z = zeropoint_quantize(x)
assert q2.dtype == np.int8 and q2.min() <= -127 and q2.max() >= 126, "use the full int8 range"
assert np.max(np.abs(zeropoint_dequantize(q2, s2, z) - x)) <= 1 / s2` }
    ] },
    quiz: [
      { q: 'Why does one large outlier hurt absmax quantization?', options: ['It stretches the scale so most values use only a few levels', 'It overflows the int8 range and wraps around to negative values', 'It makes the quantized model file larger on disk than before', 'It does not hurt at all, because absmax ignores extreme values'], correct: 0, why: 'The range is set by the max; small values lose precision.' },
      { q: 'You want to run an 8B model on a laptop CPU. Likely choice?', options: ['fp32 safetensors loaded with a CPU-only runtime', 'Full fine-tuning of the model on the laptop itself', 'A 4-bit GGUF with llama.cpp', 'Tensor parallelism across several graphics cards'], correct: 2, why: 'GGUF quantization targets CPU/edge inference.' }
    ]
  },
  {
    id: 'rag-inference', part: 4, chapter: 'Ch. 9', builds: ['inference', 'vectordb'], title: 'The RAG inference pipeline', minutes: 15,
    goal: 'Assemble retrieval, reranking and prompting into one inference pipeline.',
    sections: [
      { h: 'Request flow', html: '<p>For each user query, the inference pipeline: ① extracts filters with <b>self-query</b> (e.g. the author), ② <b>expands</b> the query into several variants, ③ runs <b>filtered vector search</b> for each variant in parallel, ④ deduplicates and <b>reranks</b> the union, keeping the top-k, ⑤ builds the <b>prompt</b> with the context, and ⑥ calls the fine-tuned LLM. Step through a request below.</p>' },
      { h: 'Business logic vs. the LLM service', html: '<p>Keep the retrieval and prompt logic in a lightweight <b>business service</b> (CPU, scales cheaply) and the model behind a separate <b>LLM service</b> (GPU endpoint). The two scale independently, and you can swap the model without touching retrieval code.</p>' },
      { h: 'Prompt assembly with a budget', html: '<p>Context windows are finite and tokens cost money. Order chunks by relevance, stop before the <b>token budget</b> is exceeded, number them so the model can <b>cite</b> sources, and tell it to say when the context is insufficient. Trace every request (prompt, chunks, latency, cost) to debug quality later.</p>' }
    ],
    widget: 'ragflow',
    terms: [['Self-query', 'Extracting structured filters from a natural-language query.'], ['Token budget', 'Maximum tokens allotted to retrieved context.'], ['Business service', 'Lightweight service holding retrieval and prompt logic.']],
    lab: { tasks: [
      { prompt: 'Implement <code>build_prompt(query, chunks, max_words)</code>: sort chunks by score (desc), add them as <code>[1] text</code>, <code>[2] text</code>, … while the total context words stay ≤ <code>max_words</code> (skip any chunk that doesn\'t fit), and return <code>(prompt, used_sources)</code>.',
        starter: `def build_prompt(query, chunks, max_words=40):
    lines, used, total = [], [], 0
    # TODO: for c in sorted(chunks, key=lambda c: -c["score"]):
    #         n = len(c["text"].split()); add if total + n <= max_words
    context = "\\n".join(lines)
    prompt = ("Answer using only the context. Cite sources like [1].\\n"
              "Context:\\n" + context + "\\nQuestion: " + query)
    return prompt, used

chunks = [
    {"source": "post-12", "score": 0.71, "text": "QLoRA fine-tunes adapters on a 4-bit base model."},
    {"source": "post-03", "score": 0.92, "text": "LoRA learns low-rank updates while the base model stays frozen and adapters can be merged later."},
    {"source": "post-40", "score": 0.30, "text": "Our team retreat was in Lisbon."},
]
prompt, used = build_prompt("How does LoRA work?", chunks)
print(prompt)
print("sources:", used)`,
        solution: `def build_prompt(query, chunks, max_words=40):
    lines, used, total = [], [], 0
    for c in sorted(chunks, key=lambda c: -c["score"]):
        n = len(c["text"].split())
        if total + n > max_words:
            continue
        total += n
        used.append(c["source"])
        lines.append("[" + str(len(used)) + "] " + c["text"])
    context = "\\n".join(lines)
    prompt = ("Answer using only the context. Cite sources like [1].\\n"
              "Context:\\n" + context + "\\nQuestion: " + query)
    return prompt, used`,
        test: `p, used = build_prompt("How does LoRA work?", chunks, 40)
assert used == ["post-03", "post-12", "post-40"], used
assert "[1] LoRA learns" in p and "[2] QLoRA" in p and p.endswith("Question: How does LoRA work?")
p, used = build_prompt("q", chunks, 22)
assert used == ["post-03", "post-40"], "skip chunks that don't fit, keep trying smaller ones: " + str(used)` }
    ] },
    quiz: [
      { q: 'Why separate the business (retrieval) service from the LLM service?', options: ['HTTP requires every endpoint to live in its own service', 'To add latency, so that the retrieval step can be measured', 'For security reasons only, since nothing else differs between them', 'They have different hardware needs and scale independently'], correct: 3, why: 'CPU retrieval and GPU generation scale and evolve differently.' },
      { q: 'Numbering chunks [1], [2] in the prompt mainly enables…', options: ['Faster decoding, because numbered text is shorter', 'Citations and traceability', 'Quantization of the context to fit more chunks', 'Smaller prompts, since the numbers replace the text'], correct: 1, why: 'The model can reference sources the user can verify.' }
    ]
  },
  /* ---------- PART 6 ---------- */
  {
    id: 'deployment', part: 5, chapter: 'Ch. 10', builds: ['api'], title: 'Deploying the inference pipeline', minutes: 15,
    goal: 'Choose a deployment type and autoscale an LLM service.',
    sections: [
      { h: 'Pick the deployment type by requirements', html: '<p>Start from <b>throughput</b>, <b>latency</b>, data and infrastructure needs, and cost:</p><ul><li><b>Online real-time</b> (REST/gRPC): a user is waiting; you need low latency.</li><li><b>Asynchronous</b>: requests go into a queue and results arrive later. This suits long generations and spiky traffic.</li><li><b>Offline batch</b>: process large datasets on a schedule at the lowest cost.</li></ul>' },
      { h: 'Monolith vs. microservices', html: '<p>A <b>monolith</b> serves retrieval and the LLM in one process. It is simple, but the GPU sits idle during CPU work and everything scales together. <b>Microservices</b> put the LLM on GPU endpoints (e.g. a SageMaker endpoint running a TGI container) and the business logic in a lightweight API (e.g. FastAPI). That is more moving parts, but each scales independently.</p>' },
      { h: 'Autoscaling', html: '<p>Traffic spikes. <b>Autoscaling</b> adds replicas when a metric (GPU utilization, requests per instance, queue depth) crosses a target, and removes them when load drops, within <b>min/max</b> bounds and with <b>cooldowns</b> to avoid flapping. LLM replicas start slowly (loading weights), so scale out early. Simulate a spike below.</p>' }
    ],
    widget: 'autoscale',
    terms: [['Online inference', 'Synchronous, low-latency predictions for waiting users.'], ['Asynchronous inference', 'Queued requests processed later; results delivered when ready.'], ['Cooldown', 'Minimum time between scaling actions to prevent flapping.']],
    lab: { tasks: [
      { prompt: 'Implement target-tracking autoscaling: <code>desired = ceil(current × utilization / target)</code>, clamped to <code>[min_r, max_r]</code>. During a cooldown, only scale <b>out</b>, never in.',
        starter: `import math

def desired_replicas(current, utilization, target=0.6, min_r=1, max_r=8, in_cooldown=False):
    desired = current   # TODO: target-tracking formula
    # TODO: clamp to [min_r, max_r]
    # TODO: if in_cooldown and desired < current -> keep current
    return desired

for util in [0.2, 0.6, 0.9, 1.5]:
    print(f"4 replicas at {util:.0%} utilization -> {desired_replicas(4, util)}")`,
        solution: `def desired_replicas(current, utilization, target=0.6, min_r=1, max_r=8, in_cooldown=False):
    desired = math.ceil(current * utilization / target)
    desired = max(min_r, min(max_r, desired))
    if in_cooldown and desired < current:
        return current
    return desired`,
        test: `assert desired_replicas(4, 0.9) == 6
assert desired_replicas(4, 0.6) == 4
assert desired_replicas(4, 0.2) == 2
assert desired_replicas(4, 1.5) == 8 and desired_replicas(6, 3.0) == 8, "respect max replicas"
assert desired_replicas(1, 0.0) == 1, "respect min replicas"
assert desired_replicas(4, 0.2, in_cooldown=True) == 4 and desired_replicas(4, 0.9, in_cooldown=True) == 6` }
    ] },
    quiz: [
      { q: 'Users submit 20-minute report-generation jobs at unpredictable times. Best deployment type?', options: ['Asynchronous inference with a queue', 'Online real-time inference that keeps the request open', 'An offline nightly batch only, run once per day', 'Running the model on the user\'s phone for every job'], correct: 0, why: 'Long, spiky workloads fit queues and async results.' },
      { q: 'Why scale LLM services out earlier than typical web services?', options: ['GPUs are cheap, so extra replicas cost almost nothing to keep idle', 'To reduce accuracy, because many replicas answer less precisely', 'New replicas take a long time to start (loading large weights)', 'It is not needed, since LLM services behave like any web service'], correct: 2, why: 'Slow cold starts mean you must anticipate load.' }
    ]
  },
  {
    id: 'llmops', part: 5, chapter: 'Ch. 11 & Appendix', builds: ['ops', 'eval'], title: 'MLOps & LLMOps in production', minutes: 16,
    goal: 'Automate, monitor and safely release LLM systems.',
    sections: [
      { h: 'DevOps → MLOps → LLMOps', html: '<p><b>DevOps</b> brought CI/CD and infrastructure as code. <b>MLOps</b> adds data and models: versioning, experiment tracking, the model registry, <b>continuous training</b> and monitoring for drift. <b>LLMOps</b> adds LLM-specific concerns: prompt versioning and monitoring, human feedback, guardrails, evaluation with LLM judges, and cost and latency per token.</p>' },
      { h: 'Core principles', html: '<ul><li><b>Automation</b>: pipelines over manual steps.</li><li><b>Versioning</b>: code, data and models.</li><li><b>Experiment tracking</b>.</li><li><b>Testing</b>: code, data and model behavior.</li><li><b>Monitoring</b>: system metrics, quality and drift.</li><li><b>Reproducibility</b>.</li></ul><p>Put them together in a CI/CD/CT flow: every change runs tests and evaluations, and only a candidate that beats the baseline gets deployed. Try to sneak a regression past the gate below.</p>' },
      { h: 'Monitoring LLMs', html: '<p>Log every prompt and response as a <b>trace</b> with latency, tokens, cost and retrieved context (prompt monitoring tools do this). Run online evaluations on samples, collect user feedback, alert on anomalies such as quality drops, cost spikes and error rates, and add <b>guardrails</b> for input and output (PII, toxicity, prompt injection).</p>' }
    ],
    widget: 'cicd',
    terms: [['Continuous training (CT)', 'Automatically retraining models when data or code changes.'], ['Trace', 'Record of one request: prompts, context, outputs, latency and cost.'], ['Release gate', 'Automated check that blocks deployment on regressions.']],
    lab: { tasks: [
      { prompt: 'Implement <code>release_gate(candidate, baseline, max_regression, minimums)</code>: block if any metric drops more than <code>max_regression</code> below the baseline or falls under its minimum. Return <code>(deploy: bool, reasons: list)</code> with one reason per failure.',
        starter: `def release_gate(candidate, baseline, max_regression=0.02, minimums=None):
    minimums = minimums or {}
    reasons = []
    # TODO: for each metric in baseline:
    #   if candidate[m] < baseline[m] - max_regression -> reasons.append(f"{m} regressed")
    #   if m in minimums and candidate[m] < minimums[m] -> reasons.append(f"{m} below minimum")
    return len(reasons) == 0, reasons

baseline  = {"faithfulness": 0.86, "style_score": 0.78, "answer_relevancy": 0.90}
candidate = {"faithfulness": 0.81, "style_score": 0.85, "answer_relevancy": 0.91}
print(release_gate(candidate, baseline, minimums={"faithfulness": 0.85}))`,
        solution: `def release_gate(candidate, baseline, max_regression=0.02, minimums=None):
    minimums = minimums or {}
    reasons = []
    for m in baseline:
        if candidate[m] < baseline[m] - max_regression:
            reasons.append(f"{m} regressed")
        if m in minimums and candidate[m] < minimums[m]:
            reasons.append(f"{m} below minimum")
    return len(reasons) == 0, reasons`,
        test: `ok, r = release_gate(candidate, baseline, minimums={"faithfulness": 0.85})
assert not ok and r == ["faithfulness regressed", "faithfulness below minimum"], r
ok, r = release_gate({"a": 0.89}, {"a": 0.90})
assert ok and r == [], "a drop within tolerance should pass"
ok, r = release_gate({"a": 0.95, "b": 0.5}, {"a": 0.90, "b": 0.6})
assert not ok and r == ["b regressed"]` }
    ] },
    quiz: [
      { q: 'What does LLMOps add on top of MLOps?', options: ['Version control for the code and the configuration files', 'Prompt monitoring, LLM-judge evals, guardrails and token-cost tracking', 'Unit tests that run on every commit of the repository', 'Containers that package the service for any environment, in the same way as before'], correct: 1, why: 'These concerns are specific to LLM applications.' },
      { q: 'A new fine-tune improves style but lowers faithfulness below the minimum. The release gate should…', options: ['Deploy anyway, because the improved style is what users see', 'Delete the baseline so the comparison cannot fail again', 'Retrain forever until faithfulness and style are both perfect', 'Block the release and report the reason'], correct: 3, why: 'Gates prevent quality regressions from reaching users.' }
    ]
  }
  ]
};
