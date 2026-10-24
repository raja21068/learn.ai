"""Kleinberg–Tardos 5.5: 3-product recursive integer multiplication."""
from random import Random

def multiply(x,y):
    sign=(-1 if (x<0)^(y<0) else 1);x,y=abs(x),abs(y)
    def calc(a,b):
        if a<10 or b<10:return a*b
        digits=max(len(str(a)),len(str(b)))
        m=digits//2;base=10**m
        ah,al=divmod(a,base);bh,bl=divmod(b,base)
        z2=calc(ah,bh);z0=calc(al,bl)
        z1=calc(ah+al,bh+bl)-z2-z0
        return z2*base*base+z1*base+z0
    return sign*calc(x,y)

assert multiply(12,34)==408
assert 1*3*100+((1+2)*(3+4)-1*3-2*4)*10+2*4==408
rng=Random(7)
for _ in range(1000):
    x=rng.randint(-10**12,10**12);y=rng.randint(-10**12,10**12)
    assert multiply(x,y)==x*y
print('PASS: 1,000 signed randomized multiplications')
