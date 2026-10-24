"""K&T §7.5: maximum bipartite matching by reversible augmenting paths."""
from itertools import combinations
from random import Random

def maximum_matching(left,right,edges):
    adj={a:[b for x,b in edges if x==a] for a in left}
    matched_right={}
    def augment(a,seen):
        for b in adj[a]:
            if b in seen:continue
            seen.add(b)
            if b not in matched_right or augment(matched_right[b],seen):
                matched_right[b]=a
                return True
        return False
    for a in left:augment(a,set())
    return {(a,b) for b,a in matched_right.items()}

def brute(left,right,edges):
    return max((len(choice) for n in range(len(edges)+1) for choice in combinations(edges,n) if len({u for u,v in choice})==len(choice) and len({v for u,v in choice})==len(choice)),default=0)

if __name__ == '__main__':
    left=list('ABC');right=['1','2','3'];edges=[('A','1'),('A','2'),('B','1'),('C','2'),('C','3')]
    got=maximum_matching(left,right,edges)
    assert len(got)==3 and got=={('A','2'),('B','1'),('C','3')}
    rng=Random(122)
    for _ in range(130):
        le=list('ABC');ri=list('123')
        ed=[(u,v) for u in le for v in ri if rng.random()<.55]
        assert len(maximum_matching(le,ri,ed))==brute(le,ri,ed)
    print('PASS: bipartite example, 130 exhaustive small-graph comparisons')
