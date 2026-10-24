# Free AI Learning Center | Machine Learning | Build a tiny classifier
# MIT licensed original example. Python 3, standard library only.

training = [(1, 'low'), (5, 'medium'), (9, 'high')]
query = 6
closest = min(training, key=lambda row: abs(row[0] - query))
print('Predicted label:', closest[1])
