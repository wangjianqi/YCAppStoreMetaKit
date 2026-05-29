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
  it('passes with valid metadata', async () => {
    const metadata = makeMetadata();
    const result = await validateMetadata(metadata);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
  });

  it('fails when required config field is missing', async () => {
    const metadata = makeMetadata();
    delete metadata.config.app.bundle_id;
    const result = await validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_CONFIG_MISSING' && e.field === 'app.bundle_id'));
  });

  it('fails when required config field is blank', async () => {
    const metadata = makeMetadata();
    metadata.config.app.bundle_id = '';
    const result = await validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_CONFIG_MISSING' && e.field === 'app.bundle_id'));
  });

  it('fails when store.locales is empty', async () => {
    const metadata = makeMetadata({ store: { primary_language: 'en-US', default_locale: 'en-US', locales: [] } });
    metadata.configuredLocales = [];
    const result = await validateMetadata(metadata);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => e.code === 'LOCALES_EMPTY'));
  });

  it('fails when locale file is missing', async () => {
    const metadata = makeMetadata();
    metadata.missingLocaleFiles = ['/tmp/test/AppStoreMetadata/locales/ja.yaml'];
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'LOCALE_FILE_MISSING'));
  });

  it('warns when screenshot file is missing', async () => {
    const metadata = makeMetadata();
    metadata.missingScreenshotFiles = ['/tmp/test/AppStoreMetadata/screenshots/ja.yaml'];
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'SCREENSHOT_FILE_MISSING'));
  });

  it('fails when locale field mismatches file name', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].locale = 'zh-Hans';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'LOCALE_MISMATCH'));
  });

  it('fails when required metadata field is missing', async () => {
    const metadata = makeMetadata();
    delete metadata.locales['en-US'].metadata.name;
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_METADATA_MISSING' && e.field === 'metadata.name'));
  });

  it('fails when name is too short', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.name = 'A';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'APP_NAME_LENGTH_INVALID'));
  });

  it('fails when name is too long', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.name = 'A'.repeat(31);
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'APP_NAME_LENGTH_INVALID'));
  });

  it('fails when subtitle exceeds 30 characters', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.subtitle = 'A'.repeat(31);
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG' && e.field === 'metadata.subtitle'));
  });

  it('fails when description exceeds 4000 characters', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.description = 'A'.repeat(4001);
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG' && e.field === 'metadata.description'));
  });

  it('fails when keywords exceed 100 UTF-8 bytes', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = '中'.repeat(34);
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG_BYTES' && e.field === 'metadata.keywords'));
  });

  it('fails when privacy URL is missing', async () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.privacy;
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'PRIVACY_URL_INVALID'));
  });

  it('fails when privacy URL is not http/https', async () => {
    const metadata = makeMetadata();
    metadata.config.urls.privacy = 'ftp://example.com/privacy';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'PRIVACY_URL_INVALID'));
  });

  it('fails when support URL is invalid', async () => {
    const metadata = makeMetadata();
    metadata.config.urls.support = 'not-a-url';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SUPPORT_URL_INVALID'));
  });

  it('warns when terms URL is missing', async () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.terms;
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'TERMS_URL_RECOMMENDED'));
  });

  it('warns when keywords contain app name', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'testapp,other,keywords';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_REVIEW_RECOMMENDED'));
  });

  it('warns when keywords contain competitor terms', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'google,search,tool';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_REVIEW_RECOMMENDED'));
  });

  it('includes summary with correct counts', async () => {
    const metadata = makeMetadata();
    delete metadata.config.urls.terms;
    const result = await validateMetadata(metadata);
    assert.equal(result.summary.errorCount, result.errors.length);
    assert.equal(result.summary.warningCount, result.warnings.length);
    assert.equal(result.summary.passedCount, result.passed.length);
  });

  it('handles locale with per-locale URL overrides', async () => {
    const metadata = makeMetadata();
    metadata.config.urls.privacy = { 'en-US': 'https://example.com/en/privacy', 'zh-Hans': 'https://example.com/zh/privacy' };
    const result = await validateMetadata(metadata);
    assert.ok(result.passed.some(e => e.code === 'PRIVACY_URL_OK'));
  });

  it('validates review notes byte length', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].review.notes = '中'.repeat(1334);
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'FIELD_TOO_LONG_BYTES' && e.field === 'review.notes'));
  });

  it('fails when platform is invalid', async () => {
    const metadata = makeMetadata();
    metadata.config.app.platform = 'android';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'INVALID_PLATFORM'));
  });

  it('warns when keywords have duplicates', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'test,app,test';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_DUPLICATE'));
  });

  it('warns when keywords have leading/trailing spaces', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.keywords = 'test, app ,demo';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'KEYWORDS_WHITESPACE'));
  });

  it('warns when apple_id is not numeric', async () => {
    const metadata = makeMetadata();
    metadata.config.app.apple_id = 'not-a-number';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'APPLE_ID_FORMAT'));
  });

  it('warns when description is too short', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.description = 'Short';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'DESCRIPTION_TOO_SHORT'));
  });

  it('fails when screenshot title exceeds limit', async () => {
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
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_TITLE_TOO_LONG'));
  });

  it('fails when screenshot subtitle exceeds limit', async () => {
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
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_SUBTITLE_TOO_LONG'));
  });

  it('warns when screenshot set name is unknown', async () => {
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
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'UNKNOWN_SCREENSHOT_SET'));
  });

  it('fails when primary category is invalid', async () => {
    const metadata = makeMetadata();
    metadata.config.store.primary_category = 'InvalidCategory';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'INVALID_PRIMARY_CATEGORY'));
  });

  it('fails when secondary category is invalid', async () => {
    const metadata = makeMetadata();
    metadata.config.store.secondary_category = 'InvalidCategory';
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'INVALID_SECONDARY_CATEGORY'));
  });

  it('warns when version does not follow semver', async () => {
    const metadata = makeMetadata();
    metadata.config.app.version = 'abc';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'VERSION_FORMAT'));
  });

  it('warns when bundle_id does not follow reverse-domain format', async () => {
    const metadata = makeMetadata();
    metadata.config.app.bundle_id = 'not-a-bundle-id';
    const result = await validateMetadata(metadata);
    assert.ok(result.warnings.some(e => e.code === 'BUNDLE_ID_FORMAT'));
  });

  it('fails when store.locales has duplicates', async () => {
    const metadata = makeMetadata();
    metadata.configuredLocales = ['en-US', 'en-US'];
    metadata.config.store.locales = ['en-US', 'en-US'];
    const result = await validateMetadata(metadata);
    assert.ok(result.errors.some(e => e.code === 'DUPLICATE_LOCALE'));
  });
});
