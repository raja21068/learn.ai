"""Weighted interval DP with predecessor search and reconstruction."""
from bisect import bisect_right
jobs=[('J1',1,3,5),('J2',2,5,6),('J3',4,6,5),('J4',6,8,4),('J5',5,9,9)]
def optimize(data):
    a=sorted(data,key=lambda j:j[2]);ends=[j[2] for j in a]
    p=[bisect_right(ends,j[1],hi=i) for i,j in enumerate(a)] # count preceding compatible jobs
    M=[0]
    for i,j in enumerate(a):M.append(max(M[-1],j[3]+M[p[i]]))
    picked=[];i=len(a)
    while i:
        j=a[i-1]
        if j[3]+M[p[i-1]]>=M[i-1]:picked.append(j[0]);i=p[i-1]
        else:i-=1
    return M,list(reversed(picked)),p
if __name__=='__main__':
    M,picked,p=optimize(jobs)
    assert M==[0,5,6,10,14,15],M
    assert picked==['J2','J5'],picked
    assert p==[0,0,1,3,2],p
    print('OPT:',M,'schedule:',picked,'predecessors:',p)
