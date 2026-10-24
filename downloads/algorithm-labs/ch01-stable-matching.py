"""Original lab illustrating Gale-Shapley with strict, complete preferences."""
from collections import deque
PROPOSERS = {'A':['X','Y','Z'], 'B':['Y','X','Z'], 'C':['Y','Z','X']}
RECEIVERS = {'X':['B','A','C'], 'Y':['C','B','A'], 'Z':['A','B','C']}
def stable_matching(men, women):
    assert len(men) == len(women)
    assert all(set(x) == set(women) for x in men.values())
    rank = {w:{m:i for i,m in enumerate(pref)} for w,pref in women.items()}
    q, nxt, held = deque(men), {m:0 for m in men}, {}
    proposals = []
    while q:
        m=q.popleft()
        w=men[m][nxt[m]]; nxt[m]+=1
        old=held.get(w)
        if old is None or rank[w][m]<rank[w][old]:
            held[w]=m
            if old is not None:q.append(old)
        else:q.append(m)
        proposals.append((m,w,dict(held)))
    match={m:w for w,m in held.items()}
    assert len(match)==len(men)
    for m,order in men.items():
        for w in order[:order.index(match[m])]:
            current=held[w]
            assert rank[w][current]<rank[w][m],f'blocking pair {m,w}'
    return match,proposals
if __name__=='__main__':
    match,trace=stable_matching(PROPOSERS,RECEIVERS)
    assert match=={'A':'Z','B':'X','C':'Y'}
    assert len(trace)==6
    print('Proposals:',[(m,w) for m,w,_ in trace]);print('Stable:',match)
