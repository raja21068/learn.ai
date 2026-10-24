"""Edmonds-Karp example: residual updates, max flow and a min-cut certificate."""
from collections import deque, defaultdict
EDGES=[('s','a',3),('s','b',2),('a','b',1),('a','t',2),('b','t',3)]
def maxflow(edges,source='s',sink='t'):
    r=defaultdict(lambda:defaultdict(int));neighbors=defaultdict(set)
    for u,v,c in edges:
        r[u][v]+=c;neighbors[u].add(v);neighbors[v].add(u)
    value=0
    while True:
        parent={source:None};q=deque([source])
        while q and sink not in parent:
            u=q.popleft()
            for v in sorted(neighbors[u]):
                if v not in parent and r[u][v]>0:parent[v]=u;q.append(v)
        if sink not in parent:break
        b=float('inf');v=sink
        while v!=source:u=parent[v];b=min(b,r[u][v]);v=u
        v=sink
        while v!=source:u=parent[v];r[u][v]-=b;r[v][u]+=b;v=u
        value+=b
    reachable={source};q=deque([source])
    while q:
        u=q.popleft()
        for v in neighbors[u]:
            if v not in reachable and r[u][v]>0:reachable.add(v);q.append(v)
    capacity=sum(c for u,v,c in edges if u in reachable and v not in reachable)
    assert value==capacity
    return value,reachable,capacity
if __name__=='__main__':
    value,side,capacity=maxflow(EDGES)
    assert value==5 and side=={'s'} and capacity==5
    print('Max flow',value,'certified by cut',side,'capacity',capacity)
