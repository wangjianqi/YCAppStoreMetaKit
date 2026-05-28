const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateHtml } = require('../src/generators/htmlGenerator');

function makeMetadata() {
  return {
    root: '/tmp/test',
    dir: '/tmp/test/AppStoreMetadata',
    configPath: '/tmp/test/AppStoreMetadata/appstore.config.yaml',
    config: {
      app: {
        internal_name: 'TestApp',
        app_store_name: 'TestApp',
        bundle_id: 'com.test.app',
        sku: 'test-001',
        apple_id: '123456',
        version: '1.0.0',
        platform: 'ios'
      },
      company: { name: 'Test Co', copyright: '2026' },
      urls: {
        privacy: 'https://example.com/privacy',
        terms: 'https://example.com/terms',
        support: 'https://example.com/support',
        marketing: 'https://example.com'
      },
      store: {
        primary_language: 'en-US',
        default_locale: 'en-US',
        locales: ['en-US'],
        primary_category: 'Utilities',
        secondary_category: 'Productivity'
      },
      features: {}
    },
    locales: {
      'en-US': {
        locale: 'en-US',
        metadata: {
          name: 'TestApp',
          subtitle: 'A test app',
          promotional_text: 'Promo',
          description: 'Description',
          keywords: 'test',
          whats_new: 'v1'
        },
        review: { notes: 'Review notes' },
        compliance: { privacy_summary: 'Privacy', demo_content_notice: 'Demo' }
      }
    },
    screenshots: {
      'en-US': {
        sets: {
          iphone_6_9: [
            { title: 'Hello', subtitle: 'World' }
          ]
        }
      }
    },
    configuredLocales: ['en-US'],
    missingLocaleFiles: [],
    missingScreenshotFiles: []
  };
}

describe('generateHtml', () => {
  it('produces valid HTML with doctype', () => {
    const metadata = makeMetadata();
    const report = { ok: true, errors: [], warnings: [], passed: [], summary: { errorCount: 0, warningCount: 0, passedCount: 0 } };
    const html = generateHtml(metadata, report);
    assert.ok(html.startsWith('<!doctype html>'));
  });

  it('includes app name in title', () => {
    const metadata = makeMetadata();
    const report = { ok: true, errors: [], warnings: [], passed: [], summary: { errorCount: 0, warningCount: 0, passedCount: 0 } };
    const html = generateHtml(metadata, report);
    assert.ok(html.includes('<title>TestApp</title>'));
  });

  it('escapes HTML in data via JSON encoding', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.description = '<script>alert("xss")</script>';
    const report = { ok: true, errors: [], warnings: [], passed: [], summary: { errorCount: 0, warningCount: 0, passedCount: 0 } };
    const html = generateHtml(metadata, report);
    assert.ok(!html.includes('<script>alert("xss")</script>'));
    assert.ok(html.includes('\\u003cscript'));
    assert.ok(html.includes('\\u003c/script'));
  });

  it('includes validation report section', () => {
    const metadata = makeMetadata();
    const report = { ok: false, errors: [{ code: 'TEST', message: 'Test error' }], warnings: [], passed: [], summary: { errorCount: 1, warningCount: 0, passedCount: 0 } };
    const html = generateHtml(metadata, report);
    assert.ok(html.includes('Test error'));
  });

  it('handles empty locales gracefully', () => {
    const metadata = makeMetadata();
    metadata.configuredLocales = [];
    metadata.locales = {};
    metadata.screenshots = {};
    const report = { ok: true, errors: [], warnings: [], passed: [], summary: { errorCount: 0, warningCount: 0, passedCount: 0 } };
    const html = generateHtml(metadata, report);
    assert.ok(html.startsWith('<!doctype html>'));
  });
});
