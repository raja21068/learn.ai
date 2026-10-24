# Free AI Learning Center | Blockchain Basics | Consensus & smart contracts
# MIT licensed original example. Python 3, standard library only.

balance = {'alice': 10, 'bob': 0}
def transfer(amount):
    if amount <= 0 or balance['alice'] < amount:
        return False
    balance['alice'] -= amount
    balance['bob'] += amount
    return True
print(transfer(4), balance)
