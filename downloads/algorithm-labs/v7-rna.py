"""Kleinberg–Tardos 6.5: simplified RNA noncrossing max-pair interval DP.
This is an abstract combinatorial model, not physical free-energy prediction."""
from functools import lru_cache
from random import Random
PAIR={'AU','UA','CG','GC'}

def optimal(seq):
    n=len(seq)
    @lru_cache(None)
    def f(i,j):
        if j-i<5:return 0
        ans=f(i,j-1)
        for t in range(i,j-4):
            if seq[t]+seq[j] in PAIR:
                ans=max(ans,1+f(i,t-1)+f(t+1,j-1))
        return ans
    return f(0,n-1)

def brute_pairs(seq):
    n=len(seq)
    edges=[(i,j) for i in range(n) for j in range(i+5,n) if seq[i]+seq[j] in PAIR]
    best=0
    def dfs(k,pairs,used):
        nonlocal best
        if k==len(edges):
            best=max(best,len(pairs));return
        dfs(k+1,pairs,used)
        a,b=edges[k]
        if a in used or b in used:return
        if any((a<c<b<d or c<a<d<b) for c,d in pairs):return
        dfs(k+1,pairs+[(a,b)],used|{a,b})
    dfs(0,[],set())
    return best

assert optimal('ACGUAUCGAU')==brute_pairs('ACGUAUCGAU')
rng=Random(41)
for n in range(6,10):
    for _ in range(65):
        s=''.join(rng.choices('ACGU',k=n))
        assert optimal(s)==brute_pairs(s)
print('PASS: 260 randomized RNA instances vs enumerated legal noncrossing pair sets')
