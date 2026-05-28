const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { metadataDir, requireMetadataDir } = require('./paths');

async function loadYamlFile(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(text) || {};
    return { data, text };
  } catch (error) {
    const err = new Error(`Failed to read YAML ${filePath}: ${error.message}`);
    err.filePath = filePath;
    throw err;
  }
}

async function loadMetadata(root = process.cwd()) {
  const dir = requireMetadataDir(root);
  const configPath = path.join(dir, 'appstore.config.yaml');
  if (!await fs.pathExists(configPath)) {
    const err = new Error('AppStoreMetadata/appstore.config.yaml not found. Run `ycmeta init` first.');
    err.exitCode = 1;
    throw err;
  }

  const { data: config } = await loadYamlFile(configPath);
  const configuredLocales = Array.isArray(config?.store?.locales) ? config.store.locales : [];
  const locales = {};
  const screenshots = {};
  const missingLocaleFiles = [];
  const missingScreenshotFiles = [];

  for (const locale of configuredLocales) {
    const localePath = path.join(dir, 'locales', `${locale}.yaml`);
    if (await fs.pathExists(localePath)) {
      locales[locale] = (await loadYamlFile(localePath)).data;
    } else {
      missingLocaleFiles.push(localePath);
    }

    const screenshotPath = path.join(dir, 'screenshots', `${locale}.yaml`);
    if (await fs.pathExists(screenshotPath)) {
      screenshots[locale] = (await loadYamlFile(screenshotPath)).data;
    } else {
      missingScreenshotFiles.push(screenshotPath);
    }
  }

  return {
    root,
    dir,
    configPath,
    config,
    locales,
    screenshots,
    configuredLocales,
    missingLocaleFiles,
    missingScreenshotFiles
  };
}

function getLocaleUrl(config, kind, locale) {
  const value = config?.urls?.[kind];
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value[config?.store?.default_locale] || value[config?.store?.primary_language] || '';
}

module.exports = {
  loadMetadata,
  loadYamlFile,
  getLocaleUrl
};
