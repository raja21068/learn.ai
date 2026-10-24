"""Kleinberg–Tardos 4.2: EDD minimizes maximum lateness; authored data."""
from itertools import permutations
from random import Random

def score(order):
    elapsed=0; maximum=0
    for name,processing,deadline in order:
        elapsed+=processing
        maximum=max(maximum,max(0,elapsed-deadline))
    return maximum

def earliest_deadline(jobs):
    return sorted(jobs,key=lambda x:(x[2],x[0]))

sample=[('A',3,7),('B',2,3),('C',4,9),('D',1,4)]
assert score(earliest_deadline(sample))==1
assert score(sample)==6
rng=Random(42)
for n in range(2,7):
    for run in range(12):
        jobs=[(str(i),rng.randint(1,5),rng.randint(2,19)) for i in range(n)]
        optimal=min(map(score,permutations(jobs)))
        assert score(earliest_deadline(jobs))==optimal,(jobs,optimal)
print('PASS: earliest-deadline-first is optimal on 60 randomized exhaustive cases')
