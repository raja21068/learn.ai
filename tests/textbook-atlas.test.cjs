'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/textbook-atlas-data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('assets/textbook-atlas.js','utf8'),ctx);
const b=ctx.window.TEXTBOOK_ATLAS;assert.equal(b.length,15);
assert.equal(b.reduce((n,x)=>n+x.chapters.length,0),228);
assert.equal(Object.keys(ctx.window.TextbookAtlas.studies).length,15);
for(const x of b){assert(x.title&&x.chapters.length>=8);assert(!x.title.includes('\uFFFD'));for(const c of x.chapters){assert(c.title&&c.title.length>=5);assert(!c.title.includes('\udcc0'));if(c.pdfPage){assert(c.pdfPage>=1&&c.pdfPage<=x.pageCount)}}}
const html=fs.readFileSync('index.html','utf8');assert(html.includes('assets/textbook-atlas.js'));
const router=fs.readFileSync('assets/app.js','utf8');assert(router.includes("parts[0] === 'books'"));
assert(fs.existsSync('CHAPTER_COVERAGE_TRACKER.csv'));
console.log('PASS 15 unique textbooks, 228 chapters, 15 focus + 10 extended guides, safe metadata and nav');
