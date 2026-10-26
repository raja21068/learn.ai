/* Misconception feedback for the Machine Learning course quizzes.
   For each wrong option: the specific mistaken idea behind it and why it fails, shown when a learner picks it
   (lesson quizzes and mastery checks). Keyed lessonId -> question index -> option index. Original text. */
window.MISCONCEPTIONS = window.MISCONCEPTIONS || {};
window.MISCONCEPTIONS['machine-learning'] = {
  'ml-landscape': {
    0: { 0: 'No human writes these labels: the "next word" is already in the text, so the data supervises itself.',
         2: 'Reinforcement learning learns from rewards for actions in an environment; here there are no actions or rewards, only text.',
         3: 'Clustering finds groups without any target. This model is trained to hit a specific target: the next word.' },
    1: { 0: 'An underfit model is poor on the training data too. 99% on training data means it learned that data very well.',
         1: 'High training accuracy alone says nothing about new data. The drop from 99% to 70% is the warning sign.',
         2: 'A bad test set is possible, but the classic cause of a large train/test gap is the model memorising its training data.' }
  },
  'end-to-end': {
    0: { 0: 'Fitting on the full dataset lets the test rows shape the scaling: information leaks from the test set into training.',
         1: 'The test set must stay unseen. Fitting anything on it, even a scaler, leaks test information into the model.',
         3: 'Trees do not need scaling, but many models do (linear models, k-NN, SVMs, neural nets). The question is about when to fit it.' },
    1: { 1: 'Speed is not the issue: scoring is usually fast. The problem is statistical, not computational.',
         2: 'scikit-learn happily scores a test set many times. Nothing stops you, which is exactly why the rule needs discipline.',
         3: 'Scoring never changes the weights. The bias comes from you: each time you adjust the model after looking at the test score, the test set leaks into your choices.' }
  },
  'classification': {
    0: { 0: 'This is the effect of lowering the threshold. A higher threshold flags fewer cases, not more.',
         1: 'Precision and recall trade off as the threshold moves: you cannot usually raise both by changing the threshold alone.',
         3: 'The scores stay the same, but the threshold decides which scores become positive predictions, so the predictions change.' },
    1: { 1: 'High precision means few false alarms, but a screening test that misses real cancers fails its main purpose.',
         2: 'When positive cases are rare, accuracy can be high even if the model misses most of them. It hides false negatives.',
         3: 'Speed matters less than not missing patients: a missed cancer (false negative) is far costlier than a slow result.' }
  },
  'training-models': {
    0: { 0: 'A loss that has exploded to NaN will not recover by itself: more epochs just keep the broken updates going.',
         2: 'The test set plays no part in training, so removing it cannot affect the training loss.',
         3: 'More features do not fix unstable optimisation. Diverging loss usually means the steps are too large.' },
    1: { 0: 'Ridge (ℓ2) shrinks weights towards zero but rarely makes them exactly zero.',
         1: 'Early stopping limits training time; it does not force individual weights to zero.',
         2: 'Dropout randomly silences units during training only; the stored weights are not set to zero.' }
  },
  'model-lab': {
    0: { 0: 'An error far below the noise floor is not impressive, it is suspicious: noise in the labels cannot be predicted.',
         1: 'Possible, but the much likelier explanation is a bug, such as leakage. Check the pipeline before doubting the noise estimate.',
         3: 'A small validation set makes estimates noisy, but it does not explain an error five times below what the data allows.' },
    1: { 0: 'More data is one of the most reliable cures for overfitting: it would likely help.',
         1: 'Ridge regularisation penalises large weights and would likely reduce this overfitting.',
         2: 'A lower degree makes the model simpler, which directly narrows the gap between training and validation error.' }
  },
  'decision-trees': {
    0: { 0: 'Gini is 0 only when one class has every example. A 50/50 node is as mixed as two classes can be.',
         1: '0.25 is one squared proportion (0.5²). Gini is 1 minus the sum of both: 1 − (0.25 + 0.25) = 0.5.',
         2: 'For two classes the maximum Gini impurity is 0.5, not 1.' },
    1: { 0: 'A deeper tree fits the training data even more closely, which makes overfitting worse, not better.',
         1: 'Tree splits are thresholds on single features, so scaling does not change them.',
         3: 'Removing the test set only hides the problem. The model would still fail on new data.' }
  },
  'ensembles': {
    0: { 1: 'It can speed things up, but the main purpose is decorrelation: forcing trees to look at different features.',
         2: 'The opposite: identical trees would make identical mistakes, and averaging them would gain nothing.',
         3: 'Feature subsampling does not make trees deeper. Diversity, not depth, is what reduces the ensemble\'s variance.' },
    1: { 0: 'Bootstrap sampling is bagging (as in random forests). Boosting trains sequentially on what is still wrong.',
         2: 'Random feature subsets are a random-forest idea. Boosting focuses on the errors the ensemble still makes.',
         3: 'In boosting, each new learner depends on the previous ones: it targets their remaining errors rather than the original labels.' }
  },
  'dimensionality-reduction': {
    0: { 1: 'The smallest-variance direction is the last component, often the one you drop.',
         2: 'Components are new directions found from the data; they rarely line up with an original column.',
         3: 'PCA never sees the class labels: it is unsupervised. Separating classes is the goal of methods like LDA.' },
    1: { 0: 'PCA works on any numeric values, integers or not.',
         1: 'Scaling never adds dimensions; it changes how much each existing feature counts.',
         3: 'PCA is not unit-invariant: measure a feature in millimetres instead of metres and its variance, and influence, grows a millionfold.' }
  },
  'unsupervised': {
    0: { 0: 'Spherical, similar-sized clusters are the case k-means handles best.',
         1: 'The number of dimensions shown on a page is irrelevant; k-means works fine in 2-D.',
         2: 'Standardising usually helps k-means, because distances then weigh each feature fairly.' },
    1: { 0: 'k-means assigns every point to some cluster, even far-away outliers.',
         2: 'PCA projects data onto new axes; it has no notion of noise points.',
         3: 'Linear regression fits a line through all points; it does not label any of them as outliers.' }
  },
  'neural-networks': {
    0: { 0: 'No amount of training helps: no straight line can separate XOR\'s classes, so a single perceptron cannot represent it.',
         1: 'The output function is not the issue. Any single neuron draws one linear boundary, and XOR needs two.',
         3: 'Weights can be positive or negative; the limitation is that the decision boundary is a single line.' },
    1: { 1: 'One ReLU outputs a single number, not a probability for each of the 10 classes.',
         2: 'Rounding one number to a class invents an order between classes (class 3 "between" 2 and 4) that does not exist.',
         3: 'One sigmoid handles two classes. Ten classes need ten outputs, normalised by softmax.' }
  },
  'pytorch-training': {
    0: { 0: 'Updating weights is optimizer.step(). backward() only computes the gradients that step() uses.',
         2: 'Clearing gradients is optimizer.zero_grad(). backward() adds new gradients into .grad.',
         3: 'The data loader supplies batches; backward() works only on the loss already computed.' },
    1: { 0: 'Memory is not the main reason: gradients are summed in place, so without zeroing you would use the wrong gradient, not more memory.',
         1: 'Shuffling is the DataLoader\'s job (shuffle=True), not zero_grad\'s.',
         2: 'It has no effect on speed; it prevents gradients from earlier batches being added to the current one.' }
  },
  'training-deep-nets': {
    0: { 1: 'Batch size changes the noise in each update, not how gradients shrink as they pass back through many layers.',
         2: 'A larger learning rate scales every step but does not stop gradients shrinking layer by layer, and it can make training diverge.',
         3: 'Dropout is a regulariser against overfitting; it does not help gradients flow through deep stacks.' },
    1: { 0: 'Dropout and batch normalisation are layers, not optimisers. Adam is an optimiser.',
         1: 'Ridge and Lasso are penalties added to the loss. Adam is about how the steps are taken.',
         3: 'Bagging and boosting combine whole models; Adam updates the parameters of a single model.' }
  },
  'cnns': {
    0: { 0: 'Convolution filters are learned by backpropagation, just like dense-layer weights.',
         1: 'CNNs handle colour images routinely: each filter spans all the input channels.',
         2: 'CNNs still learn from labels; the filters learn features that help predict them.' },
    1: { 0: 'Without padding, a 3×3 filter cannot be centred on the border pixels, so the output shrinks.',
         2: 'The filter size does not set the output size; the formula is (input − filter) / stride + 1.',
         3: 'Stride 1 moves the filter one pixel at a time; it does not halve anything.' }
  },
  'sequences': {
    0: { 1: 'Speed is not the reason. The order matters for honesty: the model must not see the future.',
         2: 'scikit-learn will split time series randomly if asked; that is exactly the trap.',
         3: 'Class balance is a separate issue. Random splits are wrong here because they mix future data into training.' },
    1: { 0: 'Image resolution has nothing to do with LSTMs; gates control a memory over time steps.',
         1: 'Data augmentation is a data technique; gates are part of the network\'s memory mechanism.',
         3: 'Gates add parameters rather than removing them; their benefit is long-term memory.' }
  },
  'attention-transformers': {
    0: { 0: 'The scaling is not about storage. It keeps the softmax away from saturation, where gradients vanish.',
         2: 'Dividing by √d does not normalise vectors, so scores are not cosine similarities and are not bounded to [−1, 1].',
         3: 'Softmax normalises to a distribution, but very large inputs make it nearly one-hot, with tiny gradients. Scaling prevents that.' },
    1: { 0: 'Encoder-only models with bidirectional attention are BERT-style; they are not built to generate text left to right.',
         1: 'Transformers do not use convolutions over tokens; they use self-attention.',
         2: 'Transformers do not read tokens one at a time like an RNN; attention looks at all earlier tokens in parallel.' }
  },
  'generative-models': {
    0: { 1: 'Diffusion models generate images; predicting class labels is classification.',
         2: 'A discriminator belongs to GANs. Diffusion models have no discriminator.',
         3: 'The latent size is a fixed design choice, not something the network predicts.' },
    1: { 0: 'Generating images from noise is the generator\'s role, not the discriminator\'s.',
         1: 'Adding noise step by step describes the forward process of a diffusion model, not a GAN.',
         2: 'Encoding text prompts is the job of a text encoder (as in text-to-image models), not of a GAN discriminator.' }
  },
  'reinforcement-learning': {
    0: { 0: 'That describes γ close to 1. With γ = 0 the future counts for nothing.',
         1: 'It still learns: the immediate reward is counted. It just ignores everything after the next step.',
         3: 'Exploration is controlled separately (for example by ε); γ only weighs future rewards.' },
    1: { 0: 'Exploration has nothing to do with memory; the table has the same states either way.',
         2: 'Tabular Q-learning needs no gradients at all; exploration is about gathering experience.',
         3: 'A purely greedy agent can lock onto an early, mediocre action and never discover a better one.' }
  },
  'churn-project': {
    0: { 0: 'Reporting the higher score because it is higher is cherry-picking. The random split let the model see the future.',
         2: 'Averaging blends an honest estimate with an inflated one; the result is still optimistic.',
         3: 'They can be compared, and the comparison is informative: the gap reveals that the random split leaked the future.' },
    1: { 1: 'Cost is not the point: a baseline is about meaning, showing whether the model adds anything.',
         2: 'A target can be written in advance. The problem is that meeting it does not prove the model beats a trivial rule.',
         3: 'This is good practice, not a universal legal requirement; the reason here is scientific.' }
  }
};
