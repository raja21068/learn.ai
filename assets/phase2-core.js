/* Phase 2 computational engines: deliberately deterministic, dependency-free, testable.
   The Python tracer is a teaching subset, not a Python interpreter or sandbox. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Phase2Core = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const clone = x => JSON.parse(JSON.stringify(x));
  const fmt = x => typeof x === 'string' ? x : JSON.stringify(x);

  /* Safe arithmetic/list/string expression evaluator; NO eval, Function, Python runtime, or network. */
  function evaluate(expr, vars) {
    const rx = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|("(?:[^"\\]|\\["\\n])*"|'(?:[^'\\]|\\['\\n])*')|(\/\/|==|!=|<=|>=|\*\*|[+*\/%()\[\],<>-]))/gy;
    const ts = []; let i = 0;
    while (i < expr.length) {
      if (/\s/.test(expr[i])) { i++; continue; }
      rx.lastIndex = i; const m = rx.exec(expr);
      if (!m || m.index !== i) throw Error('Unsupported expression near: ' + expr.slice(i, i + 16));
      ts.push(m[1] ? ['num', +m[1]] : m[2] ? ['id', m[2]] : m[3] ? ['str', JSON.parse(m[3][0] === "'" ? '"' + m[3].slice(1,-1).replace(/\\'/g,"'").replace(/"/g,'\\"') + '"' : m[3])] : ['sym',m[4]]);
      i = rx.lastIndex;
    }
    let p = 0;
    const peek = v => ts[p] && ts[p][1] === v;
    const eat = v => { if (!peek(v)) throw Error('Expected ' + v); p++; };
    function atom() {
      const t = ts[p++]; if (!t) throw Error('Missing value');
      let v;
      if (t[0] === 'num' || t[0] === 'str') v = t[1];
      else if (t[1] === '-') v = -exprParse(7);
      else if (t[1] === '(') { v = exprParse(0); eat(')'); }
      else if (t[1] === '[') { v = []; if (!peek(']')) { do { v.push(exprParse(0)); if (!peek(',')) break; p++; } while (!peek(']')); } eat(']'); }
      else if (t[0] === 'id') {
        if (t[1] === 'True') v = true;
        else if (t[1] === 'False') v = false;
        else if (t[1] === 'None') v = null;
        else if (peek('(')) {
          p++; const args = []; if (!peek(')')) { do { args.push(exprParse(0)); if (!peek(',')) break; p++; } while (!peek(')')); } eat(')');
          if (t[1] === 'len' && args.length === 1 && (Array.isArray(args[0]) || typeof args[0] === 'string')) v = args[0].length;
          else if (t[1] === 'range' && (args.length === 1 || args.length === 2) && args.every(Number.isInteger)) {
            const [start, stop] = args.length === 1 ? [0,args[0]] : args;
            if (stop - start > 50 || stop - start < -50) throw Error('Use a range of at most 50 values');
            v = Array.from({length: Math.max(0,stop-start)}, (_,i) => start+i);
          } else throw Error('Only len(sequence) and range(n) are supported here');
        } else { if (!own(vars,t[1])) throw Error('Unknown variable: ' + t[1]); v = vars[t[1]]; }
      } else throw Error('Unsupported expression');
      while (peek('[')) { p++; const k = exprParse(0); eat(']'); if (!Array.isArray(v) || !Number.isInteger(k) || k < 0 || k >= v.length) throw Error('List index out of range'); v = v[k]; }
      return v;
    }
    const binding = {'==':1,'!=':1,'<':1,'>':1,'<=':1,'>=':1,'+':2,'-':2,'*':3,'/':3,'//':3,'%':3,'**':4};
    function exprParse(min) {
      let a = atom();
      while (ts[p] && own(binding,ts[p][1]) && binding[ts[p][1]] >= min) {
        const op=ts[p++][1], prec=binding[op], b=exprParse(prec+(op==='**'?0:1));
        if (op === '+') a = (Array.isArray(a) && Array.isArray(b)) ? a.concat(b) : a+b;
        else if (op === '-') a -= b; else if (op === '*') a *= b;
        else if (op === '/' || op === '//') { if (b === 0) throw Error('Division by zero'); a = op === '/' ? a/b : Math.floor(a/b); }
        else if (op === '%') { if (b === 0) throw Error('Division by zero'); a = ((a % b)+b)%b; }
        else if (op === '**') a = a**b;
        else if (op === '==') a = a === b; else if (op === '!=') a = a !== b;
        else if (op === '<') a = a < b; else if (op === '>') a = a > b;
        else if (op === '<=') a = a <= b; else if (op === '>=') a = a >= b;
        if (typeof a === 'number' && !Number.isFinite(a)) throw Error('Non-finite result');
      }
      return a;
    }
    const val = exprParse(0); if (p !== ts.length) throw Error('Unsupported trailing tokens'); return val;
  }
  function parsePython(code) {
    if (typeof code !== 'string' || code.length > 4000) throw Error('Keep program under 4,000 characters');
    const lines = code.replace(/\r\n?/g,'\n').split('\n').map((raw,n) => ({raw, text:raw.trim(),indent:raw.match(/^ */)[0].length,line:n+1})).filter(x=>x.text && !x.text.startsWith('#'));
    if (lines.length > 70) throw Error('Keep program under 70 nonblank lines');
    for (const l of lines) if (l.raw.includes('\t')) throw Error('Use spaces, not tabs (line '+l.line+')');
    let idx=0;
    function block(indent) {
      const stmts=[];
      while(idx<lines.length) {
        const l=lines[idx]; if(l.indent<indent) break;
        if(l.indent>indent) throw Error('Unexpected indentation on line '+l.line);
        idx++;
        const nested=/^(for\s+([A-Za-z_]\w*)\s+in\s+(.+)|if\s+(.+)):$/.exec(l.text);
        if(nested) {
          if(idx>=lines.length || lines[idx].indent<=indent) throw Error('Missing indented body after line '+l.line);
          const body=block(lines[idx].indent);
          stmts.push({ ...l, type:nested[2]?'for':'if', name:nested[2], expr:nested[2]?nested[3]:nested[4], body });
        } else stmts.push({...l,type:'simple'});
      }
      return stmts;
    }
    return block(lines.length?lines[0].indent:0);
  }
  function tracePython(code) {
    const ast=parsePython(code), vars=Object.create(null), output=[], trace=[{line:0,vars:{},output:[],note:'Start: no variables yet'}];
    function step(line,note) {
      if(trace.length>200) throw Error('Trace exceeded 200 steps. Shorten your program.');
      trace.push({line,vars:clone(vars),output:clone(output),note});
    }
    function run(block) {
      for(const s of block) {
        try {
          if(s.type==='for') {
            const values=evaluate(s.expr,vars);
            if(!Array.isArray(values)) throw Error('for loop needs a list or range(...)');
            if(values.length>50) throw Error('At most 50 iterations allowed');
            for (const val of values) { vars[s.name]=clone(val); step(s.line,'Loop: '+s.name+' = '+fmt(val)); run(s.body); }
            if(!values.length) step(s.line,'Loop skipped: sequence is empty');
          } else if(s.type==='if') {
            const v=evaluate(s.expr,vars); step(s.line, v?'Condition is true: enter block':'Condition is false: skip block');
            if(v) run(s.body);
          } else {
            const assign=/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|=)\s*(.+)$/.exec(s.text);
            const append=/^([A-Za-z_]\w*)\.append\((.+)\)$/.exec(s.text);
            const pr=/^print\((.+)\)$/.exec(s.text);
            if(assign) {
              const [,name,op,ex]=assign, v=evaluate(ex,vars);
              if(op==='=') vars[name]=clone(v);
              else { if(!own(vars,name) || typeof vars[name]!=='number' || typeof v!=='number') throw Error('Augmented assignment needs numeric variables');
                vars[name]=op==='+='?vars[name]+v:op==='-='?vars[name]-v:vars[name]*v; }
              step(s.line,name+' = '+fmt(vars[name]));
            } else if(append) {
              const [,name,ex]=append; if(!own(vars,name)||!Array.isArray(vars[name])) throw Error(name+' must be a list');
              vars[name].push(evaluate(ex,vars)); step(s.line,'Appended item to '+name);
            } else if(pr) {
              const parts=pr[1].split(/\s*,\s*/).map(x=>fmt(evaluate(x,vars)));
              output.push(parts.join(' ')); step(s.line,'Printed '+parts.join(' '));
            } else throw Error('Unsupported statement. Use assignments, for, if, print or list.append');
          }
        } catch(e) { throw Error('Line '+s.line+': '+e.message); }
      }
    }
    run(ast); return trace;
  }

  /* Stable toy XOR/OR benchmark. Training scores are IN-SAMPLE ONLY. */
  function seeded(seed) { let x=(seed>>>0)||1; return()=>((x=(1664525*x+1013904223)>>>0)/4294967296); }
  const sigmoid=x=>1/(1+Math.exp(-Math.max(-40,Math.min(40,x))));
  const cases=[[-1,-1],[-1,1],[1,-1],[1,1]];
  const labels={xor:[0,1,1,0],or:[0,1,1,1],and:[0,0,0,1]};
  function neural(config={}) {
    const width=[0,2,4,8].includes(+config.width)?+config.width:4;
    const rate=Number(config.rate)||0.4, task=own(labels,config.task)?config.task:'xor';
    if(rate<=0||rate>2) throw Error('Learning rate must be between 0 and 2');
    const rand=seeded(41), sample=()=>rand()*2-1;
    const hW=Array.from({length:width},()=>[sample(),sample(),sample()*0.2]);
    const outW=Array.from({length:width},()=>sample()), outBias=0;
    return {width,rate,task,hW,outW,outBias,epochs:0,history:[], seed:41};
  }
  function predict(net,x) {
    const h=net.hW.map(w=>Math.tanh(w[0]*x[0]+w[1]*x[1]+w[2]));
    const z=net.width?h.reduce((s,a,j)=>s+a*net.outW[j],net.outBias): net.outBias+(net.outW[0]||0)*0; // zero hidden needs direct weights
    return {h,p:sigmoid(net.width?z:net.outBias+net.directW[0]*x[0]+net.directW[1]*x[1])};
  }
  function initialize(config) {
    const n=neural(config); if(!n.width) n.directW=[0.12,-0.08]; return n;
  }
  function metrics(n) {
    const preds=cases.map(x=>predict(n,x).p), ys=labels[n.task];
    let loss=0, hit=0;
    preds.forEach((p,i)=>{loss+=-(ys[i]*Math.log(Math.max(1e-9,p))+(1-ys[i])*Math.log(Math.max(1e-9,1-p))); if(+ (p>=.5)===ys[i])hit++;});
    return {loss:loss/4,accuracy:hit/4,preds,labels:ys.slice()};
  }
  function train(n,epochs=100) {
    if(!Number.isInteger(epochs)||epochs<1||epochs>2000) throw Error('Epochs must be 1–2000');
    const ys=labels[n.task];
    for(let e=0;e<epochs;e++) {
      const gh=n.hW.map(()=>[0,0,0]), go=n.outW.map(()=>0), gd=[0,0], gb={v:0};
      for(let i=0;i<4;i++) {
        const x=cases[i], {h,p}=predict(n,x), delta=(p-ys[i])/4;
        gb.v+=delta;
        if(!n.width) {gd[0]+=delta*x[0];gd[1]+=delta*x[1];}
        else for(let j=0;j<n.width;j++) {
          go[j]+=delta*h[j];
          const dh=delta*n.outW[j]*(1-h[j]*h[j]);
          gh[j][0]+=dh*x[0];gh[j][1]+=dh*x[1];gh[j][2]+=dh;
        }
      }
      if(!n.width) {n.directW[0]-=n.rate*gd[0];n.directW[1]-=n.rate*gd[1];}
      else for(let j=0;j<n.width;j++) {n.outW[j]-=n.rate*go[j];for(let k=0;k<3;k++)n.hW[j][k]-=n.rate*gh[j][k];}
      n.outBias-=n.rate*gb.v;n.epochs++;
      if(n.epochs%25===0 || e===epochs-1) n.history.push({epoch:n.epochs,...metrics(n)});
    }
    return metrics(n);
  }
  const schemaSpec = {
    entities:['Student','Enrollment','Course'],
    student:[['student_id','INTEGER','PK'],['name','TEXT','']],
    enrollment:[['student_id','INTEGER','FK'],['course_id','INTEGER','FK'],['enrolled_on','TEXT','']],
    course:[['course_id','INTEGER','PK'],['title','TEXT','']]
  };
  function checkER(choices) {
    const expected={bridge:'Enrollment',key:'composite',studentLink:'one-to-many',courseLink:'one-to-many'};
    const checks=Object.keys(expected).map(k=>({key:k,correct:choices[k]===expected[k]}));
    const ok=checks.every(x=>x.correct);
    const feedback={bridge:'Enrollment is the associative entity that resolves the M:N relationship.',key:'A composite (student_id, course_id) key prevents duplicate enrollments in this simplified model.',studentLink:'One student can have many enrollment rows; each enrollment belongs to one student.',courseLink:'One course can have many enrollment rows; each enrollment belongs to one course.'};
    return {correct:ok,score:checks.filter(x=>x.correct).length,checks:checks.map(x=>({...x,message:feedback[x.key]}))};
  }
  function joinPreview(mode='inner') {
    const students=[{id:1,name:'Mina'},{id:2,name:'Noah'},{id:3,name:'Leila'}];
    const registrations=[{student:1,course:'AI101'},{student:1,course:'DB201'},{student:2,course:'AI101'}];
    const rows=[];
    for(const s of students) {const found=registrations.filter(r=>r.student===s.id);if(found.length)found.forEach(r=>rows.push([s.name,r.course]));else if(mode==='left')rows.push([s.name,null]);}
    return rows;
  }
  const ddl = `CREATE TABLE Student (\n  student_id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\n\nCREATE TABLE Course (\n  course_id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL\n);\n\nCREATE TABLE Enrollment (\n  student_id INTEGER NOT NULL REFERENCES Student(student_id),\n  course_id INTEGER NOT NULL REFERENCES Course(course_id),\n  enrolled_on TEXT,\n  PRIMARY KEY (student_id, course_id)\n);`;
  return {evaluate,parsePython,tracePython,initialize,train,predict,metrics,cases,labels,checkER,joinPreview,schemaSpec,ddl};
});
