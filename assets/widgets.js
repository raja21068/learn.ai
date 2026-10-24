/* Interactive lesson widgets. Each widget renders into a container element. */
(() => {
  'use strict';
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tbl = (cols, rows, opt = {}) => `<div class="w-tablewrap"><table class="w-table">${opt.caption ? `<caption>${opt.caption}</caption>` : ''}<thead><tr>${cols.map((c, i) => `<th class="${(opt.pk || []).includes(i) ? 'pk' : ''}${(opt.fk || []).includes(i) ? ' fk' : ''}${(opt.hl || []).includes(i) ? ' hl' : ''}">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${(opt.rowClass && opt.rowClass(r, ri)) || ''}">${r.map((v, i) => `<td class="${(opt.hl || []).includes(i) ? 'hl' : ''}">${v === null ? '<span class="null">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const seg = (name, items, active) => `<div class="w-seg" role="group">${items.map(([v, label]) => `<button type="button" data-${name}="${v}" class="${v === active ? 'on' : ''}" aria-pressed="${v === active}">${label}</button>`).join('')}</div>`;
  const W = {};

  /* Ch1: file system vs database */
  W.filesystem = el => {
    let mode = 'files', sales = '12 Oak St, Austin', billing = '12 Oak St, Austin', db = '12 Oak St, Austin';
    const draw = () => {
      const files = mode === 'files';
      const a = files ? sales : db, b = files ? billing : db, bad = a !== b;
      el.innerHTML = `<div class="w-head"><strong>Change Kathy Smith's address</strong>${seg('mode', [['files', 'File system'], ['db', 'Database']], mode)}</div>
      <div class="w-two">
        <div class="w-card"><span class="w-label">${files ? 'SALES.DAT (sales program)' : 'Sales app → DBMS'}</span><label class="w-field">Address<input data-field="sales" value="${esc(a)}"></label></div>
        <div class="w-card"><span class="w-label">${files ? 'BILLING.DAT (billing program)' : 'Billing app → DBMS'}</span><label class="w-field">Address<input data-field="billing" value="${esc(b)}" ${files ? 'readonly title="Billing keeps its own copy; the sales clerk cannot edit it"' : ''}></label></div>
      </div>
      ${files ? '' : `<div class="w-db">🗄️ CUSTOMER table: one row, one address: <b>${esc(db)}</b></div>`}
      <p class="w-status ${bad ? 'bad' : 'good'}">${bad ? '⚠ Data inconsistency: the two files now disagree. Which address is right? Invoices will go to the old one.' : files ? 'Both copies match for now. Try editing the sales address.' : '✓ Single source of truth: both applications read the same row through the DBMS.'}</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) { mode = b.dataset.mode; draw(); } });
    el.addEventListener('input', e => {
      const f = e.target.dataset.field; if (!f) return;
      if (mode === 'files') { if (f === 'sales') sales = e.target.value; } else db = e.target.value;
      const pos = e.target.selectionStart; draw(); const n = el.querySelector(`[data-field="${f}"]`); n.focus(); n.setSelectionRange(pos, pos);
    });
    draw();
  };

  /* Ch2: abstraction levels */
  W.abstraction = el => {
    const L = [
      ['External', 'End users\' views', 'Each user group sees only its slice: the billing department sees customers and invoices; HR sees employees.', 'CREATE VIEW BILLING_VIEW AS\n  SELECT CUS_CODE, CUS_LNAME, CUS_BALANCE FROM CUSTOMER;'],
      ['Conceptual', 'Organization-wide, DBMS-independent', 'One global picture of entities, attributes and relationships, usually an ERD. No commitment to any software.', 'CUSTOMER 1 ──generates── M INVOICE\nINVOICE 1 ──contains── M LINE\nPRODUCT 1 ──appears in── M LINE'],
      ['Internal', 'How the chosen DBMS sees it', 'The conceptual model mapped onto a specific DBMS: relational tables, keys, constraints. Changing it does not affect the conceptual model (logical independence).', 'CREATE TABLE INVOICE (\n  INV_NUMBER INTEGER PRIMARY KEY,\n  CUS_CODE INTEGER REFERENCES CUSTOMER);'],
      ['Physical', 'Storage on media', 'Files, pages, blocks, indexes, disks. Changing it (new SSD, new file layout) does not affect the internal model (physical independence).', 'tablespace USERS → datafile users01.dbf\npage size 8 KB, B-tree index on CUS_CODE']
    ];
    let i = 1;
    const draw = () => {
      el.innerHTML = `<div class="w-stack">${L.map((l, k) => `<button type="button" data-layer="${k}" class="w-layer ${k === i ? 'on' : ''}" style="--w:${100 - k * 9}%"><b>${l[0]}</b><small>${l[1]}</small></button>`).join('')}</div>
      <div class="w-card"><span class="w-label">${L[i][0]} model</span><p>${L[i][2]}</p><pre class="snip">${esc(L[i][3])}</pre></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-layer]'); if (b) { i = +b.dataset.layer; draw(); } });
    draw();
  };

  /* Ch3: key explorer */
  W.keys = el => {
    const cols = ['INV_NUMBER', 'LINE_NUMBER', 'P_CODE', 'LINE_UNITS'];
    const rows = [[1001, 1, 'HM-100', 1], [1001, 2, 'NL-001', 3], [1002, 1, 'PT-500', 2], [1003, 1, 'DR-310', 1], [1003, 2, 'SD-220', 1], [1003, 3, 'GL-030', 2], [1004, 1, 'PT-510', 3], [1004, 2, 'BR-020', 4], [1006, 2, 'NL-001', 5], [1006, 3, 'HM-100', 1]];
    let sel = new Set([0]);
    const unique = s => { const k = rows.map(r => [...s].map(i => r[i]).join('|')); return new Set(k).size === k.length; };
    const draw = () => {
      const s = [...sel].sort();
      const sup = s.length && unique(s);
      const minimal = sup && s.every(c => !unique(s.filter(x => x !== c)) || s.length === 1);
      const dupKeys = new Set(); if (s.length && !sup) { const seen = {}; rows.forEach((r, ri) => { const k = s.map(i => r[i]).join('|'); if (k in seen) { dupKeys.add(ri); dupKeys.add(seen[k]); } else seen[k] = ri; }); }
      el.innerHTML = `<div class="w-head"><strong>Select columns to test as a key</strong></div>
      <div class="w-chips">${cols.map((c, i) => `<label class="w-chip ${sel.has(i) ? 'on' : ''}"><input type="checkbox" data-col="${i}" ${sel.has(i) ? 'checked' : ''}> ${c}</label>`).join('')}</div>
      ${tbl(cols, rows, { hl: s, rowClass: (_, ri) => dupKeys.has(ri) ? 'dup' : '' })}
      <p class="w-status ${!s.length ? '' : minimal ? 'good' : sup ? 'warn' : 'bad'}">${!s.length ? 'Pick at least one column.' : minimal ? `✓ {${s.map(i => cols[i]).join(', ')}} is a <b>candidate key</b>: unique and minimal.` : sup ? `◐ {${s.map(i => cols[i]).join(', ')}} is a <b>superkey</b> but not minimal: you could drop a column and stay unique.` : `✗ Not a key: highlighted rows share the same value(s).`}</p>`;
    };
    el.addEventListener('change', e => { const c = e.target.dataset.col; if (c == null) return; e.target.checked ? sel.add(+c) : sel.delete(+c); draw(); });
    draw();
  };

  /* Ch4: ER builder with crow's foot */
  W.erd = el => {
    const ex = {
      '11': { a: 'PROFESSOR', b: 'DEPARTMENT', verb: 'chairs', amin: 0, bmin: 1, impl: [['PROFESSOR', 'PROF_ID (PK), PROF_NAME'], ['DEPARTMENT', 'DEPT_CODE (PK), DEPT_NAME, PROF_ID (FK, UNIQUE)']], note: 'In 1:1, put the FK on the side where participation is mandatory (every department has a chair) and make it UNIQUE.' },
      '1M': { a: 'CUSTOMER', b: 'INVOICE', verb: 'generates', amin: 1, bmin: 0, impl: [['CUSTOMER', 'CUS_CODE (PK), CUS_LNAME, …'], ['INVOICE', 'INV_NUMBER (PK), INV_DATE, CUS_CODE (FK)']], note: 'In 1:M, the PK of the "1" side becomes an FK in the "many" side.' },
      'MN': { a: 'INVOICE', b: 'PRODUCT', verb: 'contains', amin: 0, bmin: 1, impl: [['INVOICE', 'INV_NUMBER (PK), …'], ['LINE (bridge)', 'INV_NUMBER (PK, FK), LINE_NUMBER (PK), P_CODE (FK), LINE_UNITS'], ['PRODUCT', 'P_CODE (PK), …']], note: 'M:N cannot be implemented directly. Add a bridge entity holding FKs to both sides, giving two 1:M relationships.' }
    };
    let k = '1M', optA = false, optB = false;
    const mark = (x, dir, min, many) => { // dir: +1 means line continues to the right
      const g = []; const c = 'var(--ink)';
      if (many) g.push(`<path d="M${x} 50 L${x + dir * 18} 38 M${x} 50 L${x + dir * 18} 62 M${x} 50 L${x + dir * 18} 50" stroke="${c}" stroke-width="2" fill="none"/>`);
      else g.push(`<path d="M${x + dir * 12} 38 V62" stroke="${c}" stroke-width="2"/>`);
      if (min === 0) g.push(`<circle cx="${x + dir * 30}" cy="50" r="7" fill="var(--panel)" stroke="${c}" stroke-width="2"/>`);
      else g.push(`<path d="M${x + dir * 26} 38 V62" stroke="${c}" stroke-width="2"/>`);
      return g.join('');
    };
    const draw = () => {
      const e = ex[k]; const aMany = k === 'MN', bMany = k !== '11';
      const minA = optA ? 0 : 1, minB = optB ? 0 : 1;
      const box = (x, t) => `<rect x="${x}" y="28" width="150" height="44" rx="8" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/><text x="${x + 75}" y="55" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink)">${t}</text>`;
      el.innerHTML = `<div class="w-head"><strong>Relationship builder</strong>${seg('conn', [['11', '1 : 1'], ['1M', '1 : M'], ['MN', 'M : N']], k)}</div>
      <svg viewBox="0 0 560 100" class="w-svg" role="img" aria-label="Crow's foot diagram">
        ${box(20, e.a)}${box(390, e.b)}
        <line x1="170" y1="50" x2="390" y2="50" stroke="var(--ink)" stroke-width="2"/>
        <rect x="236" y="38" width="88" height="24" rx="12" fill="var(--bg-soft)"/><text x="280" y="55" text-anchor="middle" font-size="12" fill="var(--muted)">${e.verb}</text>
        ${mark(170, 1, minA, aMany)}${mark(390, -1, minB, bMany)}
      </svg>
      <div class="w-chips"><label class="w-chip ${optA ? 'on' : ''}"><input type="checkbox" data-opt="a" ${optA ? 'checked' : ''}> ${e.a} optional</label><label class="w-chip ${optB ? 'on' : ''}"><input type="checkbox" data-opt="b" ${optB ? 'checked' : ''}> ${e.b} optional</label></div>
      <p class="w-small">Read it: each ${e.b} is related to ${minA ? 'exactly/at least one' : 'zero or'} ${aMany ? 'or many ' : ''}${e.a}; each ${e.a} to ${minB ? 'at least one' : 'zero or more'} ${bMany ? '' : '(at most one) '}${e.b}.</p>
      <div class="w-impl">${e.impl.map(t => `<div class="w-card"><span class="w-label">${t[0]}</span><code>${t[1]}</code></div>`).join('')}</div>
      <p class="w-status">${e.note}</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-conn]'); if (b) { k = b.dataset.conn; draw(); } });
    el.addEventListener('change', e => { const o = e.target.dataset.opt; if (o) { o === 'a' ? optA = e.target.checked : optB = e.target.checked; draw(); } });
    draw();
  };

  /* Ch5: subtype constraints */
  W.subtype = el => {
    let overlap = false, complete = false;
    const people = [['Rhett', ['Pilot']], ['Anne', ['Pilot', 'Mechanic']], ['Ivan', ['Accountant']], ['Nora', []]];
    const draw = () => {
      el.innerHTML = `<div class="w-head"><strong>EMPLOYEE hierarchy</strong><div class="w-chips"><label class="w-chip ${overlap ? 'on' : ''}"><input type="checkbox" data-k="o" ${overlap ? 'checked' : ''}> Overlapping</label><label class="w-chip ${complete ? 'on' : ''}"><input type="checkbox" data-k="c" ${complete ? 'checked' : ''}> Complete</label></div></div>
      <svg viewBox="0 0 520 170" class="w-svg"><rect x="185" y="6" width="150" height="40" rx="8" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/><text x="260" y="31" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink)">EMPLOYEE</text>
      <line x1="${complete ? 256 : 260}" y1="46" x2="${complete ? 256 : 260}" y2="74" stroke="var(--ink)" stroke-width="2"/>${complete ? '<line x1="264" y1="46" x2="264" y2="74" stroke="var(--ink)" stroke-width="2"/>' : ''}
      <circle cx="260" cy="88" r="14" fill="var(--panel)" stroke="var(--ink)" stroke-width="2"/><text x="260" y="93" text-anchor="middle" font-weight="700" font-size="13" fill="var(--ink)">${overlap ? 'o' : 'd'}</text>
      ${[85, 260, 435].map((x, i) => `<path d="M260 102 L${x} 124" stroke="var(--ink)" stroke-width="2"/><rect x="${x - 62}" y="124" width="124" height="38" rx="8" fill="var(--panel)" stroke="var(--line-strong)" stroke-width="2"/><text x="${x}" y="148" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${['PILOT', 'MECHANIC', 'ACCOUNTANT'][i]}</text>`).join('')}</svg>
      <div class="w-list">${people.map(([n, s]) => { const ok = (s.length <= 1 || overlap) && (s.length > 0 || !complete); return `<div class="w-row ${ok ? 'good' : 'bad'}"><span>${ok ? '✓' : '✗'}</span><b>${n}</b><span>${s.length ? s.join(' + ') : 'no subtype'}</span><small>${ok ? 'allowed' : s.length > 1 ? 'disjoint forbids two subtypes' : 'complete requires a subtype'}</small></div>`; }).join('')}</div>`;
    };
    el.addEventListener('change', e => { if (e.target.dataset.k === 'o') overlap = e.target.checked; if (e.target.dataset.k === 'c') complete = e.target.checked; draw(); });
    draw();
  };

  /* Ch6: normalization stepper */
  W.normalize = el => {
    const S = [
      { t: 'Unnormalized report', d: 'A project assignment report as a spreadsheet. Project data appears once, followed by a <b>repeating group</b> of employees with blank cells. Try adding a new job class before anyone has it (insertion anomaly) or changing Ada\'s rate in one place (update anomaly).', tables: [['PROJECT REPORT', ['PROJ_NUM', 'PROJ_NAME', 'EMP_NUM', 'EMP_NAME', 'JOB_CLASS', 'CHG_HOUR', 'HOURS'], [[15, 'Atlas App', 101, 'Ada Byron', 'DB Designer', 105, 19.4], ['', '', 102, 'Ken Ito', 'Programmer', 80, 23.8], ['', '', 105, 'Lia Moss', 'Analyst', 96, 35.7], [18, 'Nimbus API', 101, 'Ada Byron', 'DB Designer', 105, 12.6], ['', '', 104, 'Raj Pal', 'Programmer', 80, 22.0]], []]] },
      { t: '1NF: remove repeating groups', d: 'Fill every cell so each row stands alone and identify the PK: <b>(PROJ_NUM, EMP_NUM)</b>. Now find the dependencies. PROJ_NUM → PROJ_NAME and EMP_NUM → EMP_NAME, JOB_CLASS, CHG_HOUR are <b>partial</b> dependencies. JOB_CLASS → CHG_HOUR is <b>transitive</b>.', tables: [['ASSIGNMENT_1NF', ['PROJ_NUM', 'PROJ_NAME', 'EMP_NUM', 'EMP_NAME', 'JOB_CLASS', 'CHG_HOUR', 'HOURS'], [[15, 'Atlas App', 101, 'Ada Byron', 'DB Designer', 105, 19.4], [15, 'Atlas App', 102, 'Ken Ito', 'Programmer', 80, 23.8], [15, 'Atlas App', 105, 'Lia Moss', 'Analyst', 96, 35.7], [18, 'Nimbus API', 101, 'Ada Byron', 'DB Designer', 105, 12.6], [18, 'Nimbus API', 104, 'Raj Pal', 'Programmer', 80, 22.0]], [0, 2]]] },
      { t: '2NF: remove partial dependencies', d: 'Each part of the composite key gets its own table with the attributes that depend on it. HOURS depends on the whole key, so it stays in ASSIGNMENT. A transitive dependency remains in EMPLOYEE: JOB_CLASS → CHG_HOUR.', tables: [['PROJECT', ['PROJ_NUM', 'PROJ_NAME'], [[15, 'Atlas App'], [18, 'Nimbus API']], [0]], ['EMPLOYEE', ['EMP_NUM', 'EMP_NAME', 'JOB_CLASS', 'CHG_HOUR'], [[101, 'Ada Byron', 'DB Designer', 105], [102, 'Ken Ito', 'Programmer', 80], [104, 'Raj Pal', 'Programmer', 80], [105, 'Lia Moss', 'Analyst', 96]], [0]], ['ASSIGNMENT', ['PROJ_NUM', 'EMP_NUM', 'HOURS'], [[15, 101, 19.4], [15, 102, 23.8], [15, 105, 35.7], [18, 101, 12.6], [18, 104, 22.0]], [0, 1]]] },
      { t: '3NF: remove transitive dependencies', d: 'Move JOB_CLASS → CHG_HOUR into its own JOB table. Every non-key attribute now depends on <i>the key, the whole key and nothing but the key</i>. Each rate is stored once, and here every determinant is a candidate key, so the design is also in <b>BCNF</b>.', tables: [['PROJECT', ['PROJ_NUM', 'PROJ_NAME'], [[15, 'Atlas App'], [18, 'Nimbus API']], [0]], ['EMPLOYEE', ['EMP_NUM', 'EMP_NAME', 'JOB_CLASS'], [[101, 'Ada Byron', 'DB Designer'], [102, 'Ken Ito', 'Programmer'], [104, 'Raj Pal', 'Programmer'], [105, 'Lia Moss', 'Analyst']], [0]], ['JOB', ['JOB_CLASS', 'CHG_HOUR'], [['DB Designer', 105], ['Programmer', 80], ['Analyst', 96]], [0]], ['ASSIGNMENT', ['PROJ_NUM', 'EMP_NUM', 'HOURS'], [[15, 101, 19.4], [15, 102, 23.8], [15, 105, 35.7], [18, 101, 12.6], [18, 104, 22.0]], [0, 1]]] }
    ];
    let i = 0;
    const draw = () => {
      const s = S[i];
      el.innerHTML = `<div class="w-head"><strong>${s.t}</strong><div class="w-steps">${S.map((_, k) => `<button type="button" data-step="${k}" class="${k === i ? 'on' : k < i ? 'done' : ''}">${['UNF', '1NF', '2NF', '3NF'][k]}</button>`).join('')}</div></div>
      <p class="w-small">${s.d}</p><div class="w-grid-tables">${s.tables.map(t => tbl(t[1], t[2], { caption: t[0], pk: t[3] })).join('')}</div>
      <div class="w-nav"><button type="button" data-step="${Math.max(0, i - 1)}" ${i ? '' : 'disabled'}>← Back</button><button type="button" class="primary" data-step="${Math.min(3, i + 1)}" ${i < 3 ? '' : 'disabled'}>Next step →</button></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (b && !b.disabled) { i = +b.dataset.step; draw(); } });
    draw();
  };

  /* Ch7: join visualizer */
  W.joins = el => {
    const V = [[21001, 'Brightline'], [21003, 'Cedar & Co.'], [21006, 'Quietbrook']];
    const P = [['HM-100', 21001], ['SD-220', 21001], ['NL-001', 21003], ['WB-777', null]];
    let k = 'inner';
    const run = () => {
      const out = [];
      if (k === 'cross') { V.forEach(v => P.forEach(p => out.push([v[0], v[1], p[0], p[1], 'm']))); return out; }
      V.forEach(v => { const m = P.filter(p => p[1] === v[0]); if (m.length) m.forEach(p => out.push([v[0], v[1], p[0], p[1], 'm'])); else if (k === 'left' || k === 'full') out.push([v[0], v[1], null, null, 'l']); });
      if (k === 'right' || k === 'full') P.filter(p => !V.some(v => v[0] === p[1])).forEach(p => out.push([null, null, p[0], p[1], 'r']));
      if (k === 'right') return out.filter(r => r[4] !== 'l');
      return out;
    };
    const sql = { inner: 'FROM VENDOR V INNER JOIN PRODUCT P ON V.V_CODE = P.V_CODE', left: 'FROM VENDOR V LEFT JOIN PRODUCT P ON V.V_CODE = P.V_CODE', right: 'FROM VENDOR V RIGHT JOIN PRODUCT P ON V.V_CODE = P.V_CODE', full: 'FROM VENDOR V FULL OUTER JOIN PRODUCT P ON V.V_CODE = P.V_CODE', cross: 'FROM VENDOR V CROSS JOIN PRODUCT P' };
    const draw = () => {
      const r = run(); const fillL = ['left', 'full', 'cross'].includes(k), fillR = ['right', 'full', 'cross'].includes(k);
      el.innerHTML = `<div class="w-head"><strong>Join visualizer</strong>${seg('join', [['inner', 'Inner'], ['left', 'Left'], ['right', 'Right'], ['full', 'Full'], ['cross', 'Cross']], k)}</div>
      <div class="w-joinrow"><svg viewBox="0 0 200 110" class="w-venn"><defs><clipPath id="cl"><circle cx="75" cy="55" r="45"/></clipPath></defs>
        <circle cx="75" cy="55" r="45" fill="${fillL ? 'var(--accent-soft)' : 'transparent'}" stroke="var(--ink)" stroke-width="1.5"/>
        <circle cx="125" cy="55" r="45" fill="${fillR ? 'var(--accent-soft)' : 'transparent'}" stroke="var(--ink)" stroke-width="1.5"/>
        <circle cx="125" cy="55" r="45" clip-path="url(#cl)" fill="var(--accent)" opacity=".75"/>
        <text x="48" y="59" font-size="11" fill="var(--ink)">VENDOR</text><text x="130" y="59" font-size="11" fill="var(--ink)">PRODUCT</text></svg>
        <div>${tbl(['V_CODE', 'V_NAME'], V, { caption: 'VENDOR', pk: [0] })}</div><div>${tbl(['P_CODE', 'V_CODE'], P, { caption: 'PRODUCT', pk: [0], fk: [1] })}</div></div>
      <pre class="snip">SELECT V.V_CODE, V.V_NAME, P.P_CODE, P.V_CODE\n${sql[k]};</pre>
      ${tbl(['V.V_CODE', 'V_NAME', 'P_CODE', 'P.V_CODE'], r.map(x => x.slice(0, 4)), { caption: `Result: ${r.length} rows`, rowClass: x => '' })}
      <p class="w-status">${{ inner: 'Only matching pairs. Quietbrook (no products) and the wheelbarrow (no vendor) disappear.', left: 'Every vendor is kept; Quietbrook gets NULLs. Add WHERE P.P_CODE IS NULL to find vendors with no products.', right: 'Every product is kept; WB-777 has no vendor. (SQLite 3.39+ supports RIGHT and FULL.)', full: 'Everything from both sides, matched where possible.', cross: `Cartesian product: ${V.length} × ${P.length} = ${V.length * P.length} rows, usually a mistake from a forgotten join condition.` }[k]}</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-join]'); if (b) { k = b.dataset.join; draw(); } });
    draw();
  };

  /* Ch9: DBLC */
  W.dblc = el => {
    const P = [
      ['Initial study', 'Analyze the company situation, define problems and constraints, set objectives, scope and boundaries.', 'Problem statement, objectives, scope'],
      ['Database design', 'Conceptual design (ERD, normalization) → DBMS selection → logical design (tables, views, constraints) → physical design (storage, indexes).', 'ERD, data dictionary, schema, physical plan'],
      ['Implementation & loading', 'Install the DBMS, create the database and tables, load or convert existing data.', 'Running database with data'],
      ['Testing & evaluation', 'Test integrity, security, performance, backup and recovery. Evaluate against the objectives.', 'Test reports, tuned configuration'],
      ['Operation', 'The database goes live. Real users reveal real problems, and the evolution phase begins.', 'Production system'],
      ['Maintenance & evolution', 'Preventive, corrective and adaptive maintenance; access management; statistics; audits; changes for new requirements.', 'Change requests, new versions']
    ];
    let i = 1;
    const draw = () => {
      el.innerHTML = `<div class="w-cycle">${P.map((p, k) => `<button type="button" data-ph="${k}" class="${k === i ? 'on' : ''}"><span>${k + 1}</span>${p[0]}</button>`).join('<i>→</i>')}</div>
      <div class="w-card"><span class="w-label">Phase ${i + 1}: ${P[i][0]}</span><p>${P[i][1]}</p><p class="w-small"><b>Deliverables:</b> ${P[i][2]}</p></div>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-ph]'); if (b) { i = +b.dataset.ph; draw(); } });
    draw();
  };

  /* Ch10: lost update simulator */
  W.txn = el => {
    const noLock = [['T1', 'READ P_QOH', 35, null], ['T2', 'READ P_QOH', 35, null], ['T1', 'P_QOH = 35 + 100', 135, null], ['T2', 'P_QOH = 35 − 30', 5, null], ['T1', 'WRITE P_QOH', 135, 135], ['T1', 'COMMIT', null, 135], ['T2', 'WRITE P_QOH', 5, 5], ['T2', 'COMMIT', null, 5]];
    const lock = [['T1', 'LOCK X(PRODUCT row)', null, 35], ['T1', 'READ P_QOH', 35, 35], ['T2', 'REQUEST LOCK → WAIT ⏳', null, 35], ['T1', 'P_QOH = 35 + 100', 135, 35], ['T1', 'WRITE P_QOH', 135, 135], ['T1', 'COMMIT + UNLOCK', null, 135], ['T2', 'LOCK X granted', null, 135], ['T2', 'READ P_QOH', 135, 135], ['T2', 'P_QOH = 135 − 30', 105, 135], ['T2', 'WRITE P_QOH', 105, 105], ['T2', 'COMMIT + UNLOCK', null, 105]];
    let locking = false, step = 0;
    const draw = () => {
      const S = locking ? lock : noLock; const done = step >= S.length;
      let stored = 35; S.slice(0, step).forEach(s => { if (s[3] != null) stored = s[3]; });
      el.innerHTML = `<div class="w-head"><strong>Two clerks update stock at once</strong><label class="w-chip ${locking ? 'on' : ''}"><input type="checkbox" data-lock ${locking ? 'checked' : ''}> Exclusive locking</label></div>
      <p class="w-small">T1 receives 100 units; T2 sells 30. Start: P_QOH = 35. Correct final value: <b>105</b>.</p>
      <div class="w-txn"><div class="w-txhead"><span>Time</span><span>T1</span><span>T2</span><span>Stored</span></div>
      ${S.map((s, k) => `<div class="w-txrow ${k < step ? 'shown' : ''} ${k === step - 1 ? 'cur' : ''}"><span>t${k + 1}</span><span>${s[0] === 'T1' ? esc(s[1]) + (s[2] != null ? ` <b>${s[2]}</b>` : '') : ''}</span><span>${s[0] === 'T2' ? esc(s[1]) + (s[2] != null ? ` <b>${s[2]}</b>` : '') : ''}</span><span>${s[3] ?? ''}</span></div>`).join('')}</div>
      <div class="w-nav"><button type="button" data-tx="reset">↺ Reset</button><button type="button" data-tx="step" class="primary" ${done ? 'disabled' : ''}>Step ▸</button><button type="button" data-tx="all" ${done ? 'disabled' : ''}>Run all ▸▸</button><span class="w-meter">P_QOH = <b>${stored}</b></span></div>
      ${done ? `<p class="w-status ${stored === 105 ? 'good' : 'bad'}">${stored === 105 ? '✓ Serializable: locking made T2 wait, so both updates count.' : '✗ Lost update! T2 overwrote T1\'s write. 100 units vanished from the books.'}</p>` : ''}`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-tx]'); if (!b) return; const S = locking ? lock : noLock; if (b.dataset.tx === 'reset') step = 0; if (b.dataset.tx === 'step') step = Math.min(S.length, step + 1); if (b.dataset.tx === 'all') step = S.length; draw(); });
    el.addEventListener('change', e => { if (e.target.hasAttribute('data-lock')) { locking = e.target.checked; step = 0; draw(); } });
    draw();
  };

  /* Ch11: full scan vs index seek */
  W.scan = el => {
    const N = 48; const keys = Array.from({ length: N }, (_, i) => 10010 + i * 3);
    let target = keys[37], mode = 'scan', visited = [], found = -1, timer = null, n = 1e6;
    const reset = () => { clearInterval(timer); visited = []; found = -1; };
    const plan = () => {
      if (mode === 'scan') { const v = []; for (let i = 0; i < N; i++) { v.push(i); if (keys[i] === target) break; } return v; }
      const v = []; let lo = 0, hi = N - 1; while (lo <= hi) { const m = (lo + hi) >> 1; v.push(m); if (keys[m] === target) break; keys[m] < target ? lo = m + 1 : hi = m - 1; } return v;
    };
    const draw = () => {
      el.innerHTML = `<div class="w-head"><strong>Find CUS_CODE =</strong><select data-target>${keys.map(k => `<option ${k === target ? 'selected' : ''}>${k}</option>`).join('')}</select>${seg('sm', [['scan', 'Full table scan'], ['seek', 'Index seek (B-tree)']], mode)}<button type="button" class="w-go" data-go>Run ▸</button></div>
      <div class="w-cells">${keys.map((k, i) => `<span class="${i === found ? 'found' : visited.includes(i) ? 'seen' : ''}">${k}</span>`).join('')}</div>
      <p class="w-status">${found >= 0 ? `${mode === 'scan' ? 'Scan' : 'Seek'} found ${target} after <b>${visited.length}</b> comparisons.` : 'Pick a value and press Run.'}</p>
      <div class="w-card"><span class="w-label">At scale</span><label class="w-field">Rows in table <input type="range" min="3" max="9" step="1" value="${Math.log10(n)}" data-n> <b>${n.toLocaleString()}</b></label>
      <div class="w-bars"><div><span>Full scan (worst case)</span><i style="width:100%"></i><b>${n.toLocaleString()}</b></div><div><span>B-tree seek</span><i style="width:${Math.max(1.5, Math.log2(n) / n * 100)}%"></i><b>~${Math.ceil(Math.log2(n))}</b></div></div></div>`;
    };
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-sm]'); if (s) { mode = s.dataset.sm; reset(); draw(); return; }
      if (e.target.closest('[data-go]')) { reset(); const p = plan(); let i = 0; timer = setInterval(() => { visited.push(p[i]); if (keys[p[i]] === target) { found = p[i]; clearInterval(timer); } i++; draw(); }, mode === 'scan' ? 45 : 380); }
    });
    el.addEventListener('change', e => { if (e.target.matches('[data-target]')) { target = +e.target.value; reset(); draw(); } });
    el.addEventListener('input', e => { if (e.target.matches('[data-n]')) { n = 10 ** +e.target.value; draw(); } });
    draw();
  };

  /* Ch12: fragmentation */
  W.fragment = el => {
    const cols = ['CUS_CODE', 'CUS_LNAME', 'CUS_CITY', 'CUS_BALANCE'];
    const rows = [[10010, 'Ramirez', 'Austin', 0], [10011, 'Dunne', 'Seattle', 215.4], [10012, 'Smith', 'Austin', 345.86], [10013, 'Olowski', 'Miami', 536.75], [10014, 'Orlando', 'Portland', 0], [10015, 'Brown', 'Seattle', 89.3], [10016, 'Williams', 'Miami', 0], [10017, 'Farriss', 'Austin', 1022.1]];
    let m = 'h';
    const draw = () => {
      let sites;
      if (m === 'h') sites = ['Austin', 'Seattle', 'Miami', 'Portland'].map(c => [`Site ${c}`, cols, rows.filter(r => r[2] === c), `σ CUS_CITY='${c}'`]);
      else if (m === 'v') sites = [['Site Sales', [cols[0], cols[1], cols[2]], rows.map(r => [r[0], r[1], r[2]]), 'π CODE, LNAME, CITY'], ['Site Finance', [cols[0], cols[3]], rows.map(r => [r[0], r[3]]), 'π CODE, BALANCE']];
      else sites = [['Site A (primary)', cols, rows, 'full copy'], ['Site B (replica)', cols, rows, 'full copy, kept in sync']];
      el.innerHTML = `<div class="w-head"><strong>Distribute CUSTOMER</strong>${seg('fm', [['h', 'Horizontal'], ['v', 'Vertical'], ['r', 'Replicated']], m)}</div>
      <div class="w-sites">${sites.map(s => `<div class="w-site"><div class="w-sitehead">🖥️ ${s[0]}<small>${s[3]}</small></div>${tbl(s[1], s[2], { pk: [0] })}</div>`).join('')}</div>
      <p class="w-status">${{ h: 'Rows split by city: queries for Austin customers stay local. UNION ALL rebuilds the global table.', v: 'Columns split, and every fragment keeps the PK so a JOIN can rebuild each row.', r: 'Full replication: reads are fast and survive a site failure, but every write must reach every copy (mutual consistency).' }[m]}</p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-fm]'); if (b) { m = b.dataset.fm; draw(); } });
    draw();
  };

  /* Ch13: OLAP pivot */
  W.olap = el => {
    const regions = ['North', 'South', 'West'], cats = ['Tools', 'Paint', 'Hardware'], qs = ['Q1', 'Q2', 'Q3', 'Q4'];
    const facts = []; let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    regions.forEach(r => cats.forEach(c => qs.forEach(q => facts.push({ Region: r, Category: c, Quarter: q, Year: '2026', sales: Math.round(20 + rnd() * 80) * 10 }))));
    const dims = { Region: regions, Category: cats, Quarter: qs, Year: ['2026'] };
    let rowD = 'Region', colD = 'Quarter', slice = 'All';
    const draw = () => {
      const other = ['Region', 'Category', 'Quarter'].find(d => d !== rowD && d !== colD && !(colD === 'Year' && d === 'Quarter'));
      const F = facts.filter(f => slice === 'All' || !other || f[other] === slice);
      const cv = dims[colD], rv = dims[rowD];
      const sum = (r, c) => F.filter(f => (r == null || f[rowD] === r) && (c == null || f[colD] === c)).reduce((a, f) => a + f.sales, 0);
      const max = Math.max(...rv.flatMap(r => cv.map(c => sum(r, c))));
      el.innerHTML = `<div class="w-head"><strong>Sales cube</strong>
        <label class="w-field inline">Rows <select data-d="row">${['Region', 'Category'].map(d => `<option ${d === rowD ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
        <label class="w-field inline">Columns ${seg('col', [['Quarter', 'Quarter (drill down)'], ['Year', 'Year (roll up)']], colD)}</label>
        ${other ? `<label class="w-field inline">Slice ${other} <select data-d="slice"><option>All</option>${dims[other].map(v => `<option ${v === slice ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}</div>
      <div class="w-tablewrap"><table class="w-table pivot"><thead><tr><th>${rowD} ╲ ${colD}</th>${cv.map(c => `<th>${c}</th>`).join('')}<th>Total</th></tr></thead><tbody>
      ${rv.map(r => `<tr><th>${r}</th>${cv.map(c => { const v = sum(r, c); return `<td style="--h:${(v / max).toFixed(2)}">$${v.toLocaleString()}</td>`; }).join('')}<td><b>$${sum(r, null).toLocaleString()}</b></td></tr>`).join('')}
      <tr class="total"><th>Total</th>${cv.map(c => `<td><b>$${sum(null, c).toLocaleString()}</b></td>`).join('')}<td><b>$${sum(null, null).toLocaleString()}</b></td></tr></tbody></table></div>
      <p class="w-small">Equivalent SQL: <code>SELECT ${rowD.toUpperCase()}, ${colD.toUpperCase()}, SUM(SALES) FROM SALES_FACT JOIN … ${slice !== 'All' && other ? `WHERE ${other.toUpperCase()} = '${slice}' ` : ''}GROUP BY ${rowD.toUpperCase()}, ${colD.toUpperCase()};</code></p>`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-col]'); if (b) { colD = b.dataset.col; draw(); } });
    el.addEventListener('change', e => { if (e.target.dataset.d === 'row') { rowD = e.target.value; slice = 'All'; } if (e.target.dataset.d === 'slice') slice = e.target.value; draw(); });
    draw();
  };

  /* Ch14: relational vs document */
  W.docmodel = el => {
    let m = 'rel';
    const doc = { _id: 10011, name: { first: 'Leona', last: 'Dunne' }, city: 'Seattle', balance: 215.4, invoices: [{ number: 1002, date: '2026-01-16', lines: [{ product: { code: 'PT-500', descript: 'Interior paint, 1 gal' }, units: 2, price: 34.2 }] }, { number: 1004, date: '2026-01-18', lines: [{ product: { code: 'PT-510', descript: 'Exterior paint, 1 gal' }, units: 3, price: 41.9 }, { product: { code: 'BR-020', descript: 'Paint brush, 2 in' }, units: 4, price: 6.49 }] }] };
    const draw = () => {
      el.innerHTML = `<div class="w-head"><strong>Customer 10011 and their orders</strong>${seg('dm', [['rel', 'Relational (normalized)'], ['doc', 'Document (aggregate)']], m)}</div>
      ${m === 'rel' ? `<div class="w-grid-tables">${tbl(['CUS_CODE', 'CUS_LNAME', 'CUS_CITY'], [[10011, 'Dunne', 'Seattle']], { caption: 'CUSTOMER', pk: [0] })}${tbl(['INV_NUMBER', 'CUS_CODE', 'INV_DATE'], [[1002, 10011, '2026-01-16'], [1004, 10011, '2026-01-18']], { caption: 'INVOICE', pk: [0], fk: [1] })}${tbl(['INV_NUMBER', 'LINE', 'P_CODE', 'UNITS'], [[1002, 1, 'PT-500', 2], [1004, 1, 'PT-510', 3], [1004, 2, 'BR-020', 4]], { caption: 'LINE', pk: [0, 1], fk: [2] })}${tbl(['P_CODE', 'P_DESCRIPT'], [['PT-500', 'Interior paint'], ['PT-510', 'Exterior paint'], ['BR-020', 'Paint brush']], { caption: 'PRODUCT', pk: [0] })}</div>
      <p class="w-status">4 tables, 3 joins to rebuild the order history. No redundancy, and any question can be asked.</p>`
        : `<pre class="snip json">${esc(JSON.stringify(doc, null, 2))}</pre><p class="w-status">One read returns the whole aggregate: fast, and it shards easily by _id. But product descriptions are copied into every order, and "total sales per product" now means scanning every customer document.</p>`}`;
    };
    el.addEventListener('click', e => { const b = e.target.closest('[data-dm]'); if (b) { m = b.dataset.dm; draw(); } });
    draw();
  };

  /* Ch15: SQL injection (runs on a real in-browser SQLite db) */
  W.injection = el => {
    let user = 'kathy', pass = 'secret', param = false, db = null;
    const ensure = async () => { if (db) return db; const SQL = await window.loadSQL(); db = new SQL.Database(); db.run("CREATE TABLE USERS(USERNAME TEXT, PASSWORD TEXT, ROLE TEXT); INSERT INTO USERS VALUES ('kathy','s3cure!','clerk'),('leo','pa55word','manager'),('admin','Xy!9#qz','dba');"); return db; };
    const draw = async () => {
      const q = param ? 'SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?' : `SELECT * FROM USERS WHERE USERNAME = '${user}' AND PASSWORD = '${pass}'`;
      let rows = [], err = '';
      try { const d = await ensure(); if (param) { const st = d.prepare(q); st.bind([user, pass]); while (st.step()) rows.push(st.get()); st.free(); } else { const r = d.exec(q); rows = r[0] ? r[0].values : []; } } catch (x) { err = x.message; }
      const hot = !param && /'/.test(pass + user);
      el.querySelector('.w-out').innerHTML = `<pre class="snip ${hot ? 'danger' : ''}">${esc(q)}${param ? `\n-- parameters: [${esc(JSON.stringify(user))}, ${esc(JSON.stringify(pass))}]` : ''}</pre>
        ${err ? `<p class="w-status bad">SQL error: ${esc(err)}</p>` : rows.length ? `<p class="w-status ${rows.length > 1 || hot ? 'bad' : 'good'}">${rows.length > 1 || hot ? '🚨 Logged in without the password! Rows returned:' : '✓ Login OK'} </p>${tbl(['USERNAME', 'PASSWORD', 'ROLE'], rows)}` : '<p class="w-status good">Login rejected (0 rows).</p>'}`;
    };
    el.innerHTML = `<div class="w-head"><strong>Login form → SQL</strong>${seg('pm', [['0', 'String concatenation'], ['1', 'Parameterized']], '0')}</div>
      <div class="w-two"><label class="w-field">Username<input data-f="user" value="${user}"></label><label class="w-field">Password<input data-f="pass" value="${pass}"></label></div>
      <div class="w-chips"><button type="button" class="w-chip" data-attack>Try the attack: ' OR '1'='1</button></div><div class="w-out"><p class="w-small">Loading SQLite…</p></div>`;
    el.addEventListener('input', e => { const f = e.target.dataset.f; if (f) { f === 'user' ? user = e.target.value : pass = e.target.value; draw(); } });
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-pm]'); if (b) { param = b.dataset.pm === '1'; el.querySelectorAll('[data-pm]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); }
      if (e.target.closest('[data-attack]')) { pass = "' OR '1'='1"; el.querySelector('[data-f="pass"]').value = pass; draw(); }
    });
    draw();
  };

  /* Ch16: least privilege */
  W.roles = el => {
    const T = ['CUSTOMER', 'PRODUCT', 'INVOICE', 'LINE', 'EMPLOYEE'], A = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    const need = new Set(['CUSTOMER.SELECT', 'PRODUCT.SELECT', 'INVOICE.INSERT', 'LINE.INSERT', 'INVOICE.SELECT']);
    const g = new Set(['CUSTOMER.SELECT', 'EMPLOYEE.SELECT', 'PRODUCT.DELETE']);
    const draw = () => {
      const missing = [...need].filter(x => !g.has(x)), extra = [...g].filter(x => !need.has(x));
      el.innerHTML = `<div class="w-head"><strong>Role: SALES_CLERK</strong><span class="w-small">Job: look up customers & products, create invoices with lines, view invoices.</span></div>
      <div class="w-tablewrap"><table class="w-table matrix"><thead><tr><th></th>${A.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${T.map(t => `<tr><th>${t}</th>${A.map(a => { const k = t + '.' + a; const cls = g.has(k) ? (need.has(k) ? 'ok' : 'over') : (need.has(k) ? 'miss' : ''); return `<td class="${cls}"><input type="checkbox" aria-label="${a} on ${t}" data-p="${k}" ${g.has(k) ? 'checked' : ''}></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
      <pre class="snip">CREATE ROLE SALES_CLERK;\n${[...g].map(k => { const [t, a] = k.split('.'); return `GRANT ${a} ON ${t} TO SALES_CLERK;`; }).join('\n') || '-- no privileges'}</pre>
      <p class="w-status ${!missing.length && !extra.length ? 'good' : 'bad'}">${!missing.length && !extra.length ? '✓ Least privilege achieved: exactly what the job needs.' : `${missing.length ? `Missing: ${missing.join(', ')}. ` : ''}${extra.length ? `Over-privileged: ${extra.join(', ')}.` : ''}`}</p>`;
    };
    el.addEventListener('change', e => { const p = e.target.dataset.p; if (p) { e.target.checked ? g.add(p) : g.delete(p); draw(); } });
    draw();
  };

  window.WIDGETS = W;
  window.WIDGET_TITLES = { filesystem: 'Simulation: file system vs. database', abstraction: 'Explore: levels of data abstraction', keys: 'Interactive: key explorer', erd: 'Interactive: ER relationship builder', subtype: 'Interactive: subtype constraints', normalize: 'Step through: normalization', joins: 'Interactive: join visualizer', dblc: 'Explore: Database Life Cycle', txn: 'Simulation: concurrent transactions', scan: 'Simulation: table scan vs. index', fragment: 'Interactive: data fragmentation', olap: 'Interactive: OLAP cube', docmodel: 'Compare: relational vs. document', injection: 'Live demo: SQL injection', roles: 'Interactive: least-privilege matrix' };
})();
