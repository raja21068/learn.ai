# Changes to TensorFlow Playground (Apache-2.0, section 4b)

Source: https://github.com/tensorflow/playground, branch `gh-pages` (the built site, last released 2017-03-09), `LICENSE` from `master`.
Copyright 2016 Google Inc.

`bundle.js`, `bundle.css`, `lib.js`, `favicon.png`, `preview.png` and `LICENSE` are byte-for-byte the originals.

`index.html` differs from `index.original.html` (the untouched original) in exactly one line: the Google Analytics script tag
`<script src="analytics.js"></script>` was replaced by `<script>window.ga = function () {};</script>`.
The page calls `ga()` for page-view tracking; the empty function keeps it working without sending anything to Google Analytics, and
`analytics.js` is not included. The page still loads the Roboto and Material Icons fonts from Google Fonts, like the rest of this site.
