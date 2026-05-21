/* ============================================================
   _gb.js — Gallabox shared component system  v3
   Include in every page: <script src="_gb.js"></script>
   Then call: GB.sidebar('web')  — renders sidebar into #gb-sb
   ============================================================ */

var GB = (function () {
  'use strict';

  /* ── SVG ICONS ─────────────────────────────────────────── */
  var ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    convs: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    outbound: null, // polygon — built separately
    web: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  };

  function svgIcon(paths, stroke) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'
      + stroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + paths + '</svg>';
  }

  function outboundSvg(stroke) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'
      + stroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<line x1="22" y1="2" x2="11" y2="13"/>'
      + '<polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }

  /* ── NAV ITEMS CONFIG ───────────────────────────────────── */
  var NAV = [
    { id: 'home',     tip: 'Home',          href: null,                           icon: function(a){ return svgIcon(ICONS.home,     a ? '#60A5FA' : 'rgba(255,255,255,.45)'); } },
    { id: 'convs',    tip: 'Conversations', href: 'gallabox-web-inbox.html',      icon: function(a){ return svgIcon(ICONS.convs,    a ? '#60A5FA' : 'rgba(255,255,255,.45)'); } },
    { id: 'outbound', tip: 'Outbound',      href: 'gallabox-outbound.html', icon: function(a){ return outboundSvg(a ? '#60A5FA' : 'rgba(255,255,255,.45)'); } },
    { id: 'web',      tip: 'Web Agents',    href: 'gallabox-web-empty.html',      icon: function(a){ return svgIcon(ICONS.web,      a ? '#60A5FA' : 'rgba(255,255,255,.45)'); } },
  ];

  /* ── SIDEBAR RENDERER ───────────────────────────────────── */
  function sidebar(activeId) {
    var mount = document.getElementById('gb-sb');
    if (!mount) return;

    var btns = NAV.map(function (item) {
      var isActive = item.id === activeId;
      var cls = 'sbi' + (isActive ? ' sbi-on' : '');
      var onclick = '';
      if (!isActive && item.href) {
        var nav = item.newTab
          ? 'window.open(\'' + item.href + '\',\'_blank\')'
          : 'window.location.href=\'' + item.href + '\'';
        onclick = ' onclick="' + nav + '"';
      }
      return '<button class="' + cls + '"' + onclick + '>'
        + item.icon(isActive)
        + '<span class="sbi-tip">' + item.tip + '</span>'
        + '</button>';
    }).join('');

    /* Utility links — docs + LP — separated from module nav */
    var utilBtns = '<div class="gb-isb-sep"></div>'
      + '<button class="sbi sbi-util" onclick="window.open(\'gallabox-docs.html\',\'_blank\')">'
      + svgIcon(ICONS.book, 'currentColor')
      + '<span class="sbi-tip">Documentation</span></button>'
      + '<button class="sbi sbi-util" onclick="window.open(\'gallabox-web-lp.html\',\'_blank\')">'
      + svgIcon(ICONS.externalLink, 'currentColor')
      + '<span class="sbi-tip">Landing Page</span></button>';

    var settingsBtn = '<button class="sbi sbi-foot">'
      + svgIcon(ICONS.settings, 'currentColor')
      + '<span class="sbi-tip">Settings</span></button>';

    var avatar = '<div class="sbi-av" style="margin-bottom:10px" title="Account">U</div>';

    mount.innerHTML = '<div class="gb-isb">'
      + '<div class="gb-isb-logo">G</div>'
      + '<div class="gb-isb-icons">' + btns + utilBtns + '</div>'
      + settingsBtn
      + avatar
      + '</div>';
  }

  /* ── TOGGLE INIT (DND etc) ──────────────────────────────── */
  function initToggles() {
    document.querySelectorAll('.tog:not([data-gi])').forEach(function (t) {
      t.setAttribute('data-gi', '1');
      t.addEventListener('click', function () {
        t.classList.toggle('on');
        var hint = t.closest('.fg') && t.closest('.fg').querySelector('.fh');
        if (hint) hint.textContent = t.classList.contains('on')
          ? 'DND active — messages queue outside 9am–9pm'
          : 'DND off — sends immediately';
      });
    });
  }

  /* ── PLUS POPUP (canvas node picker) ────────────────────── */
  var NODE_OPTS = {
    'bulk-send':      ['condition', 'wait', 'tag-contact', 'notify-agent', 'exit'],
    'triggered-send': ['condition', 'wait', 'tag-contact', 'notify-agent', 'exit'],
    'condition':      ['bulk-send', 'triggered-send', 'wait', 'tag-contact', 'exit'],
    'wait':           ['condition', 'bulk-send', 'triggered-send', 'tag-contact', 'exit'],
    'tag-contact':    ['bulk-send', 'triggered-send', 'wait', 'exit'],
    'notify-agent':   ['exit'],
    'exit':           [],
    'default':        ['bulk-send', 'triggered-send', 'condition', 'wait', 'tag-contact', 'notify-agent', 'exit'],
  };

  var NODE_META = {
    'bulk-send':      { l: 'Bulk Send',       ic: '📢', bg: 'var(--gb-s)',    d: 'WA template to a segment' },
    'triggered-send': { l: 'Triggered Send',  ic: '🎯', bg: 'var(--purple-s)', d: 'On enrollment or API trigger' },
    'condition':      { l: 'Condition',        ic: '⑃',  bg: 'var(--warn-s)',  d: 'Branch on message status' },
    'wait':           { l: 'Wait',             ic: '⏱', bg: 'var(--n100)',    d: 'Time delay before next step' },
    'tag-contact':    { l: 'Tag Contact',      ic: '🏷', bg: 'var(--ok-s)',    d: 'Add or remove a tag' },
    'notify-agent':   { l: 'Notify Agent',     ic: '👤', bg: 'var(--gb-s)',    d: 'Assign to team member' },
    'exit':           { l: 'Exit Campaign',    ic: '⏹', bg: 'var(--err-s)',   d: 'Remove from flow' },
  };

  var _ppOpen = false;

  function showPP(btn, dynContainerId, onAdd) {
    var pp = document.getElementById('gb-pp');
    if (!pp) return;
    var pt = btn.dataset.parent || 'default';
    var opts = NODE_OPTS[pt] || NODE_OPTS['default'];
    if (!opts || opts.length === 0) { pp.style.display = 'none'; return; }

    var r = btn.getBoundingClientRect();
    pp.style.cssText = 'display:block;top:' + (r.bottom + 6) + 'px;left:'
      + Math.min(r.left, window.innerWidth - 240) + 'px;animation:popIn .15s ease';

    pp.innerHTML = '<div class="gb-pp-title">Add next step</div>'
      + opts.map(function (t) {
          var m = NODE_META[t];
          return '<div class="gb-pp-opt" data-t="' + t + '" onclick="GB._ppAdd(this,\''
            + (dynContainerId || 'gb-dyn') + '\')">'
            + '<div class="gb-pp-oi" style="background:' + m.bg + '">' + m.ic + '</div>'
            + '<div><div class="gb-pp-name">' + m.l + '</div>'
            + '<div class="gb-pp-desc">' + m.d + '</div></div></div>';
        }).join('');

    _ppOpen = true;
    setTimeout(function () {
      document.addEventListener('click', function closer(e) {
        if (!pp.contains(e.target) && e.target !== btn) {
          pp.style.display = 'none'; _ppOpen = false;
          document.removeEventListener('click', closer);
        }
      });
    }, 0);
  }

  function _ppAdd(optEl, dynId) {
    var pp = document.getElementById('gb-pp');
    if (pp) pp.style.display = 'none';
    _ppOpen = false;
    var type = optEl.dataset.t;
    var m = NODE_META[type] || NODE_META['bulk-send'];
    var nid = 'n' + Date.now();
    var w = document.createElement('div');
    w.style.cssText = 'display:flex;flex-direction:column;align-items:center';
    w.innerHTML = '<div class="conn"><div class="conn-line"></div><div class="conn-arr"></div></div>'
      + '<div class="fn" id="' + nid + '" onclick="GB._selNode(this,\'' + type + '\')">'
      + '<div class="fn-hd"><div class="fn-ic" style="background:' + m.bg + '">' + m.ic + '</div>'
      + '<div><div class="fn-ti">' + m.l + '</div>'
      + '<div class="fn-st">Click to configure</div></div></div>'
      + '<div class="fn-bd"><div class="fn-dt" style="color:var(--n400);font-size:12px">'
      + 'New node — select in inspector</div></div></div>'
      + (type === 'exit' ? ''
        : '<div class="plus-row"><button class="plus-btn" data-parent="' + type
          + '" onclick="GB.showPP(this,\'' + dynId + '\')" title="Add next step">+</button></div>');
    var container = document.getElementById(dynId);
    if (container) container.appendChild(w);
  }

  function _selNode(el, type) {
    var m = NODE_META[type] || { l: type };
    var active = document.querySelector('.screen.on') || document.querySelector('.screen.active');
    if (active) active.querySelectorAll('.fn').forEach(function (n) { n.classList.remove('sel'); });
    el.classList.add('sel');
    // Update inspector if it exists
    var ins = document.querySelector('.gb-ins-type');
    if (ins) ins.textContent = m.l;
  }

  /* ── UTILITY HELPERS ────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function today() {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmt(n) {
    return Number(n).toLocaleString();
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ── LOCALSTORAGE HELPERS ────────────────────────────────── */
  var ls = {
    get: function (key, fallback) {
      try { var d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
      catch (e) { return fallback; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    },
  };

  /* ── PUBLIC API ─────────────────────────────────────────── */
  return {
    sidebar: sidebar,
    initToggles: initToggles,
    showPP: showPP,
    _ppAdd: _ppAdd,
    _selNode: _selNode,
    esc: esc,
    today: today,
    fmt: fmt,
    setText: setText,
    ls: ls,
    NODE_META: NODE_META,
    NODE_OPTS: NODE_OPTS,
  };
}());
