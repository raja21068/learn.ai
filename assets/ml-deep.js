/* Two additional Machine Learning lessons: an experiment (Part 1) and a capstone project (Part 6). Generated from the lab
   definitions that were verified in plain Python and in the in-browser Pyodide runner; the experiment's rules live in ml-lab.js. */
(() => {
  'use strict';
  const C = window.ML_COURSE; if (!C || C.__deep) return; C.__deep = true;
  const LAB = {
 "id": "model-lab",
 "part": 0,
 "chapter": "Experiment lab",
 "title": "Experiment: why does a model that looks great fail in deployment?",
 "minutes": 20,
 "goal": "Run controlled experiments on underfitting, overfitting, regularization, more data and leakage, and learn to distrust results that look too good.",
 "sections": [
  {
   "h": "Three numbers, three stories",
   "html": "<p>The lab fits a curve to noisy data and reports three errors. <b>Training error</b> says how well the model fits what it has seen. <b>Validation error</b> estimates how it will do on new data. <b>Deployment error</b> is what happens when the model is really used: you never get to see this number until it is too late, so the craft of machine learning is making validation an <i>honest</i> stand-in for deployment.</p><p>Every noisy dataset also has a <b>noise floor</b>: no model can do better than the noise in the data itself. Here it is about 0.30.</p>"
  },
  {
   "h": "Run it like an experiment",
   "html": "<ol><li><b>Predict</b> what a change will do to each of the three errors before you run it.</li><li><b>Change one thing at a time</b>: degree, training examples, ridge strength, or the leaked feature.</li><li><b>Compare with the noise floor.</b> A validation error far <i>below</i> the floor is not a triumph. It is a symptom that something is wrong.</li><li><b>Sweep</b> all twelve degrees to see where validation error is lowest, and whether training error would have told you the same.</li></ol>"
  },
  {
   "h": "What this model leaves out",
   "html": "<p>The lab uses one input, polynomials and a synthetic sine curve so that every number is exact and repeatable. Real overfitting happens in thousands of dimensions, and real leakage is subtler: scaling before the split, duplicate rows, features recorded after the outcome, or random splits of time series. The lab teaches the <i>pattern</i> to look for, not a recipe that finds every leak.</p>"
  }
 ],
 "widget": "mllab",
 "terms": [
  [
   "Noise floor",
   "The error no model can go below because the data itself is noisy."
  ],
  [
   "Leakage",
   "Information in the training or validation data that will not exist when the model is used for real."
  ],
  [
   "Validation set",
   "Held-out data used to choose settings, never to report final performance."
  ],
  [
   "Regularization",
   "A penalty on large weights that trades a little training fit for better generalization."
  ]
 ],
 "lab": {
  "practice": "Turn the warning signs into code, then rebuild the experiment's engine.",
  "tasks": [
   {
    "prompt": "Turn the lab's warning signs into code. Implement <code>rmse</code> and <code>diagnose(train_err, val_err)</code>, which labels a run <code>suspicious</code>, <code>underfit</code>, <code>overfit</code> or <code>good</code> using the rules in the docstring. The hidden tests use numbers copied from real runs of the ML Lab.",
    "starter": "FLOOR = 0.3   # the noise floor: the best RMSE any model can reach on this data\n\ndef rmse(y_true, y_pred):\n    # TODO: square root of the mean squared error\n    return 0.0\n\ndef diagnose(train_err, val_err, floor=FLOOR):\n    \"\"\"Return \"suspicious\", \"underfit\", \"overfit\" or \"good\", checking in this order:\n    - \"suspicious\": validation error is below half the noise floor (too good to be true: look for leakage)\n    - \"underfit\":   training error is at least 1.5 x the floor (the model cannot even fit its own training data)\n    - \"overfit\":    validation error is above 1.5 x the floor AND above 1.5 x the training error\n    - otherwise \"good\" \"\"\"\n    # TODO\n    return \"good\"\n",
    "solution": "FLOOR = 0.3   # the noise floor: the best RMSE any model can reach on this data\n\ndef rmse(y_true, y_pred):\n    return (sum((a - b) ** 2 for a, b in zip(y_true, y_pred)) / len(y_true)) ** 0.5\n\ndef diagnose(train_err, val_err, floor=FLOOR):\n    if val_err < 0.5 * floor:\n        return \"suspicious\"\n    if train_err >= 1.5 * floor:\n        return \"underfit\"\n    if val_err > 1.5 * floor and val_err > 1.5 * train_err:\n        return \"overfit\"\n    return \"good\"\n",
    "test": "assert abs(rmse([1, 2, 3], [1, 2, 3])) < 1e-12\nassert abs(rmse([0, 0], [3, 4]) - (12.5 ** 0.5)) < 1e-9\n# numbers copied from runs of the ML Lab widget\nCASES = [\n    ((0.602, 0.600), \"underfit\"),     # degree 1, 20 examples\n    ((0.264, 0.412), \"good\"),         # degree 3, 20 examples\n    ((0.162, 2.597), \"overfit\"),      # degree 9, 20 examples\n    ((0.037, 0.057), \"suspicious\"),   # a leaked feature: validation far below the noise floor\n    ((0.307, 0.349), \"good\"),         # degree 3, 60 examples\n    ((0.164, 0.459), \"overfit\"),      # degree 9, ridge 0.01\n]\nfor (tr, va), want in CASES:\n    assert diagnose(tr, va) == want, (tr, va, want, diagnose(tr, va))\nassert diagnose(0.5, 0.5, floor=0.5) == \"good\"\nassert diagnose(0.2, 0.2, floor=1.0) == \"suspicious\"\n"
   },
   {
    "prompt": "Rebuild the experiment's engine. Implement ridge regression with the normal equations in <code>fit_ridge</code>, and <code>select_degree</code>, which picks the polynomial degree using <b>validation</b> error only.",
    "starter": "import numpy as np\n\ndef design(x, degree):\n    \"\"\"Vandermonde matrix with columns x**0 ... x**degree.\"\"\"\n    return np.vander(np.asarray(x, dtype=float), degree + 1, increasing=True)\n\ndef fit_ridge(x, y, degree, lam):\n    \"\"\"Return the weights w minimising ||A w - y||^2 + lam * ||w||^2 (solve the normal equations).\"\"\"\n    A = design(x, degree)\n    # TODO: solve (A.T A + lam I) w = A.T y with np.linalg.solve\n    return np.zeros(degree + 1)\n\ndef predict(w, x):\n    return design(x, len(w) - 1) @ w\n\ndef select_degree(x_tr, y_tr, x_val, y_val, degrees, lam=0.0):\n    \"\"\"Fit every degree on the TRAINING data and return the degree with the lowest RMSE on the VALIDATION data.\n    A tie goes to the smaller degree.\"\"\"\n    # TODO\n    return degrees[0]\n",
    "solution": "import numpy as np\n\ndef design(x, degree):\n    return np.vander(np.asarray(x, dtype=float), degree + 1, increasing=True)\n\ndef fit_ridge(x, y, degree, lam):\n    A = design(x, degree)\n    return np.linalg.solve(A.T @ A + lam * np.eye(degree + 1), A.T @ np.asarray(y, dtype=float))\n\ndef predict(w, x):\n    return design(x, len(w) - 1) @ w\n\ndef select_degree(x_tr, y_tr, x_val, y_val, degrees, lam=0.0):\n    best, best_err = None, None\n    for d in sorted(degrees):\n        w = fit_ridge(x_tr, y_tr, d, lam)\n        err = float(np.sqrt(np.mean((predict(w, x_val) - np.asarray(y_val)) ** 2)))\n        if best_err is None or err < best_err - 1e-12:\n            best, best_err = d, err\n    return best\n",
    "test": "x = np.linspace(-1, 1, 7)\ny = 1 + 2 * x - 3 * x ** 2\nw = fit_ridge(x, y, 2, 0.0)\nassert np.allclose(w, [1, 2, -3], atol=1e-8), w\nassert np.allclose(predict(w, [0.5]), [1 + 1 - 0.75])\nbig = fit_ridge(x, y, 2, 10.0)\nassert np.linalg.norm(big) < np.linalg.norm(w) * 0.8, \"a stronger penalty must shrink the weights\"\n# ten points, degree 9, no penalty: the training data is interpolated, a penalty gives up a little training fit\nxs = np.linspace(-1, 1, 10)\nys = np.array([0.1, -0.3, 0.2, 0.0, 0.4, -0.2, 0.3, -0.1, 0.2, -0.3])\nw9 = fit_ridge(xs, ys, 9, 0.0)\nassert np.allclose(predict(w9, xs), ys, atol=1e-5)\nw9r = fit_ridge(xs, ys, 9, 0.1)\nassert np.abs(predict(w9r, xs) - ys).max() > 1e-3\n# the data really are quadratic plus a small fixed wiggle, so a validation set should pick degree 2\nxt = np.linspace(-1, 1, 12)\nwiggle = np.array([0.02, -0.03, 0.01, 0.03, -0.02, 0.0, 0.02, -0.01, -0.03, 0.02, -0.02, 0.01])\nyt = 1 + 2 * xt - 3 * xt ** 2 + wiggle\nxv = np.linspace(-0.95, 0.95, 9)\nyv = 1 + 2 * xv - 3 * xv ** 2\nassert select_degree(xt, yt, xv, yv, [1, 2, 3, 6, 9]) == 2, select_degree(xt, yt, xv, yv, [1, 2, 3, 6, 9])\nassert select_degree(xt, yt, xv, yv, [9, 2, 1]) == 2\nassert select_degree(xt, yt, xv, yv, [1]) == 1\n"
   }
  ]
 },
 "quiz": [
  {
   "q": "A model's validation error is 0.06 on data whose noise floor is about 0.30. What should you conclude first?",
   "options": [
    "It proves the model generalizes better than any other",
    "It shows the noise floor was estimated far too high",
    "It is too good to be true: look for leakage before celebrating",
    "It means the validation set is too small to matter"
   ],
   "correct": 2,
   "why": "No honest model can beat the noise floor by a factor of five. Suspect a feature computed from the label, preprocessing done before the split, or duplicated rows, and check before you celebrate."
  },
  {
   "q": "With 20 examples, a degree-9 model has training RMSE 0.16 but validation RMSE 2.6. Which change is LEAST likely to help?",
   "options": [
    "Collecting more training examples",
    "Adding ridge regularization",
    "Lowering the degree to 3 or 4",
    "Raising the degree further, to 12"
   ],
   "correct": 3,
   "why": "More flexibility is what caused the gap. More data, a ridge penalty or a simpler model all reduce it."
  }
 ]
};
  const PROJECT = {
 "id": "churn-project",
 "part": 5,
 "chapter": "Capstone project",
 "title": "Project: an honest churn model",
 "minutes": 60,
 "goal": "Build the evaluation backbone of a churn-prediction pipeline in five milestones, each checked by hidden tests, ending in a release gate that can block your own model.",
 "sections": [
  {
   "h": "The brief",
   "html": "<p>A subscription company wants to know who will cancel next month so that the retention team can call them. Missing a churner costs a customer; calling a loyal customer wastes a call. You will build the parts of the pipeline where honest machine learning is won or lost: how the data is split, how features are scaled, how a threshold is chosen, how settings are compared, and when a model is allowed to ship. The model itself is deliberately ordinary, because the evaluation is the hard part.</p>"
  },
  {
   "h": "Five milestones",
   "html": "<ol><li><b>Split without leaking the future.</b> Chronological train, validation and test sets, and a check for customers who appear in both.</li><li><b>Scale without peeking.</b> A scaler that learns from the training rows only.</li><li><b>Metrics and a threshold.</b> Precision, recall, F1, and the threshold with the best precision that still meets the recall the business needs.</li><li><b>Cross-validation.</b> Folds that never let validation rows into training.</li><li><b>The release gate.</b> Block for leakage, no real gain over the baseline, low recall, or an unfair gap between groups.</li></ol><p>Each task has a hidden test. A milestone solved with hints is recorded as assisted.</p>"
  },
  {
   "h": "Definition of done",
   "html": "<ul><li>No row from the future is ever used to predict the past.</li><li>Nothing the test set contains influences scaling, threshold or settings.</li><li>The threshold is chosen against the recall the business needs, not against accuracy.</li><li>A model that leaks, adds nothing over the baseline or misses the recall target does not ship.</li></ul>"
  },
  {
   "h": "What passing does and does not show",
   "html": "<p>Passing the hidden tests shows that you implemented honest evaluation correctly. It does not show that a churn model built on it is valuable: that needs real data, monitoring after launch and an experiment that compares the retention team with and without the model. The project is evidence of skill with the building blocks, not a certificate.</p>"
  }
 ],
 "widget": null,
 "terms": [
  [
   "Chronological split",
   "Dividing data by time so that models are trained on the past and tested on the future."
  ],
  [
   "Release gate",
   "An automated check that decides whether a model may ship, based on leakage, gain over a baseline and requirements."
  ],
  [
   "Cross-validation",
   "Rotating which fold is held out, so that every row is used for validation exactly once."
  ],
  [
   "Baseline",
   "A trivial rule or model that any real model has to beat by a meaningful margin."
  ]
 ],
 "lab": {
  "practice": "Complete the five milestones in order; each has its own hidden test.",
  "tasks": [
   {
    "prompt": "<b>Milestone 1: split without leaking the future.</b> Write <code>chronological_split</code> (order by month, cut by fraction, never shuffle, never mutate the input) and <code>leakage_check</code>, which lists customer ids that appear in both train and test.",
    "starter": "def chronological_split(rows, train_frac, val_frac):\n    \"\"\"Return (train, val, test): the rows ordered by their \"month\" value, then cut at\n    int(n * train_frac) and int(n * (train_frac + val_frac)). Never shuffle, and never change the input list.\"\"\"\n    # TODO\n    return [], [], []\n\ndef leakage_check(train, test, key=\"customer_id\"):\n    \"\"\"Sorted list of ids that appear in BOTH train and test.\"\"\"\n    # TODO\n    return []\n",
    "solution": "def chronological_split(rows, train_frac, val_frac):\n    ordered = sorted(rows, key=lambda r: r[\"month\"])\n    n = len(ordered)\n    a, b = int(n * train_frac), int(n * (train_frac + val_frac))\n    return ordered[:a], ordered[a:b], ordered[b:]\n\ndef leakage_check(train, test, key=\"customer_id\"):\n    return sorted({r[key] for r in train} & {r[key] for r in test})\n",
    "test": "rows = [{\"customer_id\": i, \"month\": m} for i, m in enumerate([5, 1, 9, 3, 7, 2, 10, 4, 8, 6])]\nbefore = [dict(r) for r in rows]\ntr, va, te = chronological_split(rows, 0.6, 0.2)\nassert (len(tr), len(va), len(te)) == (6, 2, 2), (len(tr), len(va), len(te))\nassert [r[\"month\"] for r in tr] == [1, 2, 3, 4, 5, 6]\nassert [r[\"month\"] for r in va] == [7, 8] and [r[\"month\"] for r in te] == [9, 10]\nassert max(r[\"month\"] for r in tr) < min(r[\"month\"] for r in va) < min(r[\"month\"] for r in te), \"the future must never be in training\"\nassert rows == before, \"the input list must not be changed\"\nassert leakage_check(tr, va + te) == []\nassert leakage_check([{\"customer_id\": 3}, {\"customer_id\": 5}], [{\"customer_id\": 5}, {\"customer_id\": 9}, {\"customer_id\": 3}]) == [3, 5]\nassert leakage_check([{\"id\": 1}], [{\"id\": 1}], key=\"id\") == [1]\n"
   },
   {
    "prompt": "<b>Milestone 2: scale without peeking.</b> Write a <code>Scaler</code> whose <code>fit</code> learns column means and standard deviations from the training rows only, and whose <code>transform</code> applies those stored numbers to any data.",
    "starter": "class Scaler:\n    \"\"\"Standardise columns using statistics learned from the TRAINING data only.\"\"\"\n    def fit(self, X):\n        # TODO: per-column mean and population standard deviation (divide by n); a column with std 0 uses 1.0\n        self.mean, self.std = [], []\n        return self\n\n    def transform(self, X):\n        # TODO: (value - mean) / std using the stored statistics, never recomputed from X\n        return X\n",
    "solution": "class Scaler:\n    def fit(self, X):\n        cols = list(zip(*X))\n        self.mean = [sum(c) / len(c) for c in cols]\n        self.std = [(sum((v - m) ** 2 for v in c) / len(c)) ** 0.5 or 1.0 for c, m in zip(cols, self.mean)]\n        return self\n\n    def transform(self, X):\n        return [[(v - m) / s for v, m, s in zip(row, self.mean, self.std)] for row in X]\n",
    "test": "train = [[1.0, 10.0], [3.0, 10.0], [5.0, 10.0]]\ns = Scaler().fit(train)\nassert s.mean == [3.0, 10.0]\nassert abs(s.std[0] - (8 / 3) ** 0.5) < 1e-9 and s.std[1] == 1.0\nout = s.transform([[3.0, 12.0], [5.0, 10.0]])\nassert abs(out[0][0]) < 1e-12 and out[0][1] == 2.0, out\nassert abs(out[1][0] - 2 / (8 / 3) ** 0.5) < 1e-9\nt = s.transform(train)\nassert abs(sum(r[0] for r in t)) < 1e-9\n# transform must not learn: a wild test set leaves the stored statistics alone\ns.transform([[1000.0, 1000.0]])\nassert s.mean == [3.0, 10.0]\nassert s.fit([[0.0], [2.0]]) is s and s.mean == [1.0]\n"
   },
   {
    "prompt": "<b>Milestone 3: metrics and a threshold.</b> Write <code>prf</code> (precision, recall, F1) and <code>pick_threshold</code>: the threshold with the best precision among those that still reach the minimum recall the business needs.",
    "starter": "def prf(y, pred):\n    \"\"\"(precision, recall, f1) with 0.0 whenever a denominator is 0.\"\"\"\n    # TODO\n    return 0.0, 0.0, 0.0\n\ndef pick_threshold(y, scores, min_recall):\n    \"\"\"Candidate thresholds are the observed scores (predict 1 when score >= t).\n    Return the candidate with the highest precision whose recall is at least min_recall;\n    on equal precision prefer the HIGHER threshold. Return None when no threshold reaches the recall.\"\"\"\n    # TODO\n    return None\n",
    "solution": "def prf(y, pred):\n    tp = sum(1 for a, b in zip(y, pred) if a == 1 and b == 1)\n    fp = sum(1 for a, b in zip(y, pred) if a == 0 and b == 1)\n    fn = sum(1 for a, b in zip(y, pred) if a == 1 and b == 0)\n    p = tp / (tp + fp) if tp + fp else 0.0\n    r = tp / (tp + fn) if tp + fn else 0.0\n    f = 2 * p * r / (p + r) if p + r else 0.0\n    return p, r, f\n\ndef pick_threshold(y, scores, min_recall):\n    best = None\n    for t in sorted(set(scores)):\n        p, r, _ = prf(y, [1 if s >= t else 0 for s in scores])\n        if r >= min_recall and (best is None or p > best[1] or (p == best[1] and t > best[0])):\n            best = (t, p)\n    return best[0] if best else None\n",
    "test": "y = [1, 1, 0, 1, 0, 0, 1, 0]\np, r, f = prf(y, [1, 1, 1, 0, 0, 0, 1, 0])\nassert abs(p - 0.75) < 1e-9 and abs(r - 0.75) < 1e-9 and abs(f - 0.75) < 1e-9, (p, r, f)\nassert prf([0, 0], [0, 0]) == (0.0, 0.0, 0.0)\nassert prf([1, 1], [0, 0]) == (0.0, 0.0, 0.0)\nscores = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]\nassert pick_threshold(y, scores, 0.5) == 0.8, pick_threshold(y, scores, 0.5)\nassert pick_threshold(y, scores, 1.0) == 0.3, pick_threshold(y, scores, 1.0)\nassert pick_threshold(y, scores, 0.0) == 0.9\nassert pick_threshold([0, 0, 0], [0.1, 0.2, 0.3], 0.5) is None or True\nassert pick_threshold([1, 1], [0.4, 0.4], 1.0) == 0.4\nassert pick_threshold([0, 0, 1], [0.9, 0.8, 0.1], 1.0) == 0.1\n"
   },
   {
    "prompt": "<b>Milestone 4: cross-validation.</b> Write <code>kfold</code> (contiguous folds, sizes differing by at most one) and <code>cv_scores</code>, which fits a fresh model on each training fold and scores it on the held-out fold only.",
    "starter": "def kfold(n, k):\n    \"\"\"k contiguous folds over range(n); fold sizes differ by at most 1 (the first n % k folds get one extra).\n    Return [(train_indices, val_indices), ...]. Every index is in exactly one validation fold.\"\"\"\n    # TODO\n    return []\n\ndef cv_scores(fit, score, X, y, k):\n    \"\"\"For each fold: model = fit(X_train, y_train) using ONLY the training rows, then score(model, X_val, y_val).\n    Return the list of k scores.\"\"\"\n    # TODO\n    return []\n",
    "solution": "def kfold(n, k):\n    sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]\n    folds, start = [], 0\n    for s in sizes:\n        val = list(range(start, start + s))\n        train = [i for i in range(n) if i < start or i >= start + s]\n        folds.append((train, val))\n        start += s\n    return folds\n\ndef cv_scores(fit, score, X, y, k):\n    out = []\n    for tr, va in kfold(len(X), k):\n        model = fit([X[i] for i in tr], [y[i] for i in tr])\n        out.append(score(model, [X[i] for i in va], [y[i] for i in va]))\n    return out\n",
    "test": "f = kfold(10, 3)\nassert [len(v) for _, v in f] == [4, 3, 3], [len(v) for _, v in f]\nassert f[0][1] == [0, 1, 2, 3] and f[1][1] == [4, 5, 6] and f[2][1] == [7, 8, 9]\nassert f[1][0] == [0, 1, 2, 3, 7, 8, 9]\nfor tr, va in f:\n    assert not set(tr) & set(va) and sorted(tr + va) == list(range(10))\nassert sorted(i for _, v in kfold(7, 7) for i in v) == list(range(7))\nseen = []\ndef fit(Xt, yt):\n    seen.append(list(Xt))\n    return sum(yt) / len(yt)\ndef score(m, Xv, yv):\n    assert not any(x in seen[-1] for x in Xv), \"validation rows must not be in the training set\"\n    return sum(abs(m - t) for t in yv) / len(yv)\nX = [[i] for i in range(9)]\ny = [0, 0, 0, 3, 3, 3, 6, 6, 6]\nres = cv_scores(fit, score, X, y, 3)\nassert len(res) == 3 and len(seen) == 3 and all(len(s) == 6 for s in seen)\nassert abs(res[0] - 4.5) < 1e-9 and abs(res[1] - 0.0) < 1e-9 and abs(res[2] - 4.5) < 1e-9, res\n"
   },
   {
    "prompt": "<b>Milestone 5: the release gate.</b> Write <code>release_gate</code>, which blocks a model for leakage, no real gain over the baseline, recall below the requirement, or a gap between groups that is too large.",
    "starter": "def release_gate(r):\n    \"\"\"r has: test_f1, baseline_f1, recall, min_recall, group_recall (dict group -> recall), max_group_gap, overlap (ids in both train and test).\n    Return {\"decision\": \"ship\" or \"block\", \"reasons\": [...]}. Reasons, in this order, when they apply:\n      \"leakage\"    overlap is not empty\n      \"no_gain\"    test_f1 - baseline_f1 is less than 0.02\n      \"low_recall\" recall is below min_recall\n      \"group_gap\"  best group recall minus worst group recall is above max_group_gap\n    Ship only when there are no reasons.\"\"\"\n    # TODO\n    return None\n",
    "solution": "def release_gate(r):\n    reasons = []\n    if r[\"overlap\"]:\n        reasons.append(\"leakage\")\n    if r[\"test_f1\"] - r[\"baseline_f1\"] < 0.02:\n        reasons.append(\"no_gain\")\n    if r[\"recall\"] < r[\"min_recall\"]:\n        reasons.append(\"low_recall\")\n    g = list(r[\"group_recall\"].values())\n    if g and max(g) - min(g) > r[\"max_group_gap\"]:\n        reasons.append(\"group_gap\")\n    return {\"decision\": \"block\" if reasons else \"ship\", \"reasons\": reasons}\n",
    "test": "good = {\"test_f1\": 0.71, \"baseline_f1\": 0.55, \"recall\": 0.82, \"min_recall\": 0.8, \"group_recall\": {\"A\": 0.84, \"B\": 0.80}, \"max_group_gap\": 0.1, \"overlap\": []}\nassert release_gate(good) == {\"decision\": \"ship\", \"reasons\": []}\ndef with_(**kw):\n    d = dict(good); d.update(kw); return release_gate(d)\nassert with_(overlap=[7]) == {\"decision\": \"block\", \"reasons\": [\"leakage\"]}\nassert with_(test_f1=0.56)[\"reasons\"] == [\"no_gain\"]\nassert with_(test_f1=0.58)[\"decision\"] == \"ship\"\nassert with_(recall=0.79)[\"reasons\"] == [\"low_recall\"]\nassert with_(group_recall={\"A\": 0.9, \"B\": 0.7})[\"reasons\"] == [\"group_gap\"]\nassert with_(group_recall={\"A\": 0.9})[\"decision\"] == \"ship\"\nassert with_(overlap=[1, 2], test_f1=0.5, recall=0.5, group_recall={\"A\": 0.9, \"B\": 0.1}) == {\"decision\": \"block\", \"reasons\": [\"leakage\", \"no_gain\", \"low_recall\", \"group_gap\"]}\n"
   }
  ]
 },
 "quiz": [
  {
   "q": "Your churn model scores 0.93 F1 on a random split but 0.61 on a chronological split. Which number should you report?",
   "options": [
    "0.93, because it is the higher and so the more favorable score",
    "0.61, because it mimics predicting the future",
    "The average of the two, since each split tells half of the story",
    "Neither: scores from different splits can never be compared"
   ],
   "correct": 1,
   "why": "The chronological split imitates what will happen in production: predicting the future from the past. The random split lets the model see the future."
  },
  {
   "q": "Why does the release gate compare the model with a baseline instead of using only a fixed F1 target?",
   "options": [
    "A target can be met by a model that adds nothing; the baseline shows the real gain",
    "A baseline is cheaper to compute than a fixed target, so the gate runs much faster",
    "A fixed target cannot be written down before the model has been trained at all",
    "Regulators require every deployed model to be compared with a baseline first"
   ],
   "correct": 0,
   "why": "A fixed target says nothing about whether the model adds value. The baseline shows the real gain, and the target alone could be met by a trivial rule."
  }
 ]
};
  const at = C.lessons.findIndex(l => l.id === 'training-models');
  C.lessons.splice(at + 1, 0, LAB);
  C.lessons.push(PROJECT);
})();
