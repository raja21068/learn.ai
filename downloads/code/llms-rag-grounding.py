# Free AI Learning Center | Large Language Models | Retrieval-augmented generation
# MIT licensed original example. Python 3, standard library only.

docs = {
    'python': 'Python is a programming language.',
    'rag': 'RAG supplies retrieved material as model context.',
}
query = 'What is RAG?'
term = 'rag' if 'rag' in query.lower() else 'python'
print('Source:', docs[term])
# Retrieval demo only: no language model is called.
