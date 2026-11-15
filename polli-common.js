/**
 * polli-common.js — per-page glue used by every quest app:
 * header, BYOP connect mounting, key state, footer badge.
 * Requires pollinations.js + polli.css.
 *
 * Usage:
 *   PolliPage.init({
 *     title: 'Model Consensus',
 *     tagline: 'One question, every model',
 *     appKey: 'pk_...',
 *     budget: 10, models: 'text', permissions: 'profile usage',
 *     onKey(client) { ... }      // called with a PolliClient when connected
 *     onDisconnect() { ... }
 *   });
 */

const PolliPage = {
  connectEl: null,
  client: null,
  onChange: null,

  init(opts) {
    document.title = opts.title + ' · Pollinations';

    // header
    const header = el('header', { class: 'polli-header' },
      el('div', { class: 'brand' },
        el('span', { class: 'bee', text: opts.bee || '🐝' }),
        el('span', { text: opts.title }),
        el('small', { text: opts.tagline || '' })),
      el('div', { class: 'spacer' }),
      el('span', { id: 'polli-key-status', class: 'chip faint' }, '● no key')
    );
    if (document.body.firstChild) document.body.insertBefore(header, document.body.firstChild);
    else document.body.appendChild(header);

    // BYOP connect
    const connect = installPolliConnect(opts.appKey, opts);
    header.appendChild(connect);
    this.connectEl = connect;
    connect.addEventListener('change', () => {
      if (connect.apiKey) {
        keyStore.set(connect.apiKey);
        this.client = new PolliClient(connect.apiKey);
        this._setStatus(true);
        if (this.onChange) this.onChange(this.client);
        if (opts.onKey) opts.onKey(this.client);
      } else {
        keyStore.clear();
        this.client = null;
        this._setStatus(false);
        if (opts.onDisconnect) opts.onDisconnect();
      }
    });

    // restore session key (component also restores, but be safe)
    const existing = keyStore.get();
    if (existing) {
      this.client = new PolliClient(existing);
      this._setStatus(true, 'session');
      if (opts.onKey) setTimeout(() => opts.onKey(this.client), 0);
    }

    // footer with badge
    const footer = el('footer', { class: 'polli-footer' },
      el('span', { text: 'Credit Pollinations — Made with pollinations.ai' })
    );
    footer.insertAdjacentHTML('beforeend', POLLINATIONS.badgeHtml());
    document.body.appendChild(footer);

    return this;
  },

  _setStatus(on, note) {
    const chip = document.getElementById('polli-key-status');
    if (!chip) return;
    if (on) {
      chip.className = 'chip good';
      chip.textContent = '● pollen connected' + (note === 'session' ? ' (session)' : '');
    } else {
      chip.className = 'chip faint';
      chip.textContent = '● no key';
    }
  },

  /** Current client or throws a friendly error. */
  needClient() {
    if (!this.client) {
      throw new Error('Connect your Pollen first (button top-right), then try again.');
    }
    return this.client;
  },

  /** Safe run: shows errors in a toast-ish box instead of throwing. */
  async run(fn, errBoxSel = '#polli-error') {
    let box = document.querySelector(errBoxSel);
    if (!box) {
      box = el('div', { id: 'polli-error', class: 'error-box', style: 'display:none;margin:12px 0;' });
      const wrap = document.querySelector('.wrap') || document.body;
      wrap.insertBefore(box, wrap.firstChild);
    }
    box.style.display = 'none';
    try {
      return await fn();
    } catch (e) {
      box.textContent = e.message || String(e);
      box.style.display = 'block';
      return null;
    }
  },
};
