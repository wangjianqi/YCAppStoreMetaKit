const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { requireMetadataDir } = require('../core/paths');
const { writeFileIfAbsent, relativeFromCwd } = require('../utils/fs');
const { localeYaml, screenshotYaml } = require('../core/localeTemplate');
const logger = require('../utils/logger');

const FASTLANE_FIELD_MAP = {
  'name.txt': 'metadata.name',
  'subtitle.txt': 'metadata.subtitle',
  'promotional_text.txt': 'metadata.promotional_text',
  'description.txt': 'metadata.description',
  'keywords.txt': 'metadata.keywords',
  'release_notes.txt': 'metadata.whats_new',
  'review_notes.txt': 'review.notes'
};

function setNestedValue(obj, dotted, value) {
  const parts = dotted.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

async function importFastlane(options = {}) {
  const fromDir = options.from;
  if (!fromDir) {
    const err = new Error('--from <path> is required. Usage: ycmeta import --from ./fastlane/metadata');
    err.exitCode = 1;
    throw err;
  }

  const fromPath = path.resolve(fromDir);
  if (!await fs.pathExists(fromPath)) {
    const err = new Error(`Source directory not found: ${fromPath}`);
    err.exitCode = 1;
    throw err;
  }

  const dir = await requireMetadataDir(process.cwd());
  const configPath = path.join(dir, 'appstore.config.yaml');
  const configText = await fs.readFile(configPath, 'utf8');
  const config = yaml.load(configText) || {};
  const existingLocales = Array.isArray(config.store?.locales) ? config.store.locales : [];

  const localeDirs = await fs.readdir(fromPath);
  const imported = [];

  for (const locale of localeDirs) {
    const localeDir = path.join(fromPath, locale);
    const stat = await fs.stat(localeDir);
    if (!stat.isDirectory()) continue;

    const localeData = { locale };
    let hasData = false;

    for (const [filename, dottedField] of Object.entries(FASTLANE_FIELD_MAP)) {
      const filePath = path.join(localeDir, filename);
      if (await fs.pathExists(filePath)) {
        const content = (await fs.readFile(filePath, 'utf8')).trim();
        if (content) {
          setNestedValue(localeData, dottedField, content);
          hasData = true;
        }
      }
    }

    if (!hasData) continue;

    const localeFilePath = path.join(dir, 'locales', `${locale}.yaml`);
    if (await fs.pathExists(localeFilePath)) {
      const existingData = yaml.load(await fs.readFile(localeFilePath, 'utf8')) || {};
      const merged = { ...existingData };
      for (const [key, value] of Object.entries(localeData)) {
        if (key !== 'locale' && value !== undefined && value !== '') {
          merged[key] = typeof value === 'object' && typeof merged[key] === 'object'
            ? { ...merged[key], ...value }
            : value;
        }
      }
      merged.locale = locale;
      if (!options.dryRun) {
        await fs.writeFile(localeFilePath, yaml.dump(merged, { lineWidth: -1, noRefs: true }), 'utf8');
      }
      logger.plain(`- Updated: ${relativeFromCwd(localeFilePath)}`);
    } else {
      const template = localeYaml(locale);
      const templateData = yaml.load(template) || {};
      const merged = { ...templateData };
      for (const [key, value] of Object.entries(localeData)) {
        if (key !== 'locale' && value !== undefined && value !== '') {
          merged[key] = typeof value === 'object' && typeof merged[key] === 'object'
            ? { ...merged[key], ...value }
            : value;
        }
      }
      merged.locale = locale;
      if (!options.dryRun) {
        await writeFileIfAbsent(localeFilePath, yaml.dump(merged, { lineWidth: -1, noRefs: true }), { force: true });
      }
      logger.plain(`- Created: ${relativeFromCwd(localeFilePath)}`);
    }

    const screenshotFilePath = path.join(dir, 'screenshots', `${locale}.yaml`);
    if (!await fs.pathExists(screenshotFilePath) && !options.dryRun) {
      await writeFileIfAbsent(screenshotFilePath, screenshotYaml(locale), { force: false });
    }

    if (!existingLocales.includes(locale)) {
      existingLocales.push(locale);
    }

    imported.push(locale);
  }

  if (imported.length > 0) {
    config.store = config.store || {};
    config.store.locales = existingLocales;
    if (!config.store.default_locale) config.store.default_locale = existingLocales[0];
    if (!config.store.primary_language) config.store.primary_language = existingLocales[0];
    if (!options.dryRun) {
      await fs.writeFile(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true }), 'utf8');
    }
    logger.plain(`- Updated: ${relativeFromCwd(configPath)}`);
  }

  if (options.dryRun) {
    logger.warn('Dry run — no files were written.');
  }

  logger.success(`Imported ${imported.length} locale(s): ${imported.join(', ')}`);
}

module.exports = importFastlane;
