/* Decision Arena — Grid Rush: a game that AI models play.
   Quest #19176 · Credit Pollinations — Made with pollinations.ai */

const APP_KEY = 'pk_VkCwIsniDUAifKLQ';

/* Decision models (the stars) + 2 text models for fun */
const DECISION_MODELS = [
  'vllm-sr/d3',
  'microsoft/microsoft-decision-1',
  'typesafe/jev-1.14',
  'perplexity/pplx-decider-v1.2',
  'openai/gpt-6-luna-decisions',
  'liquid/d1',
  'jaredpalmer/kev-4b',
  'respan/span-01-lite',
];
const TEXT_MODELS = ['openai/gpt-5.4-nano', 'deepseek/deepseek-v4.1-flash'];

const REFERENCE_BOTS = [
  { id: 'random', title: 'random (ref)' },
  { id: 'greedy', title: 'greedy (ref)' },
];

const GRID = 15;
const MAX_TICKS = 200;
const PELLETS = 20;
const RACER_COLORS = { 1: '#4da3ff', 2: '#ff6ec7' };

/* ------------------------------------------------------------------ */
/* Deterministic RNG + Game engine (pure: seed + move list => result)  */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grid Rush. Deterministic: same seed + same move list => same game. */
class Game {
  constructor(seed) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    // snake starts center-left, length 3, moving right: tail(0,7) mid(1,7) head(2,7)
    this.snake = [
      { x: 2, y: 7 },
      { x: 1, y: 7 },
      { x: 0, y: 7 },
    ]; // index 0 = head
    this.dir = 'right';
    this.score = 0;
    this.tick = 0;
    this.alive = true;
    this.cause = null; // 'wall' | 'self' | 'ticks' | null
    this.growPending = 0;
    this.pellets = [];
    const taken = new Set(this.snake.map((s) => s.x + ',' + s.y));
    while (this.pellets.length < PELLETS) {
      const x = Math.floor(this.rng() * GRID);
      const y = Math.floor(this.rng() * GRID);
      const k = x + ',' + y;
      if (taken.has(k)) continue;
      taken.add(k);
      this.pellets.push({ x, y });
    }
    this.lastEvent = null; // e.g. "P7 eaten! score 7" / "CRASH into wall at tick 84"
  }

  /** One tick. `direction` is the requested direction (no-op if game over).
      Returns true if the game is still running after this tick. */
  step(direction) {
    if (!this.alive) return false;
    if (['up', 'down', 'left', 'right'].includes(direction)) {
      // forbid 180° reversal into own neck (that would be instant self-collision)
      const opp = { up: 'down', down: 'up', left: 'right', right: 'left' }[this.dir];
      if (direction !== opp) this.dir = direction;
    }
    const head = this.snake[0];
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[this.dir];
    const nx = head.x + d[0];
    const ny = head.y + d[1];
    this.tick += 1;

    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
      this.alive = false;
      this.cause = 'wall';
      this.lastEvent = 'CRASH into wall at tick ' + this.tick;
      return false;
    }
    // self collision (tail cell frees up unless growing this tick)
    const body = this.growPending > 0 ? this.snake : this.snake.slice(0, -1);
    if (body.some((s) => s.x === nx && s.y === ny)) {
      this.alive = false;
      this.cause = 'self';
      this.lastEvent = 'CRASH into own body at tick ' + this.tick;
      return false;
    }

    this.snake.unshift({ x: nx, y: ny });
    const pi = this.pellets.findIndex((p) => p.x === nx && p.y === ny);
    if (pi >= 0) {
      this.pellets.splice(pi, 1);
      this.score += 1;
      this.growPending += 1;
      this.lastEvent = 'P' + (this.score) + ' eaten! score ' + this.score;
    } else {
      this.lastEvent = null;
    }
    if (this.growPending > 0) this.growPending -= 1;
    else this.snake.pop();

    if (this.tick >= MAX_TICKS) {
      this.alive = false; // ran the full course — not a crash
      this.cause = 'ticks';
      this.lastEvent = 'time up at tick ' + this.tick + ' — score ' + this.score;
      return false;
    }
    return true;
  }

  nextCell(dirName) {
    const head = this.snake[0];
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dirName] || [0, 0];
    return { x: head.x + d[0], y: head.y + d[1] };
  }

  isFatalCell(cell, direction) {
    if (cell.x < 0 || cell.x >= GRID || cell.y < 0 || cell.y >= GRID) return true;
    // tail moves away unless growing; approximate with: any body cell except tail-tip when not growing
    const body = this.growPending > 0 ? this.snake : this.snake.slice(0, -1);
    return body.some((s) => s.x === cell.x && s.y === cell.y);
  }
}

/* ------------------------------------------------------------------ */
/* Reference bots (unranked, free, no API) — Opper convention          */
/* ------------------------------------------------------------------ */

function makeBotRacer(botId, seed) {
  // bots get their own deterministic RNG so replays match live runs
  const rng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  if (botId === 'random') {
    return {
      kind: 'bot', bot: 'random', isRef: true,
      nextMove(game) {
        if (rng() < 0.15) {
          const dirs = ['up', 'down', 'left', 'right'];
          return dirs[Math.floor(rng() * 4)];
        }
        return game.dir; // keep current direction
      },
    };
  }
  // greedy: move toward nearest pellet, avoid immediate death
  return {
    kind: 'bot', bot: 'greedy', isRef: true,
    nextMove(game) {
      const head = game.snake[0];
      const dirs = ['up', 'down', 'left', 'right'];
      const opp = { up: 'down', down: 'up', left: 'right', right: 'left' }[game.dir];
      let best = null, bestDist = Infinity;
      for (const d of dirs) {
        if (d === opp) continue;
        const cell = game.nextCell(d);
        if (game.isFatalCell(cell, d)) continue;
        const target = nearestPellet(game, cell);
        const dist = target ? Math.abs(target.x - cell.x) + Math.abs(target.y - cell.y) : 999;
        const tie = dist === bestDist && rng() < 0.5;
        if (dist < bestDist || tie) { bestDist = dist; best = d; }
      }
      return best || game.dir; // boxed in: keep going
    },
  };
}

function nearestPellet(game, from) {
  let best = null, bestDist = Infinity;
  for (const p of game.pellets) {
    const d = Math.abs(p.x - from.x) + Math.abs(p.y - from.y);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Model racer — asks a Pollinations decision model each tick          */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT =
  'You are playing "Grid Rush", a deterministic snake-like collection game on a 15x15 grid.\n' +
  'Rules: each tick you move exactly 1 cell in your current direction, unless you choose a new one. ' +
  'Eating a pellet gives +1 score and grows your snake by 1. Hitting a wall (outside 0..14) or your own body ends the game. ' +
  'You cannot reverse 180 degrees. There are at most 200 ticks.\n' +
  'Goal: maximize score. Avoid death; a dead snake scores nothing more.\n' +
  'STRICT OUTPUT FORMAT: reply with exactly one line, nothing else:\n' +
  'DIRECTION: up\n' +
  'where the direction is one of: up, down, left, right.\n' +
  'Coordinates are [x,y] with x = column 0..14 (left to right) and y = row 0..14 (top to bottom). ' +
  'up decreases y, down increases y, left decreases x, right increases x.';

function stateView(game) {
  const head = game.snake[0];
  const next3 = game.snake.slice(1, 4).map((s) => '[' + s.x + ',' + s.y + ']');
  const pellets = game.pellets.map((p) => '[' + p.x + ',' + p.y + ']').join(', ');
  return (
    'TICK ' + game.tick + '/' + MAX_TICKS + '\n' +
    'SCORE: ' + game.score + '\n' +
    'DIRECTION: ' + game.dir + '\n' +
    'HEAD: [' + head.x + ',' + head.y + ']\n' +
    'NEXT 3 BODY SEGMENTS: ' + (next3.length ? next3.join(', ') : '(none)') + '\n' +
    'PELLETS (' + game.pellets.length + ' remaining, all listed): ' + (pellets || '(none)') + '\n' +
    'WALLS: x<0, x>14, y<0, y>14 are deadly. Your body cells are deadly.\n' +
    'Choose your move.'
  );
}

function parseDirection(text) {
  const m = (text || '').match(/DIRECTION:\s*(up|down|left|right)/i);
  if (m) return m[1].toLowerCase();
  // loose fallback: first bare direction word
  const m2 = (text || '').match(/\b(up|down|left|right)\b/i);
  if (m2) return m2[1].toLowerCase();
  return null;
}

function makeModelRacer(modelId) {
  let parseFellBack = 0, asked = 0;
  return {
    kind: 'model', model: modelId, isRef: false,
    async nextMove(game) {
      const client = PolliPage.needClient();
      const t0 = performance.now();
      const j = await client.chat(modelId, [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: stateView(game) },
      ], { temperature: 0, maxTokens: 200 });
      asked += 1;
      const text = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
      const dir = parseDirection(text);
      const ms = Math.round(performance.now() - t0);
      if (!dir) { parseFellBack += 1; return { dir: game.dir, raw: text, ms, fallback: true }; }
      return { dir, raw: text, ms, fallback: false, parseFellBack };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page chrome                                                         */
/* ------------------------------------------------------------------ */

PolliPage.init({
  title: 'Decision Arena',
  tagline: 'Grid Rush · a game that AI models play',
  appKey: APP_KEY,
  budget: 10,
  models: 'text',
  permissions: 'profile usage',
});

/* ------------------------------------------------------------------ */
/* App state + UI wiring                                               */
/* ------------------------------------------------------------------ */

const state = {
  mode: 'race', // 'race' | 'solo'
  running: false,
  runToken: 0,  // bumped to cancel an in-flight run
  lbSort: { key: 'score', dir: -1 },
};

function allModelOptions() {
  const group = (label, ids) => {
    const g = el('optgroup', { label });
    for (const id of ids) g.appendChild(el('option', { value: id, text: shortName(id) + '  (' + id.split('/')[0] + ')' }));
    return g;
  };
  const sel = el('select');
  sel.appendChild(group('Decision models', DECISION_MODELS));
  sel.appendChild(group('Text models (for fun)', TEXT_MODELS));
  return sel;
}

function shortName(id) {
  const parts = id.split('/');
  return parts[1] || parts[0];
}

function buildModelSelects() {
  for (const n of [1, 2]) {
    const sel = $('#racer' + n + '-model');
    const typeSel = $('#racer' + n + '-type');
    typeSel.innerHTML = '';
    typeSel.appendChild(el('option', { value: 'model', text: 'Model (API)' }));
    typeSel.appendChild(el('option', { value: 'bot', text: 'Reference bot' }));
    sel.innerHTML = '';
    sel.appendChild(groupOptions());
    typeSel.addEventListener('change', () => {
      sel.innerHTML = '';
      if (typeSel.value === 'bot') {
        for (const b of REFERENCE_BOTS) sel.appendChild(el('option', { value: b.id, text: b.title }));
      } else {
        sel.appendChild(groupOptions());
        if (n === 2) sel.selectedIndex = 1;
      }
    });
    if (n === 2) sel.selectedIndex = 1;
  }
}

function groupOptions() {
  const wrap = document.createDocumentFragment();
  const g1 = el('optgroup', { label: 'Decision models' });
  for (const id of DECISION_MODELS) g1.appendChild(el('option', { value: id, text: shortName(id) }));
  const g2 = el('optgroup', { label: 'Text models (for fun)' });
  for (const id of TEXT_MODELS) g2.appendChild(el('option', { value: id, text: shortName(id) }));
  wrap.appendChild(g1); wrap.appendChild(g2);
  return wrap;
}

/* mode tabs */
$('#mode-race').addEventListener('click', () => setMode('race'));
$('#mode-solo').addEventListener('click', () => setMode('solo'));

function setMode(mode) {
  if (state.running) return;
  state.mode = mode;
  $('#mode-race').classList.toggle('active', mode === 'race');
  $('#mode-solo').classList.toggle('active', mode === 'solo');
  $('#racer2-box').style.display = mode === 'race' ? '' : 'none';
  $('#lane2').classList.toggle('hidden', mode === 'solo');
  $('#start').textContent = mode === 'race' ? 'Start race' : 'Start solo run';
}

/* seed + speed */
$('#seed-random').addEventListener('click', () => {
  $('#seed').value = String(Math.floor(Math.random() * 1e9));
});
$('#seed').value = String(Math.floor(Math.random() * 1e9));
$('#speed').addEventListener('input', () => {
  $('#speed-label').textContent = $('#speed').value + 'ms/tick';
});

/* ------------------------------------------------------------------ */
/* Run orchestration                                                   */
/* ------------------------------------------------------------------ */

function readRacerConfig(n) {
  const type = $('#racer' + n + '-type').value;
  const value = $('#racer' + n + '-model').value;
  const name = ($('#racer' + n + '-name').value || '').trim();
  return { type, value, name };
}

function describeRacer(cfg) {
  if (cfg.type === 'bot') {
    const b = REFERENCE_BOTS.find((x) => x.id === cfg.value) || { title: cfg.value };
    return cfg.name || b.title.replace(' (ref)', '') + ' (ref)';
  }
  return cfg.name || shortName(cfg.value);
}

function buildRacer(cfg, seed) {
  if (cfg.type === 'bot') return makeBotRacer(cfg.value, seed);
  return makeModelRacer(cfg.value);
}

$('#start').addEventListener('click', () => PolliPage.run(startRun));
$('#stop').addEventListener('click', () => {
  state.runToken += 1;
  state.running = false;
  $('#stop').style.display = 'none';
  $('#start').disabled = false;
  setStatus('Stopped.');
});

function setStatus(text, busy) {
  $('#run-status').textContent = text;
  $('#run-dot').style.visibility = busy ? 'visible' : 'hidden';
  $('#run-dot').className = 'status-dot ' + (busy ? 'busy' : '');
}

async function startRun() {
  if (state.running) return;

  const seedRaw = $('#seed').value.trim();
  if (!/^-?\d+$/.test(seedRaw)) { alert('Seed must be an integer.'); return; }
  const seed = parseInt(seedRaw, 10) >>> 0;

  const cfgs = state.mode === 'race'
    ? [readRacerConfig(1), readRacerConfig(2)]
    : [readRacerConfig(1)];

  // guard: model racers need a connected client
  const modelCfgs = cfgs.filter((c) => c.type === 'model');
  if (modelCfgs.length && !PolliPage.client) {
    throw new Error('Racer "' + describeRacer(modelCfgs[0]) + '" is an AI model — connect your Pollen first (button top-right), then start. Tip: reference bots (random / greedy) play for free with no key.');
  }
  if (state.mode === 'race' && cfgs[0].type === 'model' && cfgs[1].type === 'model' && cfgs[0].value === cfgs[1].value) {
    throw new Error('Pick two different racers (or rename them) for a race.');
  }

  state.running = true;
  state.runToken += 1;
  const token = state.runToken;
  $('#start').disabled = true;
  $('#stop').style.display = '';
  $('#winner-banner').style.display = 'none';

  const speed = parseInt($('#speed').value, 10);

  try {
    const lanes = [];
    for (let i = 0; i < cfgs.length; i++) {
      const n = i + 1;
      const cfg = cfgs[i];
      const racer = buildRacer(cfg, seed);
      const game = new Game(seed); // SAME seed for both racers => identical pellets
      lanes.push({
        n, cfg, racer, game,
        moves: [],
        label: describeRacer(cfg),
        color: RACER_COLORS[n],
        canvas: $('#lane' + n + '-canvas'),
        scoreEl: $('#lane' + n + '-score'),
        tickEl: $('#lane' + n + '-tick'),
        logEl: $('#lane' + n + '-log'),
        nameEl: $('#lane' + n + '-name'),
        done: false,
      });
    }

    for (const lane of lanes) {
      lane.nameEl.textContent = lane.label + (lane.racer.isRef ? ' (ref)' : '');
      lane.logEl.textContent = 'seed ' + seed + ' — go!';
      drawGame(lane);
    }
    setStatus(state.mode === 'race' ? 'Racing…' : 'Running…', true);

    await runLanes(lanes, { seed, speed, token, record: true });

    // finish
    const results = lanes.map((lane) => ({
      racer: lane.label,
      model: lane.cfg.type === 'model' ? lane.cfg.value : lane.cfg.value + ' (ref)',
      isRef: lane.racer.isRef,
      mode: state.mode,
      seed,
      score: lane.game.score,
      ticks: lane.game.tick,
      date: new Date().toISOString(),
      moves: lane.moves.slice(),
      cause: lane.game.cause,
    }));
    saveResults(results);

    if (state.mode === 'race') {
      const [a, b] = results;
      const banner = $('#winner-banner');
      let text;
      if (a.score > b.score) text = '🏆 ' + a.racer + ' wins! ' + a.score + ' – ' + b.score;
      else if (b.score > a.score) text = '🏆 ' + b.racer + ' wins! ' + b.score + ' – ' + a.score;
      else text = '🤝 Draw: ' + a.score + ' – ' + b.score + ' (survived ' + a.ticks + ' vs ' + b.ticks + ' ticks)';
      banner.textContent = text;
      banner.style.display = 'block';
      setStatus('Race finished — ' + text);
    } else {
      setStatus('Solo run finished — score ' + results[0].score + ' in ' + results[0].ticks + ' ticks.');
    }
  } finally {
    if (token === state.runToken) {
      state.running = false;
      $('#start').disabled = false;
      $('#stop').style.display = 'none';
      $('#run-dot').style.visibility = 'hidden';
    }
  }
}

/** Run lanes tick-by-tick in parallel, animated. Also used (record:false) for replays. */
async function runLanes(lanes, { speed, token, seed, record }) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (;;) {
    if (token !== undefined && token !== state.runToken) return; // cancelled

    const active = lanes.filter((l) => !l.done);
    if (!active.length) break;

    // 1) ask every active racer for its next move (parallel)
    const movePs = active.map(async (lane) => {
      try {
        const res = await lane.racer.nextMove(lane.game);
        return { lane, dir: res.dir !== undefined ? res.dir : res, res };
      } catch (e) {
        lane.done = true;
        lane.game.alive = false;
        lane.game.cause = 'api-error';
        lane.game.lastEvent = 'API ERROR: ' + e.message;
        return { lane, dir: null, res: null };
      }
    });
    const moves = await Promise.all(movePs);

    if (token !== undefined && token !== state.runToken) return;

    // 2) apply the moves simultaneously (same tick for both lanes)
    for (const { lane, dir, res } of moves) {
      if (lane.done || dir === null) continue;
      if (record) lane.moves.push(dir);
      lane.game.step(dir);
      if (lane.game.lastEvent) pushLog(lane, lane.game.lastEvent, lane.game.cause && !lane.game.alive);
      if (res && res.fallback && record) pushLog(lane, '(unparseable reply — kept current direction)');
      if (res && res.ms !== undefined && record && lane.racer.kind === 'model' && lane.game.tick % 20 === 0) {
        pushLog(lane, 'tick ' + lane.game.tick + ' · last move ' + res.ms + 'ms');
      }
      if (!lane.game.alive) lane.done = true;
    }

    // 3) draw + counters
    for (const lane of lanes) {
      drawGame(lane);
      lane.scoreEl.textContent = 'score ' + lane.game.score;
      lane.tickEl.textContent = 'tick ' + lane.game.tick + '/' + MAX_TICKS;
    }

    await sleep(speed);
  }
}

function pushLog(lane, text, bad) {
  const line = document.createElement('div');
  if (bad) line.style.color = 'var(--bad)';
  line.textContent = text;
  lane.logEl.appendChild(line);
  lane.logEl.scrollTop = lane.logEl.scrollHeight;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function drawGame(lane) {
  const canvas = lane.canvas;
  const ctx = canvas.getContext('2d');
  const cell = canvas.width / GRID;
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke();
  }
  // border
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

  // pellets (gold dots)
  ctx.fillStyle = '#f5c518';
  for (const p of lane.game.pellets) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, cell * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  // snake in racer color
  const col = lane.color;
  const body = lane.game.snake;
  for (let i = body.length - 1; i >= 0; i--) {
    const s = body[i];
    const head = i === 0;
    ctx.fillStyle = head ? col : shade(col, 0.45 + 0.4 * (1 - i / body.length));
    ctx.fillRect(s.x * cell + 1.5, s.y * cell + 1.5, cell - 3, cell - 3);
    if (head) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(s.x * cell + cell * 0.3, s.y * cell + cell * 0.3, cell * 0.14, cell * 0.14);
    }
  }

  if (!lane.game.alive && lane.game.cause && lane.game.cause !== 'ticks') {
    ctx.fillStyle = 'rgba(255, 60, 60, 0.16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold ' + Math.round(cell * 1.1) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (0.35 + 0.65 * amt));
  const g = Math.round(((n >> 8) & 255) * (0.35 + 0.65 * amt));
  const b = Math.round((n & 255) * (0.35 + 0.65 * amt));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/* ------------------------------------------------------------------ */
/* Leaderboard (localStorage) + replay                                 */
/* ------------------------------------------------------------------ */

const LB_KEY = 'polli-arena-results-v1';

function loadResults() {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); } catch (e) { return []; }
}

function saveResults(newOnes) {
  const all = loadResults().concat(newOnes);
  try { localStorage.setItem(LB_KEY, JSON.stringify(all)); } catch (e) { /* storage full */ }
  renderLeaderboard();
}

$('#lb-clear').addEventListener('click', () => {
  if (!confirm('Clear all results?')) return;
  localStorage.removeItem(LB_KEY);
  renderLeaderboard();
});

$('#lb-export').addEventListener('click', () => {
  const data = JSON.stringify(loadResults(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'grid-rush-results.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$$('#lb-table th[data-sort]').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (state.lbSort.key === key) state.lbSort.dir *= -1;
    else state.lbSort = { key, dir: key === 'score' || key === 'ticks' || key === 'seed' ? -1 : 1 };
    renderLeaderboard();
  });
});

function renderLeaderboard() {
  const body = $('#lb-body');
  body.innerHTML = '';
  const rows = loadResults();
  $('#lb-count').textContent = rows.length + ' run' + (rows.length === 1 ? '' : 's');

  const { key, dir } = state.lbSort;
  const sorted = rows.slice().sort((a, b) => {
    const av = a[key], bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  if (!sorted.length) {
    const tr = el('tr', {}, el('td', { colspan: '8', class: 'faint', text: 'No runs yet — start a race above.' }));
    body.appendChild(tr);
    return;
  }

  // update sort arrow hints
  $$('#lb-table th[data-sort]').forEach((th) => {
    th.textContent = th.textContent.replace(/ [↓↑]$/, '');
    if (th.dataset.sort === key) th.textContent += dir === -1 ? ' ↓' : ' ↑';
  });

  for (const r of sorted) {
    const tr = el('tr');
    const racerTd = el('td', { text: r.racer });
    if (r.isRef) { racerTd.className = 'ref'; racerTd.textContent = r.racer + ' (ref)'; }
    tr.appendChild(racerTd);
    tr.appendChild(el('td', { class: 'mono faint', text: r.model }));
    tr.appendChild(el('td', { text: r.mode }));
    tr.appendChild(el('td', { class: 'num', text: String(r.seed) }));
    tr.appendChild(el('td', { class: 'num', text: String(r.score) }));
    tr.appendChild(el('td', { class: 'num', text: String(r.ticks) }));
    tr.appendChild(el('td', { class: 'faint small', text: new Date(r.date).toLocaleString() }));
    const actions = el('td');
    actions.appendChild(el('button', {
      class: 'small ghost', text: '▶ replay',
      onclick: () => replayResult(r),
    }));
    tr.appendChild(actions);
    body.appendChild(tr);
  }
}

/** Replay: re-run the recorded game with the same seed + move list, animated. */
async function replayResult(r) {
  if (state.running) { alert('A run is already in progress — stop it first.'); return; }
  state.running = true;
  state.runToken += 1;
  const token = state.runToken;
  $('#start').disabled = true;
  $('#stop').style.display = '';
  $('#winner-banner').style.display = 'none';

  const speed = parseInt($('#speed').value, 10);
  const useRaceView = state.mode === 'race';

  try {
    const game = new Game(r.seed);
    const lane = {
      n: 1, game, moves: [], color: RACER_COLORS[1],
      label: r.racer + (r.isRef ? ' (ref)' : '') + ' — replay',
      canvas: $('#lane1-canvas'),
      scoreEl: $('#lane1-score'),
      tickEl: $('#lane1-tick'),
      logEl: $('#lane1-log'),
      nameEl: $('#lane1-name'),
      done: false,
    };
    lane.nameEl.textContent = lane.label;
    lane.logEl.textContent = 'replaying seed ' + r.seed + ' · ' + r.moves.length + ' recorded moves';
    drawGame(lane);

    // simple deterministic replayer: feed recorded moves tick by tick
    lane.racer = {
      isRef: r.isRef,
      async nextMove(g) {
        return { dir: lane.moves[g.tick] !== undefined ? lane.moves[g.tick] : g.dir };
      },
    };
    lane.moves = r.moves.slice();

    const lanes = [lane];
    setStatus('Replaying ' + r.racer + ' on seed ' + r.seed + '…', true);
    await runLanes(lanes, { seed: r.seed, speed, token, record: false });

    // verify determinism
    const ok = lane.game.score === r.score && lane.game.tick === r.ticks;
    pushLog(lane, ok
      ? 'replay verified: score ' + lane.game.score + ', ' + lane.game.tick + ' ticks — identical to the recorded run'
      : '⚠ replay mismatch: got score ' + lane.game.score + ' / ' + lane.game.tick + ' ticks (recorded ' + r.score + ' / ' + r.ticks + ')', !ok);
    setStatus(ok ? 'Replay finished — matches the recorded run.' : 'Replay finished with a mismatch (should not happen).');
  } finally {
    if (token === state.runToken) {
      state.running = false;
      $('#start').disabled = false;
      $('#stop').style.display = 'none';
      $('#run-dot').style.visibility = 'hidden';
    }
  }
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

buildModelSelects();
setMode('race');
renderLeaderboard();
