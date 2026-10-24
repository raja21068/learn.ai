/* Course integrated into normal learning, including the longform proof, trace and practice. */
(function(){'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guide=window.BOOK_MASTERCLASS.algo;
window.ALGO_COURSE={
  id:'algorithm-design',title:'Algorithm Design · Kleinberg & Tardos',short:'Algorithms',tabLabel:'Algorithms',category:'foundations',accent:'#6d58af',symbol:'AD',tag:'New · Source-grounded',level:'Intermediate → advanced',lang:'none',
  subtitle:'Seven proof-driven chapters with step-by-step visual traces, precise complexity bounds, worked counterexamples and source-linked reading.',
  outcome:'Analyze algorithm design strategies, produce correctness proofs and reason about complexity and counterexamples.',
  reference:'Based on Kleinberg & Tardos, Algorithm Design. Seven source-checked chapters taught; chapters 8–13 remain indexed, not taught.',
  learn:['Stable matching: blocking pairs, termination, stability and proposer-optimality','Asymptotic complexity with explicit counts and representation assumptions','BFS/DFS, graph layers, bipartiteness and topological ordering','Greedy interval selection and exchange arguments','Divide-and-conquer recurrences and inversion counting','Weighted interval DP state and reconstruction','Residual network paths and max-flow/min-cut certificates'],
  parts:['Models and proofs','Graph structures','Greedy and recursion','Optimization with DP','Flows and certificates'],
  lessons:guide.map((b,i)=>{let q=b.quiz, correct=(i*2+1)%4;let opts=q.wrong.slice();opts.splice(correct,0,q.right);return {
    id:'chapter-'+b.n,part:[0,0,1,2,2,3,4][i],chapter:'Chapter '+b.n,title:b.focus,minutes:55,
    goal:b.objectives.join(' '),sections:[...b.concepts.map(([h,p])=>({h,html:'<p>'+esc(p)+'</p>'})),
      {h:'Formal correctness argument',html:'<p>'+esc(b.proof)+'</p><p><a href="#/book/algo/chapter/'+b.n+'">Open interactive trace and full worked example →</a></p>'},
      {h:'Pseudocode and numerical reasoning',html:'<pre class="algo-code">'+esc(b.pseudocode)+'</pre><p>'+esc(b.example)+'</p>'},
      {h:'Primary-source reading',html:'<p>Uploaded edition PDF p. '+b.pdf+'. The source-section map contains '+window.BOOK_SOURCE_MAP.algo[i].sections.length+' exact bookmark headings and PDF page locators. These locators identify reading, not completed coverage. <a href="#/book/algo/chapter/'+b.n+'">Open chapter source navigation →</a></p>'}
    ],lab:null,widget:null,
    quiz:[{q:q.q,options:opts,correct,why:q.right+'. '+b.review[0]}]
  };})
};
})();
