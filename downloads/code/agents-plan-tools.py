# Free AI Learning Center | Agentic AI | Planning & tools
# MIT licensed original example. Python 3, standard library only.

plan = [
    {'task': 'read file', 'requires_approval': False},
    {'task': 'delete file', 'requires_approval': True},
]
for step in plan:
    state = 'ask user' if step['requires_approval'] else 'can inspect'
    print(step['task'], '=>', state)
