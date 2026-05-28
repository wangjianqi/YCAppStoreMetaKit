const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
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

## Media assets

- assets/{locale}/iphone_6_9/  — iPhone 6.9" screenshots (01.png, 02.png, ...)
- assets/{locale}/ipad_13/     — iPad 13" screenshots
- assets/{locale}/previews/    — App preview videos (iphone_6_9_01.mp4, ...)

Screenshot naming: {NN}.png or {NN}.jpg (01-based, matching screenshots YAML order)
Video naming: {device_set}_{NN}.{ext} (e.g. iphone_6_9_01.mp4)

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

function localeYaml(locale) {
  return `locale: "${locale}"

metadata:
  name: ""
  subtitle: ""
  promotional_text: ""
  description: ""
  keywords: ""
  whats_new: ""

review:
  notes: ""

compliance:
  privacy_summary: ""
  demo_content_notice: ""
`;
}

function screenshotYaml(locale) {
  return `locale: "${locale}"

sets:
  iphone_6_9:
    - title: ""
      subtitle: ""
`;
}

async function init(options = {}) {
  const force = !!options.force;
  const root = process.cwd();
  const dir = metadataDir(root);
  const templates = templatesDir();
  await fs.ensureDir(dir);

  const localeList = options.locales
    ? options.locales.split(',').map(l => l.trim()).filter(Boolean)
    : ['en-US', 'zh-Hans'];

  const builtinLocales = ['en-US', 'zh-Hans'];
  const tasks = [];

  tasks.push([path.join(templates, 'appstore.config.yaml'), path.join(dir, 'appstore.config.yaml')]);

  for (const locale of localeList) {
    if (builtinLocales.includes(locale)) {
      tasks.push([path.join(templates, `locale.${locale}.yaml`), path.join(dir, 'locales', `${locale}.yaml`)]);
      tasks.push([path.join(templates, `screenshots.${locale}.yaml`), path.join(dir, 'screenshots', `${locale}.yaml`)]);
    }
  }

  const results = [];
  for (const [from, to] of tasks) {
    results.push(await copyFileIfAbsent(from, to, { force }));
  }

  for (const locale of localeList) {
    if (!builtinLocales.includes(locale)) {
      const localeFilePath = path.join(dir, 'locales', `${locale}.yaml`);
      results.push(await writeFileIfAbsent(localeFilePath, localeYaml(locale), { force }));
      const screenshotFilePath = path.join(dir, 'screenshots', `${locale}.yaml`);
      results.push(await writeFileIfAbsent(screenshotFilePath, screenshotYaml(locale), { force }));
    }
  }

  if (options.locales) {
    const configPath = path.join(dir, 'appstore.config.yaml');
    if (await fs.pathExists(configPath)) {
      const configText = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(configText) || {};
      config.store = config.store || {};
      config.store.locales = localeList;
      config.store.default_locale = localeList[0] || 'en-US';
      config.store.primary_language = localeList[0] || 'en-US';
      await fs.writeFile(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true }), 'utf8');
    }
  }

  await fs.ensureDir(path.join(dir, 'generated'));
  await fs.ensureDir(path.join(dir, 'assets'));
  for (const locale of localeList) {
    await fs.ensureDir(path.join(dir, 'assets', locale, 'iphone_6_9'));
    await fs.ensureDir(path.join(dir, 'assets', locale, 'previews'));
  }
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
