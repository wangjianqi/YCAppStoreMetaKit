const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const { validateAssets } = require('../src/core/assetValidator');

const TMP = path.join(require('os').tmpdir(), 'ycmeta-validator-test-' + Date.now());

async function createFakePNG(filePath, width, height) {
  await fs.ensureDir(path.dirname(filePath));
  if (width && height) {
    const buf = Buffer.alloc(width * height * 4);
    buf.write('RIFF', 0);
    await fs.writeFile(filePath, buf);
  } else {
    await fs.writeFile(filePath, Buffer.from('fake-png'));
  }
}

function cleanup() {
  fs.removeSync(TMP);
}

describe('validateAssets', () => {
  afterEach(cleanup);

  it('returns empty results when no assets', () => {
    const result = validateAssets({}, {});
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 0);
  });

  it('warns when screenshot copy has no matching assets', () => {
    const assets = { screenshots: {}, videos: {} };
    const screenshotCopy = {
      'en-US': {
        sets: {
          iphone_6_9: [{ title: 'Hello', subtitle: 'World' }]
        }
      }
    };
    const result = validateAssets(assets, screenshotCopy);
    assert.ok(result.warnings.some(w => w.code === 'NO_ASSETS_FOR_SET'));
  });

  it('errors on too many screenshots', async () => {
    const files = [];
    for (let i = 1; i <= 11; i++) {
      const fp = path.join(TMP, `${String(i).padStart(2, '0')}.png`);
      await createFakePNG(fp);
      files.push(fp);
    }
    const assets = {
      screenshots: { 'en-US': { iphone_6_9: files } },
      videos: {}
    };
    const result = validateAssets(assets, {});
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_TOO_MANY'));
  });

  it('warns on screenshot/copy count mismatch', () => {
    const assets = {
      screenshots: { 'en-US': { iphone_6_9: ['/fake/01.png', '/fake/02.png'] } },
      videos: {}
    };
    const screenshotCopy = {
      'en-US': {
        sets: {
          iphone_6_9: [{ title: 'A', subtitle: 'B' }]
        }
      }
    };
    const result = validateAssets(assets, screenshotCopy);
    assert.ok(result.warnings.some(w => w.code === 'SCREENSHOT_COPY_MISMATCH'));
  });

  it('errors on invalid screenshot format', () => {
    const assets = {
      screenshots: { 'en-US': { iphone_6_9: ['/fake/01.gif'] } },
      videos: {}
    };
    const result = validateAssets(assets, {});
    assert.ok(result.errors.some(e => e.code === 'SCREENSHOT_INVALID_FORMAT'));
  });

  it('errors on invalid video format', () => {
    const assets = {
      screenshots: {},
      videos: { 'en-US': { iphone_6_9: ['/fake/preview.avi'] } }
    };
    const result = validateAssets(assets, {});
    assert.ok(result.errors.some(e => e.code === 'VIDEO_INVALID_FORMAT'));
  });

  it('errors on too many videos per set', () => {
    const assets = {
      screenshots: {},
      videos: { 'en-US': { iphone_6_9: ['/fake/iphone_6_9_01.mp4', '/fake/iphone_6_9_02.mp4', '/fake/iphone_6_9_03.mp4', '/fake/iphone_6_9_04.mp4'] } }
    };
    const result = validateAssets(assets, {});
    assert.ok(result.errors.some(e => e.code === 'VIDEO_TOO_MANY'));
  });

  it('warns on unknown screenshot set directory', () => {
    const assets = {
      screenshots: { 'en-US': { unknown_device: ['/fake/01.png'] } },
      videos: {}
    };
    const result = validateAssets(assets, {});
    assert.ok(result.warnings.some(w => w.code === 'UNKNOWN_SCREENSHOT_SET_DIR'));
  });
});
