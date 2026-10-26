"""Builds assets/videos-data.js: the curated 3Blue1Brown videos shown on #/videos and inside courses and textbook chapters.

  PYTHONUTF8=1 python tools/build_videos.py

Titles and video ids are NOT typed by hand. Playlist videos come from YouTube's own public playlist feeds; extra videos are listed by id and
looked up through YouTube's oEmbed service. Every video is checked to be (a) by the channel "3Blue1Brown" and (b) embeddable (oEmbed refuses
videos whose owner disabled embedding). Nothing is downloaded: the site only embeds YouTube's official player, after a click.
Needs internet; with --keep-videos it reuses the verified list and only refreshes where videos are placed (no network). The generated file is committed, so the site itself needs no network until someone presses play."""
import json, pathlib, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
NS = {'a': 'http://www.w3.org/2005/Atom', 'y': 'http://www.youtube.com/xml/schemas/2015'}
CHANNEL = '3Blue1Brown'
UA = {'User-Agent': 'Mozilla/5.0 (learnai video list builder)'}

TOPICS = [
    {'id': 'neural-networks', 'title': 'Neural networks, deep learning and LLMs', 'blurb': 'The famous series: what a neural network is, how it learns by gradient descent and backpropagation, and how transformers and attention power large language models.',
     'playlist': 'PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi'},
    {'id': 'linear-algebra', 'title': 'Essence of linear algebra', 'blurb': 'Vectors, matrices, determinants, eigenvectors: the geometry behind the maths that machine learning is built on.',
     'playlist': 'PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab'},
    {'id': 'calculus', 'title': 'Essence of calculus', 'blurb': 'Derivatives, the chain rule, integrals and Taylor series, explained visually. The chain rule is backpropagation.',
     'playlist': 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'},
    {'id': 'differential-equations', 'title': 'Differential equations', 'blurb': 'From the heat equation to Fourier series and Laplace transforms.',
     'playlist': 'PLZHQObOWTQDNPOjrT6KVlfJuKtYTftqH6'},
    {'id': 'information', 'title': 'Information and compression', 'blurb': 'Entropy, encodings and why compression is a measure of intelligence.',
     'ids': ['l6DKRf-fAAM', '7L_eTem1SQ4', '-7etvZSBxlk']},
    {'id': 'probability-and-signals', 'title': 'Probability, convolution and Fourier', 'blurb': 'Bayes theorem, the central limit theorem, convolutions and the Fourier transform.',
     'ids': ['HZGCoVF3YvM', 'zeJD6dqJ5lo', 'KuXjwB4LzSA', 'spUNpyF58BY']},
]

# Where the videos are suggested. Every id must be one of the videos above; tests check this.
COURSES = {
    'deep-learning': ['aircAruvnKk', 'IHZwWFHWa-w', 'Ilg3gGewQ5U', 'tIeHLnjs5U8'],
    'machine-learning': ['aircAruvnKk', 'IHZwWFHWa-w', 'kYB8IZa5AuE', 'PFDu9oVAE-g'],
    'llm-engineering': ['LPZh9BOjkQs', 'wjZofJX0v4M', 'eMlx5fFNoYc', '9-Jl0dxWQs8'],
    'ai-foundations': ['LPZh9BOjkQs', 'aircAruvnKk', 'HZGCoVF3YvM'],
    'statistical-learning': ['HZGCoVF3YvM', 'zeJD6dqJ5lo', 'PFDu9oVAE-g'],
    'algorithm-design': ['spUNpyF58BY', 'KuXjwB4LzSA'],
}
LESSONS = {           # course -> lesson id -> videos. Only lessons whose content the video really explains; shown in the outline and inside the lesson.
    'deep-learning': {'dl-intro': ['aircAruvnKk'], 'tensors-autograd': ['fNk_zzaMoSs', 'YG15m2VwSjA', 'tIeHLnjs5U8'], 'linear-regression': ['IHZwWFHWa-w'],
                      'softmax-classification': ['GlYgs6v2YfU'], 'mlps': ['aircAruvnKk', 'Ilg3gGewQ5U', 'tIeHLnjs5U8'], 'convolutions': ['KuXjwB4LzSA'],
                      'attention-transformers-dl': ['wjZofJX0v4M', 'eMlx5fFNoYc'], 'optimization-dl': ['IHZwWFHWa-w']},
    'machine-learning': {'training-models': ['IHZwWFHWa-w'], 'dimensionality-reduction': ['PFDu9oVAE-g'], 'neural-networks': ['aircAruvnKk', 'Ilg3gGewQ5U'],
                         'training-deep-nets': ['Ilg3gGewQ5U', 'tIeHLnjs5U8'], 'cnns': ['KuXjwB4LzSA'], 'attention-transformers': ['wjZofJX0v4M', 'eMlx5fFNoYc'], 'generative-models': ['iv-5mZ_9CPY']},
    'llm-engineering': {'ai-twin-architecture': ['LPZh9BOjkQs', 'wjZofJX0v4M'], 'inference-optimization': ['eMlx5fFNoYc']},
    'ai-foundations': {'what-is-ai': ['LPZh9BOjkQs'], 'probability': ['HZGCoVF3YvM'], 'bayesian-networks': ['HZGCoVF3YvM'], 'natural-language': ['LPZh9BOjkQs', 'wjZofJX0v4M'],
                       'learning-models-deep-rl': ['aircAruvnKk', 'IHZwWFHWa-w'], 'vision-robotics': ['KuXjwB4LzSA']},
    'statistical-learning': {'chapter-3': ['zeJD6dqJ5lo'], 'chapter-4': ['HZGCoVF3YvM'], 'chapter-10': ['PFDu9oVAE-g', 'kYB8IZa5AuE']},
    'algorithm-design': {'section-fft': ['KuXjwB4LzSA', 'spUNpyF58BY']},
}
CHAPTERS = {          # book -> chapter number -> videos
    'd2l': {1: ['aircAruvnKk'], 2: ['fNk_zzaMoSs', 'YG15m2VwSjA', 'tIeHLnjs5U8'], 3: ['IHZwWFHWa-w'], 4: ['GlYgs6v2YfU'], 5: ['aircAruvnKk', 'Ilg3gGewQ5U', 'tIeHLnjs5U8']},
    'islr': {10: ['PFDu9oVAE-g']},
    'algo': {5: ['KuXjwB4LzSA', 'spUNpyF58BY']},
}


def get(url, retry_404=False):
    for k in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404) and not (retry_404 and e.code == 404):
                raise
            last = e
        except Exception as e:
            last = e
        time.sleep(2 * (k + 1))
    raise last


def oembed(vid):
    url = 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote(f'https://www.youtube.com/watch?v={vid}', safe='')
    try:
        return json.loads(get(url))
    except urllib.error.HTTPError as e:
        return {'error': e.code}


def playlist(pid):
    root = ET.fromstring(get('https://www.youtube.com/feeds/videos.xml?playlist_id=' + pid, retry_404=True))
    return [(e.find('y:videoId', NS).text, ' '.join((e.find('a:title', NS).text or '').split())) for e in root.findall('a:entry', NS)]


def existing_topics():
    """The already verified list from assets/videos-data.js (used by --keep-videos, which changes placements without any network access)."""
    text = (ROOT / 'assets' / 'videos-data.js').read_text(encoding='utf-8')
    return json.loads(text[text.index('{', text.index('=')):text.rindex('}') + 1])


def main():
    keep = '--keep-videos' in sys.argv
    seen, topics, skipped = {}, [], []
    if keep:
        old = existing_topics(); topics = old['topics']; seen = {v['id']: v['title'] for t in topics for v in t['videos']}
    for t in ([] if keep else TOPICS):
        entries = playlist(t['playlist']) if 'playlist' in t else [(v, None) for v in t['ids']]
        vids = []
        for vid, feed_title in entries:
            if vid in {x['id'] for x in vids}:
                continue
            if vid not in seen:
                info = oembed(vid); time.sleep(0.25)
                if 'error' in info:
                    skipped.append((vid, f"oEmbed {info['error']}: not embeddable or not available")); continue
                if info.get('author_name') != CHANNEL:
                    skipped.append((vid, f"author is {info.get('author_name')!r}, not {CHANNEL}")); continue
                seen[vid] = ' '.join((feed_title or info['title']).split()) or ' '.join(info['title'].split())
            vids.append({'id': vid, 'title': seen[vid]})
        topics.append({'id': t['id'], 'title': t['title'], 'blurb': t['blurb'], 'videos': vids})
    known = set(seen)
    for name, m in (('COURSES', COURSES),):
        for course, ids in m.items():
            assert set(ids) <= known, (name, course, set(ids) - known)
    for course, lessons in LESSONS.items():
        for lesson, ids in lessons.items():
            assert set(ids) <= known, (course, lesson, set(ids) - known)
    for book, chs in CHAPTERS.items():
        for n, ids in chs.items():
            assert set(ids) <= known, (book, n, set(ids) - known)
    data = {'checked': (existing_topics()['checked'] if keep else time.strftime('%Y-%m-%d')), 'channel': {'name': CHANNEL, 'url': 'https://www.youtube.com/@3blue1brown'}, 'topics': topics,
            'courses': COURSES, 'lessons': LESSONS, 'chapters': {b: {str(n): v for n, v in c.items()} for b, c in CHAPTERS.items()}}
    out = ROOT / 'assets' / 'videos-data.js'
    out.write_text('/* Generated by tools/build_videos.py; do not edit. Titles come from YouTube. */\nwindow.VIDEO_LIB = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8', newline='\n')
    print(f'{sum(len(t["videos"]) for t in topics)} videos in {len(topics)} topics; {len(known)} unique; skipped: {skipped or "none"}')


if __name__ == '__main__':
    main()
