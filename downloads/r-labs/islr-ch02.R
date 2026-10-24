# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch02.R     (base R only)
set.seed(2026)
# Expected squared error decomposition at a selected x0.
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
