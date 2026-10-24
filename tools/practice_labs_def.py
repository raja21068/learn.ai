"""Definitions of the hands-on algorithm labs of the Practice hub.

Each lab is an ORIGINAL task: the prompt, starter, hidden test and sample solution were written for this site. The `reference`
points at the matching MIT-licensed file of TheAlgorithms/Python (bundled under third_party/ with its licence) for readers who want
to compare. The hidden tests compare the learner's function with brute force or an independent reference on seeded random
inputs, never with the upstream code. Tests/solutions use only the Python standard library so they run in Pyodide.
tests/practice-labs.py proves, for every lab, that the sample solution passes and the starter and several wrong variants fail."""

R = 'https://github.com/TheAlgorithms/Python/blob/master/'

def lab(id, title, track, level, concept, prompt, fn, starter, solution, test, hints, ref, mutants=()):
    return dict(id=id, title=title, track=track, level=level, concept=concept, prompt=prompt, fn=fn, starter=starter.strip('\n') + '\n',
                solution=solution.strip('\n') + '\n', test=test.strip('\n') + '\n', hints=list(hints), mutants=[m.strip('\n') + '\n' for m in mutants],
                reference={'repo': 'TheAlgorithms/Python', 'path': ref, 'url': R + ref, 'local': 'third_party/thealgorithms-python/' + ref, 'license': 'MIT'})

SORT_TEST = '''
import random
rnd = random.Random(11)
cases = [[], [1], [2, 1], [3, 3, 3], [5, -2, 9, 0, -2], list(range(10)), list(range(10, 0, -1))]
cases += [[rnd.randint(-20, 20) for _ in range(rnd.randint(0, 40))] for _ in range(150)]
for case in cases:
    original = list(case)
    result = FN(case)
    assert result == sorted(original), f"FN({original}) returned {result}, expected {sorted(original)}"
    assert case == original, "FN must not change the list it is given (return a new list)"
'''

LABS = [
 lab('bubble-sort', 'Bubble sort', 'Sorting', 'Beginner', 'Repeatedly swap neighbours that are out of order; each pass bubbles the largest item to the end.',
     'Write <code>bubble_sort(items)</code> that returns a <b>new</b> sorted list (ascending) using bubble sort. Do not call <code>sorted()</code> or <code>.sort()</code>, and do not change the input list.',
     'bubble_sort',
     'def bubble_sort(items):\n    result = list(items)\n    # TODO: repeat passes; swap result[i] and result[i + 1] when they are out of order.\n    # Stop early when a whole pass makes no swap.\n    return result\n',
     'def bubble_sort(items):\n    result = list(items)\n    n = len(result)\n    for end in range(n - 1, 0, -1):\n        swapped = False\n        for i in range(end):\n            if result[i] > result[i + 1]:\n                result[i], result[i + 1] = result[i + 1], result[i]\n                swapped = True\n        if not swapped:\n            break\n    return result\n',
     SORT_TEST.replace('FN', 'bubble_sort'),
     ['A pass compares result[i] with result[i + 1] for i from 0 up to the last unsorted position.', 'After one pass the largest remaining item is at the end, so each pass can stop one position earlier.'],
     'sorts/bubble_sort.py',
     ['def bubble_sort(items):\n    return list(items)\n', 'def bubble_sort(items):\n    items.sort()\n    return items\n', 'def bubble_sort(items):\n    return sorted(items)[::-1]\n']),
 lab('insertion-sort', 'Insertion sort', 'Sorting', 'Beginner', 'Grow a sorted prefix by inserting each next item into its place.',
     'Write <code>insertion_sort(items)</code> that returns a new ascending list using insertion sort (no <code>sorted()</code> or <code>.sort()</code>), leaving the input unchanged.',
     'insertion_sort',
     'def insertion_sort(items):\n    result = list(items)\n    # TODO: for each position i, move result[i] left while the item before it is larger.\n    return result\n',
     'def insertion_sort(items):\n    result = list(items)\n    for i in range(1, len(result)):\n        value = result[i]\n        j = i - 1\n        while j >= 0 and result[j] > value:\n            result[j + 1] = result[j]\n            j -= 1\n        result[j + 1] = value\n    return result\n',
     SORT_TEST.replace('FN', 'insertion_sort'),
     ['Keep value = result[i], then shift larger items one place right until you find the gap.', 'Write value into the gap after the loop.'],
     'sorts/insertion_sort.py',
     ['def insertion_sort(items):\n    return list(items)\n', 'def insertion_sort(items):\n    result = list(items)\n    for i in range(1, len(result)):\n        if result[i] < result[i - 1]:\n            result[i], result[i - 1] = result[i - 1], result[i]\n    return result\n']),
 lab('selection-sort', 'Selection sort', 'Sorting', 'Beginner', 'Find the smallest remaining item and swap it into the next position.',
     'Write <code>selection_sort(items)</code> that returns a new ascending list using selection sort (no <code>sorted()</code> or <code>.sort()</code>), leaving the input unchanged.',
     'selection_sort',
     'def selection_sort(items):\n    result = list(items)\n    # TODO: for each position i, find the index of the smallest item in result[i:] and swap it to i.\n    return result\n',
     'def selection_sort(items):\n    result = list(items)\n    for i in range(len(result)):\n        smallest = i\n        for j in range(i + 1, len(result)):\n            if result[j] < result[smallest]:\n                smallest = j\n        result[i], result[smallest] = result[smallest], result[i]\n    return result\n',
     SORT_TEST.replace('FN', 'selection_sort'),
     ['The inner loop only needs to remember the index of the smallest value seen so far.', 'Swap once per outer iteration, after the inner loop.'],
     'sorts/selection_sort.py',
     ['def selection_sort(items):\n    return list(items)\n', 'def selection_sort(items):\n    result = list(items)\n    for i in range(len(result)):\n        biggest = max(range(i, len(result)), key=lambda k: result[k])\n        result[i], result[biggest] = result[biggest], result[i]\n    return result\n']),
 lab('merge-sort', 'Merge sort', 'Sorting', 'Intermediate', 'Divide and conquer: sort both halves, then merge two sorted lists in linear time.',
     'Write <code>merge_sort(items)</code> that returns a new ascending list using merge sort (recursion plus a merge step). Do not call <code>sorted()</code>, <code>.sort()</code> or <code>heapq.merge</code>.',
     'merge_sort',
     'def merge_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    # TODO: split in two halves, sort each recursively, then merge them.\n    return list(items)\n',
     'def merge_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    mid = len(items) // 2\n    left, right = merge_sort(items[:mid]), merge_sort(items[mid:])\n    out, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i]); i += 1\n        else:\n            out.append(right[j]); j += 1\n    return out + left[i:] + right[j:]\n',
     SORT_TEST.replace('FN', 'merge_sort') + '''
import sys
big = [rnd.randint(0, 10**6) for _ in range(20000)]
assert merge_sort(big) == sorted(big), "merge_sort must handle 20 000 items (is the merge linear?)"
''',
     ['Merging: keep one index in each sorted half and always take the smaller front item.', 'When one half runs out, append the rest of the other half.'],
     'sorts/merge_sort.py',
     ['def merge_sort(items):\n    return list(items)\n', 'def merge_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    mid = len(items) // 2\n    return merge_sort(items[:mid]) + merge_sort(items[mid:])\n']),
 lab('quick-sort', 'Quick sort', 'Sorting', 'Intermediate', 'Pick a pivot, partition into smaller and larger parts, sort the parts recursively.',
     'Write <code>quick_sort(items)</code> that returns a new ascending list using quick sort (a pivot and recursion). Duplicates must survive. No <code>sorted()</code> or <code>.sort()</code>.',
     'quick_sort',
     'def quick_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    pivot = items[len(items) // 2]\n    # TODO: three groups: less than, equal to, greater than the pivot. Sort the outer two recursively.\n    return list(items)\n',
     'def quick_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    pivot = items[len(items) // 2]\n    less = [x for x in items if x < pivot]\n    equal = [x for x in items if x == pivot]\n    more = [x for x in items if x > pivot]\n    return quick_sort(less) + equal + quick_sort(more)\n',
     SORT_TEST.replace('FN', 'quick_sort') + '''
many_equal = [5] * 5000 + [1] * 5000
assert quick_sort(many_equal) == [1] * 5000 + [5] * 5000, "lots of equal items: keep them all and avoid endless recursion"
''',
     ['Put items equal to the pivot in their own group so they are never lost or re-sorted.', 'The answer is quick_sort(less) + equal + quick_sort(greater).'],
     'sorts/quick_sort.py',
     ['def quick_sort(items):\n    return list(items)\n', 'def quick_sort(items):\n    if len(items) <= 1:\n        return list(items)\n    pivot = items[0]\n    return quick_sort([x for x in items[1:] if x < pivot]) + [pivot] + quick_sort([x for x in items[1:] if x > pivot])\n']),
 lab('heap-sort', 'Heap sort', 'Sorting', 'Intermediate', 'Build a max-heap in the array, then repeatedly move the maximum to the end.',
     'Write <code>heap_sort(items)</code> that returns a new ascending list using a binary heap that <b>you</b> maintain in the list (sift-down). Do not use <code>heapq</code>, <code>sorted()</code> or <code>.sort()</code>.',
     'heap_sort',
     'def heap_sort(items):\n    a = list(items)\n    n = len(a)\n    def sift_down(root, size):\n        # TODO: move a[root] down until both children are not larger.\n        pass\n    # TODO: heapify (sift_down from the last parent to 0), then repeatedly swap a[0] with the last heap item.\n    return a\n',
     'def heap_sort(items):\n    a = list(items)\n    n = len(a)\n    def sift_down(root, size):\n        while True:\n            child = 2 * root + 1\n            if child >= size:\n                return\n            if child + 1 < size and a[child + 1] > a[child]:\n                child += 1\n            if a[root] >= a[child]:\n                return\n            a[root], a[child] = a[child], a[root]\n            root = child\n    for i in range(n // 2 - 1, -1, -1):\n        sift_down(i, n)\n    for end in range(n - 1, 0, -1):\n        a[0], a[end] = a[end], a[0]\n        sift_down(0, end)\n    return a\n',
     SORT_TEST.replace('FN', 'heap_sort'),
     ['The children of index i are 2*i + 1 and 2*i + 2.', 'Heapify from index n // 2 - 1 down to 0, then shrink the heap by one each round.'],
     'sorts/heap_sort.py',
     ['def heap_sort(items):\n    return list(items)\n', 'def heap_sort(items):\n    a = list(items)\n    for i in range(len(a) // 2 - 1, -1, -1):\n        c = 2 * i + 1\n        if c < len(a) and a[c] > a[i]:\n            a[i], a[c] = a[c], a[i]\n    return a\n']),
 lab('counting-sort', 'Counting sort', 'Sorting', 'Intermediate', 'For small integer keys, count occurrences instead of comparing items: O(n + k).',
     'Write <code>counting_sort(items)</code> for a list of <b>non-negative integers</b>: return a new ascending list by counting occurrences. No <code>sorted()</code> or <code>.sort()</code>.',
     'counting_sort',
     'def counting_sort(items):\n    if not items:\n        return []\n    # TODO: counts[v] = how many times v occurs, for v in 0..max(items); then rebuild the list in order.\n    return list(items)\n',
     'def counting_sort(items):\n    if not items:\n        return []\n    counts = [0] * (max(items) + 1)\n    for value in items:\n        counts[value] += 1\n    out = []\n    for value, c in enumerate(counts):\n        out.extend([value] * c)\n    return out\n',
     '''
import random
rnd = random.Random(5)
assert counting_sort([]) == []
assert counting_sort([0]) == [0]
for _ in range(200):
    data = [rnd.randint(0, 30) for _ in range(rnd.randint(0, 60))]
    copy = list(data)
    assert counting_sort(data) == sorted(copy), f"counting_sort({copy}) is wrong"
    assert data == copy, "do not change the input list"
wide = [rnd.randint(0, 5000) for _ in range(3000)]
assert counting_sort(wide) == sorted(wide)
''',
     ['The counts list needs max(items) + 1 slots.', 'Rebuild the answer with out.extend([value] * counts[value]) for value in order.'],
     'sorts/counting_sort.py',
     ['def counting_sort(items):\n    return list(items)\n', 'def counting_sort(items):\n    if not items:\n        return []\n    counts = [0] * max(items)\n    for v in items:\n        counts[v - 1] += 1\n    return [v + 1 for v, c in enumerate(counts) for _ in range(c)]\n']),
 lab('binary-search', 'Binary search', 'Searching', 'Beginner', 'Halve the search range each step on a sorted list: O(log n).',
     'Write <code>binary_search(sorted_items, target)</code> returning an index where <code>target</code> occurs in the ascending list, or <code>-1</code> if it is absent. It must be logarithmic: no <code>in</code>, <code>.index()</code> or loop over every item.',
     'binary_search',
     'def binary_search(sorted_items, target):\n    low, high = 0, len(sorted_items) - 1\n    # TODO: while low <= high, look at the middle item and discard the half that cannot hold target.\n    return -1\n',
     'def binary_search(sorted_items, target):\n    low, high = 0, len(sorted_items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if sorted_items[mid] == target:\n            return mid\n        if sorted_items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n',
     '''
import random
rnd = random.Random(3)
assert binary_search([], 1) == -1
assert binary_search([4], 4) == 0 and binary_search([4], 5) == -1
for _ in range(300):
    data = sorted(rnd.randint(-30, 30) for _ in range(rnd.randint(0, 40)))
    for target in range(-32, 33):
        i = binary_search(data, target)
        if target in data:
            assert 0 <= i < len(data) and data[i] == target, f"binary_search({data}, {target}) returned {i}"
        else:
            assert i == -1, f"{target} is not in {data}: expected -1, got {i}"
class Counting:
    reads = 0
    def __init__(self, n):
        self.n = n
    def __len__(self):
        return self.n
    def __getitem__(self, k):
        if isinstance(k, slice):
            idx = range(*k.indices(self.n)); Counting.reads += len(idx)
            return [2 * i for i in idx]
        if not -self.n <= k < self.n:
            raise IndexError(k)
        Counting.reads += 1
        return 2 * (k % self.n)
big = Counting(1_000_000)                      # the items are 0, 2, 4, ..., 1_999_998
assert binary_search(big, 1_999_998) == 999_999
assert Counting.reads < 100, f"{Counting.reads} items looked at: binary search should need about 21"
''',
     ['Compare with the middle item: equal means found; smaller means the target can only be to the right.', 'Move low = mid + 1 or high = mid - 1 so the range always shrinks.'],
     'searches/binary_search.py',
     ['def binary_search(sorted_items, target):\n    for i, v in enumerate(sorted_items):\n        if v == target:\n            return i\n    return -1\n', 'def binary_search(sorted_items, target):\n    low, high = 0, len(sorted_items) - 1\n    while low < high:\n        mid = (low + high) // 2\n        if sorted_items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return -1 if not sorted_items or sorted_items[low] != target else low + 1\n']),
 lab('bfs-distances', 'Breadth-first search', 'Graphs', 'Intermediate', 'A queue explores a graph level by level, so the first time you reach a node is by a shortest path (in edges).',
     'The graph is a dict mapping each node to the list of its neighbours. Write <code>bfs_distances(graph, start)</code> returning a dict <code>{node: fewest edges from start}</code> for every node reachable from <code>start</code>.',
     'bfs_distances',
     'from collections import deque\n\ndef bfs_distances(graph, start):\n    dist = {start: 0}\n    # TODO: queue = deque([start]); take a node, visit its unseen neighbours with distance + 1.\n    return dist\n',
     'from collections import deque\n\ndef bfs_distances(graph, start):\n    dist = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for nxt in graph.get(node, []):\n            if nxt not in dist:\n                dist[nxt] = dist[node] + 1\n                queue.append(nxt)\n    return dist\n',
     '''
import random
rnd = random.Random(9)
g = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": [], "e": ["a"]}
assert bfs_distances(g, "a") == {"a": 0, "b": 1, "c": 1, "d": 2}
assert bfs_distances(g, "e") == {"e": 0, "a": 1, "b": 2, "c": 2, "d": 3}
for _ in range(200):
    n = rnd.randint(1, 9)
    graph = {i: [j for j in range(n) if j != i and rnd.random() < 0.25] for i in range(n)}
    # independent reference: relax unit-length edges until nothing changes
    INF = float("inf"); ref = {i: INF for i in range(n)}; ref[0] = 0
    for _ in range(n):
        for u in graph:
            for v in graph[u]:
                if ref[u] + 1 < ref[v]:
                    ref[v] = ref[u] + 1
    expected = {k: v for k, v in ref.items() if v < INF}
    assert bfs_distances(graph, 0) == expected, f"wrong distances for {graph}: got {bfs_distances(graph, 0)}, expected {expected}"
''',
     ['Set the distance when you first discover a node and never change it.', 'A node is "seen" when it is already a key of dist.'],
     'graphs/breadth_first_search.py',
     ['def bfs_distances(graph, start):\n    return {start: 0}\n', 'def bfs_distances(graph, start):\n    dist = {start: 0}\n    stack = [start]\n    while stack:\n        node = stack.pop()\n        for nxt in graph.get(node, []):\n            dist[nxt] = dist[node] + 1\n            if nxt not in dist or True:\n                if len(dist) < 50:\n                    stack.append(nxt)\n            if len(dist) > 20:\n                break\n    return dist\n']),
 lab('dfs-order', 'Depth-first search', 'Graphs', 'Intermediate', 'Follow one path as deep as it goes, then backtrack.',
     'The graph is a dict from node to a list of neighbours. Write <code>dfs_order(graph, start)</code> returning the list of nodes in the order a <b>recursive depth-first search</b> first visits them, trying neighbours in the order they are listed.',
     'dfs_order',
     'def dfs_order(graph, start):\n    order, seen = [], set()\n    def visit(node):\n        # TODO: mark node seen, append it to order, then visit each unseen neighbour in list order.\n        pass\n    visit(start)\n    return order\n',
     'def dfs_order(graph, start):\n    order, seen = [], set()\n    def visit(node):\n        seen.add(node)\n        order.append(node)\n        for nxt in graph.get(node, []):\n            if nxt not in seen:\n                visit(nxt)\n    visit(start)\n    return order\n',
     '''
import random
rnd = random.Random(21)
g = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
assert dfs_order(g, "a") == ["a", "b", "d", "c"], dfs_order(g, "a")
assert dfs_order({"x": ["y"], "y": ["x"]}, "x") == ["x", "y"], "cycles must not loop forever"
def reference(graph, start):
    seen, out = set(), []
    def go(u):
        seen.add(u); out.append(u)
        for v in graph[u]:
            if v not in seen:
                go(v)
    go(start); return out
for _ in range(200):
    n = rnd.randint(1, 9)
    graph = {i: [j for j in rnd.sample(range(n), rnd.randint(0, n)) if j != i] for i in range(n)}
    assert dfs_order(graph, 0) == reference(graph, 0), f"wrong order for {graph}"
''',
     ['Mark the node as seen BEFORE visiting its neighbours, otherwise a cycle loops forever.', 'Check "not in seen" again for each neighbour, because an earlier branch may have visited it.'],
     'graphs/depth_first_search.py',
     ['def dfs_order(graph, start):\n    return [start]\n', 'from collections import deque\ndef dfs_order(graph, start):\n    order, seen, q = [], {start}, deque([start])\n    while q:\n        u = q.popleft(); order.append(u)\n        for v in graph.get(u, []):\n            if v not in seen:\n                seen.add(v); q.append(v)\n    return order\n']),
 lab('dijkstra', "Dijkstra's shortest paths", 'Graphs', 'Advanced', 'Always settle the closest unsettled node; valid when no edge has negative weight.',
     'The graph maps each node to a list of <code>(neighbour, weight)</code> pairs with weights &ge; 0. Write <code>dijkstra(graph, start)</code> returning <code>{node: shortest distance from start}</code> for every reachable node. Use <code>heapq</code> for the priority queue.',
     'dijkstra',
     'import heapq\n\ndef dijkstra(graph, start):\n    dist = {}\n    heap = [(0, start)]\n    # TODO: pop the smallest (d, node); skip it if already settled; settle it; push its neighbours with d + weight.\n    return dist\n',
     'import heapq\n\ndef dijkstra(graph, start):\n    dist = {}\n    heap = [(0, start)]\n    while heap:\n        d, node = heapq.heappop(heap)\n        if node in dist:\n            continue\n        dist[node] = d\n        for nxt, w in graph.get(node, []):\n            if nxt not in dist:\n                heapq.heappush(heap, (d + w, nxt))\n    return dist\n',
     '''
import random
rnd = random.Random(2)
g = {"A": [("B", 1), ("C", 4)], "B": [("C", 2), ("D", 6)], "C": [("D", 3)], "D": []}
assert dijkstra(g, "A") == {"A": 0, "B": 1, "C": 3, "D": 6}
assert dijkstra({"s": []}, "s") == {"s": 0}
for _ in range(250):
    n = rnd.randint(1, 8)
    graph = {i: [(j, rnd.randint(0, 9)) for j in range(n) if j != i and rnd.random() < 0.3] for i in range(n)}
    INF = float("inf"); ref = {i: INF for i in range(n)}; ref[0] = 0
    for _ in range(n):                                  # Bellman-Ford as an independent reference
        for u in graph:
            for v, w in graph[u]:
                if ref[u] + w < ref[v]:
                    ref[v] = ref[u] + w
    expected = {k: v for k, v in ref.items() if v < INF}
    assert dijkstra(graph, 0) == expected, f"wrong distances for {graph}: got {dijkstra(graph, 0)}, expected {expected}"
''',
     ['heapq.heappush(heap, (distance, node)) keeps the smallest distance on top.', 'The same node may be pushed several times; ignore a popped node that is already in dist.'],
     'graphs/dijkstra.py',
     ['def dijkstra(graph, start):\n    return {start: 0}\n', 'def dijkstra(graph, start):\n    dist = {start: 0}\n    for u in list(graph):\n        for v, w in graph.get(u, []):\n            if u in dist and (v not in dist or dist[u] + w < dist[v]):\n                dist[v] = dist[u] + w\n    return dist\n']),
 lab('kruskal-mst', "Kruskal's minimum spanning tree", 'Graphs', 'Advanced', 'Sort edges by weight and add each one that does not close a cycle, tracked with union-find.',
     'Nodes are <code>0..n-1</code> and <code>edges</code> is a list of <code>(u, v, weight)</code>. Write <code>mst_weight(n, edges)</code> returning the total weight of a minimum spanning tree, or <code>None</code> if the graph is not connected.',
     'mst_weight',
     'def mst_weight(n, edges):\n    parent = list(range(n))\n    def find(x):\n        # TODO: follow parent links to the root (compress the path if you like).\n        return x\n    total, used = 0, 0\n    # TODO: for each edge by increasing weight, union the two trees unless find(u) == find(v).\n    return total if used == n - 1 else None\n',
     'def mst_weight(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    total, used = 0, 0\n    for u, v, w in sorted(edges, key=lambda e: e[2]):\n        ru, rv = find(u), find(v)\n        if ru != rv:\n            parent[ru] = rv\n            total += w\n            used += 1\n    return total if used == n - 1 else None\n',
     '''
import random
from itertools import combinations
rnd = random.Random(8)
assert mst_weight(1, []) == 0
assert mst_weight(2, []) is None
assert mst_weight(4, [(0, 1, 1), (1, 2, 2), (0, 2, 3), (2, 3, 4), (1, 3, 9)]) == 7
def connected(n, chosen):
    p = list(range(n))
    def f(x):
        while p[x] != x:
            x = p[x]
        return x
    for u, v, _ in chosen:
        p[f(u)] = f(v)
    return len({f(i) for i in range(n)}) == 1
for _ in range(150):
    n = rnd.randint(1, 6)
    edges = [(u, v, rnd.randint(1, 9)) for u, v in combinations(range(n), 2) if rnd.random() < 0.55]
    best = None
    for k in range(len(edges) + 1):                     # brute force: cheapest connected edge subset
        for chosen in combinations(edges, k):
            if connected(n, chosen):
                s = sum(e[2] for e in chosen)
                best = s if best is None or s < best else best
    assert mst_weight(n, list(edges)) == best, f"n={n} edges={edges}: expected {best}, got {mst_weight(n, list(edges))}"
''',
     ['A cycle appears exactly when both ends of an edge already have the same root.', 'A spanning tree of n nodes uses n - 1 edges; fewer means the graph is disconnected.'],
     'graphs/minimum_spanning_tree_kruskal.py',
     ['def mst_weight(n, edges):\n    return sum(w for _, _, w in edges)\n', 'def mst_weight(n, edges):\n    total = 0\n    for u, v, w in sorted(edges, key=lambda e: e[2])[:n - 1]:\n        total += w\n    return total\n']),
 lab('knapsack-01', '0/1 knapsack', 'Dynamic programming', 'Advanced', 'For each item decide take or leave; best[c] = best value using capacity c.',
     'Write <code>knapsack(weights, values, capacity)</code> returning the maximum total value of a subset of items whose total weight is at most <code>capacity</code>. Each item can be used at most once. Weights are positive integers.',
     'knapsack',
     'def knapsack(weights, values, capacity):\n    best = [0] * (capacity + 1)\n    # TODO: for each item, update best[c] for c from capacity down to its weight (downwards, so the item is used once).\n    return best[capacity]\n',
     'def knapsack(weights, values, capacity):\n    best = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for c in range(capacity, w - 1, -1):\n            best[c] = max(best[c], best[c - w] + v)\n    return best[capacity]\n',
     '''
import random
from itertools import combinations
rnd = random.Random(4)
assert knapsack([], [], 10) == 0
assert knapsack([5], [10], 4) == 0
assert knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) == 9
for _ in range(250):
    n = rnd.randint(0, 9)
    w = [rnd.randint(1, 8) for _ in range(n)]
    v = [rnd.randint(0, 20) for _ in range(n)]
    cap = rnd.randint(0, 20)
    best = max(sum(v[i] for i in c) for k in range(n + 1) for c in combinations(range(n), k) if sum(w[i] for i in c) <= cap)
    assert knapsack(w, v, cap) == best, f"weights={w} values={v} capacity={cap}: expected {best}, got {knapsack(w, v, cap)}"
''',
     ['If you loop capacity upwards, one item can be counted several times. Loop downwards.', 'best[c] = max(best[c], best[c - weight] + value).'],
     'dynamic_programming/knapsack.py',
     ['def knapsack(weights, values, capacity):\n    best = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for c in range(w, capacity + 1):\n            best[c] = max(best[c], best[c - w] + v)\n    return best[capacity]\n', 'def knapsack(weights, values, capacity):\n    total = 0\n    for w, v in sorted(zip(weights, values), key=lambda p: -p[1] / p[0]):\n        if w <= capacity:\n            capacity -= w\n            total += v\n    return total\n']),
 lab('lcs-length', 'Longest common subsequence', 'Dynamic programming', 'Advanced', 'A table over prefixes: matching characters extend the diagonal, otherwise take the better neighbour.',
     'Write <code>lcs_length(a, b)</code> returning the length of the longest common <b>subsequence</b> of two strings (characters in order, not necessarily adjacent).',
     'lcs_length',
     'def lcs_length(a, b):\n    # table[i][j] = LCS length of a[:i] and b[:j]\n    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    # TODO: fill the table row by row.\n    return table[len(a)][len(b)]\n',
     'def lcs_length(a, b):\n    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                table[i][j] = table[i - 1][j - 1] + 1\n            else:\n                table[i][j] = max(table[i - 1][j], table[i][j - 1])\n    return table[len(a)][len(b)]\n',
     '''
import random
from itertools import combinations
rnd = random.Random(6)
assert lcs_length("", "abc") == 0 and lcs_length("abc", "abc") == 3
assert lcs_length("AGGTAB", "GXTXAYB") == 4
def subsequences(s):
    return {"".join(c) for k in range(len(s) + 1) for c in combinations(s, k)}
for _ in range(200):
    a = "".join(rnd.choice("abc") for _ in range(rnd.randint(0, 8)))
    b = "".join(rnd.choice("abc") for _ in range(rnd.randint(0, 8)))
    expected = max(len(s) for s in subsequences(a) & subsequences(b))
    assert lcs_length(a, b) == expected, f"lcs_length({a!r}, {b!r}) should be {expected}"
''',
     ['If a[i - 1] == b[j - 1], the answer extends table[i - 1][j - 1] by one.', 'Otherwise it is the larger of table[i - 1][j] and table[i][j - 1].'],
     'dynamic_programming/longest_common_subsequence.py',
     ['def lcs_length(a, b):\n    return len(set(a) & set(b))\n', 'def lcs_length(a, b):\n    n = 0\n    for i, ch in enumerate(a):\n        if i < len(b) and b[i] == ch:\n            n += 1\n    return n\n']),
 lab('edit-distance', 'Edit distance', 'Dynamic programming', 'Advanced', 'The fewest insertions, deletions and substitutions that turn one string into another.',
     'Write <code>edit_distance(a, b)</code> returning the minimum number of single-character insertions, deletions and substitutions needed to turn <code>a</code> into <code>b</code> (Levenshtein distance).',
     'edit_distance',
     'def edit_distance(a, b):\n    # row[j] = distance between the first i characters of a and the first j characters of b\n    row = list(range(len(b) + 1))\n    # TODO: for each character of a, build the next row from the previous one.\n    return row[len(b)]\n',
     'def edit_distance(a, b):\n    row = list(range(len(b) + 1))\n    for i, ca in enumerate(a, 1):\n        new = [i]\n        for j, cb in enumerate(b, 1):\n            new.append(min(row[j] + 1, new[j - 1] + 1, row[j - 1] + (ca != cb)))\n        row = new\n    return row[len(b)]\n',
     '''
import random
from functools import lru_cache
rnd = random.Random(12)
assert edit_distance("kitten", "sitting") == 3
assert edit_distance("", "abc") == 3 and edit_distance("abc", "") == 3 and edit_distance("same", "same") == 0
@lru_cache(None)
def ref(a, b):                                           # plain recursion over the last characters
    if not a: return len(b)
    if not b: return len(a)
    if a[-1] == b[-1]: return ref(a[:-1], b[:-1])
    return 1 + min(ref(a[:-1], b), ref(a, b[:-1]), ref(a[:-1], b[:-1]))
for _ in range(300):
    a = "".join(rnd.choice("abcd") for _ in range(rnd.randint(0, 9)))
    b = "".join(rnd.choice("abcd") for _ in range(rnd.randint(0, 9)))
    assert edit_distance(a, b) == ref(a, b), f"edit_distance({a!r}, {b!r}) should be {ref(a, b)}, got {edit_distance(a, b)}"
    assert edit_distance(a, b) == edit_distance(b, a), "distance must be symmetric"
''',
     ['A substitution costs 1 only when the characters differ; equal characters cost 0.', 'Each cell is the minimum of: delete (cell above + 1), insert (cell to the left + 1), substitute (diagonal + cost).'],
     'dynamic_programming/edit_distance.py',
     ['def edit_distance(a, b):\n    return abs(len(a) - len(b))\n', 'def edit_distance(a, b):\n    return sum(x != y for x, y in zip(a, b)) + abs(len(a) - len(b))\n']),
 lab('lis-length', 'Longest increasing subsequence', 'Dynamic programming', 'Advanced', 'best[i] = length of the longest strictly increasing subsequence that ends at item i.',
     'Write <code>lis_length(items)</code> returning the length of the longest <b>strictly</b> increasing subsequence of a list of numbers (items in order, not necessarily adjacent).',
     'lis_length',
     'def lis_length(items):\n    best = [1] * len(items)\n    # TODO: best[i] = 1 + max(best[j]) over earlier j with items[j] < items[i].\n    return max(best, default=0)\n',
     'def lis_length(items):\n    best = [1] * len(items)\n    for i in range(len(items)):\n        for j in range(i):\n            if items[j] < items[i]:\n                best[i] = max(best[i], best[j] + 1)\n    return max(best, default=0)\n',
     '''
import random
from itertools import combinations
rnd = random.Random(14)
assert lis_length([]) == 0 and lis_length([5]) == 1 and lis_length([3, 3, 3]) == 1
assert lis_length([10, 9, 2, 5, 3, 7, 101, 18]) == 4
for _ in range(250):
    data = [rnd.randint(0, 9) for _ in range(rnd.randint(0, 11))]
    expected = max((k for k in range(len(data) + 1) for c in combinations(data, k) if all(c[i] < c[i + 1] for i in range(len(c) - 1))), default=0)
    assert lis_length(data) == expected, f"lis_length({data}) should be {expected}"
''',
     ['Strictly increasing means equal neighbours do not count: use items[j] < items[i].', 'Every item alone is a subsequence of length 1, so start best at 1.'],
     'dynamic_programming/longest_increasing_subsequence.py',
     ['def lis_length(items):\n    return len(set(items))\n', 'def lis_length(items):\n    n = 0\n    for i in range(len(items)):\n        if i == 0 or items[i] > items[i - 1]:\n            n += 1\n    return n\n']),
 lab('fractional-knapsack', 'Fractional knapsack (greedy)', 'Greedy', 'Intermediate', 'When items can be split, taking the best value-per-weight first is optimal.',
     'Write <code>fractional_knapsack(weights, values, capacity)</code> returning the maximum total value when each item may be taken in any fraction. Weights are positive. Return a float.',
     'fractional_knapsack',
     'def fractional_knapsack(weights, values, capacity):\n    total = 0.0\n    # TODO: order items by value / weight, best first; take whole items while they fit, then a fraction of the next.\n    return total\n',
     'def fractional_knapsack(weights, values, capacity):\n    total = 0.0\n    for w, v in sorted(zip(weights, values), key=lambda p: p[1] / p[0], reverse=True):\n        if capacity <= 0:\n            break\n        take = min(w, capacity)\n        total += v * take / w\n        capacity -= take\n    return total\n',
     '''
import random
from itertools import combinations
rnd = random.Random(16)
assert abs(fractional_knapsack([10, 20, 30], [60, 100, 120], 50) - 240.0) < 1e-9
assert fractional_knapsack([], [], 5) == 0
assert abs(fractional_knapsack([4], [8], 2) - 4.0) < 1e-9
for _ in range(200):
    n = rnd.randint(1, 7)
    w = [rnd.randint(1, 9) for _ in range(n)]
    v = [rnd.randint(1, 30) for _ in range(n)]
    cap = rnd.randint(0, 25)
    zero_one = max(sum(v[i] for i in c) for k in range(n + 1) for c in combinations(range(n), k) if sum(w[i] for i in c) <= cap)
    got = fractional_knapsack(w, v, cap)
    assert got >= zero_one - 1e-9, f"{got} is below the 0/1 optimum {zero_one}: splitting items can never be worse"
    assert got <= sum(v) + 1e-9
    if cap >= sum(w):
        assert abs(got - sum(v)) < 1e-9, "everything fits: take everything"
    # LP bound by a second route: sweep in ratio order with fractions
    ref, left = 0.0, cap
    for i in sorted(range(n), key=lambda i: -v[i] / w[i]):
        t = min(w[i], left); ref += v[i] * t / w[i]; left -= t
    assert abs(got - ref) < 1e-9, f"expected {ref}, got {got}"
''',
     ['Sort by value / weight in descending order.', 'take = min(item weight, remaining capacity); gain = value * take / weight.'],
     'greedy_methods/fractional_knapsack.py',
     ['def fractional_knapsack(weights, values, capacity):\n    return 0.0\n', 'def fractional_knapsack(weights, values, capacity):\n    total = 0.0\n    for w, v in sorted(zip(weights, values), key=lambda p: p[1], reverse=True):\n        take = min(w, capacity)\n        total += v * take / w\n        capacity -= take\n    return total\n']),
 lab('minimum-waiting-time', 'Minimum total waiting time (greedy)', 'Greedy', 'Intermediate', 'Serving short jobs first minimises how long everyone else waits (an exchange argument).',
     'A server handles queries one at a time; <code>durations[i]</code> is how long query <i>i</i> takes. A query waits for every query served before it. Write <code>minimum_waiting_time(durations)</code> returning the smallest possible <b>total</b> waiting time over all orders.',
     'minimum_waiting_time',
     'def minimum_waiting_time(durations):\n    # TODO: choose the order, then add up how long each query waits.\n    return 0\n',
     'def minimum_waiting_time(durations):\n    ordered = sorted(durations)\n    n = len(ordered)\n    return sum(d * (n - 1 - i) for i, d in enumerate(ordered))\n',
     '''
import random
from itertools import permutations
rnd = random.Random(18)
assert minimum_waiting_time([]) == 0 and minimum_waiting_time([7]) == 0
assert minimum_waiting_time([3, 2, 1, 2, 6]) == 17
def total(order):
    wait, elapsed = 0, 0
    for d in order:
        wait += elapsed
        elapsed += d
    return wait
for _ in range(200):
    data = [rnd.randint(1, 12) for _ in range(rnd.randint(0, 7))]
    copy = list(data)
    expected = min((total(p) for p in permutations(data)), default=0)
    assert minimum_waiting_time(data) == expected, f"minimum_waiting_time({copy}) should be {expected}"
    assert data == copy, "do not change the input list"
''',
     ['Item i in the sorted order is waited for by every query after it, so it is counted (n - 1 - i) times.', 'Try [3, 2, 1] by hand in both orders.'],
     'greedy_methods/minimum_waiting_time.py',
     ['def minimum_waiting_time(durations):\n    return sum(durations)\n', 'def minimum_waiting_time(durations):\n    ordered = sorted(durations, reverse=True)\n    n = len(ordered)\n    return sum(d * (n - 1 - i) for i, d in enumerate(ordered))\n']),
 lab('n-queens', 'N queens (backtracking)', 'Backtracking', 'Advanced', 'Place one queen per row, skipping squares that share a column or diagonal; undo on dead ends.',
     'Write <code>count_n_queens(n)</code> returning the number of ways to place <code>n</code> queens on an n&times;n board so that no two attack each other (same row, column or diagonal).',
     'count_n_queens',
     'def count_n_queens(n):\n    cols, diag1, diag2 = set(), set(), set()\n    def place(row):\n        # TODO: if row == n, that is one solution. Otherwise try each column that is free.\n        return 0\n    return place(0)\n',
     'def count_n_queens(n):\n    cols, diag1, diag2 = set(), set(), set()\n    def place(row):\n        if row == n:\n            return 1\n        count = 0\n        for c in range(n):\n            if c in cols or row - c in diag1 or row + c in diag2:\n                continue\n            cols.add(c); diag1.add(row - c); diag2.add(row + c)\n            count += place(row + 1)\n            cols.remove(c); diag1.remove(row - c); diag2.remove(row + c)\n        return count\n    return place(0)\n',
     '''
known = {1: 1, 2: 0, 3: 0, 4: 2, 5: 10, 6: 4, 7: 40, 8: 92}
for n, expected in known.items():
    assert count_n_queens(n) == expected, f"count_n_queens({n}) should be {expected}, got {count_n_queens(n)}"
''',
     ['Two queens share a diagonal when row - col is equal, or row + col is equal.', 'After the recursive call, remove the queen so the next column starts clean.'],
     'backtracking/n_queens.py',
     ['def count_n_queens(n):\n    return 1\n', 'def count_n_queens(n):\n    from itertools import permutations\n    return sum(1 for p in permutations(range(n)) if len({i + p[i] for i in range(n)}) == n)\n']),
]
