# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch01.R     (base R only)
set.seed(2026)
x <- seq(0, 10, length.out = 80)
y <- 2 + 0.7*x + rnorm(length(x), sd=1)
cat('Regression task: target y available, sample correlation:', cor(x,y), '\n')
fit <- lm(y ~ x)
print(coef(fit))
# Now ignore y: unsupervised grouping uses the input x, not the target.
groups <- kmeans(matrix(x, ncol=1), centers=3, nstart=10)
print(table(groups$cluster))
plot(x,y,pch=19, col='#376b9b', main='Synthetic supervised regression')
abline(fit,col='#c57248',lwd=2)
