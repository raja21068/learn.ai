/* Predict-then-run prompts: one per interactive widget. The learner commits to a prediction BEFORE the widget unlocks,
   then the reveal says what the widget actually shows. Every answer below is checked against the real widget by
   tests/predict-widgets.py (numbers quoted in "reveal" are what that test observed).
   Shape: 'course/lesson': { q, options[], correct (index), reveal, try } */
window.PREDICT_BANK = {
  /* ---------------- Databases ---------------- */
  'databases/index-lab': {
    q: 'An index exists on (status, region). The query is WHERE region = \'EU\' AND status = \'paid\' ORDER BY created. What does the query plan show?',
    options: ['A full scan, because the columns are in a different order from the WHERE clause', 'A search on both index columns, with the rows already sorted', 'A search on both index columns, but the rows still have to be sorted afterwards', 'The index is ignored, because a composite index needs a column for the ORDER BY too'],
    correct: 2,
    reveal: 'SQLite shows SEARCH orders USING INDEX idx_status_region (status=? AND region=?) followed by USE TEMP B-TREE FOR ORDER BY. The order of conditions in the WHERE clause does not matter, but the index is sorted by (status, region) and not by created, so the rows must still be sorted. An index on (region, status, created) removes the sort.',
    try: 'Tick only the (status, region) index and read the plan of the fifth query, then tick (region, status, created) instead and compare.'
  },
  /* ---------------- Prompt Engineering ---------------- */
  'prompt-engineering/prompt-lab': {
    q: 'Start from a precise instruction with no examples, a prompt for which the sentiment task passes. Now add three examples that are mostly positive reviews. What happens to the sentiment task and to the prompt length?',
    options: ['It still passes, and the prompt grows by about 60 tokens', 'It improves, since examples always help the model', 'It now fails, because the model leans toward the majority label, and the prompt grows by about 60 tokens', 'It still passes, and the prompt length does not change'],
    correct: 2,
    reveal: 'The sentiment task fails: "the examples were mostly one label, so the model leaned toward it". The prompt also grows by 60 tokens. A balanced set of three examples costs the same 60 tokens and passes, and so does no examples at all.',
    try: 'Run the prompt with no examples, then with skewed examples, then with balanced examples, and compare the table.'
  },
  /* ---------------- LLM Engineering ---------------- */
  'llm-engineering/llm-service-lab': {
    q: 'Compare serving all 40 requests with the medium model alone against the small-then-large cascade (both fp16, no cache). Which costs less, and what happens to p95 latency?',
    options: ['The cascade costs less, because most requests stay on the cheap small model', 'The cascade costs less and is also faster, since small models answer quickly', 'The medium model costs far less, and the cascade has a much higher p95 latency', 'They cost about the same, since the cascade only adds the small model\'s tiny cost'],
    correct: 2,
    reveal: 'Medium alone: $0.0148, p95 1,298 ms, 92.5% correct. Cascade: $0.0755 (about five times more), p95 3,535 ms, the same 92.5%. 19 of the 40 requests were too hard for the small model and paid for both models, and three overconfident small-model answers slipped through wrong.',
    try: 'Serve both settings, then click the wrong requests in the cascade run to see why the cascade could not catch them.'
  },
  /* ---------------- Machine Learning ---------------- */
  'machine-learning/model-lab': {
    q: 'With 20 training examples, raise the polynomial degree from 3 to 9 (no ridge penalty). What happens to the training and validation errors?',
    options: ['Both fall: a more flexible model fits better', 'Both rise, because the model becomes too complex', 'Neither changes, since degree only affects the plot', 'Training error falls, but validation error rises sharply'],
    correct: 3,
    reveal: 'Training RMSE falls from 0.26 to 0.16, but validation RMSE rises from 0.41 to 2.60: the extra flexibility fitted the noise in 20 points. Fixes: more data, a ridge penalty, or a simpler model.',
    try: 'Train both settings, then try 60 examples and a ridge strength of 0.01 at degree 9.'
  },
  /* ---------------- AI Agents ---------------- */
  'ai-agents/agent-arena': {
    q: 'The baseline run (no guardrails) has 4 harmful actions and 5 silently wrong answers. Switch on ONLY the injection filter and run again. What changes?',
    options: ['Harmful actions drop to 0, but the wrong answers and failed tickets stay', 'Harmful actions and wrong answers both drop to 0', 'Everything improves a little', 'Nothing changes without retries'],
    correct: 0,
    reveal: 'Harmful actions fall from 4 to 0, but silently wrong answers (5), failed tickets (6) and timeouts (4) are unchanged. A guardrail fixes its own failure family, which is why ablations change one control at a time.',
    try: 'Turn on one control at a time, run after each, and compare the rows in the experiment log.'
  },
  /* ---------------- AI Foundations ---------------- */
  'ai-foundations/what-is-ai': {
    q: 'Of the four ways to define AI, which one does this course use as its working framework?',
    options: ['Thinking humanly (cognitive modeling)', 'Thinking rationally (laws of thought)', 'Acting humanly (the Turing test)', 'Acting rationally (rational agents)'],
    correct: 3,
    reveal: 'Acting rationally: build agents that act to achieve the best expected outcome. It is general and measurable, which is why the rest of the course is organized around agents.',
    try: 'Click each quadrant and compare the examples.'
  },
  'ai-foundations/intelligent-agents': {
    q: 'Both vacuum agents start in square A with both squares dirty and run for 8 steps (+1 per clean square per step, -1 per move). How do their scores compare?',
    options: ['The model-based agent scores higher because it stops moving once it knows both squares are clean', 'They tie: both clean everything by step 3', 'The reflex agent scores higher because it keeps checking', 'The model-based agent scores lower because remembering costs energy'],
    correct: 0,
    reveal: 'Reflex agent: 8. Model-based agent: 13. Once it has seen both squares clean it does NoOp and earns +2 per step, while the reflex agent keeps paying -1 for every move.',
    try: 'Run 8 steps with each agent type and compare the action logs.'
  },
  'ai-foundations/uninformed-search': {
    q: 'Breadth-first search returns a shortest path on this maze. How long is the path that depth-first search returns?',
    options: ['The same length: both explore everything', 'About 20% longer', 'Several times longer (roughly 4x)', 'Shorter, because it dives straight toward the goal'],
    correct: 2,
    reveal: 'BFS: 25 steps (218 cells expanded). DFS: 95 steps (140 cells expanded). DFS expanded fewer cells but gives no optimality guarantee, and it wandered.',
    try: 'Run Breadth-first and Depth-first and compare path length and cells expanded.'
  },
  'ai-foundations/informed-search': {
    q: 'A* and breadth-first search both return a shortest path on this maze. Which expands fewer cells, and by roughly how much?',
    options: ['Breadth-first expands fewer', 'A* expands about half as many', 'About the same number', 'A* expands about ten times fewer'],
    correct: 1,
    reveal: 'A* expanded 107 cells against 218 for breadth-first, with the same 25-step path. Greedy best-first expanded only 43 but returned a 29-step path, so it traded optimality for speed.',
    try: 'Run A*, Breadth-first and Greedy best-first and compare cells expanded and path length.'
  },
  'ai-foundations/local-search': {
    q: 'Press "New random start" 20 times with each strategy. Which finds the global maximum most often?',
    options: ['Random restarts', 'Hill climbing', 'All three about equally', 'Simulated annealing'],
    correct: 0,
    reveal: 'In a 20-run check here, random restarts found the global maximum 17 times; hill climbing 0 (it stops at the first local peak) and annealing with its default schedule 0. Restarting from several places buys what a single greedy climb cannot.',
    try: 'Switch strategy, then press "New random start" repeatedly and watch the status line.'
  },
  'ai-foundations/adversarial-search': {
    q: 'Play the centre square, once with alpha-beta pruning on and once off. Does the computer choose a different reply?',
    options: ['Yes, pruning makes it play worse', 'Yes, pruning makes it play better', 'No: with pruning it cannot reply at all', 'No: the same reply, found by examining far fewer positions'],
    correct: 3,
    reveal: 'The reply is identical. Alpha-beta examined 6,138 positions; plain minimax examined 55,504 (about 9 times more). Pruning discards branches that cannot change the result.',
    try: 'Click the centre square, then toggle alpha-beta, start a new game, and repeat.'
  },
  'ai-foundations/csp': {
    q: 'Solve the 7-region map-coloring problem with and without the MRV + degree + forward-checking heuristics. How do the numbers of search steps compare?',
    options: ['Identical: the heuristics only change the colors chosen', 'Plain ordering needs about 1.5-2x as many steps', 'Plain ordering needs far fewer steps', 'Plain ordering cannot solve it'],
    correct: 1,
    reveal: 'With heuristics: 7 steps (one per region). In plain order: 12 steps. The extra 5 steps are colors rejected by a neighbor (the red outlines).',
    try: 'Solve with the heuristics on, then off, and watch for red-outlined rejections.'
  },
  'ai-foundations/logical-agents': {
    q: 'You are at the start square and perceive no breeze. Which neighboring squares can you prove are safe?',
    options: ['None: logic cannot say anything yet', 'Only one of them, chosen at random', 'Both squares next to the start', 'Every square in the first row'],
    correct: 2,
    reveal: 'Both. No breeze means no pit is adjacent, so both neighbors are provably safe (marked "safe"). Every other square still has a risk percentage, which logic alone cannot refine.',
    try: 'Visit a safe square, read its percepts, and see which squares become provably safe or provably dangerous.'
  },
  'ai-foundations/first-order-logic': {
    q: 'Forward chaining starts from Parent(Ada,Ben), Parent(Ben,Cleo), Parent(Cleo,Dev). In which round is Ancestor(Ada, Dev) first derived?',
    options: ['Round 1', 'Round 2', 'Round 3', 'Round 4'],
    correct: 2,
    reveal: 'Round 3. Round 1 derives the one-step facts, round 2 the two-step ancestors, and round 3 Ancestor(Ada, Dev); the next round finds nothing new, which is the fixed point.',
    try: 'Press "Fire rules" once per round and watch which facts appear.'
  },
  'ai-foundations/knowledge-planning': {
    q: 'Block C sits on A, and B is on the table. What is the fewest number of moves that builds the tower "A on B on C"?',
    options: ['2', '3', '4', '5'],
    correct: 1,
    reveal: '3: Move(C, A to Table), Move(B, Table to C), Move(A, Table to B). Breadth-first planning explored 13 states to prove nothing shorter exists.',
    try: 'Pick the goal and press "Plan & execute".'
  },
  'ai-foundations/probability': {
    q: 'A disease affects 1% of people. The test is 90% sensitive and 95% specific. You test positive. About how likely are you to be sick?',
    options: ['About 90%', 'About 50%', 'About 15%', 'About 1%'],
    correct: 2,
    reveal: '15.3%. In 1,000 people about 9 sick people test positive but about 50 healthy people also do, so most positives are false alarms. The prior (prevalence) matters as much as the test.',
    try: 'Raise the prevalence slider and watch P(disease | positive) change.'
  },
  'ai-foundations/bayesian-networks': {
    q: 'Observing Late = true raises belief in both Storm and Outage. You then also observe Traffic = true. What happens to belief in Outage?',
    options: ['It rises further', 'It stays the same', 'It becomes 100%', 'It drops: traffic already explains the lateness'],
    correct: 3,
    reveal: 'It drops, from 37% to 32%. Traffic is a competing explanation, so Outage is needed less: "explaining away".',
    try: 'Click Late until it is true, then click Traffic until it is true.'
  },
  'ai-foundations/reasoning-over-time': {
    q: 'Each step the sensor reports an alert (alerts are 7x likelier when the server is degraded). How many alerts in a row push P(Degraded) above 80%?',
    options: ['1', '2', '3', '5'],
    correct: 1,
    reveal: 'Two. The belief goes 66% after one alert, 87% after two, then 92% and 93%: repeated evidence accumulates, and the gains shrink.',
    try: 'Press the alert button repeatedly and watch the belief; then try quiet readings.'
  },
  'ai-foundations/decisions-mdps': {
    q: 'Living reward -0.04, noise 20%. After exactly one value-iteration update, what is the value of the square just left of the +1 exit?',
    options: ['1.00', '0.80', '0.76', '0.20'],
    correct: 2,
    reveal: '0.76 = 0.8 x (+1) + 0.2 x (0, nothing is known yet) - 0.04. Each further update pushes value outward from the exits.',
    try: 'Press Iterate x1 once, then x50, and compare how far the values have spread.'
  },
  'ai-foundations/multiagent-game-theory': {
    q: 'In the prisoner\'s dilemma, both players pick their best response to the other. What do they end up playing?',
    options: ['Both defect', 'Both cooperate', 'The row player defects, the column player cooperates', 'They alternate between all four outcomes'],
    correct: 0,
    reveal: '(Defect, Defect) is the only pure Nash equilibrium, even though both players would do better at (Cooperate, Cooperate). Individually rational choices can be collectively worse.',
    try: 'Look for the highlighted best responses, then edit a payoff and see whether the equilibrium moves.'
  },
  'ai-foundations/learning-from-examples': {
    q: 'Which attribute gives the largest information gain when predicting whether the bus is late?',
    options: ['Weather', 'Day of the week', 'Rush hour', 'They are all equal'],
    correct: 2,
    reveal: 'Rush hour: gain 0.549 bits, against 0.311 for day and 0.061 for weather. Greedy tree learning splits on the highest gain first.',
    try: 'Press each "Split on ..." button and compare the entropy it leaves behind.'
  },
  'ai-foundations/learning-models-deep-rl': {
    q: 'The coin\'s true bias is 0.7. After 100 flips, which prior leaves the posterior mean closest to the raw fraction of heads?',
    options: ['The strong "fair coin" prior Beta(20,20)', 'The uniform prior Beta(1,1)', 'All priors give exactly the same answer', 'It depends on the random flips'],
    correct: 1,
    reveal: 'The uniform prior: posterior mean = (a + heads) / (a + b + flips), so a prior with more pseudo-counts still pulls toward 0.5 after 100 flips. With enough data all priors converge on the truth.',
    try: 'Flip x100 under each prior (reset in between) and compare the posterior mean with the red MLE line.'
  },
  'ai-foundations/natural-language': {
    q: 'After the word "the", the unsmoothed model gives "robot" 37.5%. Turn on add-one smoothing. What happens to P(robot | the)?',
    options: ['It falls, because probability mass moves to unseen words', 'It stays at 37.5%', 'It rises', 'It drops to 0'],
    correct: 0,
    reveal: 'It falls to 20%: (3 + 1) / (8 + 12). Every one of the 12 vocabulary words receives one extra count, so unseen continuations stop having probability 0.',
    try: 'Toggle smoothing for different previous words, then generate a few sentences.'
  },
  'ai-foundations/vision-robotics': {
    q: 'The corridor has three identical doors. The robot senses "door" for the first time. Where will the particle cloud concentrate?',
    options: ['On the robot\'s true position only', 'Nowhere: the particles stay evenly spread', 'On a single wrong door', 'In separate clusters around all three doors'],
    correct: 3,
    reveal: 'Around all three doors. The doors look identical, so particles near any door are reweighted upward; later wall readings and motion are what separate the true position.',
    try: 'Press "Move & sense" step by step and watch the clusters shrink and merge.'
  },
  'ai-foundations/ethics-future': {
    q: 'Group B starts at disparate impact 0.66 with the shared threshold 0.50. Lower only B\'s threshold toward 0.20. How does disparate impact behave?',
    options: ['It rises steadily toward 1.0', 'It rises to about 1.0, then falls again as B is favored', 'It never passes 0.8', 'It keeps falling'],
    correct: 1,
    reveal: 'It peaks at 0.99 around threshold 0.40, then falls to 0.57 at 0.20 because group B is now approved more often than A (accuracy for B also dips from 76% to 64%). Equalizing one metric is a choice with costs.',
    try: 'Drag only the Group B slider and watch approval, TPR and disparate impact together.'
  },
  /* ---------------- Deep Learning ---------------- */
  'deep-learning/dl-intro': {
    q: 'A 10-class digit classifier has not been trained at all, so it guesses almost randomly. What cross-entropy loss and accuracy should it start near?',
    options: ['Loss 0, accuracy 100%', 'Loss about 10, accuracy about 10%', 'Loss about 2.3, accuracy about 10%', 'Loss about 0.5, accuracy about 50%'],
    correct: 2,
    reveal: 'Loss about 2.3 (ln 10) and accuracy about 10%; the widget starts at 2.38 and 10.0%. After 10 epochs of gradient descent it is above 90% accurate.',
    try: 'Press "Train 10 epochs" and watch loss and accuracy move.'
  },
  'deep-learning/tensors-autograd': {
    q: 'Tensor A has shape (3, 1) and tensor B has shape (1, 4). What is the shape of A + B?',
    options: ['(3, 1)', '(1, 4)', 'It is an error', '(3, 4)'],
    correct: 3,
    reveal: '(3, 4). Shapes are compared from the right; a dimension of size 1 is stretched to match. Try A as (3, 2) with B as (1, 4): 2 and 4 differ and neither is 1, so it is an error.',
    try: 'Change the shapes and see which combinations broadcast.'
  },
  'deep-learning/linear-regression': {
    q: 'The data are a line plus noise (standard deviation about 1.6). After 300 SGD steps at the default settings, where does the loss settle?',
    options: ['Around 1-2: the noise floor', 'Exactly 0', 'Around 10', 'It diverges'],
    correct: 0,
    reveal: 'Around 1-2 (it started at 54). The noise cannot be fitted away: half the noise variance is about 1.3. SGD noise also keeps w and b wobbling near the true values 1.5 and 2.',
    try: 'Press Train, then reset and try a larger learning rate or a different batch size.'
  },
  'deep-learning/softmax-classification': {
    q: 'At temperature 1 the logits (2.0, 1.0, 0.2, -1.0) give "cat" 63.2%. Raise the temperature to 4. What happens to the cat probability?',
    options: ['It rises toward 100%', 'It stays at 63.2%', 'It falls, because the distribution flattens', 'It becomes 0'],
    correct: 2,
    reveal: 'It falls to 34.6%. Dividing logits by a large temperature flattens the distribution; at temperature 0.2 it sharpens to 99.3%.',
    try: 'Drag the temperature, then add the same constant to every logit and watch what does not change.'
  },
  'deep-learning/mlps': {
    q: 'Train a network with ONE hidden unit on the XOR data for 150 epochs. What accuracy does it reach?',
    options: ['About 100%', 'Only about 50-75%', 'About 90%', 'About 0%'],
    correct: 1,
    reveal: 'About 65%. One unit can only draw a roughly straight boundary, which cannot separate XOR. With 8 hidden units the same data reach about 95%.',
    try: 'Choose XOR, set 1 hidden unit and train; then re-initialize with 8 units.'
  },
  'deep-learning/builders-guide': {
    q: 'How many parameters does Linear(784, 256) have?',
    options: ['200,960 (weights plus biases)', '200,704 (weights only)', '1,040', '784'],
    correct: 0,
    reveal: '784 x 256 = 200,704 weights plus 256 biases = 200,960. The whole network as drawn totals 203,530 parameters; activations and dropout add none.',
    try: 'Edit the layer sizes and watch the total change.'
  },
  'deep-learning/convolutions': {
    q: 'Input size 7, kernel 3, padding 1, stride 2. What is the output size along one dimension?',
    options: ['3', '4', '5', '7'],
    correct: 1,
    reveal: 'floor((7 - 3 + 2 x 1) / 2) + 1 = floor(6 / 2) + 1 = 4, so the output is 4x4.',
    try: 'Change padding and stride one at a time and predict each output size before reading it.'
  },
  'deep-learning/modern-cnns': {
    q: 'Compare VGG-16 (2014) with ResNet-50 (2015). Which statement is true?',
    options: ['ResNet-50 has more parameters and lower ImageNet error', 'VGG-16 has fewer parameters and lower ImageNet error', 'VGG-16 has more parameters and lower ImageNet error', 'ResNet-50 has fewer parameters and lower ImageNet error'],
    correct: 3,
    reveal: 'ResNet-50: 25.6M parameters, about 3.6% top-5 error. VGG-16: 138M parameters, about 7.3%. Residual connections let deeper nets train, and stacks of 3x3 convolutions alone are heavy.',
    try: 'Click VGG-16 and ResNet-50 and compare the parameter counts and errors.'
  },
  'deep-learning/rnns': {
    q: 'With a recurrent weight scale of 0.9, roughly how large is the gradient that reaches 30 steps back (about 0.9 to the 30th power)?',
    options: ['About 0.9', 'About 0.04', 'About 27', 'About 1e-10'],
    correct: 1,
    reveal: '0.9^30 = 4.2e-2: vanishing. At 1.1 it is 1.7e+1 (exploding) and only at exactly 1.0 is it stable, which is why gated RNNs and gradient clipping exist.',
    try: 'Drag the weight scale below and above 1, and toggle gradient clipping.'
  },
  'deep-learning/modern-rnns': {
    q: 'Greedy decoding takes the most likely first word, "the" (0.5), and ends with "the cat" at 0.175. Will a beam of width 2 find a more probable sequence?',
    options: ['No: the best first word always starts the best sequence', 'Only once the beam is at least 4', 'Yes: a different first word leads to a better full sequence', 'No: wider beams only add candidates, never better answers'],
    correct: 2,
    reveal: 'Yes. With beam width 2, "a cat" (0.4 x 0.8 = 0.32) beats "the cat" (0.175). Greedy missed it because every continuation of "the" is weak.',
    try: 'Increase the beam width and watch which candidates are kept at each step.'
  },
  'deep-learning/attention-transformers-dl': {
    q: 'Look at the dot product between position 10\'s sinusoidal encoding and every other position. Which position is MOST similar to 10 (other than 10 itself)?',
    options: ['Position 25', 'Position 39', 'All are equally similar', 'Position 11 (or 9)'],
    correct: 3,
    reveal: 'A neighbor (9 and 11 tie exactly: the dot product depends only on the distance). Similarity falls off with distance, which is how relative position can be read from absolute encodings.',
    try: 'Slide the "compare position" control and watch the similarity curve move with it.'
  },
  'deep-learning/optimization-dl': {
    q: 'A schedule has a 10-step linear warmup. How large is the learning rate at the very first step compared with the peak?',
    options: ['About one tenth of the peak', 'The same as the peak', 'Exactly zero', 'Half of the peak'],
    correct: 0,
    reveal: 'About one tenth of the peak, then rising linearly for 10 steps. Small early updates keep training stable while optimizer statistics are still poorly estimated.',
    try: 'Switch schedules and change the warmup length; compare where each curve starts.'
  },
  'deep-learning/computational-performance': {
    q: 'With communication cost 0.15 and batch 256, at how many GPUs does the speedup stop improving?',
    options: ['4', '8', '16', '32'],
    correct: 1,
    reveal: '8 GPUs (about 2.4x). Beyond that, the all-reduce communication that does not shrink with more GPUs outweighs the extra compute, so the speedup falls. Larger batches or cheaper communication move the peak out.',
    try: 'Raise the batch size and lower the communication cost and watch the curve.'
  },
  'deep-learning/computer-vision-dl': {
    q: 'At the default settings, non-maximum suppression keeps 3 of the 6 boxes. Raise the minimum score from 0.30 to 0.90. How many remain?',
    options: ['1', '2', '3', '6'],
    correct: 1,
    reveal: '2: only the 0.95 dog and the 0.91 cat clear a 0.90 score; every other box is discarded before overlap is even considered.',
    try: 'Move the min-score and IoU sliders and watch which boxes stay solid.'
  },
  'deep-learning/nlp-pretraining': {
    q: 'Byte-pair encoding merges the most frequent adjacent pair of symbols first. Which pair does it merge first on this corpus?',
    options: ['c + a', 't + </w>', 'a + t', 'r + a'],
    correct: 2,
    reveal: 'a + t, which occurs 18 times (c + a occurs 13). After the merge, "at" is a single symbol and the pair counts are recomputed.',
    try: 'Press "Merge top pair" a few times and watch the vocabulary grow.'
  },
  'deep-learning/nlp-applications': {
    q: 'As the number of labeled examples grows from 100 to 100,000, what happens to the accuracy advantage of fine-tuning a pretrained model over training from scratch?',
    options: ['It grows', 'It shrinks', 'It stays about the same', 'It reverses immediately'],
    correct: 1,
    reveal: 'It shrinks: 28 points at 100 examples (78% vs 50%), 19 at 1,000 (83% vs 64%), and about 0 at 100,000 (93% vs 93%). Pretraining matters most when labels are scarce.',
    try: 'Drag the amount of labeled data from 100 to 100,000.'
  },
  'deep-learning/rl-gp-hpo': {
    q: 'You add a few noisy observations to a Gaussian-process fit. How does the shaded uncertainty band behave?',
    options: ['Narrow near the observations and wider away from them', 'The same width everywhere', 'Wider near the observations', 'It disappears everywhere'],
    correct: 0,
    reveal: 'The band pinches near the data and widens away from it: the model is confident where it has seen examples and honest about what it has not. Length-scale and noise change how tightly.',
    try: 'Click inside the plot to add points, then change the length-scale and noise.'
  },
  'deep-learning/gans-recommenders': {
    q: 'Ana rated Action1 = 5 and Action2 = 5, and both romance films 1. After training two latent factors, what rating does the model predict for her unseen Action3?',
    options: ['About 1', 'About 3 (the average)', 'It cannot predict a rating for a missing entry', 'About 5 or higher'],
    correct: 3,
    reveal: 'About 5.7. Ana\'s factors say "loves action", and Action3 aligns with that factor. Predictions are not clipped to the 1-5 scale, so they can overshoot.',
    try: 'Press "Train 600 epochs" and compare the bold predictions with similar users\' ratings.'
  }
};
