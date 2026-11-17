/* AI Debate Stage — two or more AIs that never hang up.
   Quest #19178 · Credit Pollinations — Made with pollinations.ai */

const APP_KEY = 'pk_UGk679hhEaxXgbeC';
const MODERATOR_MODEL = 'mistralai/mistral-large-3';

const MODELS = [
  'openai/gpt-5.4',
  'deepseek/deepseek-v4.1-flash',
  'z-ai/glm-5.3-flash',
  'x-ai/grok-4.6',
  'mistralai/mistral-large-3',
];

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

const PRESETS = {
  'Skeptical scientist': 'You are a skeptical scientist. Demand evidence, poke holes in claims, cite method. Dry humor allowed.',
  'Enthusiastic optimist': 'You are an enthusiastic optimist. You see upside in everything, get excited easily, use exclamation points.',
  'Grumpy grandfather': 'You are a grumpy grandfather. Complain about "these days", reference the good old times, be stubborn but endearing.',
  'Corporate consultant': 'You are a corporate consultant. Speak in buzzwords, propose frameworks and synergies, always end with an "action item".',
  'Poet': 'You are a poet. Answer in lyrical, metaphor-rich language, notice beauty and melancholy in everything.',
  'Conspiracy uncle': 'You are a conspiracy uncle. Connect everything to "what they don\'t want you to know", be confident and absurd.',
};

const MODES = {
  debate: {
    label: 'Debate',
    rules: (i) =>
      i === 0
        ? 'You ARGUE FOR the topic. Attack the other side\'s weakest point, defend your own. No conceding.'
        : i === 1
          ? 'You ARGUE AGAINST the topic. Attack the other side\'s weakest point, defend your own. No conceding.'
          : 'You add your own perspective on the topic, challenging both sides.',
  },
  interview: {
    label: 'Interview',
    rules: (i) =>
      i === 0
        ? 'You are the INTERVIEWER. Ask short probing questions about the topic as if it were a job interview.'
        : 'You are the CANDIDATE being interviewed about the topic. IMPORTANT: you must end EVERY answer with a question back to the interviewer — you never let the conversation end.',
  },
  freechat: {
    label: 'Free chat',
    rules: () => 'Chat freely and curiously about the topic. Build on what the other said, ask questions sometimes.',
  },
  therapy: {
    label: 'Therapy',
    rules: (i) =>
      i === 0
        ? 'You are a calm, warm THERAPIST. Reflect feelings, ask gentle open questions, never diagnose.'
        : 'You are an ANXIOUS CLIENT. Worry out loud about the topic, catastrophize a little, look for reassurance.',
  },
};

const COLORS = ['#f5c518', '#7c5cff', '#3ecf8e', '#ff6b6b', '#4fc3f7', '#ffb454'];

const DEFAULT_PERSONAS = [
  { name: 'Dr. Vera', model: 'openai/gpt-5.4', voice: 'alloy', prompt: PRESETS['Skeptical scientist'], color: 0 },
  { name: 'Buddy', model: 'deepseek/deepseek-v4.1-flash', voice: 'nova', prompt: PRESETS['Enthusiastic optimist'], color: 1 },
];

const state = {
  personas: [],
  running: false,
  abort: null,
  voicesOn: false,
  turn: 0,
  totalTurns: 8,
  transcript: [], // {who, name, model, color, text, kind}
  pendingHuman: null,
  lastSpeaker: -1,
};

/* ---------- init page chrome ---------- */

PolliPage.init({
  title: 'AI Debate Stage',
  tagline: 'AIs that never hang up',
  appKey: APP_KEY,
  budget: 10,
  models: 'text',
  permissions: 'profile usage',
  onKey() { /* stage becomes usable */ },
});

/* ---------- personas ---------- */

function loadSetup() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem('debate_setup') || 'null'); } catch (e) { /* ignore */ }
  if (s && Array.isArray(s.personas) && s.personas.length >= 2) {
    state.personas = s.personas.slice(0, 4).map((p, i) => ({
      name: p.name || 'Speaker ' + (i + 1),
      model: MODELS.includes(p.model) ? p.model : MODELS[0],
      voice: VOICES.includes(p.voice) ? p.voice : VOICES[i % VOICES.length],
      prompt: p.prompt || '',
      color: i % COLORS.length,
    }));
    $('#topic').value = s.topic || $('#topic').value;
    $('#turns').value = Math.min(15, Math.max(5, s.turns || 8));
    if (s.moderator !== undefined) $('#moderator').checked = !!s.moderator;
    const m = MODES[s.mode] ? s.mode : 'debate';
    $$('input[name="mode"]').forEach((r) => { r.checked = r.value === m; });
    updateModeOpt();
    return;
  }
  resetPersonas();
}

function saveSetup() {
  const mode = ($$('input[name="mode"]').find((r) => r.checked) || {}).value || 'debate';
  try {
    localStorage.setItem('debate_setup', JSON.stringify({
      personas: state.personas.map(({ name, model, voice, prompt }) => ({ name, model, voice, prompt })),
      topic: $('#topic').value,
      turns: parseInt($('#turns').value, 10) || 8,
      moderator: $('#moderator').checked,
      mode,
    }));
  } catch (e) { /* private mode */ }
}

function resetPersonas() {
  state.personas = DEFAULT_PERSONAS.map((p, i) => ({ ...p, color: i }));
  renderPersonas();
}

function renderPersonas() {
  const box = $('#personas');
  box.innerHTML = '';
  state.personas.forEach((p, i) => {
    const presetRow = el('div', { class: 'preset-row' });
    Object.keys(PRESETS).forEach((k) => {
      presetRow.appendChild(el('button', {
        class: 'ghost small' + (p.prompt === PRESETS[k] ? ' active' : ''),
        text: k,
        title: PRESETS[k],
        onclick: () => { p.prompt = PRESETS[k]; saveSetup(); renderPersonas(); },
      }));
    });
    const card = el('div', { class: 'persona-card' },
      el('div', { class: 'head' },
        el('span', { class: 'persona-avatar', style: 'background:' + COLORS[p.color], text: initials(p.name) }),
        el('input', { type: 'text', value: p.name, placeholder: 'Name', oninput: (e) => { p.name = e.target.value; saveSetup(); } }),
        state.personas.length > 2
          ? el('button', { class: 'small ghost', text: '✕', title: 'Remove', onclick: () => { state.personas.splice(i, 1); renderPersonas(); saveSetup(); } })
          : null
      ),
      el('div', { class: 'persona-grid' },
        sel('Model', MODELS, p.model, (v) => { p.model = v; saveSetup(); }),
        sel('Voice', VOICES, p.voice, (v) => { p.voice = v; saveSetup(); })
      ),
      el('textarea', { placeholder: 'Persona prompt…', oninput: (e) => { p.prompt = e.target.value; saveSetup(); } }, p.prompt),
      el('div', { class: 'small faint', style: 'margin-top:4px', text: 'persona prompt presets:' }),
      presetRow
    );
    card.querySelector('textarea').value = p.prompt;
    box.appendChild(card);
  });
  $('#add-persona').disabled = state.personas.length >= 4;
  $('#add-persona').textContent = state.personas.length >= 4 ? 'Max 4 personas' : '+ Add persona';
}

function sel(label, options, value, onchange) {
  const s = el('select', { onchange: (e) => onchange(e.target.value) },
    ...options.map((o) => el('option', { value: o, text: o })));
  s.value = value;
  return el('label', { style: 'display:block' },
    el('span', { class: 'field', style: 'display:block', text: label }), s);
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function updateModeOpt() {
  $$('.mode-opt').forEach((o) => {
    o.classList.toggle('active', o.querySelector('input').checked);
  });
}

/* ---------- stage rendering ---------- */

function addBubble(entry) {
  const stage = $('#stage');
  if (stage.querySelector('.empty-hint')) stage.innerHTML = '';
  const msg = el('div', { class: 'msg ' + entry.side + (entry.kind ? ' ' + entry.kind : '') });
  if (entry.kind === 'system') {
    msg.classList.add('center', 'mod');
    msg.appendChild(el('div', { class: 'bubble' }, entry.text));
  } else {
    const avatar = el('div', { class: 'avatar', style: 'background:' + entry.color, text: entry.kind === 'human' ? '👤' : initials(entry.name) });
    const col = el('div', {},
      el('div', { class: 'who' },
        el('span', { class: 'dot', style: 'background:' + entry.color }),
        entry.kind === 'mod' ? '[MODERATOR] · ' + MODERATOR_MODEL : entry.name + (entry.model ? ' · ' + entry.model : '')
      ),
      el('div', { class: 'bubble' }, entry.text));
    if (entry.kind === 'human') col.querySelector('.who').textContent = 'Human';
    msg.appendChild(avatar);
    msg.appendChild(col);
  }
  stage.appendChild(msg);
  stage.scrollTop = stage.scrollHeight;
  return msg;
}

function typingBubble(side, color, label) {
  return addBubble({ side, color, name: label, text: '…', kind: 'typing' });
}

function updateTurnChip() {
  $('#turn-chip').textContent = 'turn ' + state.turn + ' / ' + state.totalTurns;
}

/* ---------- conversation engine ---------- */

function buildMessages(speakerIdx, mode) {
  const p = state.personas[speakerIdx];
  const modeRules = MODES[mode].rules(speakerIdx);
  const others = state.personas.filter((_, i) => i !== speakerIdx).map((x) => x.name).join(', ');
  const system =
    'You are "' + p.name + '" on a live conversation stage with: ' + others + '.\n' +
    'Persona: ' + (p.prompt || 'a thoughtful conversationalist') + '\n' +
    'Mode — ' + MODES[mode].label + ': ' + modeRules + '\n' +
    'Rules: Stay in character. Maximum ~120 words per turn. Speak directly to the others by name. Never write stage directions or your own name as a prefix.';
  const messages = [{ role: 'system', content: system }];
  for (const t of state.transcript) {
    if (t.kind === 'human') messages.push({ role: 'user', content: 'Human (interrupting from the audience): ' + t.text });
    else if (t.kind === 'mod') messages.push({ role: 'user', content: '[MODERATOR interjection]: ' + t.text });
    else messages.push({ role: 'user', content: t.name + ' says: ' + t.text });
  }
  return messages;
}

async function speakTurn(idx, mode) {
  const p = state.personas[idx];
  const t0 = performance.now();
  const j = await PolliPage.needClient().chat(p.model, buildMessages(idx, mode), {
    temperature: 0.9, maxTokens: 400, signal: state.abort.signal,
  });
  const text = ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
  if (!text) throw new Error(p.model + ' returned an empty reply');
  return { text: text.slice(0, 1600), ms: Math.round(performance.now() - t0) };
}

async function playTTS(persona, text) {
  if (!state.voicesOn) return;
  const audio = $('#tts-audio');
  const url = PolliPage.needClient().audioUrl(text.slice(0, 500), { voice: persona.voice });
  await new Promise((resolve) => {
    audio.src = url;
    const done = () => { audio.removeEventListener('ended', done); audio.removeEventListener('error', done); resolve(); };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    audio.play().catch(done);
  });
}

async function moderatorInterjection() {
  const msgs = [{ role: 'system', content: 'You are the MODERATOR of a live AI conversation. In 1-2 short sentences (max 35 words), interject ONLY if the speakers are repeating themselves or going in circles — steer them to a new angle (e.g. "You\'re going in circles — new angle please."). If they are fine, interject anyway with one crisp observation or a nudge. Output only the interjection text.' }];
  for (const t of state.transcript) msgs.push({ role: 'user', content: (t.kind === 'human' ? 'Human: ' : t.name + ': ') + t.text });
  const j = await PolliPage.needClient().chat(MODERATOR_MODEL, msgs, { temperature: 0.6, maxTokens: 100, signal: state.abort.signal });
  const text = ((j.choices[0].message && j.choices[0].message.content) || 'You\'re going in circles — new angle please.').trim();
  addBubble({ side: 'center', kind: 'mod', text: '[MODERATOR] ' + text });
  state.transcript.push({ who: 'mod', name: 'Moderator', text, kind: 'mod' });
}

async function moderatorVerdict(mode, topic) {
  addBubble({ side: 'center', kind: 'mod', text: '[MODERATOR] Closing the stage — deliberating…' });
  const digest = state.transcript.filter((t) => t.kind !== 'mod').map((t) => (t.kind === 'human' ? 'Human' : t.name) + ': ' + t.text).join('\n');
  const sys = mode === 'debate'
    ? 'You are the MODERATOR of a debate on: "' + topic + '". Two sides argued FOR and AGAINST. Declare ONE winner by name in exactly 2 sentences: first sentence names the winner and why, second sentence notes what the loser missed. Format: "Winner: <name>. <2 sentences total>"'
    : 'You are the MODERATOR closing a ' + MODES[mode].label + ' conversation on: "' + topic + '". In exactly 2 sentences, give your closing observation on how it went and the most memorable moment. No winner needed.';
  const j = await PolliPage.needClient().chat(MODERATOR_MODEL, [
    { role: 'system', content: sys },
    { role: 'user', content: digest.slice(0, 6000) },
  ], { temperature: 0.5, maxTokens: 150, signal: state.abort.signal });
  const text = ((j.choices[0].message && j.choices[0].message.content) || '').trim() || 'The stage is closed.';
  addBubble({ side: 'center', kind: 'mod', text: '[MODERATOR] ' + text });
  state.transcript.push({ who: 'mod', name: 'Moderator', text, kind: 'mod' });
}

async function startConversation() {
  if (state.running) return;
  if (!PolliPage.client) throw new Error('Connect your Pollen first: press the Connect button at the top of the page, then start the conversation.');
  const topic = $('#topic').value.trim();
  if (!topic) throw new Error('Give the stage a topic first.');
  state.personas.forEach((p, i) => { if (!p.name.trim()) p.name = 'Speaker ' + (i + 1); });
  if (state.personas.some((p) => !p.prompt.trim())) throw new Error('Every persona needs a persona prompt (pick a preset).');

  const mode = ($$('input[name="mode"]').find((r) => r.checked) || {}).value || 'debate';
  const turns = Math.min(15, Math.max(5, parseInt($('#turns').value, 10) || 8));
  const withMod = $('#moderator').checked;
  saveSetup();

  state.running = true;
  state.abort = new AbortController();
  state.turn = 0;
  state.totalTurns = turns;
  state.transcript = [];
  state.lastSpeaker = -1;
  updateTurnChip();

  $('#stage').innerHTML = '';
  $('#start').style.display = 'none';
  $('#stop').style.display = '';
  $('#restart').style.display = 'none';

  addBubble({ side: 'center', kind: 'mod', text: '🎭 The stage is lit — ' + MODES[mode].label + ' on "' + topic + '" with ' + state.personas.map((p) => p.name).join(' & ') + '.' });

  let humanInjected = false;
  try {
    while (state.turn < turns) {
      // pick next speaker: never twice in a row
      let idx = 0;
      if (state.personas.length === 2) idx = state.lastSpeaker === -1 ? 0 : 1 - state.lastSpeaker;
      else idx = (state.lastSpeaker + 1) % state.personas.length;

      const p = state.personas[idx];
      const side = idx % 2 === 0 ? 'left' : 'right';
      const typing = typingBubble(side, COLORS[p.color], p.name);
      let reply;
      try {
        reply = await speakTurn(idx, mode);
      } finally {
        typing.remove();
      }
      state.transcript.push({ who: idx, name: p.name, model: p.model, text: reply.text });
      addBubble({ side, color: COLORS[p.color], name: p.name, model: p.model, text: reply.text });
      state.lastSpeaker = idx;
      state.turn += 1;
      updateTurnChip();
      await playTTS(p, reply.text);

      // human interjection queued? next speaker responds to it
      if (state.pendingHuman) {
        addBubble({ side: 'center', kind: 'human', text: state.pendingHuman });
        state.transcript.push({ who: 'human', name: 'Human', text: state.pendingHuman, kind: 'human' });
        state.pendingHuman = null;
        humanInjected = true;
      }

      if (withMod && state.turn % 4 === 0 && state.turn < turns) {
        await moderatorInterjection();
      }
      if (state.turn < turns) await sleep(1200);
    }
    if (withMod) await moderatorVerdict(mode, topic);
    else addBubble({ side: 'center', kind: 'mod', text: '— conversation ended (' + turns + ' turns) —' });
  } catch (e) {
    if (e.name !== 'AbortError') addBubble({ side: 'center', kind: 'mod', text: '✗ ' + (e.message || String(e)) });
  } finally {
    state.running = false;
    $('#start').style.display = '';
    $('#start').textContent = 'Start again';
    $('#stop').style.display = 'none';
    $('#restart').style.display = '';
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    if (state.abort) state.abort.signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

function stopConversation() {
  state.running = false;
  if (state.abort) state.abort.abort();
  try { $('#tts-audio').pause(); } catch (e) { /* noop */ }
  addBubble({ side: 'center', kind: 'mod', text: '■ Stopped by the human. The AIs are still politely waiting to continue.' });
}

function queueHuman() {
  const input = $('#interject');
  const text = input.value.trim();
  if (!text) return;
  if (!state.running) { alert('Start the conversation first, then interrupt it.'); return; }
  state.pendingHuman = text;
  input.value = '';
  addBubble({ side: 'center', kind: 'human', text: 'queued: ' + text });
}

/* ---------- transcript export ---------- */

function exportTranscript() {
  if (!state.transcript.length) { alert('Nothing to export yet — run a conversation first.'); return; }
  const mode = ($$('input[name="mode"]').find((r) => r.checked) || {}).value || 'debate';
  const lines = ['AI Debate Stage — ' + MODES[mode].label + ' — topic: ' + $('#topic').value, ''];
  for (const t of state.transcript) {
    lines.push((t.kind === 'human' ? 'HUMAN' : t.kind === 'mod' ? '[MODERATOR]' : t.name.toUpperCase()) + ': ' + t.text);
    lines.push('');
  }
  lines.push('Credit Pollinations — Made with pollinations.ai');
  const text = lines.join('\n');
  const done = () => alert('Transcript copied to clipboard.');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}

function fallbackCopy(text, done) {
  const ta = el('textarea', { style: 'position:fixed;left:-9999px' });
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { alert('Copy failed — see console.'); console.log(text); }
  ta.remove();
}

/* ---------- wire up ---------- */

$('#add-persona').addEventListener('click', () => {
  if (state.personas.length >= 4) return;
  const i = state.personas.length;
  state.personas.push({
    name: 'Speaker ' + (i + 1),
    model: MODELS[i % MODELS.length],
    voice: VOICES[i % VOICES.length],
    prompt: '',
    color: i % COLORS.length,
  });
  renderPersonas();
  saveSetup();
});
$('#reset-personas').addEventListener('click', () => { resetPersonas(); saveSetup(); });
$('#start').addEventListener('click', () => PolliPage.run(startConversation));
$('#stop').addEventListener('click', stopConversation);
$('#restart').addEventListener('click', () => {
  $('#stage').innerHTML = '<div class="faint empty-hint" style="text-align:center;margin:auto;padding:40px 10px;">Stage cleared. Press Start.</div>';
  state.transcript = [];
  state.turn = 0;
  updateTurnChip();
});
$('#voices').addEventListener('click', () => {
  state.voicesOn = !state.voicesOn;
  $('#voices').textContent = state.voicesOn ? '🔊 Voices on' : '🔇 Voices off';
  $('#voices').classList.toggle('primary', state.voicesOn);
  if (!state.voicesOn) { try { $('#tts-audio').pause(); } catch (e) { /* noop */ } }
});
$('#export').addEventListener('click', exportTranscript);
$('#send-interject').addEventListener('click', queueHuman);
$('#interject').addEventListener('keydown', (e) => { if (e.key === 'Enter') queueHuman(); });
$$('input[name="mode"]').forEach((r) => r.addEventListener('change', () => { updateModeOpt(); saveSetup(); }));
$('#topic').addEventListener('input', saveSetup);
$('#turns').addEventListener('input', saveSetup);
$('#moderator').addEventListener('change', saveSetup);

loadSetup();
