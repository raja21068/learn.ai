/* One original Mermaid diagram for every guided textbook chapter (70 chapters, 7 books), plus an interactive chart or the neural-network
   playground where one fits the chapter. t = caption, d = Mermaid source, c = id of a chart in the Visualization lab, p = show the playground.
   The diagrams are summaries written for this site, not copies of figures from the books. tests/visualize.py renders every one with Mermaid. */
window.CHAPTER_VIZ = {
 db: {
  1: { t: 'File processing versus the database approach', d: `flowchart LR
  subgraph Files["File-based processing"]
    A1["Sales app and its own file"]
    A2["Billing app and its own file"]
  end
  A1 -.->|"same address stored twice"| A2
  subgraph DB["Database approach"]
    S["Sales app"] --> D[("One shared database")]
    B["Billing app"] --> D
  end` },
  2: { t: 'Three levels of abstraction', d: `flowchart TD
  U["External views: what each user group sees"] --> C["Conceptual schema: entities and relationships"]
  C --> P["Internal schema: files, indexes, storage"]
  P --> H["Hardware"]` },
  3: { t: 'Keys and integrity', d: `flowchart LR
  T["A relation is a table of rows"] --> PK["Primary key: unique and never null"]
  T --> FK["Foreign key: matches a parent key or is null"]
  PK --> EI["Entity integrity"]
  FK --> RI["Referential integrity"]` },
  4: { t: 'Cardinality in an ER diagram', d: `erDiagram
  DEPARTMENT ||--o{ EMPLOYEE : employs
  EMPLOYEE }o--o{ PROJECT : "works on"
  EMPLOYEE ||--o| PARKING_SPOT : "is assigned"` },
  5: { t: 'Specialization and generalization', d: `flowchart TD
  E["EMPLOYEE: supertype with shared attributes"] --> P["PILOT: adds licence and hours"]
  E --> M["MECHANIC: adds certification"]
  E --> G["MANAGER: adds budget"]` },
  6: { t: 'The normal forms, step by step', d: `flowchart LR
  A["Unnormalized table"] -->|"atomic values and a key"| B["1NF"]
  B -->|"no dependency on part of a key"| C["2NF"]
  C -->|"no transitive dependency"| D["3NF"]
  D -->|"every determinant is a candidate key"| E["BCNF"]` },
  7: { t: 'Logical order of a SELECT statement', d: `flowchart LR
  F["FROM and JOIN"] --> W["WHERE"] --> G["GROUP BY"] --> H["HAVING"] --> S["SELECT"] --> O["ORDER BY"]` },
  8: { t: 'The parts of SQL', d: `flowchart TD
  S["SQL"] --> DDL["DDL: CREATE, ALTER, DROP"]
  S --> DML["DML: SELECT, INSERT, UPDATE, DELETE"]
  S --> TCL["Transaction control: COMMIT, ROLLBACK"]
  DDL --> V["Constraints, views, indexes"]` },
  9: { t: 'From requirements to storage', d: `flowchart LR
  R["Requirements"] --> C["Conceptual design: ER model"] --> L["Logical design: relations and keys"] --> P["Physical design: indexes, storage, partitions"]` },
  10: { t: 'States of a transaction', d: `stateDiagram-v2
  [*] --> Active
  Active --> PartiallyCommitted: last statement runs
  PartiallyCommitted --> Committed: changes made durable
  Active --> Failed: error or deadlock
  PartiallyCommitted --> Failed: write fails
  Failed --> Aborted: rollback
  Committed --> [*]
  Aborted --> [*]` },
  11: { t: 'How a query becomes a plan', c: 'complexity', d: `flowchart LR
  Q["SQL text"] --> P["Parser"] --> O["Optimizer: compares scan and index plans by estimated cost"] --> X["Executor"] --> R["Result rows"]
  O -.-> I["Statistics and available indexes"]` },
  12: { t: 'Fragments and replicas', d: `flowchart TD
  C["Client"] --> K["Coordinator"]
  K --> N1["Node 1: fragment A, replica of B"]
  K --> N2["Node 2: fragment B, replica of C"]
  K --> N3["Node 3: fragment C, replica of A"]` },
  13: { t: 'A star schema', d: `erDiagram
  FACT_SALES }o--|| DIM_DATE : "sold on"
  FACT_SALES }o--|| DIM_PRODUCT : "of"
  FACT_SALES }o--|| DIM_STORE : "in"
  FACT_SALES {
    int quantity
    decimal amount
  }` },
  14: { t: 'Four families of NoSQL data models', d: `flowchart TD
  N["NoSQL data models"] --> K["Key-value: fast lookup by key"]
  N --> D["Document: nested records such as JSON"]
  N --> W["Wide column: rows with flexible column families"]
  N --> G["Graph: nodes and relationships"]` },
  15: { t: 'Why parameterized queries stop injection', d: `sequenceDiagram
  participant U as User input
  participant A as Application
  participant D as Database
  U->>A: A malicious string
  A->>D: Prepared statement plus the string as a parameter
  D-->>A: The string is treated as data, never as SQL` },
  16: { t: 'Layers of database protection', d: `flowchart LR
  P["Policies"] --> R["Roles and privileges"] --> A["Auditing"] --> B["Backup and recovery"]` }
 },
 rl: {
  1: { t: 'The agent and environment loop', d: `flowchart LR
  A["Agent"] -->|"action"| E["Environment"]
  E -->|"next state and reward"| A` },
  2: { t: 'Epsilon-greedy action selection', c: 'bandit', d: `flowchart TD
  S["Each step"] --> C{"Random number below epsilon?"}
  C -- yes --> X["Explore: pick a random arm"]
  C -- no --> Y["Exploit: pick the arm with the best estimate"]
  X --> U["Update that arm's average reward"]
  Y --> U` },
  3: { t: 'One step of a Markov decision process', d: `flowchart LR
  S["State s"] -->|"action a"| T{"Environment dynamics"}
  T -->|"probability p"| S2["Next state s'"]
  T -->|"reward r"| R["Reward r"]` },
  4: { t: 'Policy evaluation and improvement', d: `flowchart LR
  E["Policy evaluation: compute the value of the current policy"] --> I["Policy improvement: act greedily on those values"]
  I --> E` },
  5: { t: 'Monte Carlo prediction', d: `flowchart LR
  G["Generate a full episode"] --> R["Compute the return after each visit"] --> A["Average returns per state"] --> P["Improve the policy"]
  P --> G` },
  6: { t: 'The temporal-difference update', d: `flowchart LR
  O["Observe reward r and next state s'"] --> T["TD target = r + gamma * V of s'"] --> D["TD error = target minus V of s"] --> U["V of s += alpha * TD error"]` },
  7: { t: 'From one-step TD to Monte Carlo', d: `flowchart LR
  A["TD(0): bootstrap after 1 reward"] --- B["n-step: bootstrap after n rewards"] --- C["Monte Carlo: wait for the whole episode"]` },
  8: { t: 'Planning with a learned model (Dyna)', d: `flowchart TD
  R["Real experience"] --> V["Value function and policy"]
  R --> M["Learned model"]
  M --> S["Simulated experience"] --> V
  V --> R` }
 },
 d2l: {
  1: { t: 'The training loop', c: 'regression', d: `flowchart LR
  D["Data"] --> M["Model with parameters"] --> L["Loss: how wrong"] --> O["Optimizer"] --> U["Update parameters"]
  U --> M` },
  2: { t: 'Forward and backward pass on a graph', c: 'gradient', d: `flowchart LR
  X["x"] --> Z["z = w * x"] --> Y["y = z + b"] --> L["loss"]
  W["w"] --> Z
  B["b"] --> Y
  L -. "gradients flow back" .-> W` },
  3: { t: 'Linear regression as a pipeline', c: 'overfit', d: `flowchart LR
  F["Features"] --> LM["Linear model: w * x + b"] --> S["Squared loss"] --> G["Minibatch SGD"]
  G --> LM` },
  4: { t: 'From scores to probabilities', c: 'softmax', d: `flowchart LR
  Z["Logits: raw scores"] --> S["Softmax"] --> P["Probabilities that sum to 1"] --> C["Cross-entropy loss"]` },
  5: { t: 'A multilayer perceptron', p: true, d: `flowchart LR
  subgraph In["Input"]
    i1((x1))
    i2((x2))
  end
  subgraph Hid["Hidden layer with a nonlinearity"]
    h1((h1))
    h2((h2))
    h3((h3))
  end
  subgraph Out["Output"]
    o1((y))
  end
  i1 --> h1 & h2 & h3
  i2 --> h1 & h2 & h3
  h1 & h2 & h3 --> o1` },
  6: { t: 'Modules own parameters and live on a device', p: true, d: `flowchart TD
  M["Module"] --> S1["Submodule: layer 1"]
  M --> S2["Submodule: layer 2"]
  S1 --> P1["Parameters: weights and biases"]
  S2 --> P2["Parameters: weights and biases"]
  M --> D["Device: CPU or GPU"]` }
 },
 os: {
  1: { t: 'What the operating system sits between', d: `flowchart TD
  A["Applications"] --> S["System calls"] --> K["Kernel: processes, memory, files, devices"] --> H["Hardware"]` },
  2: { t: 'A system call', d: `sequenceDiagram
  participant U as User process
  participant K as Kernel
  U->>K: trap into kernel mode
  K->>K: check arguments and do the work
  K-->>U: return a result and drop to user mode` },
  3: { t: 'Process states', d: `stateDiagram-v2
  [*] --> New
  New --> Ready: admitted
  Ready --> Running: scheduler picks it
  Running --> Ready: time slice ends
  Running --> Waiting: waits for I/O
  Waiting --> Ready: I/O completes
  Running --> Terminated: exits
  Terminated --> [*]` },
  4: { t: 'What threads share and what they keep', d: `flowchart TD
  P["Process"] --> SH["Shared: code, heap, open files"]
  P --> T1["Thread 1: own stack and registers"]
  P --> T2["Thread 2: own stack and registers"]` },
  5: { t: 'A lock protects a critical section', d: `sequenceDiagram
  participant A as Thread A
  participant L as Lock
  participant B as Thread B
  A->>L: acquire
  B->>L: acquire, must wait
  A->>A: update the shared counter
  A->>L: release
  L-->>B: granted
  B->>B: update the shared counter` },
  6: { t: 'A round-robin scheduler', c: 'queue', d: `flowchart LR
  R["Ready queue"] --> C["CPU"]
  C -->|"time quantum expires"| R
  C -->|"waits for I/O"| Q["I/O queue"] --> R
  C -->|"finished"| X["Done"]` },
  7: { t: 'Address translation with a page table', d: `flowchart LR
  V["Virtual address"] --> S["Split: page number and offset"]
  S --> T["Page table lookup"] --> F["Frame number"]
  F --> PA["Physical address: frame plus offset"]
  S -. offset unchanged .-> PA` },
  8: { t: 'What happens on a page fault', d: `flowchart TD
  A["Access a page"] --> Q{"Is it in memory?"}
  Q -- yes --> OK["Continue"]
  Q -- no --> F["Page fault trap"]
  F --> V["Pick a victim frame with the replacement policy"]
  V --> L["Load the page from disk"] --> R["Restart the instruction"]` },
  9: { t: 'From a disk request to the data', d: `flowchart LR
  Q["Request queue"] --> S["Disk scheduler: SSTF or SCAN"] --> D["Seek, then rotate, then transfer"]` },
  10: { t: 'A directory tree', d: `flowchart TD
  R["/"] --> H["home"]
  R --> E["etc"]
  H --> U["alice"]
  U --> F1["notes.txt"]
  U --> F2["project"]` },
  11: { t: 'Inodes and journaling', d: `flowchart LR
  I["Inode: size, owner, block pointers"] --> DB["Direct data blocks"]
  I --> IB["Indirect block"] --> MB["More data blocks"]
  J["Journal: write the intent, then commit, then apply"] -.-> I` },
  12: { t: 'The path of an I/O request', d: `flowchart LR
  A["Application"] --> S["System call"] --> D["Device driver"] --> C["Controller"] --> H["Device"]
  H -. interrupt .-> D` },
  13: { t: 'An access matrix', d: `flowchart TD
  D["Domain, such as a user or process"] -->|"rights: read, write, execute"| O["Object, such as a file or device"]
  M["Access matrix: one row per domain, one column per object"] -.-> D` },
  14: { t: 'Protecting a message', d: `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>S: hash the message and sign the hash
  S->>R: message plus signature
  R->>R: verify the signature with the public key
  R-->>S: accept if it matches, reject if not` },
  15: { t: 'Layers of Linux', d: `flowchart TD
  U["Shell and applications"] --> L["C library"] --> S["System call interface"] --> K["Kernel subsystems: scheduler, memory, VFS, network"] --> H["Hardware"]` }
 },
 network: {
  1: { t: 'The four parts of packet delay', c: 'queue', d: `flowchart LR
  P["Processing at the router"] --> Q["Queueing in the buffer"] --> T["Transmission: length divided by rate"] --> G["Propagation: distance divided by speed"]` },
  2: { t: 'Loading a web page', d: `sequenceDiagram
  participant B as Browser
  participant D as DNS
  participant S as Web server
  B->>D: Where is the host?
  D-->>B: IP address
  B->>S: TCP connection
  B->>S: HTTP GET
  S-->>B: HTTP response` },
  3: { t: 'The TCP three-way handshake', c: 'queue', d: `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: SYN
  S-->>C: SYN plus ACK
  C->>S: ACK
  Note over C,S: The connection is established` },
  4: { t: 'What a router does with a packet', d: `flowchart LR
  I["Packet arrives"] --> L["Look up the destination in the forwarding table"] --> M["Longest matching prefix wins"] --> O["Send out of that port"]` },
  5: { t: 'Two families of routing algorithm', d: `flowchart TD
  R["Routing"] --> LS["Link state: every router learns the whole map, then runs Dijkstra"]
  R --> DV["Distance vector: neighbours exchange cost estimates, Bellman-Ford"]` },
  6: { t: 'How a switch learns', d: `flowchart TD
  F["Frame arrives on a port"] --> L["Learn: record source MAC against this port"]
  L --> Q{"Is the destination MAC in the table?"}
  Q -- yes --> S["Forward only to that port"]
  Q -- no --> B["Flood to all other ports"]` },
  7: { t: 'CSMA/CA with RTS and CTS', d: `sequenceDiagram
  participant A as Station A
  participant AP as Access point
  participant B as Station B
  A->>AP: RTS
  AP-->>A: CTS
  AP-->>B: CTS, so B stays quiet
  A->>AP: Data
  AP-->>A: ACK` },
  8: { t: 'A simplified secure connection', d: `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: Hello and supported ciphers
  S-->>C: Certificate and chosen cipher
  C->>C: check the certificate chain
  C->>S: Key exchange
  Note over C,S: Both derive the same session key and encrypt the traffic` }
 },
 islr: {
  1: { t: 'Supervised and unsupervised learning', d: `flowchart TD
  L["Statistical learning"] --> S["Supervised: inputs and a known response"]
  L --> U["Unsupervised: inputs only"]
  S --> R["Regression: numeric response"]
  S --> C["Classification: category response"]
  U --> K["Clustering"]
  U --> P["Dimension reduction"]` },
  2: { t: 'Flexibility, bias and variance', c: 'overfit', d: `flowchart LR
  F["More flexible model"] --> B["Bias falls"]
  F --> V["Variance rises"]
  B --> E["Test error is U-shaped"]
  V --> E` },
  3: { t: 'From model to inference', c: 'regression', d: `flowchart LR
  M["Model: Y = b0 + b1 X + error"] --> F["Fit by least squares"] --> I["Inference: standard errors, t statistics, p-values"] --> D["Diagnostics: residuals, leverage, collinearity"]` },
  4: { t: 'Logistic regression to a decision', d: `flowchart LR
  X["Predictors"] --> LO["Linear score: log-odds"] --> SG["Sigmoid"] --> PR["Probability"] --> TH{"Above the threshold?"}
  TH -- yes --> C1["Class 1"]
  TH -- no --> C0["Class 0"]` },
  5: { t: 'K-fold cross-validation', c: 'overfit', d: `flowchart TD
  D["Split the data into K folds"] --> L["For each fold in turn"]
  L --> T["Train on the other K-1 folds"] --> E["Test on the held-out fold"] --> A["Average the K test errors"]` },
  6: { t: 'Ways to control model complexity', d: `flowchart TD
  M["Many predictors"] --> S["Subset selection"]
  M --> R["Ridge: shrink coefficients"]
  M --> LA["Lasso: shrink and set some to zero"]
  M --> D["PCR and PLS: use a few derived directions"]
  S --> T["Choose the tuning amount by cross-validation"]
  R --> T
  LA --> T
  D --> T` },
  7: { t: 'Beyond straight lines', d: `flowchart LR
  A["Linear"] --> B["Polynomial"] --> C["Step functions"] --> D["Regression splines with knots"] --> E["Smoothing spline"] --> F["GAM: a sum of smooth functions"]` },
  8: { t: 'From one tree to ensembles', d: `flowchart LR
  T["One tree: easy to read, high variance"] --> B["Bagging: average trees on bootstrap samples"] --> R["Random forest: also randomise the predictors"]
  T --> G["Boosting: grow trees one after another on the errors"]` },
  9: { t: 'Margins and kernels', d: `flowchart LR
  M["Maximal margin: needs separable data"] --> S["Soft margin: cost C allows some violations"] --> K["Kernel trick: separate in a richer space"]` },
  10: { t: 'Finding structure without labels', d: `flowchart TD
  U["Unlabelled data"] --> P["PCA: directions of greatest variance"]
  U --> K["K-means: K clusters around centres"]
  U --> H["Hierarchical clustering: a tree of merges"]` }
 },
 algo: {
  1: { t: 'The Gale-Shapley proposal loop', d: `flowchart TD
  F["A free man proposes to the best woman he has not yet tried"] --> Q{"Is she free?"}
  Q -- yes --> E["They become engaged"]
  Q -- no --> P{"Does she prefer him to her fiance?"}
  P -- yes --> S["She switches and her old fiance is free again"]
  P -- no --> R["She rejects him"]` },
  2: { t: 'Growth rates in order', c: 'complexity', d: `flowchart LR
  A["log n"] --> B["n"] --> C["n log n"] --> D["n squared"] --> E["2 to the n"]` },
  3: { t: 'Breadth-first search in layers', d: `flowchart LR
  S["Start s"] --> L1["Layer 1: neighbours of s"] --> L2["Layer 2: their unseen neighbours"] --> L3["Layer 3 and so on"]
  Q["A queue visits nodes in this order"] -.-> L1` },
  4: { t: 'Greedy interval scheduling', d: `flowchart TD
  A["Sort jobs by finish time"] --> B["Take the first job"] --> C["Remove jobs that overlap it"] --> D{"Jobs left?"}
  D -- yes --> B
  D -- no --> E["Done: the schedule is optimal"]` },
  5: { t: 'Merge sort by divide and conquer', c: 'complexity', d: `flowchart TD
  P["Problem of size n"] --> L["Solve the left half"]
  P --> R["Solve the right half"]
  L --> M["Merge in linear time"]
  R --> M
  M --> T["T of n = 2 T of n/2 + n gives n log n"]` },
  6: { t: 'Weighted interval scheduling by dynamic programming', d: `flowchart TD
  A["Sort jobs by finish time and compute p of j"] --> B["OPT of j = max of: value of j + OPT of p of j, or OPT of j-1"]
  B --> C["Fill the table from j = 1 upward"] --> D["Trace back to recover the chosen jobs"]` },
  7: { t: 'The augmenting-path method for maximum flow', d: `flowchart TD
  A["Start with zero flow"] --> B["Find a path with spare capacity in the residual graph"]
  B --> C{"Found one?"}
  C -- yes --> D["Push the bottleneck amount along it"] --> B
  C -- no --> E["Stop: this is a maximum flow and it equals the minimum cut"]` }
 }
};
