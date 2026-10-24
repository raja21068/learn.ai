# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch04.R     (base R only)
set.seed(2026)
x <- seq(-3,3,length.out=300)
p <- plogis(-.4 + 1.3*x)
y <- rbinom(length(x),1,p)
fit <- glm(y~x,family=binomial())
cat('Estimated log-odds coefficients:',coef(fit),'\n')
predict_p <- predict(fit,type='response')
for(cutoff in c(.2,.5,.8)) {
 pred <- as.integer(predict_p >= cutoff)
 cat('Threshold',cutoff,'\n'); print(table(predicted=pred,observed=y))
}
plot(x,p,pch=20,cex=.3,col='#608eb1',main='Synthetic logistic probabilities',ylab='True P(Y=1)')
ord <- order(x);lines(x[ord],predict_p[ord],col='#be8049',lwd=2)
