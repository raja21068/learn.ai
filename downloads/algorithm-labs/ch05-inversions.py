"""Count strict inversions in O(n log n) using merge and count."""
def sort_count(a):
    if len(a)<=1:return a[:],0
    mid=len(a)//2;l,lc=sort_count(a[:mid]);r,rc=sort_count(a[mid:]);i=j=0;out=[];cross=0
    while i<len(l) and j<len(r):
        if l[i]<=r[j]:out.append(l[i]);i+=1
        else:out.append(r[j]);cross+=len(l)-i;j+=1
    out.extend(l[i:]);out.extend(r[j:])
    return out,lc+rc+cross
if __name__=='__main__':
    assert sort_count([3,1,2,4])==([1,2,3,4],2)
    assert sort_count([4,3,2,1])==([1,2,3,4],6)
    assert sort_count([1,1])==([1,1],0)
    print('Inversion counts verified')
