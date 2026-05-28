const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const { generateFastlane } = require('../src/generators/fastlaneGenerator');

const TMP = path.join(require('os').tmpdir(), 'ycmeta-fastlane-test-' + Date.now());

function makeMetadata() {
  return {
    root: TMP,
    config: {
      app: { internal_name: 'TestApp' },
      urls: {
        privacy: 'https://example.com/privacy',
        terms: 'https://example.com/terms',
        support: 'https://example.com/support',
        marketing: 'https://example.com'
      },
      store: { default_locale: 'en-US' }
    },
    configuredLocales: ['en-US'],
    locales: {
      'en-US': {
        metadata: {
          name: 'TestApp',
          subtitle: 'A test app',
          promotional_text: 'Promo text',
          description: 'Description',
          keywords: 'test,app',
          whats_new: 'v1.0.0'
        }
      }
    },
    screenshots: {}
  };
}

describe('generateFastlane', () => {
  beforeEach(() => fs.ensureDirSync(TMP));
  afterEach(() => fs.removeSync(TMP));

  it('creates fastlane metadata files for each locale', async () => {
    const metadata = makeMetadata();
    const files = await generateFastlane(metadata);
    assert.ok(files.length > 0);

    const nameContent = await fs.readFile(path.join(TMP, 'AppStoreMetadata', 'generated', 'fastlane', 'metadata', 'en-US', 'name.txt'), 'utf8');
    assert.equal(nameContent.trim(), 'TestApp');

    const descContent = await fs.readFile(path.join(TMP, 'AppStoreMetadata', 'generated', 'fastlane', 'metadata', 'en-US', 'description.txt'), 'utf8');
    assert.equal(descContent.trim(), 'Description');
  });

  it('creates privacy_url.txt', async () => {
    const metadata = makeMetadata();
    await generateFastlane(metadata);
    const content = await fs.readFile(path.join(TMP, 'AppStoreMetadata', 'generated', 'fastlane', 'metadata', 'en-US', 'privacy_url.txt'), 'utf8');
    assert.equal(content.trim(), 'https://example.com/privacy');
  });

  it('creates release_notes.txt from whats_new', async () => {
    const metadata = makeMetadata();
    await generateFastlane(metadata);
    const content = await fs.readFile(path.join(TMP, 'AppStoreMetadata', 'generated', 'fastlane', 'metadata', 'en-US', 'release_notes.txt'), 'utf8');
    assert.equal(content.trim(), 'v1.0.0');
  });

  it('skips locale with no data', async () => {
    const metadata = makeMetadata();
    metadata.configuredLocales = ['en-US', 'ja'];
    metadata.locales['ja'] = undefined;
    const files = await generateFastlane(metadata);
    const jaFiles = files.filter(f => f.includes('/ja/'));
    assert.equal(jaFiles.length, 0);
  });

  it('handles empty field values', async () => {
    const metadata = makeMetadata();
    metadata.locales['en-US'].metadata.subtitle = '';
    const files = await generateFastlane(metadata);
    const subtitleFile = files.find(f => f.endsWith('subtitle.txt'));
    const content = await fs.readFile(subtitleFile, 'utf8');
    assert.equal(content.trim(), '');
  });
});
