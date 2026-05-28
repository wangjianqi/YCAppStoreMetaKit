const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const { loadMetadata, loadYamlFile, getLocaleUrl } = require('../src/core/loadMetadata');

const TMP = path.join(require('os').tmpdir(), 'ycmeta-load-test-' + Date.now());

function setupDir() {
  fs.ensureDirSync(path.join(TMP, 'AppStoreMetadata', 'locales'));
  fs.ensureDirSync(path.join(TMP, 'AppStoreMetadata', 'screenshots'));
  fs.ensureDirSync(path.join(TMP, 'AppStoreMetadata', 'generated'));

  fs.writeFileSync(path.join(TMP, 'AppStoreMetadata', 'appstore.config.yaml'), `
app:
  internal_name: "TestApp"
  app_store_name: "TestApp"
  bundle_id: "com.test.app"
  sku: "test-001"
  version: "1.0.0"
  platform: "ios"
company:
  name: "Test Co"
  copyright: "2026 Test Co"
urls:
  privacy: "https://example.com/privacy"
  terms: "https://example.com/terms"
  support: "https://example.com/support"
store:
  primary_language: "en-US"
  default_locale: "en-US"
  locales:
    - "en-US"
`);

  fs.writeFileSync(path.join(TMP, 'AppStoreMetadata', 'locales', 'en-US.yaml'), `
locale: "en-US"
metadata:
  name: "TestApp"
  subtitle: "Test"
  promotional_text: "Promo"
  description: "Desc"
  keywords: "test"
  whats_new: "v1"
`);

  fs.writeFileSync(path.join(TMP, 'AppStoreMetadata', 'screenshots', 'en-US.yaml'), `
locale: "en-US"
sets:
  iphone_6_9:
    - title: "Hello"
      subtitle: "World"
`);
}

function cleanup() {
  fs.removeSync(TMP);
}

describe('loadMetadata', () => {
  beforeEach(() => setupDir());
  afterEach(() => cleanup());

  it('loads config and locale data', async () => {
    const metadata = await loadMetadata(TMP);
    assert.equal(metadata.config.app.internal_name, 'TestApp');
    assert.equal(metadata.configuredLocales[0], 'en-US');
    assert.equal(metadata.locales['en-US'].metadata.name, 'TestApp');
  });

  it('loads screenshot data', async () => {
    const metadata = await loadMetadata(TMP);
    assert.ok(metadata.screenshots['en-US']);
    assert.ok(metadata.screenshots['en-US'].sets.iphone_6_9);
  });

  it('reports missing locale files', async () => {
    fs.writeFileSync(path.join(TMP, 'AppStoreMetadata', 'appstore.config.yaml'), `
app:
  internal_name: "TestApp"
  app_store_name: "TestApp"
  bundle_id: "com.test.app"
  sku: "test-001"
  version: "1.0.0"
  platform: "ios"
company:
  name: "Test Co"
  copyright: "2026 Test Co"
urls:
  privacy: "https://example.com/privacy"
store:
  primary_language: "en-US"
  default_locale: "en-US"
  locales:
    - "en-US"
    - "ja"
`);
    const metadata = await loadMetadata(TMP);
    assert.equal(metadata.missingLocaleFiles.length, 1);
    assert.ok(metadata.missingLocaleFiles[0].includes('ja.yaml'));
  });

  it('throws when AppStoreMetadata dir is missing', async () => {
    await assert.rejects(
      () => loadMetadata('/tmp/nonexistent-path-' + Date.now()),
      /AppStoreMetadata not found/
    );
  });

  it('throws when appstore.config.yaml is missing', async () => {
    fs.removeSync(path.join(TMP, 'AppStoreMetadata', 'appstore.config.yaml'));
    await assert.rejects(
      () => loadMetadata(TMP),
      /appstore.config.yaml not found/
    );
  });
});

describe('getLocaleUrl', () => {
  it('returns string URL directly', () => {
    const config = { urls: { privacy: 'https://example.com/privacy' } };
    assert.equal(getLocaleUrl(config, 'privacy', 'en-US'), 'https://example.com/privacy');
  });

  it('returns locale-specific URL', () => {
    const config = { urls: { privacy: { 'en-US': 'https://en.example.com/privacy', 'zh-Hans': 'https://zh.example.com/privacy' } }, store: { default_locale: 'en-US' } };
    assert.equal(getLocaleUrl(config, 'privacy', 'zh-Hans'), 'https://zh.example.com/privacy');
  });

  it('falls back to default_locale', () => {
    const config = { urls: { privacy: { 'en-US': 'https://en.example.com/privacy' } }, store: { default_locale: 'en-US' } };
    assert.equal(getLocaleUrl(config, 'privacy', 'ja'), 'https://en.example.com/privacy');
  });

  it('returns empty string when URL is missing', () => {
    const config = { urls: {} };
    assert.equal(getLocaleUrl(config, 'privacy', 'en-US'), '');
  });
});

describe('loadYamlFile', () => {
  beforeEach(() => fs.ensureDirSync(TMP));
  afterEach(() => cleanup());

  it('parses valid YAML', async () => {
    const filePath = path.join(TMP, 'test.yaml');
    fs.writeFileSync(filePath, 'key: value\n');
    const { data, text } = await loadYamlFile(filePath);
    assert.equal(data.key, 'value');
    assert.ok(text.includes('key: value'));
  });

  it('throws on invalid YAML', async () => {
    const filePath = path.join(TMP, 'bad.yaml');
    fs.writeFileSync(filePath, ': invalid: yaml: [\n');
    await assert.rejects(() => loadYamlFile(filePath), /Failed to read YAML/);
  });

  it('throws on missing file', async () => {
    await assert.rejects(() => loadYamlFile('/tmp/nonexistent-' + Date.now() + '.yaml'), /Failed to read YAML/);
  });
});
