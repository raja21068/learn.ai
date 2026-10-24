/* Optional local-only original-PDF reading panel; no file leaves this browser. */
(function(){'use strict';
const books={db:'Database Systems, 14th ed.',rl:'Reinforcement Learning, 2nd ed.',d2l:'Dive into Deep Learning',os:'Operating System Concepts Essentials, 2nd ed.',network:'Computer Networking: A Top-Down Approach, 8th ed.',algo:'Algorithm Design, Kleinberg & Tardos'};
let objects={},current=null,dialog;
function node(){
 if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.id='bm-pdf-dialog';dialog.setAttribute('aria-label','Original textbook PDF reader');dialog.innerHTML=`<div class="bm-pdf-head"><div><strong>Read your own textbook PDF</strong><small id="bm-pdf-book">Select the matching textbook edition</small></div><button type="button" id="bm-pdf-close" aria-label="Close PDF reader">× Close</button></div><div class="bm-pdf-instructions"><label for="bm-pdf-file">Select the original PDF (stays on your device):</label><input type="file" id="bm-pdf-file" accept=".pdf,application/pdf"><span id="bm-pdf-state" aria-live="polite">No textbook attached</span></div><p class="bm-pdf-note">This local browser viewer preserves the publisher’s original pages, figures and graphs. The textbook is never bundled with this website or sent to a server. Select the edition cited by the course; page locators refer to the uploaded edition.</p><iframe id="bm-pdf-frame" title="Locally opened textbook PDF" hidden></iframe>`;
 document.body.appendChild(dialog);
 dialog.querySelector('#bm-pdf-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.querySelector('#bm-pdf-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;
  if(!/\.pdf$/i.test(f.name) && f.type!=='application/pdf'){dialog.querySelector('#bm-pdf-state').textContent='Choose a PDF file.';return;}
  if(objects[current?.book])URL.revokeObjectURL(objects[current.book].url);
  const obj={url:URL.createObjectURL(f),name:f.name};objects[current.book]=obj;show(current.book,current.page);
 });return dialog;
}
function show(book,page){const d=node(),rec=objects[book],iframe=d.querySelector('#bm-pdf-frame'),status=d.querySelector('#bm-pdf-state');
 if(!rec){iframe.hidden=true;iframe.removeAttribute('src');status.textContent='Select the PDF to view page '+page;return;}
 iframe.hidden=false;iframe.src=rec.url+'#page='+page;status.textContent=rec.name+' · PDF page '+page;
}
function open(book,page){if(!books[book])return;page=Math.max(1,Math.round(Number(page)||1));current={book,page};const d=node();d.querySelector('#bm-pdf-book').textContent=books[book]+' · PDF page '+page;d.querySelector('#bm-pdf-file').value='';show(book,page);if(!d.open)d.showModal();}
document.addEventListener('click',event=>{const target=event.target.closest('[data-book-pdf][data-pdf-page]');if(!target)return;event.preventDefault();open(target.dataset.bookPdf,target.dataset.pdfPage);});
window.BookPDFReader={open};
})();
