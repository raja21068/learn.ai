# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch07.R     (base R only)
set.seed(2026)
x <- seq(0,10,length.out=120)
knot <- 5
y <- 1+.2*x+.8*pmax(0,x-knot)+rnorm(length(x),sd=.4)
model <- lm(y~x+I(pmax(0,x-knot)))
print(coef(model))
plot(x,y,pch=20,col='#9db4c8',main='Piecewise linear spline (authored data)',ylab='response')
lines(x,predict(model),col='#2e749d',lwd=3)
abline(v=knot,lty=2,col='#bf8b52')
# Basis transform ensures continuity at the knot; slopes can differ.
