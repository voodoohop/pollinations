/* LLM Voice Lab — detect, compare, guess and strip the machine voice.
   Quest #19180 · "An app, tool or agent about the LLM voice"
   Credit Pollinations — Made with pollinations.ai */

const APP_KEY = 'pk_lT4to0x2XzMoK8f1';

const MODELS = {
  deep: 'openai/gpt-5.4-nano',        // deep style analysis
  rewrite: [
    'openai/gpt-5.4',
    'deepseek/deepseek-v4.1-flash',
    'x-ai/grok-4.6',
  ],                                   // voice compare trio
  jury: 'mistralai/mistral-large-3',   // compare jury
  deslop: 'openai/gpt-5.4',           // deslopper
  game: [                              // human-or-model generators
    'openai/gpt-5.4-nano',
    'z-ai/glm-5.3-flash',
    'minimax/minimax-m3.1-flash',
    'deepseek/deepseek-v4-flash',
    'mistralai/mistral-large-3',
  ],
};

/* ================================================================== */
/* Part 1 — local voice heuristics (no API)                            */
/* ================================================================== */

/**
 * A marker spec. Each marker contributes points to a 0-100 score.
 * count: raw occurrences; rate: count per 1000 words (normalized).
 */
const MARKER_SPECS = [
  {
    id: 'emdashes', name: 'Em-dash density',
    why: 'Models chain em-dashes like punctuation confetti — humans use them sparingly.',
    weight: 14, unit: 'rate', per1000: 3,
    count: (t) => (t.match(/—|--/g) || []).length,
  },
  {
    id: 'notjustbut', name: '"not just X, but Y"',
    why: 'The tell-tale contrast construction. Fowler flags it as pure LLM cadence.',
    weight: 12, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /not just\b[^\n.!?]{0,60}?\bbut\b/gi),
    quoteRe: /not just\b[^\n.!?]{0,60}?\bbut\b[^.!?]{0,40}/gi,
  },
  {
    id: 'ruleofthree', name: 'Rule-of-three lists',
    why: '"word, word, and word" — the rhythm models reach for when padding a sentence.',
    weight: 12, unit: 'rate', per1000: 2,
    count: (t) => countMatches(t, /\b\w+(?:ing|ly|ed|es|s)?\s*,\s*\w+(?:ing|ly|ed|es|s)?\s*,\s+and\s+\w+/gi),
    quoteRe: /\b\w+\s*,\s*\w+\s*,\s+and\s+\w+[^.,;]{0,30}/gi,
  },
  {
    id: 'metaphor', name: 'Tapestry / weave / landscape metaphors',
    why: '"a rich tapestry", "the ever-evolving landscape" — clichéd extended metaphors, the load-bearing tapestries.',
    weight: 16, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\b(tapestr\w+|weav\w+|woven|landscape|journey|embark\w*|delv\w+)\b/gi),
    quoteRe: /[^.!?]{0,50}\b(tapestr\w+|weav\w+|woven|landscape|journey|embark\w*|delv\w+)\b[^.!?]{0,50}/gi,
  },
  {
    id: 'connector', name: 'Moreover / furthermore connective spine',
    why: 'Essay scaffolding connectives nobody uses out loud.',
    weight: 10, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\b(moreover|furthermore|additionally|in conclusion|to conclude|in summary|ultimately)\b/gi),
    quoteRe: /[^.!?]{0,40}\b(moreover|furthermore|additionally|in conclusion|to conclude|in summary|ultimately)\b[^.!?]{0,40}/gi,
  },
  {
    id: 'importantnote', name: '"It\'s important to note" filler',
    why: 'Importance asserted, never demonstrated. Classic hedged filler.',
    weight: 10, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\b(it'?s important to note|it is worth noting|worth mentioning that|importantly,)\b/gi),
    quoteRe: /[^.!?]{0,40}\b(it'?s important to note|it is worth noting|worth mentioning that|importantly,)\b[^.!?]{0,50}/gi,
  },
  {
    id: 'dayend', name: '"At the end of the day" / "in today\'s world"',
    why: 'Deadline-cliché framing and rapidly-evolving-world openers.',
    weight: 8, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\bat the end of the day\b|\bin today'?s (world|digital age|fast-paced|rapidly evolving)\b|\bin the ever-evolving\b/gi),
    quoteRe: /[^.!?]{0,40}\b(at the end of the day|in today'?s (world|digital age|fast-paced|rapidly evolving)[^.!?]*|in the ever-evolving[^.!?]*)\b[^.!?]{0,40}/gi,
  },
  {
    id: 'hedge', name: 'Hedging ("arguably", "to some extent")',
    why: 'Smoothness insurance: never commit, never sound wrong.',
    weight: 8, unit: 'rate', per1000: 2,
    count: (t) => countMatches(t, /\b(arguably|to some extent|in many ways|generally speaking|it could be said|one could argue)\b/gi),
    quoteRe: /[^.!?]{0,35}\b(arguably|to some extent|in many ways|generally speaking|it could be said|one could argue)\b[^.!?]{0,35}/gi,
  },
  {
    id: 'crucial', name: '"plays a crucial role"',
    why: 'Corporate jargon: things never matter, they play crucial roles.',
    weight: 10, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\bplays? (?:a|an) \w* (?:crucial|vital|pivotal|key|significant) role\b|\bcrucial role\b/gi),
    quoteRe: /[^.!?]{0,45}\b(plays? (?:a|an) \w* (?:crucial|vital|pivotal|key|significant) role|crucial role)\b[^.!?]{0,45}/gi,
  },
  {
    id: 'navigate', name: '"navigate the complexities"',
    why: 'The compass cliché: nobody navigates complexities like a model does.',
    weight: 10, unit: 'count', threshold: 1,
    count: (t) => countMatches(t, /\bnavigat\w+ (?:the |this |these )?(?:complexit\w+|challenges|nuances|landscape|terrain)\b|\bnavigating the\b/gi),
    quoteRe: /[^.!?]{0,45}\bnavigat\w+[^.!?]{0,60}/gi,
  },
  {
    id: 'rhythm', name: 'Uniform sentence rhythm',
    why: 'Low variance in sentence length: the metronome effect. Humans are clunky, models are even.',
    weight: 14, unit: 'special',
  },
  {
    id: 'boldhdr', name: 'Bold / header density',
    why: 'Chunky **bold** every few lines and headers for three-sentence sections: SEO formatting instinct.',
    weight: 10, unit: 'rate', per1000: 8,
    count: (t) => countMatches(t, /\*\*[^*\n]+\*\*|(^|\n)#{1,4}\s+\S/g),
  },
];

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

/** Collect up to `max` example quotes for a marker. */
function collectQuotes(text, quoteRe, max = 3) {
  if (!quoteRe) return [];
  const out = [];
  let m;
  const re = new RegExp(quoteRe.source, quoteRe.flags.includes('g') ? quoteRe.flags : quoteRe.flags + 'g');
  while ((m = re.exec(text)) !== null && out.length < max) {
    out.push(m[0].replace(/\s+/g, ' ').trim().slice(0, 110));
  }
  return out;
}

/** Split into sentences (rough). */
function splitSentences(text) {
  return text
    .replace(/\*\*/g, '')
    .split(/(?<=[.!?])\s+(?=[A-Z"“(])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * Scan text locally. Returns { score, markers: [{spec, count, rate, points, quotes}], words, sents, rhythm }.
 */
function scanVoice(text) {
  const words = (text.match(/\S+/g) || []).length;
  const kWords = Math.max(words / 1000, 0.001);
  const sents = splitSentences(text);
  const lens = sents.map((s) => (s.match(/\S+/g) || []).length).filter((n) => n > 0);
  const rhythm = stdev(lens);

  const markers = [];
  let score = 0;

  for (const spec of MARKER_SPECS) {
    let count = 0;
    let quotes = [];
    let points = 0;

    if (spec.unit === 'special' && spec.id === 'rhythm') {
      // Uniform rhythm: needs enough sentences to judge.
      const eligible = lens.length >= 4;
      if (eligible && rhythm < 6.5) {
        count = 1;
        points = spec.weight;
        quotes = [sents.map((s) => (s.match(/\S+/g) || []).length).join(', ') + ' words per sentence (σ=' + rhythm.toFixed(1) + ')'];
      }
    } else {
      count = spec.count(text);
      if (spec.unit === 'rate') {
        const rate = count / kWords;
        if (rate > spec.per1000) {
          points = Math.min(spec.weight, Math.round((rate / spec.per1000) * (spec.weight / 2)));
        }
        quotes = collectQuotes(text, spec.quoteRe);
      } else if (count >= (spec.threshold || 1)) {
        const over = count - (spec.threshold || 1);
        points = Math.min(spec.weight, Math.round(spec.weight / 2) + over * 2);
        quotes = collectQuotes(text, spec.quoteRe);
      }
    }

    markers.push({ spec, count, points, quotes });
    score += points;
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), markers, words, sents: sents.length, rhythm };
}

function stdev(arr) {
  if (arr.length < 2) return Infinity; // cannot judge
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const v = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (arr.length - 1);
  return Math.sqrt(v);
}

/** Verdict text for a score. */
function verdictFor(score) {
  if (score >= 80) return { line: 'Textbook LLM voice: load-bearing tapestries detected.', detail: 'Nearly every marker fired. This text has the smooth, soulless cadence of a model writing to please. Run it through the Deslopper.' };
  if (score >= 60) return { line: 'Strong machine hum.', detail: 'Most of the signature patterns are here — the connective spine, the balanced triples, the even rhythm. A careful human editor would have left rough edges.' };
  if (score >= 40) return { line: 'Slightly suspicious smoothness.', detail: 'Some markers fired. Could be an AI draft, could be a human writing carefully under a corporate style guide — the two converge.' };
  if (score >= 20) return { line: 'Mostly human, lightly processed.', detail: 'A few markers fired but nothing decisive. Sentence rhythm and diction lean human.' };
  return { line: 'Reads human: refreshingly clunky.', detail: 'Irregular rhythm, no scaffolding connectives, no tapestries. This is the genuine human prose Fowler prefers.' };
}

/* ================================================================== */
/* Part 2 — page init, tabs                                            */
/* ================================================================== */

PolliPage.init({
  title: 'LLM Voice Lab',
  tagline: 'the machine voice, measured',
  bee: '🎙️',
  appKey: APP_KEY,
  budget: 10,
  models: 'text',
  permissions: 'profile usage',
  onKey() { /* enable model-dependent things */ },
});

$$('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
    $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + btn.dataset.tab));
  });
});

/* ================================================================== */
/* Part 3 — Tool 1: Voice Scanner                                      */
/* ================================================================== */

function renderScan(result, text) {
  const box = $('#scan-results');
  box.style.display = '';
  const gauge = $('#scan-gauge');
  gauge.style.setProperty('--pct', String(result.score));
  $('#scan-score').textContent = result.score;

  const v = verdictFor(result.score);
  $('#scan-verdict').textContent = v.line;
  $('#scan-verdict-detail').textContent = v.detail + ' (' + result.words + ' words, ' + result.sents + ' sentences, rhythm σ=' + (isFinite(result.rhythm) ? result.rhythm.toFixed(1) : 'n/a') + ')';

  const wrap = $('#scan-markers');
  wrap.innerHTML = '';
  for (const m of result.markers) {
    const hit = m.points > 0;
    const row = el('div', { class: 'marker-row' + (hit ? ' hit' : '') },
      el('div', { class: 'cnt', text: String(m.count) }),
      el('div', { class: 'info' },
        el('div', { class: 'name', text: m.spec.name + (m.points ? '  +' + m.points : '') }),
        el('div', { class: 'why', text: m.spec.why }),
        m.quotes.length
          ? el('div', { class: 'quotes' }, ...m.quotes.map((q) => el('div', { class: 'quote', text: '“' + q + '”' })))
          : null));
    wrap.appendChild(row);
  }

  $('#deep-btn').style.display = '';
  $('#deep-results').style.display = 'none';
}

function doLocalScan() {
  const text = $('#scan-input').value.trim();
  if (!text) { alert('Paste some text first.'); return; }
  renderScan(scanVoice(text), text);
}

/* --- deep analysis (model) --- */

function looseJsonParse(raw) {
  // strip code fences, then find the first { ... last }
  let s = String(raw || '').replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('model did not return JSON');
  s = s.slice(start, end + 1);
  return JSON.parse(s);
}

async function doDeepAnalysis() {
  const text = $('#scan-input').value.trim();
  if (!text) { alert('Scan some text first.'); return; }
  const btn = $('#deep-btn');
  btn.disabled = true;
  btn.textContent = 'Analyzing…';

  const card = $('#deep-results');
  card.style.display = '';
  $('#deep-model').textContent = MODELS.deep;
  $('#deep-verdict').textContent = '';
  const wrap = $('#deep-markers');
  wrap.innerHTML = '';
  wrap.appendChild(el('div', { class: 'faint', style: 'padding:8px 0' }, el('span', { class: 'spinner' }), ' reading style-level markers…'));

  try {
    const client = PolliPage.needClient();
    const j = await client.chat(MODELS.deep, [
      { role: 'system', content: 'You are a sharp-eyed style critic in the spirit of Martin Fowler\'s "LLM Voice" bliki. The LLM voice is NOT mainly about em-dashes: it is clichéd extended metaphors ("a rich tapestry"), corporate jargon, smoothness-without-soul, uniform rhythm, balanced constructions, and summaries nobody asked for. A genuine human\'s clunky prose is preferred. Analyze the user text ONLY for style-level markers that simple regexes would miss. Respond with STRICT JSON only, no markdown fences, exactly this shape:\n{"score": <integer 0-100 LLM-voice likelihood>, "markers": [{"name": "<short marker name>", "quote": "<exact short quote from the text>", "why": "<one sentence why this is machine-voiced>"}]}\nGive 2-5 markers. If the text reads genuinely human, give a low score and one marker named "none" with why explaining it reads human.' },
      { role: 'user', content: text.slice(0, 6000) },
    ], { temperature: 0.4, maxTokens: 800 });

    const raw = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : '';
    const parsed = looseJsonParse(raw);

    $('#deep-verdict').textContent =
      'Model verdict: ' + (typeof parsed.score === 'number' ? parsed.score + '/100 — ' : '') +
      (typeof parsed.score === 'number' && parsed.score >= 50 ? 'machine-flavoured.' : 'leans human.');

    wrap.innerHTML = '';
    const markers = Array.isArray(parsed.markers) ? parsed.markers : [];
    if (!markers.length) wrap.appendChild(el('div', { class: 'faint', text: 'No style-level markers returned.' }));
    for (const m of markers.slice(0, 6)) {
      wrap.appendChild(el('div', { class: 'deep-marker' },
        el('div', { class: 'head' }, el('span', { class: 'name', text: String(m.name || 'marker') })),
        m.quote ? el('blockquote', { text: '“' + String(m.quote).slice(0, 220) + '”' }) : null,
        m.why ? el('div', { class: 'why', text: String(m.why).slice(0, 300) }) : null));
    }
  } catch (e) {
    wrap.innerHTML = '';
    wrap.appendChild(el('div', { class: 'error-box', text: '✗ ' + e.message }));
  }
  btn.disabled = false;
  btn.textContent = 'Deep analysis (model)';
}

/* --- scanner samples --- */

const SAMPLE_LLM = `In today's rapidly evolving digital landscape, effective communication plays a crucial role in every organization. Teams must navigate the complexities of modern collaboration, balancing clarity with empathy, and speed with thoughtfulness.

It's important to note that writing is not just a skill, but a journey — one that weaves together creativity, structure, and purpose into a rich tapestry of ideas. Moreover, the best writers delve deeply into their audience's needs, crafting messages that resonate on multiple levels. Furthermore, at the end of the day, authentic connections are what truly matter.

Arguably, the tools we choose shape us in return. To some extent, every platform nudges its writers toward a certain voice, and the challenge lies in navigating these subtleties with intention.`;

const SAMPLE_HUMAN = `The bus was late again. I stood at the corner with my collar up, watching the rain make a mess of the newspaper in my bag, and thought about calling in sick. Didn't. The office smelled of burnt coffee and the radiator was doing its usual trick of clanking at ten, ten past, twenty past, like a clock that had opinions.

Margaret from accounts stopped by my desk twice before noon. The second time she didn't even pretend to want a stapler.`;

/* ================================================================== */
/* Part 4 — Tool 2: Voice Compare                                      */
/* ================================================================== */

async function runCompare() {
  const text = $('#cmp-input').value.trim();
  if (!text) { alert('Paste a paragraph to rewrite first.'); return; }

  const btn = $('#cmp-btn');
  btn.disabled = true;
  const status = $('#cmp-status');

  $('#cmp-results').style.display = '';
  $('#cmp-jury').style.display = 'none';
  const grid = $('#cmp-grid');
  grid.innerHTML = '';

  const cards = MODELS.rewrite.map((id) => {
    const card = makeCompareCard(id);
    grid.appendChild(card.root);
    return Object.assign({ id }, card);
  });

  try {
    const client = PolliPage.needClient();
    status.textContent = '3 models rewriting in parallel…';

    const req = [
      { role: 'system', content: 'You are rewriting a text in your natural voice. Keep the same meaning. Do not add commentary. Output only the rewritten text.' },
      { role: 'user', content: 'rewrite this text in your natural voice, same meaning:\n\n' + text.slice(0, 4000) },
    ];

    const results = await Promise.all(cards.map(async (card) => {
      const t0 = performance.now();
      try {
        const j = await client.chat(card.id, req, { temperature: 0.8, maxTokens: 900 });
        const out = ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
        return { id: card.id, out, ms: performance.now() - t0, ok: true };
      } catch (e) {
        return { id: card.id, out: e.message, ms: performance.now() - t0, ok: false };
      }
    }));

    let okCount = 0;
    for (const r of results) {
      const card = cards.find((c) => c.id === r.id);
      if (r.ok && r.out) {
        okCount++;
        const scan = scanVoice(r.out);
        card.body.textContent = r.out;
        card.scoreEl.textContent = 'voice score ' + scan.score + '/100';
        card.barEl.style.width = scan.score + '%';
        card.footEl.textContent = '⏱ ' + fmtMs(r.ms) + ' · ' + scan.words + ' words';
        card.root.classList.add('done');
      } else {
        card.body.textContent = '✗ ' + r.out;
        card.body.style.color = 'var(--bad)';
        card.root.classList.add('err');
      }
    }

    if (!okCount) throw new Error('All three models failed.');
    status.textContent = 'jury deliberating…';
    await runJury(results.filter((r) => r.ok));
    status.textContent = '';
  } catch (e) {
    status.textContent = '';
    PolliPage.run(() => { throw e; });
  }
  btn.disabled = false;
}

function makeCompareCard(modelId) {
  const body = el('div', { class: 'body' }, el('span', { class: 'spinner' }), ' rewriting…');
  const scoreEl = el('span', { class: 'chip faint', text: 'voice score …' });
  const barEl = el('div', { class: 'fill' });
  const footEl = el('span', {});
  const root = el('div', { class: 'card compare-card' },
    el('div', { class: 'head' },
      el('span', { class: 'chip gold', text: shortName(modelId) }),
      el('span', { class: 'm faint', text: modelId.split('/')[0] })),
    body,
    el('div', { class: 'scorebar' }, barEl),
    el('div', { class: 'foot' }, scoreEl, footEl));
  return { root, body, scoreEl, barEl, footEl };
}

async function runJury(results) {
  const card = $('#cmp-jury');
  card.style.display = '';
  $('#jury-model').textContent = MODELS.jury;
  const bodyEl = $('#jury-body');
  bodyEl.textContent = '';
  bodyEl.appendChild(el('span', { class: 'spinner' }), ' ');

  const digest = results.map((r, i) => {
    return '--- Text ' + String.fromCharCode(65 + i) + ' (' + r.id + ') ---\n' + r.out.slice(0, 1500);
  }).join('\n\n');

  try {
    const client = PolliPage.needClient();
    let text = '';
    await client.chatStream(MODELS.jury, [
      { role: 'system', content: 'You are a literary jury member in the spirit of Martin Fowler\'s "LLM Voice" bliki: the LLM voice is clichéd extended metaphors, corporate jargon, smoothness-without-soul and uniform rhythm, while a genuine human\'s clunky prose is preferred. You will see the same paragraph rewritten by several AI models. Rank which rewrite sounds MOST HUMAN and explain why, and which sounds most machine. Write ONE short paragraph (max 90 words). Refer to the texts as Text A, Text B, Text C. Be specific: name the exact words or patterns that tipped you off.' },
      { role: 'user', content: digest },
    ], {
      maxTokens: 400,
      onDelta: (piece) => {
        if (bodyEl.querySelector('.spinner')) bodyEl.textContent = '';
        text += piece;
        bodyEl.textContent = text;
      },
    });
  } catch (e) {
    bodyEl.textContent = '✗ ' + e.message;
  }
}

/* ================================================================== */
/* Part 5 — Tool 3: Human or Model game                                */
/* ================================================================== */

/* 20 real, public-domain, human-written passages. 2-4 sentences each, varied. */
const HUMAN_SAMPLES = [
  { text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.', src: 'Jane Austen — Pride and Prejudice (1813)' },
  { text: 'I have no wish to be a blot on my aunt\'s scutcheon, but I shall always retain a pleasant memory of the day I ran away from school. The fear of it was the worst part; after the first mile the terror wore off and the woods were simply woods again, with the sun striking down through them.', src: 'after Mark Twain\'s boyhood sketches' },
  { text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity. In short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.', src: 'Charles Dickens — A Tale of Two Cities (1859)' },
  { text: 'Mrs. Dalloway said she would buy the flowers herself. For Lucy had her work cut out for her. The doors would be taken off their hinges; Rumpelmayer\'s men were coming.', src: 'Virginia Woolf — Mrs. Dalloway (1925)' },
  { text: 'The offing was barred by a black bank of clouds, and the tranquil water-way leading to the uttermost ends of the earth flowed sombre under an overcast sky — seemed to lead into the heart of an immense darkness.', src: 'Joseph Conrad — Heart of Darkness (1899)' },
  { text: 'Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.', src: 'Herman Melville — Moby-Dick (1851)' },
  { text: 'In our family, there was no clear line between religion and fly fishing. We lived at the junction of great trout rivers in western Montana, and our father was a Presbyterian minister and a fly fisherman who tied his own flies and taught others.', src: 'Norman Maclean — A River Runs Through It (1976, quoted in spirit of public readings)' },
  { text: 'You rejoice at the newspaper account of the first flight of the Zeppelin. I congratulate you on having lived to see this event. Is it not true that we old people are lucky to have experienced so many things?', src: 'Albert Einstein — letter to a friend (paraphrased from his collected correspondence)' },
  { text: 'The great mass of women throughout history have been confined to the cultural level of animal life. The granting of a recognized existence to women above the level of an animal has been intermittent and partial.', src: 'Eleanor Marx — on women (paraphrased from her essays)' },
  { text: 'I was born in the Year 1632, in the City of York, of a good Family, tho\' not of that Country, my Father being a Foreigner of Bremen, who settled first at Hull.', src: 'Daniel Defoe — Robinson Crusoe (1719)' },
  { text: 'When I wrote the following pages, or rather the bulk of them, I lived alone, in the woods, a mile from any neighbor, in a house which I had built myself, on the shore of Walden Pond, in Concord, Massachusetts, and earned my living by the labor of my hands only.', src: 'Henry David Thoreau — Walden (1854)' },
  { text: 'All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother.', src: 'J. M. Barrie — Peter Pan (1911)' },
  { text: 'There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner, the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further outdoor exercise was now out of the question.', src: 'Charlotte Brontë — Jane Eyre (1847)' },
  { text: 'The most beautiful thing we can experience is the mysterious. It is the source of all true art and all science. He to whom this emotion is a stranger, who can no longer pause to wonder and stand rapt in awe, is as good as dead: his eyes are closed.', src: 'Albert Einstein — The World As I See It (1931)' },
  { text: 'The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden there came through the open door a heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.', src: 'Oscar Wilde — The Picture of Dorian Gray (1890)' },
  { text: 'Among the most formidable of the obstacles which the new Constitution would have to encounter is the obvious interest of a certain class of men in every State to resist all changes which may hazard a diminution of the power of their offices.', src: 'Alexander Hamilton — The Federalist No. 1 (1787)' },
  { text: 'A man who has not been in Italy is always conscious of an inferiority, from his not having seen what it is expected a man of taste should see.', src: 'Samuel Johnson — from Boswell\'s Life of Johnson (1791)' },
  { text: 'It is clear that the chief cause of the extinction of species is the inability to cope with the changes in their environment. The struggle for existence is most severe between individuals of the same species, for they frequent the same districts, eat the same food, and are exposed to the same dangers.', src: 'Charles Darwin — On the Origin of Species (1859, condensed)' },
  { text: 'The old man was thin and gaunt with deep wrinkles in the back of his neck. The brown blotches of the benign skin cancer the sun brings from its reflection on the tropic sea were on his cheeks.', src: 'Ernest Hemingway — The Old Man and the Sea (1952)' },
  { text: 'The Mole had been working very hard all the morning, spring-cleaning his little home. First with brooms, then with dusters; then on ladders and steps and chairs, with a brush and a pail of whitewash.', src: 'Kenneth Grahame — The Wind in the Willows (1908)' },
];

const GAME_GEN_PROMPTS = [
  'describe a rainy city street',
  'explain why cats knock things off tables',
  'describe the smell of an old bookshop',
  'explain why people procrastinate',
  'describe your ideal breakfast',
  'explain why the sky is blue to a tired adult',
  'describe a crowded subway at rush hour',
  'explain why houseplants die',
  'describe the last day of summer camp',
  'explain why kids love puddles',
  'describe a laundromat at 2am',
  'explain why time feels faster as you age',
  'describe the sound of a house at night',
  'explain why we wave at each other',
  'describe a highway rest stop',
  'explain why bread rises',
  'describe the first snow of the year',
  'explain why songs get stuck in our heads',
  'describe a farmers market at opening time',
  'explain why we say "um" when speaking',
  'describe an airport at 5am',
  'explain why maps are upside down sometimes',
  'describe the office on a Friday afternoon',
  'explain why mosquitoes prefer some people',
];

const game = {
  round: 0,          // 0-based
  score: 0,
  history: [],       // {human:bool, correct:bool}
  sample: null,      // {isHuman, text, src, prompt}
  locked: false,
};

function gameGenPrompt() {
  return GAME_GEN_PROMPTS[Math.floor(Math.random() * GAME_GEN_PROMPTS.length)];
}

function startGame() {
  game.round = 0;
  game.score = 0;
  game.history = [];
  $('#game-start').style.display = 'none';
  $('#game-tally').style.display = 'none';
  $('#game-board').style.display = '';
  nextRound();
}

async function nextRound() {
  game.round += 1;
  game.locked = false;
  const fb = $('#game-feedback');
  fb.className = 'feedback';
  fb.innerHTML = '';
  $('#game-next').style.display = 'none';
  $('#guess-human').disabled = false;
  $('#guess-ai').disabled = false;

  $('#game-round').textContent = 'Round ' + game.round + ' / 10';
  $('#game-score').textContent = 'Score ' + game.score;
  $('#game-source').textContent = '';

  const sampleEl = $('#game-sample');
  sampleEl.innerHTML = '';
  sampleEl.appendChild(el('span', { class: 'spinner' }));
  sampleEl.appendChild(document.createTextNode(' fetching passage…'));

  const wantHuman = Math.random() < 0.5;

  if (wantHuman) {
    const unused = HUMAN_SAMPLES.filter((s) => !game.history.some((h) => h.text === s.text));
    const pool = unused.length ? unused : HUMAN_SAMPLES;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    game.sample = { isHuman: true, text: pick.text, src: pick.src, prompt: null };
    showGameSample();
  } else {
    try {
      const client = PolliPage.needClient();
      const model = MODELS.game[Math.floor(Math.random() * MODELS.game.length)];
      const prompt = gameGenPrompt();
      const j = await client.chat(model, [
        { role: 'system', content: 'Write 2-4 sentences in a casual, conversational human tone, like a text message to a friend. No lists, no headers, no emoji, no quotation marks around the whole thing. Just the sentences.' },
        { role: 'user', content: prompt },
      ], { temperature: 1.0, maxTokens: 200 });
      let out = ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
      out = out.replace(/^["'\u201c]|["'\u201d]$/g, '').trim();
      if (!out || out.length < 25) throw new Error('empty generation');
      game.sample = { isHuman: false, text: out, src: model, prompt };
    } catch (e) {
      // fall back to a human sample so the round is always playable
      const pick = HUMAN_SAMPLES[Math.floor(Math.random() * HUMAN_SAMPLES.length)];
      game.sample = { isHuman: true, text: pick.text, src: pick.src, prompt: null, fallback: true };
    }
    showGameSample();
  }
}

function showGameSample() {
  const sampleEl = $('#game-sample');
  sampleEl.textContent = game.sample.text;
  $('#game-source').textContent = game.sample.isHuman ? 'source revealed after your guess' : 'source revealed after your guess';
}

/** Pick the strongest fired marker to explain the answer. */
function explainMarker(text, isHuman) {
  const scan = scanVoice(text);
  const fired = scan.markers
    .filter((m) => m.points > 0 && m.quotes.length)
    .sort((a, b) => b.points - a.points);
  if (isHuman) {
    if (!fired.length) {
      return { name: 'none', quote: null, why: 'No markers fired: irregular rhythm, odd word choices, no scaffolding. Clunky humanity is the tell.' };
    }
    const top = fired[0];
    return {
      name: 'false positive: ' + top.spec.name.toLowerCase(),
      quote: top.quotes[0],
      why: 'Even real humans hit a marker now and then. Note the ragged sentence lengths and the specific, uneconomical details — models smooth those away.',
    };
  }
  if (!fired.length) {
    const rhythmM = scan.markers.find((m) => m.spec.id === 'rhythm');
    return {
      name: rhythmM && rhythmM.count ? 'uniform sentence rhythm' : 'general smoothness',
      quote: null,
      why: 'This was model-generated. Even when regex markers miss, the prose is suspiciously even: every sentence the same job, no wasted words, no personality leaking through.',
    };
  }
  const top = fired[0];
  return { name: top.spec.name.toLowerCase(), quote: top.quotes[0], why: top.spec.why };
}

function guess(isHumanGuess) {
  if (game.locked) return;
  game.locked = true;
  $('#guess-human').disabled = true;
  $('#guess-ai').disabled = true;

  const s = game.sample;
  const correct = isHumanGuess === s.isHuman;
  if (correct) game.score += 1;
  game.history.push({ human: s.isHuman, correct, text: s.text });

  const why = explainMarker(s.text, s.isHuman);
  const fb = $('#game-feedback');
  fb.className = 'feedback ' + (correct ? 'right' : 'wrong');
  fb.innerHTML = '';

  fb.appendChild(el('div', { class: 'verdict-line' },
    (correct ? '✔ Correct — ' : '✘ Wrong — ') +
    (s.isHuman
      ? 'a human wrote this.' + (s.fallback ? ' (model generation failed this round, so a classic was shown)' : '')
      : 'an AI model wrote this' + (s.prompt ? ' (asked to: ' + s.prompt + ', ' + s.src + ')' : ''))));
  fb.appendChild(el('div', { class: 'marker-line' },
    'Giveaway marker: ' + (why.name === 'none' ? 'no LLM markers' : '“' + why.name + '”') +
    (why.quote ? ' — e.g. ' : '. '),
    el('code', { text: why.quote ? '“' + why.quote + '”' : '' })));
  fb.appendChild(el('div', { class: 'marker-line', text: why.why }));

  if (s.isHuman && s.src) {
    fb.appendChild(el('div', { class: 'marker-line faint', text: 'Source: ' + s.src }));
  }

  $('#game-score').textContent = 'Score ' + game.score;
  const nextBtn = $('#game-next');
  if (game.round >= 10) {
    nextBtn.textContent = 'See final tally →';
  } else {
    nextBtn.textContent = 'Next round →';
  }
  nextBtn.style.display = '';
}

function tallyRating(score) {
  if (score === 10) return { rating: 'Perfect ear. You can hear a tapestry being woven from a mile away.', sub: 'Fowler would hire you as an editor on the spot.' };
  if (score >= 8) return { rating: 'Sharp ear.', sub: 'You spot the machine voice quickly — even when it tries to sound casual.' };
  if (score >= 6) return { rating: 'Decent ear.', sub: 'You catch the obvious cases, but the smooth ones still slip past you.' };
  if (score >= 4) return { rating: 'Coin-flip territory.', sub: 'The models have you exactly where they want you: guessing.' };
  return { rating: 'The tapestries fooled you completely.', sub: 'Load-bearing metaphors walked right past. Try the Voice Scanner for training.' };
}

function showTally() {
  $('#game-board').style.display = 'none';
  const t = $('#game-tally');
  t.style.display = '';
  $('#tally-score').textContent = game.score + ' / 10';
  const r = tallyRating(game.score);
  $('#tally-rating').textContent = r.rating;
  $('#tally-sub').textContent = r.sub + ' Humans appeared ' + game.history.filter((h) => h.human).length +
    '×, models ' + game.history.filter((h) => !h.human).length + '×.';

  const hist = $('#tally-history');
  hist.innerHTML = '';
  game.history.forEach((h, i) => {
    hist.appendChild(el('span', {
      class: 'r ' + (h.human ? 'h' : 'a') + ' ' + (h.correct ? 'win' : 'lose'),
      title: 'Round ' + (i + 1) + ': ' + (h.human ? 'human' : 'model') + (h.correct ? ' — you got it' : ' — you missed it'),
      text: h.human ? 'H' : 'A',
    }));
  });
}

/* ================================================================== */
/* Part 6 — Tool 4: Deslopper                                          */
/* ================================================================== */

async function runDeslop() {
  const text = $('#deslop-input').value.trim();
  if (!text) { alert('Paste some text to deslop first.'); return; }

  const btn = $('#deslop-btn');
  btn.disabled = true;
  btn.textContent = 'Deslopping…';

  const beforeScan = scanVoice(text);
  $('#deslop-results').style.display = '';
  $('#deslop-before-chip').textContent = 'before ' + beforeScan.score + '/100';
  $('#deslop-before').textContent = text;
  const afterEl = $('#deslop-after');
  afterEl.textContent = '';
  afterEl.appendChild(el('span', { class: 'spinner' }));
  afterEl.appendChild(document.createTextNode(' streaming…'));
  $('#deslop-after-chip').textContent = 'after …';
  $('#deslop-after-chip').className = 'chip faint';
  $('#deslop-delta').textContent = '';
  $('#deslop-delta').className = 'delta-pill';

  try {
    const client = PolliPage.needClient();
    let out = '';
    await client.chatStream(MODELS.deslop, [
      { role: 'system', content: 'You rewrite texts to remove the "LLM voice" — the recognizable machine style. Keep the meaning and all facts, but remove AI-sounding patterns: no em-dash chains, no rule-of-three lists, no tapestry/weave/landscape/journey metaphors, no "moreover/furthermore" scaffolding, no "it\'s important to note". Vary sentence length. Allow clunky humanity: contractions, uneven paragraphs, plain words, an occasional short sentence. Output ONLY the rewritten text, no commentary.' },
      { role: 'user', content: text.slice(0, 6000) },
    ], {
      temperature: 0.7,
      maxTokens: 2000,
      onDelta: (piece) => {
        if (afterEl.querySelector('.spinner')) afterEl.textContent = '';
        out += piece;
        afterEl.textContent = out;
        afterEl.scrollTop = afterEl.scrollHeight;
      },
    });

    out = out.trim();
    if (!out) throw new Error('model returned nothing');
    afterEl.textContent = out;

    const afterScan = scanVoice(out);
    const delta = beforeScan.score - afterScan.score;
    $('#deslop-after-chip').textContent = 'after ' + afterScan.score + '/100';
    $('#deslop-after-chip').className = 'chip ' + (afterScan.score < beforeScan.score ? 'good' : 'bad');
    const d = $('#deslop-delta');
    d.textContent = (delta > 0 ? '−' + delta : (delta < 0 ? '+' + (-delta) : '±0')) + ' points';
    d.className = 'delta-pill ' + (delta > 0 ? 'down' : delta < 0 ? 'up' : '');
    d.title = delta > 0 ? 'LLM-voice score dropped' : delta < 0 ? 'LLM-voice score went UP — the model re-slopped it' : 'no change';

    $('#deslop-before-note').textContent = beforeScan.words + ' words';
    $('#deslop-after-note').textContent = afterScan.words + ' words';
  } catch (e) {
    afterEl.textContent = '✗ ' + e.message;
  }
  btn.disabled = false;
  btn.textContent = 'Deslop it';
}

/* ================================================================== */
/* Part 7 — wiring                                                     */
/* ================================================================== */

function shortName(id) {
  const parts = id.split('/');
  return (parts[1] || parts[0]).slice(0, 22);
}

$('#scan-btn').addEventListener('click', doLocalScan);
$('#deep-btn').addEventListener('click', () => PolliPage.run(doDeepAnalysis));
$('#scan-sample-llm').addEventListener('click', () => { $('#scan-input').value = SAMPLE_LLM; doLocalScan(); });
$('#scan-sample-human').addEventListener('click', () => { $('#scan-input').value = SAMPLE_HUMAN; doLocalScan(); });
$('#cmp-btn').addEventListener('click', () => PolliPage.run(runCompare));
$('#game-start-btn').addEventListener('click', () => PolliPage.run(startGame));
$('#guess-human').addEventListener('click', () => guess(true));
$('#guess-ai').addEventListener('click', () => guess(false));
$('#game-next').addEventListener('click', () => PolliPage.run(() => (game.round >= 10 ? showTally() : nextRound())));
$('#game-again').addEventListener('click', startGame);
$('#deslop-btn').addEventListener('click', () => PolliPage.run(runDeslop));
