/* Two new readable courses built from the original source-oriented chapter guides.
   These are foundation companions, not full-book replacements. No dummy coding labs. */
(function(){
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bad={
os:[
['An application directly controls every device','The OS only displays the desktop'],
['A system call is identical to a plain local function','A microkernel always outperforms a monolithic kernel'],
['A ready process must be waiting for I/O','All processes share one program counter'],
['Concurrency requires more than one CPU core','Threads in a process have isolated heaps'],
['A mutex always counts available buffer slots','A counting semaphore cannot coordinate bounded resources'],
['SJF always avoids starvation','Waiting time equals CPU burst time'],
['A TLB miss is always a disk page fault','Virtual page addresses are always physical frame addresses'],
['FIFO always beats LRU','Page faults are CPU context switches only'],
['SSDs schedule mechanical head movement','Shortest seek time first is guaranteed starvation free'],
['A symbolic link must point to the same inode','Removing any hard link always destroys file contents'],
['Journaling makes external backups unnecessary','A file allocation bitmap is the contents of the file'],
['DMA requires the CPU to copy every byte itself','Buffering and caching are identical'],
['Authorization is the same as authentication','The principle of least privilege grants every process full access'],
['Encryption makes access control unnecessary','Authenticated sessions always have unrestricted permissions'],
['Virtual address size equals physical RAM size','Linux process state never changes after launch']
],
network:[
['Propagation delay is packet bits divided by link bandwidth','A network router always runs a user web application'],
['DNS authenticates HTTPS certificates by default','HTTP caching never returns stale documents'],
['Flow control protects only intermediate routers','UDP guarantees ordered reliable byte delivery'],
['Every packet recomputes the Internet-wide shortest path','Longest-prefix matching selects the broadest matching prefix'],
['BGP always selects the fewest physical hops','Routing advertisements cannot influence remote networks'],
['An Ethernet destination MAC is permanent across all Internet hops','Switching and routing use exactly the same addressing'],
['Wi-Fi cannot lose frames except through movement','A new access point is automatically trusted without authentication'],
['TLS blocks phishing at the application layer','Encryption automatically establishes authorization to read any record']
]};
function make(key,props){let chapters=window.BOOK_MASTERCLASS[key],chaptersource=window.BOOK_SOURCE_MAP[key],err=bad[key];return {...props,lessons:chapters.map((b,i)=>{
const opt=[b.answer,...err[i]],shift=(i%3);const options=[...opt.slice(shift),...opt.slice(0,shift)];const c=options.indexOf(b.answer);
return {id:`chapter-${b.n}`,part:key==='os'?(b.n<=2?0:b.n<=6?1:b.n<=8?2:b.n<=12?3:4):(b.n<=1?0:b.n<=3?1:b.n<=6?2:3),chapter:`Chapter ${b.n}`,title:b.focus,minutes:20,goal:b.objectives.join(' '),sections:[...b.concepts.map(([h,p])=>({h,html:`<p>${escape(p)}</p>`})),{h:'Worked example',html:`<p>${escape(b.example)}</p>`},{h:'From the uploaded textbook',html:`<p>Source PDF p. ${chaptersource[i].pdf}. Read the section map and inspect the original figures in your PDF using the linked deep-reading guide.</p><p><a href="#/book/${key}/chapter/${b.n}">Open full interactive chapter guide →</a></p>`}],lab:null,widget:null,quiz:[{q:b.exercise,options,correct:c,why:b.answer}]};
})};}
window.OS_COURSE=make('os',{id:'operating-systems',title:'Operating Systems: From Processes to Linux',short:'Operating Systems',tabLabel:'OS',category:'systems',accent:'#426ed3',symbol:'OS',tag:'New · Source-grounded',level:'Undergraduate · guided study',lang:'python',subtitle:'Fifteen original guided chapters linked to Silberschatz, Galvin and Gagne, with interactive memory and scheduling visuals.',outcome:'Explain system calls, scheduling, synchronization, virtual memory, storage, protection and Linux mechanisms.',reference:'Mapped to Operating System Concepts Essentials, 2nd edition; concise teaching companion, not full-book reproduction.',learn:['Processes, system calls and thread execution','Scheduling and synchronization with worked traces','Pages, frames, TLBs and virtual memory','File systems, I/O, security and Linux internals'],parts:['Overview and kernel architecture','Processes, threads and scheduling','Memory management','Storage and input/output','Protection, security and Linux']});
window.NETWORK_COURSE=make('network',{id:'computer-networking',title:'Computer Networking: A Top-Down Study',short:'Computer Networking',tabLabel:'Networks',category:'systems',accent:'#159589',symbol:'NET',tag:'New · Source-grounded',level:'Undergraduate · guided study',lang:'python',subtitle:'Eight source-mapped guided chapters from Kurose and Ross, with protocol reasoning and editable delay diagrams.',outcome:'Explain network architecture, protocols and measured delay, transport reliability, routing, link operation, wireless and security.',reference:'Mapped to Kurose and Ross, Computer Networking: A Top-Down Approach, 8th edition; original teaching companion.',learn:['Network edge, core, packets and delays','Application, transport and DNS/HTTP','IP forwarding, BGP and Ethernet','Wireless mobility and network security'],parts:['Internet architecture','Application and transport','Routing and link layers','Wireless and security']});
})();
