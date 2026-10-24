"""K&T §5.4: closest pair O(n log n), checking up to next 15 strip points."""
from math import dist
from random import Random

def closest_pair(points):
    if len(points)<2:raise ValueError('Need at least 2 points')
    # Tag equal-coordinate points distinctly to ensure a stable partition.
    tagged=[(float(x),float(y),i) for i,(x,y) in enumerate(points)]
    px=sorted(tagged,key=lambda p:(p[0],p[1],p[2]))
    py=sorted(tagged,key=lambda p:(p[1],p[0],p[2]))
    def merge(Px,Py):
        n=len(Px)
        if n<=3:
            return min(((dist(a[:2],b[:2]),a,b) for i,a in enumerate(Px) for b in Px[i+1:]),key=lambda x:x[0])
        mid=n//2; left,right=Px[:mid],Px[mid:]; leftids={v[2] for v in left}
        ly=[p for p in Py if p[2] in leftids];ry=[p for p in Py if p[2] not in leftids]
        lbest,rbest=merge(left,ly),merge(right,ry)
        best=min(lbest,rbest,key=lambda x:x[0]);split=(left[-1][0]+right[0][0])/2
        strip=[p for p in Py if abs(p[0]-split)<best[0]]
        for i,p in enumerate(strip):
            for q in strip[i+1:i+16]:
                d=dist(p[:2],q[:2])
                if d<best[0]:best=d,p,q
        return best
    d,p,q=merge(px,py);return d,(p[2],q[2])

def brute(points):
    return min(dist(a,b) for i,a in enumerate(points) for b in points[i+1:])

if __name__ == '__main__':
    pts=[(0,1),(2,5),(3,1.5),(4,5.2),(6,2),(8,4)]
    d,(a,b)=closest_pair(pts);assert abs(d-(4.04)**.5)<1e-10 and {a,b}=={1,3}
    rng=Random(42)
    for n in range(2,42):
        for _ in range(7):
            points=[(rng.uniform(-20,20),rng.uniform(-20,20)) for __ in range(n)]
            got=closest_pair(points)[0];want=brute(points)
            assert abs(got-want)<1e-10,(n,got,want)
    for pts in [[(0,0),(0,0),(1,1)],[(0,1),(0,2),(0,3),(0,4)],[(1,0),(2,0),(3,0)]]:
        assert abs(closest_pair(pts)[0]-brute(pts))<1e-10
    print('PASS: closest-pair sample, 280+ random comparisons, tied coordinates')
