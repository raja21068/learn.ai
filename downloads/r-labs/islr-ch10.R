# LearningAI • ISLR (James et al., R edition) • independent demonstration
# Synthetic observations; NO copied textbook data, code, or empirical results.
# Run: Rscript islr-ch10.R     (base R only)
set.seed(2026)
data <- rbind(c(-2,-1),c(-1.4,-1.1),c(-1.1,-.3),c(-.3,-.4),
              c(.2,.2),c(1,.4),c(1.3,1.1),c(2,1.1))
colnames(data) <- c('x1','x2')
pca <- prcomp(data,center=TRUE,scale.=FALSE)
cat('PCA variance proportions:',summary(pca)$importance[2,],'\n')
print(pca$rotation)
fit <- kmeans(data,centers=2,nstart=25)
print(fit$centers)
h <- hclust(dist(data),method='complete')
plot(data,col=fit$cluster,pch=19,main='Toy data: k-means assignments')
plot(h,main='Hierarchical clustering (complete linkage)')
