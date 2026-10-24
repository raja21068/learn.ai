"""BFS distance, bipartiteness and topological ordering on toy graphs."""
from collections import deque
G={'A':['B','C'],'B':['A','D'],'C':['A','E'],'D':['B','F'],'E':['C','F'],'F':['D','E']}
def bfs(g,s):
    queue=deque([s]);dist={s:0};parent={s:None}
    while queue:
        u=queue.popleft()
        for v in g[u]:
            if v not in dist:
                dist[v]=dist[u]+1;parent[v]=u;queue.append(v)
    return dist,parent
def bipartite(g):
    color={}
    for root in g:
        if root in color:continue
        color[root]=0;q=deque([root])
        while q:
            u=q.popleft()
            for v in g[u]:
                if v not in color:color[v]=1-color[u];q.append(v)
                elif color[v]==color[u]:return False
    return True
def topo(dag):
    indeg={v:0 for v in dag}
    for adj in dag.values():
        for w in adj:indeg[w]+=1
    q=deque([v for v,d in indeg.items() if d==0]);out=[]
    while q:
        v=q.popleft();out.append(v)
        for w in dag[v]:
            indeg[w]-=1
            if indeg[w]==0:q.append(w)
    return out if len(out)==len(dag) else None
if __name__=='__main__':
    assert bfs(G,'A')[0]['F']==3
    assert bipartite(G)
    assert not bipartite({'A':['B','C'],'B':['A','C'],'C':['A','B']})
    assert topo({'A':['B','C'],'B':['D'],'C':['D'],'D':[]})[0]=='A'
    print('BFS distances:',bfs(G,'A')[0]);print('PASS')
