"""K&T §6.4: integer subset sum by capacity DP, not value/weight knapsack."""
from itertools import combinations
from random import Random

def subset_sum(weights,capacity):
    if not isinstance(capacity,int) or capacity<0 or any(not isinstance(w,int) or w<0 for w in weights):
        raise ValueError('nonnegative integer weights and capacity required')
    n=len(weights);M=[[0]*(capacity+1) for _ in range(n+1)]
    for i,wi in enumerate(weights,1):
        for cap in range(capacity+1):
            M[i][cap]=max(M[i-1][cap],wi+M[i-1][cap-wi] if wi<=cap else 0)
    chosen=[];c=capacity
    for i in range(n,0,-1):
        wi=weights[i-1]
        if wi<=c and M[i][c]>M[i-1][c]:chosen.append(i-1);c-=wi
    return M[n][capacity], list(reversed(chosen)), M

def brute(weights,capacity):
    return max((sum(weights[i] for i in idx) for n in range(len(weights)+1) for idx in combinations(range(len(weights)),n) if sum(weights[i] for i in idx)<=capacity),default=0)

if __name__ == '__main__':
    val,selected,table=subset_sum([3,4,6,7],11)
    assert val==11 and selected==[1,3] and table[-1][-1]==11
    assert subset_sum([3,4,6,7],10)[0]==10
    rng=Random(99)
    for _ in range(150):
        weights=[rng.randint(0,12) for i in range(rng.randint(0,8))];cap=rng.randint(0,18)
        got,sel,_=subset_sum(weights,cap)
        assert got==brute(weights,cap) and got==sum(weights[i] for i in sel)
    print('PASS: subset-sum DP example and 150 brute-force comparisons')
