/* AI Foundations course: an original curriculum following the part/chapter sequence of
   Russell & Norvig, "Artificial Intelligence: A Modern Approach" (4th ed.). Lessons, maps, data, labs are original. */
window.AI_COURSE = {
  id: 'ai-foundations',
  title: 'Artificial Intelligence: Search, Reasoning, Uncertainty & Learning',
  short: 'AI Foundations',
  tabLabel: 'AI',
  subtitle: 'The classic, complete tour of AI: intelligent agents, search, games, constraints, logic, planning, probability, decisions, game theory, learning, language, robotics and ethics. Every algorithm built by you, in Python.',
  tag: 'New · Classic algorithms',
  category: 'foundations',
  accent: '#db2777',
  symbol: 'AI',
  level: 'Intermediate',
  lang: 'python',
  outcome: 'Think about AI as rational agents and implement its core algorithms yourself: graph search and A*, local search, minimax with alpha-beta, CSP backtracking, logical inference and unification, planning, Bayesian networks, HMMs, MDPs, game theory, decision trees, language models, Bayes filters and fairness metrics.',
  reference: 'Follows the part and chapter sequence of Russell & Norvig, Artificial Intelligence: A Modern Approach (4th ed.). Lessons, maps, examples and labs are original. The textbook goes far deeper; read it alongside.',
  learn: [
    'Model problems as rational agents in environments',
    'Implement BFS, uniform-cost, A* and local search',
    'Build game-playing AI with minimax and alpha-beta',
    'Solve constraint problems with backtracking and heuristics',
    'Reason with logic: model checking, unification, planning',
    'Compute with probability: Bayes nets, HMMs, filtering',
    'Make decisions: utilities, MDPs, value iteration, game theory',
    'Learn from data, model language, and assess AI ethics'
  ],
  parts: ['Artificial intelligence', 'Problem-solving', 'Knowledge, reasoning & planning', 'Uncertain knowledge & reasoning', 'Machine learning', 'Communicating, perceiving & acting', 'Conclusions'],
  lessons: [
  /* ---------- PART 1 ---------- */
  {
    id: 'what-is-ai', part: 0, chapter: 'Ch. 1', title: 'What is AI?', minutes: 13,
    goal: 'Compare the four views of AI and adopt the rational-agent view used throughout the course.',
    sections: [
      { h: 'Four ways to define AI', html: '<p>Definitions of AI vary along two axes: <b>thinking vs. acting</b>, and <b>human-like vs. rational</b>. That gives four views: <i>thinking humanly</i> (cognitive modeling), <i>thinking rationally</i> (laws of thought, logic), <i>acting humanly</i> (the Turing test) and <b>acting rationally</b> (rational agents). Explore all four in the interactive below.</p>' },
      { h: 'The rational agent', html: '<p>A <b>rational agent</b> acts to achieve the best <b>expected</b> outcome given what it knows. Rationality isn\'t omniscience: an agent can do the right thing and still be unlucky. This "standard model" is general (it covers logic, probability, learning) and mathematically precise. Its weak spot is that we must specify the objective correctly. That is the <b>value alignment problem</b>: a powerful system optimizing the wrong objective is dangerous, so agents should be uncertain about our true preferences and defer to us.</p>' },
      { h: 'Foundations and history', html: '<p>AI draws on philosophy, mathematics (logic, probability, computation), economics (utility, decision theory), neuroscience, psychology, computer engineering, control theory and linguistics. Its history runs through early enthusiasm (1950s–60s), expert systems (1980s), a turn to probability and machine learning (1990s–2000s), and deep learning and large models (2010s–today).</p>' }
    ],
    widget: 'aiapproaches',
    terms: [['Rational agent', 'Acts to maximize expected performance given its knowledge.'], ['Turing test', 'A test of acting humanly via indistinguishable conversation.'], ['Value alignment', 'Ensuring the objective we give machines matches what we truly want.']],
    lab: { intro: 'Every lab builds a classic AI algorithm in plain Python, right in your browser. <b>Run</b> to experiment, <b>Check</b> for hidden tests, <b>💡</b> if you\'re stuck.', tasks: [
      { prompt: 'Rationality = maximizing <b>expected</b> performance. Implement <code>expected_value(outcomes)</code> for a list of <code>(probability, score)</code> pairs and <code>rational_choice(actions)</code>, which returns the action with the highest expected value (ties → alphabetical first).',
        starter: `def expected_value(outcomes):
    return 0.0   # TODO: sum of p * score

def rational_choice(actions):
    return sorted(actions)[0]   # TODO: highest expected value, ties -> alphabetical

# An autonomous delivery robot choosing a route
actions = {
    "highway":  [(0.9, 10), (0.1, -50)],   # fast, small chance of a long jam
    "backroad": [(1.0, 4)],                # slow but certain
    "shortcut": [(0.5, 12), (0.5, -2)],    # risky alley
}
for a, o in actions.items():
    print(a, expected_value(o))
print("rational choice:", rational_choice(actions))`,
        solution: `def expected_value(outcomes):
    return sum(p * s for p, s in outcomes)

def rational_choice(actions):
    return min(actions, key=lambda a: (-expected_value(actions[a]), a))`,
        test: `assert abs(expected_value([(0.9, 10), (0.1, -50)]) - 4.0) < 1e-9
assert rational_choice(actions) == "shortcut"
assert rational_choice({"b": [(1.0, 3)], "a": [(0.5, 6), (0.5, 0)]}) == "a", "ties go to the alphabetically first action"` }
    ] },
    quiz: [
      { q: 'The Turing test measures…', options: ['Thinking rationally, using the laws of logic', 'Acting humanly', 'Thinking humanly, by modelling the mind', 'Acting rationally, by maximizing expected outcomes'], correct: 1, why: 'It asks whether a machine\'s behavior is indistinguishable from a human\'s.' },
      { q: 'Why is value alignment a central concern?', options: ['Agents are too slow to be useful for most real-world tasks, which is why alignment is studied', 'Logic is undecidable, so no agent can ever be given a goal', 'Data is expensive, so agents are trained with objectives that are cheap', 'A capable agent optimizing a mis-specified objective can cause harm'], correct: 3, why: 'The standard model assumes we specify the right objective.' }
    ]
  },
  {
    id: 'intelligent-agents', part: 0, chapter: 'Ch. 2', title: 'Intelligent agents & environments', minutes: 15,
    goal: 'Describe tasks with PEAS, classify environments, and compare agent architectures.',
    sections: [
      { h: 'Agents, percepts and actions', html: '<p>An <b>agent</b> perceives its environment through sensors and acts through actuators. Its behavior is an <b>agent function</b> mapping percept sequences to actions, implemented by an <b>agent program</b>. A task is specified by <b>PEAS</b>: <b>P</b>erformance measure, <b>E</b>nvironment, <b>A</b>ctuators, <b>S</b>ensors. For a robot vacuum: P = clean floor and low energy use; E = rooms and dirt; A = wheels and suction; S = camera, dirt sensor and bumpers.</p>' },
      { h: 'Kinds of environment', html: '<ul><li>Fully vs. <b>partially observable</b></li><li>Single vs. <b>multi-agent</b></li><li>Deterministic vs. <b>stochastic</b></li><li>Episodic vs. <b>sequential</b></li><li>Static vs. <b>dynamic</b></li><li>Discrete vs. <b>continuous</b></li><li>Known vs. unknown</li></ul><p>Driving a taxi is the hard end of every axis; a crossword puzzle the easy end.</p>' },
      { h: 'Agent architectures', html: '<p><b>Simple reflex</b> agents act on the current percept with condition–action rules. <b>Model-based</b> agents keep internal state about the unobserved world. <b>Goal-based</b> agents plan toward goals. <b>Utility-based</b> agents trade off goals by preference. <b>Learning</b> agents improve all of these from feedback. Race a reflex agent against a model-based one in the vacuum world below.</p>' }
    ],
    widget: 'vacuum',
    terms: [['PEAS', 'Performance, Environment, Actuators, Sensors: a task specification.'], ['Partially observable', 'Sensors don\'t reveal the full state.'], ['Model-based agent', 'Keeps internal state tracking unobserved parts of the world.']],
    lab: { tasks: [
      { prompt: 'In a two-square vacuum world, implement the <b>simple reflex</b> agent (Suck if dirty, else move to the other square) and a <b>model-based</b> agent that remembers which squares it knows are clean and returns <code>"NoOp"</code> once both are.',
        starter: `def reflex_agent(percept):
    location, status = percept
    return "NoOp"   # TODO

def make_model_agent():
    known_clean = set()
    def agent(percept):
        location, status = percept
        return "NoOp"   # TODO: Suck if dirty (then remember clean); NoOp if both known clean; else move
    return agent

def run(agent, dirt, location="A", steps=6):
    dirt, score, actions = dict(dirt), 0, []
    for _ in range(steps):
        a = agent((location, "Dirty" if dirt[location] else "Clean"))
        actions.append(a)
        if a == "Suck":
            dirt[location] = False
        elif a == "Right":
            location = "B"
        elif a == "Left":
            location = "A"
        score += sum(1 for d in dirt.values() if not d) - (1 if a in ("Right", "Left") else 0)
    return score, actions

print("reflex:", run(reflex_agent, {"A": True, "B": True}))
print("model :", run(make_model_agent(), {"A": True, "B": True}))`,
        solution: `def reflex_agent(percept):
    location, status = percept
    if status == "Dirty":
        return "Suck"
    return "Right" if location == "A" else "Left"

def make_model_agent():
    known_clean = set()
    def agent(percept):
        location, status = percept
        if status == "Dirty":
            known_clean.add(location)
            return "Suck"
        known_clean.add(location)
        if known_clean >= {"A", "B"}:
            return "NoOp"
        return "Right" if location == "A" else "Left"
    return agent`,
        test: `assert reflex_agent(("A", "Dirty")) == "Suck" and reflex_agent(("A", "Clean")) == "Right" and reflex_agent(("B", "Clean")) == "Left"
s1, a1 = run(reflex_agent, {"A": True, "B": True})
assert a1[:4] == ["Suck", "Right", "Suck", "Left"]
s2, a2 = run(make_model_agent(), {"A": True, "B": True})
assert a2[:4] == ["Suck", "Right", "Suck", "NoOp"] and all(a == "NoOp" for a in a2[3:]), a2
assert s2 > s1, "remembering the world should beat endless moving"` }
    ] },
    quiz: [
      { q: 'A poker-playing agent faces an environment that is…', options: ['Fully observable, deterministic, and with a single player taking turns', 'Single-agent and static, like a crossword puzzle being solved', 'Partially observable, stochastic, multi-agent', 'Episodic, where each hand is independent of the previous one and of the other players'], correct: 2, why: 'Hidden cards, random deals and opponents.' },
      { q: 'Why does the simple reflex vacuum agent waste energy?', options: ['It has no memory, so it keeps moving even when everything is clean', 'It cannot suck up dirt, so it has to visit every square twice', 'It is goal-based, so it plans a long route through the clean room', 'It learns too quickly and overwrites its own estimate of where the dirt is'], correct: 0, why: 'Without internal state it can\'t know both squares are clean.' }
    ]
  },
  /* ---------- PART 2 ---------- */
  {
    id: 'uninformed-search', part: 1, chapter: 'Ch. 3', title: 'Solving problems by searching', minutes: 16,
    goal: 'Formulate search problems and run breadth-first, depth-first and uniform-cost search.',
    sections: [
      { h: 'Search problems', html: '<p>A problem has an <b>initial state</b>, <b>actions</b>, a <b>transition model</b>, a <b>goal test</b> and an <b>action cost</b>. Search explores a <b>tree</b> (or graph) of states, keeping a <b>frontier</b> of nodes to expand and a <b>reached</b> set to avoid repeated states. Algorithms differ only in which frontier node they expand next.</p>' },
      { h: 'Uninformed strategies', html: '<ul><li><b>Breadth-first</b> (FIFO queue): finds the shallowest goal; complete, optimal when all steps cost the same; memory-hungry.</li><li><b>Depth-first</b> (LIFO stack): little memory; neither complete in infinite spaces nor optimal.</li><li><b>Uniform-cost / Dijkstra</b> (priority queue on path cost g): optimal for any positive costs.</li><li><b>Iterative deepening</b>: depth-limited DFS with growing limits, giving BFS\'s guarantees with DFS\'s memory.</li><li><b>Bidirectional</b>: search from both ends to meet in the middle.</li></ul><p>Draw walls and race the algorithms below.</p>' },
      { h: 'Measuring performance', html: '<p>Judge algorithms by <b>completeness</b>, <b>cost optimality</b>, <b>time</b> and <b>space</b>, expressed with branching factor <i>b</i> and depth <i>d</i>: BFS takes O(b<sup>d</sup>) time and space, so a branching factor of 10 at depth 12 is already infeasible to store.</p>' }
    ],
    widget: 'gridsearch',
    terms: [['Frontier', 'Generated nodes not yet expanded.'], ['Uniform-cost search', 'Expands the node with the lowest path cost g(n).'], ['Branching factor', 'Average number of successors per state.']],
    lab: { tasks: [
      { prompt: 'Implement <code>bfs(graph, start, goal)</code> (fewest edges; explore neighbors in sorted order) and <code>ucs(graph, start, goal)</code> (lowest total cost) on a map of towns. Return the path; UCS returns <code>(cost, path)</code>.',
        starter: `import heapq
from collections import deque

ROADS = [("Ashford", "Brook", 75), ("Ashford", "Cliff", 140), ("Ashford", "Dale", 118),
         ("Brook", "Elm", 71), ("Elm", "Cliff", 151), ("Cliff", "Fenwick", 99),
         ("Cliff", "Glen", 80), ("Glen", "Harbor", 97), ("Fenwick", "Harbor", 211),
         ("Dale", "Iver", 111), ("Iver", "Glen", 146)]
GRAPH = {}
for a, b, d in ROADS:
    GRAPH.setdefault(a, {})[b] = d
    GRAPH.setdefault(b, {})[a] = d

def bfs(graph, start, goal):
    frontier, parent = deque([start]), {start: None}
    # TODO: pop left, push unseen neighbors (sorted), rebuild path when goal reached
    return None

def ucs(graph, start, goal):
    frontier, best = [(0, start, [start])], {start: 0}
    # TODO: pop lowest cost; goal test on pop; push cheaper paths
    return None

print("BFS:", bfs(GRAPH, "Ashford", "Harbor"))
print("UCS:", ucs(GRAPH, "Ashford", "Harbor"))`,
        solution: `def bfs(graph, start, goal):
    frontier, parent = deque([start]), {start: None}
    while frontier:
        node = frontier.popleft()
        if node == goal:
            path = []
            while node is not None:
                path.append(node)
                node = parent[node]
            return path[::-1]
        for nb in sorted(graph[node]):
            if nb not in parent:
                parent[nb] = node
                frontier.append(nb)
    return None

def ucs(graph, start, goal):
    frontier, best = [(0, start, [start])], {start: 0}
    while frontier:
        cost, node, path = heapq.heappop(frontier)
        if node == goal:
            return cost, path
        if cost > best.get(node, float("inf")):
            continue
        for nb, d in graph[node].items():
            c = cost + d
            if c < best.get(nb, float("inf")):
                best[nb] = c
                heapq.heappush(frontier, (c, nb, path + [nb]))
    return None`,
        test: `assert bfs(GRAPH, "Ashford", "Harbor") == ["Ashford", "Cliff", "Fenwick", "Harbor"], bfs(GRAPH, "Ashford", "Harbor")
assert ucs(GRAPH, "Ashford", "Harbor") == (317, ["Ashford", "Cliff", "Glen", "Harbor"]), ucs(GRAPH, "Ashford", "Harbor")
assert bfs(GRAPH, "Elm", "Elm") == ["Elm"]
assert ucs(GRAPH, "Brook", "Iver")[0] == 75 + 118 + 111` }
    ] },
    quiz: [
      { q: 'BFS found a 3-road route costing 450 km; UCS found a 3-road route costing 317 km. Why?', options: ['BFS has a bug that makes it ignore the shorter road in this case', 'UCS ignores costs and simply picks the road with fewer towns', 'BFS minimizes the number of steps, not the total cost', 'They searched different maps, so the two routes cannot be compared'], correct: 2, why: 'BFS is only cost-optimal when every step costs the same.' },
      { q: 'Which uninformed search uses the least memory while staying complete?', options: ['Iterative deepening', 'Breadth-first search, which stores the whole frontier', 'Uniform-cost search, which stores every cheaper path', 'Bidirectional BFS, which stores two large frontiers'], correct: 0, why: 'IDS has DFS-like memory with BFS-like completeness.' }
    ]
  },
  {
    id: 'informed-search', part: 1, chapter: 'Ch. 3', title: 'Informed search: greedy & A*', minutes: 15,
    goal: 'Use heuristics to search smarter, and know when A* is optimal.',
    sections: [
      { h: 'Heuristics', html: '<p>A <b>heuristic</b> h(n) estimates the cost from n to the goal: straight-line distance on a map, Manhattan distance on a grid. <b>Greedy best-first</b> search expands the node that looks closest to the goal (lowest h). It is fast but can be fooled into long detours.</p>' },
      { h: 'A* search', html: '<p><b>A*</b> expands the node with the lowest f(n) = g(n) + h(n), the cost so far plus the estimated cost to go. If h is <b>admissible</b> (never overestimates), A* is cost-optimal; if it is also <b>consistent</b> (h(n) ≤ cost(n, n\') + h(n\')), it never needs to re-expand a node. Compare how many cells A* explores versus uniform-cost search below.</p>' },
      { h: 'Inventing heuristics', html: '<p>Good heuristics come from <b>relaxed problems</b> (drop a constraint: "tiles can move anywhere" gives misplaced-tiles; "tiles can slide over others" gives Manhattan distance), from <b>pattern databases</b> and from <b>learning</b>. A heuristic that dominates another (always ≥, still admissible) expands fewer nodes. When memory is the bottleneck, use IDA*, RBFS or SMA*.</p>' }
    ],
    widget: 'gridsearch-informed',
    terms: [['Heuristic', 'Estimated cost from a state to the nearest goal.'], ['Admissible', 'Never overestimates the true remaining cost.'], ['Consistent', 'h(n) ≤ step cost + h(successor).']],
    lab: { tasks: [
      { prompt: 'Implement <code>astar(grid)</code> on a grid (<code>#</code> = wall, 4-way moves, cost 1) with the Manhattan heuristic. Return <code>(path_length, expanded_count)</code>. Passing <code>h_zero=True</code> turns it into uniform-cost search; A* must find the same length while expanding fewer cells.',
        starter: `import heapq
GRID = ["S...#.....",
        ".##.#.###.",
        ".#..#...#.",
        ".#.####.#.",
        ".#......#G",
        "...##.#..."]

def find(grid, ch):
    for r, row in enumerate(grid):
        if ch in row:
            return r, row.index(ch)

def astar(grid, h_zero=False):
    start, goal = find(grid, "S"), find(grid, "G")
    h = (lambda p: 0) if h_zero else (lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1]))
    frontier, g, expanded, count = [(h(start), 0, start)], {start: 0}, set(), 0
    # TODO: pop lowest f; skip if expanded; count expansions; goal -> return (g, count)
    #       neighbors: 4 directions inside grid and not '#'
    return None

print("A*  :", astar(GRID))
print("UCS :", astar(GRID, h_zero=True))`,
        solution: `def astar(grid, h_zero=False):
    start, goal = find(grid, "S"), find(grid, "G")
    h = (lambda p: 0) if h_zero else (lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1]))
    frontier, g, expanded, count = [(h(start), 0, start)], {start: 0}, set(), 0
    while frontier:
        f, cost, node = heapq.heappop(frontier)
        if node in expanded:
            continue
        expanded.add(node)
        count += 1
        if node == goal:
            return cost, count
        r, c = node
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] != "#":
                if cost + 1 < g.get((nr, nc), float("inf")):
                    g[(nr, nc)] = cost + 1
                    heapq.heappush(frontier, (cost + 1 + h((nr, nc)), cost + 1, (nr, nc)))
    return None`,
        test: `from collections import deque
s, gl = find(GRID, "S"), find(GRID, "G")
dist, q = {s: 0}, deque([s])
while q:
    r, c = q.popleft()
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < len(GRID) and 0 <= nc < len(GRID[0]) and GRID[nr][nc] != "#" and (nr, nc) not in dist:
            dist[(nr, nc)] = dist[(r, c)] + 1
            q.append((nr, nc))
a, u = astar(GRID), astar(GRID, h_zero=True)
assert a[0] == dist[gl] and u[0] == dist[gl], (a, u, dist[gl])
assert a[1] < u[1], "A* should expand fewer cells than uniform-cost search"` }
    ] },
    quiz: [
      { q: 'A* is guaranteed cost-optimal (tree search) when the heuristic is…', options: ['Large, so that it overestimates the remaining cost', 'Admissible', 'Random, so that it explores different parts of the map', 'Zero only, since only the null heuristic is safe'], correct: 1, why: 'Admissible heuristics never overestimate.' },
      { q: 'Dropping a rule of the puzzle to create an easier problem whose solution cost is a heuristic is called…', options: ['Pruning, which discards branches that cannot win', 'Backtracking, which undoes the last choice on failure', 'Unification, which matches logical terms with each other', 'A relaxed problem'], correct: 3, why: 'Relaxed-problem costs are admissible heuristics.' }
    ]
  },
  {
    id: 'local-search', part: 1, chapter: 'Ch. 4', title: 'Search in complex environments: local search', minutes: 15,
    goal: 'Optimize with hill climbing, simulated annealing and genetic algorithms; handle uncertainty.',
    sections: [
      { h: 'When the path doesn\'t matter', html: '<p>In many problems (8-queens, scheduling, circuit layout) only the final state matters. <b>Local search</b> keeps one current state and moves to neighbors, using very little memory. The goal is to optimize an <b>objective function</b> over a state-space <b>landscape</b>.</p>' },
      { h: 'Strategies', html: '<ul><li><b>Hill climbing</b>: move to the best neighbor. It gets stuck on local maxima, ridges and plateaus.</li><li><b>Random restarts</b>: repeat from random states. This is surprisingly effective.</li><li><b>Simulated annealing</b>: accept some downhill moves, more often while the "temperature" is high, and cool slowly.</li><li><b>Local beam search</b>: keep k states.</li><li><b>Genetic algorithms</b>: a population evolved by selection, crossover and mutation.</li></ul><p>Try them on a bumpy landscape below.</p>' },
      { h: 'Beyond deterministic, observable worlds', html: '<p>With nondeterministic actions, solutions become <b>contingency plans</b> (AND-OR search). With partial observability, agents search in <b>belief-state</b> space. In unknown environments, <b>online search</b> agents must act and learn the map as they go, as a robot exploring a building does.</p>' }
    ],
    widget: 'landscape',
    terms: [['Local maximum', 'A peak higher than its neighbors but not the highest.'], ['Simulated annealing', 'Random moves accepted with probability that decreases over time.'], ['Belief state', 'The set of physical states the agent might be in.']],
    lab: { tasks: [
      { prompt: 'Solve <b>8-queens</b> with hill climbing + random restarts. <code>state[c]</code> is the row of the queen in column c. Implement <code>conflicts(state)</code> (attacking pairs: same row or same diagonal) and the best-neighbor step in <code>hill_climb</code>.',
        starter: `import random

def conflicts(state):
    return 0   # TODO: count pairs (i < j) on the same row or diagonal

def hill_climb(n, rng):
    state = [rng.randrange(n) for _ in range(n)]
    while True:
        best, best_c = None, conflicts(state)
        # TODO: try moving each queen to every other row; keep the neighbor with fewest conflicts
        if best is None:
            return state
        state = best

def solve(n=8, seed=1, max_restarts=200):
    rng = random.Random(seed)
    for restart in range(max_restarts):
        s = hill_climb(n, rng)
        if conflicts(s) == 0:
            return s, restart
    return None, max_restarts

solution, restarts = solve()
print("solution:", solution, "after", restarts, "restarts")`,
        solution: `def conflicts(state):
    n, c = len(state), 0
    for i in range(n):
        for j in range(i + 1, n):
            if state[i] == state[j] or abs(state[i] - state[j]) == j - i:
                c += 1
    return c

def hill_climb(n, rng):
    state = [rng.randrange(n) for _ in range(n)]
    while True:
        best, best_c = None, conflicts(state)
        for col in range(n):
            for row in range(n):
                if row != state[col]:
                    cand = state[:col] + [row] + state[col + 1:]
                    c = conflicts(cand)
                    if c < best_c:
                        best, best_c = cand, c
        if best is None:
            return state
        state = best`,
        test: `assert conflicts([0, 1, 2, 3]) == 6 and conflicts([1, 3, 0, 2]) == 0
assert conflicts([0, 0]) == 1
s, r = solve(8, seed=1)
assert s is not None and conflicts(s) == 0 and len(s) == 8, (s, r)` }
    ] },
    quiz: [
      { q: 'Hill climbing stops at a state no neighbor improves, but it isn\'t the best solution. This is a…', options: ['Global maximum, the best state in the whole landscape', 'Goal state, where the search has solved the problem', 'Frontier, the set of states waiting to be expanded', 'Local maximum'], correct: 3, why: 'Greedy moves get trapped on local peaks.' },
      { q: 'Simulated annealing escapes local maxima by…', options: ['Never moving downhill, so that it always keeps the best state found so far in memory', 'Using a better heuristic to rank all the neighbouring states', 'Sometimes accepting worse moves, less often as temperature drops', 'Backtracking to the previous state whenever a move fails'], correct: 2, why: 'Controlled randomness lets it leave local peaks.' }
    ]
  },
  {
    id: 'adversarial-search', part: 1, chapter: 'Ch. 5', title: 'Adversarial search & games', minutes: 16,
    goal: 'Play optimally with minimax, prune with alpha-beta, and know how modern game AIs work.',
    sections: [
      { h: 'Games as search', html: '<p>In two-player, zero-sum, perfect-information games (tic-tac-toe, chess, Go), MAX tries to maximize the outcome and MIN to minimize it. <b>Minimax</b> computes each state\'s value by assuming both play optimally: MAX nodes take the maximum of their children, MIN nodes the minimum.</p>' },
      { h: 'Alpha-beta pruning', html: '<p>Many branches can\'t affect the decision. <b>Alpha-beta</b> tracks α (the best value MAX can guarantee so far) and β (the best for MIN) and prunes a branch as soon as it can\'t change the result. It returns the same move as minimax; with good move ordering it searches about twice as deep. Play against the AI below and compare node counts with and without pruning.</p>' },
      { h: 'Real games', html: '<p>Deep games can\'t be searched to the end: use <b>cutoff tests</b> with a heuristic <b>evaluation function</b> (material, mobility), plus transposition tables. <b>Monte Carlo tree search</b> estimates values by random playouts and balances exploration and exploitation (UCT). With learned policy and value networks, it powered superhuman Go play. Stochastic games use <b>expectiminimax</b>; partially observable ones (poker) need belief reasoning.</p>' }
    ],
    widget: 'tictactoe',
    terms: [['Minimax', 'Optimal play assuming the opponent also plays optimally.'], ['Alpha-beta pruning', 'Skips branches that cannot affect the minimax decision.'], ['MCTS', 'Monte Carlo tree search: values from simulated playouts.']],
    lab: { tasks: [
      { prompt: '<code>minimax</code> is provided. Implement <code>alphabeta(board, player, alpha, beta)</code>, which returns <code>(score, move)</code> exactly like minimax but prunes when <code>alpha >= beta</code>. Both count visited nodes in <code>STATS</code>.',
        starter: `LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
STATS = {"nodes": 0}

def winner(b):
    for i, j, k in LINES:
        if b[i] != " " and b[i] == b[j] == b[k]:
            return b[i]
    return None

def moves(b):
    return [i for i, x in enumerate(b) if x == " "]

def play(b, i, p):
    return b[:i] + [p] + b[i + 1:]

def minimax(b, player):
    STATS["nodes"] += 1
    w = winner(b)
    if w or not moves(b):
        return (1 if w == "X" else -1 if w == "O" else 0), None
    results = [(minimax(play(b, m, player), "O" if player == "X" else "X")[0], m) for m in moves(b)]
    return max(results) if player == "X" else min(results, key=lambda t: (t[0], -t[1]))

def alphabeta(b, player, alpha=-2, beta=2):
    STATS["nodes"] += 1
    w = winner(b)
    if w or not moves(b):
        return (1 if w == "X" else -1 if w == "O" else 0), None
    # TODO: like minimax, but update alpha (for X) / beta (for O) and stop when alpha >= beta
    return 0, moves(b)[0]

board = list("X O  O  X")   # X to move
for f in (minimax, alphabeta):
    STATS["nodes"] = 0
    print(f.__name__, f(board, "X"), "nodes:", STATS["nodes"])`,
        solution: `def alphabeta(b, player, alpha=-2, beta=2):
    STATS["nodes"] += 1
    w = winner(b)
    if w or not moves(b):
        return (1 if w == "X" else -1 if w == "O" else 0), None
    best_move = None
    if player == "X":
        value = -2
        for m in moves(b):
            v, _ = alphabeta(play(b, m, "X"), "O", alpha, beta)
            if v > value:
                value, best_move = v, m
            alpha = max(alpha, value)
            if alpha >= beta:
                break
    else:
        value = 2
        for m in moves(b):
            v, _ = alphabeta(play(b, m, "O"), "X", alpha, beta)
            if v < value:
                value, best_move = v, m
            beta = min(beta, value)
            if alpha >= beta:
                break
    return value, best_move`,
        test: `for pos, p in [(list("X O  O  X"), "X"), (list("XX OO    "), "X"), (list("XX OO   X"), "O"), (list(" " * 4 + "X" + " " * 4), "O")]:
    STATS["nodes"] = 0; mv, _ = minimax(pos, p); n1 = STATS["nodes"]
    STATS["nodes"] = 0; ab, move = alphabeta(pos, p); n2 = STATS["nodes"]
    assert ab == mv, (pos, ab, mv)
    assert winner(play(pos, move, p)) == p or ab == minimax(play(pos, move, p), "O" if p == "X" else "X")[0], "move must achieve the value"
    assert n2 <= n1
assert alphabeta(list("XX OO    "), "X")[1] == 2, "take the immediate win"
STATS["nodes"] = 0; minimax(list(" " * 4 + "X" + " " * 4), "O"); a = STATS["nodes"]
STATS["nodes"] = 0; alphabeta(list(" " * 4 + "X" + " " * 4), "O"); assert STATS["nodes"] < a / 3, "alpha-beta should prune a lot"` }
    ] },
    quiz: [
      { q: 'Alpha-beta pruning changes the chosen move compared with minimax…', options: ['Never: it returns the same value, just faster', 'Always, because pruning removes some of the legal moves from the game', 'Only in chess, where the branching factor is large enough', 'Only with bad move ordering, when too many branches are cut'], correct: 0, why: 'Pruned branches provably can\'t affect the decision.' },
      { q: 'Which technique estimates a position\'s value from random playouts?', options: ['Alpha-beta pruning, which cuts branches that cannot matter', 'Monte Carlo tree search', 'Iterative deepening, which repeats depth-limited searches', 'Unification, which matches variables in logical sentences'], correct: 1, why: 'MCTS averages simulated game results.' }
    ]
  },
  {
    id: 'csp', part: 1, chapter: 'Ch. 6', title: 'Constraint satisfaction problems', minutes: 15,
    goal: 'Model problems as CSPs and solve them with backtracking, heuristics and propagation.',
    sections: [
      { h: 'Variables, domains, constraints', html: '<p>A <b>CSP</b> has variables, each with a domain of values, and constraints that restrict which combinations are allowed. Map coloring (adjacent regions get different colors), Sudoku, timetabling and job-shop scheduling are all CSPs. A <b>factored</b> representation lets general-purpose algorithms exploit structure.</p>' },
      { h: 'Inference: constraint propagation', html: '<p><b>Node consistency</b> and <b>arc consistency</b> (AC-3) prune values that can\'t possibly work. <b>Forward checking</b>: after assigning a variable, remove inconsistent values from its neighbors\' domains, and fail fast if any domain becomes empty.</p>' },
      { h: 'Backtracking search and heuristics', html: '<p>Assign one variable at a time and backtrack on failure. Big speedups come from <b>MRV</b> (choose the variable with the fewest remaining values), the <b>degree</b> heuristic (most constraints on others) and <b>least-constraining value</b> ordering. Local search with <b>min-conflicts</b> solves huge CSPs such as million-queens. Watch backtracking color a map below, with and without the heuristics.</p>' }
    ],
    widget: 'mapcolor',
    terms: [['Arc consistency', 'Every value in X\'s domain has a compatible value in Y\'s.'], ['MRV', 'Minimum remaining values: choose the most constrained variable.'], ['Forward checking', 'Prune neighbors\' domains after each assignment.']],
    lab: { tasks: [
      { prompt: 'Implement <code>backtrack(assignment, domains)</code> with <b>MRV</b> and <b>forward checking</b> for map coloring. Return a complete valid assignment or <code>None</code>. The counter shows how many assignments you tried.',
        starter: `NEIGHBORS = {
    "North": ["Lakes", "Hills", "Coast"], "Lakes": ["North", "Hills", "Plains"],
    "Hills": ["North", "Lakes", "Plains", "Coast", "Valley"], "Coast": ["North", "Hills"],
    "Plains": ["Lakes", "Hills", "Valley"], "Valley": ["Hills", "Plains"], "Isle": [],
}
TRIED = {"n": 0}

def consistent(var, val, assignment):
    return all(assignment.get(nb) != val for nb in NEIGHBORS[var])

def backtrack(assignment, domains):
    if len(assignment) == len(NEIGHBORS):
        return assignment
    # TODO: var = unassigned variable with the fewest values in domains (MRV)
    # TODO: for each val: if consistent -> TRIED["n"] += 1; prune val from unassigned neighbors' domains;
    #       skip if any domain becomes empty; recurse; return result if not None
    return None

def solve(colors):
    TRIED["n"] = 0
    return backtrack({}, {v: list(colors) for v in NEIGHBORS})

print(solve(["red", "green", "blue"]), "tried", TRIED["n"])
print(solve(["red", "green"]))`,
        solution: `def backtrack(assignment, domains):
    if len(assignment) == len(NEIGHBORS):
        return assignment
    var = min((v for v in NEIGHBORS if v not in assignment), key=lambda v: (len(domains[v]), v))
    for val in domains[var]:
        if not consistent(var, val, assignment):
            continue
        TRIED["n"] += 1
        new_domains = {v: list(d) for v, d in domains.items()}
        new_domains[var] = [val]
        ok = True
        for nb in NEIGHBORS[var]:
            if nb not in assignment and val in new_domains[nb]:
                new_domains[nb].remove(val)
                if not new_domains[nb]:
                    ok = False
        if ok:
            result = backtrack({**assignment, var: val}, new_domains)
            if result is not None:
                return result
    return None`,
        test: `sol = solve(["red", "green", "blue"])
assert sol is not None and len(sol) == len(NEIGHBORS)
assert all(sol[a] != sol[b] for a in NEIGHBORS for b in NEIGHBORS[a]), sol
assert solve(["red", "green"]) is None, "the North-Lakes-Hills triangle needs 3 colors"
solve(["red", "green", "blue"]); assert TRIED["n"] <= 10, TRIED["n"]` }
    ] },
    quiz: [
      { q: 'The MRV heuristic picks…', options: ['The variable with the fewest legal values left', 'The variable with the most legal values left, to keep options open', 'A random variable, so that the search is not biased', 'The last variable in the original ordering of the problem'], correct: 0, why: 'Most constrained first means failing fast.' },
      { q: 'Forward checking detects failure when…', options: ['All variables are assigned, so the search has finished successfully', 'A heuristic is inadmissible, so it overestimates the cost', 'Some unassigned variable\'s domain becomes empty', 'It never detects failure early, only after the whole assignment is complete'], correct: 2, why: 'An empty domain means no consistent completion exists.' }
    ]
  },
  /* ---------- PART 3 ---------- */
  {
    id: 'logical-agents', part: 2, chapter: 'Ch. 7', title: 'Logical agents & propositional logic', minutes: 16,
    goal: 'Represent knowledge in propositional logic and decide entailment by model checking.',
    sections: [
      { h: 'Knowledge-based agents', html: '<p>A knowledge-based agent keeps a <b>knowledge base (KB)</b> of sentences, TELLs it what it perceives, and ASKs it what to do. The classic testbed is a cave grid with hidden pits and a monster: <b>breezes</b> are felt next to pits, a <b>stench</b> next to the monster. From these percepts the agent must infer which squares are safe.</p>' },
      { h: 'Propositional logic', html: '<p>Sentences are built from symbols with ¬, ∧, ∨, ⇒ and ⇔. A <b>model</b> assigns true/false to every symbol. <b>KB ⊨ α</b> (entailment) means α is true in every model where the KB is true. <b>Model checking</b> enumerates models to test it, which is exponential but simple. Explore the cave below: the agent marks a square safe only when <i>every</i> pit arrangement consistent with its percepts agrees.</p>' },
      { h: 'Theorem proving', html: '<p>Instead of enumerating models, apply sound <b>inference rules</b> (Modus Ponens, and-elimination, <b>resolution</b>). Resolution on CNF is complete. For Horn clauses, <b>forward and backward chaining</b> run in linear time. Modern SAT solvers (DPLL, CDCL, WalkSAT) handle millions of variables.</p>' }
    ],
    widget: 'wumpus',
    terms: [['Entailment', 'KB ⊨ α: α is true in every model of the KB.'], ['Model checking', 'Deciding entailment by enumerating models.'], ['Resolution', 'Inference rule that is complete for propositional CNF.']],
    lab: { tasks: [
      { prompt: 'Implement <code>tt_entails(kb, query, symbols)</code>: enumerate every truth assignment; the KB entails the query if the query holds in <b>all</b> models where the KB holds. Sentences are Python functions of a model dict.',
        starter: `from itertools import product

def tt_entails(kb, query, symbols):
    # TODO: for values in product([True, False], repeat=len(symbols)): build model; check
    return False

# Cave world: Pxy = pit at (x,y), Bxy = breeze felt at (x,y). We stand at (1,1), already visited (2,1).
symbols = ["P12", "P21", "P22", "P31", "B11", "B21"]
kb = lambda m: (
    m["B11"] == (m["P12"] or m["P21"]) and     # breeze at (1,1) iff a pit next to it
    m["B21"] == (m["P22"] or m["P31"]) and     # breeze at (2,1) iff a pit at (2,2) or (3,1)
    not m["B11"] and m["B21"]                  # percepts: no breeze at (1,1), breeze at (2,1)
)
print("(1,2) safe?           ", tt_entails(kb, lambda m: not m["P12"], symbols))
print("pit at (2,2)?         ", tt_entails(kb, lambda m: m["P22"], symbols))
print("pit at (2,2) or (3,1)?", tt_entails(kb, lambda m: m["P22"] or m["P31"], symbols))`,
        solution: `def tt_entails(kb, query, symbols):
    for values in product([True, False], repeat=len(symbols)):
        model = dict(zip(symbols, values))
        if kb(model) and not query(model):
            return False
    return True`,
        test: `assert tt_entails(kb, lambda m: not m["P12"], symbols) and tt_entails(kb, lambda m: not m["P21"], symbols)
assert not tt_entails(kb, lambda m: m["P22"], symbols), "the pit could be at (3,1) instead"
assert tt_entails(kb, lambda m: m["P22"] or m["P31"], symbols)
A = ["A", "B"]
assert tt_entails(lambda m: m["A"] and m["B"], lambda m: m["A"], A)
assert not tt_entails(lambda m: m["A"] or m["B"], lambda m: m["A"], A)
assert tt_entails(lambda m: False, lambda m: m["A"], A), "a contradictory KB entails anything"` }
    ] },
    quiz: [
      { q: 'KB ⊨ α means…', options: ['α is true in some model of the KB, but maybe not in all of them', 'α is written in the KB as one of its original sentences', 'The KB is false in every model that makes α true', 'α is true in every model where the KB is true'], correct: 3, why: 'That is the definition of entailment.' },
      { q: 'Why do practical systems prefer SAT solvers or resolution over truth tables?', options: ['Truth tables are unsound, so they can prove false sentences', 'Truth tables grow as 2ⁿ in the number of symbols', 'Truth tables cannot express disjunction, only conjunction', 'SAT solvers and truth tables are equivalent in speed on large problems'], correct: 1, why: 'Model enumeration is exponential.' }
    ]
  },
  {
    id: 'first-order-logic', part: 2, chapter: 'Ch. 8–9', title: 'First-order logic & inference', minutes: 16,
    goal: 'Express objects and relations in FOL, and infer with unification and chaining.',
    sections: [
      { h: 'Objects, relations, quantifiers', html: '<p>Propositional logic can\'t say "every parent is older than their child" compactly. <b>First-order logic</b> has <b>constants</b> (Ada), <b>predicates</b> (Parent(x, y)), <b>functions</b> (Mother(x)), variables, and the quantifiers <b>∀</b> and <b>∃</b>: ∀x ∀y Parent(x, y) ⇒ Older(x, y). Knowledge engineering means choosing a vocabulary, encoding general rules and the specific facts, and then querying.</p>' },
      { h: 'Unification', html: '<p>Inference rules need to match patterns with variables. <b>Unification</b> finds a substitution that makes two expressions identical: Knows(Ada, x) and Knows(y, Mother(y)) unify with {y/Ada, x/Mother(Ada)}. The <b>occurs check</b> prevents x from unifying with f(x). Generalized Modus Ponens plus unification lifts propositional inference to FOL.</p>' },
      { h: 'Forward and backward chaining, resolution', html: '<p><b>Forward chaining</b> fires rules whose premises are known, adding facts until the query appears (data-driven, used in production systems). <b>Backward chaining</b> works from the query back to known facts (goal-driven; the basis of Prolog). <b>Resolution</b> with unification is complete for FOL. Step a forward-chaining knowledge base below.</p>' }
    ],
    widget: 'chaining',
    terms: [['Quantifier', '∀ (for all) or ∃ (there exists) over variables.'], ['Unifier', 'A substitution making two expressions identical.'], ['Occurs check', 'Prevents binding a variable to a term containing itself.']],
    lab: { tasks: [
      { prompt: 'Implement <code>unify(x, y, theta)</code>. Variables are strings starting with <code>?</code>, constants are other strings, and compound terms are tuples like <code>("Knows", "Ada", "?x")</code>. Return the substitution dict, or <code>None</code> on failure. Include the occurs check.',
        starter: `def is_var(t):
    return isinstance(t, str) and t.startswith("?")

def substitute(t, theta):
    if is_var(t) and t in theta:
        return substitute(theta[t], theta)
    if isinstance(t, tuple):
        return tuple(substitute(a, theta) for a in t)
    return t

def occurs(var, t, theta):
    t = substitute(t, theta)
    return t == var or (isinstance(t, tuple) and any(occurs(var, a, theta) for a in t))

def unify(x, y, theta=None):
    theta = {} if theta is None else theta
    # TODO: handle: already equal; x var; y var; both tuples of equal length (unify element-wise)
    return None

print(unify(("Knows", "Ada", "?x"), ("Knows", "?y", ("Mother", "?y"))))
print(unify(("Knows", "Ada", "?x"), ("Knows", "?x", "Elizabeth")))`,
        solution: `def unify(x, y, theta=None):
    theta = {} if theta is None else theta
    x, y = substitute(x, theta), substitute(y, theta)
    if x == y:
        return theta
    if is_var(x):
        return None if occurs(x, y, theta) else {**theta, x: y}
    if is_var(y):
        return None if occurs(y, x, theta) else {**theta, y: x}
    if isinstance(x, tuple) and isinstance(y, tuple) and len(x) == len(y):
        for a, b in zip(x, y):
            theta = unify(a, b, theta)
            if theta is None:
                return None
        return theta
    return None`,
        test: `th = unify(("Knows", "Ada", "?x"), ("Knows", "?y", ("Mother", "?y")))
assert substitute(("Knows", "Ada", "?x"), th) == ("Knows", "Ada", ("Mother", "Ada")), th
assert unify(("Knows", "Ada", "?x"), ("Knows", "?x", "Elizabeth")) is None
assert unify("?x", ("f", "?x")) is None, "occurs check"
assert unify(("P", "a", "b"), ("P", "a")) is None
assert unify("A", "A") == {}` }
    ] },
    quiz: [
      { q: 'Which sentence says "everyone loves someone"?', options: ['∃y ∀x Loves(x, y)', '∀x ∀y Loves(x, y)', '∀x ∃y Loves(x, y)', '∀x ¬∃y Loves(x, y)'], correct: 2, why: 'For each x there exists some y (possibly different).' },
      { q: 'Prolog answers queries mainly with…', options: ['Backward chaining', 'Forward chaining, from facts toward conclusions', 'Simulated annealing, with a falling temperature', 'Value iteration, over the states of an MDP'], correct: 0, why: 'Prolog is goal-driven backward chaining.' }
    ]
  },
  {
    id: 'knowledge-planning', part: 2, chapter: 'Ch. 10–11', title: 'Knowledge representation & automated planning', minutes: 16,
    goal: 'Organize knowledge with ontologies, and find plans with STRIPS-style actions.',
    sections: [
      { h: 'Representing the world', html: '<p>Large knowledge bases need structure: an <b>upper ontology</b> of general concepts (objects, events, time, substances), <b>categories</b> with inheritance (every Laptop is a Computer), <b>events</b> and <b>mental objects</b> (beliefs). <b>Semantic networks</b> and <b>description logics</b> make category reasoning efficient; default reasoning handles exceptions ("birds fly, except penguins").</p>' },
      { h: 'Classical planning', html: '<p>Planning languages (STRIPS, PDDL) describe a state as a set of facts, and each <b>action schema</b> by its <b>preconditions</b> and <b>effects</b> (facts added and deleted). A planner searches for an action sequence from the initial state to a goal: <b>forward</b> (progression) or <b>backward</b> (regression) search, guided by domain-independent heuristics such as ignore-preconditions or ignore-delete-lists. Watch a blocks-world planner below.</p>' },
      { h: 'Planning in the real world', html: '<p>Real plans need <b>hierarchy</b> (high-level actions refined into steps), <b>time and resources</b> (scheduling), and handling of uncertainty (sensorless, contingent and online replanning). Planning powers logistics, space missions, games and, increasingly, LLM agents.</p>' }
    ],
    widget: 'blocksworld',
    terms: [['Ontology', 'A structured vocabulary of categories and relations.'], ['Action schema', 'Preconditions and add/delete effects of an action.'], ['Progression planning', 'Forward search from the initial state.']],
    lab: { tasks: [
      { prompt: 'Implement <code>applicable</code>, <code>result</code> and a breadth-first <code>plan(init, goal, actions)</code> for STRIPS actions (sets of precondition/add/delete facts). Solve the classic three-block puzzle in the minimum number of moves.',
        starter: `from collections import deque
from itertools import permutations

BLOCKS = ["A", "B", "C"]
ACTIONS = []
for b, x, y in permutations(BLOCKS + ["Table"], 3):
    if b == "Table" or x == y:
        continue
    pre = {f"On({b},{x})", f"Clear({b})"} | ({f"Clear({y})"} if y != "Table" else set())
    add = {f"On({b},{y})"} | ({f"Clear({x})"} if x != "Table" else set())
    dele = {f"On({b},{x})"} | ({f"Clear({y})"} if y != "Table" else set())
    ACTIONS.append((f"Move({b},{x},{y})", frozenset(pre), frozenset(add), frozenset(dele)))

def applicable(state, action):
    return False   # TODO: all preconditions in state

def result(state, action):
    return state   # TODO: (state - delete) | add

def plan(init, goal, actions):
    frontier, seen = deque([(frozenset(init), [])]), {frozenset(init)}
    # TODO: BFS; return the list of action names when goal <= state
    return None

init = {"On(C,A)", "On(A,Table)", "On(B,Table)", "Clear(C)", "Clear(B)"}
goal = {"On(A,B)", "On(B,C)"}
print(plan(init, goal, ACTIONS))`,
        solution: `def applicable(state, action):
    return action[1] <= state

def result(state, action):
    return (state - action[3]) | action[2]

def plan(init, goal, actions):
    frontier, seen = deque([(frozenset(init), [])]), {frozenset(init)}
    while frontier:
        state, steps = frontier.popleft()
        if goal <= state:
            return steps
        for a in actions:
            if applicable(state, a):
                nxt = result(state, a)
                if nxt not in seen:
                    seen.add(nxt)
                    frontier.append((nxt, steps + [a[0]]))
    return None`,
        test: `p = plan(init, goal, ACTIONS)
assert p is not None and len(p) == 3, p
s = frozenset(init)
for name in p:
    a = next(x for x in ACTIONS if x[0] == name)
    assert applicable(s, a), name
    s = result(s, a)
assert goal <= s
assert plan(init, {"On(C,A)"}, ACTIONS) == []` }
    ] },
    quiz: [
      { q: 'In STRIPS, an action\'s effects are described by…', options: ['A utility function over the resulting states', 'Add and delete lists of facts', 'A neural network that predicts the next state', 'Probabilities for each possible outcome of the action'], correct: 1, why: 'States change by adding and deleting facts.' },
      { q: 'The "ignore delete lists" heuristic works by…', options: ['Making the problem harder so that the heuristic is a stronger bound', 'Random restarts of the planner until a plan is found', 'Unification of the action schemas with the initial state facts', 'Solving a relaxed problem where actions never undo facts'], correct: 3, why: 'Relaxation yields an informative estimate of plan length.' }
    ]
  },
  /* ---------- PART 4 ---------- */
  {
    id: 'probability', part: 3, chapter: 'Ch. 12', title: 'Quantifying uncertainty', minutes: 15,
    goal: 'Reason with probability: joint distributions, conditioning, Bayes\' rule and naive Bayes.',
    sections: [
      { h: 'Why probability', html: '<p>Logic fails when rules have exceptions and knowledge is incomplete ("a toothache usually means a cavity"). <b>Probability</b> summarizes uncertainty from laziness and ignorance. A <b>decision-theoretic</b> agent combines probabilities with utilities to choose actions.</p>' },
      { h: 'The basic machinery', html: '<p>A <b>full joint distribution</b> assigns a probability to every combination of variable values; any query can be answered by summing entries (<b>marginalization</b>) and dividing (<b>conditioning</b>: P(a | b) = P(a ∧ b) / P(b)). <b>Independence</b> and <b>conditional independence</b> shrink the tables dramatically.</p>' },
      { h: 'Bayes\' rule', html: '<p>P(cause | effect) = P(effect | cause) · P(cause) / P(effect). It turns easy-to-know causal knowledge (test sensitivity) into the diagnostic knowledge we need (chance of disease given a positive test). Rare diseases give surprisingly low posteriors: try it below. <b>Naive Bayes</b> assumes effects are conditionally independent given the cause; it is simple, fast and often accurate (e.g. spam filtering).</p>' }
    ],
    widget: 'bayes',
    terms: [['Marginalization', 'Summing out variables from a joint distribution.'], ['Conditional independence', 'X and Y independent given Z.'], ['Posterior', 'Probability after observing evidence.']],
    lab: { tasks: [
      { prompt: 'Using the full joint distribution over <code>(flu, fever, cough)</code>, implement <code>prob(event)</code> (sum of matching entries) and <code>cond(query, evidence)</code>. Then implement <code>bayes(prior, sensitivity, specificity)</code> for P(disease | positive test).',
        starter: `JOINT = {  # (flu, fever, cough): probability
    (True, True, True): 0.060, (True, True, False): 0.020, (True, False, True): 0.012, (True, False, False): 0.008,
    (False, True, True): 0.030, (False, True, False): 0.070, (False, False, True): 0.090, (False, False, False): 0.710,
}

def prob(event):
    return 0.0   # TODO: event(flu, fever, cough) -> bool

def cond(query, evidence):
    return 0.0   # TODO: P(query and evidence) / P(evidence)

def bayes(prior, sensitivity, specificity):
    return 0.0   # TODO: P(D|+) = sens*prior / (sens*prior + (1-spec)*(1-prior))

print("P(flu)               =", round(prob(lambda f, fe, c: f), 3))
print("P(flu | fever, cough) =", round(cond(lambda f, fe, c: f, lambda f, fe, c: fe and c), 3))
print("P(disease | +) =", round(bayes(0.01, 0.9, 0.95), 3))`,
        solution: `def prob(event):
    return sum(p for k, p in JOINT.items() if event(*k))

def cond(query, evidence):
    return prob(lambda *k: query(*k) and evidence(*k)) / prob(evidence)

def bayes(prior, sensitivity, specificity):
    tp = sensitivity * prior
    return tp / (tp + (1 - specificity) * (1 - prior))`,
        test: `assert abs(sum(JOINT.values()) - 1) < 1e-9
assert abs(prob(lambda f, fe, c: f) - 0.1) < 1e-9
assert abs(cond(lambda f, fe, c: f, lambda f, fe, c: fe and c) - 0.06 / 0.09) < 1e-9
assert abs(bayes(0.01, 0.9, 0.95) - 0.009 / (0.009 + 0.0495)) < 1e-9
assert bayes(0.5, 0.9, 0.9) == 0.9` }
    ] },
    quiz: [
      { q: 'A test is 90% sensitive and 95% specific; the disease affects 1%. After a positive test, the chance of disease is about…', options: ['15%', '90%, which is the sensitivity of the test', '95%, which is the specificity of the test', '1%, which is the prevalence of the disease'], correct: 0, why: 'False positives from the 99% healthy outnumber true positives.' },
      { q: 'Naive Bayes assumes…', options: ['All variables are fully independent of each other in every case', 'No prior probability is needed, only the likelihoods', 'Effects are conditionally independent given the cause', 'Only continuous variables are allowed in the model'], correct: 2, why: 'That assumption makes it simple and scalable.' }
    ]
  },
  {
    id: 'bayesian-networks', part: 3, chapter: 'Ch. 13', title: 'Bayesian networks', minutes: 16,
    goal: 'Build Bayesian networks and compute posteriors by exact enumeration and sampling.',
    sections: [
      { h: 'Compact joint distributions', html: '<p>A <b>Bayesian network</b> is a directed acyclic graph: each node is a variable with a <b>conditional probability table</b> given its parents. The joint distribution factorizes as P(x₁…xₙ) = ∏ P(xᵢ | parents(Xᵢ)), so a network of 30 binary variables with at most 5 parents needs about 960 numbers instead of a billion. Arrows often follow causality.</p>' },
      { h: 'Conditional independence', html: '<p>Each node is independent of its non-descendants given its parents. <b>d-separation</b> reads independences off the graph: evidence on a common effect makes its causes <i>dependent</i> ("explaining away"). Toggle evidence below and watch beliefs flow both ways.</p>' },
      { h: 'Inference', html: '<p><b>Exact</b>: inference by <b>enumeration</b> sums the joint over hidden variables; <b>variable elimination</b> caches intermediate factors and is much faster on many graphs (exact inference is NP-hard in general). <b>Approximate</b>: rejection sampling, likelihood weighting and Gibbs sampling (MCMC) estimate posteriors from samples. Causal networks also support reasoning about interventions (the do-operator).</p>' }
    ],
    widget: 'bayesnet',
    terms: [['CPT', 'Conditional probability table of a node given its parents.'], ['Explaining away', 'Evidence for one cause lowers belief in another cause of the same effect.'], ['Variable elimination', 'Exact inference that sums out variables using cached factors.']],
    lab: { tasks: [
      { prompt: 'Network: <b>Storm → Outage</b>, <b>Storm → Traffic</b>, <b>(Outage, Traffic) → Late</b>. Implement <code>joint(s, o, t, l)</code> from the CPTs and <code>enumerate_ask(var, evidence)</code>, which returns <code>{True: p, False: p}</code> for one variable given evidence, by summing the joint over hidden variables.',
        starter: `from itertools import product
VARS = ["Storm", "Outage", "Traffic", "Late"]
P_S = 0.1
P_O = {True: 0.6, False: 0.05}                    # P(Outage | Storm)
P_T = {True: 0.7, False: 0.2}                     # P(Traffic | Storm)
P_L = {(True, True): 0.9, (True, False): 0.6, (False, True): 0.5, (False, False): 0.05}  # P(Late | Outage, Traffic)

def pr(p_true, value):
    return p_true if value else 1 - p_true

def joint(s, o, t, l):
    return 0.0   # TODO: product of the four factors

def enumerate_ask(var, evidence):
    dist = {}
    # TODO: for each value of var, sum joint over all assignments consistent with evidence; normalize
    return dist

print("P(Storm | Late)            =", round(enumerate_ask("Storm", {"Late": True})[True], 3))
print("P(Outage | Late)           =", round(enumerate_ask("Outage", {"Late": True})[True], 3))
print("P(Outage | Late, Traffic)  =", round(enumerate_ask("Outage", {"Late": True, "Traffic": True})[True], 3))`,
        solution: `def joint(s, o, t, l):
    return pr(P_S, s) * pr(P_O[s], o) * pr(P_T[s], t) * pr(P_L[(o, t)], l)

def enumerate_ask(var, evidence):
    dist = {}
    for val in (True, False):
        total = 0.0
        for values in product([True, False], repeat=4):
            a = dict(zip(VARS, values))
            if a[var] != val or any(a[k] != v for k, v in evidence.items()):
                continue
            total += joint(*values)
        dist[val] = total
    z = dist[True] + dist[False]
    return {k: v / z for k, v in dist.items()}`,
        test: `assert abs(sum(joint(*v) for v in product([True, False], repeat=4)) - 1) < 1e-9
assert abs(joint(True, True, True, True) - 0.1 * 0.6 * 0.7 * 0.9) < 1e-12
d = enumerate_ask("Storm", {"Late": True})
assert abs(d[True] + d[False] - 1) < 1e-9 and d[True] > P_S, "being late raises belief in a storm"
a = enumerate_ask("Outage", {"Late": True})[True]
b = enumerate_ask("Outage", {"Late": True, "Traffic": True})[True]
assert b < a, "explaining away: traffic explains the lateness, so an outage becomes less likely"
assert abs(enumerate_ask("Storm", {})[True] - 0.1) < 1e-9` }
    ] },
    quiz: [
      { q: 'You\'re late and learn there was heavy traffic. Belief in a power outage…', options: ['Rises, because both events make lateness more likely', 'Stays the same, because the two causes are independent', 'Becomes 0, because traffic rules out every other cause', 'Falls (explaining away)'], correct: 3, why: 'Traffic already explains the lateness.' },
      { q: 'Why are Bayesian networks compact?', options: ['They ignore probabilities and store only yes/no relations', 'Each variable only depends directly on its parents', 'They use neural nets to approximate the joint distribution', 'They store the full joint distribution in a compressed table'], correct: 1, why: 'Local CPTs replace the exponential joint table.' }
    ]
  },
  {
    id: 'reasoning-over-time', part: 3, chapter: 'Ch. 14–15', title: 'Probabilistic reasoning over time', minutes: 16,
    goal: 'Track hidden states with filtering, find the most likely history with Viterbi.',
    sections: [
      { h: 'Hidden Markov models', html: '<p>Many problems involve a hidden state that evolves over time, observed only through noisy evidence: a server\'s health seen through alerts, speech through sound, a robot\'s position through sensors. A <b>hidden Markov model</b> has a <b>transition model</b> P(Xₜ | Xₜ₋₁) (Markov assumption) and a <b>sensor model</b> P(Eₜ | Xₜ).</p>' },
      { h: 'The four inference tasks', html: '<ul><li><b>Filtering</b>: belief about the current state, P(Xₜ | e₁:ₜ), via the forward algorithm: predict with the transition model, then update with the evidence and normalize.</li><li><b>Prediction</b>: future states.</li><li><b>Smoothing</b>: better estimates of past states using later evidence (forward–backward).</li><li><b>Most likely explanation</b>: the single best state sequence (<b>Viterbi</b>).</li></ul><p>Feed observations to a filter below.</p>' },
      { h: 'Beyond HMMs', html: '<p><b>Kalman filters</b> track continuous states with Gaussian noise (navigation, tracking). <b>Dynamic Bayesian networks</b> factor complex temporal models; <b>particle filters</b> approximate beliefs with samples. <b>Probabilistic programming</b> languages let you write generative models as programs and get inference automatically.</p>' }
    ],
    widget: 'hmm',
    terms: [['Filtering', 'Estimating the current hidden state from all evidence so far.'], ['Viterbi', 'Dynamic programming for the most likely state sequence.'], ['Kalman filter', 'Exact filtering for linear-Gaussian models.']],
    lab: { tasks: [
      { prompt: 'Hidden server state <b>Healthy / Degraded</b>, observed through <b>alert / quiet</b>. Implement <code>forward(obs)</code> (list of filtered beliefs <code>P(Degraded)</code> after each observation) and <code>viterbi(obs)</code> (most likely state sequence).',
        starter: `STATES = ["Healthy", "Degraded"]
PRIOR = {"Healthy": 0.8, "Degraded": 0.2}
TRANS = {"Healthy": {"Healthy": 0.9, "Degraded": 0.1}, "Degraded": {"Healthy": 0.3, "Degraded": 0.7}}
SENSE = {"Healthy": {"alert": 0.1, "quiet": 0.9}, "Degraded": {"alert": 0.7, "quiet": 0.3}}

def forward(obs):
    belief, out = dict(PRIOR), []
    for e in obs:
        pass   # TODO: predict (sum over previous states), update (multiply by SENSE), normalize; append P(Degraded)
    return out

def viterbi(obs):
    return []   # TODO: best[s] = max prob of a path ending in s; keep back-pointers

obs = ["quiet", "alert", "alert", "quiet", "alert"]
print([round(p, 3) for p in forward(obs)])
print(viterbi(obs))`,
        solution: `def forward(obs):
    belief, out = dict(PRIOR), []
    for e in obs:
        pred = {s: sum(belief[p] * TRANS[p][s] for p in STATES) for s in STATES}
        upd = {s: pred[s] * SENSE[s][e] for s in STATES}
        z = sum(upd.values())
        belief = {s: v / z for s, v in upd.items()}
        out.append(belief["Degraded"])
    return out

def viterbi(obs):
    prev = {s: sum(PRIOR[p] * TRANS[p][s] for p in STATES) for s in STATES}
    best = {s: prev[s] * SENSE[s][obs[0]] for s in STATES}
    back = []
    for e in obs[1:]:
        ptr, new = {}, {}
        for s in STATES:
            p_best = max(STATES, key=lambda p: best[p] * TRANS[p][s])
            ptr[s], new[s] = p_best, best[p_best] * TRANS[p_best][s] * SENSE[s][e]
        back.append(ptr)
        best = new
    state = max(STATES, key=lambda s: best[s])
    path = [state]
    for ptr in reversed(back):
        state = ptr[state]
        path.append(state)
    return path[::-1]`,
        test: `from itertools import product
f = forward(obs)
assert len(f) == 5 and f[1] > f[0] and f[2] > f[1] and f[3] < f[2], [round(x, 3) for x in f]
def score(seq):
    p, prev = 1.0, None
    for s, e in zip(seq, obs):
        p *= (sum(PRIOR[q] * TRANS[q][s] for q in STATES) if prev is None else TRANS[prev][s]) * SENSE[s][e]
        prev = s
    return p
best = max(product(STATES, repeat=len(obs)), key=score)
assert viterbi(obs) == list(best), (viterbi(obs), best)
assert abs(forward(["alert"])[0] - (0.22 * 0.7) / (0.22 * 0.7 + 0.78 * 0.1)) < 1e-9, "predict from the prior first: P(D) = 0.8*0.1 + 0.2*0.7 = 0.22"` }
    ] },
    quiz: [
      { q: 'Estimating last Tuesday\'s state using evidence up to today is called…', options: ['Smoothing', 'Filtering, which estimates the present state', 'Prediction, which estimates a future state', 'Sampling, which draws random state sequences'], correct: 0, why: 'Smoothing uses later evidence to refine past estimates.' },
      { q: 'The Viterbi algorithm finds…', options: ['The current belief state given the evidence so far in the sequence', 'The transition model that was learned from the training data', 'The single most likely sequence of hidden states', 'The optimal policy for the agent in a given decision problem'], correct: 2, why: 'It is dynamic programming over paths.' }
    ]
  },
  {
    id: 'decisions-mdps', part: 3, chapter: 'Ch. 16–17', title: 'Making decisions: utility, MDPs & value iteration', minutes: 17,
    goal: 'Choose actions by maximum expected utility, and plan sequential decisions with MDPs.',
    sections: [
      { h: 'Utility theory', html: '<p>Rational preferences (orderable, transitive, continuous…) imply a <b>utility function</b>, and a rational agent picks the action of <b>maximum expected utility</b> (MEU). Money isn\'t utility: most people are <b>risk-averse</b>. <b>Decision networks</b> add decision and utility nodes to Bayes nets; the <b>value of information</b> tells you whether a test is worth paying for before deciding.</p>' },
      { h: 'Markov decision processes', html: '<p>In sequential problems with uncertain outcomes, an <b>MDP</b> has states, actions, a transition model P(s\' | s, a), rewards R(s, a, s\') and a discount γ. The answer is a <b>policy</b> π(s): what to do in every state. The <b>Bellman equation</b>: U(s) = max_a Σ_s\' P(s\' | s, a) [R + γ U(s\')].</p>' },
      { h: 'Solving MDPs', html: '<p><b>Value iteration</b> applies the Bellman update to all states until the values converge, then reads off the greedy policy. <b>Policy iteration</b> alternates evaluating a policy and improving it. Change the living reward and noise below and watch the optimal policy flip: with a harsh living penalty the agent rushes past the danger. <b>POMDPs</b> extend this to partial observability.</p>' }
    ],
    widget: 'mdpgrid',
    terms: [['Expected utility', 'Probability-weighted average utility of outcomes.'], ['Policy', 'A mapping from states to actions.'], ['Bellman equation', 'Recursive definition of optimal state values.']],
    lab: { tasks: [
      { prompt: 'Run <b>value iteration</b> on the 4×3 grid world (wall at (1,1); +1 at (3,2); −1 at (3,1); living reward −0.04; the agent moves as intended with probability 0.8, and slips to each side with 0.1; γ = 1). Implement <code>q_value</code> and the update loop, then the greedy policy.',
        starter: `W, H = 4, 3
WALL, TERM = {(1, 1)}, {(3, 2): 1.0, (3, 1): -1.0}
STATES = [(x, y) for x in range(W) for y in range(H) if (x, y) not in WALL]
MOVES = {"Up": (0, 1), "Down": (0, -1), "Left": (-1, 0), "Right": (1, 0)}
SIDES = {"Up": ("Left", "Right"), "Down": ("Left", "Right"), "Left": ("Up", "Down"), "Right": ("Up", "Down")}

def step(s, a):
    nx, ny = s[0] + MOVES[a][0], s[1] + MOVES[a][1]
    return (nx, ny) if (0 <= nx < W and 0 <= ny < H and (nx, ny) not in WALL) else s

def q_value(U, s, a, r=-0.04, gamma=1.0):
    return 0.0   # TODO: r + gamma * (0.8*U[step(s,a)] + 0.1*U[step(s,side1)] + 0.1*U[step(s,side2)])

def value_iteration(r=-0.04, eps=1e-6):
    U = {s: TERM.get(s, 0.0) for s in STATES}
    while True:
        delta, new = 0.0, dict(U)
        for s in STATES:
            if s in TERM:
                continue
            new[s] = max(q_value(U, s, a, r) for a in MOVES)
            delta = max(delta, abs(new[s] - U[s]))
        U = new
        if delta < eps:
            return U

def policy(U, r=-0.04):
    return {}   # TODO: argmax action per non-terminal state

U = value_iteration()
for y in reversed(range(H)):
    print(" ".join(f"{U[(x, y)]:6.3f}" if (x, y) in U else "  ####" for x in range(W)))
print(policy(U))`,
        solution: `def q_value(U, s, a, r=-0.04, gamma=1.0):
    s1, s2 = SIDES[a]
    return r + gamma * (0.8 * U[step(s, a)] + 0.1 * U[step(s, s1)] + 0.1 * U[step(s, s2)])

def policy(U, r=-0.04):
    return {s: max(MOVES, key=lambda a: q_value(U, s, a, r)) for s in STATES if s not in TERM}`,
        test: `U = value_iteration()
assert abs(U[(0, 0)] - 0.705) < 0.01 and abs(U[(2, 2)] - 0.918) < 0.01, (round(U[(0, 0)], 3), round(U[(2, 2)], 3))
pi = policy(U)
assert pi[(0, 0)] == "Up" and pi[(2, 2)] == "Right" and pi[(2, 1)] == "Up" and pi[(0, 2)] == "Right", pi
pi_harsh = policy(value_iteration(r=-2.0), r=-2.0)
assert pi_harsh[(2, 1)] == "Right", "with a harsh living penalty, diving into the -1 exit beats wandering"` }
    ] },
    quiz: [
      { q: 'A rational agent under uncertainty chooses the action that maximizes…', options: ['Best-case reward, ignoring how unlikely it is', 'Expected utility', 'The number of steps taken to reach a goal', 'The probability of the single most likely outcome'], correct: 1, why: 'That is the MEU principle.' },
      { q: 'Value iteration repeatedly applies…', options: ['Unification of terms in the logical sentences', 'Alpha-beta pruning of the game tree', 'Resolution of clauses until the empty clause appears', 'The Bellman update'], correct: 3, why: 'It converges to the optimal utilities.' }
    ]
  },
  {
    id: 'multiagent-game-theory', part: 3, chapter: 'Ch. 18', title: 'Multiagent decisions & game theory', minutes: 15,
    goal: 'Analyze strategic interactions with equilibria, and design mechanisms like auctions.',
    sections: [
      { h: 'When others decide too', html: '<p>With other agents, the best action depends on what <i>they</i> do. <b>Game theory</b> models this with players, strategies and payoffs. A <b>dominant strategy</b> is best whatever others do. A <b>Nash equilibrium</b> is a strategy profile where no player gains by deviating alone.</p>' },
      { h: 'Classic games', html: '<p>In the <b>prisoner\'s dilemma</b>, defecting dominates, so both defect, though both would prefer mutual cooperation. That is the gap between equilibrium and social welfare. <b>Coordination</b> games have several equilibria; <b>matching pennies</b> has none in pure strategies, only a <b>mixed</b> one (randomize 50/50). Repeated games enable cooperation via strategies such as tit-for-tat. Edit the payoff matrix below to find equilibria.</p>' },
      { h: 'Mechanism design and cooperation', html: '<p><b>Mechanism design</b> is "inverse game theory": design the rules so self-interested agents produce good outcomes. The <b>Vickrey (second-price) auction</b> makes truthful bidding a dominant strategy. <b>Cooperative game theory</b> studies coalitions and fair division (the Shapley value). Multiagent planning also covers coordination, communication and negotiation.</p>' }
    ],
    widget: 'gametheory',
    terms: [['Nash equilibrium', 'No player benefits from unilaterally changing strategy.'], ['Dominant strategy', 'Best regardless of others\' choices.'], ['Mechanism design', 'Designing game rules to achieve desired outcomes.']],
    lab: { tasks: [
      { prompt: 'Implement <code>pure_nash(payoffs)</code> for a two-player game given as <code>{(row_action, col_action): (row_payoff, col_payoff)}</code>: return all action pairs where neither player can do strictly better by changing only their own action (sorted).',
        starter: `def pure_nash(payoffs):
    rows = sorted({r for r, c in payoffs})
    cols = sorted({c for r, c in payoffs})
    eq = []
    # TODO: (r, c) is an equilibrium if payoffs[(r,c)][0] >= payoffs[(r2,c)][0] for all r2
    #       and payoffs[(r,c)][1] >= payoffs[(r,c2)][1] for all c2
    return eq

prisoners = {("C", "C"): (-1, -1), ("C", "D"): (-10, 0), ("D", "C"): (0, -10), ("D", "D"): (-5, -5)}
coordination = {("L", "L"): (2, 2), ("L", "R"): (0, 0), ("R", "L"): (0, 0), ("R", "R"): (1, 1)}
pennies = {("H", "H"): (1, -1), ("H", "T"): (-1, 1), ("T", "H"): (-1, 1), ("T", "T"): (1, -1)}
for name, g in [("prisoners", prisoners), ("coordination", coordination), ("pennies", pennies)]:
    print(name, pure_nash(g))`,
        solution: `def pure_nash(payoffs):
    rows = sorted({r for r, c in payoffs})
    cols = sorted({c for r, c in payoffs})
    eq = []
    for r in rows:
        for c in cols:
            if all(payoffs[(r, c)][0] >= payoffs[(r2, c)][0] for r2 in rows) and \\
               all(payoffs[(r, c)][1] >= payoffs[(r, c2)][1] for c2 in cols):
                eq.append((r, c))
    return eq`,
        test: `assert pure_nash(prisoners) == [("D", "D")]
assert pure_nash(coordination) == [("L", "L"), ("R", "R")]
assert pure_nash(pennies) == []
chicken = {("S", "S"): (0, 0), ("S", "T"): (-1, 1), ("T", "S"): (1, -1), ("T", "T"): (-10, -10)}
assert pure_nash(chicken) == [("S", "T"), ("T", "S")]` }
    ] },
    quiz: [
      { q: 'Why do both prisoners defect even though mutual cooperation is better for both?', options: ['Defection is a dominant strategy for each player', 'They are irrational, so they ignore the better joint outcome', 'There is no equilibrium in this game, so they pick randomly', 'The payoffs are random and change from one round to the next'], correct: 0, why: 'Individually rational choices can be collectively worse.' },
      { q: 'In a second-price sealed-bid auction, the best strategy is to…', options: ['Bid far above your value to make sure you win', 'Bid zero so that you never pay anything at all', 'Copy the bids of others, since they know more', 'Bid your true value'], correct: 3, why: 'Truthful bidding is dominant in Vickrey auctions.' }
    ]
  },
  /* ---------- PART 5 ---------- */
  {
    id: 'learning-from-examples', part: 4, chapter: 'Ch. 19', title: 'Learning from examples: decision trees & beyond', minutes: 16,
    goal: 'Build decision trees with information gain, and understand model selection.',
    sections: [
      { h: 'Forms of learning', html: '<p>An agent learns when it improves with experience. In <b>supervised</b> learning it sees input–output pairs and learns a hypothesis h ≈ f that must <b>generalize</b> to new inputs. The core trade-off: hypotheses that fit the training data perfectly may <b>overfit</b>, while overly simple ones <b>underfit</b> (bias vs. variance).</p>' },
      { h: 'Decision trees', html: '<p>A decision tree tests attributes until it reaches a decision. To learn one, greedily pick the attribute with the highest <b>information gain</b>: the reduction in <b>entropy</b> (uncertainty) of the target. Entropy of a 50/50 split is 1 bit; a pure node is 0. Prune with significance tests to avoid overfitting. Choose splits yourself below.</p>' },
      { h: 'Model selection and other learners', html: '<p>Use <b>validation sets</b> and <b>cross-validation</b> to pick model complexity, and <b>regularization</b> to penalize complexity. The same chapter tours linear regression and classification, logistic regression, nonparametric models (k-nearest neighbors), support vector machines and ensembles (bagging, random forests, boosting). For hands-on depth, see the Machine Learning course on this site.</p>' }
    ],
    widget: 'infogain',
    terms: [['Entropy', 'Uncertainty of a variable, in bits.'], ['Information gain', 'Entropy reduction from splitting on an attribute.'], ['Overfitting', 'Fitting noise in training data at the expense of generalization.']],
    lab: { tasks: [
      { prompt: 'Implement <code>entropy(labels)</code> (in bits), <code>info_gain(rows, attr, target)</code> and <code>best_attribute(rows, attrs, target)</code>. The data: will the bus be late?',
        starter: `import math
from collections import Counter

ROWS = [
    {"weather": "rain",  "rush": "yes", "day": "weekday", "late": "yes"},
    {"weather": "rain",  "rush": "no",  "day": "weekday", "late": "yes"},
    {"weather": "sun",   "rush": "yes", "day": "weekday", "late": "yes"},
    {"weather": "sun",   "rush": "no",  "day": "weekday", "late": "no"},
    {"weather": "sun",   "rush": "no",  "day": "weekend", "late": "no"},
    {"weather": "cloud", "rush": "yes", "day": "weekday", "late": "yes"},
    {"weather": "cloud", "rush": "no",  "day": "weekend", "late": "no"},
    {"weather": "rain",  "rush": "no",  "day": "weekday", "late": "no"},
]

def entropy(labels):
    return 0.0   # TODO: -sum p*log2(p)

def info_gain(rows, attr, target):
    return 0.0   # TODO: entropy(all) - weighted entropy of subsets by attr value

def best_attribute(rows, attrs, target):
    return attrs[0]   # TODO

for a in ["weather", "rush", "day"]:
    print(a, round(info_gain(ROWS, a, "late"), 3))
print("split first on:", best_attribute(ROWS, ["weather", "rush", "day"], "late"))`,
        solution: `def entropy(labels):
    n = len(labels)
    return -sum((c / n) * math.log2(c / n) for c in Counter(labels).values()) if n else 0.0

def info_gain(rows, attr, target):
    base = entropy([r[target] for r in rows])
    rem = 0.0
    for v in set(r[attr] for r in rows):
        sub = [r[target] for r in rows if r[attr] == v]
        rem += len(sub) / len(rows) * entropy(sub)
    return base - rem

def best_attribute(rows, attrs, target):
    return max(attrs, key=lambda a: info_gain(rows, a, target))`,
        test: `assert entropy(["a", "b"]) == 1.0 and entropy(["a", "a"]) == 0
assert abs(entropy(["y", "y", "y", "n"]) - 0.8113) < 1e-4
g = {a: info_gain(ROWS, a, "late") for a in ["weather", "rush", "day"]}
assert abs(g["rush"] - (1 - 5 / 8 * entropy(["yes", "no", "no", "no", "no"]))) < 1e-9, g
assert best_attribute(ROWS, ["weather", "rush", "day"], "late") == "rush", g` }
    ] },
    quiz: [
      { q: 'An attribute splits the data into perfectly pure subsets. Its information gain is…', options: ['0, because a pure split removes all information', 'Negative, because the subsets have lower entropy', 'Equal to the parent entropy (maximal)', '0.5, because the split has two equal halves'], correct: 2, why: 'All uncertainty is removed.' },
      { q: 'Cross-validation is used to…', options: ['Speed up training by using several folds in parallel', 'Estimate generalization and choose model complexity', 'Increase training accuracy by reusing the same data', 'Remove features that have a low variance in the data'], correct: 1, why: 'It evaluates on held-out folds.' }
    ]
  },
  {
    id: 'learning-models-deep-rl', part: 4, chapter: 'Ch. 20–22', title: 'Probabilistic learning, deep learning & reinforcement learning', minutes: 15,
    goal: 'Learn parameters from data the Bayesian way, and see where deep learning and RL fit.',
    sections: [
      { h: 'Learning probabilistic models', html: '<p><b>Maximum-likelihood</b> learning picks the parameters that make the data most probable (h heads in n flips → θ = h/n). It overfits small data: after 3 heads in 3 flips it says tails is impossible. <b>Bayesian</b> learning keeps a prior over parameters and updates it to a posterior; with a Beta prior, the posterior is again a Beta, which gives Laplace smoothing (h+1)/(n+2) as a special case. Flip coins below. <b>EM</b> learns with hidden variables (mixtures of Gaussians, HMMs).</p>' },
      { h: 'Deep learning', html: '<p>Deep networks compose many layers of simple units trained by gradient descent with backpropagation. Convolutional networks exploit spatial structure, recurrent and transformer networks handle sequences, and unsupervised and transfer learning reuse representations. The Machine Learning and LLM Engineering courses on this site cover this hands-on.</p>' },
      { h: 'Reinforcement learning', html: '<p>An RL agent learns from <b>rewards</b> without a teacher. <b>Model-based</b> RL learns the MDP and then plans; <b>model-free</b> RL learns utilities (TD learning), action values (<b>Q-learning</b>) or policies directly (<b>policy search</b>). Exploration vs. exploitation is central. <b>Apprenticeship</b> and <b>inverse RL</b> learn from demonstrations, which is relevant to value alignment.</p>' }
    ],
    widget: 'betacoin',
    terms: [['Maximum likelihood', 'Parameters that maximize the probability of the data.'], ['Prior / posterior', 'Belief before / after seeing data.'], ['Q-learning', 'Model-free learning of action values from experience.']],
    lab: { tasks: [
      { prompt: 'For a coin with h heads in n flips, implement <code>mle</code>, <code>laplace</code> ((h+1)/(n+2)), and for a Beta(a, b) prior the <code>posterior_mean</code> ((a+h)/(a+b+n)) and <code>map_estimate</code> ((a+h−1)/(a+b+n−2)).',
        starter: `def mle(h, n):
    return 0.0   # TODO (return 0.5 when n == 0)

def laplace(h, n):
    return 0.0   # TODO

def posterior_mean(h, n, a=2, b=2):
    return 0.0   # TODO

def map_estimate(h, n, a=2, b=2):
    return 0.0   # TODO

for h, n in [(3, 3), (7, 10), (70, 100)]:
    print(f"{h}/{n}: MLE={mle(h, n):.2f}  Laplace={laplace(h, n):.2f}  Beta(2,2) mean={posterior_mean(h, n):.2f}  MAP={map_estimate(h, n):.2f}")`,
        solution: `def mle(h, n):
    return h / n if n else 0.5

def laplace(h, n):
    return (h + 1) / (n + 2)

def posterior_mean(h, n, a=2, b=2):
    return (a + h) / (a + b + n)

def map_estimate(h, n, a=2, b=2):
    return (a + h - 1) / (a + b + n - 2)`,
        test: `assert mle(3, 3) == 1.0 and mle(0, 0) == 0.5
assert laplace(3, 3) == 0.8 and posterior_mean(3, 3, 1, 1) == laplace(3, 3), "Laplace = posterior mean under a uniform Beta(1,1) prior"
assert abs(posterior_mean(3, 3) - 5 / 7) < 1e-12 and abs(map_estimate(3, 3) - 4 / 5) < 1e-12
assert abs(posterior_mean(700, 1000) - mle(700, 1000)) < 0.01, "with lots of data the prior washes out"` }
    ] },
    quiz: [
      { q: 'After 3 heads in 3 flips, maximum likelihood estimates P(heads) as…', options: ['0.5, because heads and tails are equally likely', '1.0', '0.8, the estimate after adding one pseudo-count per outcome', '0.75, the estimate if one extra tails flip is added'], correct: 1, why: 'h/n = 1, which overfits tiny data.' },
      { q: 'Q-learning is…', options: ['Model-based: it first learns a full model of the transitions and rewards and then plans with it', 'Supervised: it needs a labelled set of correct actions', 'A search algorithm that expands a tree of states before acting', 'Model-free: it learns action values directly from experience'], correct: 3, why: 'It doesn\'t need the transition model.' }
    ]
  },
  /* ---------- PART 6 ---------- */
  {
    id: 'natural-language', part: 5, chapter: 'Ch. 23–24', title: 'Natural language processing', minutes: 15,
    goal: 'Build an n-gram language model, and trace NLP from grammars to transformers.',
    sections: [
      { h: 'Language models', html: '<p>A <b>language model</b> assigns probabilities to word sequences. An <b>n-gram</b> model approximates P(wᵢ | history) by the previous n−1 words, estimated from counts. Unseen n-grams get probability zero, so <b>smoothing</b> (add-one/Laplace, backoff, interpolation) reserves probability for them. Models are compared by <b>perplexity</b> on held-out text: lower is better. Train one below.</p>' },
      { h: 'Grammar and meaning', html: '<p><b>Grammars</b> describe sentence structure; probabilistic context-free grammars plus the <b>CYK</b> chart parser find the most likely parse. <b>Semantics</b> maps parses to meaning; real language is full of <b>ambiguity</b> (lexical, syntactic, referential), which probabilistic models resolve with context. Tasks include translation, question answering, summarization and information extraction.</p>' },
      { h: 'Deep learning for NLP', html: '<p><b>Word embeddings</b> represent words as vectors where similar words are close. <b>Recurrent</b> networks read sequences; <b>sequence-to-sequence</b> models with <b>attention</b> transformed machine translation; <b>transformers</b> and pretraining (masked and autoregressive language modeling) produced today\'s large language models. See the LLM and Prompt Engineering courses here.</p>' }
    ],
    widget: 'ngram',
    terms: [['n-gram', 'A sequence of n words used to predict the next word.'], ['Smoothing', 'Assigning probability to unseen events.'], ['Perplexity', 'How surprised a model is by test text (lower is better).']],
    lab: { tasks: [
      { prompt: 'Implement a <b>bigram</b> model with add-one smoothing. <code>train</code> counts bigrams over sentences wrapped in <code>&lt;s&gt;</code>…<code>&lt;/s&gt;</code>; <code>prob(prev, w)</code> = (count(prev,w)+1) / (count(prev)+V), where V is the vocabulary size including <code>&lt;/s&gt;</code>; <code>perplexity(sentence)</code> = exp(−mean log-prob).',
        starter: `import math
from collections import Counter

class Bigram:
    def __init__(self, sentences):
        self.uni, self.bi = Counter(), Counter()
        self.vocab = {"</s>"}
        # TODO: for each sentence: tokens = ["<s>"] + s.lower().split() + ["</s>"]
        #       count unigrams of the 'previous' positions and bigrams; update vocab with words

    def prob(self, prev, w):
        return 0.0   # TODO: add-one smoothing

    def perplexity(self, sentence):
        return 0.0   # TODO

corpus = ["the robot sees the ball", "the robot grabs the ball", "a robot sees a cup", "the cup is red"]
lm = Bigram(corpus)
print(round(lm.prob("the", "robot"), 3), round(lm.prob("the", "cup"), 3), round(lm.prob("the", "is"), 3))
print("perplexity familiar:", round(lm.perplexity("the robot sees the cup"), 2))
print("perplexity strange :", round(lm.perplexity("cup the red sees is"), 2))`,
        solution: `class Bigram:
    def __init__(self, sentences):
        self.uni, self.bi = Counter(), Counter()
        self.vocab = {"</s>"}
        for s in sentences:
            toks = ["<s>"] + s.lower().split() + ["</s>"]
            self.vocab.update(toks[1:])
            for a, b in zip(toks, toks[1:]):
                self.uni[a] += 1
                self.bi[(a, b)] += 1

    def prob(self, prev, w):
        return (self.bi[(prev, w)] + 1) / (self.uni[prev] + len(self.vocab))

    def perplexity(self, sentence):
        toks = ["<s>"] + sentence.lower().split() + ["</s>"]
        lp = [math.log(self.prob(a, b)) for a, b in zip(toks, toks[1:])]
        return math.exp(-sum(lp) / len(lp))`,
        test: `lm = Bigram(corpus)
V = len(lm.vocab)
assert V == 10, V
assert abs(lm.prob("the", "robot") - (2 + 1) / (5 + V)) < 1e-12
assert abs(sum(lm.prob("the", w) for w in lm.vocab) - 1) < 1e-9, "a smoothed distribution must sum to 1"
assert lm.perplexity("the robot sees the cup") < lm.perplexity("cup the red sees is")` }
    ] },
    quiz: [
      { q: 'Why smooth an n-gram model?', options: ['To speed up the model by merging rare n-grams together', 'To remove stop words from the text before counting', 'So unseen n-grams don\'t get zero probability', 'To translate the sentences into a smaller vocabulary'], correct: 2, why: 'Zero probabilities make whole sentences impossible.' },
      { q: 'Which architecture underlies today\'s large language models?', options: ['Transformer', 'CYK parser, a chart parser for grammars', 'Naive Bayes, a probabilistic classifier', 'Bigram model, which counts word pairs'], correct: 0, why: 'Transformers with self-attention, pretrained at scale.' }
    ]
  },
  {
    id: 'vision-robotics', part: 5, chapter: 'Ch. 25–26', title: 'Computer vision & robotics', minutes: 16,
    goal: 'See how machines perceive images and how robots localize, plan motion and act.',
    sections: [
      { h: 'Computer vision', html: '<p>Image formation projects a 3D world onto 2D pixels; vision inverts this ill-posed mapping. Pipelines extract <b>edges, textures and optical flow</b>, then <b>classify</b> images, <b>detect</b> objects with boxes, <b>segment</b> pixels, and recover <b>3D</b> structure from stereo, motion and shading. Convolutional networks now dominate, trained on large labeled datasets. See the CNN lesson in the Machine Learning course.</p>' },
      { h: 'Robot perception and localization', html: '<p>A robot must know where it is. <b>Localization</b> is filtering: predict with the motion model, update with the sensor model. <b>Particle filters</b> (Monte Carlo localization) represent the belief with samples: move each particle, weight it by how well it explains the sensor reading, and resample. Watch a robot localize in a corridor of doors below. <b>SLAM</b> builds the map at the same time.</p>' },
      { h: 'Planning motion and acting', html: '<p>Motion planning searches <b>configuration space</b> (all joint positions) with visibility graphs, cell decomposition or <b>sampling-based</b> planners (PRM, RRT). Controllers (PID, computed torque) track planned trajectories; <b>reinforcement learning</b> and imitation learning learn skills directly. Robots must also work safely with humans, predicting their behavior and intent.</p>' }
    ],
    widget: 'particlefilter',
    terms: [['Localization', 'Estimating a robot\'s pose from motion and sensor data.'], ['Particle filter', 'Belief represented by weighted samples, resampled each step.'], ['Configuration space', 'Space of all robot joint configurations.']],
    lab: { tasks: [
      { prompt: 'Implement one step of a <b>grid Bayes filter</b> for a robot in a 10-cell corridor (wrapping around) with doors at cells 1, 4 and 8. (Notice how a short sensor history can be ambiguous; more readings resolve it.) <code>predict(belief)</code>: move +1 with probability 0.8, stay with 0.1, move +2 with 0.1. <code>update(belief, z)</code>: multiply by P(sensor | door) (0.8 if the cell matches the reading, else 0.1) and normalize.',
        starter: `N, DOORS = 10, {1, 4, 8}

def predict(belief):
    new = [0.0] * N
    # TODO: for each cell i: spread belief[i] to (i+1)%N (0.8), i (0.1), (i+2)%N (0.1)
    return new

def update(belief, saw_door):
    # TODO: likelihood 0.8 if (i in DOORS) == saw_door else 0.1; multiply; normalize
    return belief

belief = [1 / N] * N
for z in [True, False, False, True, False, False, False, True]:   # door, wall, wall, door, wall, wall, wall, door
    belief = update(predict(belief), z)
    print(" ".join(f"{p:.2f}" for p in belief), "-> most likely cell", belief.index(max(belief)))`,
        solution: `def predict(belief):
    new = [0.0] * N
    for i, p in enumerate(belief):
        new[(i + 1) % N] += 0.8 * p
        new[i] += 0.1 * p
        new[(i + 2) % N] += 0.1 * p
    return new

def update(belief, saw_door):
    w = [p * (0.8 if (i in DOORS) == saw_door else 0.1) for i, p in enumerate(belief)]
    z = sum(w)
    return [x / z for x in w]`,
        test: `b = predict([1.0] + [0.0] * (N - 1))
assert abs(b[1] - 0.8) < 1e-12 and abs(b[0] - 0.1) < 1e-12 and abs(b[2] - 0.1) < 1e-12
u = update([1 / N] * N, True)
assert abs(sum(u) - 1) < 1e-9 and u[1] > u[0]
belief = [1 / N] * N
for z in [True, False, False, True]:
    belief = update(predict(belief), z)
assert abs(belief[1] - belief[4]) < 0.05, "door-wall-wall-door is ambiguous: cells 1 and 4 explain it almost equally"
for z in [False, False, False, True]:
    belief = update(predict(belief), z)
assert belief.index(max(belief)) == 8 and max(belief) > 0.5, [round(x, 2) for x in belief]` }
    ] },
    quiz: [
      { q: 'In a particle filter, particles that explain the sensor reading well…', options: ['Are deleted immediately, since they match the sensor too closely', 'Move faster than the other particles in the next time step', 'Get higher weights and are more likely to survive resampling', 'Are ignored, because only the average of all particles counts'], correct: 2, why: 'Weighting by likelihood concentrates particles on probable poses.' },
      { q: 'RRT and PRM are…', options: ['Sampling-based motion planners', 'Image classifiers that label objects in camera frames', 'Language models that predict the next word in a text', 'Game trees that are searched with alpha-beta pruning'], correct: 0, why: 'They sample configuration space to find collision-free paths.' }
    ]
  },
  /* ---------- PART 7 ---------- */
  {
    id: 'ethics-future', part: 6, chapter: 'Ch. 27–28', title: 'Philosophy, ethics, safety & the future of AI', minutes: 16,
    goal: 'Weigh the big questions, and measure fairness concretely.',
    sections: [
      { h: 'Can machines think?', html: '<p>The <b>weak AI</b> question asks whether machines can act intelligently; <b>strong AI</b> asks whether they can really think, understand or be conscious. Arguments run from the Turing test to objections from disability, informality and consciousness (the Chinese room). Practically, the important questions are about what AI <i>does</i>.</p>' },
      { h: 'The ethics of AI', html: '<ul><li><b>Lethal autonomous weapons</b> and surveillance.</li><li><b>Fairness and bias</b>: different, often mutually incompatible definitions (demographic parity, equal opportunity, calibration).</li><li><b>Trust, transparency and explanation</b>.</li><li><b>Privacy</b>.</li><li><b>Future of work</b>.</li><li><b>Robot rights</b>.</li><li><b>AI safety</b>: robust, verifiable systems that remain under meaningful human control, and solving value alignment.</li></ul><p>Explore fairness trade-offs in a loan-approval model below.</p>' },
      { h: 'The future', html: '<p>Progress depends on components (sensors, representations, learning, reasoning) and architectures that combine them, plus compute and data. The open question is not only "how capable will AI become?" but "how do we ensure it remains beneficial?" Provably beneficial AI, which is uncertain about human preferences and deferential to us, is one proposed path.</p>' }
    ],
    widget: 'fairness',
    terms: [['Demographic parity', 'Equal selection rates across groups.'], ['Equal opportunity', 'Equal true-positive rates across groups.'], ['AI safety', 'Ensuring AI systems behave as intended and remain controllable.']],
    lab: { tasks: [
      { prompt: 'Audit a loan model. For records <code>(group, actually_repaid, approved)</code>, implement <code>selection_rate(records, g)</code>, <code>tpr(records, g)</code> (share of those who repaid that were approved), <code>disparate_impact</code> (min rate ÷ max rate across groups) and <code>equal_opportunity_gap</code> (max − min TPR).',
        starter: `RECORDS = (
    [("A", True, True)] * 40 + [("A", True, False)] * 10 + [("A", False, True)] * 10 + [("A", False, False)] * 40 +
    [("B", True, True)] * 18 + [("B", True, False)] * 12 + [("B", False, True)] * 2 + [("B", False, False)] * 68
)
GROUPS = ["A", "B"]

def selection_rate(records, g):
    return 0.0   # TODO: approved / all in group

def tpr(records, g):
    return 0.0   # TODO: approved among those who actually repaid

def disparate_impact(records):
    return 0.0   # TODO

def equal_opportunity_gap(records):
    return 0.0   # TODO

for g in GROUPS:
    print(g, "selection", selection_rate(RECORDS, g), "TPR", tpr(RECORDS, g))
print("disparate impact:", round(disparate_impact(RECORDS), 3), "(below 0.8 is a common red flag)")
print("equal opportunity gap:", round(equal_opportunity_gap(RECORDS), 3))`,
        solution: `def selection_rate(records, g):
    rows = [r for r in records if r[0] == g]
    return sum(1 for r in rows if r[2]) / len(rows)

def tpr(records, g):
    pos = [r for r in records if r[0] == g and r[1]]
    return sum(1 for r in pos if r[2]) / len(pos)

def disparate_impact(records):
    rates = [selection_rate(records, g) for g in GROUPS]
    return min(rates) / max(rates)

def equal_opportunity_gap(records):
    t = [tpr(records, g) for g in GROUPS]
    return max(t) - min(t)`,
        test: `assert selection_rate(RECORDS, "A") == 0.5 and selection_rate(RECORDS, "B") == 0.2
assert tpr(RECORDS, "A") == 0.8 and tpr(RECORDS, "B") == 0.6
assert abs(disparate_impact(RECORDS) - 0.4) < 1e-9 and abs(equal_opportunity_gap(RECORDS) - 0.2) < 1e-9` }
    ] },
    quiz: [
      { q: 'Why can\'t a model usually satisfy every fairness definition at once?', options: ['Because of programming bugs that careful testing would remove, so every definition could be met in a perfect system', 'When base rates differ across groups, common criteria are mathematically incompatible', 'Fairness is undefined, so no formal criterion is possible', 'Models ignore group membership, so they cannot treat groups differently'], correct: 1, why: 'Impossibility results force explicit trade-offs.' },
      { q: 'The "strong AI" question asks whether machines can…', options: ['Act intelligently on any task a human could do', 'Play chess and other games at superhuman level', 'Learn from data without being explicitly programmed', 'Really think and be conscious'], correct: 3, why: 'Weak AI is about behavior; strong AI is about minds.' }
    ]
  }
  ]
};
