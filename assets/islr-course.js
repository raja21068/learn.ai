/* In-course lessons that expose actual material; guided reading remains complementary. */
(function(){'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
const questions=[
 {q:'Which learning task can be conducted without an observed target Y?',right:'Exploratory clustering of feature vectors',wrong:['Supervised wage regression','Predictive accuracy calculation for a disease label','Binary response classification']},
 {q:'Why can a more flexible model obtain worse test MSE despite lower training MSE?',right:'It may have higher estimation variance and fit training noise',wrong:['Training MSE must increase with model complexity','Irreducible error becomes negative','Larger models always have larger bias']},
 {q:'Which statement about a large R² is valid?',right:'The fitted model accounts for much observed sample variation relative to the intercept-only fit',wrong:['It proves the coefficient effects are causal','It guarantees low error on a future sample','It proves constant residual variance']},
 {q:'What does a coefficient in binary logistic regression linearly affect?',right:'The log-odds of the modeled positive outcome',wrong:['The label value itself by a fixed amount','The probability by the identical amount for every x','The irreducible noise variance']},
 {q:'What belongs inside each cross-validation training split?',right:'Scaling, selection, hyperparameter tuning and model fitting',wrong:['Only the final predictive model after full-data scaling','Test labels used to improve feature selection','A global imputation fit across all patients before folds']},
 {q:'Which statement about ridge and lasso is correct?',right:'Ridge generally shrinks weights; lasso may produce exact zeros',wrong:['Both always choose precisely the same active predictors','Ridge is designed solely to cluster observations','Lasso never requires standardized predictors']},
 {q:'Which transformation creates a continuous linear spline with a knot at κ?',right:'max(0, x−κ) added to the linear basis',wrong:['Replacing every x with its square only','Deleting all observations above κ','Using unrelated intercepts on both sides without constraints']},
 {q:'What makes random forests less correlated than ordinary bagged trees?',right:'Selecting a random subset of candidate predictors at each split',wrong:['Always using exactly one tree','Removing bootstrap samples and keeping only one sample','Forcing every tree to use the same first split']},
 {q:'Which points govern the fitted soft-margin SVM boundary?',right:'Training points on or inside the margin (support vectors)',wrong:['Only points farthest from the boundary','Only the mean of each class','Only the unlabeled test observations']},
 {q:'What does the leading principal component maximize?',right:'Sample variance of the centered predictor data after projection',wrong:['Supervised disease-prediction accuracy by construction','Number of clusters produced by k-means','The average response label without using Y']},
];
const src=window.BOOK_SOURCE_MAP.islr;
window.ISLR_COURSE={
 id:'statistical-learning',title:'Statistical Learning: ISLR with R',short:'Statistical Learning',tabLabel:'Statistics',category:'foundations',accent:'#39748d',symbol:'SL',tag:'New · Book-first labs',level:'Undergraduate to graduate · guided study',lang:'r',
 subtitle:'Ten source-mapped lessons based on James, Witten, Hastie and Tibshirani. Mathematical explanations, original interactive graphs, reproducible R examples and critical reasoning.',
 outcome:'Understand supervised and unsupervised statistical learning, estimate and evaluate models without leakage, compare algorithms, and analyze assumptions.',
 reference:'Based on An Introduction to Statistical Learning with Applications in R (2013 edition). This is an original guide rather than a reproduction of the textbook.',
 learn:['Train/test error, bias–variance decomposition, regression and classification','Leakage-safe cross-validation, bootstrapping and regularization','Spline models, regression and classification trees, bagging and boosting','Support vector classifiers, PCA and clustering'],
 parts:['Learning foundations','Regression and classification','Resampling and regularization','Flexible models and ensembles','SVM and unsupervised learning'],
 lessons:window.BOOK_MASTERCLASS.islr.map((b,i)=>({id:'chapter-'+b.n,part:Math.floor(i/2),chapter:'Chapter '+b.n,title:b.focus,minutes:45,
  goal:b.objectives.join(' '),sections:[...b.concepts.map(([h,p])=>({h,html:`<p>${esc(p)}</p>`})),{h:'Worked numerical reasoning',html:`<p>${esc(b.example)}</p>`},{h:'Read and reproduce the original',html:`<p>Source PDF p. ${src[i].pdf}. The companion maps ${src[i].sections.length} PDF bookmark sections. Inspect the original figures in your locally loaded copy, then use the interactive reconstruction to test concepts.</p><p><a href="#/book/islr/chapter/${b.n}">Open original interactive chart and section-by-section source map →</a> · <a download href="downloads/r-labs/islr-ch${String(b.n).padStart(2,'0')}.R">Download original R practice script →</a></p><p>R files contain independently authored synthetic examples; datasets and numerical outcomes from the publisher have not been copied.</p>`}],lab:null,widget:null,
  quiz:[{q:questions[i].q,options:(()=>{let opts=questions[i].wrong.slice();opts.splice((i*3)%4,0,questions[i].right);return opts;})(),correct:(i*3)%4,why:questions[i].right+'. '+b.review[0]}]
 }))
};
})();
