"""Independent teaching input for K&T Algorithm Design §4.4. Nonnegative weights required."""
from heapq import heappop, heappush
from random import Random

def dijkstra(graph, source):
    if any(w < 0 for links in graph.values() for _, w in links):
        raise ValueError('Dijkstra needs nonnegative weights')
    dist = {v: float('inf') for v in graph}
    parent = {}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        du, u = heappop(heap)
        if du != dist[u]:
            continue
        for v, w in graph[u]:
            if w < 0:
                raise ValueError('Dijkstra needs nonnegative weights')
            if du + w < dist[v]:
                dist[v] = du + w
                parent[v] = u
                heappush(heap, (dist[v], v))
    return dist, parent

def bellman_ford(graph, start):
    d = {v: float('inf') for v in graph}; d[start] = 0
    for _ in range(len(graph)-1):
        for u, links in graph.items():
            for v, w in links:
                d[v] = min(d[v], d[u]+w)
    return d

if __name__ == '__main__':
    g = {'A':[('B',4),('C',1)],'B':[('D',1),('E',7)],'C':[('B',2),('D',5)],'D':[('E',3)],'E':[]}
    d,prev = dijkstra(g,'A'); assert d == {'A':0,'B':3,'C':1,'D':4,'E':7}
    route=['E']
    while route[-1] != 'A': route.append(prev[route[-1]])
    assert list(reversed(route)) == list('ACBDE')
    rng=Random(21)
    for _ in range(60):
        names='ABCDE'; gr={u:[] for u in names}
        for u in names:
            for v in names:
                if u!=v and rng.random()<.36: gr[u].append((v,rng.randint(0,12)))
        assert dijkstra(gr,'A')[0]==bellman_ford(gr,'A')
    try: dijkstra({'A':[('B',-1)],'B':[]},'A'); assert False
    except ValueError: pass
    print('PASS: Dijkstra example, predecessor path, 60 Bellman-Ford cross-checks, negative-weight guard')
