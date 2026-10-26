/* Course facts shown in each course's "Course at a glance" panel.
   Edit here: prerequisites (course ids link to that course; text is shown as written), availability status,
   and the month the course content last changed. Everything else in the panel is counted from the course data. */
window.COURSE_META = {
  updated: 'October 2026',
  status: { available: 'Fully available', developing: 'Still being developed' },
  courses: {
    'python':               { status: 'available', prereq: [], note: 'No programming experience needed.' },
    'machine-learning':     { status: 'available', prereq: ['python'], note: 'High-school algebra.' },
    'ai-foundations':       { status: 'available', prereq: ['python'], note: 'Basic probability helps.' },
    'prompt-engineering':   { status: 'available', prereq: [], note: 'No programming needed for the first parts.' },
    'deep-learning':        { status: 'available', prereq: ['machine-learning'], note: 'Python with NumPy; basic linear algebra and calculus.' },
    'llm-engineering':      { status: 'available', prereq: ['prompt-engineering', 'deep-learning'], note: 'Comfortable writing Python.' },
    'ai-agents':            { status: 'available', prereq: ['prompt-engineering'], note: 'Comfortable writing Python.' },
    'databases':            { status: 'available', prereq: [], note: 'No prior database experience needed.' },
    'operating-systems':    { status: 'available', prereq: [], note: 'Basic programming in any language.' },
    'computer-networking':  { status: 'available', prereq: [], note: 'Basic computer literacy.' },
    'algorithm-design':     { status: 'available', prereq: [], note: 'Programming in any language and basic discrete maths (induction, proofs).' },
    'statistical-learning': { status: 'available', prereq: [], note: 'Introductory statistics and linear algebra.' },
    'ml':                   { status: 'available', prereq: ['python'], note: '' },
    'blockchain':           { status: 'available', prereq: [], note: '' },
    'llms':                 { status: 'available', prereq: [], note: '' },
    'agents':               { status: 'available', prereq: ['llms'], note: '' }
  }
};
