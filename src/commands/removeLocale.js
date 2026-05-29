const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { requireMetadataDir } = require('../core/paths');
const { relativeFromCwd } = require('../utils/fs');
const logger = require('../utils/logger');
const { APPLE_LOCALES } = require('../core/schema');

async function removeLocale(locale, options = {}) {
  if (!locale) {
    const err = new Error('Locale code is required. Usage: ycmeta remove-locale <locale>');
    err.exitCode = 1;
    throw err;
  }

  if (!APPLE_LOCALES.includes(locale)) {
    const err = new Error(`"${locale}" is not a recognized Apple locale code.`);
    err.exitCode = 1;
    throw err;
  }

  const dir = await requireMetadataDir(process.cwd());
  const configPath = path.join(dir, 'appstore.config.yaml');
  const configText = await fs.readFile(configPath, 'utf8');
  const config = yaml.load(configText) || {};

  const locales = Array.isArray(config.store?.locales) ? config.store.locales : [];
  if (!locales.includes(locale)) {
    logger.warn(`Locale "${locale}" is not in store.locales.`);
    return;
  }

  if (locales.length <= 1) {
    const err = new Error('Cannot remove the last locale. At least one locale is required.');
    err.exitCode = 1;
    throw err;
  }

  if (!options.force) {
    logger.warn(`About to remove locale "${locale}". This will delete the corresponding YAML files and update appstore.config.yaml.`);
    logger.warn('Use --force to confirm.');
    return;
  }

  config.store.locales = locales.filter(l => l !== locale);
  if (config.store.default_locale === locale) {
    config.store.default_locale = config.store.locales[0];
  }
  if (config.store.primary_language === locale) {
    config.store.primary_language = config.store.locales[0];
  }
  await fs.writeFile(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true }), 'utf8');

  const localeFilePath = path.join(dir, 'locales', `${locale}.yaml`);
  if (await fs.pathExists(localeFilePath)) {
    await fs.remove(localeFilePath);
    logger.plain(`- Removed: ${relativeFromCwd(localeFilePath)}`);
  }

  const screenshotFilePath = path.join(dir, 'screenshots', `${locale}.yaml`);
  if (await fs.pathExists(screenshotFilePath)) {
    await fs.remove(screenshotFilePath);
    logger.plain(`- Removed: ${relativeFromCwd(screenshotFilePath)}`);
  }

  const assetsLocaleDir = path.join(dir, 'assets', locale);
  if (await fs.pathExists(assetsLocaleDir)) {
    await fs.remove(assetsLocaleDir);
    logger.plain(`- Removed: ${relativeFromCwd(assetsLocaleDir)}`);
  }

  logger.plain(`- Updated: ${relativeFromCwd(configPath)}`);
  logger.success(`Removed locale "${locale}".`);
}

module.exports = removeLocale;
