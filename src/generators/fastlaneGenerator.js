const path = require('path');
const fs = require('fs-extra');
const { generatedDir } = require('../core/paths');
const { getLocaleUrl } = require('../core/loadMetadata');

async function write(filePath, value) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, String(value || '').trim() + '\n', 'utf8');
}

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
  }

  return written;
}

module.exports = {
  generateFastlane
};
