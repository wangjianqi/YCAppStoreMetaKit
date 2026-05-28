const { getLocaleUrl } = require('../core/loadMetadata');
const { LIMITS } = require('../core/schema');

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
    limits: LIMITS
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
  <style>
    :root {
      --bg: #f5f5f7;
      --card: rgba(255, 255, 255, 0.86);
      --text: #1d1d1f;
      --muted: #6e6e73;
      --line: rgba(0,0,0,0.08);
      --blue: #007aff;
      --green: #0a7f37;
      --red: #c62828;
      --yellow: #8a5a00;
      --shadow: 0 18px 45px rgba(0,0,0,0.08);
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #111113; --card: rgba(30,30,32,0.88); --text: #f5f5f7; --muted: #a1a1a6; --line: rgba(255,255,255,0.1); --shadow: 0 18px 45px rgba(0,0,0,0.3); }
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--sans); background: radial-gradient(circle at top left, rgba(0,122,255,.12), transparent 32%), var(--bg); color: var(--text); }
    .app { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100vh; }
    aside { border-right: 1px solid var(--line); padding: 24px 18px; position: sticky; top: 0; height: 100vh; background: rgba(255,255,255,.38); backdrop-filter: blur(22px); }
    @media (prefers-color-scheme: dark) { aside { background: rgba(16,16,18,.5); } }
    .brand { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
    h1 { font-size: 24px; line-height: 1.12; margin: 0 0 10px; letter-spacing: -0.02em; }
    .meta { color: var(--muted); font-size: 13px; line-height: 1.55; }
    .nav { margin-top: 24px; display: grid; gap: 8px; }
    .nav a { text-decoration: none; color: var(--text); border: 1px solid var(--line); border-radius: 14px; padding: 10px 12px; font-size: 14px; background: rgba(255,255,255,.35); }
    .nav a:hover { border-color: rgba(0,122,255,.45); color: var(--blue); }
    main { padding: 28px; max-width: 1180px; width: 100%; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
    .locale-select { appearance: none; border: 1px solid var(--line); background: var(--card); color: var(--text); border-radius: 14px; padding: 10px 14px; font-size: 15px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    button { border: 0; border-radius: 12px; padding: 9px 12px; background: var(--blue); color: white; font-weight: 600; cursor: pointer; }
    button.secondary { background: rgba(127,127,127,.18); color: var(--text); }
    button:hover { filter: brightness(.98); }
    section { margin: 26px 0; scroll-margin-top: 18px; }
    h2 { font-size: 22px; margin: 0 0 14px; letter-spacing: -0.015em; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 16px; box-shadow: var(--shadow); backdrop-filter: blur(24px); }
    .card.full { grid-column: 1 / -1; }
    .field-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .field-title { font-weight: 700; }
    .counter { color: var(--muted); font-size: 12px; font-family: var(--mono); }
    .counter.ok { color: var(--green); }
    .counter.bad { color: var(--red); }
    .value { white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.55; color: var(--text); border: 1px solid var(--line); border-radius: 16px; padding: 12px; background: rgba(127,127,127,.06); max-height: 360px; overflow: auto; }
    .kv { display: grid; grid-template-columns: 160px 1fr; gap: 8px 14px; font-size: 14px; }
    .kv div:nth-child(odd) { color: var(--muted); }
    .status { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 8px; font-size: 12px; font-weight: 700; }
    .status.ok { background: rgba(10,127,55,.12); color: var(--green); }
    .status.warn { background: rgba(138,90,0,.14); color: var(--yellow); }
    .status.error { background: rgba(198,40,40,.12); color: var(--red); }
    ul.report { margin: 0; padding-left: 20px; line-height: 1.6; }
    .screenshot { border: 1px solid var(--line); border-radius: 16px; padding: 12px; margin: 10px 0; }
    .screenshot strong { display: block; margin-bottom: 4px; }
    @media (max-width: 900px) { .app { grid-template-columns: 1fr; } aside { position: relative; height: auto; } .grid { grid-template-columns: 1fr; } .topbar { align-items: flex-start; flex-direction: column; } }
    @media print { aside { display: none; } .app { grid-template-columns: 1fr; } .card { box-shadow: none; border: 1px solid #ccc; } button { display: none; } .value { max-height: none; } }
  </style>
</head>
<body>
  <div class="app">
    <aside>
      <div class="brand">YCAppStoreMetaKit</div>
      <h1 id="appTitle"></h1>
      <div class="meta" id="appMeta"></div>
      <nav class="nav">
        <a href="#app-info">App Information</a>
        <a href="#version">Version Metadata</a>
        <a href="#legal">Legal URLs</a>
        <a href="#review">Review Notes</a>
        <a href="#compliance">Compliance Notes</a>
        <a href="#screenshots">Screenshot Copy</a>
        <a href="#validation">Validation Report</a>
        <a href="#fastlane">Fastlane Export Preview</a>
      </nav>
    </aside>
    <main>
      <div class="topbar">
        <select id="localeSelect" class="locale-select"></select>
        <div class="actions">
          <button id="copyAll">Copy All for Current Locale</button>
          <button class="secondary" id="copyReview">Copy Review Notes</button>
        </div>
      </div>
      <section id="app-info"><h2>App Information</h2><div class="card"><div class="kv" id="appInfo"></div></div></section>
      <section id="version"><h2>Version Metadata</h2><div class="grid" id="versionGrid"></div></section>
      <section id="legal"><h2>Legal URLs</h2><div class="grid" id="legalGrid"></div></section>
      <section id="review"><h2>Review Notes</h2><div class="grid" id="reviewGrid"></div></section>
      <section id="compliance"><h2>Compliance Notes</h2><div class="grid" id="complianceGrid"></div></section>
      <section id="screenshots"><h2>Screenshot Copy</h2><div class="grid" id="screenshotsGrid"></div></section>
      <section id="validation"><h2>Validation Report</h2><div class="grid" id="validationGrid"></div></section>
      <section id="fastlane"><h2>Fastlane Export Preview</h2><div class="grid" id="fastlaneGrid"></div></section>
    </main>
  </div>
<script>
const DATA = ${json};
const LIMITS = DATA.limits;
let currentLocale = DATA.store.default_locale || DATA.localeOrder[0];

const $ = (id) => document.getElementById(id);
const text = (v) => v == null ? '' : String(v);
const charCount = (v) => Array.from(text(v)).length;
const byteCount = (v) => new TextEncoder().encode(text(v)).length;
function escapeHTML(s) { return text(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
async function copyValue(value, btn) {
  await navigator.clipboard.writeText(text(value));
  const old = btn.textContent;
  btn.textContent = 'Copied';
  setTimeout(() => btn.textContent = old, 900);
}
function counter(value, limit, unit) {
  const count = unit === 'bytes' ? byteCount(value) : charCount(value);
  const bad = limit && count > limit;
  return '<span class="counter ' + (bad ? 'bad' : 'ok') + '">' + count + (limit ? '/' + limit : '') + ' ' + (unit === 'bytes' ? 'bytes' : 'chars') + '</span>';
}
function fieldCard(title, value, limit, unit = 'chars', full = false) {
  const id = 'copy_' + Math.random().toString(36).slice(2);
  setTimeout(() => { const b = document.getElementById(id); if (b) b.onclick = () => copyValue(value, b); }, 0);
  return '<div class="card ' + (full ? 'full' : '') + '"><div class="field-head"><div><div class="field-title">' + escapeHTML(title) + '</div>' + counter(value, limit, unit) + '</div><button class="secondary" id="' + id + '">Copy</button></div><div class="value">' + escapeHTML(value) + '</div></div>';
}
function render() {
  const locale = currentLocale;
  const item = DATA.locales[locale] || {};
  const m = item.metadata || {};
  $('appTitle').textContent = DATA.app.app_store_name || DATA.app.internal_name || 'App Store Metadata';
  $('appMeta').innerHTML = 'Bundle ID: ' + escapeHTML(DATA.app.bundle_id || '') + '<br>SKU: ' + escapeHTML(DATA.app.sku || '') + '<br>Version: ' + escapeHTML(DATA.app.version || '') + '<br>Locale: ' + escapeHTML(locale);
  $('appInfo').innerHTML = [
    ['Internal Name', DATA.app.internal_name], ['App Store Name', DATA.app.app_store_name], ['Bundle ID', DATA.app.bundle_id], ['SKU', DATA.app.sku], ['Apple ID', DATA.app.apple_id], ['Version', DATA.app.version], ['Platform', DATA.app.platform], ['Primary Category', DATA.store.primary_category], ['Secondary Category', DATA.store.secondary_category], ['Company', DATA.company.name], ['Copyright', DATA.company.copyright]
  ].map(([k,v]) => '<div>' + escapeHTML(k) + '</div><div>' + escapeHTML(v) + '</div>').join('');
  $('versionGrid').innerHTML = [
    fieldCard('App Name', m.name, LIMITS.name.max),
    fieldCard('Subtitle', m.subtitle, LIMITS.subtitle.max),
    fieldCard('Promotional Text', m.promotional_text, LIMITS.promotional_text.max, 'chars', true),
    fieldCard('Description', m.description, LIMITS.description.max, 'chars', true),
    fieldCard('Keywords', m.keywords, LIMITS.keywords.max, 'bytes', true),
    fieldCard("What's New", m.whats_new, LIMITS.whats_new.max, 'chars', true)
  ].join('');
  const urls = item.urls || {};
  $('legalGrid').innerHTML = Object.entries(urls).map(([k,v]) => fieldCard(k + ' URL', v, null, 'chars', true)).join('');
  $('reviewGrid').innerHTML = fieldCard('App Review Notes', item.review && item.review.notes, LIMITS.review_notes.max, 'bytes', true);
  $('complianceGrid').innerHTML = fieldCard('Privacy Summary', item.compliance && item.compliance.privacy_summary, null, 'chars', true) + fieldCard('Demo Content Notice', item.compliance && item.compliance.demo_content_notice, null, 'chars', true);
  const sets = (item.screenshots && item.screenshots.sets) || {};
  $('screenshotsGrid').innerHTML = Object.entries(sets).map(([setName, rows]) => {
    const body = (rows || []).map((r, i) => '<div class="screenshot"><strong>' + (i+1) + '. ' + escapeHTML(r.title) + '</strong><span>' + escapeHTML(r.subtitle) + '</span></div>').join('');
    return '<div class="card full"><div class="field-head"><div class="field-title">' + escapeHTML(setName) + '</div></div>' + body + '</div>';
  }).join('') || '<div class="card full">No screenshot copy for this locale.</div>';
  const report = DATA.validationReport || { errors: [], warnings: [], passed: [] };
  $('validationGrid').innerHTML = '<div class="card full"><div class="field-head"><div><span class="status error">Errors ' + report.errors.length + '</span> <span class="status warn">Warnings ' + report.warnings.length + '</span> <span class="status ok">Passed ' + report.passed.length + '</span></div></div>'
    + '<h3>Errors</h3><ul class="report">' + report.errors.map(x => '<li>' + escapeHTML(x.message) + '</li>').join('') + '</ul>'
    + '<h3>Warnings</h3><ul class="report">' + report.warnings.map(x => '<li>' + escapeHTML(x.message) + '</li>').join('') + '</ul>'
    + '</div>';
  $('fastlaneGrid').innerHTML = '<div class="card full"><div class="value">AppStoreMetadata/generated/fastlane/metadata/' + escapeHTML(locale) + '/<br>- name.txt<br>- subtitle.txt<br>- promotional_text.txt<br>- description.txt<br>- keywords.txt<br>- release_notes.txt<br>- support_url.txt<br>- marketing_url.txt<br>- privacy_url.txt</div></div>';
}
function allTextForLocale(locale) {
  const item = DATA.locales[locale] || {}; const m = item.metadata || {}; const u = item.urls || {};
  return ['Locale: ' + locale, '', 'Name:', m.name, '', 'Subtitle:', m.subtitle, '', 'Promotional Text:', m.promotional_text, '', 'Description:', m.description, '', 'Keywords:', m.keywords, '', "What's New:", m.whats_new, '', 'Privacy URL:', u.privacy, '', 'Terms URL:', u.terms, '', 'Support URL:', u.support, '', 'Marketing URL:', u.marketing, '', 'Review Notes:', item.review && item.review.notes].map(text).join(String.fromCharCode(10));
}
$('localeSelect').innerHTML = DATA.localeOrder.map(l => '<option value="' + escapeHTML(l) + '">' + escapeHTML(l) + '</option>').join('');
$('localeSelect').value = currentLocale;
$('localeSelect').onchange = (e) => { currentLocale = e.target.value; render(); };
$('copyAll').onclick = (e) => copyValue(allTextForLocale(currentLocale), e.target);
$('copyReview').onclick = (e) => copyValue(DATA.locales[currentLocale]?.review?.notes || '', e.target);
render();
</script>
</body>
</html>`;
}

module.exports = {
  generateHtml
};
