"""Kleinberg–Tardos 6.3: segmented least squares dynamic programming."""
from itertools import product
from random import Random

def sse(pts):
    n=len(pts)
    if n<2:return 0.0
    mx=sum(p[0] for p in pts)/n;my=sum(p[1] for p in pts)/n
    sxx=sum((x-mx)**2 for x,y in pts)
    if sxx<1e-12:return sum((y-my)**2 for x,y in pts)
    slope=sum((x-mx)*(y-my) for x,y in pts)/sxx
    return sum((y-my-slope*(x-mx))**2 for x,y in pts)

def dynamic(pts,penalty):
    n=len(pts);M=[0.0];starts=[0]
    for j in range(1,n+1):
        val,i=min((M[i-1]+sse(pts[i-1:j])+penalty,i) for i in range(1,j+1))
        M.append(val);starts.append(i)
    segments=[];j=n
    while j>0:
        i=starts[j];segments.append((i,j));j=i-1
    return M[-1],segments[::-1]

def exhaustive(pts,penalty):
    n=len(pts);best=float('inf')
    for mask in product((0,1),repeat=n-1):
        cuts=[0]+[i for i,x in enumerate(mask,1) if x]+[n]
        val=sum(sse(pts[a:b])+penalty for a,b in zip(cuts,cuts[1:]))
        best=min(best,val)
    return best

pts=[(0,0),(1,1),(2,2),(3,8),(4,9),(5,10)]
value,sections=dynamic(pts,3)
assert abs(value-6)<1e-8,(value,sections)
rng=Random(99)
for n in range(2,9):
    for _ in range(30):
        pts=[(i,rng.randint(-4,9)) for i in range(n)]
        c=rng.randrange(1,7)
        assert abs(dynamic(pts,c)[0]-exhaustive(pts,c))<1e-7
print('PASS: segmented least squares vs every possible partition for 210 cases')
