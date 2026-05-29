const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { requireMetadataDir } = require('../core/paths');
const { writeFileIfAbsent, relativeFromCwd } = require('../utils/fs');
const logger = require('../utils/logger');
const { localeYamlFromSource, screenshotYamlFromSource, localeYaml, screenshotYaml } = require('../core/localeTemplate');
const { APPLE_LOCALES } = require('../core/schema');

async function addLocale(locale, options = {}) {
  if (!locale) {
    const err = new Error('Locale code is required. Usage: ycmeta add-locale <locale>');
    err.exitCode = 1;
    throw err;
  }

  if (!APPLE_LOCALES.includes(locale)) {
    const err = new Error(`"${locale}" is not a recognized Apple locale code. Valid locales: ${APPLE_LOCALES.join(', ')}`);
    err.exitCode = 1;
    throw err;
  }

  const force = !!options.force;
  const dir = await requireMetadataDir(process.cwd());
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

  let localeTemplate = localeYaml(locale);
  if (await fs.pathExists(sourceLocalePath)) {
    const sourceData = yaml.load(await fs.readFile(sourceLocalePath, 'utf8')) || {};
    localeTemplate = localeYamlFromSource(locale, sourceData);
  }

  let screenshotTemplate = screenshotYaml(locale);
  if (await fs.pathExists(sourceScreenshotPath)) {
    const sourceData = yaml.load(await fs.readFile(sourceScreenshotPath, 'utf8')) || {};
    screenshotTemplate = screenshotYamlFromSource(locale, sourceData);
  }

  config.store.locales = [...locales, locale];
  await fs.writeFile(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true }), 'utf8');

  const localeFilePath = path.join(dir, 'locales', `${locale}.yaml`);
  const screenshotFilePath = path.join(dir, 'screenshots', `${locale}.yaml`);

  const localeResult = await writeFileIfAbsent(localeFilePath, localeTemplate, { force });
  const screenshotResult = await writeFileIfAbsent(screenshotFilePath, screenshotTemplate, { force });

  const assetsLocaleDir = path.join(dir, 'assets', locale);
  await fs.ensureDir(path.join(assetsLocaleDir, 'iphone_6_9'));
  await fs.ensureDir(path.join(assetsLocaleDir, 'previews'));

  logger.success(`Added locale "${locale}".`);
  logger.plain(`- Updated: ${relativeFromCwd(configPath)}`);
  logger.plain(`- ${localeResult.status === 'skipped' ? 'Skipped' : 'Created'}: ${relativeFromCwd(localeFilePath)}`);
  logger.plain(`- ${screenshotResult.status === 'skipped' ? 'Skipped' : 'Created'}: ${relativeFromCwd(screenshotFilePath)}`);
  logger.plain('\nNext steps:');
  logger.plain('  Edit the new locale files');
  logger.plain('  ycmeta check');
}

module.exports = addLocale;
