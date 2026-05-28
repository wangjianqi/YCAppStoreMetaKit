const path = require('path');
const fs = require('fs-extra');
const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const { generatedDir } = require('../core/paths');
const { generateHtml } = require('../generators/htmlGenerator');
const { generateMarkdown } = require('../generators/markdownGenerator');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');

function filterMetadata(metadata, locale) {
  if (!locale) return metadata;
  return {
    ...metadata,
    configuredLocales: [locale],
    locales: { [locale]: metadata.locales[locale] || {} },
    screenshots: { [locale]: metadata.screenshots[locale] || {} }
  };
}

async function build(options = {}) {
  const metadata = await loadMetadata(process.cwd());
  const filtered = filterMetadata(metadata, options.locale);
  const report = validateMetadata(filtered);
  const outDir = generatedDir(process.cwd());
  await fs.ensureDir(outDir);
  const htmlPath = path.join(outDir, 'index.html');
  const summaryPath = path.join(outDir, 'summary.md');
  await fs.writeFile(htmlPath, generateHtml(filtered, report), 'utf8');
  await fs.writeFile(summaryPath, generateMarkdown(filtered), 'utf8');
  logger.success('Generated App Store metadata assets.');
  logger.plain(`- ${relativeFromCwd(htmlPath)}`);
  logger.plain(`- ${relativeFromCwd(summaryPath)}`);
  if (!report.ok) {
    logger.warn(`Build completed with ${report.summary.errorCount} validation error(s). Run ycmeta check for details.`);
  }
  return { htmlPath, summaryPath, report };
}

module.exports = build;
