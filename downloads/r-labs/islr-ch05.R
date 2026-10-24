# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch05.R     (base R only)
set.seed(2026)
x <- 1:20
y <- 2+.75*x+c(-1,0,1,0)[(seq_along(x)-1)%%4+1]
fold <- rep(1:5,each=4)
loss <- numeric(5)
for(k in 1:5) {
 train <- fold != k; test <- !train
 model <- lm(y~x,subset=train)
 loss[k] <- mean((y[test]-predict(model,newdata=data.frame(x=x[test])))^2)
}
cat('Holdout fold MSEs:',loss,'\n')
cat('Five-fold CV MSE:',mean(loss),'\n')
# Under unequal fold sizes, compute overall observation-weighted loss.
# Any learned scaling or feature selection belongs INSIDE train in this loop.
