"""Earliest-finish scheduling with a deliberately incorrect alternative."""
INTERVALS=[('A',1,4),('B',2,3),('C',3,5),('D',5,8),('E',6,9),('F',8,10)]
def choose(jobs,key):
    chosen=[];last=-float('inf')
    for job in sorted(jobs,key=key):
        if job[1]>=last:chosen.append(job[0]);last=job[2]
    return chosen
if __name__=='__main__':
    optimal=choose(INTERVALS,lambda x:(x[2],x[1]))
    early=choose(INTERVALS,lambda x:(x[1],x[2]))
    assert optimal==['B','C','D','F'] and len(early)<len(optimal)
    print('Earliest finish:',optimal,'Earliest start:',early)
