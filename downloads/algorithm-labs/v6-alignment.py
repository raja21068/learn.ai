"""K&T §6.6: sequence alignment, per-symbol gap δ and mismatch α."""
from functools import lru_cache
from random import Random

def alignment(x,y,gap=2,mismatch=1):
    m,n=len(x),len(y);D=[[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1):D[i][0]=i*gap
    for j in range(n+1):D[0][j]=j*gap
    for i in range(1,m+1):
        for j in range(1,n+1):
            D[i][j]=min(D[i-1][j-1]+(0 if x[i-1]==y[j-1] else mismatch),D[i-1][j]+gap,D[i][j-1]+gap)
    a,b=[],[];i,j=m,n
    while i or j:
        if i and j and D[i][j]==D[i-1][j-1]+(0 if x[i-1]==y[j-1] else mismatch):
            a.append(x[i-1]);b.append(y[j-1]);i-=1;j-=1
        elif i and D[i][j]==D[i-1][j]+gap:a.append(x[i-1]);b.append('-');i-=1
        else:a.append('-');b.append(y[j-1]);j-=1
    return D[m][n],(''.join(reversed(a)),''.join(reversed(b))),D

def independent(x,y,gap=2,mismatch=1):
    @lru_cache(None)
    def f(i,j):
        if i==len(x):return (len(y)-j)*gap
        if j==len(y):return (len(x)-i)*gap
        return min((0 if x[i]==y[j] else mismatch)+f(i+1,j+1),gap+f(i+1,j),gap+f(i,j+1))
    return f(0,0)

if __name__ == '__main__':
    score,pair,grid=alignment('GATT','GCT');assert score==3 and grid[4][3]==3
    rng=Random(121)
    for _ in range(160):
        a=''.join(rng.choice('ACGT') for i in range(rng.randint(0,6)))
        b=''.join(rng.choice('ACGT') for i in range(rng.randint(0,6)))
        value,(X,Y),_=alignment(a,b)
        assert value==independent(a,b)
        assert X.replace('-','')==a and Y.replace('-','')==b
        assert sum(2 if x=='-' or y=='-' else int(x!=y) for x,y in zip(X,Y))==value
    print('PASS: sequence alignment worked case, 160 independent recursive comparisons and tracebacks')
