/* Builds a studio-compatible storyboard for ONE lesson explainer ("why did the cascade cost five times more?") from the LLM
   Service Lab engine, so that every number a viewer hears or reads comes from tested code and not from typed text.
   Output format = the `Scene` model of ai-youtube-studio v0.6 (id, objective, narration, visual_type, expression,
   duration_seconds, sources). Nothing here installs, renders or calls a network service.
   Run: node video/build-storyboards.cjs     (writes video/out/cascade-cost.scenes.json and cascade-cost.script.md) */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const ctx = { console, setTimeout }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'llm-lab.js'), 'utf8'), ctx, { filename: 'llm-lab.js' });
const L = ctx.LLMLab;

const WORDS_PER_SECOND = 2.5;                              // 150 words per minute, a calm explainer pace
const fmtInt = n => n.toLocaleString('en-US');
const dollars = n => '$' + n.toFixed(4);

function facts() {
  const med = L.run({ model: 'medium' }), cas = L.run({ cascade: true });
  const m = med.metrics, c = cas.metrics;
  const traps = new Set(L.REQUESTS.filter(r => r.trap).map(r => r.id));
  const confidentWrong = cas.results.filter(x => !x.correct && traps.has(x.id)).length;
  return {
    requests: L.REQUESTS.length,
    medium: { quality: m.quality, cost: m.cost, p95: m.p95 },
    cascade: { quality: c.quality, cost: c.cost, p95: c.p95, escalations: c.escalations },
    confidentWrong,
    stayed: cas.results.filter(x => x.path === 'small').length,                 // answered by the small model alone (21)
    smallRight: cas.results.filter(x => x.path === 'small' && x.correct).length, // of those, correct (18)
    costRatio: Math.round(c.cost / m.cost * 10) / 10,       // about 5.1
    p95Ratio: Math.round(c.p95 / m.p95 * 10) / 10            // about 2.7
  };
}

function scenes(f) {
  const S = [
    { id: 'title', visual_type: 'text', objective: 'Why did the cascade cost five times more?',
      narration: 'A cascade tries a cheap model first and only calls the big one when needed. It sounds like a sure way to save money. So why did it cost about five times more than simply using the medium model?' },
    { id: 'setup', visual_type: 'flow', objective: 'Request, small model, large model if unsure',
      narration: `Here is the setup. Every one of ${f.requests} requests goes to the small model first. If the small model is confident, we stop. If it is unsure, we send the request on to the large model, and we pay for both.` },
    { id: 'medium', visual_type: 'text', objective: `Medium model alone: ${f.medium.quality}% correct, ${dollars(f.medium.cost)}`,
      narration: `Start with the medium model on its own. It answers ${f.medium.quality} percent of the requests correctly, for a total of ${dollars(f.medium.cost)}, and 19 out of 20 requests finish within ${fmtInt(f.medium.p95)} milliseconds.` },
    { id: 'cascade', visual_type: 'text', objective: `Cascade: ${f.cascade.quality}% correct, ${dollars(f.cascade.cost)}`,
      narration: `Now the cascade. Its quality is the same, ${f.cascade.quality} percent. But the cost is ${dollars(f.cascade.cost)}, about ${f.costRatio} times more, and 19 out of 20 requests need up to ${fmtInt(f.cascade.p95)} milliseconds, about ${f.p95Ratio} times longer.` },
    { id: 'why', visual_type: 'text', objective: `${f.cascade.escalations} of ${f.requests} requests paid for both models`,
      narration: `The reason is in the logs. ${f.cascade.escalations} of the ${f.requests} requests were too hard for the small model, so each of them paid for the small model's attempt and then for the large model as well.` },
    { id: 'trap', visual_type: 'text', objective: `${f.confidentWrong} confident wrong answers slipped through`,
      narration: `There is a second problem. ${f.confidentWrong} requests were answered wrongly by the small model, and it was confident, so the cascade had no way to know and never escalated them.` },
    { id: 'lesson', visual_type: 'text', objective: 'Right-size first. Cascade only if most requests are easy.',
      narration: 'The lesson is to right-size first. A cascade only pays off when the cheap model can handle most of your traffic. Measure your own traffic before you build one, and then try the experiment yourself.' }
  ];
  return S.map(s => {
    const words = s.narration.trim().split(/\s+/).length;
    return Object.assign({ expression: null, code: null, sources: ['LLM Service Lab (assets/llm-lab.js)'] }, s, { duration_seconds: Math.round((words / WORDS_PER_SECOND + 2) * 10) / 10 });
  });
}

function build() {
  const f = facts(), S = scenes(f);
  return {
    topic: 'Why did the cascade cost five times more?', audience: 'Learners of the LLM Engineering course', source: 'LLM Service Lab engine', facts: f, scenes: S,
    total_seconds: Math.round(S.reduce((a, s) => a + s.duration_seconds, 0)),
    // Honest compatibility record for ai-youtube-studio v0.6: the Scene format fits, a whole Project does not (yet).
    studio_compatibility: { scene_format: 'fits (8 fixed visual types, text objective shown up to 100 characters)', project_config_min_seconds: 300, fits_project_config: false,
      missing_templates: ['bars (cost / latency comparison)', 'flow with custom labels (small model, large model)'] }
  };
}
function markdown(b) {
  return `# ${b.topic}\n\n_Generated from the LLM Service Lab engine. About ${b.total_seconds} seconds at a calm pace._\n\n` +
    b.scenes.map((s, i) => `## Scene ${i + 1}: ${s.id} (${s.visual_type}, ${s.duration_seconds}s)\n**On screen:** ${s.objective}\n\n**Narration:** ${s.narration}\n`).join('\n');
}

/* Variant for the PROPOSED lesson templates (video/proposed/lesson-templates.patch): the same story, but cost and latency are
   drawn as bars (values straight from the engine), the setup flow is labelled, and every scene carries a duration that follows
   its narration. It needs the patched studio; the v0.6 studio would reject `data`. */
function buildLessonTemplates() {
  const base = build(), f = base.facts, by = Object.fromEntries(base.scenes.map(s => [s.id, s]));
  const bar = (title, unit, a, b) => ({ title, unit, bars: [{ label: 'Medium model', value: a }, { label: 'Cascade', value: b }] });
  const timed = s => Object.assign({}, s, { duration_seconds: Math.round((s.narration.trim().split(/\s+/).length / WORDS_PER_SECOND + 2) * 10) / 10 });
  const S = [
    by.title,
    Object.assign({}, by.setup, { data: { labels: ['Request', 'Small model', 'Large model'] } }),
    { id: 'medium', visual_type: 'bars', objective: `Quality: ${f.medium.quality}% and ${f.cascade.quality}%`, expression: null, code: null, sources: by.cascade.sources,
      data: bar('Share answered correctly', '%', f.medium.quality, f.cascade.quality),
      narration: `Start with quality. The medium model answers ${f.medium.quality} percent of the requests correctly. The cascade reaches exactly the same ${f.cascade.quality} percent, so on quality alone it looks like a fair swap.` },
    { id: 'cost', visual_type: 'bars', objective: `Cost: ${dollars(f.medium.cost)} against ${dollars(f.cascade.cost)}`, expression: null, code: null, sources: by.cascade.sources,
      data: bar('Total cost of 40 requests', '$', f.medium.cost, f.cascade.cost),
      narration: `Now the price. The cascade costs ${dollars(f.cascade.cost)}, about ${f.costRatio} times more than the medium model's ${dollars(f.medium.cost)}, for the same quality.` },
    { id: 'latency', visual_type: 'bars', objective: `Latency for 19 of 20 requests: ${fmtInt(f.medium.p95)} against ${fmtInt(f.cascade.p95)} milliseconds`, expression: null, code: null, sources: by.cascade.sources,
      data: bar('Time for 19 of 20 requests', 'ms', f.medium.p95, f.cascade.p95),
      narration: `It is slower too. With the cascade, 19 out of 20 requests need up to ${fmtInt(f.cascade.p95)} milliseconds, against ${fmtInt(f.medium.p95)} for the medium model, about ${f.p95Ratio} times longer.` },
    { id: 'why', visual_type: 'bars', objective: `${f.cascade.escalations} of ${f.requests} requests paid for both models`, expression: null, code: null, sources: by.cascade.sources,
      data: { title: 'Where each request was answered', unit: '', bars: [{ label: 'Small model alone', value: f.stayed }, { label: 'Escalated to large', value: f.cascade.escalations }] },
      narration: `The reason is in the logs. ${f.cascade.escalations} of the ${f.requests} requests were too hard for the small model, so each of them paid for the small model's attempt and then for the large model as well. Only ${f.stayed} stopped at the small model.` },
    { id: 'trap', visual_type: 'bars', objective: `${f.confidentWrong} confident wrong answers slipped through`, expression: null, code: null, sources: by.cascade.sources,
      data: { title: 'The ' + f.stayed + ' requests the small model kept', unit: '', bars: [{ label: 'Confident and right', value: f.smallRight }, { label: 'Confident and wrong', value: f.confidentWrong }] },
      narration: `There is a second problem. The small model kept ${f.stayed} requests. ${f.smallRight} were right, but ${f.confidentWrong} were wrong, and it was confident, so the cascade had no way to know and never escalated them.` },
    Object.assign({}, by.lesson, { visual_type: 'flow', data: { labels: ['Measure traffic', 'Right-size first', 'Cascade if easy'] } })
  ].map(timed);
  return Object.assign({}, base, { variant: 'lesson-templates', scenes: S, total_seconds: Math.round(S.reduce((a, s) => a + s.duration_seconds, 0)),
    studio_compatibility: { scene_format: 'needs video/proposed/lesson-templates.patch (bars, labelled flow, duration_seconds)', project_config_min_seconds: 300, fits_project_config: false, missing_templates: [] } });
}

if (require.main === module) {
  const b = build(), out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'cascade-cost.scenes.json'), JSON.stringify(b, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'cascade-cost.script.md'), markdown(b));
  const v = buildLessonTemplates();
  fs.writeFileSync(path.join(out, 'cascade-cost.lesson-templates.scenes.json'), JSON.stringify(v, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'cascade-cost.lesson-templates.script.md'), markdown(v));
  console.log(`wrote video/out/cascade-cost.lesson-templates.scenes.json: ${v.scenes.length} scenes, about ${v.total_seconds} s`);
  console.log(`wrote video/out/cascade-cost.scenes.json and cascade-cost.script.md: ${b.scenes.length} scenes, about ${b.total_seconds} s`);
}
module.exports = { build, buildLessonTemplates, facts, markdown };
