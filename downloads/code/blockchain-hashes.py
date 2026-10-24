# Free AI Learning Center | Blockchain Basics | Hashes & tamper evidence
# MIT licensed original example. Python 3, standard library only.

import hashlib
for text in ['hello', 'Hello']:
    digest = hashlib.sha256(text.encode()).hexdigest()
    print(text, digest[:16])
