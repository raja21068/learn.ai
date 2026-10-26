/* Guards the author credit: the name must stay in the footer, the home page About block, the page metadata, LICENSE and README.
   Run: node tests/credits.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const NAME = 'Rajesh Kumar', HANDLE = 'raja21068', URL = 'https://github.com/raja21068';
const html = read('index.html');

// footer: a link to the profile, next to the existing licence statement
const footer = html.slice(html.indexOf('<div class="container foot-bottom">'));
assert.ok(footer.includes(`<a href="${URL}"`) && footer.includes(`>${NAME}</a>`), 'footer credit');
assert.match(footer, /CC BY 4\.0/); assert.match(footer, /code MIT/);

// metadata: author tag, author link and valid structured data
assert.match(html, new RegExp(`<meta name="author" content="${NAME}">`));
assert.ok(html.includes(`<link rel="author" href="${URL}">`));
const ld = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
assert.ok(ld, 'JSON-LD block'); const data = JSON.parse(ld[1]);
assert.equal(data['@type'], 'WebSite'); assert.equal(data.author.name, NAME); assert.equal(data.author.url, URL);

// home page: the About block exists, links to the profile and to the sources page, and only the home route renders it
const app = read('assets/app.js');
const about = /<section class="container section-sm about-block" id="about">[\s\S]*?<\/section>/.exec(app);
assert.ok(about, 'About block'); assert.ok(about[0].includes(NAME) && about[0].includes(URL) && about[0].includes('#/practice/sources'));
assert.equal(app.split('id="about"').length - 1, 1, 'exactly one About block');

// licence and README
const lic = read('LICENSE.md');
assert.match(lic, new RegExp(`Copyright \\(c\\) 2026 ${NAME}`)); assert.match(lic, new RegExp(`Attribution: ${NAME}, learn/ai`));
const readme = read('README.md');
assert.ok(readme.includes(`[${NAME}](${URL})`)); assert.ok(readme.indexOf(NAME) < readme.indexOf('16 courses'), 'the name is near the top of the README');
// the licence text itself is untouched apart from the holder
assert.match(lic, /Permission is hereby granted, free of charge/); assert.match(lic, /THE SOFTWARE IS PROVIDED "AS IS"/);
assert.ok(!/>raja21068<\/a>/.test(footer), 'the footer shows the name, not the handle');
console.log('PASS credits: footer, About block, metadata (author, JSON-LD), LICENSE and README all name ' + NAME + ' and link to ' + HANDLE);
