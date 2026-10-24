# Free AI Learning Center | Machine Learning | Metrics & overfitting
# MIT licensed original example. Python 3, standard library only.

true = [1, 0, 1, 0, 1]
pred = [1, 0, 0, 0, 1]
correct = sum(a == b for a, b in zip(true, pred))
print('Accuracy:', correct / len(true))
