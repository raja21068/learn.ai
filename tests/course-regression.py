"""Regression: every course and AI Foundations widget can be rendered without JS exceptions.
Uses the isolated Chromium document loader from browser-smoke.py.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parent.parent
import os, sys
ARTIFACTS = Path(__file__).resolve().parent / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)

def launch(p):
    """Portable launcher: CHROMIUM_PATH env var, else system Chromium (Linux), else the installed Edge/Chrome."""
    path = os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if os.path.exists('/usr/bin/chromium') else None)
    if path:
        return p.chromium.launch(headless=True, executable_path=path, args=['--no-sandbox'])
    for channel in ('msedge', 'chrome'):
        try:
            return p.chromium.launch(headless=True, channel=channel)
        except Exception:
            continue
    return p.chromium.launch(headless=True)

HTML=(ROOT/'index.html').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="(assets/[^\"]+\.js)"',HTML)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',HTML,re.S).group(1)).values() for s in g if s.startswith('assets/')]
CLEAN=re.sub(r'<script\b[^>]*>.*?</script>','',HTML, flags=re.S|re.I)
with sync_playwright() as p:
  b=launch(p)
  tab=b.new_page()
  errors=[];tab.on('pageerror',lambda e: errors.append(str(e)))
  tab.route('https://**',lambda r:r.abort())
  tab.set_content(CLEAN)
  tab.evaluate('''() => { const values = {}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=String(v)}}); }''')
  for name in SCRIPTS:tab.add_script_tag(content=(ROOT/name).read_text(encoding='utf-8'))
  courses=tab.evaluate('''() => [DB_COURSE,AI_COURSE,AGENTS_COURSE,ML_COURSE,LLM_COURSE,PROMPT_COURSE,DL_COURSE,...ALC_DATA.courses].map(c=>({id:c.id, lessons:c.lessons.map(l=>l.id)}))''')
  lesson_count=0
  for c in courses:
    tab.evaluate('(hash)=>{location.hash=hash}', '#/course/'+c['id'])
    tab.wait_for_timeout(15)
    assert tab.locator('.c-hero').count()==1, c['id']
    for l in c['lessons']:
      tab.evaluate('(hash)=>{location.hash=hash}', '#/course/'+c['id']+'/'+l)
      tab.wait_for_timeout(10)
      lesson_count+=1
      assert tab.locator('.lesson h1').count()==1, (c['id'],l)
      if c['id'] in ('databases','ai-agents','machine-learning','llm-engineering','prompt-engineering','ai-foundations','deep-learning'):
        assert tab.locator('#practice-challenge .learn-challenge').count()>=2, ('activities',c['id'],l)
      assert tab.locator('.w').filter(has_text='Interactive failed to load.').count()==0, (c['id'],l)
  assert not errors, '\n'.join(errors[:8])
  print('PASS rendering',len(courses),'courses and',lesson_count,'lessons, all registered widgets, zero JS exceptions')
  b.close()
