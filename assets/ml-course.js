/* Machine Learning course: an original curriculum that follows the topic sequence of
   Géron, "Hands-On Machine Learning with Scikit-Learn and PyTorch" (Part I: ML fundamentals,
   Part II: neural networks & deep learning). All prose, code, data and quizzes are original.
   Labs run real NumPy / scikit-learn / pandas in the browser (Pyodide loads them from imports). */
window.ML_COURSE = {
  id: 'machine-learning',
  title: 'Machine Learning: From Data to Deep Learning',
  short: 'Machine Learning',
  subtitle: 'Build intuition and working code for the whole ML toolbox: regression, classification, trees, ensembles, clustering, neural networks, CNNs, transformers, diffusion and reinforcement learning.',
  tag: 'New · Hands-on',
  category: 'foundations',
  accent: '#16a37f',
  symbol: 'ML',
  level: 'Beginner to intermediate',
  lang: 'python',
  outcome: 'Frame ML problems, build scikit-learn pipelines, evaluate models honestly, and implement the core of neural networks, CNNs, attention, diffusion and Q-learning from scratch in NumPy.',
  reference: 'Follows the topic sequence of Géron, Hands-On Machine Learning with Scikit-Learn and PyTorch (Part I: fundamentals, Part II: deep learning). Lessons, data and labs are original; read the book for full depth. Labs use real scikit-learn in your browser (first run downloads ~30 MB).',
  learn: [
    'Tell supervised, unsupervised, self-supervised and RL problems apart',
    'Build end-to-end scikit-learn pipelines with proper validation',
    'Choose metrics: precision, recall, F1, ROC and thresholds',
    'Train models with gradient descent and regularize them',
    'Use trees, random forests, boosting, PCA and k-means',
    'Implement neurons, backprop and modern optimizers in NumPy',
    'Understand convolutions, sequence models and attention',
    'Grasp diffusion models and Q-learning from first principles'
  ],
  parts: ['ML fundamentals', 'Trees & ensembles', 'Unsupervised learning', 'Neural networks', 'Deep learning architectures', 'Generative & reinforcement learning'],
  lessons: [
  /* ---------- PART 1 ---------- */
  {
    id: 'ml-landscape', part: 0, chapter: 'Part I', title: 'The machine learning landscape', minutes: 14,
    goal: 'Recognize the main types of ML systems and the challenges that make ML hard.',
    sections: [
      { h: 'Learning from data instead of rules', html: '<p>A spam filter written by hand is a pile of rules that grows forever. A machine learning spam filter <b>learns</b> which patterns predict spam from labeled examples, and adapts when spammers change tactics. ML shines when rules are too complex, keep changing, or are unknown, and when we want to discover patterns in data (<i>data mining</i>).</p>' },
      { h: 'Ways to classify ML systems', html: '<ul><li><b>Supervision</b>: <i>supervised</i> (labeled examples), <i>unsupervised</i> (no labels: clustering, anomaly detection), <i>semi-supervised</i>, <i>self-supervised</i> (labels generated from the data itself, as in large language models) and <i>reinforcement learning</i> (rewards from an environment).</li><li><b>Batch vs. online</b>: train once on everything, or learn incrementally as data streams in.</li><li><b>Instance-based vs. model-based</b>: compare new cases to memorized examples (k-nearest neighbors), or fit a model\'s parameters and predict with it (linear regression).</li></ul><p>Sort the scenarios in the interactive below.</p>' },
      { h: 'What goes wrong', html: '<p>Bad data: too little, <b>non-representative</b> (sampling bias), noisy, or with irrelevant features. Bad models: <b>overfitting</b> (memorizing noise, so it fails on new data) or <b>underfitting</b> (too simple to capture the pattern). That is why we hold out a <b>test set</b> and tune hyperparameters on a separate <b>validation set</b>: the test set must stay untouched until the end.</p>' }
    ],
    widget: 'mltypes',
    terms: [['Supervised learning', 'Training data includes the desired outputs (labels).'], ['Overfitting', 'Fitting training data too closely, so the model generalizes poorly.'], ['Hyperparameter', 'A setting of the learning algorithm, not learned from data.']],
    lab: { intro: 'These labs run real NumPy and scikit-learn in your browser. The <b>first run downloads them (~30 MB)</b>, then it\'s fast. <b>Run</b> to experiment, <b>Check</b> to run the hidden tests.', tasks: [
      { prompt: 'Model-based learning: fit a <code>LinearRegression</code> on GDP vs. life satisfaction and return the prediction for a new country (as a float).',
        starter: `import numpy as np
from sklearn.linear_model import LinearRegression

# Toy data: GDP per capita (k$) -> life satisfaction (0-10)
gdp = np.array([[25.0], [32.0], [38.0], [45.0], [52.0], [60.0]])
sat = np.array([5.6, 5.9, 6.3, 6.7, 7.0, 7.4])

def train_and_predict(X, y, new_x):
    """Fit a linear model on X, y and return its prediction for new_x as a float."""
    # TODO: create LinearRegression(), fit it, predict [[new_x]]
    return 0.0

print("Prediction for 40 k$:", round(train_and_predict(gdp, sat, 40.0), 2))`,
        solution: `def train_and_predict(X, y, new_x):
    model = LinearRegression()
    model.fit(X, y)
    return float(model.predict([[new_x]])[0])`,
        test: `import numpy as np
expected = np.polyval(np.polyfit(gdp.ravel(), sat, 1), 40.0)
assert abs(train_and_predict(gdp, sat, 40.0) - expected) < 1e-6
assert isinstance(train_and_predict(gdp, sat, 70.0), float)` }
    ] },
    quiz: [
      { q: 'A model learns to predict the next word using raw text, with labels generated from the text itself. This is…', options: ['Supervised learning with labels written by human annotators', 'Self-supervised learning', 'Reinforcement learning driven by a reward signal', 'Clustering that groups similar documents together'], correct: 1, why: 'The training signal is derived from the data itself.' },
      { q: 'Your model scores 99% on training data and 70% on new data. Most likely…', options: ['Underfitting, because the model is too simple to learn the data', 'Perfect generalization, because training accuracy is so high', 'Only a bad test set, because the model itself must be fine', 'Overfitting'], correct: 3, why: 'A big train/test gap is the signature of overfitting.' }
    ]
  },
  {
    id: 'end-to-end', part: 0, chapter: 'Part I', title: 'An end-to-end ML project', minutes: 16,
    goal: 'Walk the full workflow and build a preprocessing + model pipeline.',
    sections: [
      { h: 'The checklist', html: '<ol><li><b>Frame the problem</b>: what is the business objective? Regression or classification? How will success be measured (e.g. RMSE)?</li><li><b>Get the data</b> and immediately set aside a <b>test set</b>, stratified if important groups exist.</li><li><b>Explore</b>: distributions, correlations, surprising values.</li><li><b>Prepare</b>: clean, impute, encode, scale, engineer features.</li><li><b>Select and train</b> candidate models; compare them with <b>cross-validation</b>.</li><li><b>Fine-tune</b> with grid or randomized search, then evaluate <i>once</i> on the test set.</li><li><b>Launch, monitor and maintain</b>: data drifts, models rot.</li></ol>' },
      { h: 'Pipelines keep you honest', html: '<p>Every transformation (fill missing values, one-hot encode categories, standardize numbers) must be <b>fit on training data only</b> and applied identically to new data. scikit-learn\'s <code>Pipeline</code> and <code>ColumnTransformer</code> package those steps with the model, so cross-validation and deployment can\'t leak information. Step through the transformations in the interactive.</p>' },
      { h: 'Cross-validation', html: '<p>k-fold cross-validation trains k models, each validated on a different fold, and reports the mean and spread of the scores. It is slower than a single split but far more reliable for choosing between models and hyperparameters.</p>' }
    ],
    widget: 'pipeline',
    terms: [['Data leakage', 'Information from validation/test data influencing training.'], ['Imputation', 'Filling in missing values.'], ['One-hot encoding', 'Turning a category into binary indicator columns.']],
    lab: { tasks: [
      { prompt: 'Complete <code>build_model()</code>: numeric columns → median <code>SimpleImputer</code> + <code>StandardScaler</code>; the <code>ocean</code> column → <code>OneHotEncoder(handle_unknown="ignore")</code>; then <code>LinearRegression</code>. It must handle missing values and unseen categories.',
        starter: `import numpy as np
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression

df = pd.DataFrame({
    "rooms":  [4, 6, np.nan, 5, 3, 7, 5, 4],
    "income": [3.2, 8.1, 5.0, np.nan, 2.1, 9.4, 6.0, 4.4],
    "ocean":  ["INLAND", "NEAR BAY", "INLAND", "NEAR OCEAN", "INLAND", "NEAR BAY", "NEAR OCEAN", "INLAND"],
})
y = np.array([150, 420, 230, 330, 110, 480, 360, 190])   # median house value (k$)

def build_model():
    # TODO: numeric = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
    # TODO: pre = ColumnTransformer([("num", numeric, ["rooms", "income"]),
    #                               ("cat", OneHotEncoder(handle_unknown="ignore"), ["ocean"])])
    return make_pipeline(LinearRegression())

model = build_model().fit(df, y)
new = pd.DataFrame({"rooms": [np.nan], "income": [7.0], "ocean": ["ISLAND"]})
print("Prediction:", model.predict(new).round(1))
print("Train R²:", round(model.score(df, y), 3))`,
        solution: `def build_model():
    numeric = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
    pre = ColumnTransformer([("num", numeric, ["rooms", "income"]),
                             ("cat", OneHotEncoder(handle_unknown="ignore"), ["ocean"])])
    return make_pipeline(pre, LinearRegression())`,
        test: `import numpy as np, pandas as pd
m = build_model().fit(df, y)
p = m.predict(pd.DataFrame({"rooms": [np.nan], "income": [7.0], "ocean": ["ISLAND"]}))
assert np.isfinite(p).all(), "pipeline must impute NaNs and ignore unseen categories"
assert m.score(df, y) > 0.9
assert len(m.steps) == 2, "expected exactly two steps: preprocessing, then the model"` }
    ] },
    quiz: [
      { q: 'When should you fit the StandardScaler?', options: ['On the full dataset before splitting, so every row shares one scale', 'On the test set, so that it matches the data you will see', 'On the training data only, inside the pipeline', 'Never, because tree models do not need any scaling at all'], correct: 2, why: 'Fitting on test data leaks information; pipelines fit transforms on training folds only.' },
      { q: 'Why evaluate on the test set only once, at the end?', options: ['Repeated use turns it into a validation set and makes estimates optimistic', 'Scoring the test set is slow, so doing it more than once wastes a whole day of compute', 'scikit-learn raises an error the second time you score the same test set', 'Every evaluation changes the model\'s weights, so a second run measures a different model'], correct: 0, why: 'Tuning against the test set overfits it.' }
    ]
  },
  {
    id: 'classification', part: 0, chapter: 'Part I', title: 'Classification & evaluation metrics', minutes: 16,
    goal: 'Evaluate classifiers with confusion matrices, precision, recall and thresholds.',
    sections: [
      { h: 'Accuracy can lie', html: '<p>If 95% of images are <i>not</i> a "5", a model that always says "not 5" is 95% accurate and useless. For skewed classes, look at the <b>confusion matrix</b>: true positives (TP), false positives (FP), false negatives (FN) and true negatives (TN).</p>' },
      { h: 'Precision, recall, F1', html: '<ul><li><b>Precision</b> = TP / (TP + FP): when it says "positive", how often is it right?</li><li><b>Recall</b> = TP / (TP + FN): of all real positives, how many did it find?</li><li><b>F1</b> = the harmonic mean of the two, which is high only if both are.</li></ul><p>Most classifiers output a <b>score</b>. Moving the decision <b>threshold</b> trades precision for recall. A child-safe video filter wants high precision; a cancer screen wants high recall. Drag the threshold below.</p>' },
      { h: 'ROC and multiclass', html: '<p>The <b>ROC curve</b> plots true-positive rate against false-positive rate across thresholds; the area under it (AUC) summarizes ranking quality. Prefer the precision/recall curve when positives are rare. Multiclass problems use native multiclass models or one-vs-rest / one-vs-one strategies; multilabel models output several labels per instance.</p>' }
    ],
    widget: 'threshold',
    terms: [['Precision', 'Fraction of positive predictions that are correct.'], ['Recall', 'Fraction of actual positives that are found.'], ['Decision threshold', 'Score above which an instance is labeled positive.']],
    lab: { tasks: [
      { prompt: 'Implement <code>confusion(y_true, y_pred)</code> → <code>(tp, fp, fn, tn)</code> and <code>precision_recall_f1</code>. Tests compare you against <code>sklearn.metrics</code>.',
        starter: `y_true = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0]

def confusion(y_true, y_pred):
    tp = fp = fn = tn = 0
    # TODO: count each case
    return tp, fp, fn, tn

def precision_recall_f1(y_true, y_pred):
    tp, fp, fn, tn = confusion(y_true, y_pred)
    # TODO: precision, recall, f1 (return 0.0 when a denominator is 0)
    return 0.0, 0.0, 0.0

print("TP FP FN TN:", confusion(y_true, y_pred))
print("P R F1:", [round(v, 3) for v in precision_recall_f1(y_true, y_pred)])`,
        solution: `def confusion(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    return tp, fp, fn, tn

def precision_recall_f1(y_true, y_pred):
    tp, fp, fn, tn = confusion(y_true, y_pred)
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    f = 2 * p * r / (p + r) if p + r else 0.0
    return p, r, f`,
        test: `from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
assert confusion(y_true, y_pred) == (tp, fp, fn, tn)
p, r, f = precision_recall_f1(y_true, y_pred)
assert abs(p - precision_score(y_true, y_pred)) < 1e-9 and abs(r - recall_score(y_true, y_pred)) < 1e-9
assert abs(f - f1_score(y_true, y_pred)) < 1e-9
assert precision_recall_f1([1, 1], [0, 0]) == (0.0, 0.0, 0.0)` }
    ] },
    quiz: [
      { q: 'Raising the decision threshold usually…', options: ['Raises recall and lowers precision, because more cases are flagged', 'Raises both precision and recall, because decisions become more careful', 'Raises precision, lowers recall', 'Changes nothing, because the scores themselves stay the same'], correct: 2, why: 'Fewer, more confident positives means more precise but fewer found.' },
      { q: 'A cancer-screening model should prioritize…', options: ['Recall, so that few real cases are missed', 'Precision, so that every flagged patient truly has the disease', 'Accuracy, because it is the metric that counts every case', 'Training speed, so that screening results arrive sooner'], correct: 0, why: 'Missing a real case (false negative) is far costlier.' }
    ]
  },
  {
    id: 'training-models', part: 0, chapter: 'Part I', title: 'Training models: gradient descent & regularization', minutes: 18,
    goal: 'Understand how models are fit, and how to keep them from overfitting.',
    sections: [
      { h: 'Two ways to fit a line', html: '<p>Linear regression has a <b>closed-form</b> solution, the Normal Equation θ = (XᵀX)⁻¹Xᵀy (in practice computed with the pseudoinverse/SVD). It is exact but slow with many features. <b>Gradient descent</b> instead starts with random parameters and repeatedly steps downhill on the cost function. It scales to huge datasets and to models with no closed form, such as neural networks.</p>' },
      { h: 'Learning rate and variants', html: '<p>The <b>learning rate</b> η sets the step size: too small is painfully slow, too large overshoots and diverges. <b>Batch</b> GD uses all data per step, <b>stochastic</b> GD one instance (noisy but fast, and it can escape local minima), and <b>mini-batch</b> GD a small batch, the standard in deep learning. Scale your features first, or the cost bowl becomes a long valley. Play with η below.</p>' },
      { h: 'Bias, variance and regularization', html: '<p>Polynomial features let linear models fit curves, and also overfit. <b>Learning curves</b> (error vs. training-set size) diagnose under- and overfitting. <b>Regularization</b> constrains the weights: <b>Ridge</b> (ℓ2) shrinks them, <b>Lasso</b> (ℓ1) zeroes some out (feature selection), <b>Elastic Net</b> mixes both, and <b>early stopping</b> halts training when validation error starts rising. <b>Logistic</b> and <b>softmax</b> regression extend the same machinery to classification.</p>' }
    ],
    widget: 'gd',
    terms: [['Learning rate', 'Step size of each gradient descent update.'], ['Regularization', 'Constraining a model to reduce overfitting.'], ['Early stopping', 'Stopping training when validation error starts increasing.']],
    lab: { tasks: [
      { prompt: 'Implement batch gradient descent for linear regression: <code>gradients = 2/m · Xbᵀ(Xb·θ − y)</code>, <code>θ ← θ − η·gradients</code>. Your θ must match the least-squares solution, and a too-large η must diverge.',
        starter: `import numpy as np
rng = np.random.default_rng(42)
m = 100
X = 2 * rng.random((m, 1))
y = 4 + 3 * X[:, 0] + rng.normal(0, 0.5, m)
Xb = np.c_[np.ones(m), X]            # add bias column x0 = 1

def batch_gd(Xb, y, eta=0.1, n_epochs=1000):
    theta = np.zeros(Xb.shape[1])
    for _ in range(n_epochs):
        pass   # TODO: compute gradients and update theta
    return theta

print("GD theta:     ", batch_gd(Xb, y).round(3))
print("lstsq theta:  ", np.linalg.lstsq(Xb, y, rcond=None)[0].round(3))`,
        solution: `def batch_gd(Xb, y, eta=0.1, n_epochs=1000):
    theta = np.zeros(Xb.shape[1])
    m = len(y)
    for _ in range(n_epochs):
        gradients = 2 / m * Xb.T @ (Xb @ theta - y)
        theta = theta - eta * gradients
    return theta`,
        test: `import numpy as np, warnings
warnings.filterwarnings("ignore")
best = np.linalg.lstsq(Xb, y, rcond=None)[0]
assert np.allclose(batch_gd(Xb, y), best, atol=1e-3), "should converge to the least-squares solution"
bad = batch_gd(Xb, y, eta=1.2, n_epochs=200)
assert (not np.isfinite(bad).all()) or np.abs(bad).max() > 1e6, "eta=1.2 should diverge"` }
    ] },
    quiz: [
      { q: 'Your training loss explodes to NaN after a few steps. First thing to try?', options: ['Train for more epochs until the loss settles on its own', 'Lower the learning rate', 'Remove the test set so that it cannot influence the loss', 'Add more features so that the model has more to learn from'], correct: 1, why: 'Divergence is the classic sign of a learning rate that is too high.' },
      { q: 'Which regularizer tends to set some weights exactly to zero?', options: ['Ridge (ℓ2) regularization', 'Early stopping on validation loss', 'Dropout on the hidden layers', 'Lasso (ℓ1) regularization'], correct: 3, why: 'The ℓ1 penalty produces sparse solutions.' }
    ]
  },
  /* ---------- PART 2 ---------- */
  {
    id: 'decision-trees', part: 1, chapter: 'Part I', title: 'Decision trees', minutes: 14,
    goal: 'See how trees choose splits by impurity, and why they need regularizing.',
    sections: [
      { h: 'Twenty questions, learned', html: '<p>A decision tree asks a sequence of yes/no questions about features ("petal length ≤ 2.45?") until it reaches a leaf that predicts a class or value. Trees need no feature scaling, handle mixed data, and are <b>white-box</b> models: you can read every decision.</p>' },
      { h: 'Choosing splits: CART', html: '<p>scikit-learn\'s CART algorithm greedily tries every feature and threshold and keeps the split that minimizes the weighted <b>impurity</b> of the two children. <b>Gini impurity</b> = 1 − Σ pₖ²: zero for a pure node, highest when classes are mixed. (Entropy is an alternative.) Regression trees minimize MSE instead. Drag the split below and watch the impurity.</p>' },
      { h: 'Regularize and beware instability', html: '<p>Unconstrained trees grow until every leaf is pure, which means they overfit. Limit <code>max_depth</code>, <code>min_samples_leaf</code> or <code>max_leaf_nodes</code>. Trees are also <b>unstable</b>: small changes in data, or a rotation, can produce a very different tree. Ensembles fix that.</p>' }
    ],
    widget: 'tree',
    terms: [['Gini impurity', '1 − Σ pₖ², the probability of misclassifying a random sample.'], ['CART', 'Greedy algorithm building binary trees by best split.'], ['max_depth', 'Maximum number of levels in the tree.']],
    lab: { tasks: [
      { prompt: 'Implement <code>gini(labels)</code> and <code>best_split(x, y)</code>, which tries midpoints between sorted unique values and returns the threshold with the lowest weighted Gini. It must match scikit-learn\'s depth-1 tree.',
        starter: `import numpy as np

x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
y = np.array([0, 0, 0, 1, 0, 1, 1, 1, 1, 1])

def gini(labels):
    return 0.0   # TODO: 1 - sum of squared class proportions

def best_split(x, y):
    best_t, best_score = None, float("inf")
    values = np.unique(x)
    for t in (values[:-1] + values[1:]) / 2:
        pass   # TODO: weighted gini of y[x <= t] and y[x > t]; keep the lowest
    return best_t

print("gini([0,0,1,1]) =", gini(np.array([0, 0, 1, 1])))
print("best threshold  =", best_split(x, y))`,
        solution: `def gini(labels):
    if len(labels) == 0:
        return 0.0
    _, counts = np.unique(labels, return_counts=True)
    p = counts / counts.sum()
    return float(1 - np.sum(p ** 2))

def best_split(x, y):
    best_t, best_score = None, float("inf")
    values = np.unique(x)
    for t in (values[:-1] + values[1:]) / 2:
        left, right = y[x <= t], y[x > t]
        score = (len(left) * gini(left) + len(right) * gini(right)) / len(y)
        if score < best_score:
            best_t, best_score = t, score
    return best_t`,
        test: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
assert abs(gini(np.array([0, 0, 1, 1])) - 0.5) < 1e-9 and gini(np.array([1, 1, 1])) == 0
sk = DecisionTreeClassifier(max_depth=1).fit(x.reshape(-1, 1), y).tree_.threshold[0]
assert abs(best_split(x, y) - sk) < 1e-9, (best_split(x, y), sk)` }
    ] },
    quiz: [
      { q: 'A node contains 50% class A and 50% class B. Its Gini impurity is…', options: ['0, because the node is perfectly pure', '0.25, because each class contributes a quarter', '1, because the node is completely mixed', '0.5, because 1 − (0.5² + 0.5²) = 0.5'], correct: 3, why: '1 − (0.5² + 0.5²) = 0.5.' },
      { q: 'Your tree has 100% training accuracy and poor test accuracy. You should…', options: ['Increase max_depth so that the tree can fit the remaining errors', 'Scale the features so that the splits become more stable', 'Decrease max_depth or raise min_samples_leaf', 'Remove the test set so the accuracy gap disappears'], correct: 2, why: 'Constraining the tree reduces overfitting.' }
    ]
  },
  {
    id: 'ensembles', part: 1, chapter: 'Part I', title: 'Ensembles & random forests', minutes: 15,
    goal: 'Combine many weak models into a strong one with voting, bagging and boosting.',
    sections: [
      { h: 'The wisdom of the crowd', html: '<p>If many <b>independent</b> classifiers are each only slightly better than chance, their majority vote can be very accurate. That is the law of large numbers at work. The catch is independence: models trained on the same data make correlated errors, so ensembles work best with <b>diverse</b> models. See the effect in the simulator.</p>' },
      { h: 'Bagging and random forests', html: '<p><b>Bagging</b> trains each predictor on a random bootstrap sample (with replacement); <b>pasting</b> samples without replacement. Out-of-bag instances give a free validation score. A <b>random forest</b> is bagged decision trees that also consider a random subset of features at each split, which adds diversity. Forests are strong defaults and give useful <b>feature importances</b>.</p>' },
      { h: 'Boosting and stacking', html: '<p><b>Boosting</b> trains predictors sequentially, each fixing its predecessor: <b>AdaBoost</b> re-weights misclassified instances, while <b>gradient boosting</b> fits each new tree to the residual errors (HistGradientBoosting, XGBoost and LightGBM dominate tabular data). <b>Stacking</b> trains a blender model on the predictions of other models.</p>' }
    ],
    widget: 'ensemble',
    terms: [['Bagging', 'Training predictors on bootstrap samples and aggregating.'], ['Random forest', 'Bagged trees with random feature subsets at each split.'], ['Gradient boosting', 'Sequentially fitting predictors to residual errors.']],
    lab: { tasks: [
      { prompt: 'On the noisy moons dataset, return <code>(tree_accuracy, forest_accuracy)</code> on the test set using <code>DecisionTreeClassifier(random_state=42)</code> and <code>RandomForestClassifier(n_estimators=200, random_state=42)</code>. The forest should win.',
        starter: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

X, y = make_moons(n_samples=500, noise=0.30, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

def compare():
    # TODO: fit both models on the training set, return their test accuracies (model.score)
    return 0.0, 0.0

tree_acc, forest_acc = compare()
print(f"single tree: {tree_acc:.3f}   random forest: {forest_acc:.3f}")`,
        solution: `def compare():
    tree = DecisionTreeClassifier(random_state=42).fit(X_train, y_train)
    forest = RandomForestClassifier(n_estimators=200, random_state=42).fit(X_train, y_train)
    return tree.score(X_test, y_test), forest.score(X_test, y_test)`,
        test: `t, f = compare()
assert 0.7 < t < 1 and 0.8 < f <= 1, (t, f)
assert f > t, "the forest should beat a single unregularized tree"` }
    ] },
    quiz: [
      { q: 'Why do random forests sample a random subset of features at each split?', options: ['To make trees more diverse and less correlated', 'To train faster, since fewer features means less work per split', 'To make every tree identical so that their votes agree more often', 'To make the trees deeper so that each one is more accurate'], correct: 0, why: 'Diversity reduces correlated errors, lowering ensemble variance.' },
      { q: 'Gradient boosting fits each new predictor to…', options: ['A bootstrap sample of the training rows, as in bagging', 'The residual errors of the ensemble so far', 'A random subset of the features, chosen again at every split', 'The original labels, trained independently of the earlier predictors'], correct: 1, why: 'Each tree corrects the remaining errors.' }
    ]
  },
  /* ---------- PART 3 ---------- */
  {
    id: 'dimensionality-reduction', part: 2, chapter: 'Part I', title: 'Dimensionality reduction & PCA', minutes: 14,
    goal: 'Project data onto fewer dimensions while keeping most of its variance.',
    sections: [
      { h: 'The curse of dimensionality', html: '<p>In high dimensions, points are far apart and data is sparse, so models need exponentially more data and overfit easily. Fortunately, real data usually lies near a much <b>lower-dimensional</b> subspace or manifold. Reducing dimensions speeds up training, removes noise and makes visualization possible.</p>' },
      { h: 'Principal Component Analysis', html: '<p>PCA finds the axis that preserves the most <b>variance</b> (the first principal component), then the next orthogonal axis, and so on. It does this via the <b>singular value decomposition</b> of the centered data. Projecting onto the first d components keeps the most information for that dimensionality. Rotate the projection axis below and watch the captured variance.</p>' },
      { h: 'Choosing d, and other methods', html: '<p>Choose the number of components that preserves e.g. 95% of the variance (the <b>explained variance ratio</b>), or 2–3 for plots. <b>Randomized</b> and <b>incremental</b> PCA scale to big data; <b>random projection</b> is surprisingly effective; <b>LLE</b>, Isomap and t-SNE unroll curved manifolds for visualization.</p>' }
    ],
    widget: 'pca',
    terms: [['Principal component', 'Axis of maximal remaining variance, orthogonal to previous ones.'], ['Explained variance ratio', 'Fraction of total variance along each component.'], ['Manifold', 'A lower-dimensional shape embedded in high-dimensional space.']],
    lab: { tasks: [
      { prompt: 'Using NumPy\'s SVD, implement <code>explained_variance_ratio(X)</code> (center X; ratios are s²/Σs²) and <code>n_components_for(X, threshold)</code>. Tests compare you with <code>sklearn.decomposition.PCA</code>.',
        starter: `import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(200, 3)) @ np.array([[3.0, 1.0, 0.2],
                                         [0.0, 1.0, 0.3],
                                         [0.0, 0.0, 0.1]])

def explained_variance_ratio(X):
    # TODO: Xc = X - X.mean(axis=0); _, s, _ = np.linalg.svd(Xc, full_matrices=False)
    return np.array([1.0, 0.0, 0.0])

def n_components_for(X, threshold=0.95):
    # TODO: smallest d whose cumulative ratio >= threshold
    return 3

print("ratios:", explained_variance_ratio(X).round(4))
print("components for 95%:", n_components_for(X))`,
        solution: `def explained_variance_ratio(X):
    Xc = X - X.mean(axis=0)
    _, s, _ = np.linalg.svd(Xc, full_matrices=False)
    return s ** 2 / np.sum(s ** 2)

def n_components_for(X, threshold=0.95):
    return int(np.argmax(np.cumsum(explained_variance_ratio(X)) >= threshold) + 1)`,
        test: `import numpy as np
from sklearn.decomposition import PCA
assert np.allclose(explained_variance_ratio(X), PCA().fit(X).explained_variance_ratio_)
assert n_components_for(X, 0.95) == PCA(n_components=0.95).fit(X).n_components_
assert n_components_for(X, 0.5) == 1` }
    ] },
    quiz: [
      { q: 'The first principal component is the axis that…', options: ['Preserves the maximum variance', 'Has the smallest variance in the data', 'Is always aligned with the first feature column', 'Separates the classes better than any other direction'], correct: 0, why: 'PCA ranks axes by the variance they preserve; it is unsupervised.' },
      { q: 'Why scale features before PCA?', options: ['PCA only works on integer-valued columns, so values must be rescaled', 'To add dimensions so that the projection has more directions', 'Otherwise large-scale features dominate the variance', 'It is not needed, because PCA is invariant to the units of each feature'], correct: 2, why: 'Variance depends on units; unscaled features skew the components.' }
    ]
  },
  {
    id: 'unsupervised', part: 2, chapter: 'Part I', title: 'Unsupervised learning: clustering & beyond', minutes: 15,
    goal: 'Run k-means step by step and know when to reach for other methods.',
    sections: [
      { h: 'Most data has no labels', html: '<p>Unsupervised learning finds structure without labels: <b>clustering</b> (customer segments, image regions), <b>anomaly detection</b> (fraud, defects), <b>density estimation</b>, and semi-supervised <b>label propagation</b>, where you label a few representative instances and spread the labels to their clusters.</p>' },
      { h: 'k-means', html: '<p>Lloyd\'s algorithm: place k centroids, then repeat ① <b>assign</b> each point to its nearest centroid and ② <b>update</b> each centroid to the mean of its points, until nothing changes. It is fast and simple, but it depends on initialization (use <b>k-means++</b> and several runs), assumes roughly spherical clusters of similar size, and needs k. Choose k with the <b>inertia elbow</b> or the <b>silhouette score</b>. Step through it below.</p>' },
      { h: 'Other tools', html: '<p><b>DBSCAN</b> finds arbitrarily shaped clusters as dense regions and labels sparse points as noise. <b>Gaussian mixture models</b> fit soft, elliptical clusters and give densities, which are great for anomaly detection (low density = anomaly). Agglomerative clustering builds a hierarchy.</p>' }
    ],
    widget: 'kmeans',
    terms: [['Centroid', 'The center (mean) of a cluster.'], ['Inertia', 'Sum of squared distances of points to their centroid.'], ['Silhouette score', 'How well each point fits its cluster vs. the next nearest.']],
    lab: { tasks: [
      { prompt: 'Implement <code>assign(X, centroids)</code> (index of the nearest centroid per point) and <code>update(X, labels, k)</code> (mean of each cluster). <code>kmeans</code> then converges to the same centers as scikit-learn.',
        starter: `import numpy as np
from sklearn.datasets import make_blobs

X, y_true = make_blobs(n_samples=300, centers=[[0, 0], [5, 5], [0, 5]], cluster_std=0.6, random_state=0)

def assign(X, centroids):
    return np.zeros(len(X), dtype=int)     # TODO: argmin of distances to each centroid

def update(X, labels, k):
    return np.zeros((k, X.shape[1]))       # TODO: mean of the points in each cluster

def kmeans(X, init, n_iter=20):
    c = np.array(init, dtype=float)
    for _ in range(n_iter):
        c = update(X, assign(X, c), len(c))
    return c

init = np.array([X[y_true == i][0] for i in range(3)])
print(kmeans(X, init).round(2))`,
        solution: `def assign(X, centroids):
    d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
    return d.argmin(axis=1)

def update(X, labels, k):
    return np.array([X[labels == j].mean(axis=0) for j in range(k)])`,
        test: `import numpy as np
from sklearn.cluster import KMeans
assert (assign(np.array([[0., 0.], [9., 9.]]), np.array([[1., 1.], [8., 8.]])) == [0, 1]).all()
ours = np.array(sorted(map(tuple, kmeans(X, init).round(3))))
sk = np.array(sorted(map(tuple, KMeans(n_clusters=3, n_init=10, random_state=0).fit(X).cluster_centers_.round(3))))
assert np.allclose(ours, sk, atol=1e-2), (ours, sk)` }
    ] },
    quiz: [
      { q: 'k-means struggles most with…', options: ['Spherical clusters of roughly equal size and spread', 'Two-dimensional data that can be plotted on a page', 'Features that have already been standardized beforehand', 'Elongated or very differently sized clusters'], correct: 3, why: 'It assumes roughly spherical clusters of similar spread.' },
      { q: 'Which method naturally labels outliers as noise?', options: ['k-means clustering', 'DBSCAN', 'PCA projection', 'Linear regression'], correct: 1, why: 'Points not in any dense region are noise in DBSCAN.' }
    ]
  },
  /* ---------- PART 4 ---------- */
  {
    id: 'neural-networks', part: 3, chapter: 'Part II', title: 'Introduction to artificial neural networks', minutes: 16,
    goal: 'Go from a single neuron to multilayer perceptrons and backpropagation.',
    sections: [
      { h: 'From neurons to perceptrons', html: '<p>An artificial neuron computes a weighted sum of its inputs plus a bias, then applies an <b>activation function</b>. The <b>perceptron</b> (a step activation) draws a straight line, a linear decision boundary, and learns with a simple rule: nudge the weights toward each misclassified example. It famously can\'t learn XOR. Tune a neuron by hand in the interactive.</p>' },
      { h: 'Multilayer perceptrons and backprop', html: '<p>Stack layers of neurons with nonlinear activations and the network can approximate almost any function. <b>Backpropagation</b> makes training feasible: a forward pass computes predictions, then the chain rule computes the gradient of the loss with respect to every weight in one backward pass, and gradient descent updates them all.</p>' },
      { h: 'Activations and outputs', html: '<p>Hidden layers use <b>ReLU</b> (or GELU/SiLU) because it is cheap and doesn\'t saturate for positive inputs; sigmoid and tanh saturate and can slow training. The output layer matches the task: none (linear) for regression, <b>sigmoid</b> for binary/multilabel, <b>softmax</b> for multiclass, each paired with the right loss (MSE, binary cross-entropy, cross-entropy).</p>' }
    ],
    widget: 'neuron',
    terms: [['Activation function', 'Nonlinearity applied to a neuron\'s weighted sum.'], ['Backpropagation', 'Efficient computation of gradients through the chain rule.'], ['MLP', 'Multilayer perceptron: stacked fully connected layers.']],
    lab: { tasks: [
      { prompt: 'Complete the perceptron learning rule: <code>w += lr·(y − ŷ)·x</code>, <code>b += lr·(y − ŷ)</code>. It should learn AND and OR, but never XOR.',
        starter: `import numpy as np
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
AND, OR, XOR = np.array([0, 0, 0, 1]), np.array([0, 1, 1, 1]), np.array([0, 1, 1, 0])

def predict(X, w, b):
    return (X @ w + b > 0).astype(int)

def train_perceptron(X, y, epochs=20, lr=1.0):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = int(xi @ w + b > 0)
            # TODO: update w and b using the perceptron rule
    return w, b

for name, y in [("AND", AND), ("OR", OR), ("XOR", XOR)]:
    w, b = train_perceptron(X, y)
    print(name, "learned:", predict(X, w, b), "target:", y)`,
        solution: `def train_perceptron(X, y, epochs=20, lr=1.0):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = int(xi @ w + b > 0)
            w = w + lr * (yi - pred) * xi
            b = b + lr * (yi - pred)
    return w, b`,
        test: `import numpy as np
for y in (AND, OR):
    w, b = train_perceptron(X, y)
    assert (predict(X, w, b) == y).all()
w, b = train_perceptron(X, XOR, epochs=100)
assert not (predict(X, w, b) == XOR).all(), "a single perceptron cannot represent XOR"` }
    ] },
    quiz: [
      { q: 'Why can\'t a single perceptron learn XOR?', options: ['It was given too few training epochs to converge', 'XOR needs a softmax output instead of a step function', 'XOR is not linearly separable', 'Its weights are required to be negative for that task'], correct: 2, why: 'A single neuron draws one straight line; XOR needs two.' },
      { q: 'For 10-class classification, the output layer should use…', options: ['10 neurons with softmax', 'A single ReLU neuron, so that the output is non-negative', 'One linear neuron whose value is rounded to a class number', 'One sigmoid neuron, with the class chosen by its threshold'], correct: 0, why: 'Softmax gives a probability distribution over the classes.' }
    ]
  },
  {
    id: 'pytorch-training', part: 3, chapter: 'Part II', title: 'Building & training networks (the PyTorch way)', minutes: 16,
    goal: 'Understand tensors, autograd and the canonical training loop, then build it from scratch.',
    sections: [
      { h: 'Tensors and autograd', html: '<p>PyTorch\'s core object is the <b>tensor</b>, an n-dimensional array that can live on a GPU. Set <code>requires_grad=True</code> and PyTorch records every operation in a <b>computation graph</b>; calling <code>loss.backward()</code> walks that graph backwards and fills each parameter\'s <code>.grad</code>. That is automatic differentiation. Explore a tiny graph below: change the inputs and watch the gradients.</p>' },
      { h: 'Modules, data and the loop', html: '<p>Models subclass <code>nn.Module</code> (or use <code>nn.Sequential</code>); a <code>DataLoader</code> serves shuffled mini-batches. Every training loop has the same five beats:</p><pre class="snip">for X_batch, y_batch in loader:\n    y_pred = model(X_batch)          # 1. forward\n    loss = loss_fn(y_pred, y_batch)  # 2. loss\n    optimizer.zero_grad()            # 3. reset grads\n    loss.backward()                  # 4. backprop\n    optimizer.step()                 # 5. update</pre>' },
      { h: 'Evaluate, save, deploy', html: '<p>Switch to <code>model.eval()</code> and <code>torch.no_grad()</code> for evaluation, track validation metrics every epoch, save <code>state_dict</code> checkpoints, and use the GPU with <code>.to(device)</code>. The lab writes the same loop in NumPy, where you can see every gradient.</p>' }
    ],
    widget: 'autograd',
    terms: [['Tensor', 'An n-dimensional array with optional gradient tracking.'], ['Autograd', 'Automatic differentiation over a recorded computation graph.'], ['Epoch', 'One full pass over the training data.']],
    lab: { tasks: [
      { prompt: 'Write the training loop: forward → loss → backward → update every parameter with <code>params[k] -= lr * grads[k]</code>, appending each epoch\'s loss. The 2-layer network must solve XOR.',
        starter: `import numpy as np
rng = np.random.default_rng(0)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)
params = {"W1": rng.normal(0, 1, (2, 8)), "b1": np.zeros(8), "W2": rng.normal(0, 1, (8, 1)), "b2": np.zeros(1)}

def forward(p, X):
    h = np.tanh(X @ p["W1"] + p["b1"])
    out = 1 / (1 + np.exp(-(h @ p["W2"] + p["b2"])))
    return out, (X, h, out)

def bce(out, y):
    return float(-np.mean(y * np.log(out + 1e-9) + (1 - y) * np.log(1 - out + 1e-9)))

def backward(p, cache, y):
    X, h, out = cache
    d_logits = (out - y) / len(y)
    dh = d_logits @ p["W2"].T * (1 - h ** 2)
    return {"W2": h.T @ d_logits, "b2": d_logits.sum(0), "W1": X.T @ dh, "b1": dh.sum(0)}

def train(params, epochs=3000, lr=0.5):
    losses = []
    for _ in range(epochs):
        pass   # TODO: forward, loss (append to losses), backward, update every params[k]
    return losses

losses = train(params)
print("first/last loss:", losses[:1], losses[-1:])
print("predictions:", forward(params, X)[0].round(2).ravel())`,
        solution: `def train(params, epochs=3000, lr=0.5):
    losses = []
    for _ in range(epochs):
        out, cache = forward(params, X)
        losses.append(bce(out, y))
        grads = backward(params, cache, y)
        for k in params:
            params[k] -= lr * grads[k]
    return losses`,
        test: `import numpy as np
assert len(losses) == 3000, "append one loss per epoch"
assert losses[-1] < losses[0] * 0.1, (losses[0], losses[-1])
assert ((forward(params, X)[0] > 0.5).astype(int) == y).all(), "the network should solve XOR"` }
    ] },
    quiz: [
      { q: 'What does loss.backward() do?', options: ['Updates every weight in the model using the current learning rate', 'Computes gradients of the loss w.r.t. parameters', 'Clears every stored gradient so that the next step starts fresh', 'Fetches the next mini-batch from the data loader before stepping'], correct: 1, why: 'backward() fills .grad; optimizer.step() does the update.' },
      { q: 'Why call optimizer.zero_grad() every iteration?', options: ['To free memory, since gradients are large tensors that pile up', 'To shuffle the data so the batches differ in every epoch', 'It makes the GPU kernels run faster on each iteration', 'PyTorch accumulates gradients by default'], correct: 3, why: 'Without zeroing, gradients from previous batches would add up.' }
    ]
  },
  {
    id: 'training-deep-nets', part: 3, chapter: 'Part II', title: 'Training deep networks: optimizers & regularization', minutes: 16,
    goal: 'Tame vanishing gradients, pick an optimizer and regularize deep nets.',
    sections: [
      { h: 'Unstable gradients', html: '<p>In deep networks, gradients can <b>vanish</b> (early layers stop learning) or <b>explode</b>. Fixes: good <b>initialization</b> (Glorot/He), non-saturating activations (ReLU family), <b>batch normalization</b> or layer normalization, <b>residual connections</b>, and <b>gradient clipping</b>.</p>' },
      { h: 'Faster optimizers', html: '<p>Plain SGD zig-zags across narrow valleys. <b>Momentum</b> accumulates a velocity so steps build speed along consistent directions. <b>RMSProp</b> scales each parameter\'s step by its recent gradient magnitude. <b>Adam/AdamW</b> combine both (with bias correction) and are the default for most deep learning. Pair them with a <b>learning-rate schedule</b> (warmup, cosine decay, one-cycle). Race them on an elongated loss surface below.</p>' },
      { h: 'Regularization for deep nets', html: '<p><b>Dropout</b> randomly zeroes activations during training so neurons can\'t co-adapt; <b>weight decay</b> (ℓ2, decoupled in AdamW); <b>data augmentation</b>; <b>early stopping</b>. Reusing <b>pretrained</b> layers (transfer learning) often beats all of them when data is scarce.</p>' }
    ],
    widget: 'optimizers',
    terms: [['Vanishing gradients', 'Gradients shrinking toward zero in early layers.'], ['Momentum', 'Accumulating past gradients as a velocity.'], ['Dropout', 'Randomly zeroing activations during training.']],
    lab: { tasks: [
      { prompt: 'Implement one <b>momentum</b> step and one <b>Adam</b> step (with bias correction). Tests compare your trajectories with reference updates on the loss f(x, y) = x² + 25y².',
        starter: `import numpy as np
def grad(p):                       # gradient of f(x, y) = x**2 + 25*y**2
    return np.array([2 * p[0], 50 * p[1]])

def momentum_step(p, v, lr=0.01, beta=0.9):
    # TODO: v = beta*v - lr*grad(p); p = p + v
    return p, v

def adam_step(p, m, s, t, lr=0.1, b1=0.9, b2=0.999, eps=1e-8):
    # TODO: m = b1*m + (1-b1)*g ; s = b2*s + (1-b2)*g**2
    #       m_hat = m/(1-b1**t) ; s_hat = s/(1-b2**t) ; p = p - lr*m_hat/(sqrt(s_hat)+eps)
    return p, m, s

p, v = np.array([-4.0, 1.0]), np.zeros(2)
for _ in range(100):
    p, v = momentum_step(p, v)
print("momentum ->", p.round(4))
p, m, s = np.array([-4.0, 1.0]), np.zeros(2), np.zeros(2)
for t in range(1, 101):
    p, m, s = adam_step(p, m, s, t)
print("adam     ->", p.round(4))`,
        solution: `def momentum_step(p, v, lr=0.01, beta=0.9):
    v = beta * v - lr * grad(p)
    return p + v, v

def adam_step(p, m, s, t, lr=0.1, b1=0.9, b2=0.999, eps=1e-8):
    g = grad(p)
    m = b1 * m + (1 - b1) * g
    s = b2 * s + (1 - b2) * g ** 2
    m_hat, s_hat = m / (1 - b1 ** t), s / (1 - b2 ** t)
    return p - lr * m_hat / (np.sqrt(s_hat) + eps), m, s`,
        test: `import numpy as np
p, v = np.array([-4.0, 1.0]), np.zeros(2); rp, rv = p.copy(), v.copy()
for _ in range(50):
    p, v = momentum_step(p, v)
    rv = 0.9 * rv - 0.01 * grad(rp); rp = rp + rv
assert np.allclose(p, rp), "momentum trajectory differs from the reference"
p, m, s = np.array([-4.0, 1.0]), np.zeros(2), np.zeros(2); q, M, S = p.copy(), m.copy(), s.copy()
for t in range(1, 51):
    p, m, s = adam_step(p, m, s, t)
    g = grad(q); M = 0.9 * M + 0.1 * g; S = 0.999 * S + 0.001 * g ** 2
    q = q - 0.1 * (M / (1 - 0.9 ** t)) / (np.sqrt(S / (1 - 0.999 ** t)) + 1e-8)
assert np.allclose(p, q), "Adam trajectory differs from the reference"
assert np.linalg.norm(p) < np.linalg.norm([-4.0, 1.0])` }
    ] },
    quiz: [
      { q: 'Which technique most directly fights vanishing gradients in very deep nets?', options: ['Residual connections and normalization', 'A much bigger batch size for each update step', 'A higher learning rate so the gradients become larger', 'More dropout in every layer of the network'], correct: 0, why: 'Skip connections and normalization keep gradients flowing.' },
      { q: 'Adam combines…', options: ['Dropout and batch normalization in a single layer type', 'Ridge and Lasso penalties applied together', 'Momentum and per-parameter adaptive step sizes', 'Bagging and boosting inside one optimizer'], correct: 2, why: 'It tracks first (momentum) and second (RMSProp-like) moments.' }
    ]
  },
  /* ---------- PART 5 ---------- */
  {
    id: 'cnns', part: 4, chapter: 'Part II', title: 'Computer vision with CNNs', minutes: 16,
    goal: 'Compute convolutions and pooling by hand and understand CNN architectures.',
    sections: [
      { h: 'Why convolutions?', html: '<p>A fully connected layer on a 224×224 image needs millions of weights and ignores spatial structure. A <b>convolutional layer</b> slides small <b>filters</b> (e.g. 3×3) over the image. Each filter detects a local pattern (an edge, a texture) <b>anywhere</b> in the image, with the same few weights. Stacked layers build up from edges to parts to objects. Apply filters to a drawing below.</p>' },
      { h: 'Strides, padding and pooling', html: '<p><b>Stride</b> skips positions to shrink the output; <b>padding</b> ("same") keeps the size. <b>Max pooling</b> keeps the strongest activation in each window, adding a little translation invariance and reducing computation. Each layer outputs a stack of <b>feature maps</b>, one per filter.</p>' },
      { h: 'Architectures and transfer learning', html: '<p>LeNet → AlexNet → VGG → GoogLeNet → <b>ResNet</b> (skip connections made 100+ layers trainable) → EfficientNet/ConvNeXt, and today vision transformers. In practice, start from a <b>pretrained</b> model and fine-tune it. Beyond classification: object detection (YOLO-style), segmentation and more.</p>' }
    ],
    widget: 'conv',
    terms: [['Filter / kernel', 'Small weight matrix slid over the input.'], ['Feature map', 'Output of one filter across the input.'], ['Max pooling', 'Downsampling by taking the max in each window.']],
    lab: { tasks: [
      { prompt: 'Implement <code>conv2d(img, kernel)</code> ("valid" cross-correlation, as in deep learning) and <code>max_pool(fm, size)</code> with non-overlapping windows. Tests compare you with SciPy.',
        starter: `import numpy as np
img = np.array([[0, 0, 0, 0, 0, 0],
                [0, 9, 9, 9, 9, 0],
                [0, 9, 0, 0, 9, 0],
                [0, 9, 0, 0, 9, 0],
                [0, 9, 9, 9, 9, 0],
                [0, 0, 0, 0, 0, 0]], dtype=float)
vertical_edge = np.array([[1, 0, -1], [1, 0, -1], [1, 0, -1]], dtype=float)

def conv2d(img, kernel):
    kh, kw = kernel.shape
    out = np.zeros((img.shape[0] - kh + 1, img.shape[1] - kw + 1))
    # TODO: out[i, j] = sum(img[i:i+kh, j:j+kw] * kernel)
    return out

def max_pool(fm, size=2):
    h, w = fm.shape[0] // size, fm.shape[1] // size
    return np.zeros((h, w))   # TODO: max over each size x size block

fm = conv2d(img, vertical_edge)
print(fm)
print(max_pool(fm))`,
        solution: `def conv2d(img, kernel):
    kh, kw = kernel.shape
    out = np.zeros((img.shape[0] - kh + 1, img.shape[1] - kw + 1))
    for i in range(out.shape[0]):
        for j in range(out.shape[1]):
            out[i, j] = np.sum(img[i:i + kh, j:j + kw] * kernel)
    return out

def max_pool(fm, size=2):
    h, w = fm.shape[0] // size, fm.shape[1] // size
    return fm[:h * size, :w * size].reshape(h, size, w, size).max(axis=(1, 3))`,
        test: `import numpy as np
from scipy.signal import correlate2d
rng = np.random.default_rng(1)
a, k = rng.normal(size=(7, 9)), rng.normal(size=(3, 2))
assert np.allclose(conv2d(a, k), correlate2d(a, k, mode="valid"))
assert np.allclose(max_pool(np.arange(16.).reshape(4, 4)), [[5, 7], [13, 15]])
assert max_pool(np.ones((5, 5))).shape == (2, 2)` }
    ] },
    quiz: [
      { q: 'Main advantage of convolutional layers over dense layers for images?', options: ['They need no training because the filters are fixed in advance by design', 'They only work on grayscale images, where colour channels cannot confuse them', 'They remove the need for labels because filters discover classes by themselves', 'Shared local filters: far fewer weights and translation-equivariant features'], correct: 3, why: 'Weight sharing and locality fit image structure.' },
      { q: 'A 6×6 input with a 3×3 filter, stride 1, no padding gives…', options: ['6×6, because the filter keeps the size', '4×4, because (6 − 3) + 1 = 4', '3×3, because the filter size sets the output', '2×2, because stride 1 halves the width'], correct: 1, why: '6 − 3 + 1 = 4 in each dimension.' }
    ]
  },
  {
    id: 'sequences', part: 4, chapter: 'Part II', title: 'Sequences: time series & RNNs', minutes: 15,
    goal: 'Turn a series into a supervised dataset and beat the naive baseline.',
    sections: [
      { h: 'Always start with a baseline', html: '<p>For forecasting, the <b>naive</b> forecast (tomorrow = today) and the <b>seasonal naive</b> forecast (next Monday = last Monday) are surprisingly hard to beat. Measure everything against them with MAE or MAPE. Classic statistical models (ARMA, SARIMA) remain strong contenders. Compare models in the interactive.</p>' },
      { h: 'Windows make it supervised', html: '<p>Slide a window over the series: the last <i>w</i> values become the features X, and the next value (or next <i>n</i> values) becomes the target y. Any regressor can then forecast, from linear models to deep nets. Split by <b>time</b>, never randomly, or the future leaks into training.</p>' },
      { h: 'Recurrent networks', html: '<p>An <b>RNN</b> processes one step at a time and carries a <b>hidden state</b> as memory. Plain RNNs forget long-range context because of unstable gradients, so <b>LSTM</b> and <b>GRU</b> cells add gates that learn what to keep and forget. 1D convolutions and, increasingly, transformers handle long sequences more efficiently.</p>' }
    ],
    widget: 'forecast',
    terms: [['Naive forecast', 'Predicting the last observed value.'], ['Windowing', 'Turning a series into (past window → next value) pairs.'], ['LSTM', 'RNN cell with gates controlling long-term memory.']],
    lab: { tasks: [
      { prompt: 'Implement <code>make_windows(series, w)</code> → <code>X</code> of shape (n−w, w) and <code>y</code> (the next value). The given code then shows a linear model beating the naive forecast.',
        starter: `import numpy as np
from sklearn.linear_model import LinearRegression

t = np.arange(240)
series = 10 + 0.05 * t + 3 * np.sin(2 * np.pi * t / 12) + np.random.default_rng(0).normal(0, 0.3, 240)

def make_windows(series, w):
    # TODO: X[i] = series[i:i+w], y[i] = series[i+w]
    return np.zeros((0, w)), np.zeros(0)

def evaluate(w=12):
    X, y = make_windows(series, w)
    split = int(len(X) * 0.8)                      # split by time, not randomly
    model = LinearRegression().fit(X[:split], y[:split])
    lin_mae = np.mean(np.abs(model.predict(X[split:]) - y[split:]))
    naive_mae = np.mean(np.abs(X[split:, -1] - y[split:]))
    return naive_mae, lin_mae

print("naive MAE: %.3f   linear MAE: %.3f" % evaluate())`,
        solution: `def make_windows(series, w):
    X = np.array([series[i:i + w] for i in range(len(series) - w)])
    y = series[w:]
    return X, y`,
        test: `import numpy as np
X, y = make_windows(np.arange(10.0), 3)
assert X.shape == (7, 3) and np.allclose(X[0], [0, 1, 2]) and np.allclose(y[:2], [3, 4])
naive, lin = evaluate()
assert lin < naive, (naive, lin)` }
    ] },
    quiz: [
      { q: 'Why must time-series splits be chronological?', options: ['Random splits leak future information into training', 'Chronological order is faster to process on a CPU', 'scikit-learn refuses to split time series any other way', 'Random splits make the classes unbalanced in every fold'], correct: 0, why: 'Evaluation must mimic forecasting the unseen future.' },
      { q: 'LSTM gates mainly help with…', options: ['Raising the resolution of image inputs', 'Augmenting the data with shifted copies', 'Remembering long-term dependencies', 'Reducing the number of parameters in the layer'], correct: 2, why: 'Gates control what to keep or forget across many steps.' }
    ]
  },
  {
    id: 'attention-transformers', part: 4, chapter: 'Part II', title: 'NLP, attention & transformers', minutes: 18,
    goal: 'Compute scaled dot-product attention and see how transformers power LLMs.',
    sections: [
      { h: 'From words to vectors', html: '<p>Text is split into <b>tokens</b> (subwords via BPE or similar) and mapped to learned <b>embeddings</b>: vectors where similar meanings sit close together. Early neural NLP used RNN encoder–decoders, but compressing a whole sentence into one vector was a bottleneck.</p>' },
      { h: 'Attention', html: '<p><b>Attention</b> lets every position look at every other position and decide what is relevant. Each token produces a <b>query</b>, <b>key</b> and <b>value</b>; weights = softmax(QKᵀ/√d), and the output is the weighted sum of values. <b>Multi-head</b> attention runs several of these in parallel to capture different relations. A <b>causal mask</b> stops tokens from seeing the future, which is how text generators are trained. Click a word below to see what it attends to.</p>' },
      { h: 'Transformers and LLMs', html: '<p>The <b>transformer</b> stacks attention and feed-forward blocks with residual connections and layer norm, plus positional information. <b>Encoders</b> (BERT-style) excel at understanding; <b>decoders</b> (GPT-style) generate text token by token; encoder–decoders translate. Pretrained on huge corpora, then fine-tuned or instruction-tuned, they become today\'s LLMs, and vision transformers apply the same idea to image patches.</p>' }
    ],
    widget: 'attention',
    terms: [['Embedding', 'Learned dense vector representing a token.'], ['Self-attention', 'Each token weighs all tokens of the same sequence.'], ['Causal mask', 'Prevents attending to future positions.']],
    lab: { tasks: [
      { prompt: 'Implement a numerically stable <code>softmax</code> and <code>attention(Q, K, V, mask=None)</code>: weights = softmax(QKᵀ/√d), with masked positions set to −∞ before the softmax. Return <code>(output, weights)</code>.',
        starter: `import numpy as np

def softmax(x, axis=-1):
    return x   # TODO: subtract the max along axis, exponentiate, normalize

def attention(Q, K, V, mask=None):
    d = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d)
    # TODO: if mask is not None: scores = np.where(mask, scores, -np.inf)
    weights = softmax(scores, axis=-1)
    return weights @ V, weights

rng = np.random.default_rng(0)
Q, K, V = rng.normal(size=(4, 8)), rng.normal(size=(4, 8)), rng.normal(size=(4, 8))
causal = np.tril(np.ones((4, 4), dtype=bool))
out, w = attention(Q, K, V, mask=causal)
print(w.round(2))`,
        solution: `def softmax(x, axis=-1):
    z = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=axis, keepdims=True)

def attention(Q, K, V, mask=None):
    d = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d)
    if mask is not None:
        scores = np.where(mask, scores, -np.inf)
    weights = softmax(scores, axis=-1)
    return weights @ V, weights`,
        test: `import numpy as np
assert np.allclose(softmax(np.array([1000.0, 1000.0])), [0.5, 0.5]), "softmax must be numerically stable"
out, w = attention(Q, K, V)
assert np.allclose(w.sum(axis=1), 1)
ref = np.exp(Q @ K.T / np.sqrt(8)); ref /= ref.sum(1, keepdims=True)
assert np.allclose(w, ref) and np.allclose(out, ref @ V)
_, wm = attention(Q, K, V, mask=causal)
assert np.allclose(np.triu(wm, 1), 0) and np.allclose(wm[0], [1, 0, 0, 0]), "causal mask must hide the future"` }
    ] },
    quiz: [
      { q: 'Why divide QKᵀ by √d?', options: ['To save memory, because smaller numbers need fewer bits per score', 'To keep scores from growing with dimension and saturating the softmax', 'So that every score becomes exactly a cosine similarity between −1 and 1', 'It is optional decoration, since softmax already normalizes scores for any dimension'], correct: 1, why: 'Large dot products push softmax into regions with tiny gradients.' },
      { q: 'GPT-style models are…', options: ['Encoder-only, with bidirectional attention over the whole input', 'Convolutional networks that slide filters over the tokens', 'Recurrent networks that read one token at a time', 'Decoder-only with causal attention'], correct: 3, why: 'They generate left-to-right using masked self-attention.' }
    ]
  },
  /* ---------- PART 6 ---------- */
  {
    id: 'generative-models', part: 5, chapter: 'Part II', title: 'Autoencoders, GANs & diffusion models', minutes: 16,
    goal: 'Understand how models learn to generate data, from autoencoders to diffusion.',
    sections: [
      { h: 'Autoencoders', html: '<p>An <b>autoencoder</b> compresses its input into a small <b>latent</b> code and reconstructs it. That makes it useful for dimensionality reduction, denoising, anomaly detection (high reconstruction error = unusual) and pretraining. <b>Variational</b> autoencoders make the latent space smooth enough to sample new data from it.</p>' },
      { h: 'GANs', html: '<p>A <b>generator</b> turns noise into fake samples while a <b>discriminator</b> learns to tell fake from real; each improves by competing. GANs produce sharp images but are notoriously tricky to train (mode collapse, instability).</p>' },
      { h: 'Diffusion models', html: '<p>The <b>forward process</b> gradually adds Gaussian noise to an image over T steps until only noise remains. A network learns the <b>reverse process</b>: predict the noise at step t and remove it. Generation starts from pure noise and denoises step by step. Thanks to a closed form, any step can be sampled directly: x<sub>t</sub> = √ᾱ<sub>t</sub>·x₀ + √(1−ᾱ<sub>t</sub>)·ε. Scrub through the noise schedule below. Latent diffusion runs this in an autoencoder\'s latent space, powering modern text-to-image models.</p>' }
    ],
    widget: 'diffusion',
    terms: [['Latent space', 'Compressed representation learned by a model.'], ['Discriminator', 'GAN network that classifies real vs. generated.'], ['Noise schedule', 'How much noise is added at each diffusion step.']],
    lab: { tasks: [
      { prompt: 'Implement the closed-form forward diffusion step <code>q_sample(x0, t, noise)</code> = √ᾱ<sub>t</sub>·x0 + √(1−ᾱ<sub>t</sub>)·noise, using the given linear β schedule.',
        starter: `import numpy as np
T = 1000
betas = np.linspace(1e-4, 0.02, T)
alphas = 1 - betas
alpha_bar = np.cumprod(alphas)

def q_sample(x0, t, noise):
    return x0   # TODO

rng = np.random.default_rng(0)
x0 = np.ones(10000)                 # a "perfectly white image"
noise = rng.normal(size=x0.shape)
for t in [0, 100, 300, 999]:
    xt = q_sample(x0, t, noise)
    print(f"t={t:4d}  signal={np.sqrt(alpha_bar[t]):.3f}  mean={xt.mean():.3f}  std={xt.std():.3f}")`,
        solution: `def q_sample(x0, t, noise):
    return np.sqrt(alpha_bar[t]) * x0 + np.sqrt(1 - alpha_bar[t]) * noise`,
        test: `import numpy as np
assert np.allclose(q_sample(x0, 0, noise), np.sqrt(alpha_bar[0]) * x0 + np.sqrt(1 - alpha_bar[0]) * noise)
late = q_sample(x0, 999, noise)
assert abs(late.mean()) < 0.05 and abs(late.std() - 1) < 0.05, "by t=999 it should be (almost) pure noise"
assert np.corrcoef(q_sample(x0 + noise * 0, 50, noise), noise)[0, 1] > 0.99` }
    ] },
    quiz: [
      { q: 'In a diffusion model, the neural network is usually trained to predict…', options: ['The noise added at step t', 'The class label of the training image', 'The discriminator score for the generated sample', 'The size of the latent code used for generation'], correct: 0, why: 'Predicting the noise lets the model remove it step by step.' },
      { q: 'A GAN\'s discriminator…', options: ['Generates images from random latent noise vectors', 'Adds noise to images, step by step, during training', 'Encodes text prompts into embeddings for the generator', 'Classifies samples as real or generated'], correct: 3, why: 'It provides the training signal for the generator.' }
    ]
  },
  {
    id: 'reinforcement-learning', part: 5, chapter: 'Part II', title: 'Reinforcement learning', minutes: 16,
    goal: 'Learn values and policies from rewards with Q-learning.',
    sections: [
      { h: 'Learning by trial and error', html: '<p>An <b>agent</b> observes the <b>state</b> of an environment, takes an <b>action</b>, receives a <b>reward</b>, and repeats. Its goal is to maximize the total <b>discounted</b> future reward (discount factor γ). Its strategy is a <b>policy</b>. Rewards are often delayed, so the credit-assignment problem is central.</p>' },
      { h: 'Values and Q-learning', html: '<p>The Q-value Q(s, a) estimates the return from taking action a in state s and acting well afterwards. <b>Q-learning</b> updates estimates from experience:</p><pre class="snip">Q(s,a) ← Q(s,a) + α · [ r + γ · maxₐ\' Q(s\',a\') − Q(s,a) ]</pre><p>It needs exploration (ε-greedy) to discover good actions. Watch values propagate back from the goal in the gridworld.</p>' },
      { h: 'Deep RL', html: '<p>When states are too many for a table, a neural network approximates Q (<b>DQN</b>, with replay buffers and target networks), or <b>policy-gradient</b> methods (REINFORCE, actor-critic, PPO) learn the policy directly. RL from human feedback fine-tunes LLMs, and RL on verifiable rewards trains reasoning models.</p>' }
    ],
    widget: 'gridworld',
    terms: [['Policy', 'Mapping from states to actions.'], ['Discount factor γ', 'How much future rewards count relative to immediate ones.'], ['Q-value', 'Expected return of an action in a state, then acting optimally.']],
    lab: { tasks: [
      { prompt: 'Implement the Q-learning update. The agent in a 6-cell corridor (goal at the right end, reward +1) should learn to always move <b>right</b>.',
        starter: `import numpy as np
N_STATES, GOAL = 6, 5          # actions: 0 = left, 1 = right

def step(s, a):
    s2 = max(0, s - 1) if a == 0 else min(GOAL, s + 1)
    return s2, (1.0 if s2 == GOAL else 0.0), s2 == GOAL

def q_update(Q, s, a, r, s2, done, alpha=0.5, gamma=0.9):
    # TODO: target = r if done else r + gamma * max(Q[s2])
    #       Q[s, a] += alpha * (target - Q[s, a])
    return Q

def train(episodes=300, eps=0.2, seed=0):
    rng = np.random.default_rng(seed)
    Q = np.zeros((N_STATES, 2))
    for _ in range(episodes):
        s, done = 0, False
        while not done:
            a = rng.integers(2) if rng.random() < eps or Q[s, 0] == Q[s, 1] else int(np.argmax(Q[s]))
            s2, r, done = step(s, a)
            Q = q_update(Q, s, a, r, s2, done)
            s = s2
    return Q

Q = train()
print(Q.round(3))
print("policy:", ["←→"[int(np.argmax(Q[s]))] for s in range(GOAL)])`,
        solution: `def q_update(Q, s, a, r, s2, done, alpha=0.5, gamma=0.9):
    target = r if done else r + gamma * np.max(Q[s2])
    Q[s, a] += alpha * (target - Q[s, a])
    return Q`,
        test: `import numpy as np
Qt = np.zeros((6, 2)); q_update(Qt, 4, 1, 1.0, 5, True)
assert abs(Qt[4, 1] - 0.5) < 1e-9
Qt = np.zeros((6, 2)); Qt[3] = [0.2, 0.8]; q_update(Qt, 2, 1, 0.0, 3, False)
assert abs(Qt[2, 1] - 0.36) < 1e-9
Q = train()
assert all(np.argmax(Q[s]) == 1 for s in range(5)), "the greedy policy should always go right"` }
    ] },
    quiz: [
      { q: 'With γ = 0 an agent…', options: ['Plans infinitely far ahead and values the distant future fully', 'Never learns anything, because no future reward is counted', 'Only cares about immediate reward', 'Explores completely at random, ignoring all of its estimates'], correct: 2, why: 'Future rewards are discounted to zero.' },
      { q: 'Why does Q-learning need exploration?', options: ['To save memory, since a tabular agent then stores fewer states in total', 'Otherwise it may never try the actions that are actually best', 'To compute gradients, which need a varied set of actions to be defined', 'It does not, because a greedy policy always finds the best actions eventually'], correct: 1, why: 'Without trying actions, their values can\'t be learned.' }
    ]
  }
  ]
};
