"""K&T §4.5–4.6: Kruskal, DSU, and independently enumerated spanning trees."""
from itertools import combinations
from random import Random

def kruskal(vertices, edges):
    parent={v:v for v in vertices};rank={v:0 for v in vertices}
    def find(x):
        if parent[x]!=x:parent[x]=find(parent[x])
        return parent[x]
    result=[]
    for u,v,w in sorted(edges,key=lambda e:e[2]):
        a,b=find(u),find(v)
        if a==b:continue
        if rank[a]<rank[b]:a,b=b,a
        parent[b]=a
        if rank[a]==rank[b]:rank[a]+=1
        result.append((u,v,w))
    if len(result)!=len(vertices)-1: raise ValueError('Graph is disconnected')
    return result,sum(e[2] for e in result)

def brute_mst(vertices,edges):
    costs=[]
    for chosen in combinations(edges,len(vertices)-1):
        parent={v:v for v in vertices}
        def root(x):
            while parent[x]!=x:x=parent[x]
            return x
        for u,v,_ in chosen: parent[root(u)]=root(v)
        if len({root(x) for x in vertices})==1:costs.append(sum(e[2] for e in chosen))
    return min(costs)

if __name__ == '__main__':
    V=list('ABCDE');E=[('A','B',1),('B','C',2),('A','C',3),('B','D',4),('C','D',5),('D','E',6),('C','E',7),('A','E',9)]
    tree,cost=kruskal(V,E);assert cost==13 and {u+v for u,v,_ in tree}=={'AB','BC','BD','DE'}
    assert brute_mst(V,E)==13
    rng=Random(23)
    for _ in range(70):
        verts=list('ABCD'); pairs=list(combinations(verts,2)); edges=[(*e,rng.randint(1,25)) for e in pairs]
        assert kruskal(verts,edges)[1]==brute_mst(verts,edges)
    print('PASS: Kruskal example and 70 brute-force spanning-tree comparisons')
