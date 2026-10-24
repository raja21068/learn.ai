/* Deep Learning course: an original curriculum following the chapter sequence of
   Zhang, Lipton, Li & Smola, "Dive into Deep Learning" (free online at https://d2l.ai).
   Lessons, labs, data and visuals are original. Labs build each component from scratch in NumPy. */
window.DL_COURSE = {
  id: 'deep-learning',
  title: 'Deep Learning: From Tensors to Transformers',
  short: 'Deep Learning',
  tabLabel: 'DL',
  subtitle: 'Build deep learning from the ground up: tensors and autograd, linear and softmax models, MLPs, CNNs, RNNs, attention and transformers, optimization, scaling, vision, NLP, and beyond. Every component coded by you in NumPy.',
  tag: 'New · From scratch',
  category: 'foundations',
  accent: '#2563eb',
  symbol: 'DL',
  level: 'Intermediate',
  lang: 'python',
  outcome: 'Understand and implement the core of modern deep learning yourself, from SGD and softmax to batch norm, residual blocks, RNNs, beam search, positional encodings, LR schedules, data parallelism, NMS, BPE and matrix factorization, and know how the pieces fit into real systems.',
  reference: 'Follows the chapter sequence of Zhang, Lipton, Li & Smola, Dive into Deep Learning. The book is freely available online at d2l.ai with runnable PyTorch, JAX, TensorFlow and MXNet code. Lessons, labs and visuals here are original.',
  learn: [
    'Work fluently with tensors, broadcasting and gradients',
    'Train linear regression and softmax classifiers from scratch',
    'Build MLPs with good initialization, dropout and modules',
    'Compute convolutions, batch norm and residual blocks',
    'Run RNNs, clip gradients and decode with beam search',
    'Implement positional encodings and multi-head attention shapes',
    'Schedule learning rates and parallelize training',
    'Apply DL to detection, NLP pretraining, HPO and recommenders'
  ],
  parts: ['Foundations', 'Linear & multilayer networks', 'Convolutional networks', 'Sequences & attention', 'Optimization & performance', 'Vision & language applications', 'Beyond supervised learning'],
  lessons: [
  /* ---------- PART 1 ---------- */
  {
    id: 'dl-intro', part: 0, chapter: 'Ch. 1', title: 'What deep learning is (and why now)', minutes: 13,
    goal: 'Name the core components of every learning system and the problems deep learning solves.',
    sections: [
      { h: 'Programming with data', html: '<p>Instead of writing rules, we write a <b>flexible model</b> with many parameters and let <b>data</b> choose them. Every deep learning system has four components: the <b>data</b>, a <b>model</b> that transforms it, an <b>objective</b> (loss) measuring how bad the model is, and an <b>optimization algorithm</b> that adjusts the parameters to reduce the loss. Click through the loop below.</p>' },
      { h: 'Kinds of problems', html: '<p><b>Supervised</b>: regression, classification, tagging, search ranking, recommendation, sequence learning (translation, speech). <b>Unsupervised and self-supervised</b>: clustering, density estimation, representation learning, generative models. <b>Reinforcement learning</b>: an agent interacting with an environment. Deep learning\'s edge is learning <b>representations</b> end to end, with each layer transforming the previous one, instead of hand-engineering features.</p>' },
      { h: 'Why now?', html: '<p>The ideas are decades old, but three things changed: <b>data</b> (the internet, sensors), <b>compute</b> (GPUs grew far faster than CPUs) and <b>algorithms and engineering</b> (ReLU, dropout, batch norm, residual connections, attention, Adam, and frameworks with automatic differentiation). The result: breakthroughs in vision, speech, translation, games and generative AI.</p>' }
    ],
    widget: 'dlloop',
    terms: [['Objective / loss', 'A number measuring how badly the model performs.'], ['Representation learning', 'Learning useful features from data rather than designing them.'], ['End-to-end', 'Training all stages of a system jointly from input to output.']],
    lab: { intro: 'Labs run real NumPy in your browser (it loads on the first run). <b>Run</b> to experiment, <b>Check</b> for hidden tests, <b>💡</b> for a solution.', tasks: [
      { prompt: 'Warm up with tensors and broadcasting: <code>standardize(X)</code> rescales every column to mean 0 and std 1 (no loops), and <code>one_hot(y, k)</code> turns integer labels into one-hot rows.',
        starter: `import numpy as np

def standardize(X):
    return X   # TODO: (X - column means) / column stds, using broadcasting

def one_hot(y, k):
    return np.zeros((len(y), k))   # TODO: hint: (y[:, None] == np.arange(k)).astype(float)

X = np.array([[1.0, 200.0], [2.0, 300.0], [3.0, 400.0]])
print(standardize(X).round(3))
print(one_hot(np.array([2, 0, 1]), 3))`,
        solution: `def standardize(X):
    return (X - X.mean(axis=0)) / X.std(axis=0)

def one_hot(y, k):
    return (y[:, None] == np.arange(k)).astype(float)`,
        test: `import numpy as np
Z = standardize(np.random.default_rng(0).normal(5, 3, size=(100, 4)))
assert np.allclose(Z.mean(axis=0), 0) and np.allclose(Z.std(axis=0), 1)
assert np.array_equal(one_hot(np.array([2, 0, 1]), 3), np.array([[0, 0, 1], [1, 0, 0], [0, 1, 0]], dtype=float))
assert one_hot(np.array([0]), 4).shape == (1, 4)` }
    ] },
    quiz: [
      { q: 'Which is NOT one of the four core components of a learning system?', options: ['Data, the examples the system learns from', 'A hand-written rule set', 'Model, the function with adjustable parameters', 'Objective function, which measures how well the model does'], correct: 1, why: 'Learning replaces hand-written rules with data plus optimization.' },
      { q: 'A key reason deep learning took off in the 2010s:', options: ['Backpropagation was only invented in that decade', 'CPUs got slower, so researchers turned to deeper models', 'Linear models suddenly stopped working on small data', 'GPUs and large datasets made big models trainable'], correct: 3, why: 'Compute and data caught up with the algorithms.' }
    ]
  },
  {
    id: 'tensors-autograd', part: 0, chapter: 'Ch. 2', title: 'Tensors, calculus & automatic differentiation', minutes: 15,
    goal: 'Master tensor shapes and broadcasting, and verify gradients numerically.',
    sections: [
      { h: 'Tensors and broadcasting', html: '<p>A <b>tensor</b> is an n-dimensional array: a scalar, vector, matrix or higher. Operations are elementwise unless they are reductions (sum, mean along an axis) or products (dot, matrix multiply). <b>Broadcasting</b> stretches dimensions of size 1 so shapes like (3, 1) and (1, 4) combine into (3, 4) without copying data. Try shapes below. Shape bugs are the #1 deep learning bug, so learn to read shapes fluently.</p>' },
      { h: 'Calculus for learning', html: '<p>The <b>gradient</b> ∇f is the vector of partial derivatives: it points uphill, so we step the other way. The <b>chain rule</b> composes derivatives through layers, and that is all backpropagation is. Useful identities: ∇ₓ(wᵀx) = w, ∇ₓ(xᵀAx) = (A + Aᵀ)x, ∇ₓ‖x‖² = 2x.</p>' },
      { h: 'Automatic differentiation', html: '<p>Frameworks record operations in a <b>computational graph</b> during the forward pass, then run <b>reverse-mode</b> differentiation to get all gradients in one backward pass. You rarely write derivatives by hand, but you should know how to <b>check</b> them: compare against finite differences, (f(x+h) − f(x−h)) / 2h. That is the lab.</p>' }
    ],
    widget: 'broadcasting',
    terms: [['Broadcasting', 'Implicitly expanding size-1 dimensions to make shapes compatible.'], ['Chain rule', 'The derivative of a composition is the product of derivatives.'], ['Reverse-mode autodiff', 'One backward pass computes gradients for all inputs.']],
    lab: { tasks: [
      { prompt: 'Implement <code>numerical_grad(f, x, h)</code> with <b>central differences</b>, one coordinate at a time. Then write the <b>analytic</b> gradient of f(x) = Σxᵢ³ + sin(x₀)·x₁ and confirm they agree.',
        starter: `import numpy as np

def f(x):
    return np.sum(x ** 3) + np.sin(x[0]) * x[1]

def numerical_grad(f, x, h=1e-5):
    g = np.zeros_like(x)
    # TODO: for each i: e = zeros, e[i] = h; g[i] = (f(x+e) - f(x-e)) / (2h)
    return g

def analytic_grad(x):
    return np.zeros_like(x)   # TODO: d/dx_i of sum x^3 is 3x_i^2; plus the sin(x0)*x1 term

x = np.array([0.5, -1.2, 2.0])
print("numerical:", numerical_grad(f, x).round(6))
print("analytic: ", analytic_grad(x).round(6))`,
        solution: `def numerical_grad(f, x, h=1e-5):
    g = np.zeros_like(x)
    for i in range(len(x)):
        e = np.zeros_like(x)
        e[i] = h
        g[i] = (f(x + e) - f(x - e)) / (2 * h)
    return g

def analytic_grad(x):
    g = 3 * x ** 2
    g[0] += np.cos(x[0]) * x[1]
    g[1] += np.sin(x[0])
    return g`,
        test: `import numpy as np
rng = np.random.default_rng(1)
for _ in range(3):
    x = rng.normal(size=3)
    assert np.allclose(numerical_grad(f, x), analytic_grad(x), atol=1e-5)
q = lambda v: float(v @ v)
assert np.allclose(numerical_grad(q, np.array([1.0, -2.0])), [2.0, -4.0], atol=1e-6)` }
    ] },
    quiz: [
      { q: 'Shapes (4, 1) and (1, 3) broadcast to…', options: ['(1, 1), the smaller of the two shapes', 'An error, because the shapes are not equal', '(4, 3)', '(4, 1, 3), a new axis is added for each shape'], correct: 2, why: 'Size-1 dimensions stretch to match.' },
      { q: 'Why do frameworks use reverse-mode autodiff for neural nets?', options: ['One backward pass yields gradients for millions of parameters at once', 'It is easier to code than forward mode, which needs many separate passes', 'It avoids the chain rule, which is expensive for deep networks', 'Forward mode is mathematically wrong for functions with many outputs'], correct: 0, why: 'Many inputs, one scalar loss: reverse mode is efficient.' }
    ]
  },
  /* ---------- PART 2 ---------- */
  {
    id: 'linear-regression', part: 1, chapter: 'Ch. 3', title: 'Linear regression & minibatch SGD', minutes: 15,
    goal: 'Train a linear model from scratch with minibatch SGD and understand weight decay.',
    sections: [
      { h: 'The simplest network', html: '<p>Linear regression predicts ŷ = Xw + b. It is a one-layer, fully connected neural network. The <b>squared loss</b> ½(ŷ − y)² corresponds to assuming Gaussian noise, so minimizing it is maximum-likelihood estimation. It has a closed-form solution, but we train it with gradient descent so the same recipe scales to deep nets.</p>' },
      { h: 'Minibatch stochastic gradient descent', html: '<p>Each step: sample a <b>minibatch</b> B, compute the average gradient of the loss over B, and update w ← w − η·∇. The batch size trades noise against compute efficiency; the <b>learning rate</b> η is the most important hyperparameter. Watch SGD fit a line below.</p>' },
      { h: 'Generalization and weight decay', html: '<p>Low training error isn\'t the goal; low error on <b>new</b> data is. Use a <b>validation</b> set for model selection, and watch for overfitting as capacity grows relative to data. <b>Weight decay</b> (ℓ2 regularization) adds λ/2‖w‖² to the loss, shrinking weights toward zero each step and favoring simpler functions.</p>' }
    ],
    widget: 'linreg',
    terms: [['Minibatch', 'A small random subset of examples used for one update.'], ['Learning rate', 'Step size of each gradient update.'], ['Weight decay', 'ℓ2 penalty that shrinks weights each step.']],
    lab: { tasks: [
      { prompt: 'Write a shuffling <code>data_iter</code> and the <code>train</code> loop for minibatch SGD on the squared loss. Gradients for a batch: <code>err = Xb@w + b − yb</code>, <code>gw = Xbᵀ·err / n</code>, <code>gb = mean(err)</code>. It should recover w ≈ [2, −3.4], b ≈ 4.2.',
        starter: `import numpy as np
rng = np.random.default_rng(0)
true_w, true_b = np.array([2.0, -3.4]), 4.2
X = rng.normal(size=(1000, 2))
y = X @ true_w + true_b + rng.normal(0, 0.01, 1000)

def data_iter(batch_size, X, y, rng):
    idx = rng.permutation(len(y))
    # TODO: yield X[batch_idx], y[batch_idx] for consecutive chunks of idx
    yield X, y

def train(lr=0.03, epochs=3, batch_size=10, seed=1):
    rng = np.random.default_rng(seed)
    w, b = np.zeros(2), 0.0
    for epoch in range(epochs):
        for Xb, yb in data_iter(batch_size, X, y, rng):
            pass   # TODO: compute err, gradients, and update w and b
        loss = 0.5 * np.mean((X @ w + b - y) ** 2)
        print(f"epoch {epoch + 1}: loss {loss:.6f}")
    return w, b

w, b = train()
print("w =", w.round(3), " b =", round(b, 3))`,
        solution: `def data_iter(batch_size, X, y, rng):
    idx = rng.permutation(len(y))
    for i in range(0, len(y), batch_size):
        j = idx[i:i + batch_size]
        yield X[j], y[j]

def train(lr=0.03, epochs=3, batch_size=10, seed=1):
    rng = np.random.default_rng(seed)
    w, b = np.zeros(2), 0.0
    for epoch in range(epochs):
        for Xb, yb in data_iter(batch_size, X, y, rng):
            err = Xb @ w + b - yb
            w = w - lr * Xb.T @ err / len(yb)
            b = b - lr * err.mean()
        loss = 0.5 * np.mean((X @ w + b - y) ** 2)
        print(f"epoch {epoch + 1}: loss {loss:.6f}")
    return w, b`,
        test: `import numpy as np
batches = list(data_iter(64, X, y, np.random.default_rng(0)))
assert len(batches) == 16 and batches[0][0].shape == (64, 2) and batches[-1][0].shape == (40, 2)
assert sorted(np.concatenate([yb for _, yb in batches])) == sorted(y), "every example exactly once per epoch"
w, b = train()
assert np.allclose(w, true_w, atol=0.01) and abs(b - true_b) < 0.01, (w, b)` }
    ] },
    quiz: [
      { q: 'Minimizing squared loss is equivalent to maximum likelihood when the noise is…', options: ['Uniform, with equal density on a fixed interval', 'Absent, so every observation is exactly on the line', 'Gaussian', 'Laplacian, which corresponds to absolute loss'], correct: 2, why: 'Gaussian noise gives a squared-error log-likelihood.' },
      { q: 'Weight decay mainly…', options: ['Shrinks weights to reduce overfitting', 'Speeds up the GPU by skipping small weights', 'Increases the learning rate as training goes on', 'Adds extra training data by perturbing the inputs'], correct: 0, why: 'It penalizes large weights (ℓ2 regularization).' }
    ]
  },
  {
    id: 'softmax-classification', part: 1, chapter: 'Ch. 4', title: 'Softmax regression & cross-entropy', minutes: 15,
    goal: 'Turn scores into probabilities stably and train classifiers with cross-entropy.',
    sections: [
      { h: 'From scores to probabilities', html: '<p>For k classes, a linear layer outputs k <b>logits</b> o. <b>Softmax</b> turns them into a distribution: ŷⱼ = exp(oⱼ) / Σ exp(oₖ). It preserves order, so argmax is unchanged, but it gives calibrated-looking probabilities we can train against. Move the logits below.</p>' },
      { h: 'Cross-entropy loss', html: '<p>The loss is the negative log-probability of the true class, −log ŷ_y: the <b>cross-entropy</b> between the one-hot label and the prediction. Its gradient with respect to the logits is beautifully simple: <b>softmax(o) − onehot(y)</b>. From information theory: cross-entropy measures the surprise of seeing the labels under your model.</p>' },
      { h: 'Numerical stability and generalization', html: '<p>exp(1000) overflows. Subtract the max logit before exponentiating (softmax is shift-invariant), and compute log-softmax with the <b>log-sum-exp</b> trick. Beyond the math: classifiers break under <b>distribution shift</b> (covariate, label or concept shift) when deployment data differs from training data. Monitor and adapt.</p>' }
    ],
    widget: 'softmax',
    terms: [['Logits', 'Raw unnormalized scores before softmax.'], ['Cross-entropy', '−log of the predicted probability of the true class.'], ['Log-sum-exp trick', 'Computing log Σ exp stably by factoring out the max.']],
    lab: { tasks: [
      { prompt: 'Implement a stable row-wise <code>softmax</code>, a stable mean <code>cross_entropy(Z, y)</code> via log-sum-exp, and <code>grad_logits(Z, y)</code> = (softmax − onehot)/n. Tests check against numerical gradients and huge logits.',
        starter: `import numpy as np

def softmax(Z):
    return Z   # TODO: subtract row max, exp, normalize per row

def cross_entropy(Z, y):
    return 0.0   # TODO: mean over rows of logsumexp(Z_row) - Z_row[y]

def grad_logits(Z, y):
    return np.zeros_like(Z)   # TODO

Z = np.array([[2.0, 1.0, 0.1], [0.5, 2.5, -1.0]])
y = np.array([0, 1])
print(softmax(Z).round(3), cross_entropy(Z, y))
print(softmax(np.array([[1000.0, 1001.0]])))`,
        solution: `def softmax(Z):
    E = np.exp(Z - Z.max(axis=1, keepdims=True))
    return E / E.sum(axis=1, keepdims=True)

def cross_entropy(Z, y):
    m = Z.max(axis=1, keepdims=True)
    lse = (m + np.log(np.exp(Z - m).sum(axis=1, keepdims=True))).ravel()
    return float(np.mean(lse - Z[np.arange(len(y)), y]))

def grad_logits(Z, y):
    G = softmax(Z)
    G[np.arange(len(y)), y] -= 1
    return G / len(y)`,
        test: `import numpy as np
assert np.allclose(softmax(Z).sum(axis=1), 1) and np.isfinite(softmax(np.array([[1000.0, 1001.0]]))).all()
assert np.isfinite(cross_entropy(np.array([[1000.0, -1000.0]]), np.array([1])))
assert abs(cross_entropy(np.zeros((1, 4)), np.array([2])) - np.log(4)) < 1e-12
num = np.zeros_like(Z)
for i in range(Z.shape[0]):
    for j in range(Z.shape[1]):
        E = np.zeros_like(Z); E[i, j] = 1e-6
        num[i, j] = (cross_entropy(Z + E, y) - cross_entropy(Z - E, y)) / 2e-6
assert np.allclose(num, grad_logits(Z, y), atol=1e-6)` }
    ] },
    quiz: [
      { q: 'The gradient of softmax cross-entropy with respect to the logits is…', options: ['softmax(o) alone, without the label term', 'softmax(o) − onehot(y)', 'onehot(y) alone, without the predictions', 'log softmax(o), the log-probabilities of the classes'], correct: 1, why: 'A key identity that makes training simple and stable.' },
      { q: 'Why subtract the max logit before exponentiating?', options: ['It changes the prediction toward the most likely class', 'To make the computation faster on a GPU', 'NumPy requires it, or the exponential function fails', 'To avoid overflow; softmax is unchanged by shifting'], correct: 3, why: 'Softmax is shift-invariant, and this keeps exp() finite.' }
    ]
  },
  {
    id: 'mlps', part: 1, chapter: 'Ch. 5', title: 'Multilayer perceptrons, initialization & dropout', minutes: 16,
    goal: 'Train MLPs that generalize: activations, stable initialization and dropout.',
    sections: [
      { h: 'Hidden layers', html: '<p>Stacking linear layers is still linear. A <b>nonlinear activation</b> between them (ReLU, sigmoid, tanh, GELU) lets an MLP approximate any function given enough hidden units. ReLU is the default: cheap, and its gradient doesn\'t vanish for positive inputs. Train a small MLP on a 2-D problem below and watch the decision boundary bend.</p>' },
      { h: 'Forward, backward, and stability', html: '<p>Backpropagation multiplies many Jacobians, so gradients can <b>vanish</b> or <b>explode</b> with depth. <b>Initialization</b> matters: <b>Xavier/Glorot</b> draws weights with variance 2/(fan_in + fan_out) to keep activation and gradient variance roughly constant across layers; <b>He</b> initialization adapts this for ReLU. All-zero initialization fails because of symmetry: every unit would learn the same thing.</p>' },
      { h: 'Generalization and dropout', html: '<p>Deep nets can memorize random labels, yet still generalize on real data, so classical capacity theory doesn\'t fully explain them. Practical regularizers: early stopping, weight decay and <b>dropout</b>, which zeroes each activation with probability p during training and scales the survivors by 1/(1−p) so the expected value is unchanged. At test time, dropout is off.</p>' }
    ],
    widget: 'playground',
    terms: [['Activation function', 'Nonlinearity applied after each linear layer.'], ['Xavier initialization', 'Weights with variance 2/(fan_in+fan_out).'], ['Inverted dropout', 'Drop units with probability p and rescale the rest by 1/(1−p).']],
    lab: { tasks: [
      { prompt: 'Implement <b>inverted dropout</b> <code>dropout(X, p, rng)</code> (p = 0 → unchanged; p = 1 → all zeros) and <code>xavier_uniform(fan_in, fan_out, rng)</code>, which samples U(−a, a) with a = √(6 / (fan_in + fan_out)).',
        starter: `import numpy as np

def dropout(X, p, rng):
    return X   # TODO: keep mask = rng.random(X.shape) > p ; return X * mask / (1 - p)

def xavier_uniform(fan_in, fan_out, rng):
    return np.zeros((fan_in, fan_out))   # TODO

rng = np.random.default_rng(0)
X = np.ones((2, 8))
print(dropout(X, 0.5, rng))
W = xavier_uniform(256, 128, rng)
print("var:", W.var().round(5), "target:", round(2 / (256 + 128), 5))`,
        solution: `def dropout(X, p, rng):
    if p >= 1:
        return np.zeros_like(X)
    mask = rng.random(X.shape) > p
    return X * mask / (1 - p)

def xavier_uniform(fan_in, fan_out, rng):
    a = np.sqrt(6 / (fan_in + fan_out))
    return rng.uniform(-a, a, size=(fan_in, fan_out))`,
        test: `import numpy as np
rng = np.random.default_rng(1)
X = rng.normal(size=(2000, 50))
assert np.array_equal(dropout(X, 0.0, rng), X) and np.all(dropout(X, 1.0, rng) == 0)
D = dropout(np.ones((1000, 100)), 0.3, rng)
assert abs(D.mean() - 1) < 0.02 and set(np.unique(D).round(4)) == {0.0, round(1 / 0.7, 4)}
W = xavier_uniform(300, 100, rng)
assert W.shape == (300, 100) and abs(W.var() - 2 / 400) < 5e-4` }
    ] },
    quiz: [
      { q: 'Why not initialize all weights to zero?', options: ['Zero weights overflow the activations, which makes the loss become infinite after a few steps', 'Zero is not a valid floating-point value, so frameworks reject it', 'Training with zero weights is too slow to converge in practice', 'Symmetry: every hidden unit gets identical gradients and stays identical'], correct: 3, why: 'Random initialization breaks symmetry.' },
      { q: 'Inverted dropout scales kept activations by 1/(1−p) so that…', options: ['Training is faster, since fewer units take part in each update step', 'Fewer units are dropped, so the network keeps more capacity', 'Expected activations match test time (when dropout is off)', 'Gradients vanish less, since the scaled values are larger'], correct: 2, why: 'No rescaling is needed at inference.' }
    ]
  },
  {
    id: 'builders-guide', part: 1, chapter: 'Ch. 6', title: 'Builders\' guide: layers, modules & parameters', minutes: 13,
    goal: 'Compose networks from modules and reason about their parameters.',
    sections: [
      { h: 'Modules all the way down', html: '<p>Frameworks represent a layer, a block of layers, or a whole model as a <b>module</b>: it owns parameters, defines <code>forward</code>, and can contain child modules. <code>Sequential</code> chains modules; custom modules let you write arbitrary forward logic (loops, conditionals, shared weights). Build a network below and watch the parameter count.</p>' },
      { h: 'Parameters', html: '<p>You can access, initialize, <b>share</b> (tie) and save parameters. A Linear(in, out) layer has in·out + out parameters. <b>Lazy initialization</b> infers input shapes on the first forward pass. Save and load <code>state_dict</code>s to checkpoint and deploy.</p>' },
      { h: 'GPUs', html: '<p>Tensors and modules live on a <b>device</b>. Keep data and parameters on the same GPU, minimize transfers between CPU and GPU (they are slow), and batch work so the GPU stays busy. Mixed precision (fp16/bf16) roughly doubles throughput on modern hardware.</p>' }
    ],
    widget: 'paramcount',
    terms: [['Module', 'A reusable component with parameters and a forward method.'], ['Parameter tying', 'Sharing the same weights between layers.'], ['Lazy initialization', 'Inferring parameter shapes from the first input.']],
    lab: { tasks: [
      { prompt: 'Build a tiny module system: <code>Linear</code> (weights + bias, forward, <code>num_params</code>), <code>ReLU</code>, and <code>Sequential</code>, which chains forward calls and sums parameter counts.',
        starter: `import numpy as np

class Linear:
    def __init__(self, n_in, n_out, rng):
        self.W = rng.normal(0, 0.01, (n_in, n_out))
        self.b = np.zeros(n_out)
    def forward(self, X):
        return X   # TODO
    def num_params(self):
        return 0   # TODO

class ReLU:
    def forward(self, X):
        return X   # TODO
    def num_params(self):
        return 0

class Sequential:
    def __init__(self, *layers):
        self.layers = layers
    def forward(self, X):
        return X   # TODO: pass through each layer
    def num_params(self):
        return 0   # TODO

rng = np.random.default_rng(0)
net = Sequential(Linear(20, 256, rng), ReLU(), Linear(256, 10, rng))
print(net.forward(rng.normal(size=(2, 20))).shape, net.num_params())`,
        solution: `class Linear:
    def __init__(self, n_in, n_out, rng):
        self.W = rng.normal(0, 0.01, (n_in, n_out))
        self.b = np.zeros(n_out)
    def forward(self, X):
        return X @ self.W + self.b
    def num_params(self):
        return self.W.size + self.b.size

class ReLU:
    def forward(self, X):
        return np.maximum(X, 0)
    def num_params(self):
        return 0

class Sequential:
    def __init__(self, *layers):
        self.layers = layers
    def forward(self, X):
        for layer in self.layers:
            X = layer.forward(X)
        return X
    def num_params(self):
        return sum(l.num_params() for l in self.layers)`,
        test: `import numpy as np
rng = np.random.default_rng(0)
net = Sequential(Linear(20, 256, rng), ReLU(), Linear(256, 10, rng))
assert net.forward(rng.normal(size=(3, 20))).shape == (3, 10)
assert net.num_params() == 20 * 256 + 256 + 256 * 10 + 10
assert np.array_equal(ReLU().forward(np.array([-1.0, 2.0])), [0.0, 2.0])
l = Linear(2, 2, rng); l.W = np.eye(2); l.b = np.array([1.0, -1.0])
assert np.array_equal(l.forward(np.array([[3.0, 4.0]])), [[4.0, 3.0]])` }
    ] },
    quiz: [
      { q: 'How many parameters does Linear(100, 50) have?', options: ['5,050', '5,000, which counts only the weights', '150, the sum of the input and output sizes', '100, the number of input features only'], correct: 0, why: '100·50 weights + 50 biases.' },
      { q: 'Your model trains slowly on the GPU. A common culprit is…', options: ['Too few CPU cores to run the Python interpreter', 'Frequent data transfers between CPU and GPU', 'Using ReLU, which is slow on most accelerators', 'A small learning rate only, which slows every step'], correct: 1, why: 'Host-device copies are expensive; keep tensors on the device.' }
    ]
  },
  /* ---------- PART 3 ---------- */
  {
    id: 'convolutions', part: 2, chapter: 'Ch. 7', title: 'Convolutional layers: padding, stride, channels & pooling', minutes: 16,
    goal: 'Compute convolution outputs and shapes for any padding, stride and channel count.',
    sections: [
      { h: 'From fully connected to convolutions', html: '<p>Images have <b>translation invariance</b> (a cat is a cat anywhere) and <b>locality</b> (nearby pixels matter most). Building these into a layer gives the <b>convolution</b>: a small kernel slid across the input, sharing weights everywhere. (Technically it is cross-correlation.) Parameter counts drop from billions to thousands.</p>' },
      { h: 'Padding, stride, channels', html: '<p>Output size per dimension: <b>⌊(n − k + 2p) / s⌋ + 1</b> for input n, kernel k, padding p and stride s. "Same" padding (p = (k−1)/2 with stride 1) keeps the size. With <b>multiple input channels</b>, each kernel has a slice per channel and sums over them; with <b>multiple output channels</b>, there is one such kernel per output channel. A <b>1×1 convolution</b> mixes channels per pixel. Slide the window below.</p>' },
      { h: 'Pooling and LeNet', html: '<p><b>Max/average pooling</b> downsamples and adds a little translation robustness, with no parameters. <b>LeNet</b> (1990s) stacked conv → pool → conv → pool → dense layers to read handwritten digits, the blueprint for every CNN since.</p>' }
    ],
    widget: 'convshape',
    terms: [['Receptive field', 'The input region that affects one output element.'], ['Stride', 'How far the kernel moves each step.'], ['1×1 convolution', 'Per-pixel linear mixing of channels.']],
    lab: { tasks: [
      { prompt: 'Implement <code>out_size(n, k, p, s)</code> and a multi-channel <code>conv2d(X, K, padding, stride)</code>, where X has shape (C, H, W) and K has shape (C, kh, kw): pad with zeros, slide with the stride, and sum over channels.',
        starter: `import numpy as np

def out_size(n, k, p=0, s=1):
    return n   # TODO

def conv2d(X, K, padding=0, stride=1):
    C, H, Wd = X.shape
    _, kh, kw = K.shape
    Xp = np.pad(X, ((0, 0), (padding, padding), (padding, padding)))
    oh, ow = out_size(H, kh, padding, stride), out_size(Wd, kw, padding, stride)
    Y = np.zeros((oh, ow))
    # TODO: Y[i, j] = sum(Xp[:, i*s:i*s+kh, j*s:j*s+kw] * K)
    return Y

X = np.arange(2 * 5 * 5, dtype=float).reshape(2, 5, 5)
K = np.ones((2, 3, 3))
print(out_size(224, 7, 3, 2), out_size(5, 3, 1, 1))
print(conv2d(X, K, padding=1, stride=2))`,
        solution: `def out_size(n, k, p=0, s=1):
    return (n - k + 2 * p) // s + 1

def conv2d(X, K, padding=0, stride=1):
    C, H, Wd = X.shape
    _, kh, kw = K.shape
    Xp = np.pad(X, ((0, 0), (padding, padding), (padding, padding)))
    oh, ow = out_size(H, kh, padding, stride), out_size(Wd, kw, padding, stride)
    Y = np.zeros((oh, ow))
    for i in range(oh):
        for j in range(ow):
            Y[i, j] = np.sum(Xp[:, i * stride:i * stride + kh, j * stride:j * stride + kw] * K)
    return Y`,
        test: `import numpy as np
assert out_size(224, 7, 3, 2) == 112 and out_size(5, 3, 1, 1) == 5 and out_size(32, 5) == 28
rng = np.random.default_rng(0)
X, K = rng.normal(size=(3, 7, 6)), rng.normal(size=(3, 3, 2))
Y = conv2d(X, K, padding=1, stride=2)
assert Y.shape == (out_size(7, 3, 1, 2), out_size(6, 2, 1, 2))
Xp = np.pad(X, ((0, 0), (1, 1), (1, 1)))
assert np.isclose(Y[1, 2], np.sum(Xp[:, 2:5, 4:6] * K))
assert np.isclose(conv2d(X[:1], K[:1])[0, 0], np.sum(X[0, :3, :2] * K[0]))` }
    ] },
    quiz: [
      { q: 'Input 32×32, kernel 5×5, padding 2, stride 1. Output size?', options: ['32×32', '28×28, as for a kernel without any padding', '30×30, as for a 3×3 kernel with no padding', '16×16, as for a stride of two'], correct: 0, why: '(32 − 5 + 4)/1 + 1 = 32: "same" padding.' },
      { q: 'A 1×1 convolution is useful for…', options: ['Detecting vertical and horizontal edges in each image patch', 'Increasing the spatial resolution of the feature maps', 'Changing the number of channels cheaply (per-pixel mixing)', 'Nothing, because a 1×1 kernel just copies its input'], correct: 2, why: 'It acts like a dense layer applied at every pixel.' }
    ]
  },
  {
    id: 'modern-cnns', part: 2, chapter: 'Ch. 8', title: 'Modern CNNs: batch norm & residual networks', minutes: 16,
    goal: 'Trace the evolution of CNN architectures and implement batch norm and residual blocks.',
    sections: [
      { h: 'A decade of architectures', html: '<p><b>AlexNet</b> (2012) brought GPUs, ReLU and dropout to ImageNet. <b>VGG</b> showed that deep stacks of 3×3 blocks work. <b>NiN</b> introduced 1×1 convolutions and global average pooling. <b>GoogLeNet</b> used parallel multi-branch Inception blocks. <b>ResNet</b> made 100+ layers trainable. <b>DenseNet</b> concatenated features, and <b>RegNet</b> searched design spaces systematically. Explore the timeline below.</p>' },
      { h: 'Batch normalization', html: '<p>BatchNorm normalizes each feature over the minibatch to zero mean and unit variance, then applies a learned scale γ and shift β. It stabilizes and speeds up training and adds mild regularization. During training it uses batch statistics; at inference it uses running averages. (Transformers use <b>LayerNorm</b>, which normalizes per example instead.)</p>' },
      { h: 'Residual connections', html: '<p>A <b>residual block</b> outputs f(x) + x: the layers only need to learn a residual correction, and the identity path lets gradients flow straight through many layers. Making it easy for deeper networks to be at least as good as shallower ones was the key insight that unlocked very deep networks, and it is used in transformers too.</p>' }
    ],
    widget: 'cnnzoo',
    terms: [['Batch normalization', 'Per-feature normalization over the minibatch with learned scale/shift.'], ['Residual connection', 'Adding a block\'s input to its output: f(x) + x.'], ['Global average pooling', 'Averaging each channel to one value before the classifier.']],
    lab: { tasks: [
      { prompt: 'Implement training-mode <code>batch_norm(X, gamma, beta, eps)</code> (normalize each column over the batch, then scale and shift) and a fully connected <code>residual_block(X, W1, W2)</code> = ReLU(X + ReLU(X·W1)·W2).',
        starter: `import numpy as np

def batch_norm(X, gamma, beta, eps=1e-5):
    return X   # TODO: (X - mean) / sqrt(var + eps) * gamma + beta, stats over axis 0

def relu(Z):
    return np.maximum(Z, 0)

def residual_block(X, W1, W2):
    return X   # TODO

rng = np.random.default_rng(0)
X = rng.normal(5, 3, size=(64, 4))
Y = batch_norm(X, np.ones(4), np.zeros(4))
print(Y.mean(axis=0).round(4), Y.std(axis=0).round(4))
print(residual_block(X[:2], np.zeros((4, 4)), np.zeros((4, 4))))`,
        solution: `def batch_norm(X, gamma, beta, eps=1e-5):
    mu, var = X.mean(axis=0), X.var(axis=0)
    return (X - mu) / np.sqrt(var + eps) * gamma + beta

def residual_block(X, W1, W2):
    return relu(X + relu(X @ W1) @ W2)`,
        test: `import numpy as np
rng = np.random.default_rng(1)
X = rng.normal(5, 3, size=(128, 6))
Y = batch_norm(X, np.ones(6), np.zeros(6))
assert np.allclose(Y.mean(axis=0), 0, atol=1e-7) and np.allclose(Y.std(axis=0), 1, atol=1e-3)
Y2 = batch_norm(X, np.full(6, 2.0), np.full(6, 0.5))
assert np.allclose(Y2.mean(axis=0), 0.5) and np.allclose(Y2.std(axis=0), 2, atol=1e-3)
Z = np.abs(rng.normal(size=(3, 6)))
assert np.allclose(residual_block(Z, np.zeros((6, 6)), np.zeros((6, 6))), Z), "zero weights => identity (for non-negative inputs)"` }
    ] },
    quiz: [
      { q: 'What problem did residual connections mainly solve?', options: ['Overfitting on small datasets, by randomly dropping the shortcuts', 'Image resolution, by upsampling the feature maps', 'Color handling, by mixing channels before the first layer', 'Training very deep networks (degradation, vanishing gradients)'], correct: 3, why: 'Identity shortcuts let gradients and information flow.' },
      { q: 'At inference time, batch norm uses…', options: ['The current batch\'s own statistics, computed again at test time', 'Running averages collected during training', 'No normalization at all, because test data are already scaled', 'Random statistics sampled fresh for every prediction'], correct: 1, why: 'Predictions must not depend on other examples in the batch.' }
    ]
  },
  /* ---------- PART 4 ---------- */
  {
    id: 'rnns', part: 3, chapter: 'Ch. 9', title: 'Recurrent neural networks', minutes: 16,
    goal: 'Model sequences with RNNs and understand backprop through time and gradient clipping.',
    sections: [
      { h: 'Sequences and language models', html: '<p>Text, audio and time series are sequences. A <b>language model</b> predicts each token from the previous ones. That requires <b>tokenization</b> (characters, words or subwords) and a <b>vocabulary</b>. n-gram models need exponentially many counts as n grows; neural models generalize across contexts.</p>' },
      { h: 'Recurrence', html: '<p>An RNN keeps a <b>hidden state</b> hₜ = φ(xₜW_xh + hₜ₋₁W_hh + b): a running summary of the past, with the same weights at every step. The output layer predicts the next token from hₜ. Training unrolls the network over time and applies the chain rule: <b>backpropagation through time</b>.</p>' },
      { h: 'Exploding and vanishing gradients', html: '<p>Gradients through t steps multiply W_hh t times: they shrink to nothing or blow up, as the slider below shows. Remedies: <b>truncated BPTT</b>, careful initialization, gated cells (next lesson), and <b>gradient clipping</b>: if the global gradient norm exceeds θ, rescale all gradients to norm θ. Clipping keeps one bad batch from wrecking training.</p>' }
    ],
    widget: 'rnnunroll',
    terms: [['Hidden state', 'A vector carrying information from previous time steps.'], ['BPTT', 'Backpropagation through the unrolled sequence.'], ['Gradient clipping', 'Rescaling gradients whose norm exceeds a threshold.']],
    lab: { tasks: [
      { prompt: 'Implement <code>rnn_forward(xs, h0, Wxh, Whh, b)</code> returning all hidden states (tanh activation), and <code>clip_grads(grads, theta)</code>, which rescales a list of arrays so their <b>global</b> L2 norm is at most θ.',
        starter: `import numpy as np

def rnn_forward(xs, h0, Wxh, Whh, b):
    hs, h = [], h0
    # TODO: for x in xs: h = tanh(x @ Wxh + h @ Whh + b); append
    return np.array(hs)

def clip_grads(grads, theta):
    return grads   # TODO: norm = sqrt(sum of all squared entries); if norm > theta multiply each by theta/norm

rng = np.random.default_rng(0)
xs = rng.normal(size=(5, 3))
H = rnn_forward(xs, np.zeros(4), rng.normal(0, 0.5, (3, 4)), rng.normal(0, 0.5, (4, 4)), np.zeros(4))
print(H.shape, H[-1].round(3))
g = clip_grads([np.full(3, 4.0), np.full(2, 3.0)], 1.0)
print([x.round(3) for x in g])`,
        solution: `def rnn_forward(xs, h0, Wxh, Whh, b):
    hs, h = [], h0
    for x in xs:
        h = np.tanh(x @ Wxh + h @ Whh + b)
        hs.append(h)
    return np.array(hs)

def clip_grads(grads, theta):
    norm = np.sqrt(sum(float(np.sum(g ** 2)) for g in grads))
    if norm > theta:
        return [g * (theta / norm) for g in grads]
    return grads`,
        test: `import numpy as np
rng = np.random.default_rng(2)
xs, Wxh, Whh, b = rng.normal(size=(6, 3)), rng.normal(size=(3, 4)), rng.normal(size=(4, 4)), rng.normal(size=4)
H = rnn_forward(xs, np.zeros(4), Wxh, Whh, b)
assert H.shape == (6, 4) and np.allclose(H[1], np.tanh(xs[1] @ Wxh + H[0] @ Whh + b))
g = clip_grads([np.full(3, 4.0), np.full(2, 3.0)], 1.0)
assert abs(np.sqrt(sum((x ** 2).sum() for x in g)) - 1.0) < 1e-9
small = [np.array([0.1, 0.2])]
assert clip_grads(small, 5.0)[0] is small[0] or np.array_equal(clip_grads(small, 5.0)[0], small[0])` }
    ] },
    quiz: [
      { q: 'Why does a plain RNN struggle with long-range dependencies?', options: ['It has far too many parameters, which makes it overfit every long sequence it sees', 'It cannot use the tanh activation, which long sequences require', 'Gradients vanish or explode through many repeated multiplications', 'It needs labels at every time step, which long texts do not have'], correct: 2, why: 'Repeated multiplication by W_hh shrinks or grows gradients exponentially.' },
      { q: 'Gradient clipping by global norm…', options: ['Scales all gradients down when their combined norm exceeds a threshold', 'Sets all the small gradients to zero so that only large updates remain, which stabilises the training', 'Clips the weights themselves to a fixed range after each step', 'Removes layers whose gradients are too large to use'], correct: 0, why: 'Direction is preserved; only magnitude is limited.' }
    ]
  },
  {
    id: 'modern-rnns', part: 3, chapter: 'Ch. 10', title: 'LSTMs, GRUs, seq2seq & beam search', minutes: 16,
    goal: 'Use gated RNNs and encoder–decoder models, and decode sequences with beam search.',
    sections: [
      { h: 'Gated memory', html: '<p><b>LSTMs</b> add a memory cell controlled by <b>input, forget and output gates</b> (sigmoids between 0 and 1), so information and gradients can persist for many steps. <b>GRUs</b> simplify this to <b>reset and update gates</b> with similar performance. Stack layers for <b>deep</b> RNNs; read in both directions with <b>bidirectional</b> RNNs when the whole sequence is available.</p>' },
      { h: 'Encoder–decoder (seq2seq)', html: '<p>Machine translation maps a variable-length input to a variable-length output. An <b>encoder</b> RNN summarizes the source into a state; a <b>decoder</b> RNN generates the target token by token, conditioned on that state and its own previous outputs (<b>teacher forcing</b> during training). Evaluate with BLEU.</p>' },
      { h: 'Decoding: greedy vs. beam search', html: '<p><b>Greedy</b> decoding picks the most likely token at each step, which is fast but can miss a better overall sequence. <b>Beam search</b> keeps the k best partial sequences at every step and picks the best complete one: k = 1 is greedy, and exhaustive search is intractable. Watch beam width change the result below.</p>' }
    ],
    widget: 'beamsearch',
    terms: [['Forget gate', 'LSTM gate deciding what to erase from the memory cell.'], ['Teacher forcing', 'Feeding the ground-truth previous token to the decoder during training.'], ['Beam width', 'Number of partial hypotheses kept in beam search.']],
    lab: { tasks: [
      { prompt: 'Implement <code>greedy(next_probs)</code> and <code>beam_search(next_probs, k)</code> over a model given as a function from prefix to <code>{token: prob}</code>. Sequences end at <code>"&lt;eos&gt;"</code>. Return <code>(tokens, probability)</code>; beam search should find a better sequence than greedy here.',
        starter: `import math

TABLE = {
    (): {"A": 0.55, "B": 0.45},
    ("A",): {"X": 0.40, "Y": 0.35, "<eos>": 0.25},
    ("B",): {"X": 0.90, "<eos>": 0.10},
}
def next_probs(prefix):
    return TABLE.get(tuple(prefix), {"<eos>": 1.0})

def greedy(next_probs, max_len=5):
    seq, p = [], 1.0
    # TODO: repeatedly take the argmax token until <eos> (include <eos> in seq)
    return seq, p

def beam_search(next_probs, k=2, max_len=5):
    beams, done = [([], 0.0)], []          # (tokens, log-prob)
    # TODO: expand every beam, keep the top-k by log-prob; move finished (<eos>) ones to done
    best = max(done, key=lambda b: b[1]) if done else max(beams, key=lambda b: b[1])
    return best[0], math.exp(best[1])

print("greedy:", greedy(next_probs))
print("beam-2:", beam_search(next_probs, 2))`,
        solution: `def greedy(next_probs, max_len=5):
    seq, p = [], 1.0
    for _ in range(max_len):
        probs = next_probs(seq)
        tok = max(probs, key=probs.get)
        seq.append(tok)
        p *= probs[tok]
        if tok == "<eos>":
            break
    return seq, p

def beam_search(next_probs, k=2, max_len=5):
    beams, done = [([], 0.0)], []
    for _ in range(max_len):
        cands = []
        for seq, lp in beams:
            for tok, pr in next_probs(seq).items():
                cands.append((seq + [tok], lp + math.log(pr)))
        cands.sort(key=lambda c: -c[1])
        beams = []
        for seq, lp in cands[:k]:
            (done if seq[-1] == "<eos>" else beams).append((seq, lp))
        if not beams:
            break
    best = max(done, key=lambda b: b[1]) if done else max(beams, key=lambda b: b[1])
    return best[0], math.exp(best[1])`,
        test: `s, p = greedy(next_probs)
assert s == ["A", "X", "<eos>"] and abs(p - 0.22) < 1e-9, (s, p)
s2, p2 = beam_search(next_probs, 2)
assert s2 == ["B", "X", "<eos>"] and abs(p2 - 0.405) < 1e-9, (s2, p2)
assert beam_search(next_probs, 1)[0] == s, "beam width 1 is greedy"` }
    ] },
    quiz: [
      { q: 'Beam search with beam width 1 is equivalent to…', options: ['Exhaustive search over every possible output sequence', 'Greedy decoding', 'Sampling from the full distribution at every step', 'Teacher forcing with the ground-truth previous token'], correct: 1, why: 'Keeping only the single best hypothesis is greedy.' },
      { q: 'Which LSTM component lets information persist over many steps?', options: ['The output layer that produces the final prediction', 'Dropout applied between the two stacked layers', 'The embedding that maps tokens to vectors', 'The memory cell controlled by gates'], correct: 3, why: 'Gates decide what to keep, forget and output.' }
    ]
  },
  {
    id: 'attention-transformers-dl', part: 3, chapter: 'Ch. 11', title: 'Attention mechanisms & transformers', minutes: 18,
    goal: 'Build the pieces of the transformer: attention scoring, multi-head attention and positional encoding.',
    sections: [
      { h: 'Attention as soft lookup', html: '<p>Attention is a differentiable database lookup: a <b>query</b> is compared with <b>keys</b> to get weights (softmax of scores), which average the <b>values</b>. Scoring functions: <b>additive</b> (a small MLP) or <b>scaled dot-product</b>, qᵀk / √d. Adding attention to seq2seq (Bahdanau) let the decoder look at all encoder states instead of one bottleneck vector.</p>' },
      { h: 'Multi-head self-attention and positions', html: '<p>In <b>self-attention</b>, every token attends to every other token of the same sequence, in parallel, with path length 1 between any two positions. <b>Multi-head</b> attention splits the model dimension into h heads that attend in different subspaces, then concatenates the results. Attention ignores order, so we add <b>positional encodings</b>: sinusoids of different frequencies, or learned ones. Explore them below.</p>' },
      { h: 'The transformer and beyond', html: '<p>A transformer block is multi-head self-attention plus a position-wise feed-forward network, each wrapped in residual connections and LayerNorm. Encoder–decoder transformers translate; <b>encoder-only</b> models (BERT) understand; <b>decoder-only</b> models (GPT) generate. <b>Vision transformers</b> treat image patches as tokens. Pretraining at scale follows <b>scaling laws</b>, which is the basis of today\'s foundation models.</p>' }
    ],
    widget: 'posenc',
    terms: [['Self-attention', 'Each position attends to all positions of the same sequence.'], ['Multi-head attention', 'Several attention operations in parallel subspaces.'], ['Positional encoding', 'Vectors injecting order information into tokens.']],
    lab: { tasks: [
      { prompt: 'Implement <code>positional_encoding(n, d)</code> (P[pos, 2i] = sin(pos / 10000^(2i/d)), P[pos, 2i+1] = cos(…)) and the multi-head reshapes <code>split_heads(X, h)</code>: (n, d) → (h, n, d/h), and <code>combine_heads</code>, its inverse.',
        starter: `import numpy as np

def positional_encoding(n, d):
    P = np.zeros((n, d))
    # TODO: pos = arange(n)[:, None]; div = 10000 ** (arange(0, d, 2) / d); fill even/odd columns
    return P

def split_heads(X, h):
    return X   # TODO: reshape to (n, h, d/h) then transpose to (h, n, d/h)

def combine_heads(X):
    return X   # TODO: inverse of split_heads

P = positional_encoding(50, 16)
print(P.shape, P[0, :4], P[1, :4].round(3))
X = np.arange(4 * 6).reshape(4, 6)
print(split_heads(X, 2).shape, np.array_equal(combine_heads(split_heads(X, 2)), X))`,
        solution: `def positional_encoding(n, d):
    P = np.zeros((n, d))
    pos = np.arange(n)[:, None]
    div = 10000 ** (np.arange(0, d, 2) / d)
    P[:, 0::2] = np.sin(pos / div)
    P[:, 1::2] = np.cos(pos / div)
    return P

def split_heads(X, h):
    n, d = X.shape
    return X.reshape(n, h, d // h).transpose(1, 0, 2)

def combine_heads(X):
    h, n, dh = X.shape
    return X.transpose(1, 0, 2).reshape(n, h * dh)`,
        test: `import numpy as np
P = positional_encoding(10, 8)
assert P.shape == (10, 8) and np.allclose(P[0], [0, 1] * 4)
assert np.isclose(P[3, 2], np.sin(3 / 10000 ** (2 / 8))) and np.isclose(P[3, 5], np.cos(3 / 10000 ** (4 / 8)))
X = np.random.default_rng(0).normal(size=(5, 12))
S = split_heads(X, 3)
assert S.shape == (3, 5, 4) and np.array_equal(S[1], X[:, 4:8]) and np.array_equal(combine_heads(S), X)` }
    ] },
    quiz: [
      { q: 'Why do transformers need positional encodings?', options: ['Self-attention is permutation-invariant, so order must be injected', 'To save memory, because positions compress the attention matrix', 'To normalize the inputs so that every token has the same length', 'To make the softmax numerically stable for long sequences, which it otherwise cannot handle'], correct: 0, why: 'Without positions, "dog bites man" = "man bites dog".' },
      { q: 'Compared with RNNs, self-attention\'s key advantage is…', options: ['Fewer FLOPs for very long sequences, since attention is linear in length', 'It needs no parameters, because attention is only a weighted sum', 'Parallel computation and short paths between any two positions', 'It needs no training data, because the weights are computed from the input'], correct: 2, why: 'All positions are processed at once and are directly connected.' }
    ]
  },
  /* ---------- PART 5 ---------- */
  {
    id: 'optimization-dl', part: 4, chapter: 'Ch. 12', title: 'Optimization algorithms & learning-rate schedules', minutes: 15,
    goal: 'Understand the optimizer zoo and schedule learning rates like modern training recipes.',
    sections: [
      { h: 'Optimization vs. deep learning', html: '<p>Optimization minimizes the training loss; deep learning cares about generalization. Deep losses are <b>non-convex</b>, full of saddle points and flat regions, yet SGD-style methods find good solutions reliably. Convexity theory still guides intuition and step sizes.</p>' },
      { h: 'The algorithm family', html: '<p><b>GD</b> → <b>SGD</b> (noisy but cheap) → <b>minibatch SGD</b> (vectorized). <b>Momentum</b> averages past gradients to accelerate along consistent directions. <b>AdaGrad</b> gives per-parameter step sizes from accumulated squared gradients; <b>RMSProp</b> uses a leaky average instead; <b>Adadelta</b> removes the learning rate; <b>Adam</b> combines momentum and RMSProp with bias correction. AdamW decouples weight decay.</p>' },
      { h: 'Learning-rate scheduling', html: '<p>The learning rate should usually change during training: <b>warmup</b> (start small to avoid early instability, which is essential for transformers), then decay by <b>steps</b>, <b>polynomially</b> or with a <b>cosine</b> curve. Compare schedules below; the lab implements warmup + cosine, the standard recipe for large models.</p>' }
    ],
    widget: 'lrschedule',
    terms: [['Saddle point', 'A point where gradients vanish but it is not a minimum.'], ['Adam', 'Adaptive moments: momentum plus per-parameter scaling.'], ['Warmup', 'Gradually increasing the learning rate at the start of training.']],
    lab: { tasks: [
      { prompt: 'Implement <code>warmup_cosine(step, total, warmup, base_lr, min_lr)</code>: a linear ramp from base_lr/warmup up to base_lr over the warmup steps, then cosine decay to min_lr at <code>step == total</code>.',
        starter: `import math

def warmup_cosine(step, total, warmup, base_lr, min_lr=0.0):
    # TODO: if step < warmup: base_lr * (step + 1) / warmup
    #       else progress = (step - warmup) / max(1, total - warmup)
    #            lr = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * progress))
    return base_lr

lrs = [warmup_cosine(s, 1000, 100, 3e-4, 1e-5) for s in range(0, 1001, 100)]
print([f"{x:.2e}" for x in lrs])`,
        solution: `def warmup_cosine(step, total, warmup, base_lr, min_lr=0.0):
    if step < warmup:
        return base_lr * (step + 1) / warmup
    progress = (step - warmup) / max(1, total - warmup)
    return min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))`,
        test: `assert abs(warmup_cosine(0, 1000, 100, 1.0) - 0.01) < 1e-12
assert abs(warmup_cosine(99, 1000, 100, 1.0) - 1.0) < 1e-12 and abs(warmup_cosine(100, 1000, 100, 1.0) - 1.0) < 1e-12
assert abs(warmup_cosine(1000, 1000, 100, 1.0, 0.1) - 0.1) < 1e-12
assert abs(warmup_cosine(550, 1000, 100, 1.0, 0.0) - 0.5) < 1e-9, "halfway through decay = halfway between base and min"
vals = [warmup_cosine(s, 1000, 100, 1.0) for s in range(100, 1001)]
assert all(a >= b for a, b in zip(vals, vals[1:]))` }
    ] },
    quiz: [
      { q: 'Why use learning-rate warmup for transformers?', options: ['To save memory during the first steps, when activations are large', 'To increase the final loss so the model regularises itself', 'It is purely decorative and has no effect on training, which is why many recipes leave it out', 'Large early updates with adaptive optimizers can destabilize training'], correct: 3, why: 'A gentle start avoids early divergence.' },
      { q: 'Adam combines…', options: ['Dropout and batch norm in one combined layer type', 'Momentum and RMSProp-style adaptive scaling', 'SGD and Newton\'s method with an exact Hessian', 'Weight decay and pruning of the smallest weights'], correct: 1, why: 'First and second moment estimates with bias correction.' }
    ]
  },
  {
    id: 'computational-performance', part: 4, chapter: 'Ch. 13', title: 'Computational performance & multi-GPU training', minutes: 14,
    goal: 'Make training fast: compilation, asynchrony, hardware and data parallelism.',
    sections: [
      { h: 'Compilers, asynchrony and parallelism', html: '<p>Imperative code is easy to debug; <b>compiled</b> (symbolic or hybridized) graphs are faster and deployable. Frameworks run GPU work <b>asynchronously</b>, so the Python frontend queues operations while the backend executes; avoid needless synchronization (like printing a loss every step). Independent operations run in <b>parallel</b> automatically.</p>' },
      { h: 'Hardware', html: '<p>Know your numbers: memory bandwidth, cache sizes, PCIe vs. NVLink, GPU tensor cores, TPUs. Most deep learning is limited by <b>memory bandwidth</b> or <b>communication</b>, not raw FLOPs. Vectorize, batch and keep data on the device.</p>' },
      { h: 'Data parallelism', html: '<p>The simplest multi-GPU strategy: copy the model to each GPU, split each minibatch across them, compute gradients locally, <b>all-reduce</b> (average) the gradients, and apply the same update everywhere. The result equals large-batch training on one device, as the lab proves. Speedups are limited by communication overhead (see the simulator) and solved at scale with ring all-reduce and <b>parameter servers</b>.</p>' }
    ],
    widget: 'dataparallel',
    terms: [['All-reduce', 'Summing (or averaging) tensors across devices so all get the result.'], ['Asynchronous execution', 'Frontend enqueues work while the backend computes.'], ['Data parallelism', 'Same model on each device; data split across devices.']],
    lab: { tasks: [
      { prompt: 'Implement <code>data_parallel_grad(w, X, y, n_devices)</code>: split the batch into shards (<code>np.array_split</code>), compute each shard\'s MSE gradient, then <b>all-reduce</b> with a size-weighted average. It must equal the full-batch gradient, even with unequal shards.',
        starter: `import numpy as np

def grad_mse(w, X, y):
    return X.T @ (X @ w - y) / len(y)

def data_parallel_grad(w, X, y, n_devices):
    shards = list(zip(np.array_split(X, n_devices), np.array_split(y, n_devices)))
    # TODO: per-shard gradients, then a weighted average by shard size (the all-reduce)
    return np.zeros_like(w)

rng = np.random.default_rng(0)
X, y, w = rng.normal(size=(103, 5)), rng.normal(size=103), rng.normal(size=5)
print(grad_mse(w, X, y).round(5))
print(data_parallel_grad(w, X, y, 4).round(5))`,
        solution: `def data_parallel_grad(w, X, y, n_devices):
    shards = list(zip(np.array_split(X, n_devices), np.array_split(y, n_devices)))
    grads = [grad_mse(w, Xs, ys) * len(ys) for Xs, ys in shards]
    return sum(grads) / len(y)`,
        test: `import numpy as np
rng = np.random.default_rng(3)
X, y, w = rng.normal(size=(103, 5)), rng.normal(size=103), rng.normal(size=5)
for n in (1, 2, 4, 7):
    assert np.allclose(data_parallel_grad(w, X, y, n), grad_mse(w, X, y)), n` }
    ] },
    quiz: [
      { q: 'Printing the loss every iteration can slow GPU training because…', options: ['It forces synchronization, stalling the asynchronous pipeline', 'Printing is slow in Python only, and the GPU is not involved at all in the delay', 'It uses a lot of GPU memory for the formatted text', 'It changes the gradients that are computed in the next step'], correct: 0, why: 'Reading a value forces the frontend to wait for the backend.' },
      { q: 'In data-parallel training, gradients are combined by…', options: ['Picking the gradient of one device and discarding the rest', 'Concatenating all the gradients into one very long vector', 'All-reduce (averaging across devices)', 'Ignoring the gradients of the other devices entirely'], correct: 2, why: 'Every device must apply the same averaged update.' }
    ]
  },
  /* ---------- PART 6 ---------- */
  {
    id: 'computer-vision-dl', part: 5, chapter: 'Ch. 14', title: 'Computer vision: augmentation, fine-tuning & detection', minutes: 16,
    goal: 'Apply CNNs to real vision tasks: augmentation, transfer learning, detection and segmentation.',
    sections: [
      { h: 'Augmentation and fine-tuning', html: '<p><b>Image augmentation</b> (flips, crops, color jitter) creates plausible variations that improve generalization. <b>Fine-tuning</b> reuses a network pretrained on a large dataset: replace the output layer, then train with a small learning rate (optionally freezing early layers). It is the default starting point for most vision projects.</p>' },
      { h: 'Object detection', html: '<p>Detection predicts <b>bounding boxes</b> and classes. Models propose candidate boxes (<b>anchor boxes</b> of several sizes and ratios), score them, and refine their offsets. Overlap is measured by <b>IoU</b> (intersection over union). <b>Non-maximum suppression</b> removes duplicate detections: keep the highest-scoring box, drop boxes overlapping it above a threshold, repeat. Families: SSD (single-shot multibox), R-CNN, Fast/Faster/Mask R-CNN, YOLO. Tune NMS below.</p>' },
      { h: 'Segmentation and generation', html: '<p><b>Semantic segmentation</b> labels every pixel, using fully convolutional networks that upsample with <b>transposed convolutions</b>. <b>Neural style transfer</b> optimizes an image so its content features match one photo and its style statistics (Gram matrices) match a painting.</p>' }
    ],
    widget: 'nms',
    terms: [['IoU', 'Intersection area divided by union area of two boxes.'], ['Anchor box', 'A predefined candidate box that the model refines.'], ['NMS', 'Non-maximum suppression: remove overlapping duplicate detections.']],
    lab: { tasks: [
      { prompt: 'Implement <code>iou(a, b)</code> for boxes <code>(x1, y1, x2, y2)</code> and <code>nms(boxes, scores, threshold)</code>: repeatedly keep the highest-scoring remaining box and discard boxes whose IoU with it exceeds the threshold. Return kept indices in score order.',
        starter: `def iou(a, b):
    return 0.0   # TODO: intersection (clamped at 0) / union

def nms(boxes, scores, threshold=0.5):
    order = sorted(range(len(boxes)), key=lambda i: -scores[i])
    keep = []
    # TODO
    return keep

boxes = [(10, 10, 60, 60), (12, 14, 62, 58), (100, 100, 150, 160), (30, 30, 80, 80), (102, 98, 148, 158)]
scores = [0.92, 0.85, 0.80, 0.60, 0.75]
print(round(iou(boxes[0], boxes[1]), 3), round(iou(boxes[0], boxes[2]), 3))
print("kept:", nms(boxes, scores, 0.5))`,
        solution: `def iou(a, b):
    iw = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    ih = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = iw * ih
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    union = area(a) + area(b) - inter
    return inter / union if union else 0.0

def nms(boxes, scores, threshold=0.5):
    order = sorted(range(len(boxes)), key=lambda i: -scores[i])
    keep = []
    while order:
        i = order.pop(0)
        keep.append(i)
        order = [j for j in order if iou(boxes[i], boxes[j]) <= threshold]
    return keep`,
        test: `assert iou((0, 0, 2, 2), (1, 1, 3, 3)) == 1 / 7 and iou((0, 0, 1, 1), (2, 2, 3, 3)) == 0 and iou((0, 0, 2, 2), (0, 0, 2, 2)) == 1
assert nms(boxes, scores, 0.5) == [0, 2, 3], nms(boxes, scores, 0.5)
assert nms(boxes, scores, 0.2) == [0, 2], nms(boxes, scores, 0.2)
assert nms(boxes, scores, 1.0) == [0, 1, 2, 4, 3]` }
    ] },
    quiz: [
      { q: 'Two boxes have IoU 0.9. After NMS with threshold 0.5…', options: ['Both are kept, because their scores are different enough', 'Only the higher-scoring one is kept', 'Both are removed, since they overlap too much to trust', 'They are merged into a single averaged box'], correct: 1, why: 'Overlap above the threshold means a duplicate.' },
      { q: 'Fine-tuning a pretrained network usually uses…', options: ['A huge learning rate, to unlearn the old features quickly', 'Random weights in every layer, to avoid old biases', 'No training at all, since the pretrained weights are final', 'A small learning rate (and a new output layer)'], correct: 3, why: 'Small steps preserve useful pretrained features.' }
    ]
  },
  {
    id: 'nlp-pretraining', part: 5, chapter: 'Ch. 15', title: 'NLP pretraining: word2vec, subwords & BERT', minutes: 16,
    goal: 'Learn how text representations are pretrained, from word vectors to BERT, and implement BPE.',
    sections: [
      { h: 'Word embeddings', html: '<p>One-hot vectors make every word equally different. <b>word2vec</b> learns dense vectors so that words appearing in similar contexts are close: <b>skip-gram</b> predicts context words from a center word, <b>CBOW</b> the reverse. <b>Negative sampling</b> and <b>hierarchical softmax</b> avoid an expensive softmax over the whole vocabulary. <b>GloVe</b> factorizes global co-occurrence statistics; <b>fastText</b> adds subword n-grams.</p>' },
      { h: 'Subword tokenization', html: '<p>Rare and unseen words break word-level vocabularies. <b>Byte-pair encoding</b> starts from characters and repeatedly merges the most frequent adjacent pair into a new symbol. Common words become single tokens, and rare ones split into meaningful pieces (un + believ + able). Step through merges below; modern LLM tokenizers work this way.</p>' },
      { h: 'Contextual pretraining: BERT', html: '<p>Static embeddings give "bank" one vector. <b>BERT</b> is a transformer encoder pretrained on two self-supervised tasks: <b>masked language modeling</b> (predict 15% of masked tokens using both left and right context) and next-sentence prediction. Its contextual representations transfer to many downstream tasks.</p>' }
    ],
    widget: 'bpe',
    terms: [['Skip-gram', 'Predicting context words from a center word.'], ['Byte-pair encoding', 'Greedy merging of frequent symbol pairs into subword tokens.'], ['Masked language modeling', 'Predicting masked tokens from bidirectional context.']],
    lab: { tasks: [
      { prompt: 'Implement BPE training. <code>pair_counts(vocab)</code> counts adjacent symbol pairs weighted by word frequency; <code>merge(pair, vocab)</code> fuses that pair everywhere (as whole symbols); <code>learn_bpe(vocab, n)</code> returns the first n merges (most frequent pair; ties → smallest pair).',
        starter: `from collections import Counter

VOCAB = {"r a t </w>": 5, "r a t s </w>": 2, "c a t </w>": 6, "c a t s </w>": 3, "c a r </w>": 4}

def pair_counts(vocab):
    counts = Counter()
    # TODO: for word, freq: symbols = word.split(); count zip(symbols, symbols[1:])
    return counts

def merge(pair, vocab):
    out = {}
    for word, freq in vocab.items():
        s, i, merged = word.split(), 0, []
        # TODO: walk symbols; if s[i], s[i+1] == pair -> append s[i]+s[i+1], skip 2; else append s[i]
        out[" ".join(merged) if merged else word] = freq
    return out

def learn_bpe(vocab, n):
    merges = []
    # TODO: n times: best = max(counts, key=lambda p: (counts[p], [-ord(c) for c in "".join(p)])) ... or simpler: sort
    return merges

merges = learn_bpe(VOCAB, 4)
print(merges)`,
        solution: `def pair_counts(vocab):
    counts = Counter()
    for word, freq in vocab.items():
        s = word.split()
        for p in zip(s, s[1:]):
            counts[p] += freq
    return counts

def merge(pair, vocab):
    out = {}
    for word, freq in vocab.items():
        s, i, merged = word.split(), 0, []
        while i < len(s):
            if i + 1 < len(s) and (s[i], s[i + 1]) == pair:
                merged.append(s[i] + s[i + 1])
                i += 2
            else:
                merged.append(s[i])
                i += 1
        out[" ".join(merged)] = freq
    return out

def learn_bpe(vocab, n):
    merges = []
    for _ in range(n):
        counts = pair_counts(vocab)
        if not counts:
            break
        best = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
        merges.append(best)
        vocab = merge(best, vocab)
    return merges`,
        test: `c = pair_counts(VOCAB)
assert c[("a", "t")] == 16 and c[("c", "a")] == 13
assert merge(("a", "t"), {"c a t </w>": 1}) == {"c at </w>": 1}
assert merge(("a", "a"), {"a a a </w>": 1}) == {"aa a </w>": 1}
assert learn_bpe(VOCAB, 3) == [("a", "t"), ("at", "</w>"), ("c", "at</w>")], learn_bpe(VOCAB, 3)` }
    ] },
    quiz: [
      { q: 'Why do modern models use subword tokenization?', options: ['It handles rare and unseen words with a fixed vocabulary', 'It is faster to type, because words are cut into small parts', 'It removes punctuation, which only confuses the model', 'It needs no training data, because splits come from a dictionary'], correct: 0, why: 'Unknown words split into known pieces.' },
      { q: 'BERT\'s masked language modeling uses…', options: ['Left context only, as in left-to-right language models', 'No context at all, because every masked word is independent', 'Images, which are masked in the same way as words', 'Both left and right context'], correct: 3, why: 'It is a bidirectional encoder.' }
    ]
  },
  {
    id: 'nlp-applications', part: 5, chapter: 'Ch. 16', title: 'NLP applications: sentiment, inference & fine-tuning', minutes: 14,
    goal: 'Prepare text batches for models, and fine-tune pretrained transformers for downstream tasks.',
    sections: [
      { h: 'Architectures for text tasks', html: '<p><b>Sentiment analysis</b> (single-text classification) works with RNNs or <b>1D CNNs</b> over pretrained embeddings. <b>Natural language inference</b> (premise, hypothesis → entailment, contradiction or neutral) can use attention to align words between the two sentences. These are the classic task-specific designs.</p>' },
      { h: 'Fine-tuning BERT', html: '<p>With a pretrained encoder, most tasks need only a small output head: the [CLS] representation for single-text and text-pair classification, per-token outputs for tagging, and start/end positions for question answering. Fine-tune all parameters for a few epochs with a small learning rate; it usually beats task-specific architectures, especially with little labeled data. See the trade-off below.</p>' },
      { h: 'Batching text', html: '<p>Models need rectangular tensors: map tokens to ids (with an <code>&lt;unk&gt;</code> for out-of-vocabulary words), <b>truncate</b> long sequences, <b>pad</b> short ones, and pass an <b>attention mask</b> so the model ignores padding. That is the lab.</p>' }
    ],
    widget: 'finetune',
    terms: [['Natural language inference', 'Deciding if a hypothesis follows from a premise.'], ['[CLS] token', 'Special token whose representation summarizes the input for classification.'], ['Attention mask', 'Marks real tokens (1) vs. padding (0).']],
    lab: { tasks: [
      { prompt: 'Implement <code>encode(text, vocab)</code> (lowercase, split, map to ids, unknown → <code>&lt;unk&gt;</code>) and <code>pad_batch(seqs, max_len, pad_id)</code>, which truncates or pads every sequence to <code>max_len</code> and returns <code>(ids, mask)</code> as NumPy arrays.',
        starter: `import numpy as np
VOCAB = {"<pad>": 0, "<unk>": 1, "the": 2, "movie": 3, "was": 4, "great": 5, "terrible": 6, "not": 7, "plot": 8}

def encode(text, vocab):
    return []   # TODO

def pad_batch(seqs, max_len, pad_id=0):
    ids = np.full((len(seqs), max_len), pad_id)
    mask = np.zeros((len(seqs), max_len), dtype=int)
    # TODO: copy up to max_len ids per row and set mask to 1 for real tokens
    return ids, mask

batch = [encode(t, VOCAB) for t in ["The movie was great", "Not great", "the plot was terrible and slow and long"]]
print(batch)
ids, mask = pad_batch(batch, 6)
print(ids)
print(mask)`,
        solution: `def encode(text, vocab):
    return [vocab.get(w, vocab["<unk>"]) for w in text.lower().split()]

def pad_batch(seqs, max_len, pad_id=0):
    ids = np.full((len(seqs), max_len), pad_id)
    mask = np.zeros((len(seqs), max_len), dtype=int)
    for i, s in enumerate(seqs):
        s = s[:max_len]
        ids[i, :len(s)] = s
        mask[i, :len(s)] = 1
    return ids, mask`,
        test: `import numpy as np
assert encode("The movie was GREAT", VOCAB) == [2, 3, 4, 5] and encode("amazing plot", VOCAB) == [1, 8]
ids, mask = pad_batch([[2, 3], [5, 6, 7, 8, 4, 2, 3]], 5)
assert ids.tolist() == [[2, 3, 0, 0, 0], [5, 6, 7, 8, 4]] and mask.tolist() == [[1, 1, 0, 0, 0], [1, 1, 1, 1, 1]]
assert pad_batch([[]], 3)[1].sum() == 0` }
    ] },
    quiz: [
      { q: 'What does the attention mask tell a transformer?', options: ['Which tokens are important for the final prediction', 'The labels the model must predict for the batch', 'Which positions are real tokens vs. padding', 'The learning rate to use for each position'], correct: 2, why: 'Padding must not influence attention.' },
      { q: 'With only 1,000 labeled examples, the strongest approach is usually…', options: ['Train a large model from scratch on the 1,000 examples', 'Fine-tune a pretrained transformer', 'Use one-hot features only, with a linear classifier', 'Skip validation, since there is so little data'], correct: 1, why: 'Pretraining transfers knowledge learned from massive text.' }
    ]
  },
  /* ---------- PART 7 ---------- */
  {
    id: 'rl-gp-hpo', part: 6, chapter: 'Ch. 17–19', title: 'Reinforcement learning, Gaussian processes & hyperparameter optimization', minutes: 16,
    goal: 'Tour three tools beyond supervised nets, and implement successive halving.',
    sections: [
      { h: 'Reinforcement learning', html: '<p>An agent interacts with an MDP, collecting rewards. With a known model, <b>value iteration</b> computes optimal values; without one, <b>Q-learning</b> learns action values from experience, and deep Q-networks replace the table with a neural network. (See the AI Foundations and ML courses for interactive versions.)</p>' },
      { h: 'Gaussian processes', html: '<p>A GP is a distribution over <b>functions</b>, defined by a mean and a <b>kernel</b> (e.g. RBF, whose <b>length-scale</b> sets smoothness). Conditioning on observations gives a posterior mean and, crucially, <b>uncertainty</b> that grows away from data. Inference is exact but costs O(n³), so it suits small data, scientific modeling and Bayesian optimization. Click to add points below.</p>' },
      { h: 'Hyperparameter optimization', html: '<p>Learning rate, depth, width and regularization strongly affect results. <b>Random search</b> beats grid search in high dimensions. <b>Bayesian optimization</b> models the objective (often with a GP) to choose promising configurations. <b>Multi-fidelity</b> methods save compute by evaluating many configurations cheaply (few epochs) and promoting only the best: <b>successive halving</b> and Hyperband, asynchronous versions included.</p>' }
    ],
    widget: 'gp',
    terms: [['Kernel', 'Function defining similarity, and thus smoothness, in a GP.'], ['Bayesian optimization', 'Using a surrogate model to choose what to evaluate next.'], ['Successive halving', 'Evaluate many configs cheaply; repeatedly keep the best fraction with more budget.']],
    lab: { tasks: [
      { prompt: 'Implement <code>successive_halving(configs, evaluate, min_budget, eta)</code>: evaluate all configs at the current budget (lower loss is better), keep the best 1/eta (at least 1), multiply the budget by eta, and repeat until one remains. Return <code>(best_config, total_budget_spent)</code>. Then notice something: cfg4 has the best <i>final</i> loss but learns slowly. Does it survive round 1?',
        starter: `import math

def successive_halving(configs, evaluate, min_budget=1, eta=2):
    alive, budget, spent = list(configs), min_budget, 0
    # TODO: while len(alive) > 1: score all, spent += budget * len(alive), keep top ceil(len/eta)... use max(1, len(alive)//eta)
    return alive[0], spent

# loss after 'epochs' of training: configs differ in final quality and learning speed
configs = [{"name": f"cfg{i}", "final": f, "speed": s} for i, (f, s) in enumerate(
    [(0.30, 1.0), (0.22, 0.4), (0.25, 2.0), (0.40, 3.0), (0.20, 0.3), (0.35, 0.8), (0.28, 1.5), (0.33, 2.5)])]
evaluate = lambda c, epochs: c["final"] + 0.5 * math.exp(-c["speed"] * epochs)

best, spent = successive_halving(configs, evaluate, 1, 2)
print(best["name"], "using", spent, "epochs vs", 8 * 8, "for full training of all")
print("best final loss would be:", min(configs, key=lambda c: c["final"])["name"], "(eliminated early: the classic weakness of aggressive early stopping)")`,
        solution: `def successive_halving(configs, evaluate, min_budget=1, eta=2):
    alive, budget, spent = list(configs), min_budget, 0
    while len(alive) > 1:
        scored = sorted(alive, key=lambda c: evaluate(c, budget))
        spent += budget * len(alive)
        alive = scored[:max(1, len(alive) // eta)]
        budget *= eta
    return alive[0], spent`,
        test: `best, spent = successive_halving(configs, evaluate, 1, 2)
assert spent == 8 * 1 + 4 * 2 + 2 * 4, spent
assert best["name"] == "cfg2", best["name"]
solo, s = successive_halving(configs[:1], evaluate)
assert solo is configs[0] and s == 0` }
    ] },
    quiz: [
      { q: 'Away from observed data, a GP posterior\'s uncertainty…', options: ['Shrinks to zero, because the mean takes over', 'Grows', 'Becomes negative, since variance can go below zero', 'Is undefined, because there are no observations'], correct: 1, why: 'Less data nearby means more uncertainty.' },
      { q: 'Successive halving saves compute by…', options: ['Training every configuration to completion before comparing them, which uses more compute', 'Using smaller GPUs for the weaker configurations', 'Skipping validation on the configurations that look bad', 'Stopping poor configurations early based on cheap evaluations'], correct: 3, why: 'Only promising configurations receive large budgets.' }
    ]
  },
  {
    id: 'gans-recommenders', part: 6, chapter: 'Ch. 20–21', title: 'GANs & recommender systems', minutes: 15,
    goal: 'Understand adversarial generation, and build a matrix-factorization recommender.',
    sections: [
      { h: 'Generative adversarial networks', html: '<p>A <b>generator</b> maps random noise to samples; a <b>discriminator</b> tries to tell real from fake. They play a minimax game: the discriminator\'s errors are the generator\'s training signal. <b>DCGAN</b> uses convolutional architectures with batch norm and leaky ReLU to generate images. GAN training is notoriously unstable (mode collapse, oscillation); diffusion models have since overtaken GANs for image generation.</p>' },
      { h: 'Recommender systems', html: '<p>Recommenders predict what users will like from <b>explicit</b> feedback (ratings) or <b>implicit</b> feedback (clicks, views). <b>Matrix factorization</b> learns a vector per user and per item so that their dot product approximates known ratings, and fills in the unknown ones. Watch it learn below. Extensions include AutoRec, personalized ranking with BPR loss, NeuMF, sequence-aware models and feature-rich factorization machines.</p>' },
      { h: 'Where to go next', html: '<p>The textbook\'s appendix covers the mathematics: linear algebra, calculus, probability, information theory and statistics. Its online version at <a href="https://d2l.ai" target="_blank" rel="noopener noreferrer">d2l.ai</a> has runnable code for every section. Continue with the LLM Engineering course for large-scale practice.</p>' }
    ],
    widget: 'matfact',
    terms: [['Generator / discriminator', 'GAN networks that create samples and judge real vs. fake.'], ['Mode collapse', 'A generator producing only a few kinds of output.'], ['Matrix factorization', 'Approximating a ratings matrix by user × item latent factors.']],
    lab: { tasks: [
      { prompt: 'Train <b>matrix factorization</b> with SGD on the observed ratings only: for each known (u, i, r), compute <code>err = r − P[u]·Q[i]</code> and update <code>P[u] += lr·(err·Q[i] − reg·P[u])</code> and <code>Q[i]</code> likewise. Then predict the missing ratings.',
        starter: `import numpy as np
nan = np.nan
# rows: users, cols: movies (Action1, Action2, Action3, Romance1, Romance2)
R = np.array([[5, 5, nan, 1, 1],
              [4, nan, 5, 1, 2],
              [1, 1, 2, nan, 5],
              [nan, 1, 1, 5, 4],
              [5, 4, 5, 2, nan]])

def train_mf(R, k=2, lr=0.02, reg=0.02, epochs=800, seed=0):
    rng = np.random.default_rng(seed)
    P, Q = rng.normal(0, 0.1, (R.shape[0], k)), rng.normal(0, 0.1, (R.shape[1], k))
    known = [(u, i, R[u, i]) for u in range(R.shape[0]) for i in range(R.shape[1]) if not np.isnan(R[u, i])]
    for _ in range(epochs):
        for idx in rng.permutation(len(known)):
            u, i, r = known[idx]
            pass   # TODO: err, then update P[u] and Q[i] (use the old P[u] when updating Q[i])
    return P, Q

def rmse(R, P, Q):
    mask = ~np.isnan(R)
    return float(np.sqrt(np.mean((np.nan_to_num(R) - P @ Q.T)[mask] ** 2)))

P, Q = train_mf(R)
print("train RMSE:", round(rmse(R, P, Q), 3))
print((P @ Q.T).round(1))`,
        solution: `def train_mf(R, k=2, lr=0.02, reg=0.02, epochs=800, seed=0):
    rng = np.random.default_rng(seed)
    P, Q = rng.normal(0, 0.1, (R.shape[0], k)), rng.normal(0, 0.1, (R.shape[1], k))
    known = [(u, i, R[u, i]) for u in range(R.shape[0]) for i in range(R.shape[1]) if not np.isnan(R[u, i])]
    for _ in range(epochs):
        for idx in rng.permutation(len(known)):
            u, i, r = known[idx]
            err = r - P[u] @ Q[i]
            pu = P[u].copy()
            P[u] += lr * (err * Q[i] - reg * P[u])
            Q[i] += lr * (err * pu - reg * Q[i])
    return P, Q`,
        test: `import numpy as np
P, Q = train_mf(R)
pred = P @ Q.T
assert rmse(R, P, Q) < 0.35, rmse(R, P, Q)
assert pred[0, 2] > 3.5, "user 0 loves action: Action3 should be predicted high"
assert pred[3, 0] < 2.5, "user 3 dislikes action"
assert pred[2, 3] > 3.5, "user 2 loves romance"` }
    ] },
    quiz: [
      { q: 'In a GAN, the generator improves by…', options: ['Copying training images as exactly as possible, pixel by pixel, until the loss reaches zero', 'Minimizing the reconstruction error only, as in an autoencoder', 'Producing samples the discriminator classifies as real', 'Using class labels to decide which images to generate'], correct: 2, why: 'It learns from the discriminator\'s feedback.' },
      { q: 'Matrix factorization predicts a missing rating as…', options: ['The dot product of the user\'s and item\'s latent vectors', 'The global average rating only, repeated for every user and every item in the table', 'A random number inside the rating range', 'The item\'s popularity, ignoring the user'], correct: 0, why: 'Latent factors capture tastes and item properties.' }
    ]
  }
  ]
};
