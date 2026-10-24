"""Build original Algorithm Design companion assets; only bookmarks/text facts from owned PDF.
No source PDF pages or publisher diagrams are distributed.
"""
from pathlib import Path
import fitz,json,re
ROOT=Path(__file__).parents[1]
BOOK=fitz.open('/mnt/data/kleinberg_jon_tardos_eva_algorithm_design.pdf')
toc=BOOK.get_toc()
index=[];current=None
for level,title,page in toc:
    if level==1 and re.match(r'^\d+\.\s',title):
        if current:index.append(current)
        n=int(re.match(r'^\d+',title).group())
        current={'n':n,'pdf':page,'title':title,'sections':[]}
    elif level==2 and current and re.match(r'^\*?\d+\.\d+',title):
        current['sections'].append({'name':title,'pdfPage':page})
if current:index.append(current)
assert len(index)==13, len(index)

# Detailed original explanations: seven chapters, not copies of source text.
guides=[
{
'n':1,'focus':'Stable Matching: design the algorithm and prove its guarantee','visual':'algo-matching',
'objectives':['Define perfect matching, blocking pair, and stability under strict rankings.','Trace deferred acceptance, including a rejected proposal and a displacement.','Prove termination, stability, and proposer-optimality under the standard assumptions.'],
'concepts':[
['Model the problem precisely','The book introduces two equally sized sets, each with strict complete preferences over the other set. A matching is a collection of disjoint pairs; a perfect matching covers every participant. Instability is not dissatisfaction alone: a blocking pair must prefer each other to their current partners. Stability is a property of the entire matching, not merely its size or the sum of rankings.'],
['Why the obvious acceptance rule fails','Assigning each participant the first partner who accepts can create a blocking pair. The crucial design change in Gale–Shapley is that an acceptance is provisional: each recipient keeps the best offer seen so far and can replace that provisional partner. A rejected proposer never needs to propose to the same recipient again.'],
['Algorithm and invariant','While a free proposer has an untried recipient, that proposer applies to the highest-ranked untried recipient. A recipient keeps the preferred of the new proposer and their current provisional partner. Invariant: each recipient’s provisional partner improves monotonically (according to that recipient’s order) as proposals arrive. No proposer repeats a proposal.'],
['Termination and perfection','Each ordered proposer–recipient pair is proposed at most once, so there are no more than n² proposals. If a proposer were unmatched at termination, that proposer would have proposed to everybody. Every recipient then would have held an engagement, implying n recipients engaged while a proposer remained unmatched: impossible with n proposers. Thus the resulting matching is perfect.'],
['Proof that there is no blocking pair','Suppose proposer m prefers w to assigned wʹ. Then m must have proposed to w before proposing to wʹ. At that earlier step w either rejected m or later replaced m with someone she preferred. Because her held partner can only improve, in the final result w prefers her assigned partner to m. Therefore (m,w) cannot be a blocking pair.'],
['Who benefits from the proposal direction?','Under strict complete preferences, the proposer-oriented algorithm returns each proposer’s best partner among all stable matchings. Recipients instead receive their least-preferred partner among stable matchings. Reversing who proposes can change the result; stable does not mean uniquely fair, globally welfare-maximizing, or the only stable matching.']
],
'pseudocode':'For each proposer m: next[m] ← first name; all are free\nWhile some proposer m is free:\n    w ← highest-ranked person m has not proposed to\n    if w is free: engage(m, w)\n    else if w ranks m above current[w]:\n         release current[w]; engage(m, w)\n    else: reject m\nReturn all engagements',
'proof':'Invariant: a recipient’s held partner never becomes less preferred. Contradiction: any blocking pair (m,w) requires m to prefer w over final partner; hence m proposed to w first, where w rejected or later replaced m with a strictly more preferred proposer. This contradicts w preferring m in the final matching. Termination follows from at most n² distinct proposals.',
'example':'Take A: X>Y>Z, B: Y>X>Z, C: Y>Z>X; recipients X: B>A>C, Y: C>B>A, Z: A>B>C. Follow the six proposals: A→X (held), B→Y (held), C→Y (C replaces B), B→X (B replaces A), A→Y (rejected), A→Z (held). Final matching: (A,Z), (B,X), (C,Y). Check each possible preferred alternative and the recipient’s ranking to verify stability.',
'exercise':'With two proposers P:(U>V), Q:(U>V) and recipients U:(Q>P), V:(P>Q), trace the algorithm and identify whether there is a blocking pair.',
'answer':'P proposes U and is held. Q proposes U and replaces P. P proposes V and is held. Matching (P,V),(Q,U). P would prefer U, but U prefers Q; there is no blocking pair.',
'review':['Prove no proposal repeats and justify the O(n²) bound using a ranking matrix.','Construct a matching with no unmatched people but at least one blocking pair.'],
'quiz':{'q':'Which invariant is essential to the stability argument?','right':'Each recipient only improves the partner they provisionally hold','wrong':['The proposer never changes their ranked list','Every pair is accepted permanently','The algorithm always minimizes total rank sum']}
},
{
'n':2,'focus':'Algorithm Analysis: asymptotic proofs, data structures and costs','visual':'algo-complexity',
'objectives':['Distinguish O, Ω and Θ bounds with constant thresholds.','Count common nested-loop and divide-by-two operations.','Derive the O(n²) time bound of deferred acceptance with an efficient implementation.'],
'concepts':[
['Tractability is about scaling','The book distinguishes polynomial growth from exponential growth because increasing input size changes practical feasibility. Yet input representation, constants, and the size range matter. A linear scan may beat a theoretically superior algorithm for small n, whereas a quadratic algorithm quickly becomes prohibitive for very large inputs.'],
['Three asymptotic statements','f(n)=O(g(n)) means f(n) is eventually bounded above by a constant multiple of g(n). Ω is a corresponding eventual lower bound; Θ gives both bounds simultaneously. These describe functions as n grows, not a particular elapsed wall-clock time. To prove Θ(n²) for a triangular loop, establish both upper and lower bounds on the number of iterations.'],
['Count before applying notation','Consider for i=1..n, j=1..i: one constant-time operation. The inner body executes 1+2+⋯+n=n(n+1)/2 times, yielding Θ(n²). For repeated halving until reaching 1, the number of iterations is ⌊log₂ n⌋+1, yielding Θ(log n). For an outer linear loop containing a logarithmic inner loop, Θ(n log n) results if the bounds are independent.'],
['Stable matching as an implementation problem','An unsophisticated implementation might linearly scan preference lists or compare partners slowly. Precompute rank[w][m], an integer rank for each recipient–proposer pair, for O(1) comparison. Store each proposer’s next untried preference index and a queue of free proposers. At most n² proposals occur; each can be processed in O(1), so total time is O(n²), assuming ranked lists are explicitly stored.'],
['Priority queues and what they buy','A binary heap supports finding a minimum or maximum key in O(1) and insertion/removal in O(log n), with O(n) storage. This differs from maintaining a fully sorted array (fast find-min but costly insertion) or an unsorted array (fast insertion but costly find-min). Match the data structure to the operations the algorithm performs.'],
['How to justify a claimed runtime','Define n and m unambiguously. State representation assumptions (adjacency lists versus matrices, heap versus array). Identify how many times each core operation executes and the cost per operation. Do not silently assume constant-time set membership on unbounded strings or hide sorting in a loop. An experimental timing curve is a sanity check, not a formal complexity proof.']
],
'pseudocode':'count ← 0\nfor i from 1 to n:\n    for j from 1 to i:\n        count ← count + 1\n# Exact count n(n+1)/2, hence Θ(n²)\n\nwhile n > 1:\n    n ← floor(n/2)\n# Θ(log₂ n) iterations',
'proof':'For the triangular loop, T(n)=∑_{i=1}^n i=n(n+1)/2. Since (1/2)n² ≤ T(n) ≤ n² for all n≥1, T(n)=Θ(n²). For deferred acceptance, count distinct proposals (at most n²) and ensure each preference/rank lookup costs O(1).',
'example':'At n=1,000, a quadratic body count n(n+1)/2=500,500; at n=10,000 it is 50,005,000—almost 100 times as large after a ten-fold input increase. For the same sizes, n⌈log₂ n⌉ is roughly 10,000 and 140,000 respectively. These are illustrative operation counts, not measured timings.',
'exercise':'Give a tight bound for a loop that runs n times and, per iteration, halves an integer from n down to 1. What is the body-count expression if every outer iteration begins with the same n?',
'answer':'The inner loop makes Θ(log n) iterations each time, so the total is Θ(n log n). Precisely (for n≥1), n(⌊log₂ n⌋+1) iterations with a typical test-and-halving convention.',
'review':['A big-O upper bound need not be tight; supply an example.','When does an adjacency matrix change a claimed O(n+m) traversal bound?'],
'quiz':{'q':'How many times does the body execute for i=1…n and j=1…i?','right':'n(n+1)/2','wrong':['n²+n+1','2n log₂ n','n(n−1)(n−2)/6']}
},
{
'n':3,'focus':'Graphs: BFS/DFS, bipartiteness, connectivity and topological order','visual':'algo-graph',
'objectives':['Perform BFS and DFS on an adjacency-list graph and explain their distinct frontiers.','Prove BFS shortest path length in an unweighted graph.','Apply two-coloring, directed reachability and topological ordering correctly.'],
'concepts':[
['Specify the graph model','Vertices represent objects; edges encode pairwise relationships. Directed edges have orientation. Weighted graphs attach a cost or length to edges. Adjacency lists use Θ(n+m) storage and permit graph traversal in O(n+m) time; a dense adjacency matrix uses Θ(n²) space and commonly O(n²) traversal checks.'],
['Breadth-first search uses layers','BFS begins with a source s and explores all distance-one neighbors before distance-two neighbors. A FIFO queue preserves the ordering. In an unweighted graph, first discovery of vertex v yields a path with the fewest edges from s. Proof: layers are generated one after another, so a strictly shorter undiscovered path would require an earlier frontier that was already explored.'],
['Depth-first search and recursion','DFS follows one path as far as possible, then backtracks. It can be implemented with a recursion stack or an explicit LIFO stack, marking a vertex at discovery to avoid repeats. DFS is useful for connectivity and exploring search trees; its discovery tree is not generally a shortest-path tree.'],
['Bipartiteness via BFS coloring','Color the source 0 and alternate colors across each traversed edge. If any explored edge links vertices assigned the same color, the graph is not bipartite. A graph is bipartite if and only if it has no odd cycle. For disconnected graphs, repeat the test from every unvisited component.'],
['Directed reachability is asymmetric','A directed path u→v need not imply a directed path v→u. A strongly connected component is a maximal collection of mutually reachable vertices. Applying an undirected connected-components routine to an arbitrary digraph ignores edge direction and does not compute strongly connected components.'],
['Directed acyclic graphs and precedence','A topological order lists each vertex before all its outgoing neighbors. A DAG has at least one vertex with indegree 0; repeatedly removing such vertices generates an order. If vertices remain but none has indegree 0, a directed cycle exists and a topological order is impossible. Kahn’s algorithm runs O(n+m) with adjacency lists.']
],
'pseudocode':'BFS(G,s):\n    dist[s] ← 0; enqueue(s)\n    while queue not empty:\n        u ← dequeue()\n        for every neighbor v of u:\n            if v unvisited:\n                mark v; dist[v] ← dist[u]+1\n                parent[v] ← u; enqueue(v)',
'proof':'BFS correctness uses induction on distance layers: if the queue is processing distance d, each newly discovered neighbor has a path of length d+1, and any shorter path would have passed through a vertex in an earlier layer. Each edge is scanned O(1) times with adjacency lists, giving O(n+m).',
'example':'For undirected edges A–B, A–C, B–D, C–E, D–F, E–F, starting from A: BFS discovers A | B,C | D,E | F, so dist(F)=3. A depth-first traversal may visit A,B,D,F,E,C depending on neighbor order, and the order alone does not prove distance optimality.',
'exercise':'For the triangle A–B, B–C, C–A, assign two colors using BFS. What precise observation proves impossibility?',
'answer':'Color A=0; its neighbors B and C both receive color 1. But edge B–C joins two color-1 vertices. The odd cycle prevents bipartiteness.',
'review':['Show how queue versus stack changes discovery order on the visual graph.','Explain why “strongly connected” is stricter than weakly connected for a digraph.'],
'quiz':{'q':'Which property justifies the unweighted shortest-path guarantee of BFS?','right':'BFS exhausts vertices in nondecreasing discovery distance from the source','wrong':['DFS always visits fewer edges','A weighted graph has no cycles','Every adjacency list is sorted by edge weight']}
},
{
'n':4,'focus':'Greedy Algorithms: interval selection, exchange arguments and shortest paths','visual':'algo-greedy',
'objectives':['Trace earliest-finishing-time interval scheduling.','Prove optimality using a stays-ahead or exchange argument.','Explain why Dijkstra needs nonnegative weights and why weighted scheduling needs DP.'],
'concepts':[
['A plausible local rule is not a proof','The book examines several attractive interval rules that fail, including choosing the shortest interval or the interval with fewest conflicts. The correct cardinality-maximizing rule for independent non-overlapping requests is to select the compatible interval with the earliest finish time. A greedy choice must be justified for this exact objective.'],
['Scheduling by finish time','Sort intervals by nondecreasing finishing time. Choose the first, then repeatedly take the next whose start is at least the last chosen finish. With sorting, this is O(n log n); the selection scan itself is O(n). Handling endpoint equality consistently is part of defining compatibility.'],
['A formal stays-ahead argument','Let greedy finishes be f(g₁), f(g₂),… and any optimal schedule finishes f(o₁), f(o₂),…. The earliest-finish rule gives f(g₁)≤f(o₁). Assuming f(gᵢ)≤f(oᵢ), oᵢ₊₁ starts no earlier than f(oᵢ), hence it is compatible after gᵢ; greedy’s next finish can only be earlier or equal. Induction yields f(gᵢ)≤f(oᵢ) for every i, ruling out an optimum with more intervals than greedy.'],
['Weighted intervals break that greedy rule','If requests have profits, the earliest-finishing interval need not be the highest-valued selection. A long interval worth 100 can dominate several short intervals worth 10 each. Chapter 6 repairs this using optimal-substructure cases and a dynamic program, not by hoping for a new universal local heuristic.'],
['Shortest paths use accumulated costs','Dijkstra selects an unsettled vertex with minimum tentative distance from the source, then relaxes outgoing edges. Its invariant is that selected vertices already have their true shortest-path distance, provided edge weights are nonnegative. Picking the smallest individual edge in the entire graph is not Dijkstra’s algorithm.'],
['Other greedy structures need different proofs','Minimum spanning trees rely on safe edges across cuts and the cut property. Huffman coding exploits a structural exchange between low-frequency symbols and leaves near maximum depth. A shared greedy pattern does not make these proofs interchangeable.']
],
'pseudocode':'sort intervals by increasing finish time\nchosen ← [] ; lastFinish ← −∞\nfor request (s,f) in sorted intervals:\n    if s ≥ lastFinish:\n        append request to chosen\n        lastFinish ← f\nreturn chosen',
'proof':'Stays-ahead: if greedy’s i-th finish is no later than any optimal solution’s i-th finish, then the (i+1)-st interval from that optimal schedule is feasible after greedy’s i-th, so greedy cannot finish later at step i+1. Thus it chooses at least as many intervals as an optimal solution.',
'example':'Intervals A=[1,4], B=[2,3], C=[3,5], D=[5,8], E=[6,9], F=[8,10]. Earliest finish gives B,C,D,F, four requests. Choosing A first would block B and C; comparing by start time misses the four-request schedule. Endpoint equality counts as compatible here.',
'exercise':'Give a counterexample to “always choose the interval with earliest start time” for maximum number of non-overlapping intervals.',
'answer':'A=[0,10], B=[1,2], C=[2,3], D=[3,4] is enough. Earliest-start takes only A; earliest-finish takes B,C,D, three intervals.',
'review':['Write the invariant that makes a greedy algorithm provably optimal.','Why does even one negative edge invalidate the usual Dijkstra proof?'],
'quiz':{'q':'Which scheduling rule is optimal for maximizing the number of compatible intervals?','right':'Choose the compatible interval with earliest finish time','wrong':['Choose the longest available interval','Choose the earliest-starting interval','Choose the interval with the greatest profit per hour']}
},
{
'n':5,'focus':'Divide and Conquer: recurrences, merge sort and counting inversions','visual':'algo-divide',
'objectives':['Derive merge sort runtime from its recurrence.','Count inversions in O(n log n) using a modified merge.','Recognize when geometric work per level changes a recurrence.'],
'concepts':[
['Divide, solve, combine','A divide-and-conquer algorithm breaks one problem into smaller instances, recursively solves them, and assembles the results. It is not automatically faster than iteration: the cost of creating subproblems and merging answers determines the recurrence. An effective design identifies the information needed at combine time.'],
['Mergesort as the first recurrence','Split n items into two halves, sort each, and merge their sorted sequences in linear time. For powers of two, T(n)=2T(n/2)+cn with T(1)=O(1). At each of log₂ n levels there are 2ʲ subproblems each with roughly n/2ʲ combine work, totaling cn per level; hence T(n)=Θ(n log n).'],
['Proof of merging correctness','Maintain two pointers into already sorted halves. The smallest remaining item overall must be the smaller of the two pointed-to values; output that value and advance its pointer. The invariant is that the output prefix is sorted and contains the smallest elements of the union of the remaining and output elements. Induction proves the merge is sorted and complete.'],
['Counting inversions while merging','An inversion is a pair i<j with aᵢ>aⱼ. Every inversion lies in the left half, right half, or crosses the halves. During merging, when the next right item is less than the current left item, it forms inversions with every unmerged left item. Add their count in O(1) rather than checking them one by one.'],
['Recurrence trees require arithmetic','T(n)=2T(n/2)+n² behaves differently from mergesort: level j costs 2ʲ(n/2ʲ)²=n²/2ʲ. The sum is a geometric series dominated by its root, giving Θ(n²). Conversely, a recurrence with heavy leaf work may be dominated near the bottom.'],
['Other applications of geometric decomposition','Closest-pair algorithms exploit a strip argument to avoid checking all cross-half pairs. Fast integer multiplication can reduce the number of recursive multiplications. FFT-based convolution uses structure in roots of unity to achieve near-linearithmic time. The common pattern is not the exact same combine routine.']
],
'pseudocode':'sortAndCount(a):\n    if length(a) ≤ 1: return (a,0)\n    (L,x) ← sortAndCount(leftHalf(a))\n    (R,y) ← sortAndCount(rightHalf(a))\n    (M,z) ← mergeAndCountCross(L,R)\n    return (M,x+y+z)\n\nDuring merge, when R[j] < L[i]:\n    crossCount += length(L)−i',
'proof':'The recursive outputs contain correctly sorted halves and their internal inversion counts by induction. Each cross inversion has exactly one element in each half and is counted exactly once, when its right-hand element is emitted before the remaining greater left-hand elements. Since merge is linear, T(n)=2T(n/2)+O(n)=O(n log n).',
'example':'Array [3,1,2,4] has exactly two inversions: (3,1) and (3,2). Split into [3,1] and [2,4]; the left merge counts (3,1). The final merge counts one cross inversion (3,2). Sorted result [1,2,3,4], count 2.',
'exercise':'Find the inversion count of [4,3,2,1], and give the asymptotic cost of naive pair checking versus merge-based counting.',
'answer':'There are 6 inversions (every pair of positions is inverted). Naive checking costs Θ(n²); the recursive counting merge costs Θ(n log n).',
'review':['Prove the running time by adding work per recursion level.','Why must equal elements not count as inversions?'],
'quiz':{'q':'If T(n)=2T(n/2)+Θ(n), what is the tight bound?','right':'Θ(n log n)','wrong':['Θ(n²)','Θ(log n)','Θ(2ⁿ)']}
},
{
'n':6,'focus':'Dynamic Programming: weighted scheduling, states and reconstruction','visual':'algo-dp',
'objectives':['Define optimal subproblems and the weighted interval scheduling recurrence.','Fill a DP table using p(j) predecessor indices.','Reconstruct an optimal chosen set and distinguish it from the scalar optimum.'],
'concepts':[
['What changes when intervals carry values?','Sorting by earliest finish is correct for maximizing the count of compatible intervals but not generally for maximizing total value. Weighted interval scheduling is a deliberate bridge from Chapter 4’s greedy examples to the need for dynamic programming. For each interval j, sort by end time and record p(j), the last interval ending no later than j starts.'],
['Define a state with an unambiguous meaning','OPT(j) is the maximum total value obtainable using only the first j intervals in sorted finish order, with OPT(0)=0. An optimal selection either excludes interval j (giving OPT(j−1)) or includes it. If included, all other selected intervals must lie among the first p(j), giving vⱼ+OPT(p(j)).'],
['The recurrence and its proof','OPT(j)=max{OPT(j−1), vⱼ+OPT(p(j))}. This is exhaustive because any optimal solution either contains j or does not. For the include case, if its earlier intervals were not themselves optimal for subproblem p(j), replacing them with a better compatible subset would improve the total, contradicting optimality. Induction establishes that the recurrence computes OPT for every j.'],
['Memoization prevents repeated subproblems','A literal recursive implementation may recompute the same OPT(j) many times, producing exponential blowup in constructed cases. Store each answer once (memoization), or fill M[0…n] iteratively by increasing j. With predecessors computed and stored, the DP phase needs O(n) time and O(n) space. Binary search of ends yields O(n log n) predecessor construction after sorting.'],
['A numeric table makes reasoning inspectable','Use these five sorted intervals: J1=(1,3,5), J2=(2,5,6), J3=(4,6,5), J4=(6,8,4), J5=(5,9,9). Then p=[0,0,1,3,2]. Values M[0…5]=[0,5,6,10,14,15]. The maximum value 15 comes from J2+J5, not from selecting the largest number of requests.'],
['Recover an actual schedule','Starting at j=n, compare vⱼ+M[p(j)] with M[j−1]. If taking j is at least as good, output j and continue at p(j); otherwise continue at j−1. Ties may produce multiple optimal schedules. This reconstruction is O(n) after the table is available.'],
['Beyond one-dimensional states','Segmented least squares needs a choice of last segment; knapsack adds a capacity dimension; RNA secondary structure and sequence alignment involve interval or two-dimensional states. State selection and dependency ordering matter more than memorizing a recurrence from an unrelated problem.']
],
'pseudocode':'sort jobs by finish time\ncompute predecessor p[j] for each job j\nM[0] ← 0\nfor j from 1 to n:\n    M[j] ← max(M[j−1], value[j]+M[p[j]])\n\nreconstruct(j):\n    if j=0: return []\n    if value[j]+M[p[j]] >= M[j−1]:\n        return reconstruct(p[j]) plus [j]\n    return reconstruct(j−1)',
'proof':'For any optimal solution among first j jobs, partition on whether j is present. If absent, its value cannot exceed OPT(j−1). If present, all other jobs lie in the feasible predecessor set ending by start(j), so their total cannot exceed OPT(p(j)). Both cases are constructible; taking their maximum is optimal.',
'example':'M0=0. J1: max(0,5)=5. J2: max(5,6)=6. J3: max(6,5+M1=10)=10. J4: max(10,4+M3=14)=14. J5: max(14,9+M2=15)=15. Traceback chooses J5 then J2, reaching total 15. The plot lets you move across each table update.',
'exercise':'If a sixth job J6=(9,10,3) is added, what is p(6), M(6), and the reconstructed optimal schedule?',
'answer':'p(6)=5 because J5 finishes at 9, exactly when J6 begins. M(6)=max(M5=15,3+M5=18)=18, with optimal schedule J2,J5,J6.',
'review':['Differentiate the recurrence from the data structure holding memoized results.','Why must p(j) be based on finish times rather than start times?'],
'quiz':{'q':'In weighted interval scheduling, what is the correct recurrence?','right':'OPT(j)=max(OPT(j−1),vⱼ+OPT(p(j)))','wrong':['OPT(j)=OPT(j−1)+vⱼ for every j','OPT(j)=min(OPT(j−1),p(j))','OPT(j)=vⱼ·OPT(p(j))']}
},
{
'n':7,'focus':'Network Flow: residual graphs, augmenting paths and min-cut certificates','visual':'algo-flow',
'objectives':['Define capacity feasibility, conservation and flow value.','Trace augmenting paths using residual capacity, including backward edges.','Use a min-cut certificate to justify optimality.'],
'concepts':[
['Capacities and conserved flow','A directed network has distinguished source s, sink t, and nonnegative capacities c(e). A feasible flow satisfies 0≤f(e)≤c(e), and for every other vertex inflow equals outflow. Flow value is net outflow at s (equal to net inflow at t). Summing capacities of any s–t cut gives an upper bound on total flow.'],
['Why a residual graph is essential','For a current flow, each original edge u→v with spare capacity has a residual forward edge capacity c−f. Each used original edge also provides a residual backward edge v→u capacity f, allowing the algorithm to undo and reroute prior assignments. Ignoring reverse residual edges can trap an implementation in a feasible but nonmaximal state.'],
['Ford–Fulkerson augmentation','Start with zero flow. As long as the residual graph contains an s–t path, send the minimum residual capacity along that path. Update forward and backward residual capacities. The flow remains feasible and its value increases by the path bottleneck. For integer capacities, each augmentation adds at least one unit, so the elementary implementation terminates; worst-case running time depends on path choices and total flow value.'],
['The max-flow/min-cut equality','If no residual s–t path remains, let A contain vertices reachable from s in the residual graph, and let B be all others. Every original edge crossing A→B is saturated, while every edge crossing B→A has zero flow; otherwise a residual crossing edge would exist. The flow value therefore equals the capacity of this cut, proving both a maximum flow and a minimum cut.'],
['Edmonds–Karp fixes path selection','Choosing shortest augmenting paths by BFS guarantees a polynomial O(VE²) running time, independent of integer capacity magnitudes. This is not the same guarantee as an arbitrary-path Ford–Fulkerson procedure. Other flow algorithms, including preflow–push, manage flow state differently.'],
['Applications are modeling reductions','Bipartite matching can be modeled with unit-capacity edges through a flow network. Disjoint-path and allocation problems also translate into flow constraints. The difficult part is proving that a feasible flow corresponds to a valid solution of the original problem in both directions.'],
['A complete certificate is checkable','To verify an alleged maximum flow, check edge capacities and conservation, compute its value, then exhibit an s–t cut with equal capacity. Agreement is decisive due to weak duality (flow value ≤ every cut capacity) and the max-flow/min-cut theorem, not because an example “looks saturated.”']
],
'pseudocode':'f(e) ← 0 for all original edges\nwhile residual graph has an s→t path P:\n    δ ← min residualCapacity(e) over edges in P\n    for each residual edge e in P:\n        augment f by δ, subtract on reversed original arcs\nreturn f\n\nTo certify optimality:\n    A ← vertices reachable from s in final residual graph\n    B ← V minus A\n    verify value(f) = cutCapacity(A,B)',
'proof':'For any feasible flow and any s–t cut (A,B), conservation implies value(f)=flow(A→B)−flow(B→A)≤capacity(A→B). When the residual s–t path does not exist, reachability defines a cut where forward crossing edges are saturated and reverse crossing edges carry no flow. Equality holds, so the current flow attains the universal upper bound.',
'example':'Network capacities: s→a=3, s→b=2, a→b=1, a→t=2, b→t=3. Augment s–a–t by 2, s–b–t by 2, then s–a–b–t by 1. Value=5. The cut {s} | {a,b,t} has capacity 3+2=5, certifying maximum flow.',
'exercise':'For capacities s→u=4, u→t=2, s→t=1, what is the maximum possible flow and a matching min-cut?',
'answer':'Value 3: send 2 via s→u→t and 1 directly s→t. Cut {s,u}|{t} has capacity 2+1=3. The unused 2 units on s→u cannot reach t.',
'review':['What backward residual edge allows an earlier assignment to be undone?','Distinguish basic Ford–Fulkerson from Edmonds–Karp complexity guarantees.'],
'quiz':{'q':'What certifies that a feasible flow is maximum?','right':'A source–sink cut whose capacity equals that flow’s value','wrong':['Every original edge is saturated','A DFS traversal has visited all vertices','All internal vertices have positive flow']}
}
]
for g in guides:
 if g['n']==1:
  g['proof']+=' Proposer-optimality sketch: assume a stable matching S and take the earliest moment when any proposer m is rejected by their S-partner w. At that moment w prefers the proposer m′ she now holds. By the choice of the earliest such rejection, m′ has not been rejected by their S-partner w′ and therefore prefers w to w′. In S, w is assigned m, yet w prefers m′; together (m′,w) blocks S, contradiction. Thus no proposer is rejected by any partner achievable in a stable matching.'
 ch=index[g['n']-1];g['pdf']=ch['pdf'];g['sections']=[x['name'] for x in ch['sections']]
 assert g['pdf']>0 and g['concepts']
# strip source-specific labels not literally checked against headings? use bookmark source only
assets=ROOT/'assets'
(assets/'algo-source-map.js').write_text('/* Extracted from supplied edition PDF bookmarks; indexed != taught. */\nwindow.BOOK_SOURCE_MAP.algo='+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(assets/'algo-guides.js').write_text('/* Original guided explanations. Not complete textbook chapters. */\nwindow.BOOK_MASTERCLASS.algo='+json.dumps(guides,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(assets/'algo-course.js').write_text('''/* Course integrated into normal learning, including the longform proof, trace and practice. */
(function(){'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guide=window.BOOK_MASTERCLASS.algo;
window.ALGO_COURSE={
  id:'algorithm-design',title:'Algorithm Design · Kleinberg & Tardos',short:'Algorithms',tabLabel:'Algorithms',category:'foundations',accent:'#6d58af',symbol:'AD',tag:'New · Source-grounded',level:'Intermediate → advanced',lang:'none',
  subtitle:'Seven proof-driven chapters with step-by-step visual traces, precise complexity bounds, worked counterexamples and source-linked reading.',
  outcome:'Analyze algorithm design strategies, produce correctness proofs and reason about complexity and counterexamples.',
  reference:'Based on Kleinberg & Tardos, Algorithm Design. Seven source-checked chapters taught; chapters 8–13 remain indexed, not taught.',
  learn:['Stable matching: blocking pairs, termination, stability and proposer-optimality','Asymptotic complexity with explicit counts and representation assumptions','BFS/DFS, graph layers, bipartiteness and topological ordering','Greedy interval selection and exchange arguments','Divide-and-conquer recurrences and inversion counting','Weighted interval DP state and reconstruction','Residual network paths and max-flow/min-cut certificates'],
  parts:['Models and proofs','Graph structures','Greedy and recursion','Optimization with DP','Flows and certificates'],
  lessons:guide.map((b,i)=>{let q=b.quiz, correct=(i*2+1)%4;let opts=q.wrong.slice();opts.splice(correct,0,q.right);return {
    id:'chapter-'+b.n,part:[0,0,1,2,2,3,4][i],chapter:'Chapter '+b.n,title:b.focus,minutes:55,
    goal:b.objectives.join(' '),sections:[...b.concepts.map(([h,p])=>({h,html:'<p>'+esc(p)+'</p>'})),
      {h:'Formal correctness argument',html:'<p>'+esc(b.proof)+'</p><p><a href="#/book/algo/chapter/'+b.n+'">Open interactive trace and full worked example →</a></p>'},
      {h:'Pseudocode and numerical reasoning',html:'<pre class="algo-code">'+esc(b.pseudocode)+'</pre><p>'+esc(b.example)+'</p>'},
      {h:'Primary-source reading',html:'<p>Uploaded edition PDF p. '+b.pdf+'. The source-section map contains '+window.BOOK_SOURCE_MAP.algo[i].sections.length+' exact bookmark headings and PDF page locators. These locators identify reading, not completed coverage. <a href="#/book/algo/chapter/'+b.n+'">Open chapter source navigation →</a></p>'}
    ],lab:null,widget:null,
    quiz:[{q:q.q,options:opts,correct,why:q.right+'. '+b.review[0]}]
  };})
};
})();
''',encoding='utf-8')
# authored original small, selective source figure locators (view via local PDF only)
figures={2:[{'figure':'2.3','pdfPage':86,'caption':'Heap representation as a binary tree and array'}],3:[{'figure':'3.3','pdfPage':107,'caption':'Construction of a breadth-first search tree'},{'figure':'3.5','pdfPage':111,'caption':'Construction of a depth-first search tree'}],5:[{'figure':'5.4','pdfPage':248,'caption':'Inversions represented by crossing line segments'},{'figure':'5.5','pdfPage':250,'caption':'Counting cross inversions during merge'}],6:[{'figure':'6.5','pdfPage':286,'caption':'Iterative weighted interval scheduling with the DP array'}],1:[{'figure':'1.1','pdfPage':30,'caption':'An example of an instability in a perfect matching'},{'figure':'1.2','pdfPage':32,'caption':'An intermediate state of Gale–Shapley deferred acceptance'}],4:[{'figure':'4.2','pdfPage':145,'caption':'Interval scheduling algorithm sample run'},{'figure':'4.3','pdfPage':146,'caption':'Illustration for the stays-ahead proof'}],7:[{'figure':'7.5','pdfPage':375,'caption':'Reachable-side cut used in max-flow/min-cut proof'}]}
figlist=[{'n':g['n'],'figures':figures.get(g['n'],[])} for g in guides]
(assets/'algo-figure-map.js').write_text('/* Manually inspected PDF page-text captions; the source image is NOT included. */\nwindow.BOOK_FIGURE_MAP.algo='+json.dumps(figlist,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(assets/'textbook-atlas-data.js').write_text((assets/'textbook-atlas-data.js').read_text().replace('"id":"algo","title"','"id":"algo","title"'),encoding='utf-8')
# Inline update book link for specific algo entry from parsed JSON
p=assets/'textbook-atlas-data.js'; s=p.read_text(); anchor='"id":"algo","title":"Algorithm Design"';
assert anchor in s
s=s.replace(anchor,'"id":"algo","title":"Algorithm Design"',1)
# add courseId field if null, simplest regex on exact algo segment
s=s.replace('"id":"algo","title":"Algorithm Design","authors":"Kleinberg · Tardos","category":"Algorithms","courseId":null', '"id":"algo","title":"Algorithm Design","authors":"Kleinberg · Tardos","category":"Algorithms","courseId":"algorithm-design"')
p.write_text(s,encoding='utf-8')
# coverage report file
with (ROOT/'ALGORITHM_DESIGN_SOURCE_MAP_v5.json').open('w',encoding='utf-8') as f:json.dump({'edition':'Kleinberg & Tardos Algorithm Design, uploaded PDF (864 pages)','chapters':index,'taught_chapters':[g['n'] for g in guides]},f,ensure_ascii=False,indent=2)
print('Prepared',len(guides),'guided chapters;',len(index),'indexed chapters;',sum(len(x['sections']) for x in index),'primary PDF section bookmark locators')
