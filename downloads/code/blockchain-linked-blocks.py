# Free AI Learning Center | Blockchain Basics | Make a toy blockchain
# MIT licensed original example. Python 3, standard library only.

import hashlib, json

def digest(record):
    raw = json.dumps(record, sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()

first = {'prev': 'GENESIS', 'data': 'A pays B'}
second = {'prev': digest(first), 'data': 'B pays C'}
print(second['prev'] == digest(first))
