const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const { scanAssets, groupVideosBySet } = require('../src/core/assetScanner');

const TMP = path.join(require('os').tmpdir(), 'ycmeta-scanner-test-' + Date.now());

async function setupDir() {
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'locales'));
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'screenshots'));
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'iphone_6_9'));
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'previews'));
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'assets', 'zh-Hans', 'iphone_6_9'));
  await fs.ensureDir(path.join(TMP, 'AppStoreMetadata', 'assets', 'zh-Hans', 'previews'));

  await fs.writeFile(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'iphone_6_9', '01.png'), 'fake');
  await fs.writeFile(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'iphone_6_9', '02.png'), 'fake');
  await fs.writeFile(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'previews', 'iphone_6_9_01.mp4'), 'fake');
  await fs.writeFile(path.join(TMP, 'AppStoreMetadata', 'assets', 'en-US', 'previews', 'random.txt'), 'not-a-video');
}

function cleanup() {
  fs.removeSync(TMP);
}

describe('scanAssets', () => {
  beforeEach(setupDir);
  afterEach(cleanup);

  it('scans screenshot files from assets directory', async () => {
    const { screenshots, videos } = await scanAssets(
      path.join(TMP, 'AppStoreMetadata'),
      ['en-US']
    );
    assert.ok(screenshots['en-US']);
    assert.ok(screenshots['en-US']['iphone_6_9']);
    assert.equal(screenshots['en-US']['iphone_6_9'].length, 2);
    assert.ok(screenshots['en-US']['iphone_6_9'][0].endsWith('01.png'));
  });

  it('scans video files from previews directory', async () => {
    const { videos } = await scanAssets(
      path.join(TMP, 'AppStoreMetadata'),
      ['en-US']
    );
    assert.ok(videos['en-US']);
    assert.ok(videos['en-US']['iphone_6_9']);
    assert.equal(videos['en-US']['iphone_6_9'].length, 1);
    assert.ok(videos['en-US']['iphone_6_9'][0].endsWith('iphone_6_9_01.mp4'));
  });

  it('returns empty objects when assets directory does not exist', async () => {
    const { screenshots, videos } = await scanAssets('/tmp/nonexistent-' + Date.now(), ['en-US']);
    assert.deepStrictEqual(screenshots, {});
    assert.deepStrictEqual(videos, {});
  });

  it('returns empty for locale with no assets', async () => {
    const { screenshots, videos } = await scanAssets(
      path.join(TMP, 'AppStoreMetadata'),
      ['ja']
    );
    assert.deepStrictEqual(screenshots, {});
    assert.deepStrictEqual(videos, {});
  });

  it('ignores non-image files in screenshot directories', async () => {
    const { screenshots } = await scanAssets(
      path.join(TMP, 'AppStoreMetadata'),
      ['en-US']
    );
    const files = screenshots['en-US']['iphone_6_9'] || [];
    const hasTxt = files.some(f => f.endsWith('.txt'));
    assert.equal(hasTxt, false);
  });
});

describe('groupVideosBySet', () => {
  it('groups videos by device set prefix', () => {
    const result = groupVideosBySet([
      '/path/iphone_6_9_01.mp4',
      '/path/iphone_6_9_02.mp4',
      '/path/ipad_13_01.mov'
    ]);
    assert.equal(result.iphone_6_9.length, 2);
    assert.equal(result.ipad_13.length, 1);
  });

  it('puts unmatched files in _unmatched', () => {
    const result = groupVideosBySet(['/path/preview.mp4']);
    assert.ok(result._unmatched);
    assert.equal(result._unmatched.length, 1);
  });
});
