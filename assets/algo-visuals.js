/* Original interactive algorithm states. No book illustrations or datasets are embedded.
 * Values are deterministic teaching examples checked by tests/algo-v5-calculations.test.cjs.
 */
(function(){'use strict';
const W=860,H=338;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,t,size=15,color='#294259',anchor='start',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" font-weight="${weight}">${esc(t)}</text>`;
const box=(x,y,w,h,fill='#eaf1fa',stroke='#b8c9dc',radius=10)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
const line=(x,y,xx,yy,color='#9eb2c8',width=2,dash='')=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const circle=(x,y,r,fill='#e8f1f9',stroke='#6a8aa5')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const gold='#dc8732',blue='#3d7fa5',green='#329080',purple='#715aad';
const wrap=(s,desc)=>`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(desc)}" preserveAspectRatio="xMidYMid meet">${s}</svg>`;
const rank={X:['B','A','C'],Y:['C','B','A'],Z:['A','B','C']};
const prefs={A:['X','Y','Z'],B:['Y','X','Z'],C:['Y','Z','X']};
function matchingTrace(){let held={},next={A:0,B:0,C:0},free=['A','B','C'],states=[{held:{},event:'Start: all participants are free',proposals:0}],proposals=0;
 while(free.length){const man=free.shift(),w=prefs[man][next[man]++],old=held[w];proposals++;
  let event='';if(!old){held[w]=man;event=`${man} proposes to ${w}; ${w} tentatively accepts.`;}
  else if(rank[w].indexOf(man)<rank[w].indexOf(old)){held[w]=man;free.push(old);event=`${man} proposes to ${w}; ${w} replaces ${old}, who becomes free.`;}
  else{free.push(man);event=`${man} proposes to ${w}; ${w} rejects ${man} for ${old}.`;}
  states.push({held:{...held},event,proposals});
 }
 return states;
}
const stableStates=matchingTrace();
function matching(v){let s=stableStates[Math.round(v/100*(stableStates.length-1))],out=text(430,28,'Deferred acceptance • step '+s.proposals+' of '+(stableStates.length-1),20,'#264764','middle',600);
 out+=text(430,57,s.event,15,'#45647d','middle');
 ['A','B','C'].forEach((m,i)=>{let y=112+i*75;out+=box(90,y-25,85,48,'#e8f1fa')+text(132,y+7,m,19,'#284b6b','middle',600);});
 ['X','Y','Z'].forEach((w,i)=>{let y=112+i*75;out+=box(684,y-25,85,48,'#e0f4ec')+text(726,y+7,w,19,'#216853','middle',600);});
 for(const [w,m] of Object.entries(s.held)){let yi=112+['A','B','C'].indexOf(m)*75,yj=112+['X','Y','Z'].indexOf(w)*75;out+=line(176,yi,682,yj,green,5);out+=circle(176,yi,4,green,green)+circle(682,yj,4,green,green);}
 out+=text(430,319,'Green edges are tentative engagements; rejected proposers may propose again.',13,'#566b80','middle');return out;
}
function complexity(v){const n=10+Math.round(v/100*1990);let b=text(430,30,`Complexity growth • n = ${n.toLocaleString()} operations-scale parameter`,20,'#264765','middle',600);
 const fns=[['Linear n',n,blue],['n log₂ n',n*Math.log2(n),green],['Triangular n(n+1)/2',n*(n+1)/2,gold]];
 const logMax=Math.log10(2e6),y0=105;
 fns.forEach(([label,val,color],i)=>{let y=y0+i*73,barW=360*Math.log10(val+1)/logMax;b+=text(70,y+2,label,15,'#27485f')+box(277,y-17,370,28,'#edf1f7','none',5)+box(277,y-17,Math.min(370,barW),28,color,color,5)+text(670,y+2,Math.round(val).toLocaleString(),16,'#344b68');});
 b+=text(430,320,'Bar length uses log₁₀(operation count) for legibility; right labels are actual counts.',13,'#566b80','middle');return b;}
const E=[['A','B'],['A','C'],['B','D'],['C','E'],['D','F'],['E','F']];
const POS={A:[155,155],B:[325,78],C:[325,245],D:[515,78],E:[515,245],F:[702,157]};
function order(mode){let seen=new Set(['A']),q=['A'],vis=[];while(q.length){let cur=mode==='BFS'?q.shift():q.pop();vis.push(cur);let neigh=E.filter(x=>x.includes(cur)).map(x=>x[0]===cur?x[1]:x[0]).sort();for(let x of mode==='DFS'?[...neigh].reverse():neigh){if(!seen.has(x)){seen.add(x);q.push(x);}}}return vis;}
// DFS above uses stack pushing reverse sorted, ensuring deterministic depth-first order.
function graph(v){const mode=v<50?'BFS':'DFS',step=v<50?Math.round(v/50*6):Math.round((v-50)/50*6),vis=order(mode),seen=new Set(vis.slice(0,step));let b=text(430,28,`${mode} from A • visited ${step} of 6`,20,'#254864','middle',600);
 E.forEach(([a,z])=>{let p=POS[a],q=POS[z];b+=line(p[0],p[1],q[0],q[1],seen.has(a)&&seen.has(z)?green:'#b5c6d4',seen.has(a)&&seen.has(z)?4:2)});
 Object.entries(POS).forEach(([k,[x,y]])=>{b+=circle(x,y,26,seen.has(k)?'#d5f1e5':'#e7edf7',seen.has(k)?green:'#7795aa')+text(x,y+6,k,19,'#304c62','middle',700)});
 b+=text(430,316,'Discovery order: '+(step?vis.slice(0,step).join(' → '):'(begin)'),15,'#51687e','middle');return b;}
const intervals=[{id:'A',s:1,e:4},{id:'B',s:2,e:3},{id:'C',s:3,e:5},{id:'D',s:5,e:8},{id:'E',s:6,e:9},{id:'F',s:8,e:10}];
function intervalSelect(rule){let sorted=[...intervals].sort((a,b)=>rule==='finish'?a.e-b.e||a.s-b.s:a.s-b.s||a.e-b.e),out=[],last=-Infinity;for(let x of sorted){if(x.s>=last){out.push(x.id);last=x.e;}}return out;}
function greedy(v){let rule=v<50?'finish':'start',chosen=intervalSelect(rule),b=text(430,30,(rule==='finish'?'Earliest finish':'Earliest start')+` • ${chosen.length} accepted`,20,'#244766','middle',600);
 b+=line(151,70,758,70,'#7994ad',2);for(let t=1;t<=10;t++){let x=151+(t-1)*65;b+=line(x,66,x,74,'#6f8ba5')+text(x,61,t,12,'#506983','middle')}
 intervals.forEach((p,i)=>{let y=111+i*34,x=151+(p.s-1)*65,w=(p.e-p.s)*65,ok=chosen.includes(p.id);b+=text(98,y+10,p.id,16,'#2b4d65','middle',700)+box(x,y,w,23,ok?'#a7dbc7':'#e3e8ef',ok?green:'#aebecd',5)+text(x+w/2,y+16,`${p.s}–${p.e}`,12,ok?'#1b5c47':'#52677c','middle');});
 b+=text(430,326,'The two choices solve different decision rules; the earliest-finish rule is the proven optimum here.',12,'#566a80','middle');return b;}
function divide(v){let phase=Math.min(4,Math.round(v/25)),states=[
{rows:[['3','1','2','4']],count:0,label:'Input array: [3, 1, 2, 4]'},
{rows:[['3','1'],['2','4']],count:0,label:'Split into two halves'},
{rows:[['1','3'],['2','4']],count:1,label:'Sort left half; count pair (3,1)'},
{rows:[['1','2','3','4']],count:2,label:'Merge halves; count cross inversion (3,2)'},
{rows:[['1','2','3','4']],count:2,label:'Output sorted array; total inversions = 2'}],s=states[phase];let b=text(430,32,'Merge-based inversion counting • stage '+phase+'/4',20,'#234c6b','middle',600);
 const space=156; s.rows.forEach((r,ri)=>{let width=r.length*space,start=430-width/2;r.forEach((x,j)=>{let xx=start+j*space;b+=box(xx+15,114+ri*78,120,55,phase>=2?'#d8efe7':'#e8eff8',phase>=2?green:'#9bb5cb')+text(xx+75,150+ri*78,x,22,'#284964','middle',700)})});
 b+=text(430,79,s.label,16,'#46677e','middle');b+=text(430,309,'Count of discovered inversions: '+s.count,17,'#1d6b59','middle',600);return b;}
const jobs=[{id:'J1',s:1,e:3,v:5,p:0},{id:'J2',s:2,e:5,v:6,p:0},{id:'J3',s:4,e:6,v:5,p:1},{id:'J4',s:6,e:8,v:4,p:3},{id:'J5',s:5,e:9,v:9,p:2}];
function computeDP(){const M=[0],details=[];jobs.forEach((j,i)=>{let take=j.v+M[j.p],skip=M[i];M.push(Math.max(take,skip));details.push({take,skip,choice:take>=skip?'TAKE':'SKIP'})});return {M,details};}
const dp=computeDP();
function dynamic(v){let step=Math.round(v/100*5),b=text(430,28,'Weighted interval scheduling • completed DP rows: '+step+'/5',20,'#284866','middle',600);
 const cols=[90,210,310,410,520,625,740],head=['job','[start,end]','value','p(j)','skip','take','M(j)'];head.forEach((h,i)=>b+=text(cols[i],78,h,14,'#415e77','middle',600));
 for(let i=0;i<5;i++){let j=jobs[i],d=dp.details[i],y=112+i*37,on=i<step;b+=box(42,y-24,772,32,on?(i===step-1?'#d7e9f8':'#e8f4ef'):'#f1f4f8',on?(i===step-1?blue:'#c5d8d4'):'#e4e9f0',4);
 [j.id,`[${j.s},${j.e}]`,j.v,j.p,on?d.skip:'—',on?d.take:'—',on?dp.M[i+1]:'—'].forEach((t,i)=>b+=text(cols[i],y-3,t,14,on?'#26485b':'#9ca9b8','middle',i===6?700:400));}
 b+=text(430,316,step?`OPT(${step}) = ${dp.M[step]}  •  ${dp.details[step-1].choice} last job`:'Initialize OPT(0)=0; no jobs processed',15,'#246c5d','middle',600);return b;}
const flowEdges=[['s','a',3],['s','b',2],['a','b',1],['a','t',2],['b','t',3]];
const flowStep=[{}, {'s:a':2,'a:t':2},{'s:a':2,'a:t':2,'s:b':2,'b:t':2},{'s:a':3,'a:t':2,'s:b':2,'b:t':3,'a:b':1}];
function flow(v){let step=Math.round(v/100*3),f=flowStep[step],value=(f['s:a']||0)+(f['s:b']||0),pos={s:[160,166],a:[380,88],b:[380,246],t:[700,166]},out=text(430,29,'Augmenting-path max flow • stage '+step+'/3',20,'#284d6e','middle',600);
 const capLabels={'s:a':[264,104],'s:b':[264,235],'a:b':[392,174],'a:t':[558,100],'b:t':[557,241]};
 flowEdges.forEach(([a,b,cap])=>{let [x,y]=pos[a],[xx,yy]=pos[b],key=a+':'+b,q=f[key]||0;out+=line(x,y,xx,yy,q>0?green:'#8c9dad',q>0?Math.max(3,1+q):2);
 let [tx,ty]=capLabels[key];out+=box(tx-22,ty-14,68,27,'#fff','#dbe5ec',5)+text(tx+12,ty+5,`${q}/${cap}`,14,q>0?'#166b4f':'#526479','middle',600)});
 Object.entries(pos).forEach(([k,[x,y]])=>{out+=circle(x,y,31,k==='s'?'#def0fc':k==='t'?'#d5f1e5':'#edf1f8')+text(x,y+7,k,20,'#2a526f','middle',700)});
 out+=text(430,312,step===3?'Maximum flow 5 = cut {s} capacity (3+2)=5':`Current flow value = ${value}; bottleneck augmentation ${step===0?'not yet started':step===1?'2 along s→a→t':step===2?'2 along s→b→t':'1 along s→a→b→t'}`,15,'#276b58','middle',600);return out;}
const fn={'algo-matching':matching,'algo-complexity':complexity,'algo-graph':graph,'algo-greedy':greedy,'algo-divide':divide,'algo-dp':dynamic,'algo-flow':flow};
const labels={'algo-matching':['Proposal step','All free','Finished'],'algo-complexity':['Input size n','10','2000'],'algo-graph':['Traversal and progress','BFS →','DFS →'],'algo-greedy':['Choose the interval rule','Finish first','Start first'],'algo-divide':['Merge stage','Initial','Sorted'],'algo-dp':['DP table row','Base','Last job'],'algo-flow':['Augmentation step','Zero flow','Certified max']};
window.AlgorithmVisuals={labels,render:(kind,amount)=>wrap(fn[kind](Math.min(100,Math.max(0,Number(amount)||0))),labels[kind][0]),_test:{stableStates,order,intervalSelect,dp,flowStep}};
})();
