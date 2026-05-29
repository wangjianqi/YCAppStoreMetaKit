const { getLocaleUrl } = require('../core/loadMetadata');
const { LIMITS, SCREENSHOT_LIMITS, SCREENSHOT_RESOLUTIONS } = require('../core/schema');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function preparePayload(metadata, validationReport) {
  const locales = {};
  for (const locale of metadata.configuredLocales) {
    const data = metadata.locales[locale] || {};
    const m = data.metadata || {};
    locales[locale] = {
      metadata: m,
      review: data.review || {},
      compliance: data.compliance || {},
      screenshots: metadata.screenshots[locale] || {},
      urls: {
        privacy: getLocaleUrl(metadata.config, 'privacy', locale),
        terms: getLocaleUrl(metadata.config, 'terms', locale),
        support: getLocaleUrl(metadata.config, 'support', locale),
        marketing: getLocaleUrl(metadata.config, 'marketing', locale)
      },
      assets: {
        screenshots: (metadata.assets?.screenshots?.[locale]) || {},
        videos: (metadata.assets?.videos?.[locale]) || {}
      }
    };
  }
  return {
    app: metadata.config.app || {},
    company: metadata.config.company || {},
    store: metadata.config.store || {},
    features: metadata.config.features || {},
    locales,
    localeOrder: metadata.configuredLocales,
    validationReport,
    limits: LIMITS,
    screenshotLimits: SCREENSHOT_LIMITS,
    screenshotResolutions: SCREENSHOT_RESOLUTIONS,
    generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
}

function generateHtml(metadata, validationReport) {
  const payload = preparePayload(metadata, validationReport);
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(payload.app.app_store_name || payload.app.internal_name || 'App Store Metadata')}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23007aff'/><text x='50' y='68' font-size='52' font-family='system-ui' font-weight='bold' fill='white' text-anchor='middle'>Y</text></svg>" />
  <style>
    :root {
      --bg: #f5f5f7;
      --card: rgba(255, 255, 255, 0.86);
      --text: #1d1d1f;
      --muted: #515154;
      --line: rgba(0,0,0,0.08);
      --blue: #007aff;
      --green: #0a7f37;
      --red: #c62828;
      --yellow: #8a5a00;
      --shadow: 0 18px 45px rgba(0,0,0,0.08);
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 16px;
      --space-lg: 24px;
      --space-xl: 32px;
      --sidebar-w: 260px;
    }
    [data-theme="dark"] {
      --bg: #111113; --card: rgba(30,30,32,0.88); --text: #f5f5f7; --muted: #b0b0b5; --line: rgba(255,255,255,0.1); --shadow: 0 18px 45px rgba(0,0,0,0.3);
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg: #111113; --card: rgba(30,30,32,0.88); --text: #f5f5f7; --muted: #b0b0b5; --line: rgba(255,255,255,0.1); --shadow: 0 18px 45px rgba(0,0,0,0.3);
      }
    }
    * { box-sizing: border-box; }
    .skip-link { position: absolute; top: -100px; left: 8px; background: var(--blue); color: #fff; padding: 8px 16px; border-radius: var(--radius-sm); z-index: 9999; font-weight: 600; }
    .skip-link:focus { top: 8px; }
    body { margin: 0; font-family: var(--sans); background: radial-gradient(circle at top left, rgba(0,122,255,.12), transparent 32%), var(--bg); color: var(--text); }
    .app { display: grid; grid-template-columns: var(--sidebar-w) minmax(0, 1fr); min-height: 100vh; }
    aside { border-right: 1px solid var(--line); padding: var(--space-lg) 18px; position: sticky; top: 0; height: 100vh; overflow-y: auto; background: rgba(255,255,255,.38); backdrop-filter: blur(22px); display: flex; flex-direction: column; }
    [data-theme="dark"] aside { background: rgba(16,16,18,.5); }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) aside { background: rgba(16,16,18,.5); } }
    aside::-webkit-scrollbar { width: 4px; }
    aside::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
    .brand { font-size: 13px; color: var(--muted); margin-bottom: var(--space-sm); }
    h1 { font-size: clamp(18px, 4vw, 24px); line-height: 1.12; margin: 0 0 10px; letter-spacing: -0.02em; }
    .meta { color: var(--muted); font-size: 13px; line-height: 1.55; }
    .nav { margin-top: var(--space-lg); display: grid; gap: var(--space-sm); flex: 1; }
    .nav a { text-decoration: none; color: var(--text); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 10px 12px; font-size: 14px; background: rgba(255,255,255,.35); transition: border-color .15s, color .15s, background .15s; }
    .nav a:hover, .nav a.active { border-color: rgba(0,122,255,.45); color: var(--blue); background: rgba(0,122,255,.06); }
    .sidebar-footer { margin-top: auto; padding-top: var(--space-md); border-top: 1px solid var(--line); }
    .sidebar-footer .generated-at { font-size: 11px; color: var(--muted); }
    .theme-toggle { background: none; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; color: var(--text); font-size: 13px; margin-top: var(--space-sm); width: 100%; }
    .theme-toggle:hover { border-color: var(--blue); color: var(--blue); }
    main { padding: 28px; max-width: 1180px; width: 100%; transition: opacity .15s; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-lg); }
    .locale-group { display: flex; align-items: center; gap: var(--space-sm); }
    .locale-select { appearance: none; border: 1px solid var(--line); background: var(--card); color: var(--text); border-radius: var(--radius-md); padding: 10px 14px; font-size: 15px; }
    .locale-badge { font-size: 13px; color: var(--muted); font-family: var(--mono); }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    button { border: 0; border-radius: 12px; padding: 9px 12px; background: var(--blue); color: white; font-weight: 600; cursor: pointer; min-height: 44px; transition: filter .15s; }
    button.secondary { background: rgba(127,127,127,.18); color: var(--text); }
    button:hover { filter: brightness(.92); }
    button:focus-visible, a:focus-visible, select:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
    section { margin: 28px 0; scroll-margin-top: 18px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
    h2 { font-size: clamp(18px, 4vw, 22px); margin: 0 0 var(--space-md); letter-spacing: -0.015em; }
    .collapse-btn { background: none; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 4px 8px; cursor: pointer; color: var(--muted); font-size: 12px; }
    .collapse-btn:hover { color: var(--text); border-color: var(--blue); }
    .section-body { transition: max-height .3s ease, opacity .2s ease; overflow: hidden; }
    .section-body.collapsed { max-height: 0 !important; opacity: 0; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-md); }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: var(--space-md); box-shadow: var(--shadow); backdrop-filter: blur(24px); transition: box-shadow .2s; }
    .card.full { grid-column: 1 / -1; }
    .card.highlight { box-shadow: 0 0 0 2px var(--blue), var(--shadow); }
    .field-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .field-title { font-weight: 700; }
    .field-meta { display: flex; align-items: center; gap: var(--space-sm); }
    .counter { color: var(--muted); font-size: 13px; font-family: var(--mono); }
    .counter.ok { color: var(--green); }
    .counter.bad { color: var(--red); }
    .progress-bar { width: 60px; height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; }
    .progress-bar .fill { height: 100%; border-radius: 2px; transition: width .3s, background .3s; }
    .progress-bar .fill.ok { background: var(--green); }
    .progress-bar .fill.warn { background: var(--yellow); }
    .progress-bar .fill.bad { background: var(--red); }
    .value { white-space: pre-wrap; word-break: break-word; font-size: clamp(13px, 2.5vw, 14px); line-height: 1.55; color: var(--text); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 12px; background: rgba(127,127,127,.06); max-height: 360px; overflow: auto; position: relative; }
    .value.scrollable::after { content: ''; position: sticky; bottom: 0; left: 0; right: 0; height: 24px; background: linear-gradient(transparent, rgba(127,127,127,.06)); pointer-events: none; }
    .kv { display: grid; grid-template-columns: auto 1fr; gap: var(--space-sm) var(--space-md); font-size: 14px; }
    .kv div:nth-child(odd) { color: var(--muted); white-space: nowrap; }
    .kv a { color: var(--blue); text-decoration: none; word-break: break-all; }
    .kv a:hover { text-decoration: underline; }
    .status { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 8px; font-size: 12px; font-weight: 700; }
    .status.ok { background: rgba(10,127,55,.12); color: var(--green); }
    .status.warn { background: rgba(138,90,0,.14); color: var(--yellow); }
    .status.error { background: rgba(198,40,40,.12); color: var(--red); }
    .report-header { display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md); flex-wrap: wrap; }
    .pass-rate { width: 48px; height: 48px; position: relative; }
    .pass-rate svg { transform: rotate(-90deg); }
    .pass-rate .label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    ul.report { margin: 0; padding-left: 20px; line-height: 1.8; }
    ul.report li { cursor: pointer; border-radius: var(--radius-sm); padding: 2px 4px; margin: 2px 0; transition: background .15s; }
    ul.report li:hover { background: rgba(0,122,255,.08); }
    .screenshot { border: 1px solid var(--line); border-radius: var(--radius-md); padding: 12px; margin: 10px 0; }
    .screenshot strong { display: block; margin-bottom: 4px; }
    .screenshot-meta { display: flex; gap: var(--space-md); margin-top: var(--space-xs); }
    .screenshot-counter { font-size: 12px; font-family: var(--mono); color: var(--muted); }
    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin: 10px 0; }
    .media-item { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; background: var(--card); cursor: pointer; transition: box-shadow .15s; }
    .media-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
    .media-item img { width: 100%; height: auto; display: block; }
    .media-item video { width: 100%; height: auto; display: block; background: #000; }
    .media-item .media-label { padding: var(--space-sm) 10px; font-size: 12px; color: var(--muted); }
    .media-set-title { font-weight: 700; margin: 14px 0 6px; font-size: 15px; }
    .media-set-info { font-size: 12px; color: var(--muted); margin-left: var(--space-sm); }
    .lightbox { display: none; position: fixed; inset: 0; z-index: 9990; background: rgba(0,0,0,.92); align-items: center; justify-content: center; }
    .lightbox.open { display: flex; }
    .lightbox img { max-width: 92vw; max-height: 92vh; object-fit: contain; border-radius: var(--radius-sm); }
    .lightbox-close { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,.15); color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,.15); color: #fff; border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 22px; cursor: pointer; }
    .lightbox-prev { left: 16px; }
    .lightbox-next { right: 16px; }
    .appstore-preview { background: #fff; border-radius: var(--radius-lg); overflow: hidden; max-width: 420px; margin: 0 auto; box-shadow: var(--shadow); }
    [data-theme="dark"] .appstore-preview { background: #1c1c1e; }
    .asp-header { padding: var(--space-lg); display: flex; gap: var(--space-md); align-items: flex-start; }
    .asp-icon { width: 72px; height: 72px; border-radius: var(--radius-md); background: linear-gradient(135deg, #007aff, #5856d6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700; flex-shrink: 0; }
    .asp-info { flex: 1; min-width: 0; }
    .asp-name { font-size: 18px; font-weight: 700; color: #1d1d1f; margin-bottom: 2px; }
    [data-theme="dark"] .asp-name { color: #f5f5f7; }
    .asp-subtitle { font-size: 14px; color: #86868b; margin-bottom: 8px; }
    .asp-btn { display: inline-block; background: #007aff; color: #fff; border-radius: 16px; padding: 6px 20px; font-size: 14px; font-weight: 700; }
    .asp-screenshots { display: flex; gap: 10px; overflow-x: auto; padding: 0 var(--space-lg) var(--space-md); scroll-snap-type: x mandatory; }
    .asp-screenshots img { height: 280px; border-radius: var(--radius-md); scroll-snap-align: start; flex-shrink: 0; }
    .asp-section { padding: var(--space-md) var(--space-lg); border-top: 1px solid #e5e5ea; }
    [data-theme="dark"] .asp-section { border-top-color: rgba(255,255,255,.1); }
    .asp-section-title { font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: var(--space-sm); }
    [data-theme="dark"] .asp-section-title { color: #f5f5f7; }
    .asp-text { font-size: 14px; color: #3a3a3c; line-height: 1.5; }
    [data-theme="dark"] .asp-text { color: #a1a1a6; }
    .asp-text.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .asp-expand { color: #007aff; font-size: 14px; cursor: pointer; background: none; border: none; padding: 4px 0; min-height: auto; font-weight: 400; }
    .asp-expand:hover { filter: none; text-decoration: underline; }
    .asp-meta-row { display: flex; justify-content: space-between; padding: var(--space-sm) 0; border-bottom: 1px solid #e5e5ea; font-size: 13px; }
    [data-theme="dark"] .asp-meta-row { border-bottom-color: rgba(255,255,255,.1); }
    .asp-meta-row .label { color: #86868b; }
    .asp-meta-row .val { color: #007aff; font-weight: 500; }
    .keywords-analysis { margin-top: var(--space-sm); font-size: 13px; color: var(--muted); }
    .keywords-analysis .kw-dup { color: var(--red); font-weight: 600; }
    .keywords-analysis .kw-appname { color: var(--yellow); font-weight: 600; }
    .empty-state { text-align: center; padding: var(--space-xl); color: var(--muted); }
    .empty-state .empty-icon { font-size: 32px; margin-bottom: var(--space-sm); opacity: .5; }
    .back-to-top { position: fixed; bottom: 24px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: var(--blue); color: #fff; border: none; font-size: 20px; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,.2); z-index: 100; transition: opacity .2s; }
    .back-to-top.visible { display: flex; }
    .mobile-header { display: none; position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.8); backdrop-filter: blur(22px); padding: 12px var(--space-md); border-bottom: 1px solid var(--line); align-items: center; gap: var(--space-sm); }
    [data-theme="dark"] .mobile-header { background: rgba(16,16,18,.8); }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .mobile-header { background: rgba(16,16,18,.8); } }
    .hamburger { background: none; border: none; color: var(--text); font-size: 22px; cursor: pointer; padding: var(--space-sm); min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: center; }
    .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 60; }
    .drawer-overlay.open { display: block; }
    @media (max-width: 900px) {
      .app { grid-template-columns: 1fr; }
      aside { position: fixed; left: -280px; top: 0; height: 100vh; width: var(--sidebar-w); z-index: 70; transition: left .25s ease; background: var(--bg); }
      aside.open { left: 0; }
      .mobile-header { display: flex; }
      .grid { grid-template-columns: 1fr; }
      .topbar { align-items: flex-start; flex-direction: column; }
      .media-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .appstore-preview { max-width: 100%; }
    }
    @media print {
      aside, .mobile-header, .drawer-overlay, .back-to-top, button, .collapse-btn, .theme-toggle { display: none !important; }
      .app { grid-template-columns: 1fr; }
      .card { box-shadow: none; border: 1px solid #ccc; break-inside: avoid; }
      .value { max-height: none; }
      .section-body.collapsed { max-height: none !important; opacity: 1 !important; }
      body { background: #fff; color: #000; }
      .appstore-preview { box-shadow: none; border: 1px solid #ccc; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div class="app">
    <aside id="sidebar">
      <div class="brand">YCAppStoreMetaKit</div>
      <h1 id="appTitle"></h1>
      <div class="meta" id="appMeta"></div>
      <nav class="nav" id="sideNav" aria-label="Section navigation">
        <a href="#appstore-preview" data-section="appstore-preview">App Store Preview</a>
        <a href="#app-info" data-section="app-info">App Information</a>
        <a href="#version" data-section="version">Version Metadata</a>
        <a href="#legal" data-section="legal">Legal URLs</a>
        <a href="#review" data-section="review">Review Notes</a>
        <a href="#compliance" data-section="compliance">Compliance Notes</a>
        <a href="#screenshots" data-section="screenshots">Screenshot Copy</a>
        <a href="#media" data-section="media">Screenshots &amp; Videos</a>
        <a href="#validation" data-section="validation">Validation Report</a>
        <a href="#fastlane" data-section="fastlane">Fastlane Export</a>
      </nav>
      <div class="sidebar-footer">
        <div class="generated-at" id="generatedAt"></div>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">&#9790; Dark Mode</button>
      </div>
    </aside>
    <div class="drawer-overlay" id="drawerOverlay"></div>
    <div class="mobile-header" id="mobileHeader">
      <button class="hamburger" id="hamburger" aria-label="Open navigation">&#9776;</button>
      <select id="localeSelectMobile" class="locale-select" aria-label="Select locale"></select>
    </div>
    <main id="main-content">
      <div class="topbar">
        <div class="locale-group">
          <select id="localeSelect" class="locale-select" aria-label="Select locale"></select>
          <span class="locale-badge" id="localeBadge"></span>
        </div>
        <div class="actions">
          <button data-action="copy-all">Copy All for Current Locale</button>
          <button class="secondary" data-action="copy-review">Copy Review Notes</button>
        </div>
      </div>
      <section id="appstore-preview"><div class="section-header"><h2>App Store Preview</h2></div><div class="section-body" id="appstorePreviewBody"></div></section>
      <section id="app-info"><div class="section-header"><h2>App Information</h2><button class="collapse-btn" data-collapse="app-info">Collapse</button></div><div class="section-body" id="appInfoBody"><div class="card"><div class="kv" id="appInfo"></div></div></div></section>
      <section id="version"><div class="section-header"><h2>Version Metadata</h2><button class="collapse-btn" data-collapse="version">Collapse</button></div><div class="section-body" id="versionBody"><div class="grid" id="versionGrid"></div></div></section>
      <section id="legal"><div class="section-header"><h2>Legal URLs</h2><button class="collapse-btn" data-collapse="legal">Collapse</button></div><div class="section-body" id="legalBody"><div class="grid" id="legalGrid"></div></div></section>
      <section id="review"><div class="section-header"><h2>Review Notes</h2><button class="collapse-btn" data-collapse="review">Collapse</button></div><div class="section-body" id="reviewBody"><div class="grid" id="reviewGrid"></div></div></section>
      <section id="compliance"><div class="section-header"><h2>Compliance Notes</h2><button class="collapse-btn" data-collapse="compliance">Collapse</button></div><div class="section-body" id="complianceBody"><div class="grid" id="complianceGrid"></div></div></section>
      <section id="screenshots"><div class="section-header"><h2>Screenshot Copy</h2><button class="collapse-btn" data-collapse="screenshots">Collapse</button></div><div class="section-body" id="screenshotsBody"><div class="grid" id="screenshotsGrid"></div></div></section>
      <section id="media"><div class="section-header"><h2>Screenshots &amp; Videos</h2><button class="collapse-btn" data-collapse="media">Collapse</button></div><div class="section-body" id="mediaBody"><div class="grid" id="mediaGrid"></div></div></section>
      <section id="validation"><div class="section-header"><h2>Validation Report</h2><button class="collapse-btn" data-collapse="validation">Collapse</button></div><div class="section-body" id="validationBody"><div class="grid" id="validationGrid"></div></div></section>
      <section id="fastlane"><div class="section-header"><h2>Fastlane Export Preview</h2><button class="collapse-btn" data-collapse="fastlane">Collapse</button></div><div class="section-body" id="fastlaneBody"><div class="grid" id="fastlaneGrid"></div></div></section>
    </main>
  </div>
  <div class="lightbox" id="lightbox">
    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
    <img id="lightboxImg" src="" alt="Screenshot preview" />
    <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
  </div>
  <button class="back-to-top" id="backToTop" aria-label="Back to top">&#8593;</button>
<script>
const DATA = ${json};
const LIMITS = DATA.limits;
const SL = DATA.screenshotLimits;
const RES = DATA.screenshotResolutions;
let currentLocale = location.hash.slice(1) || DATA.store.default_locale || DATA.localeOrder[0];
if (!DATA.localeOrder.includes(currentLocale)) currentLocale = DATA.localeOrder[0];

const $ = (id) => document.getElementById(id);
const text = (v) => v == null ? '' : String(v);
const charCount = (v) => Array.from(text(v)).length;
const byteCount = (v) => new TextEncoder().encode(text(v)).length;
function escapeHTML(s) { return text(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }

function copyText(value, btn) {
  const doCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text(value));
    const ta = document.createElement('textarea');
    ta.value = text(value);
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  };
  doCopy().then(() => {
    if (btn) { const old = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = old, 1200); }
  }).catch(() => {});
}

function counter(value, limit, unit) {
  const count = unit === 'bytes' ? byteCount(value) : charCount(value);
  const bad = limit && count > limit;
  const pct = limit ? Math.min((count / limit) * 100, 100) : 0;
  const cls = !limit ? 'ok' : pct < 70 ? 'ok' : pct < 90 ? 'warn' : 'bad';
  const bar = limit ? '<div class="progress-bar"><div class="fill ' + cls + '" style="width:' + pct + '%"></div></div>' : '';
  return '<span class="counter ' + (bad ? 'bad' : cls) + '">' + count + (limit ? '/' + limit : '') + ' ' + (unit === 'bytes' ? 'bytes' : 'chars') + '</span>' + bar;
}

function fieldCard(title, value, limit, unit, full, fieldId) {
  const fullCls = full ? ' full' : '';
  const dataAttr = fieldId ? ' data-field="' + escapeHTML(fieldId) + '"' : '';
  return '<div class="card' + fullCls + '"' + dataAttr + '><div class="field-head"><div><div class="field-title">' + escapeHTML(title) + '</div><div class="field-meta">' + counter(value, limit, unit) + '</div></div><button class="secondary" data-action="copy" data-value="' + escapeHTML(text(value)) + '">Copy</button></div><div class="value">' + escapeHTML(value) + '</div></div>';
}

function urlCard(title, url) {
  if (!url) return '<div class="card"><div class="field-head"><div class="field-title">' + escapeHTML(title) + '</div></div><div class="value" style="color:var(--muted)">Not configured</div></div>';
  return '<div class="card"><div class="field-head"><div class="field-title">' + escapeHTML(title) + '</div></div><div class="value"><a href="' + escapeHTML(url) + '" target="_blank" rel="noopener">' + escapeHTML(url) + '</a></div></div>';
}

function localeCompletion(locale) {
  const item = DATA.locales[locale] || {};
  const m = item.metadata || {};
  const fields = ['name','subtitle','promotional_text','description','keywords','whats_new'];
  let filled = 0;
  for (const f of fields) { if (m[f] && String(m[f]).trim()) filled++; }
  return Math.round((filled / fields.length) * 100);
}

function passRateCircle(report) {
  const total = report.errors.length + report.warnings.length + report.passed.length;
  if (total === 0) return '';
  const rate = Math.round((report.passed.length / total) * 100);
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (rate / 100) * c;
  const color = rate >= 80 ? 'var(--green)' : rate >= 50 ? 'var(--yellow)' : 'var(--red)';
  return '<div class="pass-rate"><svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="24" cy="24" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '" stroke-linecap="round"/></svg><div class="label" style="color:' + color + '">' + rate + '%</div></div>';
}

let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(images, index) {
  lightboxImages = images;
  lightboxIndex = index;
  $('lightboxImg').src = lightboxImages[lightboxIndex];
  $('lightbox').classList.add('open');
  document.addEventListener('keydown', lightboxKeyHandler);
}

function closeLightbox() {
  $('lightbox').classList.remove('open');
  document.removeEventListener('keydown', lightboxKeyHandler);
}

function lightboxKeyHandler(e) {
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft' && lightboxIndex > 0) { lightboxIndex--; $('lightboxImg').src = lightboxImages[lightboxIndex]; }
  else if (e.key === 'ArrowRight' && lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; $('lightboxImg').src = lightboxImages[lightboxIndex]; }
}

function render() {
  try {
    const locale = currentLocale;
    const item = DATA.locales[locale] || {};
    const m = item.metadata || {};
    $('appTitle').textContent = DATA.app.app_store_name || DATA.app.internal_name || 'App Store Metadata';
    $('appMeta').innerHTML = 'Bundle ID: ' + escapeHTML(DATA.app.bundle_id || '') + '<br>SKU: ' + escapeHTML(DATA.app.sku || '') + '<br>Version: ' + escapeHTML(DATA.app.version || '') + '<br>Locale: ' + escapeHTML(locale);
    $('generatedAt').textContent = 'Generated: ' + DATA.generatedAt;
    $('appInfo').innerHTML = [
      ['Internal Name', DATA.app.internal_name], ['App Store Name', DATA.app.app_store_name], ['Bundle ID', DATA.app.bundle_id], ['SKU', DATA.app.sku], ['Apple ID', DATA.app.apple_id], ['Version', DATA.app.version], ['Platform', DATA.app.platform], ['Support Email', DATA.app.support_email], ['Primary Category', DATA.store.primary_category], ['Secondary Category', DATA.store.secondary_category], ['Company', DATA.company.name], ['Copyright', DATA.company.copyright]
    ].map(([k,v]) => '<div>' + escapeHTML(k) + '</div><div>' + escapeHTML(v) + '</div>').join('');

    $('versionGrid').innerHTML = [
      fieldCard('App Name', m.name, LIMITS.name.max, 'chars', false, 'metadata.name'),
      fieldCard('Subtitle', m.subtitle, LIMITS.subtitle.max, 'chars', false, 'metadata.subtitle'),
      fieldCard('Promotional Text', m.promotional_text, LIMITS.promotional_text.max, 'chars', true, 'metadata.promotional_text'),
      fieldCard('Description', m.description, LIMITS.description.max, 'chars', true, 'metadata.description'),
      fieldCard('Keywords', m.keywords, LIMITS.keywords.max, 'bytes', true, 'metadata.keywords'),
      fieldCard("What's New", m.whats_new, LIMITS.whats_new.max, 'chars', true, 'metadata.whats_new')
    ].join('');

    const kwAnalysis = document.getElementById('kwAnalysis');
    if (kwAnalysis) kwAnalysis.remove();
    if (m.keywords) {
      const kws = m.keywords.split(',').map(k => k.trim()).filter(Boolean);
      const dups = kws.filter((k, i) => kws.indexOf(k) !== i);
      const appName = (DATA.app.app_store_name || '').toLowerCase();
      const hasAppName = kws.some(k => k.toLowerCase() === appName);
      if (dups.length || hasAppName) {
        const div = document.createElement('div');
        div.id = 'kwAnalysis';
        div.className = 'keywords-analysis';
        let msg = '';
        if (dups.length) msg += '<span class="kw-dup">Duplicate keywords: ' + escapeHTML(dups.join(', ')) + '</span> ';
        if (hasAppName) msg += '<span class="kw-appname">App name found in keywords</span>';
        div.innerHTML = msg;
        const kwCard = $('versionGrid').querySelector('[data-field="metadata.keywords"]');
        if (kwCard) kwCard.appendChild(div);
      }
    }

    const urls = item.urls || {};
    $('legalGrid').innerHTML = [
      urlCard('Privacy URL', urls.privacy),
      urlCard('Terms URL', urls.terms),
      urlCard('Support URL', urls.support),
      urlCard('Marketing URL', urls.marketing)
    ].join('');

    $('reviewGrid').innerHTML = fieldCard('App Review Notes', item.review && item.review.notes, LIMITS.review_notes.max, 'bytes', true, 'review.notes');
    $('complianceGrid').innerHTML = fieldCard('Privacy Summary', item.compliance && item.compliance.privacy_summary, null, 'chars', true) + fieldCard('Demo Content Notice', item.compliance && item.compliance.demo_content_notice, null, 'chars', true);

    const sets = (item.screenshots && item.screenshots.sets) || {};
    $('screenshotsGrid').innerHTML = Object.entries(sets).map(([setName, rows]) => {
      const body = (rows || []).map((r, i) => {
        const titleCount = charCount(r.title);
        const subCount = charCount(r.subtitle);
        return '<div class="screenshot"><strong>' + (i+1) + '. ' + escapeHTML(r.title) + '</strong><span>' + escapeHTML(r.subtitle) + '</span><div class="screenshot-meta"><span class="screenshot-counter' + (titleCount > SL.title.max ? ' bad' : '') + '">Title: ' + titleCount + '/' + SL.title.max + '</span><span class="screenshot-counter' + (subCount > SL.subtitle.max ? ' bad' : '') + '">Subtitle: ' + subCount + '/' + SL.subtitle.max + '</span></div></div>';
      }).join('');
      return '<div class="card full"><div class="field-head"><div class="field-title">' + escapeHTML(setName) + '</div><span class="counter">' + (rows || []).length + ' screenshot(s)</span></div>' + body + '</div>';
    }).join('') || '<div class="card full"><div class="empty-state"><div class="empty-icon">&#128247;</div>No screenshot copy for this locale.</div></div>';

    const assets = item.assets || {};
    const assetScreenshots = assets.screenshots || {};
    const assetVideos = assets.videos || {};
    let mediaHtml = '';
    const allSetNames = new Set([...Object.keys(assetScreenshots), ...Object.keys(assetVideos)]);
    if (allSetNames.size === 0) {
      mediaHtml = '<div class="card full"><div class="empty-state"><div class="empty-icon">&#128444;</div>No screenshot or video files found in assets/.</div></div>';
    } else {
      for (const setName of allSetNames) {
        const imgs = assetScreenshots[setName] || [];
        const vids = assetVideos[setName] || [];
        const res = RES[setName];
        const resInfo = res ? res.portrait.join('x') + ' / ' + res.landscape.join('x') : '';
        const countInfo = imgs.length + '/10 screenshots' + (vids.length ? ', ' + vids.length + ' video(s)' : '');
        const imgHtml = imgs.map((p, i) => {
          const rel = '../assets/' + locale + '/' + setName + '/' + p.split('/').pop();
          return '<div class="media-item" data-action="lightbox" data-src="' + escapeHTML(rel) + '"><img src="' + escapeHTML(rel) + '" loading="lazy" alt="' + escapeHTML(setName) + ' screenshot ' + (i+1) + '" /><div class="media-label">' + escapeHTML(p.split('/').pop()) + '</div></div>';
        }).join('');
        const vidHtml = vids.map(p => {
          const rel = '../assets/' + locale + '/previews/' + p.split('/').pop();
          return '<div class="media-item"><video src="' + escapeHTML(rel) + '" controls muted playsinline aria-label="' + escapeHTML(setName) + ' preview video"></video><div class="media-label">' + escapeHTML(p.split('/').pop()) + '</div></div>';
        }).join('');
        mediaHtml += '<div class="card full"><div class="field-head"><div class="field-title">' + escapeHTML(setName) + '</div><span class="media-set-info">' + countInfo + (resInfo ? ' &middot; ' + resInfo : '') + '</span></div><div class="media-grid">' + imgHtml + vidHtml + '</div></div>';
      }
    }
    $('mediaGrid').innerHTML = mediaHtml;

    const report = DATA.validationReport || { errors: [], warnings: [], passed: [] };
    const localeErrors = report.errors.filter(e => !e.locale || e.locale === locale);
    const localeWarnings = report.warnings.filter(w => !w.locale || w.locale === locale);
    const localePassed = report.passed.filter(p => !p.locale || p.locale === locale);
    $('validationGrid').innerHTML = '<div class="card full"><div class="report-header">' + passRateCircle({ errors: localeErrors, warnings: localeWarnings, passed: localePassed }) + '<span class="status error">Errors ' + localeErrors.length + '</span> <span class="status warn">Warnings ' + localeWarnings.length + '</span> <span class="status ok">Passed ' + localePassed.length + '</span></div>'
      + '<h3>Errors</h3><ul class="report">' + (localeErrors.length ? localeErrors.map(x => '<li data-action="goto-field" data-field="' + escapeHTML(x.field || '') + '">' + escapeHTML(x.message) + '</li>').join('') : '<li style="color:var(--green)">No errors</li>') + '</ul>'
      + '<h3>Warnings</h3><ul class="report">' + (localeWarnings.length ? localeWarnings.map(x => '<li data-action="goto-field" data-field="' + escapeHTML(x.field || '') + '">' + escapeHTML(x.message) + '</li>').join('') : '<li style="color:var(--green)">No warnings</li>') + '</ul>'
      + '<details><summary>Passed checks (' + localePassed.length + ')</summary><ul class="report">' + localePassed.map(x => '<li>' + escapeHTML(x.message) + '</li>').join('') + '</ul></details>'
      + '</div>';

    $('fastlaneGrid').innerHTML = '<div class="card full"><div class="value">AppStoreMetadata/generated/fastlane/metadata/' + escapeHTML(locale) + '/<br>- name.txt<br>- subtitle.txt<br>- promotional_text.txt<br>- description.txt<br>- keywords.txt<br>- release_notes.txt<br>- support_url.txt<br>- marketing_url.txt<br>- privacy_url.txt' + (DATA.app.support_email ? '<br>- support_email.txt' : '') + '</div></div>';

    $('appstorePreviewBody').innerHTML = '<div class="appstore-preview">'
      + '<div class="asp-header"><div class="asp-icon">' + escapeHTML((DATA.app.app_store_name || 'A')[0]) + '</div><div class="asp-info"><div class="asp-name">' + escapeHTML(m.name || DATA.app.app_store_name) + '</div><div class="asp-subtitle">' + escapeHTML(m.subtitle || '') + '</div><div class="asp-btn">OPEN</div></div></div>'
      + (allSetNames.size > 0 ? '<div class="asp-screenshots">' + Array.from(allSetNames).flatMap(sn => (assetScreenshots[sn] || []).map(p => '<img src="../assets/' + locale + '/' + sn + '/' + p.split('/').pop() + '" loading="lazy" alt="' + escapeHTML(sn) + ' screenshot" />')).join('') + '</div>' : '')
      + '<div class="asp-section"><div class="asp-section-title">Description</div><div class="asp-text collapsed" id="aspDesc">' + escapeHTML(m.description || '') + '</div><button class="asp-expand" data-action="expand-desc">Read More</button></div>'
      + '<div class="asp-section"><div class="asp-section-title">What&#39;s New</div><div class="asp-text">Version ' + escapeHTML(DATA.app.version || '') + '<br><br>' + escapeHTML(m.whats_new || '') + '</div></div>'
      + '<div class="asp-section">'
      + '<div class="asp-meta-row"><span class="label">Category</span><span class="val">' + escapeHTML(DATA.store.primary_category || '') + '</span></div>'
      + '<div class="asp-meta-row"><span class="label">Languages</span><span class="val">' + escapeHTML(DATA.localeOrder.join(', ')) + '</span></div>'
      + '<div class="asp-meta-row"><span class="label">Developer</span><span class="val">' + escapeHTML(DATA.company.name || '') + '</span></div>'
      + (DATA.app.support_email ? '<div class="asp-meta-row"><span class="label">Support Email</span><span class="val"><a href="mailto:' + escapeHTML(DATA.app.support_email) + '">' + escapeHTML(DATA.app.support_email) + '</a></span></div>' : '')
      + '<div class="asp-meta-row"><span class="label">Age Rating</span><span class="val">' + escapeHTML(DATA.features?.age_rating || 'Not set') + '</span></div>'
      + '</div></div>';

    const pct = localeCompletion(locale);
    $('localeBadge').textContent = pct + '% complete';

    main.setAttribute('lang', locale.replace('_', '-'));
  } catch (err) {
    console.error('Render error:', err);
  }
}

function allTextForLocale(locale) {
  const item = DATA.locales[locale] || {}; const m = item.metadata || {}; const u = item.urls || {};
  return ['Locale: ' + locale, '', 'Name:', m.name, '', 'Subtitle:', m.subtitle, '', 'Promotional Text:', m.promotional_text, '', 'Description:', m.description, '', 'Keywords:', m.keywords, '', "What's New:", m.whats_new, '', 'Privacy URL:', u.privacy, '', 'Terms URL:', u.terms, '', 'Support URL:', u.support, '', 'Marketing URL:', u.marketing, '', 'Review Notes:', item.review && item.review.notes].map(text).join('\\n');
}

const main = $('main-content');
const localeSelect = $('localeSelect');
const localeSelectMobile = $('localeSelectMobile');

function populateLocaleSelects() {
  const opts = DATA.localeOrder.map(l => '<option value="' + escapeHTML(l) + '">' + escapeHTML(l) + ' (' + localeCompletion(l) + '%)</option>').join('');
  localeSelect.innerHTML = opts;
  localeSelectMobile.innerHTML = opts;
  localeSelect.value = currentLocale;
  localeSelectMobile.value = currentLocale;
}
populateLocaleSelects();

function switchLocale(val) {
  currentLocale = val;
  location.hash = val;
  localeSelect.value = val;
  localeSelectMobile.value = val;
  render();
}

localeSelect.onchange = (e) => switchLocale(e.target.value);
localeSelectMobile.onchange = (e) => switchLocale(e.target.value);

main.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'copy') { copyText(target.dataset.value, target); }
  else if (action === 'copy-all') { copyText(allTextForLocale(currentLocale), target); }
  else if (action === 'copy-review') { copyText(DATA.locales[currentLocale]?.review?.notes || '', target); }
  else if (action === 'lightbox') {
    const card = target.closest('.card');
    const imgs = Array.from(card.querySelectorAll('.media-item[data-action="lightbox"]')).map(el => el.dataset.src);
    const idx = imgs.indexOf(target.dataset.src);
    openLightbox(imgs, Math.max(0, idx));
  }
  else if (action === 'goto-field') {
    const field = target.dataset.field;
    if (!field) return;
    const el = main.querySelector('[data-field="' + field + '"]');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('highlight'); setTimeout(() => el.classList.remove('highlight'), 2000); }
  }
  else if (action === 'expand-desc') {
    const desc = $('aspDesc');
    if (desc) { desc.classList.toggle('collapsed'); target.textContent = desc.classList.contains('collapsed') ? 'Read More' : 'Show Less'; }
  }
});

$('lightbox').querySelector('.lightbox-close').onclick = closeLightbox;
$('lightbox').querySelector('.lightbox-prev').onclick = () => { if (lightboxIndex > 0) { lightboxIndex--; $('lightboxImg').src = lightboxImages[lightboxIndex]; } };
$('lightbox').querySelector('.lightbox-next').onclick = () => { if (lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; $('lightboxImg').src = lightboxImages[lightboxIndex]; } };
$('lightbox').onclick = (e) => { if (e.target === $('lightbox')) closeLightbox(); };

main.addEventListener('click', (e) => {
  const btn = e.target.closest('.collapse-btn');
  if (!btn) return;
  const sectionId = btn.dataset.collapse;
  const body = $(sectionId + 'Body');
  if (!body) return;
  body.classList.toggle('collapsed');
  btn.textContent = body.classList.contains('collapsed') ? 'Expand' : 'Collapse';
  try { localStorage.setItem('ycmeta_collapsed_' + sectionId, body.classList.contains('collapsed') ? '1' : ''); } catch {}
});

document.querySelectorAll('.section-body').forEach(el => {
  const id = el.id.replace('Body', '');
  try { if (localStorage.getItem('ycmeta_collapsed_' + id) === '1') { el.classList.add('collapsed'); const btn = el.previousElementSibling?.querySelector('.collapse-btn'); if (btn) btn.textContent = 'Expand'; } } catch {}
});

const themeToggle = $('themeToggle');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.innerHTML = theme === 'dark' ? '&#9788; Light Mode' : '&#9790; Dark Mode';
  try { localStorage.setItem('ycmeta_theme', theme); } catch {}
}
try { const saved = localStorage.getItem('ycmeta_theme'); if (saved) applyTheme(saved); } catch {}
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
};

const sections = main.querySelectorAll('section[id]');
const navLinks = $('sideNav').querySelectorAll('a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = $('sideNav').querySelector('a[data-section="' + entry.target.id + '"]');
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
sections.forEach(s => observer.observe(s));

const backToTop = $('backToTop');
window.addEventListener('scroll', () => { backToTop.classList.toggle('visible', window.scrollY > window.innerHeight); }, { passive: true });
backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const hamburger = $('hamburger');
const sidebar = $('sidebar');
const drawerOverlay = $('drawerOverlay');
hamburger.onclick = () => { sidebar.classList.add('open'); drawerOverlay.classList.add('open'); };
drawerOverlay.onclick = () => { sidebar.classList.remove('open'); drawerOverlay.classList.remove('open'); };
sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { sidebar.classList.remove('open'); drawerOverlay.classList.remove('open'); }));

render();
</script>
</body>
</html>`;
}

module.exports = {
  generateHtml
};
