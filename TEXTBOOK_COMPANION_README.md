# Textbook Companion — October 24, 2026

## Quick start

1. Open `index.html` with a browser (or serve this folder with a static web server).
2. Click **Textbooks** in the main navigation or visit the hash route `#/books`.
3. Search the 15 indexed textbooks. Open any book to see chapter headings and one original worked study guide; 10 books also include a second expanded topic guide.
4. Related existing courses include a direct **Textbook & figures** link. No API keys are needed for the new companion.
5. Consult `TEXTBOOK_AUDIT_AND_BACKLOG.md` and `CHAPTER_COVERAGE_TRACKER.csv` to identify material not yet covered.

## Coverage warning

The PDF books collectively run to thousands of pages. A chapter appearing in the index does **not** mean its text, derivations, exercises or figures have all been migrated. The new content consists of 25 original focus guides across 15 books and 228 indexed contents entries. All chapters remain marked incomplete at whole-chapter level. The new figures are educational redrawn diagrams/illustrative plots, **not the publishers' original artwork or empirical plots**.

## Tests

```bash
node tests/textbook-atlas.test.cjs
python tests/textbook-atlas-smoke.py
python tests/browser-smoke.py
node tests/content-bank.test.cjs
```

The atlas input PDFs are not bundled, but the prebuilt `assets/textbook-atlas-data.js` and `TEXTBOOK_SOURCE_INDEX.json` are bundled so the page works without the books at runtime. The original SQL/Python labs have separate CDN dependencies described in the existing README.

## Licensing and redistribution

All companion prose and SVG graphics are independently authored. This ZIP **does not contain any original textbook PDF or publisher-figure image**. The `TEXTBOOK_SOURCE_INDEX.json` titles and locators serve as a reading guide to materials supplied separately by the user. All included code remains subject to its existing repository licenses.
