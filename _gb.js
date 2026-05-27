/* ============================================================
   _gb.js — Gallabox shared component system  v4
   Include in every page: <script src="_gb.js"></script>
   Then call: GB.sidebar('web')  — renders sidebar into #gb-sb
   ============================================================ */

var GB = (function () {
  'use strict';

  /* ── SVG ICON HELPER ────────────────────────────────────── */
  function ico(paths, color) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'
      + (color || 'currentColor') + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
      + paths + '</svg>';
  }

  var IC = {
    HOME:         '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    INBOX:        '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    CONTACTS:     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    AGENTS:       '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    PIPELINES:    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    WA:           '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    IG:           '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    WEB:          '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    PHONE:        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    INTEGRATIONS: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
    ANALYTICS:    '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    CAMPAIGNS:    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    SETTINGS:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    HELP:         '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    BOOK:         '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    EXTLINK:      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    CHEV_L:       '<polyline points="15 18 9 12 15 6"/>',
    CHEV_R:       '<polyline points="9 18 15 12 9 6"/>',
  };

  var LOGO_SVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#1B58E3"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="rgba(255,255,255,.35)" stroke-width="1" fill="none" stroke-linejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="rgba(255,255,255,.35)" stroke-width="1"/></svg>';

  /* ── SECONDARY NAV CONFIG ───────────────────────────────── */
  var SEC = {
    web: { title: 'Web', items: [
      { label: 'Web Agents',        href: 'gallabox-web-empty.html' },
      { label: 'Channel Settings',  href: 'gallabox-web-channel-settings.html' },
      { label: 'Visitor Analytics', href: 'gallabox-web-visitor-analytics.html' }
    ]},
    campaigns: { title: 'Campaigns', items: [
      { label: 'Analytics',  href: 'outbound-analytics.html' },
      { label: 'Campaigns',  href: 'gallabox-outbound.html' }
    ]}
  };

  /* ── CSS ────────────────────────────────────────────────── */
  var CSS = '#gb-sb{display:flex;flex-direction:row;flex-shrink:0}.gb-isb{display:flex;flex-direction:column;background:#fff;border-right:1px solid #E2E8F0;width:208px;transition:width .2s;overflow:hidden;flex-shrink:0;height:100vh}.gb-isb.collapsed{width:64px}'
    + '.gb-isb-header{display:flex;align-items:center;padding:14px 12px 10px;gap:10px;flex-shrink:0}.gb-isb-logo{display:flex;align-items:center;gap:8px;flex:1;overflow:hidden}.gb-isb-logo-text{font-size:15px;font-weight:700;color:#0F172A;white-space:nowrap;font-family:\'Sora\',sans-serif;letter-spacing:-.02em;transition:opacity .15s}.gb-isb.collapsed .gb-isb-logo-text{opacity:0;pointer-events:none;width:0}'
    + '.gb-isb-toggle{width:26px;height:26px;border:none;background:transparent;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#94A3B8;flex-shrink:0;transition:background .12s}.gb-isb-toggle:hover{background:#F1F5F9;color:#374151}'
    + '.gb-isb-search{margin:0 10px 6px;padding:7px 10px;border:1px solid #E2E8F0;border-radius:8px;display:flex;align-items:center;gap:8px;background:#F8FAFC;cursor:pointer;flex-shrink:0}.gb-isb-search span{font-size:12.5px;color:#94A3B8;flex:1}.gb-isb-search kbd{font-size:10px;color:#94A3B8;background:#fff;border:1px solid #E2E8F0;border-radius:4px;padding:1px 5px}.gb-isb.collapsed .gb-isb-search{padding:8px;justify-content:center}.gb-isb.collapsed .gb-isb-search span,.gb-isb.collapsed .gb-isb-search kbd{display:none}'
    + '.gb-isb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:4px 6px;display:flex;flex-direction:column;gap:1px}.gb-isb-nav::-webkit-scrollbar{width:4px}.gb-isb-nav::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}.gb-isb-sep{height:1px;background:#E2E8F0;margin:6px 0;flex-shrink:0}'
    + '.sbi{display:flex;align-items:center;gap:9px;padding:0 8px;height:34px;width:100%;border:none;background:transparent;cursor:pointer;border-radius:7px;text-align:left;font-family:\'DM Sans\',sans-serif;font-size:13px;font-weight:500;color:#374151;transition:background .1s,color .1s;white-space:nowrap;overflow:hidden;flex-shrink:0}.sbi:hover{background:#F8FAFC}.sbi.sbi-on{background:#EFF4FF;color:#1B58E3}'
    + '.sbi-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:18px}.sbi-label{flex:1;overflow:hidden;text-overflow:ellipsis;transition:opacity .15s,width .15s}.gb-isb.collapsed .sbi-label{opacity:0;width:0}.gb-isb.collapsed .sbi{justify-content:center;padding:0}'
    + '.sbi-badge{font-size:10px;font-weight:700;color:#16A34A;border:1.5px solid #16A34A;border-radius:20px;padding:1px 7px;flex-shrink:0;transition:opacity .15s}.gb-isb.collapsed .sbi-badge{display:none}'
    + '.gb-isb-foot{flex-shrink:0;border-top:1px solid #E2E8F0;padding:10px 6px;display:flex;flex-direction:column;gap:1px}.gb-isb-user{display:flex;align-items:center;gap:10px;padding:8px 10px;cursor:pointer;border-radius:7px;transition:background .1s}.gb-isb-user:hover{background:#F8FAFC}.gb-isb-av{width:28px;height:28px;border-radius:50%;background:#E2E8F0;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center}.gb-isb-av img{width:100%;height:100%;object-fit:cover}'
    + '.gb-isb-userinfo{overflow:hidden;transition:opacity .15s}.gb-isb-userinfo div:first-child{font-size:12.5px;font-weight:600;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gb-isb-userinfo div:last-child{font-size:11px;color:#94A3B8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gb-isb.collapsed .gb-isb-userinfo{opacity:0;width:0}.gb-isb.collapsed .gb-isb-user{justify-content:center;padding:8px 0}'
    + '.gb-secondary{width:200px;background:#fff;border-right:1px solid #E2E8F0;flex-shrink:0;display:flex;flex-direction:column;height:100vh;overflow:hidden;transition:width .2s}.gb-secondary.sec-col{width:32px;min-width:32px}'
    + '.gb-secondary-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 12px 6px;flex-shrink:0}.gb-sec-title{font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}.gb-sec-tog{width:22px;height:22px;border:none;background:transparent;cursor:pointer;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#CBD5E1;transition:background .12s,color .12s;padding:0;flex-shrink:0}.gb-sec-tog:hover{background:#F1F5F9;color:#64748B}'
    + '.gb-secondary.sec-col .gb-secondary-hdr{padding:14px 0 6px;justify-content:center}.gb-secondary.sec-col .gb-sec-title{display:none}'
    + '.gb-secondary-item{display:flex;align-items:center;padding:0 12px;height:34px;cursor:pointer;border-radius:7px;margin:0 8px 2px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .1s,color .1s;white-space:nowrap}.gb-secondary-item:hover{background:#F8FAFC}.gb-secondary-item.active{background:#EFF4FF;color:#1B58E3}.gb-secondary.sec-col .gb-secondary-item{display:none}'
    + '.gb-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}';

  function _injectCSS() {
    if (document.getElementById('_gb-css')) return;
    var s = document.createElement('style');
    s.id = '_gb-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── NAV ITEMS ──────────────────────────────────────────── */
  var NAV_MAIN = [
    { id: 'home',     label: 'Home',           href: null,                              icon: IC.HOME },
    { id: 'inbox',    label: 'Inbox',           href: 'gallabox-web-inbox.html',         icon: IC.INBOX },
    { id: 'contacts', label: 'Contacts',        href: null,                              icon: IC.CONTACTS },
    { id: 'agents',   label: 'AI Agents & Bots',href: 'gallabox-web-empty.html',         icon: IC.AGENTS },
    { id: 'campaigns',label: 'Campaigns',       href: 'gallabox-outbound.html',          icon: IC.CAMPAIGNS },
    { id: 'pipelines',label: 'Pipelines',       href: null,                              icon: IC.PIPELINES, badge: 'New' },
    'sep',
    { id: 'whatsapp', label: 'WhatsApp',        href: null,                              icon: IC.WA,    iconColor: '#25D366' },
    { id: 'instagram',label: 'Instagram',       href: null,                              icon: IC.IG,    iconColor: '#E1306C' },
    { id: 'web',      label: 'Web',             href: 'gallabox-web-empty.html',         icon: IC.WEB },
    { id: 'phone',    label: 'Phone',           href: null,                              icon: IC.PHONE },
    'sep',
    { id: 'integrations', label: 'Integrations', href: null,                            icon: IC.INTEGRATIONS },
  ];

  var NAV_FOOT = [
    { id: 'settings', label: 'Settings',   href: null,                       icon: IC.SETTINGS },
    { id: 'help',     label: 'Help',       href: null,                       icon: IC.HELP },
    { id: 'docs',     label: 'Docs',       href: 'gallabox-docs.html',       icon: IC.BOOK,    newTab: true },
    { id: 'homepage', label: 'Home page',  href: 'index.html',               icon: IC.EXTLINK, newTab: true },
  ];

  /* ── SIDEBAR RENDERER ───────────────────────────────────── */
  function sidebar(activeId) {
    _injectCSS();
    var mount = document.getElementById('gb-sb');
    if (!mount) return;

    var collapsed = localStorage.getItem('gb_nav_collapsed') === '1';
    var collCls = collapsed ? ' collapsed' : '';
    var chevron = collapsed ? IC.CHEV_R : IC.CHEV_L;

    function navItem(item) {
      if (item === 'sep') return '<div class="gb-isb-sep"></div>';
      var isOn = item.id === activeId;
      var cls = 'sbi' + (isOn ? ' sbi-on' : '');
      var onclick = '';
      if (item.href) {
        var nav = item.newTab
          ? 'window.open(\'' + item.href + '\',\'_blank\')'
          : 'window.location.href=\'' + item.href + '\'';
        onclick = ' onclick="' + nav + '"';
      }
      var iconColor = item.iconColor || 'currentColor';
      var badge = item.badge ? '<span class="sbi-badge">' + item.badge + '</span>' : '';
      return '<button class="' + cls + '"' + onclick + '>'
        + '<span class="sbi-icon">' + ico(item.icon, iconColor) + '</span>'
        + '<span class="sbi-label">' + item.label + '</span>'
        + badge
        + '</button>';
    }

    var mainHtml = NAV_MAIN.map(navItem).join('');
    var footItemsHtml = NAV_FOOT.map(navItem).join('');

    var isb = '<div class="gb-isb' + collCls + '" id="gb-isb">'
      /* header */
      + '<div class="gb-isb-header">'
      +   '<div class="gb-isb-logo">' + LOGO_SVG + '<span class="gb-isb-logo-text">gallabox</span></div>'
      +   '<button class="gb-isb-toggle" id="gb-isb-toggle" title="Toggle sidebar">' + ico(chevron) + '</button>'
      + '</div>'
      /* search */
      + '<div class="gb-isb-search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>Search</span><kbd>⌘K</kbd></div>'
      /* main nav */
      + '<div class="gb-isb-nav">'
      +   mainHtml
      +   '<div style="flex:1"></div>'
      + '</div>'
      /* footer */
      + '<div class="gb-isb-foot">'
      +   footItemsHtml
      +   '<div class="gb-isb-sep"></div>'
      +   '<div class="gb-isb-user"><div class="gb-isb-av"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
      +   '<div class="gb-isb-userinfo"><div>Maya Gallabox</div><div>Maya Gallabox account</div></div>'
      +   '</div>'
      + '</div>'
      + '</div>';

    /* secondary panel */
    var secHtml = '';
    if (SEC[activeId]) {
      var sec = SEC[activeId];
      var href = window.location.href;
      var secItems = sec.items.map(function (it) {
        var isActive = false;
        if (activeId === 'web') {
          isActive = href.indexOf('channel-settings') !== -1
            ? it.href.indexOf('channel-settings') !== -1
            : href.indexOf('visitor-analytics') !== -1
              ? it.href.indexOf('visitor-analytics') !== -1
              : it.href === 'gallabox-web-empty.html';
        } else if (activeId === 'campaigns') {
          isActive = href.indexOf('analytics') !== -1
            ? it.href.indexOf('analytics') !== -1
            : it.href === 'gallabox-outbound.html';
        }
        return '<a class="gb-secondary-item' + (isActive ? ' active' : '') + '" href="' + it.href + '">' + it.label + '</a>';
      }).join('');
      var secCol = localStorage.getItem('gb_sec_col') === '1';
      var secChev = secCol ? IC.CHEV_R : IC.CHEV_L;
      secHtml = '<div class="gb-secondary' + (secCol ? ' sec-col' : '') + '" id="gb-sec">'
        + '<div class="gb-secondary-hdr">'
        + '<span class="gb-sec-title">' + sec.title + '</span>'
        + '<button class="gb-sec-tog" id="gb-sec-tog" title="Collapse panel">' + ico(secChev) + '</button>'
        + '</div>'
        + secItems
        + '</div>';
    }

    mount.innerHTML = isb + secHtml;

    document.getElementById('gb-isb-toggle').addEventListener('click', function () {
      var next = localStorage.getItem('gb_nav_collapsed') === '1' ? '0' : '1';
      localStorage.setItem('gb_nav_collapsed', next);
      sidebar(activeId);
    });

    var secTog = document.getElementById('gb-sec-tog');
    if (secTog) {
      secTog.addEventListener('click', function () {
        var next = localStorage.getItem('gb_sec_col') === '1' ? '0' : '1';
        localStorage.setItem('gb_sec_col', next);
        sidebar(activeId);
      });
    }
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

  function fmt(n) { return Number(n).toLocaleString(); }

  /* number → text abbreviation (1400 → "1.4K") */
  function nt(n) {
    n = Number(n);
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  /* number → integer string (safe null) */
  function ni(n) { return n == null ? '0' : String(Math.round(Number(n))); }

  /* ratio → percentage string (0.754 → "75.4%") */
  function pct(numerator, denominator) {
    if (!denominator) return '0%';
    return (numerator / denominator * 100).toFixed(1).replace(/\.0$/, '') + '%';
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ── LOCALSTORAGE HELPERS ───────────────────────────────── */
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
    sidebar:      sidebar,
    initToggles:  initToggles,
    showPP:       showPP,
    _ppAdd:       _ppAdd,
    _selNode:     _selNode,
    esc:          esc,
    today:        today,
    fmt:          fmt,
    nt:           nt,
    ni:           ni,
    pct:          pct,
    setText:      setText,
    ls:           ls,
    NODE_META:    NODE_META,
    NODE_OPTS:    NODE_OPTS,
  };
}());
