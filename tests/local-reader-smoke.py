"""Browser smoke test that uploaded PDFs never leave local file input (no remote request)."""
import re,fitz
from pathlib import Path
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text();scripts=re.findall(r'<script src="(assets/[^"]+\.js)"',html);styles=re.findall(r'<link rel="stylesheet" href="(assets/[^"]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
testfile=root/'tests'/'artifacts'/'sample_local_readonly.pdf';doc=fitz.open();doc.new_page().insert_text((50,50),'PDF stays local in browser');doc.save(testfile);doc.close()
with sync_playwright() as p:
 b=launch_browser(p)
 page=b.new_page(viewport={'width':1250,'height':870});errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda req:requests.append(req.url))
 page.set_content(clean)
 page.evaluate('''() => {window.__mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>window.__mem[k]=String(v)}});window.toggleTheme=()=>{};}''')
 for st in styles:page.add_style_tag(content=(root/st).read_text())
 for sc in scripts:page.add_script_tag(content=(root/sc).read_text())
 page.evaluate('location.hash="#/book/rl/chapter/2"');page.wait_for_timeout(70)
 assert page.locator('[data-book-pdf]').count()>=3
 page.locator('button[data-book-pdf]').first.click();assert page.locator('#bm-pdf-dialog').is_visible()
 assert 'page 47' in page.locator('#bm-pdf-state').inner_text()
 page.locator('#bm-pdf-file').set_input_files(str(testfile));page.wait_for_timeout(50)
 assert page.locator('#bm-pdf-frame').get_attribute('src').startswith('blob:')
 assert page.locator('#bm-pdf-frame').get_attribute('src').endswith('#page=47')
 page.locator('#bm-pdf-close').click();assert not page.locator('#bm-pdf-dialog').is_visible()
 assert not [u for u in requests if not u.startswith(('blob:','https://fonts.googleapis.com/','https://cdnjs.cloudflare.com/'))], 'unexpected outbound request '+str(requests)
 assert not errors,'Browser JS error '+str(errors)
 print('PASS: local original PDF reader, source page 47, no outbound requests')
 b.close()
testfile.unlink()
