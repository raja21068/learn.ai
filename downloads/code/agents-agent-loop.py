# Free AI Learning Center | Agentic AI | The agent loop
# MIT licensed original example. Python 3, standard library only.

items = ['plan', 'test', 'report']
completed = []
for step in range(3):
    observation = items[step]
    action = f'complete {observation}'
    completed.append(action)
    print('Observe:', observation, '-> Act:', action)
print('Done:', completed)
