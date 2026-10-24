/* Three escalating, task-specific hints before an explicit reveal. No external AI service required.
     1. Concept hint        - authored per task in hints-bank.js (the key idea, no code)
     2. Where to work       - generated from the task's starter (its TODO markers / the SQL clauses involved)
     3. Outline of solution - generated from the task's solution with the details masked out */
(() => {
  'use strict';
  const strip = html => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const uniq = a => a.filter((x, i) => a.indexOf(x) === i);

  /* ---------------- Python ---------------- */
  function pyWhere(starter, solution) {
    const items = []; let fn = null;
    for (const raw of String(starter).split('\n')) {
      const d = raw.match(/^\s*(?:def|class)\s+(\w+)/); if (d) fn = d[1];
      const i = raw.indexOf('TODO'); if (i < 0) continue;
      const text = raw.slice(i + 4).replace(/^[:\s-]+/, '').trim() || 'complete this step';
      items.push((fn ? 'in ' + fn + '(): ' : '') + text);
    }
    if (items.length) return items.slice(0, 4).map((t, k) => (k + 1) + ') ' + t).join('   ');
    const defs = uniq([...String(solution).matchAll(/^\s*(?:def|class)\s+(\w+)/gm)].map(m => m[1]));
    return defs.length ? 'Write ' + defs.slice(0, 5).join(', ') + '. Run your code after each one.' : 'Complete the starter one step at a time, running it after each change.';
  }
  function pyOutline(solution) {
    const out = [];
    for (const raw of String(solution).split('\n')) {
      if (!raw.trim()) continue;
      const t = raw.trim(), ind = raw.match(/^\s*/)[0], line = raw.replace(/\s+$/, '');
      let next;
      if (/^(import|from)\b/.test(t)) continue;
      else if (/^(def|class|for|while|if|elif|else|try|except|finally|with)\b/.test(t) || t.startsWith('@')) next = line;
      else if (/^return\b/.test(t)) next = ind + 'return …';
      else if (/^(yield|raise|break|continue)\b/.test(t)) next = line;
      else next = ind + '…';
      if (next.trim() === '…' && out.length && out[out.length - 1] === next) continue;
      out.push(next);
    }
    return 'Outline of a worked solution (details hidden):\n' + out.join('\n');
  }

  /* ---------------- SQL ---------------- */
  const CLAUSE = /\b(CREATE\s+(?:TABLE|VIEW|TRIGGER|INDEX)|INSERT\s+INTO|UPDATE|BEGIN|COMMIT|ROLLBACK|EXPLAIN\s+QUERY\s+PLAN|SELECT|FROM|(?:LEFT\s+|INNER\s+)?JOIN|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|UNION\s+ALL|OVER|DISTINCT)\b/gi;
  function sqlWhere(solution) {
    const clauses = uniq([...String(solution).matchAll(CLAUSE)].map(m => m[1].toUpperCase().replace(/\s+/g, ' ')));
    const tables = uniq([...String(solution).matchAll(/\b(?:FROM|JOIN|INTO|UPDATE|TABLE|VIEW|ON)\s+([A-Za-z_]\w*)/gi)].map(m => m[1]).filter(x => !/^(AS|SELECT|SET|WHERE)$/i.test(x)));
    return 'Plan the statement: ' + (tables.length ? 'tables / objects involved: ' + tables.slice(0, 5).join(', ') + '. ' : '') +
      (clauses.length ? 'Building blocks, in order: ' + clauses.join(' → ') + '.' : 'Start with SELECT … FROM.');
  }
  // Clauses whose contents are masked, and the keywords that end each one (tracked at the same parenthesis depth).
  const OPEN = [
    ['SELECT', /^SELECT\b/i, ['FROM']],
    ['ON', /^ON\b/i, ['JOIN', 'LEFT', 'INNER', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'UNION']],
    ['WHERE', /^WHERE\b/i, ['GROUP BY', 'HAVING', 'ORDER BY', 'UNION', 'LIMIT', 'END']],
    ['GROUP BY', /^GROUP\s+BY\b/i, ['HAVING', 'ORDER BY', 'UNION']],
    ['HAVING', /^HAVING\b/i, ['ORDER BY', 'UNION']],
    ['ORDER BY', /^ORDER\s+BY\b/i, ['UNION', 'LIMIT']],
    ['SET', /^SET\b/i, ['WHERE', 'END']]
  ];
  const wordStart = (s, i) => i === 0 || /\W/.test(s[i - 1]);
  function maskSql(s) {
    let out = '', i = 0;
    while (i < s.length) {
      let hit = null;
      if (wordStart(s, i)) for (const o of OPEN) { const m = s.slice(i).match(o[1]); if (m) { hit = [o, m[0]]; break; } }
      // "ON" only counts as a join condition when it follows "JOIN <table> [alias]".
      if (hit && hit[0][0] === 'ON' && !/\bJOIN\s+\w+(\s+(AS\s+)?\w+)?\s*$/i.test(out)) hit = null;
      if (!hit) { out += s[i++]; continue; }
      const [o, kw] = hit; out += o[0] + ' … '; i += kw.length;
      let d = 0;
      while (i < s.length) {
        const c = s[i];
        if (c === ';' && d === 0) break;
        if (c === '(') d++;
        if (c === ')') { if (d === 0) break; d--; }
        if (d === 0 && wordStart(s, i) && o[2].some(t => new RegExp('^' + t.replace(' ', '\\s+') + '\\b', 'i').test(s.slice(i)))) break;
        i++;
      }
    }
    return out;
  }
  function sqlOutline(solution) {
    let s = String(solution).replace(/\s+/g, ' ').trim();
    s = s.replace(/\bBEGIN\b(?!\s*(?:TRANSACTION\s*)?;)([\s\S]*?)\bEND\b/gi, 'BEGIN … END');
    s = s.replace(/\bVALUES\s*\([^)]*\)/gi, 'VALUES (…)');
    s = maskSql(s);
    s = s.replace(/(\bCREATE\s+TABLE\s+\w+\s*)\(([\s\S]*)\)(?=\s*;|\s*$)/gi, '$1(…)');
    s = s.replace(/(\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+\w+\s+ON\s+\w+\s*)\([^)]*\)/gi, '$1(…)');
    s = s.replace(/\s{2,}/g, ' ').replace(/\s+;/g, ';').replace(/;\s*/g, ';\n').trim();
    return 'Outline of a worked solution (details hidden):\n' + s;
  }

  function hints(task, language, key) {
    if (Array.isArray(task.hints) && task.hints.length >= 3) return task.hints.slice(0, 3);
    const solution = String(task.solution || ''), starter = String(task.starter || '');
    const bank = (window.HINT_BANK || {})[key];
    const first = bank || (language === 'sql'
      ? 'Restate the requested output: which columns and rows should your query produce? Check column names in the Schema tab.'
      : 'Identify the function inputs and the expected output, and predict one small test case by hand before coding.');
    return language === 'sql'
      ? [first, sqlWhere(solution), sqlOutline(solution)]
      : [first, pyWhere(starter, solution), pyOutline(solution)];
  }
  window.LearningHints = { hints, strip };
})();
