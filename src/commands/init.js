const path = require('path');
const fs = require('fs-extra');
const { templatesDir, metadataDir } = require('../core/paths');
const { copyFileIfAbsent, writeFileIfAbsent, relativeFromCwd } = require('../utils/fs');
const logger = require('../utils/logger');

function projectReadme() {
  return `# AppStoreMetadata

This directory is managed by YCAppStoreMetaKit.

## Source files

- appstore.config.yaml
- locales/*.yaml
- screenshots/*.yaml
- review/*.md

## Generated files

- generated/index.html
- generated/summary.md
- generated/fastlane/

## Common commands

\`\`\`bash
ycmeta check
ycmeta p
ycmeta f
\`\`\`

Edit source files only. Do not manually edit files under generated/.
`;
}

async function init(options = {}) {
  const force = !!options.force;
  const root = process.cwd();
  const dir = metadataDir(root);
  const templates = templatesDir();
  await fs.ensureDir(dir);

  const tasks = [
    [path.join(templates, 'appstore.config.yaml'), path.join(dir, 'appstore.config.yaml')],
    [path.join(templates, 'locale.en-US.yaml'), path.join(dir, 'locales', 'en-US.yaml')],
    [path.join(templates, 'locale.zh-Hans.yaml'), path.join(dir, 'locales', 'zh-Hans.yaml')],
    [path.join(templates, 'screenshots.en-US.yaml'), path.join(dir, 'screenshots', 'en-US.yaml')],
    [path.join(templates, 'screenshots.zh-Hans.yaml'), path.join(dir, 'screenshots', 'zh-Hans.yaml')],
    [path.join(templates, 'review-notes.en-US.md'), path.join(dir, 'review', 'review-notes.en-US.md')]
  ];

  const results = [];
  for (const [from, to] of tasks) {
    results.push(await copyFileIfAbsent(from, to, { force }));
  }
  await fs.ensureDir(path.join(dir, 'generated'));
  results.push(await writeFileIfAbsent(path.join(dir, 'README.md'), projectReadme(), { force }));

  logger.success('YCAppStoreMetaKit initialized.');
  for (const r of results) {
    const label = r.status === 'skipped' ? 'Skipped' : r.status === 'overwritten' ? 'Overwritten' : 'Created';
    logger.plain(`- ${label}: ${relativeFromCwd(r.filePath)}`);
  }
  logger.plain('\nNext steps:');
  logger.plain('  ycmeta check');
  logger.plain('  ycmeta p');
}

module.exports = init;
