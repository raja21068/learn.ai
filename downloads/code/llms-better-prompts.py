# Free AI Learning Center | Large Language Models | Prompts & structured output
# MIT licensed original example. Python 3, standard library only.

task = 'Summarize this note in one sentence'
note = 'The group met Tuesday and agreed to test the model.'
prompt = f"""Task: {task}
Rules: Be factual; if unknown, say unknown.
Input: {note}
Output: one sentence
"""
print(prompt)
