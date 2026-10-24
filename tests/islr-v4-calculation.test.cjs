const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../assets/islr-visuals.js'),'utf8'),ctx);
const render=(k,v)=>ctx.window.ISLRVisuals.render('islr-'+k,v);
const polys=s=>(s.match(/<polyline /g)||[]).length;
assert(polys(render('bias',50))>=2,'Bias–variance curves must be visible');
assert(polys(render('regression',50))>=1,'Regression line must be visible');
assert(polys(render('logit',50))>=1,'Logistic probability curve must be visible');
assert(polys(render('spline',50))>=1,'Spline plot must be visible');
assert.equal((render('cv',50).match(/fill=\"#efb577\"|fill=\"#77a6ca\"/g)||[]).length,100,'5x20 CV membership blocks');
assert(render('shrink',0).includes('ridge 3.00'),'Ridge at lambda zero must preserve baseline');
assert(render('shrink',100).includes('lasso 0.00'),'Strong lasso can zero coefficients');
assert(render('tree',50).includes('RSS=4.67'),'Tree split at x=5 returns derived RSS');
assert(render('svm',50).includes('Margin violations=0'),'Separable margin example at x=5');
function variance(x){let s=render('pca',x).match(/Sample projected variance ([0-9.]+)/);assert(s);return +s[1];}
assert(variance(25)>variance(50),'Approximately diagonal PCA direction has more variance than vertical');
assert.notEqual(render('intro',0),render('intro',100),'Change from unlabeled to labeled');
console.log('PASS ISLR: figures draw real data paths; numerical demonstration invariants verified');
