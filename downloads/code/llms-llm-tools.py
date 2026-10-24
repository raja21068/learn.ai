# Free AI Learning Center | Large Language Models | Tool calling
# MIT licensed original example. Python 3, standard library only.

def calculator(a, b, operation):
    if operation not in {'add', 'multiply'}:
        raise ValueError('Unsupported operation')
    return a + b if operation == 'add' else a * b

request = {'a': 8, 'b': 7, 'operation': 'multiply'}
print(calculator(**request))
