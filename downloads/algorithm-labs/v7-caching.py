"""Kleinberg–Tardos 4.3: farthest-in-future optimal cache replacement."""
from functools import lru_cache
from itertools import product

def farthest(req,initial,capacity):
    cache=set(initial); misses=0; history=[]
    for i,x in enumerate(req):
        if x not in cache:
            misses+=1
            if len(cache)>=capacity:
                victim=max(sorted(cache),key=lambda y:(req.index(y,i+1) if y in req[i+1:] else float('inf')))
                cache.remove(victim)
            cache.add(x)
        history.append(tuple(sorted(cache)))
    return misses,history

def offline_optimal(req,initial,capacity):
    @lru_cache(None)
    def f(i,cache):
        if i==len(req):return 0
        x=req[i];st=set(cache)
        if x in st:return f(i+1,cache)
        if len(st)<capacity:return 1+f(i+1,tuple(sorted(st|{x})))
        return 1+min(f(i+1,tuple(sorted(st-{v}|{x}))) for v in st)
    return f(0,tuple(sorted(initial)))

sample=list('ACBDADEBDAC')  # A C B D A D E B D A C
assert farthest(sample,['A','B','C'],3)[0]==4
for n in range(1,7):
    for z in product('ABC',repeat=n):
        for k in (1,2):
            initial=list('ABC'[:k])
            assert farthest(z,initial,k)[0]==offline_optimal(tuple(z),initial,k)
print('PASS: farthest-in-future vs exact offline DP for all 1–6 request streams on A/B/C')
