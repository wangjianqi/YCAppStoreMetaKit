const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { LIMITS, SCREENSHOT_LIMITS, VALID_PLATFORMS, VALID_SCREENSHOT_SETS, REQUIRED_CONFIG_PATHS, REQUIRED_LOCALE_METADATA_FIELDS } = require('../src/core/schema');

describe('schema', () => {
  it('has correct name limits', () => {
    assert.equal(LIMITS.name.min, 2);
    assert.equal(LIMITS.name.max, 30);
    assert.equal(LIMITS.name.unit, 'characters');
  });

  it('has correct keywords limits', () => {
    assert.equal(LIMITS.keywords.max, 100);
    assert.equal(LIMITS.keywords.unit, 'utf8-bytes');
  });

  it('has correct review_notes limits', () => {
    assert.equal(LIMITS.review_notes.max, 4000);
    assert.equal(LIMITS.review_notes.unit, 'utf8-bytes');
  });

  it('includes all required config paths', () => {
    assert.ok(REQUIRED_CONFIG_PATHS.includes('app.internal_name'));
    assert.ok(REQUIRED_CONFIG_PATHS.includes('app.bundle_id'));
    assert.ok(REQUIRED_CONFIG_PATHS.includes('store.locales'));
  });

  it('includes all required locale metadata fields', () => {
    assert.ok(REQUIRED_LOCALE_METADATA_FIELDS.includes('name'));
    assert.ok(REQUIRED_LOCALE_METADATA_FIELDS.includes('subtitle'));
    assert.ok(REQUIRED_LOCALE_METADATA_FIELDS.includes('keywords'));
  });

  it('schema objects are frozen', () => {
    assert.ok(Object.isFrozen(LIMITS));
    assert.ok(Object.isFrozen(SCREENSHOT_LIMITS));
  });

  it('has screenshot title and subtitle limits', () => {
    assert.equal(SCREENSHOT_LIMITS.title.max, 30);
    assert.equal(SCREENSHOT_LIMITS.subtitle.max, 45);
  });

  it('has valid platforms list', () => {
    assert.ok(VALID_PLATFORMS.includes('ios'));
    assert.ok(VALID_PLATFORMS.includes('macos'));
    assert.ok(VALID_PLATFORMS.includes('tvos'));
    assert.ok(VALID_PLATFORMS.includes('visionos'));
  });

  it('has valid screenshot set names', () => {
    assert.ok(VALID_SCREENSHOT_SETS.includes('iphone_6_9'));
    assert.ok(VALID_SCREENSHOT_SETS.includes('ipad_13'));
  });
});
