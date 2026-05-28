const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { requireMetadataDir } = require('../core/paths');
const { writeFileIfAbsent, relativeFromCwd } = require('../utils/fs');
const logger = require('../utils/logger');

async function addLocale(locale, options = {}) {
  if (!locale) {
    const err = new Error('Locale code is required. Usage: ycmeta add-locale <locale>');
    err.exitCode = 1;
    throw err;
  }

  const force = !!options.force;
  const dir = requireMetadataDir(process.cwd());
  const configPath = path.join(dir, 'appstore.config.yaml');
  const configText = await fs.readFile(configPath, 'utf8');
  const config = yaml.load(configText) || {};

  const locales = Array.isArray(config.store?.locales) ? config.store.locales : [];
  if (locales.includes(locale)) {
    logger.warn(`Locale "${locale}" already exists in store.locales.`);
    return;
  }

  const defaultLocale = config.store?.default_locale || locales[0] || 'en-US';
  const sourceLocalePath = path.join(dir, 'locales', `${defaultLocale}.yaml`);
  const sourceScreenshotPath = path.join(dir, 'screenshots', `${defaultLocale}.yaml`);

  let localeTemplate = `locale: "${locale}"\n\nmetadata:\n  name: ""\n  subtitle: ""\n  promotional_text: ""\n  description: ""\n  keywords: ""\n  whats_new: ""\n\nreview:\n  notes: ""\n\ncompliance:\n  privacy_summary: ""\n  demo_content_notice: ""\n`;
  if (await fs.pathExists(sourceLocalePath)) {
    const sourceData = yaml.load(await fs.readFile(sourceLocalePath, 'utf8')) || {};
    const m = sourceData.metadata || {};
    localeTemplate = `locale: "${locale}"\n\nmetadata:\n  name: "${m.name || ''}"\n  subtitle: ""\n  promotional_text: ""\n  description: ""\n  keywords: ""\n  whats_new: ""\n\nreview:\n  notes: ""\n\ncompliance:\n  privacy_summary: ""\n  demo_content_notice: ""\n`;
  }

  let screenshotTemplate = `locale: "${locale}"\n\nsets:\n  iphone_6_9:\n    - title: ""\n      subtitle: ""\n`;
  if (await fs.pathExists(sourceScreenshotPath)) {
    const sourceData = yaml.load(await fs.readFile(sourceScreenshotPath, 'utf8')) || {};
    const sets = sourceData.sets || {};
    const setEntries = Object.entries(sets).map(([setName, items]) => {
      const rows = (items || []).map(() => `    - title: ""\n      subtitle: ""`).join('\n');
      return `  ${setName}:\n${rows}`;
    }).join('\n');
    screenshotTemplate = `locale: "${locale}"\n\nsets:\n${setEntries}\n`;
  }

  config.store.locales = [...locales, locale];
  await fs.writeFile(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true }), 'utf8');

  const localeFilePath = path.join(dir, 'locales', `${locale}.yaml`);
  const screenshotFilePath = path.join(dir, 'screenshots', `${locale}.yaml`);

  const localeResult = await writeFileIfAbsent(localeFilePath, localeTemplate, { force });
  const screenshotResult = await writeFileIfAbsent(screenshotFilePath, screenshotTemplate, { force });

  logger.success(`Added locale "${locale}".`);
  logger.plain(`- Updated: ${relativeFromCwd(configPath)}`);
  logger.plain(`- ${localeResult.status === 'skipped' ? 'Skipped' : 'Created'}: ${relativeFromCwd(localeFilePath)}`);
  logger.plain(`- ${screenshotResult.status === 'skipped' ? 'Skipped' : 'Created'}: ${relativeFromCwd(screenshotFilePath)}`);
  logger.plain('\nNext steps:');
  logger.plain('  Edit the new locale files');
  logger.plain('  ycmeta check');
}

module.exports = addLocale;
