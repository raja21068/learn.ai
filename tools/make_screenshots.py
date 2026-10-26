"""Captures the screenshots used in README.md into docs/images/ (JPEG, dark theme).
Needs the site served on http://localhost:8000 (python -m http.server 8000) and Playwright with Edge or Chrome.
Run: PYTHONUTF8=1 python tools/make_screenshots.py"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
from _browser import launch_browser

BASE = os.environ.get('BASE_URL', 'http://localhost:8000') + '/index.html'
OUT = ROOT / 'docs' / 'images'
OUT.mkdir(parents=True, exist_ok=True)


def main():
    with sync_playwright() as p:
        b = launch_browser(p)
        ctx = b.new_context(viewport={'width': 1280, 'height': 800}, color_scheme='dark', device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(BASE); pg.wait_for_timeout(900)

        def go(h, wait=700):
            pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(wait); pg.evaluate("window.scrollTo(0, 0)")

        def shot(name, full=False, clip=None):
            pg.screenshot(path=str(OUT / name), type='jpeg', quality=82, full_page=full, clip=clip); print('wrote', name)

        go('#/'); shot('home.jpg')
        shot('social-preview.jpg', clip={'x': 0, 'y': 60, 'width': 1280, 'height': 640})
        lesson = pg.evaluate("ML_COURSE.lessons.find(l => l.lab && l.lab.tasks).id")
        go('#/course/machine-learning'); shot('course.jpg')
        go(f'#/course/machine-learning/{lesson}', 1200); shot('lesson-lab.jpg')
        go('#/practice'); shot('practice-hub.jpg')
        go('#/practice/lab/a-star-grid'); shot('coding-lab.jpg')
        go('#/practice/quiz/ml/introduction-to-machine-learning/pre'); pg.wait_for_timeout(300)
        pg.locator('.ph-opt').first.click(); pg.click('#ph-check'); pg.wait_for_timeout(200); shot('quiz.jpg')
        go('#/practice/notebooks'); shot('notebooks.jpg')
        go('#/visualize/charts/gradient', 1500); shot('chart-gradient.jpg')
        go('#/visualize/charts/overfit', 1500); shot('chart-overfit.jpg')
        go('#/visualize/diagrams/transformer', 4000); shot('diagram.jpg')
        go('#/visualize/playground', 2500)
        frame = pg.frame_locator('iframe[title="TensorFlow Playground"]')
        frame.locator('#main-part').wait_for(timeout=30000); frame.locator('#play-pause-button').click(); pg.wait_for_timeout(3500)
        pg.evaluate("document.querySelector('.vz-frame').scrollIntoView()"); pg.wait_for_timeout(300); shot('playground.jpg')
        go('#/book/os/chapter/7', 900)
        pg.evaluate("document.querySelector('.vz-chapter').scrollIntoView()"); pg.wait_for_selector('.vz-chapter .vz-diagram svg', timeout=60000); pg.wait_for_timeout(500); shot('textbook-chapter.jpg')
        go('#/books'); shot('textbooks.jpg')
        go('#/videos'); shot('videos.jpg')
        go('#/course/deep-learning', 900); pg.evaluate("document.querySelector('.o-row').scrollIntoView({block: 'center'})"); pg.wait_for_timeout(300); shot('outline-videos.jpg')
        go('#/course/deep-learning/mlps', 1200); pg.evaluate("document.querySelector('.yt-lesson').scrollIntoView({block: 'center'})"); pg.wait_for_timeout(300); shot('lesson-video.jpg')
        m = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark', device_scale_factor=2, is_mobile=True).new_page()
        m.goto(BASE); m.wait_for_timeout(900); m.screenshot(path=str(OUT / 'mobile.jpg'), type='jpeg', quality=82); print('wrote mobile.jpg')
        b.close()


if __name__ == '__main__':
    main()
