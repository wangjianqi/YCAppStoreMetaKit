const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateMetadata } = require('../src/core/validateRules');

function makeMetadata(overrides = {}) {
  const config = {
    app: {
      internal_name: 'TestApp',
      app_store_name: 'TestApp',
      bundle_id: 'com.test.app',
      sku: 'test-001',
      apple_id: '123456',
      version: '1.0.0',
      platform: 'ios'
    },
    company: {
      name: 'Test Company',
      copyright: '2026 Test Company'
    },
    urls: {
      privacy: 'https://example.com/privacy',
      terms: 'https://example.com/terms',
      support: 'https://example.com/support',
      marketing: 'https://example.com'
    },
    store: {
      primary_language: 'en-US',
      default_locale: 'en-US',
      locales: ['en-US']
    },
    ...overrides
  };

  const locales = {
    'en-US': {
      locale: 'en-US',
      metadata: {
        name: 'TestApp',
        subtitle: 'A test app',
        promotional_text: 'Promotional text for testing.',
        description: 'This is a test app description that is long enough to be valid.',
        keywords: 'test,app,demo',
        whats_new: 'Initial release.'
      },
      review: {
        notes: 'Review notes for testing.'
      },
      compliance: {}
    }
  };

  return {
    root: '/tmp/test',
    dir: '/tmp/test/AppStoreMetadata',
    configPath: '/tmp/test/AppStoreMetadata/appstore.config.yaml',
    config,
    locales: overrides._locales || locales,
    screenshots: {},
    configuredLocales: overrides._configuredLocales || ['en-US'],
    missingLocaleFiles: [],
    missingScreenshotFiles: []
  };
}

describe('validateMetadata', () => {
  it('passes with valid metadata', () => {
    const metadata = makeMetadata();
    const result = validateMetadata(metadata);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
  });

  it('fails when required config field is missing', () => {
    const metadata = makeMetadata();
    delete metadata.config.app.bundle_id;
    const result = validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_CONFIG_MISSING' && e.field === 'app.bundle_id'));
  });

  it('fails when required config field is blank', () => {
    const metadata = makeMetadata();
    metadata.config.app.bundle_id = '';
    const result = validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_CONFIG_MISSING' && e.field === 'app.bundle_id'));
  });

  it('fails when store.locales is empty', () => {
    const metadata = makeMetadata({ store: { primary_language: 'en-US', default_locale: 'en-US', locales: [] } });
    metadata.configuredLocales = [];
    const result = validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'LOCALES_EMPTY'));
  });

  it('fails when locale file is missing', () => {
    const metadata = makeMetadata();
    metadata.missingLocaleFiles = ['/tmp/test/AppStoreMetadata/locales/ja.yaml'];
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'LOCALE_FILE_MISSING'));
  });

  it('warns when screenshot file is missing', () => {
    const metadata = makeMetadata();
    metadata.missingScreenshotFiles = ['/tmp/test/AppStoreMetadata/screenshots/ja.yaml'];
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'SCREENSHOT_FILE_MISSING'));
  });

  it('fails when locale field mismatches file name', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].locale = 'zh-Hans';
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'LOCALE_MISMATCH'));
  });

  it('fails when required metadata field is missing', () => {
    const metadata = makeMetadata();
    delete metadata.locales['en-US'].metadata.name;
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_METADATA_MISSING' && e.field === 'metadata.name'));
  });

  it('fails when name is too short', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.name = 'A';
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'APP_NAME_LENGTH_INVALID'));
  });

  it('fails when name is too long', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.name = 'A'.repeat(31);
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'APP_NAME_LENGTH_INVALID'));
  });

  it('fails when subtitle exceeds 30 characters', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.subtitle = 'A'.repeat(31);
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG' && e.field === 'metadata.subtitle'));
  });

  it('fails when description exceeds 4000 characters', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.description = 'A'.repeat(4001);
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG' && e.field === 'metadata.description'));
  });

  it('fails when keywords exceed 100 UTF-8 bytes', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = '中'.repeat(34);
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG_BYTES' && e.field === 'metadata.keywords'));
  });

  it('fails when privacy URL is missing', () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.privacy;
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'PRIVACY_URL_INVALID'));
  });

  it('fails when privacy URL is not http/https', () => {
    const metadata = makeMetadata();
    metadata.config.urls.privacy = 'ftp://example.com/privacy';
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'PRIVACY_URL_INVALID'));
  });

  it('fails when support URL is invalid', () => {
    const metadata = makeMetadata();
    metadata.config.urls.support = 'not-a-url';
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SUPPORT_URL_INVALID'));
  });

  it('warns when terms URL is missing', () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.terms;
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'TERMS_URL_RECOMMENDED'));
  });

  it('warns when keywords contain app name', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'testapp,other,keywords';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_REVIEW_RECOMMENDED'));
  });

  it('warns when keywords contain competitor terms', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'google,search,tool';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_REVIEW_RECOMMENDED'));
  });

  it('includes summary with correct counts', () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.terms;
    const result = validateMetadata(metadata);
    assert.equal(result.summary.errorCount, result.errors.length);
    assert.equal(result.summary.warningCount, result.warnings.length);
    assert.equal(result.summary.passedCount, result.passed.length);
  });

  it('handles locale with per-locale URL overrides', () => {
    const metadata = makeMetadata();
    metadata.config.urls.privacy = { 'en-US': 'https://example.com/en/privacy', 'zh-Hans': 'https://example.com/zh/privacy' };
    const result = validateMetadata(metadata);
    assert.ok(result.passed.some(e => e.code === 'PRIVACY_URL_OK'));
  });

  it('validates review notes byte length', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].review.notes = '中'.repeat(1334);
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG_BYTES' && e.field === 'review.notes'));
  });

  it('fails when platform is invalid', () => {
    const metadata = makeMetadata();
    metadata.config.app.platform = 'android';
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'INVALID_PLATFORM'));
  });

  it('warns when keywords have duplicates', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'test,app,test';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_DUPLICATE'));
  });

  it('warns when keywords have leading/trailing spaces', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'test, app ,demo';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_WHITESPACE'));
  });

  it('warns when apple_id is not numeric', () => {
    const metadata = makeMetadata();
    metadata.config.app.apple_id = 'not-a-number';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'APPLE_ID_FORMAT'));
  });

  it('warns when description is too short', () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.description = 'Short';
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'DESCRIPTION_TOO_SHORT'));
  });

  it('fails when screenshot title exceeds limit', () => {
    const metadata = makeMetadata();
    metadata.screenshots = {
      'en-US': {
        sets: {
          iphone_6_9: [
            { title: 'A'.repeat(31), subtitle: 'OK' }
          ]
        }
      }
    };
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_TITLE_TOO_LONG'));
  });

  it('fails when screenshot subtitle exceeds limit', () => {
    const metadata = makeMetadata();
    metadata.screenshots = {
      'en-US': {
        sets: {
          iphone_6_9: [
            { title: 'OK', subtitle: 'B'.repeat(46) }
          ]
        }
      }
    };
    const result = validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_SUBTITLE_TOO_LONG'));
  });

  it('warns when screenshot set name is unknown', () => {
    const metadata = makeMetadata();
    metadata.screenshots = {
      'en-US': {
        sets: {
          unknown_device: [
            { title: 'OK', subtitle: 'OK' }
          ]
        }
      }
    };
    const result = validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'UNKNOWN_SCREENSHOT_SET'));
  });
});
