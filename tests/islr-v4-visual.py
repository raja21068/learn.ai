from pathlib import Path
import re
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^\"]+\.js)"',html)
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^\"]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
with sync_playwright() as p:
 b=launch_browser(p)
 page=b.new_page(viewport={'width':1360,'height':900})
 page.set_content(clean,wait_until='domcontentloaded')
 page.evaluate('''() => {window.__mem={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>{window.__mem[k]=String(v)}}});}''')
 for s in styles:page.add_style_tag(content=(root/s).read_text())
 for s in scripts:page.add_script_tag(content=(root/s).read_text())
 for n,name in [(2,'bias-variance'),(5,'cross-validation'),(6,'regularization'),(10,'pca')]:
  page.evaluate('x=>{location.hash="#/book/islr/chapter/"+x}',n)
  page.wait_for_timeout(150)
  fig=page.locator('.bm-figure').first
  fig.scroll_into_view_if_needed()
  fig.screenshot(path=str(root/f'tests/artifacts/islr-v4-{name}-figure.png'))
  print(name,fig.bounding_box())
 b.close()
