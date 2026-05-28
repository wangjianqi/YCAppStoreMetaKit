const path = require('path');
const fs = require('fs-extra');
const { generatedDir } = require('../core/paths');
const { getLocaleUrl } = require('../core/loadMetadata');

async function write(filePath, value) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, String(value || '').trim() + '\n', 'utf8');
}

const FASTLANE_SET_NAMES = {
  iphone_6_9: 'iPhone 6.9 inch',
  iphone_6_7: 'iPhone 6.7 inch',
  iphone_6_1: 'iPhone 6.1 inch',
  ipad_13: 'iPad 13 inch',
  ipad_11: 'iPad 11 inch',
  ipad_pro_13: 'iPad Pro 13 inch',
  ipad_pro_12: 'iPad Pro 12 inch'
};

async function generateFastlane(metadata) {
  const base = path.join(generatedDir(metadata.root), 'fastlane', 'metadata');
  const written = [];

  for (const locale of metadata.configuredLocales) {
    const data = metadata.locales[locale];
    if (!data) continue;
    const m = data.metadata || {};
    const dir = path.join(base, locale);
    const files = {
      'name.txt': m.name,
      'subtitle.txt': m.subtitle,
      'promotional_text.txt': m.promotional_text,
      'description.txt': m.description,
      'keywords.txt': m.keywords,
      'release_notes.txt': m.whats_new,
      'support_url.txt': getLocaleUrl(metadata.config, 'support', locale),
      'marketing_url.txt': getLocaleUrl(metadata.config, 'marketing', locale),
      'privacy_url.txt': getLocaleUrl(metadata.config, 'privacy', locale)
    };
    for (const [name, value] of Object.entries(files)) {
      const target = path.join(dir, name);
      await write(target, value);
      written.push(target);
    }

    const screenshotsDir = path.join(dir, 'screenshots');
    await fs.ensureDir(screenshotsDir);

    const assetScreenshots = metadata.assets?.screenshots?.[locale] || {};
    for (const [setName, files_list] of Object.entries(assetScreenshots)) {
      if (!Array.isArray(files_list)) continue;
      const fastlaneName = FASTLANE_SET_NAMES[setName];
      if (!fastlaneName) continue;
      for (let i = 0; i < files_list.length; i++) {
        const src = files_list[i];
        const ext = path.extname(src);
        const destFileName = `${String(i + 1).padStart(2, '0')}_${fastlaneName.replace(/ /g, '')}${ext}`;
        const dest = path.join(screenshotsDir, destFileName);
        try {
          await fs.copy(src, dest, { overwrite: true });
          written.push(dest);
        } catch {
          // skip files that cannot be copied
        }
      }
    }
  }

  return written;
}

module.exports = {
  generateFastlane
};
