/* Personalised-explanation texts for the Machine Learning course. The mechanism (recommendation rules, panel) lives in
   agents-coach.js; this file only registers the authored explanations. */
(() => {
  'use strict';
  const BANK = {
    'ml-landscape': {
      analogy: "Learning to recognise ripe fruit. You can be given labelled examples (supervised), sort a pile into similar heaps yourself (unsupervised), or taste, make mistakes and adjust (reinforcement). What differs is the kind of feedback you receive.",
      example: "GDP per person against life satisfaction: fit a line to the countries you know, then predict a new country. That is model-based learning. Memorising the nearest known country instead would be instance-based learning.",
      mistake: "Thinking that a model that scores 99% on training data has learned the task. Training score only tells you the model can reproduce what it has seen. The score on new data is the one that matters.",
      stretch: "Take a task you know (spam filtering, price prediction, route planning). Decide which learning type fits, what the labels or rewards would be, and who would have to produce them."
    },
    'end-to-end': {
      analogy: "A kitchen where the recipe must be written before you taste the final dish. Every step (imputing, scaling, encoding) is part of the recipe, and the recipe may only be tuned on the practice dishes, never on the dish the judges will taste.",
      example: "A ColumnTransformer sends numeric columns through median imputation and a scaler, and the ocean-proximity column through one-hot encoding. Fitted inside a pipeline, each step learns its numbers from the training rows only.",
      mistake: "Scaling the whole dataset before splitting it. The test rows then influence the mean and the spread, so the test score quietly becomes optimistic. This is leakage, and it is easy to commit by accident.",
      stretch: "A teammate reports a test score, then retunes the model and reports a better test score. Explain exactly why the second number is less trustworthy than the first."
    },
    'classification': {
      analogy: "A smoke alarm. Make it very sensitive and it catches every fire but wakes you for toast (high recall, low precision). Make it strict and it never cries wolf but may miss a slow fire (high precision, low recall).",
      example: "Of 100 emails flagged as spam, 80 really are spam: precision 0.80. Of 120 real spam emails, 80 were flagged: recall 0.67. Raising the threshold flags fewer emails, so precision usually rises and recall falls.",
      mistake: "Reporting accuracy on an imbalanced problem. If 1% of transactions are fraud, a model that always says “not fraud” is 99% accurate and completely useless.",
      stretch: "For a cancer screening test and for a spam filter, decide which error costs more, and set the threshold direction accordingly. Then explain who pays for each kind of error."
    },
    'training-models': {
      analogy: "Walking downhill in fog. You cannot see the valley, but you can feel the slope under your feet. Take a step proportional to the slope: too small and you crawl, too large and you overshoot to the other side.",
      example: "Batch gradient descent for linear regression: gradients = 2/m · Xᵀ(Xθ − y), then θ ← θ − η · gradients. With a suitable η the result matches the closed-form least-squares answer.",
      mistake: "When the loss turns into NaN, adding more epochs or more features. NaN almost always means the steps are too big, so the first thing to try is a smaller learning rate.",
      stretch: "Why does Lasso set some weights exactly to zero while Ridge only shrinks them? Sketch the two penalty shapes and where the loss contours first touch them."
    },
    'model-lab': {
      analogy: "A student who memorises last year’s exam answers. They score perfectly on the practice paper (training), fail the real exam (deployment), and the mock exam (validation) only helps if it was not made from the same answers.",
      example: "With 20 points, a degree-9 polynomial reaches a training RMSE of 0.16 but a validation RMSE of 2.6. It threads through the noise. A degree-3 curve has a training RMSE of 0.26 and validation 0.41, which is close to the noise floor of 0.30.",
      mistake: "Celebrating a validation error far below the noise floor. No honest model can beat the noise in the data, so a very low validation error means information leaked in, for example a feature computed from the label.",
      stretch: "Find three different settings that meet the deployment goal. Then explain why more data and a ridge penalty reach it by different routes, and what each one costs you."
    },
    'decision-trees': {
      analogy: "A game of twenty questions where every question is chosen to split the remaining possibilities as cleanly as possible. A node is pure when everything left belongs to one answer.",
      example: "A node with 50% class A and 50% class B has Gini impurity 1 − (0.5² + 0.5²) = 0.5. A split that leaves two nodes of 90% / 10% has weighted impurity of 0.18, so it is a good split.",
      mistake: "Letting the tree grow until every leaf is pure. It then memorises the training set, scores 100% there and does poorly on new data. Limit max_depth or require min_samples_leaf.",
      stretch: "Why does a decision tree not need feature scaling, while k-means and PCA do? Think about what each algorithm compares."
    },
    'ensembles': {
      analogy: "Asking a crowd instead of one expert. If the guesses are independent and each is slightly better than chance, the average is much better. If everyone copies the same neighbour, the crowd adds nothing.",
      example: "On noisy moons data, a single deep tree might reach 85% on the test set and a random forest of many trees 90%. Each forest tree sees a different bootstrap sample and different candidate features, so their errors differ.",
      mistake: "Believing that more trees always overfit. For a random forest, more trees reduce variance and rarely hurt. Boosting is different: adding rounds can overfit because each new predictor chases the remaining errors.",
      stretch: "Bagging reduces variance and boosting reduces bias. For a model that underfits, which would you reach for, and why?"
    },
    'dimensionality-reduction': {
      analogy: "Photographing a 3D sculpture. You pick the angle that shows the most shape. The first principal component is that best angle, the second is the best angle at right angles to it, and so on.",
      example: "With SVD on centred data, the explained variance ratio of each component is s² divided by the sum of all s². If the first two ratios are 0.7 and 0.2, two components keep 90% of the variance.",
      mistake: "Running PCA on unscaled features. A column measured in thousands dominates the variance and the components simply recover that column, whatever its importance.",
      stretch: "PCA keeps directions of maximum variance, which is not always the direction that separates classes. Describe a dataset where the useful direction is a low-variance one."
    },
    'unsupervised': {
      analogy: "Sorting a pile of unlabelled photos into stacks. Each round you put every photo on the stack with the closest example, then recompute the typical photo of each stack, until nothing moves.",
      example: "k-means alternates two steps: assign every point to the nearest centroid, then move each centroid to the mean of its points. After a few rounds the centroids stop moving.",
      mistake: "Choosing k by what looks nice, or assuming k-means works on any shape. It prefers round clusters of similar size, and different starting points can give different answers.",
      stretch: "Two crescent-shaped clusters interlock. Which method would you choose instead of k-means, and what parameter would you have to set?"
    },
    'neural-networks': {
      analogy: "A committee of simple voters. One voter can only draw a straight line between yes and no. A second layer of voters can combine several lines into a shape, which is what XOR needs.",
      example: "The perceptron rule w ← w + lr · (y − ŷ) · x nudges the weights whenever it is wrong. It learns AND and OR, whose classes a single line separates, and never learns XOR.",
      mistake: "Adding layers without non-linear activations. Stacking linear layers is still one linear function, so the network can never learn XOR however deep it is.",
      stretch: "A network must classify an image into 10 classes. Which output layer and loss would you use, and what would change if each image could have several labels at once?"
    },
    'pytorch-training': {
      analogy: "A bookkeeper. backward() writes the new gradient entries into the ledger, step() uses them to change the accounts, and zero_grad() turns to a clean page before the next batch, otherwise yesterday’s entries are added to today’s.",
      example: "One iteration: forward pass gives predictions, the loss compares them with the labels, loss.backward() computes the gradients, the optimiser updates every parameter, zero_grad() clears them.",
      mistake: "Forgetting optimizer.zero_grad(). PyTorch accumulates gradients by default, so each step is taken in a direction that mixes in all earlier batches.",
      stretch: "Your training loss falls but your validation loss starts rising after epoch 12. Name two things you would do, and the one number you would watch to decide when to stop."
    },
    'training-deep-nets': {
      analogy: "Passing a message down a long line of people. If each person whispers a little quieter, nothing arrives (vanishing gradients). Residual connections add a shortcut so that the message also travels directly.",
      example: "Adam keeps a moving average of the gradient (like momentum) and of its square, and divides one by the other, so each parameter gets its own step size. Bias correction fixes the start, when both averages are near zero.",
      mistake: "Raising the learning rate to speed up a network that trains slowly because of vanishing gradients. The cause is the architecture and initialisation, not the step size, and a bigger step can make training unstable.",
      stretch: "When would you prefer plain SGD with momentum over Adam, even though Adam usually trains faster at first?"
    },
    'cnns': {
      analogy: "A small stencil slid across a photograph. The same stencil looks for the same pattern (an edge, a corner) everywhere, so you need only a few numbers instead of one weight for every pixel pair.",
      example: "A 6×6 input with a 3×3 filter, stride 1 and no padding gives (6 − 3) + 1 = 4, so the output is 4×4. Max pooling with a 2×2 window then keeps the strongest response in each block.",
      mistake: "Thinking convolution makes the network invariant to shifts. It is equivariant: shift the input and the feature map shifts with it. Pooling and later layers provide the invariance.",
      stretch: "How many weights does a dense layer need to map a 100×100 image to 100×100 outputs, and how many does one 3×3 convolution need? What does the convolution give up?"
    },
    'sequences': {
      analogy: "Forecasting tomorrow from the last few days of weather. A window slides along the series: the previous w values are the inputs and the next value is the label.",
      example: "For the series [1, 2, 3, 4, 5] with window 3, make_windows gives the inputs [1,2,3] and [2,3,4] with the labels 4 and 5. A random shuffle of these windows would put tomorrow’s information next to yesterday’s.",
      mistake: "Splitting a time series at random. Training rows then come from after the test rows, the model has effectively seen the future, and the score is much better than it will be in production.",
      stretch: "A naive forecast that repeats the last value is hard to beat on many series. Why is that a useful baseline, and what would it mean if your LSTM does not beat it?"
    },
    'attention-transformers': {
      analogy: "A librarian answering a question. The query is compared with every book’s label (keys), the closest labels get the most weight, and the answer is a weighted blend of the books’ contents (values).",
      example: "attention(Q, K, V) = softmax(QKᵀ / √d) V. Dividing by √d keeps the scores from growing with the dimension, which would saturate the softmax into a near one-hot choice. A causal mask sets future positions to −∞ first.",
      mistake: "Forgetting the mask in a decoder. Without it each position can look at the words that come after it, the model trivially copies the answer in training, and it fails when generating.",
      stretch: "Self-attention compares every position with every other, so cost grows with the square of the sequence length. What does that imply for very long documents, and what tricks exist?"
    },
    'generative-models': {
      analogy: "Un-shredding a document. Forward diffusion gradually adds noise to a picture until only static is left. The network learns to predict the noise that was added, so it can remove it again one small step at a time.",
      example: "The closed-form forward step is x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · noise. The network is trained to predict the noise from x_t and t, which is a plain regression problem.",
      mistake: "Mixing up the GAN and diffusion training signals. A GAN’s discriminator classifies real versus generated, and the two networks compete. A diffusion model has no adversary and is trained on a simple noise-prediction loss.",
      stretch: "Why are diffusion models usually easier to train than GANs, and what do they cost at generation time?"
    },
    'reinforcement-learning': {
      analogy: "Learning a new city by walking. You mostly take routes you know are good, sometimes try a street you have never used, and you remember which turns eventually led to the café.",
      example: "Q-learning update: Q(s, a) ← Q(s, a) + α · (r + γ · max Q(s′, ·) − Q(s, a)). In a six-cell corridor with a reward at the right end, the values propagate back from the goal until “move right” wins everywhere.",
      mistake: "Setting γ = 0 and expecting long-term planning. With γ = 0 the agent only values the immediate reward, so a corridor whose reward is five steps away looks worthless.",
      stretch: "Why can a purely greedy agent get stuck on a mediocre route, and how do ε-greedy exploration and optimistic initial values each fix that?"
    },
    'churn-project': {
      analogy: "An auditor’s checklist. Each milestone is one test that the evaluation was honest: no peeking at the future, no peeking at the test set, a threshold that serves the business, and a final sign-off that can say no.",
      example: "Split by month so that the test set is the latest months. Fit the scaler on the training rows. Choose the threshold with the best precision among those that reach 80% recall. Ship only when the gate finds no reason to block.",
      mistake: "Choosing the model, the threshold and the features by looking at the test score. Each look turns the test set into a second validation set, and the final number is no longer an honest estimate.",
      stretch: "Add a sixth milestone of your own, such as monitoring drift after launch. What would you measure, and what result would make you retrain or roll back?"
    }
  };
  if (window.AgentsCoach) window.AgentsCoach.register('machine-learning', BANK, () => window.ML_COURSE);
  window.MLCoachBank = BANK;
})();
