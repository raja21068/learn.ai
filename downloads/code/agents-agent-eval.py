# Free AI Learning Center | Agentic AI | Evaluation & guardrails
# MIT licensed original example. Python 3, standard library only.

runs = [True, False, True, True, False]
successes = sum(runs)
print('Success rate:', successes / len(runs))
print('Failures to inspect:', len(runs) - successes)
