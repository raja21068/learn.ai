/* Curated alternative challenge formats. These are optional practice, not certification exams. */
window.LEARNING_CHALLENGES = {
  activities: {
    'python/hello-variables': [{ id: 'var-order', type: 'order', prompt: 'Arrange the steps to display the value 5.',
      items: ['Assign 5 to the variable count', 'Call print(count)', 'Read the displayed output'], initial: [2, 0, 1],
      why: 'A variable must be assigned before its value can be printed.' }],
    'python/lists-loops': [{ id: 'list-count', type: 'text', prompt: 'Type the Python built-in function name that returns the number of list elements (without parentheses).', answers: ['len'], why: 'len(list_name) gives the number of elements.' }],
    'ai-foundations/what-is-ai': [{ id: 'ai-defs', type: 'multi', prompt: 'Which are explicit approaches to defining AI in this lesson? Select all that apply.',
      options: ['Thinking rationally', 'Acting rationally', 'Always having human emotions', 'Thinking humanly'], correct: [0, 1, 3],
      why: 'Thinking/acting humanly and thinking/acting rationally are the four perspectives.' }],
    'machine-learning/ml-landscape': [{ id: 'ml-order', type: 'order', prompt: 'Put the basic ML evaluation sequence in order.',
      items: ['Split data into training and held-out test sets', 'Train on training data', 'Evaluate once on the held-out test set'], initial: [2, 1, 0],
      why: 'Keep the held-out test set untouched until final evaluation; use separate validation data for model selection.' }],
    'databases/why-databases': [{ id: 'db-keys', type: 'text', prompt: 'What acronym names the system that centrally manages a database? Type just the four letters.', answers: ['dbms'], why: 'DBMS stands for database management system.' }],
    'ai-agents/agent-spectrum': [{ id: 'agent-loop', type: 'order', prompt: 'Place the simplified agent loop in a logical operational order.', items: ['Observe the environment', 'Choose an action', 'Use a tool or act', 'Observe the result'], initial: [2, 0, 3, 1], why: 'Agentic behavior involves a feedback loop, not only generating text.' }],
    'llm-engineering/ai-twin-architecture': [{ id: 'fti', type: 'multi', prompt: 'Which are the three FTI pipelines? Select all that apply.', options: ['Feature', 'Training', 'Inference', 'Presentation'], correct: [0, 1, 2], why: 'FTI denotes feature, training, inference.' }],
    'prompt-engineering/how-llms-read-prompts': [{ id: 'tokens', type: 'text', prompt: 'What are the basic units a language model processes called? (one plural word)', answers: ['tokens'], why: 'Text is tokenized into model-specific token units.' }]
  },
  // Different wording / items from standard lesson quizzes where available.
  reviews: {
    'python/hello-variables': { prompt: 'Which Python statement assigns the integer five to n?', options: ['n == 5', 'n = 5', 'print(n)'], correct: 1, why: '= assigns; == compares.' },
    'python/lists-loops': { prompt: 'What does len([2, 4, 6, 8]) return?', options: ['3', '4', '8'], correct: 1, why: 'The list has four elements.' },
    'ai-foundations/what-is-ai': { prompt: 'Which AI framing prioritizes choosing the best available action?', options: ['Acting rationally', 'Thinking humanly', 'Acting randomly'], correct: 0, why: 'Rational agents choose actions based on goals and available information.' },
    'machine-learning/ml-landscape': { prompt: 'When should a held-out test set guide the model design?', options: ['At every training step', 'During hyperparameter tuning', 'Only final unbiased evaluation'], correct: 2, why: 'Selection is done with validation data; using test feedback repeatedly leaks information.' },
    'databases/why-databases': { prompt: 'What most directly distinguishes a DBMS from unrelated spreadsheet copies?', options: ['Larger fonts', 'Centralized data management and integrity controls', 'No need to query data'], correct: 1, why: 'A DBMS provides shared storage, consistency and query features.' },
    'ai-agents/agent-spectrum': { prompt: 'Which capability changes a chatbot into an action-taking agent?', options: ['Longer prose', 'Controlled tool use with feedback', 'A larger font'], correct: 1, why: 'The agent uses actions and observes outcomes.' },
    'llm-engineering/ai-twin-architecture': { prompt: 'Where should versioned trained model artifacts be stored?', options: ['Model registry', 'UI state', 'Browser history'], correct: 0, why: 'The model registry stores and versions trained models.' },
    'prompt-engineering/how-llms-read-prompts': { prompt: 'Which statement best describes text tokenization?', options: ['Text is always one token per word', 'Text is broken into model-specific token units', 'Every character is a token'], correct: 1, why: 'Tokenization is model-specific; a token need not equal a word or character.' }
  }
};
