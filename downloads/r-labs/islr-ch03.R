# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch03.R     (base R only)
set.seed(2026)
dat <- data.frame(x=c(1,2,3),y=c(2,3,5))
m <- lm(y~x,data=dat)
cat('OLS slope/intercept:',coef(m),'\n')
cat('Residual sum of squares:',sum(residuals(m)^2),'\n')
cat('R-squared:',summary(m)$r.squared,'\n')
plot(dat$x,dat$y,pch=19,main='Tiny OLS demonstration')
abline(m,col='#287fa0',lwd=2)
plot(fitted(m),residuals(m),pch=19,main='Residual diagnostic',xlab='Fitted',ylab='Residual')
abline(h=0,lty=2)
