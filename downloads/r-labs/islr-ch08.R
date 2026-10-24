# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch08.R     (base R only)
set.seed(2026)
x <- c(1,2,4,6,7,9)
y <- c(1,1,3,7,8,9)
rss <- function(cut) {
 left <- x <= cut
 if(!any(left) || all(left)) return(NA_real_)
 sum((y[left]-mean(y[left]))^2)+sum((y[!left]-mean(y[!left]))^2)
}
cuts <- c(1.5,3,5,6.5,8)
print(data.frame(cut=cuts,RSS=sapply(cuts,rss)))
plot(cuts,sapply(cuts,rss),type='b',pch=19,main='Decision stump: partition RSS',ylab='RSS')
cat('The split chosen on training data is not validated by this plot.\n')
