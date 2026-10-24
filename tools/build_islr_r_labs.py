"""Self-contained original R labs for ISLR companion; no copied textbook code/data.
   R not bundled; run with Rscript after installing R separately."""
import pathlib
root=pathlib.Path(__file__).resolve().parents[1]
dest=root/'downloads/r-labs';dest.mkdir(parents=True,exist_ok=True)
H='''# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch{n:02d}.R     (base R only)
set.seed(2026)
'''
scripts={
1:'''x <- seq(0, 10, length.out = 80)
y <- 2 + 0.7*x + rnorm(length(x), sd=1)
cat('Regression task: target y available, sample correlation:', cor(x,y), '\\n')
fit <- lm(y ~ x)
print(coef(fit))
# Now ignore y: unsupervised grouping uses the input x, not the target.
groups <- kmeans(matrix(x, ncol=1), centers=3, nstart=10)
print(table(groups$cluster))
plot(x,y,pch=19, col='#376b9b', main='Synthetic supervised regression')
abline(fit,col='#c57248',lwd=2)
''',
2:'''# Expected squared error decomposition at a selected x0.
models <- data.frame(name=c('Simple','Flexible'),bias2=c(.36,.16),variance=c(.49,1.00))
models$irreducible <- .25
models$test_mse <- with(models, bias2+variance+irreducible)
print(models)
complexity <- seq(1,10,length.out=100)
train <- .19 + 1.65/(complexity+.1)
test <- 1.5/(complexity+.2)^2 + .017*(complexity-1)^2 + .28
plot(complexity,test,type='l',ylim=range(c(train,test)),lwd=2,col='#b96e4f',ylab='Toy error',xlab='Complexity',main='Authored bias–variance illustration')
lines(complexity,train,col='#317c9c',lwd=2)
legend('topright',legend=c('toy test','toy training'),col=c('#b96e4f','#317c9c'),lwd=2)
''',
3:'''dat <- data.frame(x=c(1,2,3),y=c(2,3,5))
m <- lm(y~x,data=dat)
cat('OLS slope/intercept:',coef(m),'\\n')
cat('Residual sum of squares:',sum(residuals(m)^2),'\\n')
cat('R-squared:',summary(m)$r.squared,'\\n')
plot(dat$x,dat$y,pch=19,main='Tiny OLS demonstration')
abline(m,col='#287fa0',lwd=2)
plot(fitted(m),residuals(m),pch=19,main='Residual diagnostic',xlab='Fitted',ylab='Residual')
abline(h=0,lty=2)
''',
4:'''x <- seq(-3,3,length.out=300)
p <- plogis(-.4 + 1.3*x)
y <- rbinom(length(x),1,p)
fit <- glm(y~x,family=binomial())
cat('Estimated log-odds coefficients:',coef(fit),'\\n')
predict_p <- predict(fit,type='response')
for(cutoff in c(.2,.5,.8)) {
 pred <- as.integer(predict_p >= cutoff)
 cat('Threshold',cutoff,'\\n'); print(table(predicted=pred,observed=y))
}
plot(x,p,pch=20,cex=.3,col='#608eb1',main='Synthetic logistic probabilities',ylab='True P(Y=1)')
ord <- order(x);lines(x[ord],predict_p[ord],col='#be8049',lwd=2)
''',
5:'''x <- 1:20
y <- 2+.75*x+c(-1,0,1,0)[(seq_along(x)-1)%%4+1]
fold <- rep(1:5,each=4)
loss <- numeric(5)
for(k in 1:5) {
 train <- fold != k; test <- !train
 model <- lm(y~x,subset=train)
 loss[k] <- mean((y[test]-predict(model,newdata=data.frame(x=x[test])))^2)
}
cat('Holdout fold MSEs:',loss,'\\n')
cat('Five-fold CV MSE:',mean(loss),'\\n')
# Under unequal fold sizes, compute overall observation-weighted loss.
# Any learned scaling or feature selection belongs INSIDE train in this loop.
''',
6:'''beta0 <- c(3,1.8,.7)
lambda <- c(0,.25,1,2,3)
ridge <- t(sapply(lambda,function(z) beta0/(1+z)))
lasso <- t(sapply(lambda,function(z) sign(beta0)*pmax(abs(beta0)-z,0)))
colnames(ridge) <- paste0('beta',1:3)
colnames(lasso) <- paste0('beta',1:3)
cat('Ridge paths (orthonormal X; specified penalty scaling):\\n');print(ridge)
cat('Lasso paths (orthonormal X; specified penalty scaling):\\n');print(lasso)
matplot(lambda,ridge,type='l',lty=1,lwd=2,main='Synthetic ridge coefficient paths',xlab='lambda',ylab='coefficient')
matplot(lambda,lasso,type='l',lty=1,lwd=2,main='Synthetic lasso coefficient paths',xlab='lambda',ylab='coefficient')
''',
7:'''x <- seq(0,10,length.out=120)
knot <- 5
y <- 1+.2*x+.8*pmax(0,x-knot)+rnorm(length(x),sd=.4)
model <- lm(y~x+I(pmax(0,x-knot)))
print(coef(model))
plot(x,y,pch=20,col='#9db4c8',main='Piecewise linear spline (authored data)',ylab='response')
lines(x,predict(model),col='#2e749d',lwd=3)
abline(v=knot,lty=2,col='#bf8b52')
# Basis transform ensures continuity at the knot; slopes can differ.
''',
8:'''x <- c(1,2,4,6,7,9)
y <- c(1,1,3,7,8,9)
rss <- function(cut) {
 left <- x <= cut
 if(!any(left) || all(left)) return(NA_real_)
 sum((y[left]-mean(y[left]))^2)+sum((y[!left]-mean(y[!left]))^2)
}
cuts <- c(1.5,3,5,6.5,8)
print(data.frame(cut=cuts,RSS=sapply(cuts,rss)))
plot(cuts,sapply(cuts,rss),type='b',pch=19,main='Decision stump: partition RSS',ylab='RSS')
cat('The split chosen on training data is not validated by this plot.\\n')
''',
9:'''neg <- c(1,2,4); pos <- c(6,7,9)
cutoffs <- seq(3,7,by=.5)
margin_violations <- function(cut) sum(neg > cut-1)+sum(pos < cut+1)
print(data.frame(boundary=cutoffs, violations=sapply(cutoffs,margin_violations)))
plot(c(neg,pos),c(rep(-1,length(neg)),rep(1,length(pos))),pch=19,
     col=rep(c('#b66c42','#2f80a2'),c(length(neg),length(pos))),
     xlab='x',ylab='Class',main='Illustrative 1D hyperplane, not an SVM fit')
abline(v=5,lwd=2);abline(v=c(4,6),lty=2)
''',
10:'''data <- rbind(c(-2,-1),c(-1.4,-1.1),c(-1.1,-.3),c(-.3,-.4),
              c(.2,.2),c(1,.4),c(1.3,1.1),c(2,1.1))
colnames(data) <- c('x1','x2')
pca <- prcomp(data,center=TRUE,scale.=FALSE)
cat('PCA variance proportions:',summary(pca)$importance[2,],'\\n')
print(pca$rotation)
fit <- kmeans(data,centers=2,nstart=25)
print(fit$centers)
h <- hclust(dist(data),method='complete')
plot(data,col=fit$cluster,pch=19,main='Toy data: k-means assignments')
plot(h,main='Hierarchical clustering (complete linkage)')
'''
}
for n,code in scripts.items():
 (dest/f'islr-ch{n:02d}.R').write_text(H.format(n=n)+code,encoding='utf-8')
print('R labs authored',len(scripts))
