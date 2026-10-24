"""Kleinberg–Tardos 5.6: radix-2 DFT and linear convolution."""
import cmath
from random import Random

def fft(a,inverse=False):
    n=len(a)
    assert n>0 and n&(n-1)==0,'length must be power of two'
    if n==1:return [complex(a[0])]
    even=fft(a[::2],inverse);odd=fft(a[1::2],inverse)
    sign=1 if inverse else -1
    out=[0j]*n
    for k in range(n//2):
        w=cmath.exp(sign*2j*cmath.pi*k/n)
        out[k]=even[k]+w*odd[k]
        out[k+n//2]=even[k]-w*odd[k]
    return out

def convolve(a,b):
    n=1
    while n<len(a)+len(b)-1:n*=2
    A=fft(list(a)+[0]*(n-len(a)));B=fft(list(b)+[0]*(n-len(b)))
    out=fft([x*y for x,y in zip(A,B)],inverse=True)
    return [round(x.real/n) for x in out[:len(a)+len(b)-1]]

def direct(a,b):
    out=[0]*(len(a)+len(b)-1)
    for i,x in enumerate(a):
        for j,y in enumerate(b):out[i+j]+=x*y
    return out

assert convolve([1,2],[3,4])==[3,10,8]
assert all(abs(x-y)<1e-9 for x,y in zip(fft([1,2,3,4]),[10,-2+2j,-2,-2-2j]))
rng=Random(5)
for _ in range(400):
    a=[rng.randint(-9,9) for _ in range(rng.randint(1,9))]
    b=[rng.randint(-9,9) for _ in range(rng.randint(1,9))]
    assert convolve(a,b)==direct(a,b)
print('PASS: 400 randomized convolutions compared to direct polynomial multiplication')
