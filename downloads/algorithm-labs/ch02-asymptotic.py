"""Original lab contrasting exact iteration counts with asymptotic bounds."""
import math

def triangular(n):return sum(i for i in range(1,n+1))
def repeated_halving(n):
    k=0
    while n>=1:
        k+=1;n//=2
    return k
if __name__=='__main__':
    for n in (10,100,1000):
        assert triangular(n)==n*(n+1)//2
        assert repeated_halving(n)==math.floor(math.log2(n))+1
        print(f'n={n:4d} nlog2n={n*math.log2(n):9.1f} triangular={triangular(n):9d}')
