"""Kleinberg–Tardos 7.11: max-profit prerequisite closure by minimum cut."""
from itertools import product
from collections import deque
from random import Random

def select(projects,needs):
    names=list(projects);n=len(names);source=n;sink=n+1;total=n+2
    capacity=[[0]*total for _ in range(total)]
    positive=sum(max(0,v) for v in projects.values())
    for i,name in enumerate(names):
        v=projects[name]
        if v>0:capacity[source][i]+=v
        elif v<0:capacity[i][sink]+=-v
    for a,b in needs:capacity[names.index(a)][names.index(b)]+=positive+1
    residual=[row[:] for row in capacity];flow=0
    while True:
        parent=[-1]*total;parent[source]=source;q=deque([source])
        while q and parent[sink]<0:
            u=q.popleft()
            for v in range(total):
                if residual[u][v] and parent[v]<0:parent[v]=u;q.append(v)
        if parent[sink]<0:break
        path=float('inf');v=sink
        while v!=source:u=parent[v];path=min(path,residual[u][v]);v=u
        v=sink
        while v!=source:u=parent[v];residual[u][v]-=path;residual[v][u]+=path;v=u
        flow+=path
    reachable={source};q=deque([source])
    while q:
        u=q.popleft()
        for v in range(total):
            if residual[u][v] and v not in reachable:reachable.add(v);q.append(v)
    chosen={names[i] for i in range(n) if i in reachable}
    return chosen,positive-flow

def exhaustive(projects,needs):
    keys=list(projects);best=-10**9
    for bits in product((0,1),repeat=len(keys)):
        chosen={key for i,key in enumerate(keys) if bits[i]}
        if all(a not in chosen or b in chosen for a,b in needs):
            best=max(best,sum(projects[k] for k in chosen))
    return best

p={'A':8,'B':7,'C':-6,'D':-5};req=[('A','C'),('B','C'),('B','D')]
assert select(p,req)==({'A','B','C','D'},4)
rng=Random(100)
for n in range(2,8):
    for _ in range(30):
        p={str(i):rng.randint(-8,12) for i in range(n)}
        # only forward arcs so no cycles in randomly sampled prerequisite constraints
        req=[(str(i),str(j)) for i in range(n) for j in range(i+1,n) if rng.random()<.22]
        chosen,val=select(p,req)
        assert all(a not in chosen or b in chosen for a,b in req)
        assert val==exhaustive(p,req),(p,req,val)
print('PASS: 180 dependency networks vs brute-force subsets; min-cut certificate verified')
