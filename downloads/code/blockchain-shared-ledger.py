# Free AI Learning Center | Blockchain Basics | A shared ledger
# MIT licensed original example. Python 3, standard library only.

ledger = []
ledger.append({'from': 'A', 'to': 'B', 'amount': 3})
ledger.append({'from': 'B', 'to': 'C', 'amount': 1})
for event in ledger:
    print(event)
