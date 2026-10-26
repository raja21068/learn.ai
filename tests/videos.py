"""Browser checks of the Videos feature: 52 click-to-play cards; NOTHING contacts YouTube or Google video/thumbnail hosts until a card is pressed;
a press inserts exactly one privacy-enhanced player; search and topic pages work; courses and textbook chapters show their strips; phone width.
YouTube is blocked during the test, so it runs offline. Needs a static server for the project root (default http://localhost:8000).
Run: PYTHONUTF8=1 python tests/videos.py"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _browser import launch_browser

BASE = os.environ.get('BASE_URL', 'http://localhost:8000') + '/index.html'
YT = ('youtube', 'ytimg', 'googlevideo', 'ggpht')


def main():
    errors, requests = [], []
    with sync_playwright() as p:
        b = launch_browser(p)
        ctx = b.new_context(viewport={'width': 1300, 'height': 900})
        ctx.route('**/*', lambda r: r.abort() if any(h in r.request.url for h in YT) else r.continue_())     # YouTube is never really reached
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('request', lambda r: requests.append(r.url))
        pg.goto(BASE); pg.wait_for_timeout(600)

        def go(h, wait=400):
            pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(wait)

        def txt(sel):
            return ' '.join(pg.locator(sel).first.inner_text().split())

        # ---------- the page ----------
        go('#/videos')
        assert 'Videos by 3Blue1Brown' in txt('h1') and pg.locator('.yt-card').count() == 52
        assert pg.locator('.yt-tab').count() == 7 and pg.locator('.yt-topic').count() == 6
        assert 'Nothing contacts YouTube until you press play' in txt('.yt-privacy')
        pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(300); pg.evaluate("window.scrollTo(0, 0)")
        first = pg.locator('.yt-card').first
        assert first.locator('iframe').count() == 0 and first.locator('img').count() == 0
        assert first.locator('a').get_attribute('href').startswith('https://www.youtube.com/watch?v=')
        assert [u for u in requests if any(h in u for h in YT)] == [], 'no request to YouTube may happen before a click: ' + str([u for u in requests if any(h in u for h in YT)])
        assert pg.locator('iframe').count() == 0
        print('PASS page: 52 cards, 6 topics, no iframe, no thumbnail, no request to YouTube before a click')

        # ---------- search and topics ----------
        pg.fill('#yt-q', 'backprop'); pg.wait_for_timeout(150)
        shown = pg.locator('.yt-card:not([hidden])').count()
        assert 1 <= shown <= 4, shown
        assert pg.locator('.yt-topic:not([hidden])').count() == 1
        pg.fill('#yt-q', 'zzzz nothing'); pg.wait_for_timeout(150)
        assert pg.locator('#yt-empty').is_visible() and pg.locator('.yt-card:not([hidden])').count() == 0
        pg.fill('#yt-q', ''); pg.wait_for_timeout(150); assert pg.locator('.yt-card:not([hidden])').count() == 52
        go('#/videos/linear-algebra'); assert pg.locator('.yt-card').count() == 15 and 'linear algebra' in txt('.yt-tab.on').lower()

        # ---------- pressing play inserts exactly one privacy-enhanced player ----------
        go('#/videos/neural-networks')
        card = pg.locator('.yt-card').first
        vid = card.get_attribute('data-yt')
        card.locator('.yt-play').click(); pg.wait_for_timeout(300)
        frames = pg.locator('.yt-card iframe')
        assert frames.count() == 1
        src = frames.first.get_attribute('src')
        assert src == f'https://www.youtube-nocookie.com/embed/{vid}?autoplay=1&rel=0', src
        assert frames.first.get_attribute('title') and 'allowfullscreen' in pg.locator('.yt-card iframe').first.evaluate("e => e.outerHTML")
        assert any('youtube-nocookie.com/embed/' + vid in u for u in requests), 'the player must be requested after the click'
        assert not any('www.youtube.com/embed' in u for u in requests), 'never the normal embed domain'
        card.locator('.yt-stage').click(position={'x': 5, 'y': 5}); pg.wait_for_timeout(150)
        assert pg.locator('.yt-card iframe').count() == 1
        print('PASS play: one nocookie player after the click, none before, no tracking domain')

        # ---------- inside the course outline and the lessons ----------
        names = {'deep-learning': 'DL_COURSE', 'machine-learning': 'ML_COURSE', 'llm-engineering': 'LLM_COURSE', 'ai-foundations': 'AI_COURSE', 'statistical-learning': 'ISLR_COURSE', 'algorithm-design': 'ALGO_COURSE'}
        for course, glob in names.items():                      # every mapped lesson must exist in its course
            have = set(pg.evaluate(f"{glob}.lessons.map(l => l.id)"))
            mapped = pg.evaluate(f"Object.keys(VideoLib.data.lessons['{course}'])")
            assert set(mapped) <= have, (course, set(mapped) - have)
            go('#/course/' + course, 600)
            assert pg.locator('.o-row .yt-badge').count() == len(mapped), (course, pg.locator('.o-row .yt-badge').count(), len(mapped))
        go('#/course/deep-learning', 600)
        assert pg.locator('.o-row').count() == 18 and pg.locator('.o-row .yt-badge').count() == 8
        assert '🎬×3' in pg.locator('.o-row', has_text='Tensors, calculus').locator('.yt-badge').inner_text()
        assert pg.locator('.o-row', has_text='Builders').locator('.yt-badge').count() == 0
        go('#/course/deep-learning/mlps', 900)
        lesson_cards = pg.locator('.lesson .yt-strip.yt-lesson .yt-card')
        assert lesson_cards.count() == 3 and 'videos for this lesson' in txt('.yt-lesson h2'), lesson_cards.count()
        assert 'Multilayer perceptrons' in txt('.lesson h1')
        assert pg.evaluate("(() => { const l = document.querySelector('.lesson'), s = l.querySelector('.yt-lesson'); return [...l.querySelectorAll('section')].findIndex(x => x === s) >= 1; })()"), 'the strip comes after the lesson text'
        lid = lesson_cards.first.get_attribute('data-yt'); assert lid == 'aircAruvnKk'
        lesson_cards.first.locator('.yt-play').click(); pg.wait_for_timeout(250)
        assert pg.locator('.lesson iframe').count() == 1 and pg.locator('.lesson iframe').get_attribute('src') == f'https://www.youtube-nocookie.com/embed/{lid}?autoplay=1&rel=0'
        go('#/course/deep-learning/builders-guide', 900); assert pg.locator('.yt-lesson').count() == 0
        go('#/course/algorithm-design/section-fft', 900); assert pg.locator('.yt-lesson .yt-card').count() == 2
        go('#/course/statistical-learning/chapter-10', 900); assert pg.locator('.yt-lesson .yt-card').count() == 2
        print('PASS lessons: 27 lessons in 6 courses show a 🎬 badge in the outline and their videos inside the lesson, other lessons none')

        # ---------- inside courses and textbook chapters ----------
        go('#/course/deep-learning', 700)
        assert pg.locator('.yt-strip .yt-card').count() == 4 and 'ideas behind this course' in txt('.yt-strip h2')
        go('#/course/databases', 700); assert pg.locator('.yt-strip').count() == 0
        go('#/book/d2l/chapter/5', 700)
        assert pg.locator('.yt-strip .yt-card').count() == 3 and 'explained visually' in txt('.yt-strip h2')
        assert pg.locator('.vz-chapter').count() == 1, 'the visual summary is still there'
        go('#/book/db/chapter/1', 700); assert pg.locator('.yt-strip').count() == 0
        go('#/book/algo/chapter/5', 700); assert pg.locator('.yt-strip .yt-card').count() == 2
        assert not [u for u in requests if any(h in u for h in YT) and 'youtube-nocookie.com/embed/' not in u], 'only the one clicked embed may ever be requested'
        print('PASS placement: strips on 6 courses and 7 chapters only, none on others, other chapter content intact')

        # ---------- opened as a file (double-clicked index.html): YouTube would answer Error 153, so no broken player ----------
        assert pg.locator('.file-banner').count() == 0, 'no banner on a normal web address'
        fctx = b.new_context(viewport={'width': 1100, 'height': 800})
        fctx.route('**/*', lambda r: r.abort() if any(h in r.request.url for h in YT) else r.continue_())
        fp = fctx.new_page(); freq = []
        fp.on('pageerror', lambda e: errors.append(str(e))); fp.on('request', lambda r: freq.append(r.url))
        fp.goto((Path(__file__).resolve().parent.parent / 'index.html').as_uri() + '#/videos/neural-networks'); fp.wait_for_timeout(1200)
        assert fp.evaluate('location.protocol') == 'file:'
        assert fp.locator('.file-banner').count() == 1 and 'start-site.bat' in fp.inner_text('.file-banner') and 'python -m http.server 8000' in fp.inner_text('.file-banner')
        first_id = fp.locator('.yt-card').first.get_attribute('data-yt')
        fp.locator('.yt-card .yt-play').first.click(); fp.wait_for_timeout(300)
        assert fp.locator('.yt-card iframe').count() == 0, 'a page opened as a file must not embed the player'
        assert 'opened as a file' in fp.inner_text('.yt-fallback') and 'Error 153' in fp.inner_text('.yt-fallback')
        assert fp.locator('.yt-fallback a').get_attribute('href') == f'https://www.youtube.com/watch?v={first_id}'
        assert not [u for u in freq if any(h in u for h in YT)], 'nothing may be requested from YouTube in this case either'
        fp.click('.file-banner button'); assert fp.locator('.file-banner').count() == 0
        print('PASS file:// page: banner with the fix, no broken player, a Watch on YouTube link instead, banner dismissable')

        # ---------- phone width ----------
        m = b.new_context(viewport={'width': 390, 'height': 800}, is_mobile=True).new_page()
        m.on('pageerror', lambda e: errors.append(str(e)))
        m.goto(BASE); m.wait_for_timeout(500)
        for h in ('#/videos', '#/videos/calculus', '#/book/d2l/chapter/5', '#/course/llm-engineering', '#/course/deep-learning', '#/course/deep-learning/mlps'):
            m.evaluate(f"location.hash='{h}'"); m.wait_for_timeout(700)
            w = m.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            assert w[0] <= w[1] + 1, (h, w)
        print('PASS phone width: no horizontal overflow')
        b.close()
    assert not errors, errors
    print('PASS Videos: 52 click-to-play videos, nothing contacts YouTube before a click, zero JS exceptions')


if __name__ == '__main__':
    main()
