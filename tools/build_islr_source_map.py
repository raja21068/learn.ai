"""Build section locators from *uploaded* ISLR R-edition PDF bookmarks only.
   The output indexes source, not an assertion every section was taught."""
import json,re,pathlib,fitz
root=pathlib.Path(__file__).resolve().parents[1]
pdf=root.parent.parent/'james_gareth_et_al_an_introduction_to_statistical_learning_w.pdf'
book=fitz.open(pdf)
toc=book.get_toc()
chapters=[]
for n in range(1,11):
 top=next(x for x in toc if x[0]==1 and re.match(fr'^{n}\s',x[1]))
 nexttop=next((x for x in toc if x[0]==1 and re.match(fr'^{n+1}\s',x[1])),[1,'end',len(book)+1])
 subs=[{'name':x[1].replace('Accuracyand','Accuracy and').replace('theK','the K'), 'pdfPage':x[2]} for x in toc if x[0] in (2,3) and top[2]<=x[2]<nexttop[2] and re.match(fr'^{n}\.',x[1])]
 if not subs:subs=[{'name':top[1],'pdfPage':top[2]}]
 chapters.append({'n':n,'pdf':top[2],'sections':subs})
(root/'assets/islr-source-map.js').write_text('/* PDF bookmarks from uploaded ISLR R edition; PDF pages are 1-indexed. */\nwindow.BOOK_SOURCE_MAP.islr = '+json.dumps(chapters,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(root/'assets/islr-source-map.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf-8')
print('ISLR:',len(chapters),'chapters',sum(len(x['sections']) for x in chapters),'verified bookmark locators')
