/* Original prompt library: reusable templates with {{variables}}. Written for this site; not copied from any book.
   window.PROMPT_LIBRARY = { cats, prompts }; window.renderPromptLibrary(el, opts) renders a searchable, fillable gallery. */
(() => {
  'use strict';
  const cats = [
    ['core', '🧱', 'Prompt building'], ['jobs', '💼', 'Job search'], ['email', '📧', 'Email & meetings'], ['business', '📊', 'Business writing'],
    ['research', '🔍', 'Research & analysis'], ['communication', '🗣', 'Communication'], ['webdev', '🌐', 'Web development'], ['code', '💻', 'Programming'],
    ['hr', '🧑‍🤝‍🧑', 'HR & training'], ['marketing', '📣', 'Sales & marketing'], ['teachers', '🍎', 'Teachers'], ['students', '🎓', 'Students'],
    ['creative', '✍️', 'Creative writing'], ['media', '🎨', 'Images, video & music'], ['home', '🏡', 'Home & everyday life'], ['growth', '🌱', 'Personal growth']
  ];
  const P = (cat, title, tags, text) => ({ cat, title, tags, text });
  const prompts = [
    /* core */
    P('core', 'Universal prompt skeleton', ['role', 'format'], 'You are {{role}}.\nTask: {{task}}\nContext: {{context}}\nConstraints: {{constraints}}\nOutput format: {{format}}\n\nInput:\n"""\n{{input}}\n"""'),
    P('core', 'Ask me questions first', ['inversion'], 'I want help with {{goal}}. Before you answer, ask me up to 5 short questions that would most improve your answer. Ask them one at a time and wait for my reply to each.'),
    P('core', 'Improve my prompt', ['meta', 'refinement'], 'Act as an expert prompt engineer. Improve the prompt below for clarity, specificity and a well-defined output. Return: 1) the improved prompt, 2) a bullet list of what you changed and why, 3) any information I should add.\n\nPrompt:\n"""\n{{prompt}}\n"""'),
    P('core', 'Few-shot classifier', ['few-shot', 'format'], 'Classify each text into one of: {{labels}}. Reply with the label only.\n\nText: {{example_1}}\nLabel: {{label_1}}\n\nText: {{example_2}}\nLabel: {{label_2}}\n\nText: {{input}}\nLabel:'),
    P('core', 'Step-by-step reasoning', ['cot'], 'Solve the problem below. Think through it step by step, checking each step. Then write the final answer on its own line starting with "ANSWER:".\n\nProblem: {{problem}}'),
    P('core', 'Self-check before answering', ['self-reflection'], '{{task}}\n\nAfter drafting your answer, review it against these requirements: {{requirements}}. Fix anything that doesn\'t meet them, then give only the final version.'),
    P('core', 'Strict JSON output', ['format'], 'Extract the following fields from the text: {{fields}}. Return ONLY valid JSON with exactly these keys; use null when a value is missing. No explanation.\n\nText:\n"""\n{{text}}\n"""'),
    /* jobs */
    P('jobs', 'Tailor my résumé to a job', ['role', 'context'], 'Act as an experienced recruiter in {{industry}}. Compare my résumé to the job posting. List: 1) the 5 most important requirements, 2) where my résumé matches or misses each, 3) rewritten bullet points (with measurable results) that better match. Don\'t invent experience I don\'t have.\n\nJob posting:\n"""{{job_posting}}"""\n\nMy résumé:\n"""{{resume}}"""'),
    P('jobs', 'Cover letter draft', ['template'], 'Write a {{length}}-word cover letter for the {{position}} role at {{company}}. Tone: {{tone}}. Open with a specific hook about the company, connect 2–3 of my achievements to their needs, and end with a confident call to action.\n\nMy key achievements: {{achievements}}'),
    P('jobs', 'Mock interview coach', ['role', 'inversion'], 'You are an interviewer for a {{position}} position. Ask me one interview question at a time, mixing behavioral and technical questions. After each of my answers, give a score out of 10, one strength, and one concrete improvement using the STAR method. Start with question 1.'),
    P('jobs', 'Answer "tell me about yourself"', ['format'], 'Help me write a 60–90 second answer to "Tell me about yourself" for a {{position}} interview. Structure: present (current role), past (relevant experience), future (why this role). Use my background: {{background}}. Keep it conversational.'),
    P('jobs', 'Salary negotiation script', ['role'], 'Act as a career coach. I received an offer of {{offer}} for a {{position}} role. Market research suggests {{market_range}}. Write a polite, confident email asking for {{target}}, plus responses to two likely pushbacks.'),
    P('jobs', 'LinkedIn headline & summary', ['format'], 'Write 3 LinkedIn headline options (under 220 characters) and a 120-word About section for a {{role}} with expertise in {{skills}}, aiming to attract {{audience}}. Use first person and avoid clichés like "passionate" and "guru".'),
    /* email */
    P('email', 'Reply politely but firmly', ['tone'], 'Draft a reply to the email below. Goal: {{goal}}. Tone: polite, clear and firm. Keep it under {{words}} words and include one concrete next step.\n\nEmail:\n"""{{email}}"""'),
    P('email', 'Make this email clearer', ['refinement'], 'Rewrite this email to be clearer and more concise for a busy reader. Put the request in the first two sentences, use short paragraphs, and keep my voice. Then list the main changes.\n\n"""{{draft}}"""'),
    P('email', 'Meeting agenda', ['format'], 'Create an agenda for a {{duration}}-minute meeting about {{topic}} with {{attendees}}. Include: goal of the meeting, timed agenda items with owners, pre-reading, and the decisions we need to reach.'),
    P('email', 'Meeting notes → action items', ['format', 'extraction'], 'From the meeting transcript below, produce: 1) a 3-sentence summary, 2) decisions made, 3) action items as a table (task, owner, due date), 4) open questions. Use only information in the transcript.\n\n"""{{transcript}}"""'),
    P('email', 'Triage my inbox', ['classification'], 'Sort these emails into: Urgent today, This week, Delegate, Read later, Delete. For each, give one line on why and a suggested next action.\n\n{{emails}}'),
    P('email', 'Follow-up after no reply', ['tone'], 'Write a short, friendly follow-up to {{recipient}} about {{topic}}, sent {{days}} days after my first email with no reply. Make it easy to respond (yes/no question) and don\'t sound passive-aggressive.'),
    /* business */
    P('business', 'Executive summary', ['format'], 'Write an executive summary (max 150 words) of the report below for {{audience}}. Lead with the key conclusion, then 3 supporting points with numbers, then the recommended decision.\n\n"""{{report}}"""'),
    P('business', 'Proposal outline', ['template'], 'Create an outline for a business proposal to {{client}} for {{service}}. Sections: problem, proposed solution, deliverables, timeline, pricing options (3 tiers), risks and mitigation, next steps. Add 1–2 guiding questions under each section.'),
    P('business', 'Plain-language policy', ['refinement'], 'Rewrite this policy in plain language for {{audience}} at a reading level of about grade {{grade}}. Keep all requirements, use headings and bullet points, and add a 3-bullet "What this means for you" box.\n\n"""{{policy}}"""'),
    P('business', 'Edit for clarity & tone', ['refinement'], 'Edit the text below for clarity, grammar and a {{tone}} tone. Return the edited version, then a table of the 5 most important changes (original → revised → reason).\n\n"""{{text}}"""'),
    P('business', 'Press release', ['template'], 'Write a press release announcing {{announcement}} by {{company}}. Include a headline, subheadline, dateline ({{city}}, {{date}}), an opening paragraph answering who/what/when/where/why, one quote from {{spokesperson}}, and an "About {{company}}" section. Max 400 words.'),
    P('business', 'Decision memo', ['cot', 'format'], 'Write a one-page decision memo on whether to {{decision}}. Sections: context, options (at least 3), criteria, evaluation of each option against the criteria in a table, recommendation, risks. Facts: {{facts}}'),
    /* research */
    P('research', 'Summarize a source', ['format'], 'Summarize the text below for {{audience}}: a 2-sentence overview, 5 key points, 3 notable quotes (verbatim, with location), and any limitations or biases you notice.\n\n"""{{text}}"""'),
    P('research', 'Compare options table', ['format'], 'Compare {{options}} for {{use_case}}. Create a table with these criteria: {{criteria}}. Then recommend one option for each of these situations: {{situations}}. Flag anything you\'re unsure about.'),
    P('research', 'SWOT analysis', ['format'], 'Do a SWOT analysis for {{business}} entering {{market}}. Give 4 points per quadrant, each with a one-line justification, then 3 strategic recommendations that use strengths to address threats.'),
    P('research', 'Research plan', ['chain'], 'I need to research {{topic}} to {{goal}}. Create a research plan: key questions, types of sources to consult, search terms, how to evaluate source credibility, and a 1-week schedule.'),
    P('research', 'Explain like I\'m new to it', ['role'], 'Explain {{concept}} to someone with {{background}}. Use one everyday analogy, one concrete example, and finish with 3 common misconceptions. Keep it under {{words}} words.'),
    P('research', 'Survey data insights', ['cot'], 'Here are survey results: {{data}}. Identify the 5 most important insights, any surprising patterns, and what additional data would confirm them. Show your reasoning briefly for each insight and don\'t overstate certainty.'),
    /* communication */
    P('communication', 'Difficult conversation prep', ['role'], 'Help me prepare for a difficult conversation with {{person}} about {{issue}}. Give me: an opening line, 3 key points using "I" statements, likely reactions with calm responses, and a way to agree next steps.'),
    P('communication', 'Speech or toast', ['template'], 'Write a {{minutes}}-minute speech for {{occasion}}. Audience: {{audience}}. Tone: {{tone}}. Include an opening story or hook, 3 main points, one light moment of humor, and a memorable closing line.'),
    P('communication', 'Presentation outline', ['format'], 'Create a {{slides}}-slide presentation outline on {{topic}} for {{audience}}. For each slide: title, 3 bullet points max, and a suggested visual. End with a clear call to action.'),
    P('communication', 'Give constructive feedback', ['tone'], 'Help me write feedback for {{person}} about {{situation}}. Use the SBI format (situation, behavior, impact), include one genuine positive, and finish with a collaborative question.'),
    P('communication', 'Translate tone, not just words', ['role'], 'Translate this message into {{language}} for {{audience}}. Keep the meaning, adapt idioms and politeness to local norms, and note any phrases that don\'t translate directly.\n\n"""{{message}}"""'),
    P('communication', 'Social post from an article', ['format'], 'Turn the text below into {{count}} social media posts for {{platform}}: each with a hook in the first line, one key insight, and a question to drive comments. Respect the platform\'s typical length.\n\n"""{{text}}"""'),
    /* webdev */
    P('webdev', 'Landing page copy', ['template'], 'Write landing page copy for {{product}} aimed at {{audience}}. Sections: hero headline (max 10 words) + subheadline, 3 benefit blocks, social proof placeholder, FAQ (5 questions), and a call to action. Tone: {{tone}}.'),
    P('webdev', 'Accessible HTML component', ['constraints'], 'Write semantic, accessible HTML and CSS for {{component}}. Requirements: keyboard navigable, proper ARIA only where needed, works at 320px width, respects prefers-reduced-motion, no external libraries. Explain the accessibility choices briefly.'),
    P('webdev', 'SEO meta tags', ['format'], 'For a page about {{topic}} targeting the keyword "{{keyword}}", write: a title tag (max 60 characters), a meta description (max 155 characters), an H1, and 5 H2 suggestions. Avoid keyword stuffing.'),
    P('webdev', 'Website structure', ['format'], 'Propose a sitemap for a website for {{business}}. Primary goal: {{goal}}. List the pages, the purpose of each, key content blocks, and the main call to action per page.'),
    P('webdev', 'Fix my CSS layout', ['context'], 'My layout should {{expected}}, but instead {{actual}}. Here is the HTML and CSS:\n"""{{code}}"""\nExplain the cause, then give the minimal CSS change to fix it.'),
    P('webdev', 'Regex with examples', ['few-shot'], 'Write a regular expression that matches {{pattern_description}}. It must match: {{should_match}}. It must NOT match: {{should_not_match}}. Explain each part of the regex and give it for {{language}}.'),
    /* code */
    P('code', 'Explain this code', ['role'], 'Explain what this {{language}} code does, step by step, for a developer who is {{level}}. Then list potential bugs or edge cases.\n\n"""{{code}}"""'),
    P('code', 'Write unit tests', ['constraints'], 'Write {{framework}} unit tests for the function below. Cover normal cases, edge cases ({{edge_cases}}) and error handling. Use descriptive test names and no external services.\n\n"""{{code}}"""'),
    P('code', 'Refactor without changing behavior', ['refinement'], 'Refactor this {{language}} code for readability and maintainability without changing its behavior or public API. Then list each change and why it helps.\n\n"""{{code}}"""'),
    P('code', 'Debug an error', ['context', 'cot'], 'I get this error:\n"""{{error}}"""\nwhen running:\n"""{{code}}"""\nEnvironment: {{environment}}. Expected: {{expected}}. Explain the likely cause step by step, then give the fix.'),
    P('code', 'Code review', ['role', 'format'], 'Act as a senior {{language}} engineer doing a code review. Review the diff below for correctness, security, performance and readability. Return a table: severity, line or area, issue, suggested fix. End with 1–2 things done well.\n\n"""{{diff}}"""'),
    P('code', 'Implementation plan first', ['chain'], 'Before writing any code, create an implementation plan for {{feature}} in a {{stack}} project: files to change, new functions with signatures, data model changes, test plan, and risks. Wait for my approval before writing code.'),
    P('code', 'Comment-driven function', ['comment-driven'], 'Implement the following {{language}} function. Follow the docstring and comments exactly, and don\'t add dependencies.\n\n"""{{signature_and_comments}}"""'),
    P('code', 'SQL from a schema', ['context'], 'Given this database schema:\n"""{{schema}}"""\nWrite a SQL query ({{dialect}}) that {{question}}. Explain the joins and any assumptions.'),
    /* hr */
    P('hr', 'Inclusive job description', ['template'], 'Write a job description for a {{role}} at {{company}} ({{work_model}}). Include a summary, responsibilities, must-have vs. nice-to-have skills, benefits and a salary range of {{range}}. Use inclusive, gender-neutral language and avoid unnecessary requirements.'),
    P('hr', 'Structured interview questions', ['format'], 'Create 8 structured interview questions for a {{role}}, assessing {{competencies}}. For each: the question, what a strong answer includes, and a red flag.'),
    P('hr', 'Onboarding plan', ['template'], 'Create a 30-60-90 day onboarding plan for a new {{role}}. For each phase: goals, key meetings, learning resources, and success measures.'),
    P('hr', 'Training workshop outline', ['format'], 'Design a {{duration}} training workshop on {{topic}} for {{audience}}. Include learning objectives, an agenda with timings, one interactive activity per section, and a 5-question knowledge check.'),
    P('hr', 'Employee feedback survey', ['format'], 'Write a 10-question anonymous employee survey about {{topic}}. Mix 1–5 scale and open questions, keep each question neutral and non-leading, and add a short intro explaining how the results will be used.'),
    P('hr', 'Performance review draft', ['tone'], 'Help me write a balanced performance review for {{role}}. Achievements: {{achievements}}. Areas to improve: {{improvements}}. Use specific, behavior-based language and finish with 2 development goals.'),
    /* marketing */
    P('marketing', 'Customer persona', ['format'], 'Create a detailed customer persona for {{product}}: demographics, goals, frustrations, buying triggers, objections, preferred channels, and a typical day. Base it on: {{data}}.'),
    P('marketing', 'Product description', ['template'], 'Write a {{words}}-word product description for {{product}}. Audience: {{audience}}. Lead with the main benefit, include 3 features translated into benefits, address one objection, and end with a call to action. Tone: {{tone}}.'),
    P('marketing', 'Email campaign sequence', ['chain'], 'Plan a {{n}}-email nurture sequence for {{audience}} who signed up for {{lead_magnet}}. For each email: send day, subject line (2 options), goal, key message, and call to action.'),
    P('marketing', 'Ad copy variations', ['few-shot'], 'Write 5 variations of {{platform}} ad copy for {{product}}, each testing a different angle (pain, gain, social proof, urgency, curiosity). Respect {{platform}} character limits and label each angle.'),
    P('marketing', 'Sales objection handling', ['role'], 'Act as a top sales coach. For {{product}}, list the 6 most common objections from {{buyer}} and a short, honest response to each that asks a follow-up question.'),
    P('marketing', 'Content calendar', ['format'], 'Create a {{weeks}}-week content calendar for {{brand}} on {{channels}}. Table columns: date, channel, topic, format, hook, call to action. Balance educational, promotional and community posts.'),
    /* teachers */
    P('teachers', 'Lesson plan', ['template', 'format'], 'Create a {{duration}}-minute lesson plan for grade {{grade}} {{subject}} on "{{topic}}". Include: a learning objective (measurable), a warm-up, direct instruction, a guided activity, an independent activity, differentiation (support / extension), an exit ticket, and materials needed.'),
    P('teachers', 'Quiz from a text or video transcript', ['format'], 'Create a {{n}}-question quiz for grade {{grade}} based only on the text below: mix multiple choice (4 options), true/false and short answer. Include an answer key with a one-line explanation for each answer.\n\n"""{{text}}"""'),
    P('teachers', 'Rubric', ['format'], 'Create a rubric for a grade {{grade}} {{assignment}}. Criteria: {{criteria}}. Use 4 levels (Exceeds, Meets, Approaching, Beginning) with specific descriptors and points. Return it as a table.'),
    P('teachers', 'Feedback on student work', ['tone', 'role'], 'You are a supportive grade {{grade}} teacher. Using this rubric:\n"""{{rubric}}"""\ngive feedback on the student work below: 2 specific strengths, 2 next steps with examples, and an encouraging closing sentence. Don\'t rewrite the work.\n\n"""{{student_work}}"""'),
    P('teachers', 'Differentiate an activity', ['constraints'], 'Adapt this activity for three groups: students who need support (including {{needs}}), on-level students, and students ready for extension. Keep the same learning objective.\n\nActivity: {{activity}}'),
    P('teachers', 'Parent email', ['tone'], 'Write a warm, professional email to the parents of {{student}} about {{topic}}. Start with something positive, explain the concern with one specific example, suggest how we can work together, and invite a meeting. Under 180 words.'),
    P('teachers', 'Discussion questions', ['format'], 'Write {{n}} discussion questions about {{text_or_topic}} for grade {{grade}}, progressing from recall to analysis to evaluation (Bloom\'s taxonomy). Label each level.'),
    /* students */
    P('students', 'Socratic tutor', ['inversion', 'role'], 'Be my Socratic tutor for {{topic}}. Don\'t give me answers directly. Ask me one guiding question at a time, check my understanding, and only explain when I\'ve tried twice.'),
    P('students', 'Explain at 3 levels', ['format'], 'Explain {{concept}} at three levels: like I\'m 10, like a high-school student, and like a university student. End with a one-sentence summary I can memorize.'),
    P('students', 'Practice test', ['format'], 'Create a practice test on {{topic}} for {{level}}: {{n}} questions of increasing difficulty. Put the answers and explanations at the end, after a line saying "ANSWERS", so I can try first.'),
    P('students', 'Feedback on my essay (no rewriting)', ['constraints'], 'Give feedback on my essay draft using these criteria: thesis, evidence, structure, clarity. For each: a score out of 5 and one specific suggestion. Do NOT rewrite my essay.\n\n"""{{essay}}"""'),
    P('students', 'Study schedule', ['format'], 'Create a study plan for my {{exam}} on {{date}}. Topics: {{topics}}. I can study {{hours}} hours per day. Use spaced repetition and active recall, include review days, and put it in a table.'),
    P('students', 'Flashcards', ['format'], 'Create {{n}} flashcards on {{topic}} in the format "Q: … | A: …". Keep answers under 20 words, and include 3 cards on common confusions.'),
    /* creative */
    P('creative', 'Story starter', ['constraints'], 'Write the opening scene (about {{words}} words) of a {{genre}} story set in {{setting}}. The protagonist wants {{desire}} but fears {{fear}}. Start in the middle of the action and end on a question the reader needs answered.'),
    P('creative', 'Character profile', ['format'], 'Create a character profile for {{name}}, a {{role}} in a {{genre}} story: appearance, voice (with a sample line of dialogue), motivation, flaw, secret, and how they change by the end.'),
    P('creative', 'Dialogue polish', ['refinement'], 'Rewrite this dialogue so each character has a distinct voice, the subtext is stronger, and there is less exposition. Keep the plot the same.\n\n"""{{dialogue}}"""'),
    P('creative', 'Poem in a form', ['constraints'], 'Write a {{form}} about {{subject}} in the mood of {{mood}}. Use concrete imagery and avoid clichés. Then explain in two sentences the choices you made.'),
    P('creative', 'Plot brainstorm', ['few-shot'], 'Give me 7 different plot ideas for a {{genre}} story about {{theme}}. Each in two sentences, with a twist. Make them genuinely different from one another.'),
    P('creative', 'Kids\' bedtime story', ['constraints'], 'Write a gentle bedtime story for a {{age}}-year-old about {{topic}}, featuring {{character}}. About {{minutes}} minutes read aloud, with a calm ending and a small lesson about {{value}}.'),
    /* media */
    P('media', 'Image generation prompt', ['template'], '{{subject}}, {{setting}}, {{style}}, {{lighting}}, {{camera}}, {{palette}}, highly detailed --ar {{aspect}} --no {{avoid}}'),
    P('media', 'Describe an image for alt text', ['multimodal'], 'Write alt text (max 125 characters) and a longer description (2–3 sentences) for the attached image, for a {{context}} page. Describe what matters for understanding, not decoration.'),
    P('media', 'Short video script', ['format'], 'Write a {{seconds}}-second vertical video script about {{topic}} for {{audience}}: hook (first 2 seconds), 3 beats, call to action. Include on-screen text, voiceover and shot descriptions per beat.'),
    P('media', 'Text-to-video shot prompt', ['template'], '{{shot_type}} of {{subject}} {{action}} in {{setting}}, {{camera_motion}}, {{lighting}}, {{style}}, {{duration}} seconds, smooth motion'),
    P('media', 'Music generation prompt', ['template'], 'A {{genre}} track at {{bpm}} BPM in a {{mood}} mood, featuring {{instruments}}. Structure: intro, verse, chorus, bridge, outro. {{vocals}}. Length about {{length}}.'),
    P('media', 'Thumbnail concepts', ['format'], 'Give me 5 YouTube thumbnail concepts for a video titled "{{title}}". For each: main visual, text overlay (max 4 words), emotion, and color contrast idea.'),
    /* home */
    P('home', 'Meal plan & shopping list', ['format'], 'Create a {{days}}-day meal plan for {{people}} people with these needs: {{diet}}. Budget: {{budget}}. Max {{minutes}} minutes cooking per meal. Include a combined shopping list grouped by store section.'),
    P('home', 'Recipe from what I have', ['constraints'], 'I have {{ingredients}}. Suggest 3 recipes I can make with mostly these (list any extra items needed), with step-by-step instructions and cooking times.'),
    P('home', 'Trip itinerary', ['format'], 'Plan a {{days}}-day trip to {{destination}} for {{travelers}} interested in {{interests}}. Budget: {{budget}}. Day-by-day table with morning, afternoon and evening, travel times, and one rainy-day alternative per day.'),
    P('home', 'Cleaning & chores schedule', ['format'], 'Create a weekly cleaning and chores schedule for a {{home}} with {{people}} people ({{ages}}). Split tasks fairly by age, keep each day under {{minutes}} minutes, and present it as a table.'),
    P('home', 'Fix-it troubleshooting', ['cot'], 'My {{device}} is {{problem}}. Walk me through troubleshooting from easiest to hardest, telling me when to stop and call a professional. Ask me what happened after each step.'),
    P('home', 'Garden planner', ['format'], 'Plan a small {{garden_type}} garden for {{climate}} in a {{space}} space with {{sun}} sun. Suggest plants, layout, planting months, and a simple care calendar.'),
    /* growth */
    P('growth', 'Goal → weekly plan', ['chain'], 'My goal is {{goal}} by {{date}}. Break it into milestones, then a weekly plan for the first 4 weeks with specific, measurable actions. Include how I\'ll track progress and what to do if I fall behind.'),
    P('growth', 'Personal budget', ['format'], 'Help me make a monthly budget. Income: {{income}}. Fixed costs: {{fixed}}. Goals: {{goals}}. Use the 50/30/20 rule as a starting point, show a table, and suggest 3 realistic ways to save more.'),
    P('growth', 'Learn a skill in 30 days', ['format'], 'Create a 30-day plan to learn {{skill}}, starting from {{level}}, with {{minutes}} minutes per day. Each week: focus, daily practice tasks, a mini project, and a self-test.'),
    P('growth', 'Habit builder', ['role'], 'Act as a habit coach. I want to {{habit}}. Using habit-stacking and tiny habits, suggest a cue, a 2-minute starting version, a reward, and how to scale up over 6 weeks. Anticipate my 3 most likely excuses.'),
    P('growth', 'Decision with pros & cons', ['cot'], 'Help me decide whether to {{decision}}. Ask me 3 clarifying questions first. Then list pros and cons, weigh them against my values ({{values}}), and suggest a small experiment to reduce uncertainty.'),
    P('growth', 'Reflective journal prompts', ['format'], 'Give me 10 reflective journaling prompts about {{theme}}, from light to deeper, each one sentence long. Add a 2-minute breathing exercise to start.')
  ];
  window.PROMPT_LIBRARY = { cats, prompts };

  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SLOT = /\{\{\s*(\w+)\s*\}\}/g;
  const vars = t => [...new Set([...t.matchAll(SLOT)].map(m => m[1]))];
  const catOf = id => cats.find(c => c[0] === id) || ['', '•', id];
  const pretty = v => v.replace(/_/g, ' ');

  /* opts: { cats: [...ids] | null, compact: bool, limit: n } */
  window.renderPromptLibrary = (el, opts = {}) => {
    const pool = opts.cats ? prompts.filter(p => opts.cats.includes(p.cat)) : prompts;
    let cat = 'all', q = '', open = -1; const fills = {};
    const filled = (p, i) => p.text.replace(SLOT, (_, v) => (fills[i] && fills[i][v]) ? fills[i][v] : `[${pretty(v)}]`);
    const card = (p, i) => {
      const c = catOf(p.cat), isOpen = open === i;
      const shown = esc(p.text).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, v) => `<mark class="pl-var${fills[i] && fills[i][v] ? ' set' : ''}">${esc(fills[i] && fills[i][v] ? fills[i][v] : pretty(v))}</mark>`);
      return `<article class="pl-card ${isOpen ? 'open' : ''}" data-i="${i}">
        <div class="pl-top"><span class="pl-cat">${c[1]} ${esc(c[2])}</span><span class="pl-tags">${p.tags.map(t => `<i>${esc(t)}</i>`).join('')}</span></div>
        <h3>${esc(p.title)}</h3><pre class="pl-text">${shown}</pre>
        ${isOpen ? `<div class="pl-fill">${vars(p.text).map(v => `<label><span>${esc(pretty(v))}</span><input data-v="${v}" value="${esc(fills[i] && fills[i][v] || '')}" placeholder="${esc(pretty(v))}"></label>`).join('')}</div>` : ''}
        <div class="pl-actions"><button type="button" class="btn sm" data-fill>${isOpen ? 'Done' : '✎ Fill in'}</button><button type="button" class="btn sm primary" data-copy>⧉ Copy</button></div></article>`;
    };
    const draw = () => {
      const ql = q.toLowerCase().trim();
      const list = pool.map((p, i) => [p, i]).filter(([p]) => (cat === 'all' || p.cat === cat) && (!ql || (p.title + ' ' + p.text + ' ' + p.tags.join(' ') + ' ' + catOf(p.cat)[2]).toLowerCase().includes(ql)));
      const usedCats = cats.filter(c => pool.some(p => p.cat === c[0]));
      el.innerHTML = `${opts.compact ? '' : `<div class="pl-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input data-q value="${esc(q)}" placeholder="Search ${pool.length} prompts: cover letter, rubric, SQL, image…" aria-label="Search prompts"></div>`}
        ${usedCats.length > 1 ? `<div class="pl-chips"><button type="button" data-c="all" class="${cat === 'all' ? 'on' : ''}">All <b>${pool.length}</b></button>${usedCats.map(c => `<button type="button" data-c="${c[0]}" class="${cat === c[0] ? 'on' : ''}">${c[1]} ${esc(c[2])} <b>${pool.filter(p => p.cat === c[0]).length}</b></button>`).join('')}</div>` : ''}
        <div class="pl-grid">${list.slice(0, opts.limit || 999).map(([p, i]) => card(p, i)).join('') || '<p class="muted">No prompts match.</p>'}</div>
        ${opts.compact ? `<p class="w-small" style="margin-top:10px">Showing ${Math.min(list.length, opts.limit || 999)} of ${list.length}. <a href="#/prompts" style="color:var(--accent);font-weight:600">Open the full Prompt Library (${prompts.length} prompts) →</a></p>` : ''}`;
    };
    el.addEventListener('input', e => {
      if (e.target.matches('[data-q]')) { q = e.target.value; const pos = e.target.selectionStart; draw(); const n = el.querySelector('[data-q]'); n.focus(); n.setSelectionRange(pos, pos); return; }
      const v = e.target.dataset.v; if (!v) return;
      const i = +e.target.closest('[data-i]').dataset.i; (fills[i] = fills[i] || {})[v] = e.target.value;
      const cardEl = e.target.closest('.pl-card'); const p = pool[i];
      cardEl.querySelector('.pl-text').innerHTML = esc(p.text).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, x) => `<mark class="pl-var${fills[i][x] ? ' set' : ''}">${esc(fills[i][x] || pretty(x))}</mark>`);
    });
    el.addEventListener('click', async e => {
      const c = e.target.closest('[data-c]'); if (c) { cat = c.dataset.c; open = -1; draw(); return; }
      const cardEl = e.target.closest('[data-i]'); if (!cardEl) return; const i = +cardEl.dataset.i;
      if (e.target.closest('[data-fill]')) { open = open === i ? -1 : i; draw(); if (open === i) el.querySelector(`[data-i="${i}"] input`)?.focus(); }
      const cp = e.target.closest('[data-copy]');
      if (cp) { const text = filled(pool[i], i); try { await navigator.clipboard.writeText(text); cp.textContent = '✓ Copied'; } catch (_) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); cp.textContent = '✓ Copied'; } catch (__) { cp.textContent = 'Select & copy'; } ta.remove(); } setTimeout(() => { cp.textContent = '⧉ Copy'; }, 1500); }
    });
    draw();
  };
})();
