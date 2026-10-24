/* Personalised-explanation texts for the LLM Engineering course. The mechanism (recommendation rules, panel) lives in
   agents-coach.js; this file only registers the authored explanations. */
(() => {
  'use strict';
  const BANK = {
    'ai-twin-architecture': {
      analogy: "A restaurant with three stations: a prep kitchen (features), a recipe-testing bench (training) and the service line (inference). They never shout across the room. They pass things through the pantry (the feature store) and the recipe book (the model registry).",
      example: "The feature pipeline writes cleaned chunks and embeddings to the feature store. Training reads a snapshot and publishes model version 7 to the registry. Inference loads the latest registered version and never calls the training code.",
      mistake: "Letting one pipeline call another directly or share local files. You then cannot rerun, scale or replace any one pipeline without breaking the others.",
      stretch: "Which of the three pipelines could fail for an hour without users noticing, and which stored artifact makes that safe?"
    },
    'llmops-toolbox': {
      analogy: "A lab notebook and a warehouse. The experiment tracker is the notebook, the model registry is the labelled shelves, and the orchestrator is the recipe that remembers which dishes it has already made.",
      example: "Five fine-tuning runs are logged to an experiment tracker so that their loss curves can be compared. The orchestrator skips a step whose inputs have not changed, because it records the lineage of every artifact.",
      mistake: "Treating the tools as interchangeable. A vector database does not track experiments, and a model registry does not run pipelines.",
      stretch: "A result cannot be reproduced six months later. List three things you would have needed to record."
    },
    'data-engineering': {
      analogy: "Sorting donated books before stocking a library: remove the dust jackets (HTML), put aside the duplicates, and keep the untouched originals in the basement in case your sorting rules improve.",
      example: "clean_text strips tags and links, and dedupe keeps a document only if its similarity to the ones already kept is below a threshold. The raw crawl stays in the warehouse so that it can be cleaned again.",
      mistake: "Deleting the raw data after cleaning. Every later improvement to the cleaning rules would then mean crawling everything again.",
      stretch: "The same article appears on three sites with small edits. Which threshold risks removing legitimate variants, and how would you check?"
    },
    'rag-fundamentals': {
      analogy: "Index cards for a textbook. Cards that are too small cut an answer in half, cards that are too big bury it, and a little overlap repeats the sentence on both sides of every cut.",
      example: "chunk_words with size 100 and overlap 20 advances 80 words at a time, so an answer that straddles a boundary still appears whole in at least one chunk. Metadata such as author lets you filter the search.",
      mistake: "Choosing the chunk size by habit. Too small splits answers across chunks and too large dilutes the match and wastes context.",
      stretch: "Design a quick test that finds the chunk size that suits your documents. What would you measure?"
    },
    'advanced-rag': {
      analogy: "Two librarians: one finds books by meaning, the other by exact title. Reciprocal rank fusion asks both and rewards books near the top of either list. A reranker then reads the short list carefully.",
      example: "A user searches for the error code E-4012. Vector search returns conceptually similar errors, keyword search (BM25) puts the exact code first, and fusion with score 1 / (k + rank) brings it to the top. Then 20 candidates are reranked down to 5.",
      mistake: "Believing that a bigger embedding model will fix exact-identifier queries. Embeddings blur exact strings, so add a keyword component.",
      stretch: "Why retrieve 20 chunks and rerank to 5 instead of retrieving 5 directly? What does it cost?"
    },
    'instruction-datasets': {
      analogy: "A teaching syllabus. A small set of clear, correct lessons beats a mountain of sloppy ones, and the exam questions must never be among the practice problems.",
      example: "ChatML wraps each turn in <|im_start|>role blocks. If the model is trained on ChatML but served with a different template, it sees a format it never learned and its answers degrade.",
      mistake: "Mixing prompt templates between training and serving, or leaving evaluation questions in the training data. The second is contamination, and it makes the evaluation meaningless.",
      stretch: "How would you detect that your evaluation set leaked into the training data?"
    },
    'sft-lora': {
      analogy: "Instead of rewriting a textbook you stick thin transparencies over its pages. The transparencies are small, and because one of them starts blank (B = 0) the book reads exactly as before at the start.",
      example: "LoRA adds (alpha / r) · x · A · B to x · W. For a 4096 by 4096 layer with r = 8, A and B hold 2 × 4096 × 8 = 65,536 trainable numbers instead of about 16.8 million. QLoRA also quantizes the base so an 8B model fits on one 24 GB GPU.",
      mistake: "Thinking LoRA changes the base weights. It trains separate small matrices next to them, and starting with B = 0 guarantees the adapted model begins identical to the base.",
      stretch: "What changes in memory, and in what the adapter can learn, if you raise the rank r from 8 to 64?"
    },
    'preference-alignment': {
      analogy: "Instead of training a judge to score essays and then coaching a writer against that judge (RLHF), DPO simply shows the writer pairs of a better and a worse essay and nudges the writing directly.",
      example: "DPO loss is −log σ(β · [(log π(chosen) − log π_ref(chosen)) − (log π(rejected) − log π_ref(rejected))]). If the policy equals the reference the bracket is 0 and the loss is ln 2 ≈ 0.693.",
      mistake: "Believing that DPO needs no extra ingredients. It removes the separate reward model and the RL loop, but it still needs good preference pairs and a reference model.",
      stretch: "What goes wrong if your preference pairs are noisy, or if the chosen answers are systematically the longer ones?"
    },
    'evaluating-llms': {
      analogy: "A restaurant critic who scores taste, presentation and honesty separately. A dish can look perfect and still contain an ingredient that was never in the kitchen. That is a faithfulness failure.",
      example: "An answer is fluent and on topic but quotes a number that appears in no retrieved chunk. Context precision and recall can be fine, yet faithfulness drops because that claim is unsupported.",
      mistake: "Trusting a public benchmark such as MMLU to tell you whether your application works. Task-specific evaluations on your own use case decide that.",
      stretch: "Design three metrics for a RAG assistant that tell retrieval failures apart from generation failures."
    },
    'inference-optimization': {
      analogy: "A waiter who writes down each table's earlier orders instead of re-reading the whole conversation every time. The notebook costs space (memory) and saves effort (compute). That is the KV cache.",
      example: "kv_cache_bytes = 2 × layers × kv_heads × head_dim × sequence length × batch × bytes per value. Double the sequence length and the cache doubles, so long contexts and big batches can exhaust GPU memory.",
      mistake: "Treating the KV cache as free. It trades memory for compute, and the memory is what runs out first at long context lengths.",
      stretch: "Speculative decoding drafts tokens with a small model and verifies them with the large one. When does it help, and when does it not?"
    },
    'quantization': {
      analogy: "Rounding every price to the nearest dollar works until one very expensive item stretches the scale, and then most of the cheap items collapse into a few buckets.",
      example: "absmax int8 maps the largest absolute value to 127. One huge outlier stretches the scale, so most weights end up using only a few of the 255 available levels and the rounding error grows.",
      mistake: "Assuming that lower precision is free. Small models usually lose more quality, so rerun your own evaluations after every quantization.",
      stretch: "Why is a 4-bit GGUF file a sensible choice for a laptop CPU, and what would you check before shipping it?"
    },
    'llm-service-lab': {
      analogy: "Choosing a vehicle. A lorry carries anything but is a poor way to fetch groceries, and a convoy that always tries the bicycle first wastes a trip whenever the bicycle cannot manage the load.",
      example: "The medium model at full precision answers 37 of the 40 requests correctly for $0.0148 with a p95 of 1,298 ms. The small-then-large cascade matches its quality but costs $0.0755, because 19 requests paid for both models.",
      mistake: "Assuming a cascade or a cache always saves money. A cascade only pays when the cheap model handles most requests, and a cache lowers cost but not the tail latency of the requests that miss it.",
      stretch: "Find the cheapest setting that meets the goal. Then imagine that most requests were easy instead: which setting would you choose, and why?"
    },
    'rag-inference': {
      analogy: "Handing someone evidence with numbered footnotes. The prompt builder lists chunks as [1], [2], … so that the answer can cite them, and it stops adding chunks when the page is full.",
      example: "build_prompt sorts chunks by score and adds them as “[1] text”, “[2] text” until the word budget would be exceeded. The model can then answer with “see [2]”.",
      mistake: "Running retrieval and generation in one service. They have different hardware needs and should be able to scale independently.",
      stretch: "What would you change in the prompt layout so that a reader can check each claim against its source?"
    },
    'deployment': {
      analogy: "Three kinds of delivery: counter service (real-time), order ahead (an asynchronous queue) and overnight delivery (batch). LLM replicas are slow to start, so you add staff before the rush, not during it.",
      example: "Target-tracking autoscaling computes desired = ceil(current × utilization / target), clamped to a minimum and maximum. During a cooldown the service may only scale out, never in.",
      mistake: "Treating an LLM service like an ordinary web service. New replicas take minutes to load large weights, so they must be started early.",
      stretch: "A 20-minute report job arrives at random times. Sketch the queue, the workers and the progress updates."
    },
    'llmops': {
      analogy: "A factory's quality gate before the lorry leaves: measure faithfulness, style and cost, and block the shipment if anything has dropped more than allowed.",
      example: "release_gate compares a candidate with the baseline. A fine-tune that improves style but pushes faithfulness below its minimum is blocked, and the gate reports the reason.",
      mistake: "Shipping because the average improved or because one metric got better. A metric that falls below its floor blocks the release whatever else improved.",
      stretch: "Which metrics would you gate on for a customer-support assistant, and which would you only monitor?"
    },
    'llm-gateway-project': {
      analogy: "Airport control. The rate limiter is the queue management, the cache a fast lane for repeat travellers, the cascade the cheap counter you try first, the ledger the bill, and the canary a test flight before the whole fleet changes.",
      example: "A canary that has served 60 requests gets a hold. One with 400 requests and a p95 20% above the baseline gets a rollback with the reason “latency”. The cascade checks its budget before paying for the next model.",
      mistake: "Judging a canary on too little traffic, in either direction, or checking the cost cap after the expensive call has already been made.",
      stretch: "Add a sixth control of your own, such as a per-tenant list of allowed models. Which hidden test would you write first?"
    }
  };
  if (window.AgentsCoach) window.AgentsCoach.register('llm-engineering', BANK, () => window.LLM_COURSE);
  window.LLMCoachBank = BANK;
})();
