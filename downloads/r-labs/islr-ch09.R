# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch09.R     (base R only)
set.seed(2026)
neg <- c(1,2,4); pos <- c(6,7,9)
cutoffs <- seq(3,7,by=.5)
margin_violations <- function(cut) sum(neg > cut-1)+sum(pos < cut+1)
print(data.frame(boundary=cutoffs, violations=sapply(cutoffs,margin_violations)))
plot(c(neg,pos),c(rep(-1,length(neg)),rep(1,length(pos))),pch=19,
     col=rep(c('#b66c42','#2f80a2'),c(length(neg),length(pos))),
     xlab='x',ylab='Class',main='Illustrative 1D hyperplane, not an SVM fit')
abline(v=5,lwd=2);abline(v=c(4,6),lty=2)
