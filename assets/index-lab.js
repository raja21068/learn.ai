/* Index Lab: an experiment for the Databases course that runs on the REAL SQLite engine already used by the SQL labs
   (sql.js, loaded by window.loadSQL). A generated table of 4,000 orders and 500 customers is queried eight ways. The learner
   chooses which indexes to create, and the lab shows SQLite's own EXPLAIN QUERY PLAN for every query, how many rows each
   query returns, and what every extra index costs on writes. Nothing is random (the data come from arithmetic), so the same
   indexes always give the same plans on the same SQLite version. Plans are classified by pattern; only the classification
   is used, never timing, because timing is not repeatable. */
(() => {
  'use strict';
  const SETUP = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, country TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, region TEXT, created TEXT, total REAL, note TEXT);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 500)
INSERT INTO customers SELECT i, 'Customer ' || i, CASE i % 10 WHEN 0 THEN 'NO' WHEN 1 THEN 'SE' WHEN 2 THEN 'DK' WHEN 3 THEN 'FI' WHEN 4 THEN 'DE' WHEN 5 THEN 'FR' WHEN 6 THEN 'ES' WHEN 7 THEN 'IT' WHEN 8 THEN 'PL' ELSE 'NL' END FROM n;
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 4000)
INSERT INTO orders SELECT i, (i * 37) % 500 + 1,
  CASE i % 4 WHEN 0 THEN 'new' WHEN 1 THEN 'paid' WHEN 2 THEN 'shipped' ELSE 'returned' END,
  CASE i % 3 WHEN 0 THEN 'EU' WHEN 1 THEN 'US' ELSE 'APAC' END,
  date('2024-01-01', '+' || (i % 365) || ' days'), ((i * 7919) % 50000) / 100.0,
  CASE WHEN i % 50 = 0 THEN 'late delivery' ELSE 'ok' END FROM n;`;

  const QUERIES = [
    { id: 1, label: 'All orders of one customer', sql: "SELECT * FROM orders WHERE customer_id = 42" },
    { id: 2, label: 'All shipped orders (a quarter of the table)', sql: "SELECT * FROM orders WHERE status = 'shipped'" },
    { id: 3, label: 'Orders in one week (a range)', sql: "SELECT * FROM orders WHERE created >= '2024-03-01' AND created < '2024-03-08'" },
    { id: 4, label: 'Orders in March, written with a function on the column', sql: "SELECT * FROM orders WHERE substr(created, 1, 7) = '2024-03'" },
    { id: 5, label: 'EU orders that are paid, oldest first', sql: "SELECT * FROM orders WHERE region = 'EU' AND status = 'paid' ORDER BY created" },
    { id: 6, label: 'Orders whose note mentions "late" anywhere', sql: "SELECT * FROM orders WHERE note LIKE '%late%'" },
    { id: 7, label: 'Customer 42: only customer_id and total', sql: "SELECT customer_id, total FROM orders WHERE customer_id = 42" },
    { id: 8, label: 'Revenue per Norwegian customer (a join)', sql: "SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.country = 'NO' GROUP BY c.id" }
  ];
  const INDEXES = [
    { id: 'A', name: 'idx_cust', table: 'orders', cols: ['customer_id'] },
    { id: 'B', name: 'idx_status', table: 'orders', cols: ['status'] },
    { id: 'C', name: 'idx_created', table: 'orders', cols: ['created'] },
    { id: 'D', name: 'idx_region_status_created', table: 'orders', cols: ['region', 'status', 'created'] },
    { id: 'E', name: 'idx_status_region', table: 'orders', cols: ['status', 'region'] },
    { id: 'F', name: 'idx_cust_total', table: 'orders', cols: ['customer_id', 'total'] },
    { id: 'G', name: 'idx_note', table: 'orders', cols: ['note'] },
    { id: 'H', name: 'idx_country', table: 'customers', cols: ['country'] }
  ];
  const ddl = ix => `CREATE INDEX ${ix.name} ON ${ix.table}(${ix.cols.join(', ')})`;

  function classify(lines) {
    return {
      lines,
      scansOrders: lines.some(l => /^SCAN (orders|o)\b/.test(l)),                 // reads every row, with or without an index
      indexScan: lines.some(l => /^SCAN (orders|o) USING/.test(l)),                // walks the whole index in order: sorted, but still every row
      sorts: lines.some(l => /USE TEMP B-TREE FOR ORDER BY/.test(l)),
      covering: lines.some(l => /USING COVERING INDEX/.test(l)),
      indexed: lines.some(l => /^SEARCH .* USING (COVERING )?INDEX/.test(l))
    };
  }
  /* Runs the whole experiment on a fresh in-memory database. `selected` is a list of index ids. */
  function analyze(SQL, selected) {
    const db = new SQL.Database();
    try {
      db.exec(SETUP);
      INDEXES.filter(ix => selected.includes(ix.id)).forEach(ix => db.exec(ddl(ix)));
      const total = db.exec('SELECT COUNT(*) FROM orders')[0].values[0][0];
      const queries = QUERIES.map(q => {
        const lines = db.exec('EXPLAIN QUERY PLAN ' + q.sql)[0].values.map(r => String(r[3]));
        return Object.assign({ id: q.id, rows: db.exec('SELECT COUNT(*) FROM (' + q.sql + ')')[0].values[0][0], of: total }, classify(lines));
      });
      const ordersIndexes = INDEXES.filter(ix => selected.includes(ix.id) && ix.table === 'orders').length;
      const m = { indexes: selected.length, scans: queries.filter(q => q.scansOrders).length, sorts: queries.filter(q => q.sorts).length, covering: queries.filter(q => q.covering).length, writeStructures: 1 + ordersIndexes };
      return { selected: selected.slice().sort(), queries, metrics: m };
    } finally { db.close(); }
  }
  const GOAL = { text: 'at most 3 indexes, no sorting, and no more than 3 queries that read the whole orders table', test: m => m.indexes <= 3 && m.sorts === 0 && m.scans <= 3 };

  window.IndexLab = { SETUP, QUERIES, INDEXES, classify, analyze, GOAL, ddl };

  /* ---------------- widget ---------------- */
  const W = window.WIDGETS || (window.WIDGETS = {});
  const T = window.WIDGET_TITLES || (window.WIDGET_TITLES = {});
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  T.indexlab = 'Experiment: which indexes does SQLite actually use?';
  W.indexlab = el => {
    let selected = [], log = [], SQLmod = null, result = null, error = '';
    const badge = q => q.indexScan ? '<span class="il-badge scan">scans the whole index</span>' : q.scansOrders ? '<span class="il-badge scan">full scan</span>' : q.covering ? '<span class="il-badge cover">covering index</span>' : q.indexed ? '<span class="il-badge seek">index seek</span>' : '<span class="il-badge">other</span>';
    const draw = () => {
      const m = result && result.metrics;
      el.innerHTML = `<fieldset class="il-indexes"><legend>Indexes to create (each is rebuilt from scratch on every change)</legend>${INDEXES.map(ix => `<label class="w-chip ${selected.includes(ix.id) ? 'on' : ''}"><input type="checkbox" data-ix="${ix.id}" ${selected.includes(ix.id) ? 'checked' : ''}> <code>${esc(ix.table)}(${esc(ix.cols.join(', '))})</code></label>`).join('')}</fieldset>
      ${error ? `<p class="err">⚠ ${esc(error)}</p>` : !SQLmod ? '<p class="w-small">Loading SQLite…</p>' : ''}
      ${m ? `<div class="ag-stats ar-stats"><div class="${m.scans <= 3 ? 'good' : 'bad'}"><b>${m.scans}</b><small>queries scan all of orders</small></div><div class="${m.sorts === 0 ? 'good' : 'bad'}"><b>${m.sorts}</b><small>queries sort in a temporary b-tree</small></div><div><b>${m.covering}</b><small>answered from the index alone</small></div><div><b>${m.indexes}</b><small>indexes created</small></div><div><b>${m.writeStructures}</b><small>structures an INSERT into orders must update</small></div></div>
        <ol class="il-queries">${result.queries.map((q, i) => `<li><div class="il-head"><b>${esc(QUERIES[i].label)}</b> ${badge(q)}${q.sorts ? '<span class="il-badge sort">sort</span>' : ''}</div><code class="il-sql">${esc(QUERIES[i].sql)}</code><div class="w-small">returns ${q.rows.toLocaleString('en-US')} rows${QUERIES[i].id === 8 ? '' : ` (${(q.rows / q.of * 100).toFixed(1)}% of the orders table)`}</div><ul class="il-plan">${q.lines.map(l => `<li><code>${esc(l)}</code></li>`).join('')}</ul></li>`).join('')}</ol>
        <p class="w-status ${GOAL.test(m) ? 'good' : 'warn'}">${GOAL.test(m) ? '✓ Goal met: ' : 'Goal not met yet: '}${esc(GOAL.text)}.</p>
        <div class="w-nav"><button type="button" class="primary" data-log>Add this design to the log</button><button type="button" data-clear ${log.length ? '' : 'disabled'}>Clear log</button></div>` : ''}
      ${log.length ? `<div class="w-tablewrap"><table class="w-table ar-log"><thead><tr><th>#</th><th>Indexes</th><th>Full scans</th><th>Sorts</th><th>Covering</th></tr></thead><tbody>${log.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.selected.map(id => INDEXES.find(x => x.id === id).name).join(', ') || 'none')}</td><td>${r.metrics.scans}</td><td class="${r.metrics.sorts ? 'no' : ''}">${r.metrics.sorts}</td><td>${r.metrics.covering}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
    };
    const refresh = () => { if (!SQLmod) return; try { result = analyze(SQLmod, selected); error = ''; } catch (e) { error = e.message; } draw(); };
    el.addEventListener('change', e => { const c = e.target.closest('[data-ix]'); if (!c) return; selected = c.checked ? selected.concat(c.dataset.ix) : selected.filter(x => x !== c.dataset.ix); refresh(); const n = el.querySelector(`[data-ix="${c.dataset.ix}"]`); if (n) n.focus(); });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-log]') && result) { log.push(result); log = log.slice(-8); draw(); const n = el.querySelector('[data-log]'); if (n) n.focus(); }
      else if (e.target.closest('[data-clear]')) { log = []; draw(); }
    });
    draw();
    if (typeof window.loadSQL !== 'function') { error = 'The SQL engine is not available on this page.'; draw(); return; }
    window.loadSQL().then(SQL => { SQLmod = SQL; refresh(); }, e => { error = 'Could not load SQLite (' + e.message + '). The SQL labs need the same engine, so check your connection.'; draw(); });
  };
})();
