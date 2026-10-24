import json, pathlib, textwrap, os, re
ROOT=pathlib.Path('/mnt/data/ai-learning-center')

def L(id,title,goal,explain,analogy,points,code,q,options,correct,why,takeaway):
    return dict(id=id,title=title,minutes=5,goal=goal,explain=explain,analogy=analogy,points=points,code=textwrap.dedent(code).strip()+"\n",challenge=dict(question=q,options=options,correct=correct,explanation=why),takeaway=takeaway)

courses=[
 dict(id='python',title='Python Essentials',subtitle='Your first steps into programming, without the jargon.',tag='Start here',category='foundations',accent='#4868e8',symbol='Py',level='Absolute beginner',outcome='Write small programs that use data, decisions, and reusable functions.',lessons=[
  L('hello-variables','Values & variables','Print information and store a value.','Python runs instructions from top to bottom. A variable is a name that refers to a value. Strings represent text, while integers represent whole numbers. The print() function displays a result.','Think of a variable as a labeled drawer: the label is the name, and the value is what you put inside.', ['Assign a value using = (this is not a mathematical equality statement).','Use f-strings to insert values into readable output.'],'''name = "Sam"
lessons = 3
print(f"Hi {name}! You finished {lessons} lessons.")''','What does `score = 10` do?',['Compares score with 10','Assigns 10 to score','Prints 10'],1,'The single = assigns a value. The comparison operator is ==.','A program becomes useful when you can name, store, and display information.'),
  L('lists-loops','Lists & loops','Repeat work over a collection.','A list stores several items in order. A for loop visits each item once. This avoids writing the same instruction again and again. Use len() to count items.','A list is a shopping basket. A for loop picks up each item in the basket and checks it.', ['Lists use square brackets; positions begin at 0.','Use `for item in items:` with an indented body.'],'''scores = [70, 85, 90]
for score in scores:
    print('Score:', score)
print('Count:', len(scores))''','How many times does this loop run for `[4, 5, 6]`?',['Two','Three','Four'],1,'The list has three elements, so the body executes three times.','Collections and loops let you process many records with a few lines.'),
  L('functions-decisions','Functions & decisions','Create reusable logic with conditions.','A function packages instructions under a name. Parameters accept inputs; return sends back a result. An if statement selects a branch depending on whether a condition is true.','A function resembles a small machine: supply inputs, and it returns a predictable output.', ['Define a function with `def name(parameter):`.','Keep the function focused on one understandable task.'],'''def grade(score):
    if score >= 60:
        return 'Pass'
    return 'Try again'

print(grade(75))''','What will `grade(40)` return?',['Pass','Try again','40'],1,'Because 40 is below 60, the if condition is false and execution reaches the second return.','Functions make programs easier to reuse, test, and explain.'),
  L('data-dictionaries','Dictionaries & simple data','Store structured information and compute a summary.','A dictionary stores values under meaningful keys, such as a person’s name or a score. Dictionaries are useful for records, configuration, and data analysis. You can combine dictionaries with basic arithmetic.','A dictionary is a filing cabinet: each labeled folder leads to its corresponding value.', ['Read a value with `record["key"]`.','Use `sum()` and `len()` to compute a simple average.'],'''student = {'name': 'Ava', 'scores': [80, 90, 100]}
average = sum(student['scores']) / len(student['scores'])
print(student['name'], 'average:', average)''','Which structure is best for `{"name": "Ava", "age": 19}`?',['A list','A dictionary','A float'],1,'A dictionary associates each key with a value.','When your data has named fields, dictionaries are often clearer than parallel lists.')]),
 dict(id='ml',title='Machine Learning',subtitle='Understand patterns, predictions, and model evaluation.',tag='Most popular',category='foundations',accent='#0b9987',symbol='ML',level='Beginner',outcome='Explain training, create a tiny predictor, and judge its mistakes.',lessons=[
  L('what-is-ml','What is machine learning?','Tell conventional code apart from learning from examples.','Traditional programs follow rules written by people. In supervised machine learning, an algorithm fits a model to input-output examples so it can predict outcomes for new inputs. Learning a pattern is not the same as understanding causes.','Instead of writing every rule for recognizing fruit, show the model examples with measurable features and labels.', ['Features are the input measurements; labels are target answers.','A model learns from examples, then predicts for unseen examples.'],'''examples = [(1, 2), (2, 4), (3, 6)]
# Illustration: all examples follow y = 2 * x.
def predict(x):
    return 2 * x
print('Prediction for 4:', predict(4))''','In supervised learning, what are labels?',['The target answers','The computer model','The training time'],0,'Labels are the known outcomes used to guide training.','ML learns patterns from data; predicting well requires meaningful evaluation.'),
  L('train-test','Train, validate, test','Understand why a fair test uses unseen data.','A training set fits the model. A validation set helps select model settings. A test set estimates performance after choices are finalized. If you tune a model against the test set, its estimate becomes optimistic.','Practicing on last year’s exam solutions differs from sitting a new exam you have never seen.', ['Keep the test set out of the model-selection process.','Prevent leakage: near-duplicate records or a person’s records should not cross splits when they create dependency.'],'''data = list(range(10))
train = data[:6]
validation = data[6:8]
test = data[8:]
print('Train:', train)
print('Validation:', validation)
print('Test:', test)''','Which split should estimate final generalization after tuning?',['Training','Validation','Held-out test'],2,'The held-out test set is reserved for an unbiased final check under the assumed sampling design.','A convincing score depends on proper data separation, not just a powerful model.'),
  L('nearest-neighbor','Build a tiny classifier','Use the nearest labeled example to make a prediction.','A one-nearest-neighbor classifier predicts the label of the closest training example under a chosen distance metric. It is a useful baseline, but feature scale and noise matter. Here we use one-dimensional distance for clarity.','If a new fruit has weight close to a known apple, a nearest-neighbor rule might assign the apple label.', ['Measure distance between a query and each training sample.','Choose the label attached to the smallest distance.'],'''training = [(1, 'low'), (5, 'medium'), (9, 'high')]
query = 6
closest = min(training, key=lambda row: abs(row[0] - query))
print('Predicted label:', closest[1])''','For query 8, which point is nearest: 1, 5, or 9?',['1','5','9'],2,'Distance from 8 to 9 is 1; to 5 is 3; to 1 is 7.','Even a simple baseline can establish whether a complex model is necessary.'),
  L('evaluation','Metrics & overfitting','Calculate accuracy and recognize its limits.','Accuracy is the fraction of correct predictions. It can be misleading when classes are imbalanced: predicting the majority class may look excellent while missing every rare event. Also compare training and held-out performance to detect overfitting.','A weather forecast saying “no rain” every day can appear accurate in a dry region, yet fail whenever rain matters.', ['Compute accuracy as correct predictions divided by total predictions.','For imbalanced problems, examine precision, recall, and a confusion matrix too.'],'''true = [1, 0, 1, 0, 1]
pred = [1, 0, 0, 0, 1]
correct = sum(a == b for a, b in zip(true, pred))
print('Accuracy:', correct / len(true))''','A classifier gets 95% accuracy on a dataset with 95% negatives by always predicting negative. Is it reliable?',['Always','Not necessarily','Only for Python'],1,'It may detect none of the positive cases. Check class-specific metrics and intended use.','Evaluation asks what kinds of mistakes matter, not only how many.')]),
 dict(id='blockchain',title='Blockchain Basics',subtitle='Blocks, hashes, ledgers, and what decentralization does—and does not—solve.',tag='Understand systems',category='systems',accent='#b86c2c',symbol='BC',level='Beginner',outcome='Build a toy chain and reason about its guarantees and limitations.',lessons=[
  L('shared-ledger','A shared ledger','Explain what a blockchain records.','A blockchain is an append-oriented sequence of records grouped into blocks, where each block references a previous block through a cryptographic hash. Some blockchains use distributed consensus to agree on the current ledger. A blockchain does not make entered data automatically truthful.','Picture a notebook copied across many desks: everyone needs a rule for which new pages belong in the official copy.', ['Transactions record events or changes in state.','Consensus and cryptographic checks address different trust problems.'],'''ledger = []
ledger.append({'from': 'A', 'to': 'B', 'amount': 3})
ledger.append({'from': 'B', 'to': 'C', 'amount': 1})
for event in ledger:
    print(event)''','Does storing data on a blockchain prove the data was true before entry?',['Yes','No','Only for large blocks'],1,'A ledger can preserve submitted records, but external data may still be inaccurate or fraudulent.','Blockchain is a shared record-keeping architecture, not a universal truth engine.'),
  L('hashes','Hashes & tamper evidence','Observe how a hash changes when input changes.','A cryptographic hash transforms arbitrary data into a fixed-size digest. SHA-256 is deterministic, and tiny input changes usually produce very different digests. A hash is not encryption: there is no decryption key for recovering the original message.','A hash resembles a fingerprint of data, except it is computed mathematically and not uniquely guaranteed for all possible inputs.', ['Use a canonical encoding before hashing structured records.','Hashes help expose edits, but alone do not prove authorship or establish consensus.'],'''import hashlib
for text in ['hello', 'Hello']:
    digest = hashlib.sha256(text.encode()).hexdigest()
    print(text, digest[:16])''','What happens when you change one character in a message?',['The SHA-256 digest usually changes significantly','The digest stays the same','The message becomes encrypted'],0,'Cryptographic avalanche behavior makes small edits produce substantially different digests.','Hash links are an important ingredient of tamper evidence.'),
  L('linked-blocks','Make a toy blockchain','Connect two blocks using a previous hash.','Each block can store a payload and a digest of the prior block. When a previous block changes, its hash no longer matches the next block’s stored link. This demonstration omits consensus, signatures, networking, and persistence; it is not a secure cryptocurrency.','It is like numbering pages and including the previous page’s checksum on the next page.', ['Serialize records consistently before hashing.','Linking blocks detects inconsistency, but an attacker able to rewrite every block may recompute all hashes.'],'''import hashlib, json

def digest(record):
    raw = json.dumps(record, sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()

first = {'prev': 'GENESIS', 'data': 'A pays B'}
second = {'prev': digest(first), 'data': 'B pays C'}
print(second['prev'] == digest(first))''','If an attacker rewrites the first block and all following hashes, what is still needed to resist the attack?',['A larger font','An external trust or consensus mechanism','More print statements'],1,'Hash links alone are insufficient against someone who can recompute the entire chain.','Security claims require an explicit threat model, not just a hash function.'),
  L('consensus-contracts','Consensus & smart contracts','Distinguish shared agreement from programmed rules.','Consensus rules help network participants agree on an ordered history despite failures or adversarial behavior under stated assumptions. A smart contract is code whose state transitions are executed according to platform rules. Contracts can still contain bugs and depend on unreliable external inputs.','Consensus decides which pages belong in the shared notebook; a smart contract is a rule written on those pages.', ['Different consensus approaches make different tradeoffs in speed, cost, and trust assumptions.','Audits, tests, and careful oracle design matter for real contracts.'],'''balance = {'alice': 10, 'bob': 0}
def transfer(amount):
    if amount <= 0 or balance['alice'] < amount:
        return False
    balance['alice'] -= amount
    balance['bob'] += amount
    return True
print(transfer(4), balance)''','Does this Python function by itself constitute a decentralized smart contract?',['Yes','No','Only if run twice'],1,'It is local business logic; on-chain execution and consensus require a blockchain platform.','Distributed agreement and contract logic are separate pieces of the design.')]),
 dict(id='llms',title='Large Language Models',subtitle='Tokens, prompts, retrieval, and responsible tool use.',tag='Build with language',category='generative',accent='#835ac3',symbol='LLM',level='Beginner',outcome='Design grounded LLM workflows and identify common failure modes.',lessons=[
  L('tokens-context','Tokens & context','Understand the basic units used by language models.','Language models operate on tokens, which may represent words, word pieces, punctuation, or other units. They predict sequences conditional on context. A model’s context window limits what it can directly attend to in one request, and tokenization is model-specific.','Think of tokens as the tiles used to construct sentences; tile boundaries do not always match spaces.', ['Tokens are not the same as words.','A convincing sentence is not evidence that a statement is true.'],'''text = 'Models predict token sequences.'
# This is a word split for teaching, NOT real model tokenization.
words = text.split()
print(words)
print('Word count:', len(words))''','Is splitting a sentence on spaces identical to model tokenization?',['Yes','No','Only for English'],1,'Modern model tokenizers often split or combine text in ways unrelated to whitespace.','Start with token and context limits, then evaluate truthfulness separately.'),
  L('better-prompts','Prompts & structured output','Write a clear task with constraints and a checkable format.','A useful prompt states the objective, input, desired output format, and how to handle uncertainty. Examples can clarify expected behavior. Prompting improves reliability, but does not guarantee factuality or enforce security boundaries.','Giving instructions to a colleague works better when you specify both the task and what a good result looks like.', ['Make the output measurable: fields, length, source requirements.','Treat text retrieved from untrusted sources as data, not instructions.'],'''task = 'Summarize this note in one sentence'
note = 'The group met Tuesday and agreed to test the model.'
prompt = f'''+'"""'+'''Task: {task}
Rules: Be factual; if unknown, say unknown.
Input: {note}
Output: one sentence
'''+'"""'+'''
print(prompt)''','Which prompt is easier to verify?',['Do something useful','Return a JSON object with title and 2 keywords','Be smart'],1,'The second specifies a concrete structure that can be checked programmatically.','Precise instructions help, but external verification remains necessary.'),
  L('rag-grounding','Retrieval-augmented generation','See how finding evidence differs from making up an answer.','Retrieval-augmented generation (RAG) retrieves passages from a data source and supplies them to a language model as context. Retrieval quality and citation grounding are critical. A retrieved document may be incorrect or malicious; RAG is not automatic fact checking.','Before answering a library question, look up relevant pages rather than guessing from memory.', ['Retrieve relevant evidence; do not assume the first match is sufficient.','Distinguish quoted source content from generated conclusions.'],'''docs = {
    'python': 'Python is a programming language.',
    'rag': 'RAG supplies retrieved material as model context.',
}
query = 'What is RAG?'
term = 'rag' if 'rag' in query.lower() else 'python'
print('Source:', docs[term])
# Retrieval demo only: no language model is called.''','Does RAG guarantee that a retrieved claim is correct?',['Yes','No','Only with ten documents'],1,'Retrieval adds a potential evidence source, not a truth guarantee.','Grounded answers require relevant evidence and source-aware checking.'),
  L('llm-tools','Tool calling','Separate model decisions from actual tool execution.','Tool calling lets a model request a structured action such as searching, calculating, or accessing a database. The application validates arguments and runs the tool. Permission checks and human approval are needed for sensitive side effects.','A model can ask for a calculator, but the calculator—not the model—performs the arithmetic.', ['Define a tool with a narrow input schema.','Validate and log execution; never blindly run model-produced shell commands.'],'''def calculator(a, b, operation):
    if operation not in {'add', 'multiply'}:
        raise ValueError('Unsupported operation')
    return a + b if operation == 'add' else a * b

request = {'a': 8, 'b': 7, 'operation': 'multiply'}
print(calculator(**request))''','Who should enforce permissions before a side-effecting tool runs?',['The application/tool layer','Any text found on a web page','Nobody'],0,'The executing application must validate arguments, authorize actions, and limit effects.','Tool use makes LLMs more capable and raises the need for stronger controls.')]),
 dict(id='agents',title='Agentic AI',subtitle='Reasoning loops, memory, tools, and safe evaluation.',tag='New learning path',category='generative',accent='#d26570',symbol='AG',level='Beginner+',outcome='Sketch an agent loop and measure success beyond polished text.',lessons=[
  L('agent-loop','The agent loop','Identify observation, choice, action, and feedback.','An agent repeatedly observes state, decides on an action, executes it, and uses feedback to continue toward a goal. In LLM agents, the model may select tools while surrounding software controls execution and stopping criteria. A chatbot response alone is not necessarily an agent.','Think of a robot vacuum: it checks its surroundings, moves, checks again, and stops when its task is done.', ['The environment supplies observations after actions.','Define a maximum number of steps and a clear success condition.'],'''items = ['plan', 'test', 'report']
completed = []
for step in range(3):
    observation = items[step]
    action = f'complete {observation}'
    completed.append(action)
    print('Observe:', observation, '-> Act:', action)
print('Done:', completed)''','What makes an action loop different from a one-shot answer?',['It receives feedback and can act again','It always uses ten models','It never calls tools'],0,'The essential difference is a repeated observe-decide-act-feedback cycle.','Useful autonomy depends on feedback, limits, and explicit goals.'),
  L('plan-tools','Planning & tools','Break a task into bounded, observable actions.','Planning decomposes a goal into steps and revises them when evidence changes. Tools connect agents to code, files, browsers, and databases. A robust plan checks preconditions, handles failure, and avoids performing irreversible actions without authorization.','Planning a trip means choosing stops, checking transport, and adapting when a train is cancelled.', ['Choose small steps with verifiable outputs.','Keep tool permissions narrow and distinguish read-only actions from writes.'],'''plan = [
    {'task': 'read file', 'requires_approval': False},
    {'task': 'delete file', 'requires_approval': True},
]
for step in plan:
    state = 'ask user' if step['requires_approval'] else 'can inspect'
    print(step['task'], '=>', state)''','Which action should typically require additional approval?',['Reading a public webpage','Deleting files','Counting list elements'],1,'Deleting data is a high-impact side effect and should require appropriate authorization.','A good agent design is a control system, not just a lengthy prompt.'),
  L('agent-memory','Short- & long-term memory','Choose what state an agent needs to retain.','Working memory keeps relevant context for the current run. Persistent memory can store verified preferences, knowledge, or past results for future tasks. Memory can become stale, mistaken, sensitive, or inconsistent, so provenance and correction mechanisms matter.','A sticky note helps with today’s errands; a labeled archive helps you find trustworthy records later.', ['Keep temporary task state separate from persistent knowledge.','Store only what is necessary and give users control over personal data.'],'''working_memory = {'task': 'draft checklist', 'step': 2}
knowledge = {'python': 'A general-purpose language'}
print('Current step:', working_memory['step'])
print('Known fact:', knowledge.get('python'))''','Which item belongs in working memory rather than long-term memory?',['Current tool step','A verified reusable reference','A project glossary'],0,'A current step is usually transient and does not need persistent storage.','Memory is useful only when its accuracy, scope, and lifecycle are controlled.'),
  L('agent-eval','Evaluation & guardrails','Specify success, cost, and safety checks.','Agent evaluation should measure actual task outcomes, not only fluent explanations. Track success rate, incorrect tool calls, cost, latency, and unintended side effects. Use held-out cases and repeat runs where stochastic behavior matters. A successful benchmark result does not prove general reliability.','A delivery service should be graded on correct deliveries, delays, and damage—not on how confidently it describes routes.', ['Define tests with observable pass/fail criteria.','Log tool actions and include failure cases, timeouts, and prompt-injection tests.'],'''runs = [True, False, True, True, False]
successes = sum(runs)
print('Success rate:', successes / len(runs))
print('Failures to inspect:', len(runs) - successes)''','Which metric directly measures whether the task was completed?',['Task success rate','Number of adjectives','Length of reasoning'],0,'Task success rate targets the intended outcome, although safety and cost must also be measured.','Evaluate agents as software systems operating in an environment.')])
]

# Verified public GitHub files were inspected through the GitHub connection.
resources=[
 dict(name='Machine Learning slides',kind='Course slides',description='Original public lecture decks on classification, clustering, and introductory ML.',repo='raja21068/Machine-Learning-For-Beginerrs-Course-PPT',links=[
  ['Introduction PPTX','Lecture 01 - Introduction.pptx'],['KNN classification PPTX','Lecture 6 - Classification-KNN.pptx'],['Clustering PPTX','Lecture 11 - Clustering.pptx']]),
 dict(name='Network Security slides',kind='Course slides',description='Existing public PowerPoint chapters; older .ppt file format.',repo='raja21068/Network-Security-Course_PPT',links=[['Chapter 1 PPT','chapter1(1).ppt'],['Chapter 2 PPT','chapter2(1).ppt']]),
 dict(name='Big Data Analytics slides',kind='Course slides',description='Public decks introducing analytics, sampling, streams, and distributed processing.',repo='raja21068/Big-Data-Analytics-and-Mining-Course-PPT',links=[['Introduction PPTX','Lecture 1 Intro-new.pptx'],['Data streams PPTX','Lecture 5 Data Stream.pptx'],['Hadoop & Spark PPTX','Lecture 7 Hadoop-Spark.pptx']]),
 dict(name='Federated Learning framework',kind='Related project',description='Verified related Python project. The originally supplied Federated-learning-PPT address is unavailable (404).',repo='raja21068/Federated-Learning-Framework',links=[['Repository README','README.md'],['Sample client code','client1.py']]),
 dict(name='Blockchain smart contracts',kind='Related project',description='A separate, verified repository with a smart-contract demonstration and original slide material.',repo='raja21068/Smart-Contract-Blockchain',links=[['Decentralized web PPTX','IPFS Decentralized web system.pptx'],['Repository README','README.md']]),
]
practice_tasks = {
    'hello-variables': 'Change the name, increase the lesson count to 5, and predict the exact output before running it.',
    'lists-loops': 'Add 100 to the scores list and print the new item count and total using sum().',
    'functions-decisions': 'Change the passing threshold to 70. Test the function with 69, 70, and 71.',
    'data-dictionaries': 'Add a fourth score of 95 and calculate the new average; compare it with the original.',
    'what-is-ml': 'Change the input from 4 to 7. Explain why a hard-coded rule is only a teaching illustration, not a trained model.',
    'train-test': 'Create a 5-item training split, 3-item validation split, and 2-item test split without overlapping records.',
    'nearest-neighbor': 'Try queries 2 and 8. Record which training label the distance rule selects.',
    'evaluation': 'Flip the third prediction to 1, recalculate accuracy, and explain which error was corrected.',
    'shared-ledger': 'Append a third transaction and print the entire ledger. Explain what this still cannot verify.',
    'hashes': 'Hash your own two messages that differ by one character; compare their first 16 digest characters.',
    'linked-blocks': 'Change first["data"] after creating second. Re-run the link check and explain why it now fails.',
    'consensus-contracts': 'Attempt transfers of 15 and then 0. Check that both fail and balances remain unchanged.',
    'tokens-context': 'Replace the sample sentence with punctuation and contractions. Explain why split() is not a real tokenizer.',
    'better-prompts': 'Rewrite the example prompt to request exactly two bullet points and an uncertainty label.',
    'rag-grounding': 'Add one document entry and retrieve it by a matching search term; describe what happens on a missing match.',
    'llm-tools': 'Call the allowed add operation, then try an unsupported operation and observe the validation error.',
    'agent-loop': 'Add a fourth task, remove the hard-coded step count, and confirm the loop terminates after all items.',
    'plan-tools': 'Add a read-only search step and a payment step that requires approval; inspect the output.',
    'agent-memory': 'Change the current step from 2 to 3 and add a temporary observation; keep the knowledge dictionary unchanged.',
    'agent-eval': 'Change one failed run to a success, recompute the success rate, and state the change in percentage points.',
}
for course in courses:
    for lesson in course['lessons']:
        lesson['practice'] = practice_tasks[lesson['id']]

for r in resources:
    r['url']='https://github.com/'+r['repo']
    branch='master' if r['repo'].endswith('Smart-Contract-Blockchain') else 'main'
    for item in r['links']:
        from urllib.parse import quote
        item.append('https://github.com/'+r['repo']+'/blob/'+branch+'/'+quote(item[1],safe='/'))
site=dict(name='Free AI Learning Center',version='1.0',courses=courses,resources=resources,stats=dict(tracks=len(courses),lessons=sum(len(c['lessons']) for c in courses),minutes=sum(l['minutes'] for c in courses for l in c['lessons'])))
(ROOT/'assets'/'catalog.json').write_text(json.dumps(site,indent=2,ensure_ascii=False),encoding='utf-8')
print('built catalog',site['stats'])
