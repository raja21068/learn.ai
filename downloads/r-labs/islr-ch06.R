# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch06.R     (base R only)
set.seed(2026)
beta0 <- c(3,1.8,.7)
lambda <- c(0,.25,1,2,3)
ridge <- t(sapply(lambda,function(z) beta0/(1+z)))
lasso <- t(sapply(lambda,function(z) sign(beta0)*pmax(abs(beta0)-z,0)))
colnames(ridge) <- paste0('beta',1:3)
colnames(lasso) <- paste0('beta',1:3)
cat('Ridge paths (orthonormal X; specified penalty scaling):\n');print(ridge)
cat('Lasso paths (orthonormal X; specified penalty scaling):\n');print(lasso)
matplot(lambda,ridge,type='l',lty=1,lwd=2,main='Synthetic ridge coefficient paths',xlab='lambda',ylab='coefficient')
matplot(lambda,lasso,type='l',lty=1,lwd=2,main='Synthetic lasso coefficient paths',xlab='lambda',ylab='coefficient')
