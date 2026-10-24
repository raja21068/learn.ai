"""More hands-on labs for the Practice hub: AI search and games (AIMA), constraint satisfaction, automatic differentiation (micrograd),
reinforcement learning (Sutton and Barto) and three Hands-On Machine Learning style exercises.
Same rules as practice_labs_def.py: original prompts, starters, hidden tests and solutions; the references are linked (and bundled when MIT)."""
from practice_labs_def import lab, ref

AIMA = lambda p: ref('aimacode/aima-python', p, 'MIT', 'master', 'third_party/aima-python/' + p)
BUNDLED_HANDS = {'04_training_linear_models.ipynb'}          # notebooks of at most 1 MB are bundled; the others stay links
HANDS = lambda p: ref('ageron/handson-ml3', p, 'Apache-2.0', 'main', 'third_party/handson-ml3/' + p if p in BUNDLED_HANDS else None)

NEW_LABS = [
 lab('a-star-grid', 'A* search on a grid', 'AI search', 'Advanced', 'Best-first search with a heuristic that never over-estimates still finds a shortest path.',
     'A grid is a list of strings: <code>.</code> is open and <code>#</code> is a wall. Write <code>astar_steps(grid, start, goal)</code> (positions are <code>(row, col)</code>) returning the <b>fewest moves</b> (up, down, left, right) from start to goal, or <code>-1</code> if the goal cannot be reached. Use A* with the Manhattan distance as the heuristic.',
     'astar_steps',
     'import heapq\n\ndef astar_steps(grid, start, goal):\n    rows, cols = len(grid), len(grid[0])\n    def h(p):\n        return abs(p[0] - goal[0]) + abs(p[1] - goal[1])\n    # TODO: keep a heap of (cost so far + h(position), cost so far, position).\n    # Pop the smallest, stop when it is the goal, push neighbours that are inside the grid, not walls, and reached more cheaply.\n    return -1\n',
     'import heapq\n\ndef astar_steps(grid, start, goal):\n    rows, cols = len(grid), len(grid[0])\n    def h(p):\n        return abs(p[0] - goal[0]) + abs(p[1] - goal[1])\n    best = {start: 0}\n    heap = [(h(start), 0, start)]\n    while heap:\n        _, g, pos = heapq.heappop(heap)\n        if pos == goal:\n            return g\n        if g > best.get(pos, 1 << 30):\n            continue\n        r, c = pos\n        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and g + 1 < best.get((nr, nc), 1 << 30):\n                best[(nr, nc)] = g + 1\n                heapq.heappush(heap, (g + 1 + h((nr, nc)), g + 1, (nr, nc)))\n    return -1\n',
     '''
import random
from collections import deque
rnd = random.Random(31)
assert astar_steps(["..."], (0, 0), (0, 2)) == 2
assert astar_steps([".#.", ".#.", "..."], (0, 0), (0, 2)) == 6
assert astar_steps([".#.", ".#."], (0, 0), (0, 2)) == -1
assert astar_steps(["."], (0, 0), (0, 0)) == 0
def bfs(grid, s, g):
    rows, cols = len(grid), len(grid[0]); seen = {s: 0}; q = deque([s])
    while q:
        r, c = q.popleft()
        for n in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= n[0] < rows and 0 <= n[1] < cols and grid[n[0]][n[1]] != "#" and n not in seen:
                seen[n] = seen[(r, c)] + 1; q.append(n)
    return seen.get(g, -1)
for _ in range(600):
    rows, cols = rnd.randint(2, 10), rnd.randint(2, 10)
    grid = ["".join("#" if rnd.random() < 0.35 else "." for _ in range(cols)) for _ in range(rows)]
    grid = [list(r) for r in grid]; s = (rnd.randrange(rows), rnd.randrange(cols)); g = (rnd.randrange(rows), rnd.randrange(cols))
    grid[s[0]][s[1]] = "."; grid[g[0]][g[1]] = "."; grid = ["".join(r) for r in grid]
    assert astar_steps(grid, s, g) == bfs(grid, s, g), f"grid={grid} start={s} goal={g}: expected {bfs(grid, s, g)}, got {astar_steps(grid, s, g)}"
big = ["." * 60 for _ in range(60)]
assert astar_steps(big, (0, 0), (59, 59)) == 118
''',
     ['If the heap holds (g + h, g, position), the smallest entry is the most promising one.', 'Manhattan distance never over-estimates on a 4-neighbour grid, so the first time you pop the goal its cost is optimal.', 'Skip a popped entry whose cost is worse than the best known cost for that position.'],
     AIMA('aima/search.py'),
     ['def astar_steps(grid, start, goal):\n    return abs(start[0] - goal[0]) + abs(start[1] - goal[1])\n', 'import heapq\ndef astar_steps(grid, start, goal):\n    rows, cols = len(grid), len(grid[0]); seen = {start}; heap = [(abs(start[0] - goal[0]) + abs(start[1] - goal[1]), 0, start)]\n    while heap:\n        _, g, pos = heapq.heappop(heap)\n        if pos == goal:\n            return g\n        r, c = pos\n        for n in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if 0 <= n[0] < rows and 0 <= n[1] < cols and grid[n[0]][n[1]] != "#" and n not in seen:\n                seen.add(n); heapq.heappush(heap, (abs(n[0] - goal[0]) + abs(n[1] - goal[1]), g + 1, n))\n    return -1\n']),
 lab('minimax', 'Minimax game values', 'AI search', 'Intermediate', 'Two players alternate: one maximises the outcome, the other minimises it.',
     'A game tree is a nested list: a number is a leaf (its value for the maximising player) and a list holds the moves available at that node. The root belongs to the <b>maximiser</b>; the players alternate each level. Write <code>minimax(tree)</code> returning the value of the game with best play by both sides.',
     'minimax',
     'def minimax(tree, maximizing=True):\n    if not isinstance(tree, list):\n        return tree\n    # TODO: evaluate every child for the other player, then take the max (if maximizing) or the min.\n    return 0\n',
     'def minimax(tree, maximizing=True):\n    if not isinstance(tree, list):\n        return tree\n    values = [minimax(child, not maximizing) for child in tree]\n    return max(values) if maximizing else min(values)\n',
     '''
import random
assert minimax(5) == 5
assert minimax([3, 12, 8]) == 12
assert minimax([[3, 12, 8], [2, 4, 6], [14, 5, 2]]) == 3
assert minimax([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]) == 6
rnd = random.Random(33)
def build(depth):
    if depth == 0 or rnd.random() < 0.15:
        return rnd.randint(-9, 9)
    return [build(depth - 1) for _ in range(rnd.randint(1, 3))]
def ref(t, turn):                                         # independent: negamax formulation
    if not isinstance(t, list):
        return t * turn
    return max(-ref(c, -turn) for c in t)
for _ in range(300):
    t = build(rnd.randint(1, 5))
    if not isinstance(t, list):
        t = [t]
    assert minimax(t) == ref(t, 1), f"minimax({t}) should be {ref(t, 1)}, got {minimax(t)}"
''',
     ['A leaf is anything that is not a list.', 'Call minimax(child, not maximizing) for every child, then use max() or min().'],
     AIMA('aima/games.py'),
     ['def minimax(tree, maximizing=True):\n    return tree if not isinstance(tree, list) else max(minimax(c) for c in tree)\n', 'def minimax(tree, maximizing=True):\n    if not isinstance(tree, list):\n        return tree\n    return (max if maximizing else min)(minimax(c, maximizing) for c in tree)\n']),
 lab('graph-coloring', 'Graph colouring (constraint satisfaction)', 'AI search', 'Advanced', 'Assign values to variables so that no constraint is broken; backtrack on dead ends.',
     'The graph maps each node to the list of its neighbours (both directions are listed). Write <code>color_graph(graph, k)</code> returning a dict giving every node a colour in <code>range(k)</code> so that neighbours never share a colour, or <code>None</code> if that is impossible.',
     'color_graph',
     'def color_graph(graph, k):\n    colors = {}\n    nodes = list(graph)\n    def assign(i):\n        # TODO: if every node has a colour, you are done. Otherwise try each colour not used by an already coloured neighbour.\n        return False\n    return colors if assign(0) else None\n',
     'def color_graph(graph, k):\n    colors = {}\n    nodes = list(graph)\n    def assign(i):\n        if i == len(nodes):\n            return True\n        node = nodes[i]\n        for c in range(k):\n            if all(colors.get(n) != c for n in graph[node]):\n                colors[node] = c\n                if assign(i + 1):\n                    return True\n                del colors[node]\n        return False\n    return colors if assign(0) else None\n',
     '''
import random
from itertools import product
rnd = random.Random(35)
def valid(graph, col, k):
    return set(col) == set(graph) and all(0 <= col[n] < k for n in graph) and all(col[a] != col[b] for a in graph for b in graph[a])
tri = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
assert color_graph(tri, 2) is None
assert valid(tri, color_graph(tri, 3), 3)
assert color_graph({}, 1) == {}
for _ in range(200):
    n = rnd.randint(1, 7); k = rnd.randint(1, 3)
    graph = {i: [] for i in range(n)}
    for a in range(n):
        for b in range(a + 1, n):
            if rnd.random() < 0.4:
                graph[a].append(b); graph[b].append(a)
    possible = any(all(c[a] != c[b] for a in graph for b in graph[a]) for c in product(range(k), repeat=n))
    got = color_graph(graph, k)
    if possible:
        assert got is not None and valid(graph, got, k), f"graph={graph} k={k}: a colouring exists, got {got}"
    else:
        assert got is None, f"graph={graph} k={k}: no colouring exists, but got {got}"
''',
     ['Colour the nodes one by one; before using colour c on a node, check that none of its neighbours already has c.', 'If no colour works for some node, return False so the previous node tries its next colour (and remove the colour you set).'],
     AIMA('aima/csp.py'),
     ['def color_graph(graph, k):\n    return {n: 0 for n in graph}\n', 'def color_graph(graph, k):\n    colors = {}\n    for n in graph:\n        used = {colors[m] for m in graph[n] if m in colors}\n        free = [c for c in range(k) if c not in used]\n        if not free:\n            return None\n        colors[n] = free[0]\n    return colors\n']),
 lab('autograd-value', 'Automatic differentiation (a tiny autograd)', 'Deep learning', 'Advanced', 'Backpropagation is the chain rule applied to a recorded computation graph.',
     'Complete the class <code>Value</code>: it holds a number, builds a graph when you add or multiply values, and <code>backward()</code> fills in <code>grad</code> (the derivative of the final value with respect to each value). A value used several times must <b>accumulate</b> its gradient.',
     'Value',
     'class Value:\n    def __init__(self, data, parents=(), backward_fn=None):\n        self.data = data\n        self.grad = 0.0\n        self._parents = parents\n        self._backward = backward_fn or (lambda: None)\n\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data + other.data, (self, other))\n        # TODO: set out._backward so that self.grad and other.grad receive out.grad (use +=)\n        return out\n\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data * other.data, (self, other))\n        # TODO: d(out)/d(self) = other.data and d(out)/d(other) = self.data; remember the chain rule: multiply by out.grad\n        return out\n\n    def backward(self):\n        # TODO: order the graph so every value comes after the values that depend on it, set self.grad = 1, then call each _backward\n        pass\n',
     'class Value:\n    def __init__(self, data, parents=(), backward_fn=None):\n        self.data = data\n        self.grad = 0.0\n        self._parents = parents\n        self._backward = backward_fn or (lambda: None)\n\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data + other.data, (self, other))\n        def _backward():\n            self.grad += out.grad\n            other.grad += out.grad\n        out._backward = _backward\n        return out\n\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data * other.data, (self, other))\n        def _backward():\n            self.grad += other.data * out.grad\n            other.grad += self.data * out.grad\n        out._backward = _backward\n        return out\n\n    def backward(self):\n        order, seen = [], set()\n        def visit(v):\n            if id(v) not in seen:\n                seen.add(id(v))\n                for p in v._parents:\n                    visit(p)\n                order.append(v)\n        visit(self)\n        self.grad = 1.0\n        for v in reversed(order):\n            v._backward()\n',
     '''
import random
rnd = random.Random(37)
a, b = Value(2.0), Value(-3.0)
c = a * b + a
c.backward()
assert c.data == -4.0 and a.grad == -2.0 and b.grad == 2.0, (c.data, a.grad, b.grad)   # d/da (ab + a) = b + 1, d/db = a
x = Value(3.0); y = x * x * x
y.backward(); assert abs(x.grad - 27.0) < 1e-9, "x used three times: d(x^3)/dx = 3x^2 = 27, got " + str(x.grad)
p = Value(1.5); q = (p + 2) * (p + 3)
q.backward(); assert abs(p.grad - (2 * 1.5 + 5)) < 1e-9
def expr(vals, ops):
    acc = vals[0]
    for v, op in zip(vals[1:], ops):
        acc = acc + v if op == "+" else acc * v
    return acc
for _ in range(150):
    n = rnd.randint(2, 5)
    xs = [rnd.uniform(-2, 2) for _ in range(n)]
    ops = [rnd.choice("+*") for _ in range(n - 1)]
    vs = [Value(v) for v in xs]
    out = expr(vs + [vs[0]], ops + ["*"])           # the first value is used twice
    out.backward()
    def f(arr):
        w = [Value(v) for v in arr]
        return expr(w + [w[0]], ops + ["*"]).data
    for i in range(n):
        h = 1e-6
        lo = list(xs); hi = list(xs); lo[i] -= h; hi[i] += h
        numeric = (f(hi) - f(lo)) / (2 * h)
        assert abs(vs[i].grad - numeric) < 1e-4 * max(1, abs(numeric)), f"gradient {i}: autograd {vs[i].grad}, numeric {numeric}"
''',
     ['In _backward, use += so a value that is used twice gets both contributions.', 'Mul: self.grad += other.data * out.grad, and the mirror image for other.', 'For backward(): a depth-first visit that appends a node after its parents gives an order; walk it in reverse.'],
     ref('karpathy/micrograd', 'micrograd/engine.py', 'MIT', 'master', 'third_party/micrograd/micrograd/engine.py'),
     ['class Value:\n    def __init__(self, data, parents=(), backward_fn=None):\n        self.data = data; self.grad = 0.0; self._parents = parents; self._backward = backward_fn or (lambda: None)\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        return Value(self.data + other.data, (self, other))\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        return Value(self.data * other.data, (self, other))\n    def backward(self):\n        self.grad = 1.0\n', 'class Value:\n    def __init__(self, data, parents=(), backward_fn=None):\n        self.data = data; self.grad = 0.0; self._parents = parents; self._backward = backward_fn or (lambda: None)\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data + other.data, (self, other))\n        def _b():\n            self.grad = out.grad\n            other.grad = out.grad\n        out._backward = _b\n        return out\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data * other.data, (self, other))\n        def _b():\n            self.grad = other.data * out.grad\n            other.grad = self.data * out.grad\n        out._backward = _b\n        return out\n    def backward(self):\n        self.grad = 1.0\n        stack, seen = [self], set()\n        while stack:\n            v = stack.pop()\n            if id(v) in seen:\n                continue\n            seen.add(id(v)); v._backward(); stack.extend(v._parents)\n']),
 lab('value-iteration', 'Value iteration (reinforcement learning)', 'Reinforcement learning', 'Advanced', 'Repeatedly apply the Bellman optimality update until the state values stop changing.',
     'A small deterministic MDP: states are <code>0..n-1</code>; <code>moves[s]</code> is a list of <code>(reward, next_state)</code> choices, and an empty list marks a terminal state (value 0). Write <code>value_iteration(moves, gamma)</code> returning the list of optimal state values <code>V</code> (accurate to 1e-6).',
     'value_iteration',
     'def value_iteration(moves, gamma):\n    V = [0.0] * len(moves)\n    # TODO: repeat: V[s] = max over (reward, nxt) in moves[s] of reward + gamma * V[nxt]; stop when no value changes by more than 1e-9.\n    return V\n',
     'def value_iteration(moves, gamma):\n    V = [0.0] * len(moves)\n    while True:\n        delta = 0.0\n        for s, options in enumerate(moves):\n            if options:\n                best = max(r + gamma * V[nxt] for r, nxt in options)\n                delta = max(delta, abs(best - V[s]))\n                V[s] = best\n        if delta < 1e-10:\n            return V\n',
     '''
import random
from itertools import product
rnd = random.Random(39)
V = value_iteration([[(1.0, 1)], []], 0.9)
assert abs(V[0] - 1.0) < 1e-6 and V[1] == 0
V = value_iteration([[(0.0, 1), (5.0, 2)], [(0.0, 3)], [], [(10.0, 2)]], 0.9)       # via states 1 and 3: 0.9 * (0.9 * 10) = 8.1, which beats the immediate 5
assert abs(V[0] - 8.1) < 1e-6 and abs(V[1] - 9.0) < 1e-6 and abs(V[3] - 10.0) < 1e-6 and V[2] == 0, V
def policy_values(moves, choice, gamma):
    v = [0.0] * len(moves)
    for _ in range(3000):
        v = [0.0 if not moves[s] else moves[s][choice[s]][0] + gamma * v[moves[s][choice[s]][1]] for s in range(len(moves))]
    return v
for _ in range(120):
    n = rnd.randint(2, 4); gamma = rnd.choice([0.5, 0.9])
    moves = [[(rnd.randint(-3, 5) * 1.0, rnd.randrange(n)) for _ in range(rnd.randint(1, 2))] if s < n - 1 else [] for s in range(n)]
    best = [max(policy_values(moves, c, gamma)[s] for c in product(*[range(max(1, len(m))) for m in moves])) for s in range(n)]
    got = value_iteration(moves, gamma)
    assert all(abs(g - b) < 1e-5 for g, b in zip(got, best)), f"moves={moves} gamma={gamma}: expected {best}, got {got}"
''',
     ['Terminal states (no moves) keep value 0.', 'You may update V in place; the values still converge. Keep a delta to know when to stop.'],
     ref('ShangtongZhang/reinforcement-learning-an-introduction', 'chapter03/grid_world.py', 'MIT', 'master', 'third_party/sutton-barto-python/chapter03/grid_world.py'),
     ['def value_iteration(moves, gamma):\n    return [0.0] * len(moves)\n', 'def value_iteration(moves, gamma):\n    V = [0.0] * len(moves)\n    for s, options in enumerate(moves):\n        if options:\n            V[s] = max(r for r, nxt in options)\n    return V\n']),
 lab('fit-line', 'Fit a line by least squares', 'Machine learning', 'Beginner', 'The best straight line minimises the sum of squared vertical errors; the slope and intercept have closed forms.',
     'Write <code>fit_line(xs, ys)</code> returning <code>(slope, intercept)</code> of the least-squares line through the points. Do not use <code>statistics.linear_regression</code> or numpy.',
     'fit_line',
     'def fit_line(xs, ys):\n    n = len(xs)\n    mean_x = sum(xs) / n\n    mean_y = sum(ys) / n\n    # TODO: slope = sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x) ** 2); intercept = mean_y - slope * mean_x\n    return 0.0, 0.0\n',
     'def fit_line(xs, ys):\n    n = len(xs)\n    mean_x = sum(xs) / n\n    mean_y = sum(ys) / n\n    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / sum((x - mean_x) ** 2 for x in xs)\n    return slope, mean_y - slope * mean_x\n',
     '''
import random, statistics
rnd = random.Random(41)
m, c = fit_line([0, 1, 2, 3], [1, 3, 5, 7])
assert abs(m - 2) < 1e-9 and abs(c - 1) < 1e-9
for _ in range(200):
    n = rnd.randint(2, 12)
    xs = [rnd.uniform(-5, 5) for _ in range(n)]
    ys = [rnd.uniform(-5, 5) for _ in range(n)]
    ref_m, ref_c = statistics.linear_regression(xs, ys)
    m, c = fit_line(xs, ys)
    assert abs(m - ref_m) < 1e-7 and abs(c - ref_c) < 1e-7, f"expected slope {ref_m}, intercept {ref_c}; got {m}, {c}"
''',
     ['The line always passes through the point (mean of x, mean of y).', 'Slope = covariance of x and y divided by the variance of x (without dividing either by n; the n cancels).'],
     HANDS('04_training_linear_models.ipynb'),
     ['def fit_line(xs, ys):\n    return (ys[-1] - ys[0]) / (xs[-1] - xs[0]), ys[0]\n', 'def fit_line(xs, ys):\n    n = len(xs)\n    mx, my = sum(xs) / n, sum(ys) / n\n    slope = sum(x * y for x, y in zip(xs, ys)) / sum(x * x for x in xs)\n    return slope, my - slope * mx\n']),
 lab('gradient-descent', 'Gradient descent', 'Machine learning', 'Beginner', 'Walk downhill: repeatedly step against the gradient.',
     'Write <code>gradient_descent(grad, x0, lr, steps)</code>: starting at <code>x0</code>, repeat <code>steps</code> times <code>x = x - lr * grad(x)</code> and return the final <code>x</code>. <code>grad</code> is a function returning the derivative at <code>x</code>.',
     'gradient_descent',
     'def gradient_descent(grad, x0, lr, steps):\n    x = x0\n    # TODO: update x in a loop\n    return x\n',
     'def gradient_descent(grad, x0, lr, steps):\n    x = x0\n    for _ in range(steps):\n        x = x - lr * grad(x)\n    return x\n',
     '''
import random
rnd = random.Random(43)
assert gradient_descent(lambda x: 2 * (x - 3), 0.0, 0.1, 0) == 0.0
assert abs(gradient_descent(lambda x: 2 * (x - 3), 0.0, 0.1, 200) - 3) < 1e-9          # minimum of (x - 3)^2
assert abs(gradient_descent(lambda x: 2 * x, 5.0, 0.25, 1) - 2.5) < 1e-12, "one step from 5 with lr 0.25 on x^2 goes to 5 - 0.25 * 10"
calls = []
gradient_descent(lambda x: calls.append(x) or 0.0, 1.0, 0.1, 7); assert len(calls) == 7, "grad must be called once per step, got %d" % len(calls)
for _ in range(100):
    a = rnd.uniform(0.5, 3); b = rnd.uniform(-4, 4)                                   # minimise a * (x - b)^2
    x = gradient_descent(lambda t: 2 * a * (t - b), rnd.uniform(-9, 9), 0.9 / (2 * a), 300)
    assert abs(x - b) < 1e-6, f"a={a}, b={b}: ended at {x}"
''',
     ['The update uses the gradient at the current x, then replaces x.', 'Going uphill (a plus sign by mistake) makes the error grow instead of shrink.'],
     HANDS('04_training_linear_models.ipynb'),
     ['def gradient_descent(grad, x0, lr, steps):\n    return x0\n', 'def gradient_descent(grad, x0, lr, steps):\n    x = x0\n    for _ in range(steps):\n        x = x + lr * grad(x)\n    return x\n']),
 lab('kmeans-1d', 'k-means clustering (one dimension)', 'Machine learning', 'Intermediate', 'Alternate two steps: assign each point to its nearest centre, then move each centre to the mean of its points.',
     'Write <code>kmeans_1d(points, centers, steps)</code> that runs <code>steps</code> rounds of Lloyd\'s algorithm on numbers: assign every point to the nearest centre (ties go to the lower index), then replace each centre by the mean of its points (a centre with no points stays where it is). Return the list of centres.',
     'kmeans_1d',
     'def kmeans_1d(points, centers, steps):\n    centers = list(centers)\n    for _ in range(steps):\n        # TODO: 1) clusters[j] = points whose nearest centre is j   2) move each centre to the mean of its cluster\n        pass\n    return centers\n',
     'def kmeans_1d(points, centers, steps):\n    centers = list(centers)\n    for _ in range(steps):\n        clusters = [[] for _ in centers]\n        for p in points:\n            j = min(range(len(centers)), key=lambda i: (abs(p - centers[i]), i))\n            clusters[j].append(p)\n        centers = [sum(c) / len(c) if c else centers[j] for j, c in enumerate(clusters)]\n    return centers\n',
     '''
import random
rnd = random.Random(45)
assert kmeans_1d([1, 2, 10, 11], [0, 5], 1) == [1.5, 10.5], kmeans_1d([1, 2, 10, 11], [0, 5], 1)
r = kmeans_1d([1, 2, 10, 11], [0, 5], 5); assert [round(v, 6) for v in r] == [1.5, 10.5], r
assert kmeans_1d([1, 2, 3], [100], 3) == [2.0]
assert kmeans_1d([1, 2, 3], [0, 1000], 4)[1] == 1000, "a centre with no points must stay where it is"
def inertia(points, centers):
    return sum(min((p - c) ** 2 for c in centers) for p in points)
for _ in range(150):
    pts = [rnd.uniform(0, 20) for _ in range(rnd.randint(2, 25))]
    k = rnd.randint(1, 4); start = [rnd.uniform(0, 20) for _ in range(k)]
    out = kmeans_1d(pts, start, 60)
    assert len(out) == k
    assert inertia(pts, out) <= inertia(pts, start) + 1e-9, "k-means never makes the total squared distance worse"
    for j, c in enumerate(out):                                       # at convergence each centre is the mean of its own points
        mine = [p for p in pts if min(range(k), key=lambda i: (abs(p - out[i]), i)) == j]
        if mine:
            assert abs(c - sum(mine) / len(mine)) < 1e-6, f"centre {j} = {c} is not the mean {sum(mine) / len(mine)} of its points"
one = kmeans_1d([0.0, 10.0], [0.0, 10.0], 1)
assert one == [0.0, 10.0]
''',
     ['min(range(len(centers)), key=lambda i: (abs(p - centers[i]), i)) picks the nearest centre and breaks ties by index.', 'Keep the old centre when its cluster is empty; do not divide by zero.'],
     HANDS('09_unsupervised_learning.ipynb'),
     ['def kmeans_1d(points, centers, steps):\n    return list(centers)\n', 'def kmeans_1d(points, centers, steps):\n    centers = list(centers)\n    for _ in range(steps):\n        clusters = [[] for _ in centers]\n        for p in points:\n            clusters[0].append(p)\n        centers = [sum(c) / len(c) if c else centers[j] for j, c in enumerate(clusters)]\n    return centers\n']),
]
