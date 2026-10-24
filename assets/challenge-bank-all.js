/* Practice activities and review questions for every flagship lesson (7 courses, 127 lessons).
   - AUTHORED: one ordering or select-all activity per lesson (this file).
   - DERIVED:  a term-recall short answer and rotating review questions built from each lesson's own key terms,
               plus a review question derived from the authored activity. Derived items are labeled in the UI.
   Format:  'lesson-id': ['O', prompt, [steps in correct order]]
            'lesson-id': ['M', prompt, [correct options], [wrong options]]                                        */
(() => {
  'use strict';
  const B = window.LEARNING_CHALLENGES; if (!B) return;
  const COURSES = [window.DB_COURSE, window.AGENTS_COURSE, window.ML_COURSE, window.LLM_COURSE, window.PROMPT_COURSE, window.AI_COURSE, window.DL_COURSE].filter(Boolean);

  const AUTHORED = {
    databases: {
      'index-lab': ['M', "Which statements about indexes are true? Select all that apply.", ['An index is sorted by its first column, then by the second inside it', 'A function wrapped around an indexed column can stop the index from being used', 'Every extra index makes INSERTs more expensive'], ['An index always makes a query faster', 'A foreign key creates an index automatically in SQLite']],
      'gym-booking-project': ['O', "Order the steps of building a database that defends itself.", ['Create tables with keys and constraints', 'Load the data, parents before children', 'Make writes conditional with a guarded insert', 'Report with joins and aggregates', 'Add an index and an audit trigger']],
      'data-models': ['M', "Which are the building blocks of a data model? Select all that apply.", ['Entity', 'Attribute', 'Relationship', 'Constraint'], ['Cursor', 'Trigger']],
      'relational-model': ['O', "Order how the DBMS checks a foreign key when a row is inserted.", ['A row arrives with a foreign key value', "The DBMS looks the value up in the parent table's primary key", 'A match means the row is accepted; no match means it is rejected']],
      'er-modeling': ['O', "Order the steps to implement a many-to-many relationship.", ['Identify the M:N relationship between two entities', 'Create a bridge (composite) entity', 'Give it a foreign key to each parent', 'Use those keys together as its primary key']],
      'advanced-modeling': ['M', "Which decisions describe a supertype/subtype hierarchy? Select all that apply.", ['Disjoint vs. overlapping subtypes', 'Complete vs. partial coverage'], ['Clustered vs. hashed storage', 'Strong vs. weak encryption']],
      'normalization': ['O', "Order the normal forms from the first to the strongest listed.", ['1NF: remove repeating groups', '2NF: remove partial dependencies', '3NF: remove transitive dependencies', 'BCNF: every determinant is a candidate key']],
      'sql-select': ['O', "Put the logical processing order of a SELECT statement in sequence.", ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY']],
      'sql-joins': ['M', "Which join types can return rows that have no match in the other table?", ['LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'], ['INNER JOIN', 'CROSS JOIN']],
      'sql-aggregates': ['M', "Which of these are aggregate functions? Select all that apply.", ['COUNT', 'SUM', 'AVG', 'MAX'], ['LIKE', 'ORDER']],
      'advanced-sql': ['O', "Order the steps of creating and using a view.", ['Write the SELECT you want to reuse', 'Save it with CREATE VIEW name AS …', 'Query the view like a table in later statements']],
      'database-design': ['O', "Order the phases of the database life cycle.", ['Initial study', 'Database design', 'Implementation and loading', 'Testing and evaluation', 'Operation', 'Maintenance and evolution']],
      'transactions': ['O', "Order a successful transaction.", ['BEGIN the transaction', 'Run the related changes', 'COMMIT to make them permanent', 'The changes become visible to other users']],
      'performance': ['M', "Which usually help query performance? Select all that apply.", ['An index on a selective WHERE column', 'Up-to-date optimizer statistics', 'Selecting only the columns you need'], ["A leading wildcard such as LIKE '%x'", 'Wrapping an indexed column in a function']],
      'distributed': ['M', "Which are ways to distribute data in a DDBMS?", ['Horizontal fragmentation', 'Vertical fragmentation', 'Replication'], ['Triggers', 'Views']],
      'bi-warehouse': ['O', "Order the data flow into a warehouse.", ['Extract data from operational systems', 'Transform and clean it', 'Load it into the warehouse', 'Analyze it with OLAP or BI tools']],
      'nosql': ['M', "Which are NoSQL data model families?", ['Key-value', 'Document', 'Column-family', 'Graph'], ['Star schema', 'B-tree index']],
      'connectivity-web': ['O', "Order a web request that reads from a database.", ['The browser sends a request', 'Server-side code builds a parameterized query', 'The DBMS runs it and returns rows', 'The server formats the result as JSON or HTML']],
      'dba-security': ['M', "Which are database security controls? Select all that apply.", ['Least-privilege roles', 'Views that hide columns', 'Auditing', 'Encryption'], ['Disabling backups', 'Sharing one admin password']]
    },
    'ai-agents': {
      'agent-arena': ['M', "Which controls reduce SILENT failures (wrong answers or actions nobody asked for) in the arena? Select all that apply.", ['Validate tool output', 'Injection filter', 'Human approval for risky tools'], ['A bigger step budget', 'More retries']],
      'support-desk-project': ['O', "Order the safe path for one tool call in your agent.", ['Validate the arguments against the tool schema', 'Ask for human approval if the tool is risky', 'Run the tool, retrying if it is flaky', 'Scan the result for instruction-like text', 'Record the decision in the audit log']],
      'true-agency': ['O', "Order the agentic loop.", ['Sense: take in the goal and observations', 'Plan: break the goal into tasks', 'Act: execute the next task with a tool', 'Learn: compare the result with the plan']],
      'agent-anatomy': ['M', "Which are layers of an agent? Select all that apply.", ['Persona', 'Tools and actions', 'Knowledge and memory'], ['Screen resolution', 'Compiler flags']],
      'tool-calling': ['O', "Order a tool call.", ['The model sees the JSON schema', 'The model emits a structured call with arguments', 'Your code validates and runs the function', 'The result goes back to the model']],
      'mcp': ['O', "Order an MCP session.", ['The client connects to the server', 'The client calls tools/list', 'The model chooses a tool', 'The client sends tools/call', 'The server returns the result']],
      'reasoning': ['M', "Which are reasoning patterns for LLMs?", ['Chain-of-thought', 'ReAct', 'Tree-of-thought', 'Reflexion'], ['Backpropagation', 'Garbage collection']],
      'goals-planning': ['O', "Order plan-and-execute.", ['Decompose the goal into sub-goals', 'Break sub-goals into leaf tasks', 'Execute leaf tasks one at a time', 'Re-plan a branch if a leaf fails']],
      'metacognition': ['M', "Which behaviors show situational awareness?", ['Abstaining when confidence is low', 'Detecting a repeated tool-call loop', 'Checking claims against sources'], ['Answering confidently regardless', 'Ignoring tool errors']],
      'learning-agents': ['M', "Which are concepts from reinforcement learning?", ['Reward', 'Policy', 'Exploration vs. exploitation'], ['Foreign key', 'Sitemap']],
      'context-engineering': ['M', "Which are kinds of agent memory?", ['Short-term', 'Episodic', 'Semantic', 'Procedural'], ['Hash table', 'Cache line']],
      'rag': ['O', "Order the RAG pipeline.", ['Chunk the documents', 'Embed each chunk', 'Index the vectors in a vector store', 'Retrieve the nearest chunks for a query', 'Generate an answer using them']],
      'data-moat': ['O', "Order dream, distill, differentiate.", ['Dream: generate many scenarios', 'Distill: deduplicate and keep the hard cases', 'Differentiate: feed results into evals and training']],
      'multi-agent': ['M', "Which are multi-agent topologies from this lesson?", ['Orchestration (hub and spoke)', 'Collaboration (team of agents)'], ['Single linked list', 'Round-robin DNS']],
      'frameworks': ['M', "Which are core primitives of agent frameworks?", ['Tool registry', 'Model-tool loop', 'Tracing'], ['Pixel shaders', 'Disk defragmenter']],
      'evaluation': ['O', "Order an evaluation workflow.", ['Build a versioned test set', 'Run the agent on every case', 'Score outputs automatically or with a judge', 'Compare against the baseline before shipping']],
      'deployment': ['M', "Which make a deployed agent more robust?", ['Retries with backoff', 'Timeouts', 'Idempotent tools', 'Per-run budgets'], ['Retrying forever', 'Removing all logging']],
      'agent-security': ['M', "Which reduce the damage of prompt injection?", ['Least-privilege tool allow-lists', 'Human approval for risky actions', 'Treating tool output as data'], ['A longer system prompt alone', 'Hiding the prompt']],
      'autonomy-identity': ['O', "Order autonomy levels from least to most.", ['Suggest only', 'Assist: a human approves each action', 'Act alone on low-risk actions', 'Act alone on most actions']],
      'path-ahead': ['M', "Which are sensible first steps for a builder?", ['Pick a narrow domain you know', 'Measure honestly with evals', 'Widen autonomy as trust is earned'], ['Start with a general AGI', 'Skip evaluation']]
    },
    'machine-learning': {
      'model-lab': ['M', "Which are reliable warning signs of leakage or overfitting? Select all that apply.", ['Validation error far below the noise floor', 'Training error much lower than validation error', 'Deployment error far above validation error'], ['Training and validation error both close to the noise floor', 'Validation error that matches training error']],
      'churn-project': ['O', "Order the steps of an honest evaluation.", ['Split the data by time', 'Fit the scaler on the training rows only', 'Choose settings with cross-validation on the training data', 'Pick the threshold that meets the business recall', 'Report the test score once and run the release gate']],
      'end-to-end': ['O', "Order the ML project checklist.", ['Frame the problem', 'Get the data and set aside a test set', 'Explore and prepare the data', 'Train and compare models with cross-validation', 'Fine-tune, then evaluate once on the test set']],
      'classification': ['M', "Which metrics are computed from true positives, false positives and false negatives?", ['Precision', 'Recall', 'F1 score'], ['Learning rate', 'Batch size']],
      'training-models': ['M', "Which help prevent overfitting?", ['Ridge regularization', 'Lasso regularization', 'Early stopping'], ['Training longer with no validation set', 'Using fewer training examples']],
      'decision-trees': ['O', "Order how CART chooses a split.", ['Try each feature and threshold', 'Compute the weighted impurity of the two children', 'Keep the split with the lowest impurity', 'Recurse on each child']],
      'ensembles': ['M', "Which are ensemble methods?", ['Bagging', 'Random forest', 'Gradient boosting', 'Stacking'], ['PCA', 'k-means']],
      'dimensionality-reduction': ['M', "Which statements about PCA are true?", ['It is unsupervised', 'Its components are orthogonal', 'The first component keeps the most variance'], ['It needs class labels', 'It always improves accuracy']],
      'unsupervised': ['O', "Order one iteration of k-means.", ['Assign each point to its nearest centroid', 'Move each centroid to the mean of its points', 'Repeat until assignments stop changing']],
      'neural-networks': ['O', "Order one training step of a neural network.", ['The forward pass computes predictions', 'The loss measures the error', 'The backward pass computes gradients', 'The optimizer updates the weights']],
      'pytorch-training': ['O', "Order the beats of the PyTorch training loop.", ['Forward: y_pred = model(X)', 'Loss: loss = loss_fn(y_pred, y)', 'Reset: optimizer.zero_grad()', 'Backprop: loss.backward()', 'Update: optimizer.step()']],
      'training-deep-nets': ['M', "Which help train deep networks?", ['Batch normalization', 'Residual connections', 'Gradient clipping', 'Good initialization (He/Xavier)'], ['Zero initialization', 'Removing every nonlinearity']],
      'cnns': ['O', "Order a typical CNN block.", ['Convolution with learned filters', 'A nonlinearity such as ReLU', 'Pooling to downsample', 'Repeat blocks, then classify']],
      'sequences': ['M', "Which are good practice for time-series forecasting?", ['Split the data chronologically', 'Compare against a naive baseline', 'Window the series into (past → next) pairs'], ['Shuffle before splitting', 'Use future values as features']],
      'attention-transformers': ['O', "Order self-attention.", ['Project tokens into queries, keys and values', 'Score queries against keys', 'Softmax the scores into weights', 'Take the weighted sum of the values']],
      'generative-models': ['M', "Which are generative model families?", ['Autoencoders', 'GANs', 'Diffusion models'], ['Linear regression', 'k-nearest neighbors']],
      'reinforcement-learning': ['O', "Order the reinforcement-learning interaction loop.", ['Observe the state', 'Choose an action', 'Receive a reward and the next state', 'Update the value estimates']]
    },
    'llm-engineering': {
      'llm-service-lab': ['M', "Which statements about serving settings are true? Select all that apply.", ['A cache lowers cost without changing p95 latency', 'A cascade can cost more than one mid-sized model', 'Quantization trades some quality for lower cost and latency'], ['A bigger model is always the cheapest way to reach a quality target', 'A cache improves the answers to repeated questions']],
      'llm-gateway-project': ['O', "Order the controls that protect an LLM API, from the edge inward.", ['The rate limiter admits or refuses the request', 'The cache answers a repeated request', 'The cascade picks the cheapest model that is confident', 'The ledger records the tokens and the cost', 'The canary decides whether a new version may be promoted']],
      'llmops-toolbox': ['M', "Which tool categories belong in an LLMOps stack?", ['Orchestrator', 'Model registry', 'Experiment tracker', 'Vector database'], ['Spreadsheet macro', 'Screen recorder']],
      'data-engineering': ['O', "Order the data pipeline.", ['Crawl the sources', 'Extract raw documents into the warehouse', 'Clean the text', 'Remove near-duplicates', 'Load features for downstream pipelines']],
      'rag-fundamentals': ['O', "Order the RAG feature pipeline.", ['Clean the documents', 'Chunk them', 'Embed each chunk', 'Load the vectors and metadata into a vector database']],
      'advanced-rag': ['M', "Which improve retrieval?", ['Query expansion', 'Hybrid keyword + vector search', 'Reranking with a cross-encoder', 'Metadata filters'], ['Making chunk boundaries random', 'Dropping the vector index']],
      'instruction-datasets': ['O', "Order dataset curation.", ['Generate instruction-answer pairs', 'Apply rule-based filters', 'Deduplicate exact and fuzzy copies', 'Decontaminate against eval sets', 'Score and keep the best']],
      'sft-lora': ['M', "Which statements about LoRA are true?", ['It freezes the base weights', 'It trains small low-rank matrices', 'Adapters can be merged later'], ['It updates every base weight', 'It needs no GPU memory']],
      'preference-alignment': ['O', "Order the DPO workflow.", ['Build (prompt, chosen, rejected) triples', 'Keep a frozen reference model', 'Compare policy and reference log-probabilities', 'Minimize the DPO loss']],
      'evaluating-llms': ['M', "Which are RAG evaluation metrics?", ['Context precision', 'Context recall', 'Faithfulness', 'Answer relevancy'], ['Learning rate', 'Tokens per second']],
      'inference-optimization': ['M', "Which speed up LLM inference?", ['KV cache', 'Continuous batching', 'Speculative decoding', 'Optimized attention kernels'], ['Recomputing every token at each step', 'Disabling batching']],
      'quantization': ['O', "Order absmax quantization.", ['Find the maximum absolute value', 'Compute scale = 127 / max', 'Multiply and round to int8', 'Divide by the scale to dequantize']],
      'rag-inference': ['O', "Order a RAG inference request.", ['Self-query extracts filters', 'Expand the query into variants', 'Run filtered vector search', 'Rerank the candidates', 'Build the prompt', 'Call the LLM service']],
      'deployment': ['M', "Which are inference deployment types?", ['Online real-time', 'Asynchronous (queued)', 'Offline batch'], ['Peer-to-peer torrent', 'Dial-up modem']],
      'llmops': ['O', "Order a release pipeline.", ['Run tests', 'Build and push the image', 'Run offline evals', 'Deploy a canary', 'Promote to everyone']]
    },
    'prompt-engineering': {
      'prompt-lab': ['M', "Which statements about the lab's prompts are true? Select all that apply.", ['Removing one component at a time shows what each one contributes', 'A longer prompt is not always a better prompt', 'Examples that are mostly one label can pull answers toward that label'], ['More examples always improve every task', 'Temperature has no effect on any task']],
      'prompt-feature-project': ['O', "Order the safety net around a structured-output feature.", ['Ask the model for JSON in an exact schema', 'Parse and validate the reply against the schema', 'Repair: send the exact problems back and ask again', 'Sample several times and merge the majority values', 'Gate every prompt change on per-category results']],
      'prompt-anatomy': ['M', "Which are structural elements of a strong prompt?", ['Role', 'Context', 'Constraints', 'Output format'], ['Font size', 'Greeting emoji']],
      'precise-language': ['O', "Order turning a vague prompt into a precise one.", ['Name the audience and purpose', 'State the length and structure', 'Give the tone and what to include', 'Test and refine from the output']],
      'shot-prompting': ['M', "Which make few-shot examples effective?", ['Representative of real inputs', 'Balanced across labels', 'Consistent format', 'Correct'], ['All the same label', 'Different formats in each example']],
      'roles-system-prompts': ['M', "What belongs in a system prompt?", ['Persona', 'Persistent rules', 'Output format', 'Safety boundaries'], ['The current user question', 'Documents retrieved for one request']],
      'reasoning-prompts': ['O', "Order self-consistency.", ['Sample several reasoning paths', 'Extract each final answer', 'Count the answers', 'Return the most common one']],
      'patterns-templates': ['M', "Which are prompt patterns?", ['Role assignment', 'Delimiter', 'Inversion', 'Self-reflection'], ['Garbage collection', 'Memoization']],
      'prompt-chaining': ['O', "Order a research chain.", ['Extract key facts', 'Prioritize them', 'Outline', 'Draft', 'Critique and revise']],
      'multimodal-creative': ['O', "Order the parts of an image prompt.", ['Subject', 'Setting', 'Style', 'Lighting', 'Camera and composition']],
      'prompts-for-work': ['O', "Order a reliable work-prompt recipe.", ['Give a role and task', 'Add context', 'Paste the input inside delimiters', 'Specify the output format', 'Give one round of feedback']],
      'prompts-for-education': ['M', "Which context makes a lesson-plan prompt better?", ['Grade level', 'Learning objective', 'Duration', 'Student needs'], ["The teacher's favorite color", 'The AI model name']],
      'prompts-for-code': ['M', "Which belong in a good coding prompt?", ['Language and version', 'The existing code', 'The exact error message', 'Expected vs. actual behavior'], ['Only the word "urgent"', 'A longer greeting']],
      'creative-problem-factual': ['M', "Which techniques reduce invented facts?", ['Supply sources', 'Allow "I don\'t know"', 'Ask for citations', 'Verify important claims'], ['Raise the temperature', 'Remove all context']],
      'llm-app-loop': ['O', "Order the LLM application loop.", ['User problem', 'Retrieve context', 'Assemble the prompt', 'The model completes it', 'Post-process into an answer']],
      'prompt-assembly': ['O', "Order prompt assembly.", ['Rank snippets by priority', 'Pick the longest version that fits', 'Drop snippets whose dependency is missing', 'Order the survivors by position']],
      'taming-the-model': ['M', "Which help control completions?", ['Stop sequences', 'Output format specifications', 'Logprob thresholds'], ['Always raising the temperature', 'Longer preambles']],
      'conversational-agency': ['M', "Which make a tool definition easier for a model to use?", ['A clear snake_case name', 'A when-to-use description', 'Few parameters', 'Enums for fixed choices'], ['Vague names', 'Many free-text parameters']],
      'llm-workflows': ['O', "Order running a workflow.", ['Define tasks and dependencies', 'Run tasks whose dependencies are met', 'Validate and store the outputs', 'Run the next wave', 'A human reviews the result']],
      'evaluating-llm-apps': ['M', "Which describe SOMA-style judging?", ['Specific questions', 'Ordinal scales', 'Multiple aspects'], ['One vague verdict', 'A hidden rubric']],
      'evaluate-refine': ['O', "Order prompt iteration.", ['Build a test set', 'Run versions A and B on the same inputs', 'Compare pass rates and read the failures', 'Change one thing and repeat']],
      'prompt-security': ['M', "Which are defenses against prompt injection?", ['Delimit untrusted text', 'Least-privilege tools', 'Output validation', 'Human approval'], ['Trust every document', 'Put secrets in the prompt']],
      'prompts-in-production': ['O', "Order the prompt lifecycle.", ['Draft', 'Review', 'Test', 'Release', 'Monitor']]
    },
    'ai-foundations': {
      'intelligent-agents': ['M', "Which are parts of a PEAS description?", ['Performance measure', 'Environment', 'Actuators', 'Sensors'], ['Compiler', 'Database']],
      'uninformed-search': ['M', "Which are uninformed search strategies?", ['Breadth-first', 'Depth-first', 'Uniform-cost', 'Iterative deepening'], ['A*', 'Greedy best-first']],
      'informed-search': ['O', "Order one A* expansion.", ['Pick the frontier node with the lowest f = g + h', 'Check whether it is the goal', 'Expand its neighbors', 'Update their g and f values']],
      'local-search': ['M', "Which are local search methods?", ['Hill climbing', 'Simulated annealing', 'Genetic algorithms', 'Local beam search'], ['Breadth-first search', 'Minimax']],
      'adversarial-search': ['O', "Order alpha-beta reasoning at a MAX node.", ['Try a child move', 'Get its value from MIN', 'Update alpha with the best value so far', 'Prune the remaining children if alpha ≥ beta']],
      'csp': ['O', "Order backtracking for constraint problems.", ['Choose a variable (MRV)', 'Try a value', "Forward-check the neighbors' domains", 'Recurse; backtrack on an empty domain']],
      'logical-agents': ['M', "Which are inference approaches for propositional logic?", ['Model checking', 'Resolution', 'Forward chaining'], ['Simulated annealing', 'Gradient descent']],
      'first-order-logic': ['O', "Order forward chaining.", ['Start with the known facts', 'Unify rule premises with the facts', 'Add the new conclusions', 'Repeat until a fixed point']],
      'knowledge-planning': ['M', "Which describe a STRIPS action?", ['Preconditions', 'An add list', 'A delete list'], ['A reward function', 'A learning rate']],
      'probability': ['O', "Order the use of Bayes' rule.", ['Start from the prior', 'Multiply by the likelihood of the evidence', 'Divide by the total probability of the evidence', 'Read off the posterior']],
      'bayesian-networks': ['M', "Which statements about Bayesian networks are true?", ['Nodes are variables', 'Edges form a directed acyclic graph', 'Each node has a table given its parents'], ['Edges may form cycles', 'Only binary variables are allowed']],
      'reasoning-over-time': ['O', "Order one filtering step.", ['Predict with the transition model', 'Observe new evidence', 'Multiply by the sensor likelihood', 'Normalize to get the new belief']],
      'decisions-mdps': ['M', "Which are components of an MDP?", ['States', 'Actions', 'A transition model', 'Rewards'], ['A hash function', 'A kernel']],
      'multiagent-game-theory': ['M', "Which are game-theory concepts?", ['Nash equilibrium', 'Dominant strategy', 'Mixed strategy'], ['Backpropagation', 'Alpha-beta pruning']],
      'learning-from-examples': ['O', "Order decision-tree learning.", ['Compute the entropy of the labels', 'Compute the information gain of each attribute', 'Split on the best attribute', 'Recurse on each subset']],
      'learning-models-deep-rl': ['M', "Which are model-free reinforcement-learning methods?", ['Q-learning', 'TD learning', 'Policy gradient'], ['Value iteration with a known model', 'Minimax']],
      'natural-language': ['M', "Which relate to n-gram language models?", ['Counts of word sequences', 'Smoothing', 'Perplexity'], ['Convolution kernels', 'Alpha-beta pruning']],
      'vision-robotics': ['O', "Order one particle-filter step.", ['Move each particle with the motion model', 'Weight the particles by the sensor reading', 'Resample in proportion to the weights']],
      'ethics-future': ['M', "Which are fairness metrics?", ['Disparate impact', 'Equal opportunity gap', 'Demographic parity'], ['Perplexity', 'Learning rate']]
    },
    'deep-learning': {
      'dl-intro': ['M', "Which are the core components of a learning system?", ['Data', 'A model', 'An objective (loss)', 'An optimization algorithm'], ['Hand-written rules', 'A manual feature checklist']],
      'tensors-autograd': ['O', "Order reverse-mode automatic differentiation.", ['The forward pass records operations in a graph', 'Compute the scalar loss', 'The backward pass applies the chain rule', 'Each parameter receives its gradient']],
      'linear-regression': ['O', "Order minibatch SGD.", ['Sample a minibatch', 'Compute the average gradient', 'Update w ← w − η · gradient', 'Repeat over the epoch']],
      'softmax-classification': ['M', "Which statements about softmax classification are true?", ['Softmax outputs sum to 1', 'Subtracting the max keeps exp stable', 'The gradient is softmax minus one-hot'], ['Softmax outputs can be negative', 'Cross-entropy ignores the true label']],
      'mlps': ['M', "Which help MLPs train and generalize?", ['Dropout', 'Weight decay', 'Xavier or He initialization'], ['Zero initialization', 'Removing nonlinearities']],
      'builders-guide': ['M', "Which are properties of a module?", ['It owns parameters', 'It defines forward', 'It can contain child modules'], ['It cannot be reused', 'It must have no parameters']],
      'convolutions': ['O', "Order the computation of a convolution layer.", ['Pad the input', 'Slide the kernel by the stride', 'Multiply and sum over channels', 'Write one output value per position']],
      'modern-cnns': ['M', "Which are CNN architectures?", ['AlexNet', 'VGG', 'ResNet', 'DenseNet'], ['BERT', 'word2vec']],
      'rnns': ['O', "Order one RNN time step.", ['Take the input x_t', 'Combine it with the previous hidden state', 'Apply tanh to get the new hidden state', 'Predict the next token from it']],
      'modern-rnns': ['M', "Which gates appear in LSTMs or GRUs?", ['Forget gate', 'Update gate', 'Reset gate'], ['Pooling gate', 'Padding gate']],
      'attention-transformers-dl': ['O', "Order a transformer block.", ['Add positional information to the embeddings', 'Multi-head self-attention', 'Residual + LayerNorm after attention', 'Position-wise feed-forward network', 'Residual + LayerNorm after the feed-forward']],
      'optimization-dl': ['M', "Which are optimization algorithms?", ['SGD with momentum', 'RMSProp', 'Adam', 'AdaGrad'], ['Dropout', 'BatchNorm']],
      'computational-performance': ['O', "Order data-parallel training.", ['Copy the model to each GPU', 'Split the minibatch across GPUs', 'Compute local gradients', 'All-reduce the gradients', 'Apply the same update everywhere']],
      'computer-vision-dl': ['O', "Order non-maximum suppression.", ['Sort boxes by score', 'Keep the highest-scoring box', 'Discard boxes with high IoU against it', 'Repeat with the remaining boxes']],
      'nlp-pretraining': ['O', "Order byte-pair-encoding training.", ['Start from characters', 'Count adjacent symbol pairs', 'Merge the most frequent pair', 'Repeat for N merges']],
      'nlp-applications': ['M', "Which are needed to batch text for a model?", ['Token ids', 'Padding', 'An attention mask'], ['Image augmentation', 'Anchor boxes']],
      'rl-gp-hpo': ['M', "Which are hyperparameter-optimization methods?", ['Random search', 'Bayesian optimization', 'Successive halving', 'Hyperband'], ['Backpropagation', 'Dropout']],
      'gans-recommenders': ['M', "Which statements about GANs are true?", ['A generator creates samples', 'A discriminator judges real vs. fake', 'Training can suffer mode collapse'], ['They need no data', 'The discriminator generates the images']]
    }
  };

  /* ---------- deterministic helpers ---------- */
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) || 1;
  const rngFor = s => { let x = hash(s); return () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const shuffle = (a, r) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const norm = s => String(s).toLowerCase();

  function authoredEntry(key, spec) {
    const r = rngFor(key), [type, prompt] = spec;
    if (type === 'O') {
      const items = spec[2]; let order = shuffle(items.map((_, i) => i), r);
      if (order.every((x, i) => x === i)) order = order.slice(1).concat(order[0]);
      return { id: 'auth', type: 'order', prompt, items, initial: order, why: 'Correct order: ' + items.join(' → ') + '.', derived: false };
    }
    const right = spec[2], wrong = spec[3], options = shuffle(right.concat(wrong), r);
    return { id: 'auth', type: 'multi', prompt, options, correct: right.map(x => options.indexOf(x)), why: 'Correct choices: ' + right.join('; ') + '.', derived: false };
  }
  function authoredReview(key, spec, entry) {
    const r = rngFor('rv' + key), [type, prompt] = spec;
    if (type === 'M') {
      const right = spec[2][Math.floor(r() * spec[2].length)], wrong = shuffle(spec[3], r).slice(0, 2);
      if (wrong.length < 2) return null;
      const options = shuffle([right].concat(wrong), r);
      return { prompt: 'Which ONE of these belongs in the answer to: "' + prompt.replace(/\s*Select all that apply\.?/i, '') + '"', options, correct: options.indexOf(right), why: 'Correct choices include: ' + spec[2].join('; ') + '.' };
    }
    const items = spec[2]; if (items.length < 3) return null;
    const first = hash(key) % 2 === 0, target = first ? items[0] : items[items.length - 1];
    const others = shuffle(items.filter(x => x !== target), r).slice(0, 2), options = shuffle([target].concat(others), r);
    return { prompt: 'In "' + prompt.replace(/\.$/, '') + '", which step comes ' + (first ? 'FIRST' : 'LAST') + '?', options, correct: options.indexOf(target), why: 'Correct order: ' + items.join(' → ') + '.' };
  }

  /* ---------- derive term-recall items from each lesson's key terms ---------- */
  const okTerm = t => /^[A-Za-z0-9][A-Za-z0-9 \-\/'()]*$/.test(t) && t.length <= 34 && t.length >= 3;
  const maskDef = (term, def) => {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), masked = def.replace(new RegExp(esc.replace(/\s+/g, '\\s+'), 'ig'), '…');
    const leaks = term.split(/[\s\-\/]+/).filter(w => w.length >= 6).some(w => norm(masked).includes(norm(w)));
    return leaks ? null : masked;
  };
  const termItems = (course, lesson) => (lesson.terms || []).filter(([t]) => okTerm(t)).map(([t, d]) => ({ term: t, def: d, masked: maskDef(t, d) })).filter(x => x.masked);
  const courseTerms = course => course.lessons.flatMap(l => termItems(course, l).map(x => ({ ...x, lessonId: l.id })));

  let authoredN = 0, termActs = 0, reviewN = 0;
  COURSES.forEach(course => {
    const pool = courseTerms(course);
    course.lessons.forEach(lesson => {
      const key = course.id + '/' + lesson.id, acts = B.activities[key] ? B.activities[key].slice() : [];
      const reviews = []; if (B.reviews[key] && !Array.isArray(B.reviews[key])) reviews.push(B.reviews[key]); else if (Array.isArray(B.reviews[key])) reviews.push(...B.reviews[key]);
      const spec = (AUTHORED[course.id] || {})[lesson.id];
      if (spec && !acts.length) { const e = authoredEntry(key, spec); acts.push(e); authoredN++; const rv = authoredReview(key, spec, e); if (rv) reviews.push(rv); }
      const terms = termItems(course, lesson);
      if (terms.length) {
        const t = terms[hash(key) % terms.length];
        acts.push({ id: 'term', type: 'text', derived: true, prompt: 'Type the key term that matches this description: "' + t.masked + '"', answers: [t.term, t.term.replace(/\s*\([^)]*\)/g, '').trim()], why: t.term + ': ' + t.def });
        termActs++;
        terms.slice(0, 2).forEach((x, n) => {
          const r = rngFor('tr' + key + n), distract = shuffle(pool.filter(p => p.lessonId !== lesson.id && norm(p.term) !== norm(x.term)), r).slice(0, 2);
          if (distract.length < 2) return;
          const options = shuffle([x.term].concat(distract.map(d => d.term)), r);
          reviews.push({ prompt: 'Which key term matches this description? "' + x.masked + '"', options, correct: options.indexOf(x.term), why: x.term + ': ' + x.def, derived: true });
        });
      }
      if (acts.length) B.activities[key] = acts;
      if (reviews.length) { B.reviews[key] = reviews; reviewN += reviews.length; }
    });
  });
  B.__stats = { authored: authoredN, termActivities: termActs, reviewQuestions: reviewN };
})();
