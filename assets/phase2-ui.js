/* Phase 2 Interactive Lab Studio. All activities run locally in the student's browser. */
(() => {
  'use strict';
  const C = window.Phase2Core;
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labs = {
    python: {name:'Python Execution Tracer', sub:'Predict program state, step through loops, and diagnose logic errors.',course:'python',lesson:'lists-loops',time:'12–20 min',icon:'⌘'},
    neural: {name:'Neural Network Playground',sub:'Train a tiny network, change hidden layers and inspect decision boundaries.',course:'machine-learning',lesson:'neural-networks',time:'15–25 min',icon:'◉'},
    er: {name:'ER Model & SQL Design Studio',sub:'Resolve many-to-many relationships, validate keys, and compare SQL joins.',course:'databases',lesson:'er-modeling',time:'15–20 min',icon:'▤'}
  };
  const presets = [
    {name:'Accumulator',code:'total = 0\nfor n in [2, 4, 6]:\n    total += n\nprint(total)',purpose:'Trace a loop variable and a running total.'},
    {name:'Lists and indexing',code:'scores = [10, 20]\nscores.append(30)\ncount = len(scores)\nlast = scores[2]\nprint(last)',purpose:'Watch a list grow and inspect an indexed element.'},
    {name:'Decisions',code:'value = 7\nif value > 5:\n    label = "high"\nprint(label)',purpose:'Test a conditional and find what happens when you change its input.'}
  ];
  const storeKey='learnai-phase2-record-v1';
  function read() { try { return JSON.parse(localStorage.getItem(storeKey)||'{}')||{}; } catch (_) { return {}; } }
  function save(slug,detail) {
    const state=read(),old=state[slug]||{attempts:0,passed:false};
    const next={...old,attempts:old.attempts+1,passed:old.passed||!!detail.passed,updatedAt:new Date().toISOString(),lastFeedback:detail.message||''};
    state[slug]=next;
    try {localStorage.setItem(storeKey,JSON.stringify(state));}catch (_){}
    return next;
  }
  function assess(slug,passed,message) {
    const l=labs[slug]; save(slug,{passed,message});
    if(window.LearningEngine && l) window.LearningEngine.recordAttempt(l.course,l.lesson,'challenge','phase2-'+slug,passed);
  }
  function hub(root) {
    const records=read(); document.title='Interactive Lab Studio · learn/ai';
    root.innerHTML=`<div class="studio-shell studio-hub"><nav class="studio-crumb"><a href="#/">Home</a> / Interactive Lab Studio</nav>
    <div class="studio-hero"><span class="studio-kicker">PHASE 2 · HANDS-ON LEARNING</span><h1>Learn by predicting, testing and explaining.</h1><p>Three high-quality interactive activities. No accounts, paid AI models or external execution services required for these simulations.</p></div>
    <div class="studio-cards">${Object.entries(labs).map(([id,l])=>`<a class="studio-card" href="#/studio/${id}"><span class="studio-icon">${l.icon}</span><span class="studio-flag">${records[id]?.passed?'✓ Checkpoint passed':'Experiment + checkpoint'}</span><h2>${esc(l.name)}</h2><p>${esc(l.sub)}</p><span class="studio-card-footer">${esc(l.time)} <b>Open studio →</b></span></a>`).join('')}</div>
    <section class="studio-method"><h2>Every laboratory follows the same research cycle</h2><ol><li>Predict before looking at the answer.</li><li>Change a parameter or make a design decision.</li><li>Run the experiment and inspect observable evidence.</li><li>Explain the result and complete an independent checkpoint.</li></ol><p>Checkpoint results are recorded in browser storage as <strong>formative practice evidence</strong>, not certified skill mastery.</p></section></div>`;
  }
  let session=null;
  function frame(root,slug,body) {
    const l=labs[slug],done=read()[slug];
    document.title=l.name+' · learn/ai';
    root.innerHTML=`<div class="studio-shell" data-studio="${slug}"><nav class="studio-crumb"><a href="#/">Home</a> / <a href="#/studio">Interactive Labs</a> / ${esc(l.name)}</nav>
      <div class="studio-top"><div><span class="studio-kicker">INTERACTIVE STUDIO · ${esc(l.time)}</span><h1>${esc(l.name)}</h1><p>${esc(l.sub)}</p></div><span class="studio-progress" data-studio-progress>${done?.passed?'✓ Checkpoint passed':'Checkpoint available'}</span></div>
      <div class="studio-work">${body}</div><p class="studio-privacy">Runs locally in this browser · No server-side grading · Saved checkpoints stay in localStorage · <a href="#/studio">Explore other labs →</a></p></div>`;
  }
  function feedback(slug,passed,message,el) {
    assess(slug,passed,message);
    if(el) {el.textContent=(passed?'✓ ':'✗ ')+message;el.className='studio-result '+(passed?'pass':'retry');el.setAttribute('role','status');}
    const pill=document.querySelector('[data-studio-progress]');if(pill&&read()[slug]?.passed)pill.textContent='✓ Checkpoint passed';
  }
  function targetAt(trace,i) {
    const next=trace[i+1],prev=trace[i]; if(!next) return null;
    for(const k of Object.keys(next.vars)) if(!Object.prototype.hasOwnProperty.call(prev.vars,k)||JSON.stringify(next.vars[k])!==JSON.stringify(prev.vars[k]))
      return {key:k,value:next.vars[k],line:next.line};
    if(next.output.length>prev.output.length)return {key:'printed output',value:next.output[next.output.length-1],line:next.line};
    return null;
  }
  function pythonUI(root) {
    session={slug:'python',preset:0,code:presets[0].code,trace:C.tracePython(presets[0].code),at:0,notice:'',predictions:0,correct:0,checks:0};
    drawPython(root);
    root.onclick=e=>{
      if(session?.slug!=='python')return;
      const b=e.target.closest('[data-py-action]');if(!b)return;
      const action=b.dataset.pyAction;
      if(action==='preset') {session.preset=+b.dataset.preset;session.code=presets[session.preset].code;retrace();}
      if(action==='compile') {session.code=root.querySelector('#studio-python-code').value;retrace();}
      if(action==='step') session.at=Math.min(session.trace.length-1,session.at+1);
      if(action==='back') session.at=Math.max(0,session.at-1);
      if(action==='run') session.at=session.trace.length-1;
      if(action==='reset') session.at=0;
      if(action==='predict') {
        const tgt=targetAt(session.trace,session.at),str=root.querySelector('#studio-py-guess')?.value||'';
        if(!tgt){session.notice='There is no changing value in the next step. Step forward.';}
        else if(!str.trim()){session.notice='Enter a prediction first.';}
        else {
          let guess; try{guess=JSON.parse(str.trim());}catch(_){guess=str.trim();}
          const right=JSON.stringify(guess)===JSON.stringify(tgt.value)||String(guess)===String(tgt.value);
          session.predictions++; if(right) session.correct++;
          session.notice=right?'Correct prediction. Now inspect the actual next state.':'Not quite. Trace the current variables and retry at the next changing state.';
          if(right) session.at++;
          if(session.predictions>=2) feedback('python',session.correct>=2,'Predict at least two state changes correctly without revealing the next result.',null);
        }
      }
      drawPython(root);
    };
    function retrace() {
      try{session.trace=C.tracePython(session.code);session.at=0;session.notice='Program compiled for tracing (supported subset).';session.predictions=0;session.correct=0;}
      catch(e){session.notice='Trace error: '+e.message;session.trace=[{line:0,vars:{},output:[],note:'Fix the source to generate a new trace'}];session.at=0;}
    }
  }
  function drawPython(root) {
    const m=session,t=m.trace[m.at],target=targetAt(m.trace,m.at),lines=m.code.split('\n'),done=m.at>=m.trace.length-1;
    frame(root,'python',`<div class="studio-tip"><b>Goal:</b> Predict at least two next-state variable values correctly. Unlike an animation, this tests whether you understand what each line does.</div>
      <div class="studio-layout"><section class="studio-panel studio-editor"><div class="studio-panel-head"><h2>1. Edit and trace Python</h2><span>Restricted teaching subset</span></div>
      <div class="studio-preset" role="group" aria-label="Example programs">${presets.map((p,i)=>`<button type="button" data-py-action="preset" data-preset="${i}" class="${m.preset===i?'active':''}">${esc(p.name)}</button>`).join('')}</div>
      <p class="studio-caption">${esc(presets[m.preset].purpose)} Supports assignments, lists, for/range, if, arithmetic, len(), append(), and print(). It is not a full Python interpreter.</p>
      <label for="studio-python-code" class="studio-label">Editable Python code</label><textarea id="studio-python-code" spellcheck="false" rows="8">${esc(m.code)}</textarea>
      <div class="studio-actions"><button type="button" class="studio-primary" data-py-action="compile">Build trace</button><button type="button" data-py-action="reset">Reset</button></div>
      <div class="studio-code-list" aria-label="Source with current execution line">${lines.map((line,i)=>`<div class="${t.line===i+1?'current':''}"><span>${i+1}</span><code>${esc(line)||' '}</code></div>`).join('')}</div></section>
      <section class="studio-panel"><div class="studio-panel-head"><h2>2. Observe program state</h2><span>Step ${m.at} / ${m.trace.length-1}</span></div>
      <div class="studio-actions"><button type="button" data-py-action="back" ${m.at===0?'disabled':''}>← Previous</button><button type="button" data-py-action="step" ${done?'disabled':''}>Next line →</button><button type="button" data-py-action="run" ${done?'disabled':''}>Run to end</button></div>
      <p class="studio-event" aria-live="polite">${esc(t.note)}</p><h3>Variables</h3><table class="studio-table"><thead><tr><th>Variable</th><th>Value</th></tr></thead><tbody>${Object.keys(t.vars).length?Object.entries(t.vars).map(([k,v])=>`<tr><th>${esc(k)}</th><td><code>${esc(JSON.stringify(v))}</code></td></tr>`).join(''):'<tr><td colspan="2">No values yet</td></tr>'}</tbody></table>
      <h3>Console output</h3><pre class="studio-console">${esc(t.output.join('\n')||'— No output yet —')}</pre></section></div>
      <section class="studio-panel studio-checkpoint"><div class="studio-panel-head"><h2>3. Predict before advancing</h2><span>${m.correct} correct out of ${m.predictions} predictions</span></div>
      ${target?`<p>Before the next step (line ${target.line}), what will the value of <strong>${esc(target.key)}</strong> be?</p><div class="studio-inline"><label class="studio-label" for="studio-py-guess">Your predicted value</label><input id="studio-py-guess" type="text" autocomplete="off" placeholder="e.g. 6 or [2, 4]"/><button type="button" class="studio-primary" data-py-action="predict">Check prediction</button></div>`:'<p>Step forward to a line that changes a variable, or reset the trace to practice again.</p>'}
      <p class="studio-result ${m.notice.startsWith('Correct')?'pass':''}" aria-live="polite">${esc(m.notice||'Tip: predict a value, check it, then compare the actual state. You can edit the program and rebuild the trace.')}</p>
      <p class="studio-caption">Checkpoint: make two correct predictions in your current experiment. Changing the program resets this checkpoint attempt.</p></section>`);
  }
  function neuralUI(root) {
    session={slug:'neural', task:'xor',width:4,rate:0.7,net:C.initialize({task:'xor',width:4,rate:0.7}),notice:'',answer:'',quizPassed:false};
    drawNeural(root);
    root.onclick=e=>{
      if(session?.slug!=='neural')return;
      const b=e.target.closest('[data-neural]');if(!b)return;
      const action=b.dataset.neural;
      if(action==='train') {const m=C.train(session.net,Number(b.dataset.epochs));session.notice='Trained '+b.dataset.epochs+' epochs. Training accuracy: '+Math.round(m.accuracy*100)+'%; cross-entropy: '+m.loss.toFixed(3)+'.';}
      if(action==='reset') {session.net=C.initialize(session);session.notice='Weights reset to a deterministic starting point.';}
      if(action==='answer') {
        const answer=b.dataset.answer;
        session.answer=answer;session.quizPassed=answer==='no';
        feedback('neural',session.quizPassed,session.quizPassed?'Correct: a single linear decision boundary cannot separate XOR corners. Hidden nonlinear units can.':'Reconsider whether one straight line can separate XOR classes.',null);
        session.notice=session.quizPassed?'Checkpoint passed. Now try removing the hidden layer and comparing loss.':'Incorrect. Try the 0-hidden-units model on XOR.';
      }
      drawNeural(root);
    };
    root.onchange=e=>{
      if(session?.slug!=='neural'||!e.target.matches('[data-net-config]'))return;
      const field=e.target.dataset.netConfig;
      session[field]=field==='width'?+e.target.value:field==='rate'?+e.target.value:e.target.value;
      session.net=C.initialize(session);session.notice='Configuration changed. Weights and epoch count reset so comparisons begin from the same seed.';drawNeural(root);
    };
  }
  function plotLoss(history) {
    if(!history.length)return '<p class="studio-muted">Train the model to collect loss observations.</p>';
    const maxX=Math.max(100,history[history.length-1].epoch),maxY=Math.max(.8,...history.map(p=>p.loss)),W=560,H=155;
    const coords=history.map(p=>(32+(p.epoch/maxX)*510).toFixed(1)+','+(8+(1-p.loss/maxY)*130).toFixed(1)).join(' ');
    return `<svg role="img" aria-label="Training loss over epochs" viewBox="0 0 ${W} ${H}" class="studio-loss"><line x1="32" y1="8" x2="32" y2="138" stroke="currentColor" opacity=".3"/><line x1="32" y1="138" x2="545" y2="138" stroke="currentColor" opacity=".3"/><polyline fill="none" stroke="#12a58d" stroke-width="3" points="${coords}"/><text x="5" y="12" fill="currentColor" font-size="11">${maxY.toFixed(2)}</text><text x="4" y="142" fill="currentColor" font-size="11">0</text><text x="460" y="153" fill="currentColor" font-size="11">epochs →</text></svg>`;
  }
  function mapNeural(n) {
    const N=21,tiles=[];
    for(let y=0;y<N;y++) for(let x=0;x<N;x++) {
      const p=C.predict(n,[(x/(N-1))*2.6-1.3,1.3-(y/(N-1))*2.6]).p;
      const red=Math.round(245-85*p), green=Math.round(237-120*p),blue=Math.round(255-18*p);
      tiles.push(`<rect x="${x*12}" y="${y*12}" width="12.3" height="12.3" fill="rgb(${red},${green},${blue})"/>`);
    }
    C.cases.forEach((pt,i)=>{const x=(pt[0]+1.3)/2.6*252, y=(1.3-pt[1])/2.6*252;
      tiles.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="9" fill="${C.labels[n.task][i]?'#213c8e':'white'}" stroke="#17243d" stroke-width="2"/>`);
    });
    return `<svg viewBox="0 0 252 252" class="studio-heatmap" role="img" aria-label="Decision surface. Blue indicates higher predicted probability, pale indicates lower. Circles indicate the four training observations.">${tiles.join('')}</svg>`;
  }
  function drawNeural(root) {
    const m=session,n=m.net,stats=C.metrics(n);
    frame(root,'neural',`<div class="studio-tip"><b>Experiment:</b> Can a model with no hidden units learn XOR? Compare width 0 and width 4 using the same data and training budget. The metrics below are from <b>training data only</b>; they do not measure generalization.</div>
    <div class="studio-layout"><section class="studio-panel"><div class="studio-panel-head"><h2>1. Configure a network</h2><span>2 inputs → ${n.width?n.width+' tanh units → ':''}1 sigmoid output</span></div>
    <label class="studio-label" for="net-task">Toy classification task</label><select id="net-task" data-net-config="task">${[['xor','XOR · nonlinear'],['or','OR · linearly separable'],['and','AND · linearly separable']].map(([v,t])=>`<option value="${v}" ${m.task===v?'selected':''}>${t}</option>`).join('')}</select>
    <label class="studio-label" for="net-width">Hidden units</label><select id="net-width" data-net-config="width">${[0,2,4,8].map(k=>`<option value="${k}" ${m.width===k?'selected':''}>${k===0?'0 · logistic regression':k+' · tanh'}</option>`).join('')}</select>
    <label class="studio-label" for="net-rate">Learning rate</label><select id="net-rate" data-net-config="rate">${[0.1,0.35,0.7,1.2].map(v=>`<option value="${v}" ${m.rate===v?'selected':''}>${v}</option>`).join('')}</select>
    <div class="studio-actions"><button type="button" class="studio-primary" data-neural="train" data-epochs="100">Train 100 epochs</button><button type="button" data-neural="train" data-epochs="500">Train 500</button><button type="button" data-neural="reset">Reset weights</button></div>
    <p class="studio-caption">Fixed seed 41. Full-batch gradient descent and binary cross-entropy. This is a real toy neural-network training computation, not a prerecorded animation.</p>
    <div class="studio-stat-grid"><div><b>${n.epochs}</b><span>Epochs</span></div><div><b>${Math.round(stats.accuracy*100)}%</b><span>Training accuracy</span></div><div><b>${stats.loss.toFixed(3)}</b><span>Training loss</span></div></div>
    <p class="studio-event" aria-live="polite">${esc(m.notice||'Change a setting, train the network, and inspect the decision surface.')}</p></section>
    <section class="studio-panel"><div class="studio-panel-head"><h2>2. Inspect predictions</h2><span>Blue = predicted class 1</span></div>
    <div class="studio-neural-visual">${mapNeural(n)}<div><h3>Four training observations</h3><table class="studio-table"><thead><tr><th>(x₁,x₂)</th><th>Target</th><th>P(y=1)</th></tr></thead><tbody>${C.cases.map((x,i)=>`<tr><td>${x.join(', ')}</td><td>${stats.labels[i]}</td><td>${stats.preds[i].toFixed(3)}</td></tr>`).join('')}</tbody></table><p class="studio-caption">The model must classify all four corners correctly. A wide hidden layer does not automatically guarantee good training.</p></div></div>
    <h3>Observed training loss</h3>${plotLoss(n.history)}</section></div>
    <section class="studio-panel studio-checkpoint"><div class="studio-panel-head"><h2>3. Independent concept checkpoint</h2><span>${m.quizPassed?'Passed':'Not yet passed'}</span></div><p>Can a single logistic unit with <em>no hidden layer</em> perfectly represent XOR on the four corner points?</p><div class="studio-actions"><button type="button" data-neural="answer" data-answer="yes" class="${m.answer==='yes'?'picked':''}">Yes</button><button type="button" data-neural="answer" data-answer="no" class="${m.answer==='no'?'picked':''}">No</button></div>
    <p class="studio-result ${m.quizPassed?'pass':''}" aria-live="polite">${esc(m.answer?(m.quizPassed?'Correct. XOR needs a nonlinear decision boundary; adding hidden units makes nonlinear separation possible.':'Incorrect. A single logistic unit creates only one straight decision boundary.'):'Answer before viewing the explanation; training runs are useful evidence, not proof of generalization.')}</p></section>`);
  }
  function erUI(root) {
    session={slug:'er',choices:{bridge:'',key:'',studentLink:'',courseLink:''},join:'inner',attempted:false};
    drawER(root);
    root.onchange=e=>{
      if(session?.slug!=='er')return;
      if(e.target.matches('[data-er-choice]'))session.choices[e.target.dataset.erChoice]=e.target.value;
      if(e.target.matches('[data-er-join]'))session.join=e.target.value;
      session.attempted=false;drawER(root);
    };
    root.onclick=e=>{
      if(session?.slug!=='er')return;
      if(e.target.closest('[data-er-check]')){session.attempted=true;const a=C.checkER(session.choices);feedback('er',a.correct,a.correct?'Schema valid for the stated university scenario. Inspect the generated SQL and LEFT JOIN evidence.':'Review the field-by-field feedback and revise your choices.',null);drawER(root);}
      if(e.target.closest('[data-er-hint]')){const el=root.querySelector('#studio-er-hint');if(el){el.hidden=false;el.textContent='Hint: Enrollment is the association between Student and Course. Each enrollment references exactly one of each; a Student or Course may have many enrollment rows.';}}
    };
  }
  function erDiagram(m) {
    const b=m.choices,link1=b.studentLink==='one-to-many'?'1':'?',link2=b.courseLink==='one-to-many'?'1':'?';
    const bridge=b.bridge||'Choose bridge';
    return `<svg class="studio-erd" viewBox="0 0 860 275" role="img" aria-label="Entity relationship diagram showing Student, chosen association entity, and Course. Lines represent proposed cardinality.">
    <path d="M255 128 L308 128 M552 128 L605 128" fill="none" stroke="var(--studio-accent)" stroke-width="3"/>
    <text x="263" y="113" fill="currentColor" font-size="14">${link1}</text><text x="287" y="113" fill="currentColor" font-size="14">${b.studentLink==='one-to-many'?'N':'?'}</text>
    <text x="562" y="113" fill="currentColor" font-size="14">${b.courseLink==='one-to-many'?'N':'?'}</text><text x="587" y="113" fill="currentColor" font-size="14">${link2}</text>
    ${[['Student',10, [['student_id','PK'],['name','']]], [bridge,310,[['student_id','FK'],['course_id','FK'],['enrolled_on','']]], ['Course',606,[['course_id','PK'],['title','']]]].map(([name,x,fields])=>`<g><rect x="${x}" y="45" width="245" height="183" rx="11" fill="var(--studio-panel)" stroke="var(--studio-border)" stroke-width="2"/><path d="M${x+11} 45 H${x+234} Q${x+245} 45 ${x+245} 56 V83 H${x} V56 Q${x} 45 ${x+11} 45" fill="var(--studio-heading)"/><text x="${x+14}" y="70" font-weight="700" font-size="18" fill="var(--studio-accent)">${esc(name)}</text>${fields.map(([f,k],i)=>`<text x="${x+15}" y="${111+i*32}" font-size="15" fill="currentColor">${esc(f)} ${k?'('+k+')':''}</text>`).join('')}</g>`).join('')}
    <text x="430" y="256" fill="currentColor" text-anchor="middle" font-size="14">Proposed model · cardinalities update with your decisions</text></svg>`;
  }
  function drawER(root) {
    const m=session,r=C.checkER(m.choices),rows=C.joinPreview(m.join);
    frame(root,'er',`<div class="studio-tip"><b>Scenario:</b> One student can enroll in many courses, and one course can have many students. Enrollments also store the enrollment date. Choose a relational design that avoids redundant student–course associations.</div>
    <div class="studio-layout"><section class="studio-panel"><div class="studio-panel-head"><h2>1. Design the entities</h2><span>${r.score} / 4 decisions correct${m.attempted?' (checked)':''}</span></div>
    ${[
      ['bridge','Bridge/association table',[['','Choose a table…'],['Enrollment','Enrollment'],['Student','Student'],['Course','Course']]],
      ['key','Primary key for an enrollment',[['','Choose a key…'],['composite','(student_id, course_id)'],['student-only','student_id only'],['course-only','course_id only']]],
      ['studentLink','Student → Enrollment cardinality',[['','Choose…'],['one-to-many','1 to many'],['many-to-many','Many to many'],['one-to-one','1 to 1']]],
      ['courseLink','Course → Enrollment cardinality',[['','Choose…'],['one-to-many','1 to many'],['many-to-many','Many to many'],['one-to-one','1 to 1']]]
    ].map(([key,label,opts])=>`<label class="studio-label" for="er-${key}">${label}</label><select id="er-${key}" data-er-choice="${key}">${opts.map(([v,t])=>`<option value="${v}" ${m.choices[key]===v?'selected':''}>${esc(t)}</option>`).join('')}</select>${m.attempted?`<p class="studio-criterion ${r.checks.find(x=>x.key===key).correct?'pass':'retry'}">${r.checks.find(x=>x.key===key).correct?'✓ Correct':esc(r.checks.find(x=>x.key===key).message)}</p>`:''}`).join('')}
    <div class="studio-actions"><button type="button" class="studio-primary" data-er-check>Validate my model</button><button type="button" data-er-hint>Guided hint</button></div><p id="studio-er-hint" class="studio-caption" hidden></p></section>
    <section class="studio-panel"><div class="studio-panel-head"><h2>2. See the model update</h2><span>Entity-relationship preview</span></div>${erDiagram(m)}
    ${r.correct&&m.attempted?`<h3>Generated SQLite-compatible DDL</h3><pre class="studio-sql">${esc(C.ddl)}</pre>`:'<p class="studio-caption">Validate all four decisions to unlock the reference SQL DDL. Enrollment needs two foreign keys and a composite primary key in this simplified case.</p>'}
    </section></div>
    <section class="studio-panel studio-checkpoint"><div class="studio-panel-head"><h2>3. Test SQL join semantics</h2><span>Small reproducible dataset</span></div><label class="studio-label" for="er-join">Choose the join</label><select id="er-join" data-er-join><option value="inner" ${m.join==='inner'?'selected':''}>INNER JOIN: enrolled students only</option><option value="left" ${m.join==='left'?'selected':''}>LEFT JOIN: include students without enrollments</option></select>
    <pre class="studio-sql">${esc(`SELECT s.name, c.title\nFROM Student AS s\n${m.join==='inner'?'INNER':'LEFT'} JOIN Enrollment AS e\n  ON s.student_id = e.student_id\n${m.join==='inner'?'INNER':'LEFT'} JOIN Course AS c\n  ON c.course_id = e.course_id;`)}</pre><table class="studio-table"><thead><tr><th>Student</th><th>Course</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]===null?'<em>NULL</em>':esc(r[1])}</td></tr>`).join('')}</tbody></table>
    <p class="studio-caption">The join preview uses three demo students and two demo courses matching the DDL above. Observe that LEFT JOIN preserves Leila even without an enrollment. Validate the ER model to complete the checkpoint.</p></section>`);
  }
  function render(root,slug) {
    session=null; root.onclick=null; root.onchange=null; if(!labs[slug]){hub(root);return;}
    if(slug==='python')pythonUI(root);else if(slug==='neural')neuralUI(root);else erUI(root);
  }
  window.Phase2UI={render,labs,records:read};
})();
