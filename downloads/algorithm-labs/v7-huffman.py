"""Kleinberg–Tardos 4.8: optimal binary prefix-code weighted path length."""
import heapq
from functools import lru_cache
from random import Random

def huffman(freq):
    heap=list(freq);heapq.heapify(heap);merges=[]
    while len(heap)>1:
        a,b=heapq.heappop(heap),heapq.heappop(heap)
        merges.append(a+b);heapq.heappush(heap,a+b)
    return sum(merges),merges

@lru_cache(None)
def exhaustive(weights):
    if len(weights)==1:return 0
    best=float('inf')
    for i in range(len(weights)):
        for j in range(i+1,len(weights)):
            val=weights[i]+weights[j]
            remaining=tuple(sorted([v for k,v in enumerate(weights) if k not in (i,j)]+[val]))
            best=min(best,val+exhaustive(remaining))
    return best

assert huffman([5,7,10,15])==(71,[12,22,37])
rng=Random(8)
for n in range(2,7):
    for _ in range(25):
        a=[rng.randint(1,30) for _ in range(n)]
        assert huffman(a)[0]==exhaustive(tuple(sorted(a)))
print('PASS: Huffman merge costs equal exhaustive optimal merge costs')
