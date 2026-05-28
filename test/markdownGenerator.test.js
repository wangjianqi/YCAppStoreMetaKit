const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateMarkdown } = require('../src/generators/markdownGenerator');

function makeMetadata() {
  return {
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
      store: {
        primary_category: 'Utilities',
        secondary_category: 'Productivity'
      },
      urls: {
        privacy: 'https://example.com/privacy',
        terms: 'https://example.com/terms',
        support: 'https://example.com/support',
        marketing: 'https://example.com'
      }
    },
    locales: {
      'en-US': {
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
    configuredLocales: ['en-US']
  };
}

describe('generateMarkdown', () => {
  it('produces markdown with app info', () => {
    const md = generateMarkdown(makeMetadata());
    assert.ok(md.includes('# App Store Metadata Summary'));
    assert.ok(md.includes('TestApp'));
    assert.ok(md.includes('com.test.app'));
  });

  it('includes locale sections', () => {
    const md = generateMarkdown(makeMetadata());
    assert.ok(md.includes('## en-US'));
    assert.ok(md.includes('A test app'));
  });

  it('includes screenshot copy', () => {
    const md = generateMarkdown(makeMetadata());
    assert.ok(md.includes('Hello'));
    assert.ok(md.includes('World'));
  });

  it('handles empty screenshots', () => {
    const metadata = makeMetadata();
    metadata.screenshots = {};
    const md = generateMarkdown(metadata);
    assert.ok(md.includes('# App Store Metadata Summary'));
  });
});
