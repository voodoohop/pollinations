/**
 * pollinations.js — shared client helpers for all Pollinations quest apps.
 * No build step: include with <script src="pollinations.js"></script>.
 *
 * Credit Pollinations — Made with pollinations.ai
 */

const POLLINATIONS = {
  GEN_BASE: 'https://gen.pollinations.ai',
  AUTH_BASE: 'https://enter.pollinations.ai',
  CONNECT_JS:
    'https://cdn.jsdelivr.net/npm/@pollinations/ui@0.1.0-alpha.20/dist/connect.js',
  BADGE_SVG:
    'https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg',
  badgeHtml() {
    return (
      '<a class="polli-badge" href="https://pollinations.ai/?ref=badge" target="_blank" rel="noopener">' +
      '<img src="' + this.BADGE_SVG + '" alt="Made with pollinations.ai" width="212" height="40"></a>'
    );
  },
};

/* ------------------------------------------------------------------ */
/* BYOP (Bring Your Own Pollen) helpers                                */
/* ------------------------------------------------------------------ */

/**
 * Install the <polli-connect> web component for a given app key.
 * Returns the element so the caller can listen for 'change'.
 */
function installPolliConnect(appKey, opts = {}) {
  if (!document.querySelector('script[data-polli-connect]')) {
    const s = document.createElement('script');
    s.src = POLLINATIONS.CONNECT_JS;
    s.defer = true;
    s.dataset.polliConnect = '1';
    document.head.appendChild(s);
  }
  const el = document.createElement('polli-connect');
  el.setAttribute('app-key', appKey);
  if (opts.budget) el.setAttribute('budget', String(opts.budget));
  if (opts.expiry) el.setAttribute('expiry', String(opts.expiry));
  if (opts.models) el.setAttribute('models', opts.models);
  if (opts.permissions) el.setAttribute('permissions', opts.permissions);
  if (opts.hideBuyPollen) el.setAttribute('hide-buy-pollen', '');
  return el;
}

/** Wait until the connect element has an apiKey (or null after disconnect). */
function waitForKey(connectEl, timeoutMs = 15 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout waiting for key')), timeoutMs);
    const check = () => {
      if (connectEl && connectEl.apiKey) {
        clearTimeout(t);
        resolve(connectEl.apiKey);
        return true;
      }
      return false;
    };
    if (check()) return;
    if (connectEl) connectEl.addEventListener('change', () => check());
  });
}

/** Store/restore a user key in sessionStorage (survives reloads, not tabs). */
const keyStore = {
  set(k) {
    try { sessionStorage.setItem('polli_sk', k); } catch (e) { /* private mode */ }
  },
  get() {
    try { return sessionStorage.getItem('polli_sk'); } catch (e) { return null; }
  },
  clear() {
    try { sessionStorage.removeItem('polli_sk'); } catch (e) { /* noop */ }
  },
};

/* ------------------------------------------------------------------ */
/* API client                                                          */
/* ------------------------------------------------------------------ */

class PolliClient {
  /**
   * @param {string|null} apiKey  user sk_ key (BYOP). When null, calls that
   *                              require auth will throw a friendly error.
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey;
  }

  requireKey() {
    if (!this.apiKey) {
      throw new Error(
        'Connect your Pollen first: press the Connect button (top of the page).'
      );
    }
    return this.apiKey;
  }

  /** POST /v1/chat/completions (non-streaming). */
  async chat(model, messages, { temperature = 0.7, maxTokens = 1024, signal } = {}) {
    const res = await fetch(POLLINATIONS.GEN_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.requireKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error('chat failed (' + res.status + '): ' + body.slice(0, 300));
    }
    return res.json();
  }

  /** POST /v1/chat/completions with stream:true; calls onDelta(textChunk). */
  async chatStream(model, messages, { temperature = 0.7, maxTokens = 2048, signal, onDelta } = {}) {
    const res = await fetch(POLLINATIONS.GEN_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.requireKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
      signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error('chat failed (' + res.status + '): ' + body.slice(0, 300));
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          const j = JSON.parse(data);
          const delta = j.choices && j.choices[0] && j.choices[0].delta;
          const piece = delta && (delta.content || (delta.reasoning_content && ''));
          if (piece && onDelta) onDelta(piece, j);
        } catch (e) { /* keep-alive or partial */ }
      }
    }
  }

  /** GET an image URL (browser <img> usage; no custom headers needed). */
  imageUrl(prompt, { model = 'black-forest-labs/flux.1-schnell', width = 1024, height = 1024, seed, nologo = true } = {}) {
    const u = new URL(POLLINATIONS.GEN_BASE + '/image/' + encodeURIComponent(prompt));
    u.searchParams.set('model', model);
    u.searchParams.set('width', String(width));
    u.searchParams.set('height', String(height));
    if (seed !== undefined) u.searchParams.set('seed', String(seed));
    if (nologo) u.searchParams.set('nologo', 'true');
    const key = this.apiKey || keyStore.get();
    if (key) u.searchParams.set('key', key);
    return u.toString();
  }

  /** GET /audio/{voice}/{text} → audio URL for <audio> playback. */
  audioUrl(text, { voice = 'alloy', model = 'openai/tts-1' } = {}) {
    const u = new URL(POLLINATIONS.GEN_BASE + '/audio/' + encodeURIComponent(voice) + '/' + encodeURIComponent(text));
    u.searchParams.set('model', model);
    const key = this.apiKey || keyStore.get();
    if (key) u.searchParams.set('key', key);
    return u.toString();
  }

  /** GET /v1/models — public, no auth needed. */
  async models() {
    const res = await fetch(POLLINATIONS.GEN_BASE + '/v1/models');
    if (!res.ok) throw new Error('models fetch failed: ' + res.status);
    const j = await res.json();
    return j.data || j;
  }

  /** GET /account/balance with the user key. */
  async balance() {
    const res = await fetch(POLLINATIONS.GEN_BASE + '/account/balance', {
      headers: { Authorization: 'Bearer ' + this.requireKey() },
    });
    if (!res.ok) throw new Error('balance failed: ' + res.status);
    return res.json();
  }
}

/* ------------------------------------------------------------------ */
/* Small DOM / misc utilities                                          */
/* ------------------------------------------------------------------ */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, String(v));
  }
  for (const c of children) {
    if (c === null || c === undefined) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function fmtMs(ms) {
  return ms < 1000 ? Math.round(ms) + 'ms' : (ms / 1000).toFixed(1) + 's';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
