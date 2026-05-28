const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const { printReport } = require('./check');
const path = require('path');
const fs = require('fs-extra');
const { generatedDir } = require('../core/paths');
const { generateHtml } = require('../generators/htmlGenerator');
const { generateMarkdown } = require('../generators/markdownGenerator');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');
const openGenerated = require('./open');

async function preview() {
  const metadata = await loadMetadata(process.cwd());
  const report = validateMetadata(metadata);
  printReport(report);
  if (!report.ok) {
    logger.error('Preview stopped because ycmeta check found blocking errors.');
    process.exitCode = 1;
    return;
  }

  const outDir = generatedDir(process.cwd());
  await fs.ensureDir(outDir);
  const htmlPath = path.join(outDir, 'index.html');
  const summaryPath = path.join(outDir, 'summary.md');
  await fs.writeFile(htmlPath, generateHtml(metadata, report), 'utf8');
  await fs.writeFile(summaryPath, generateMarkdown(metadata), 'utf8');
  logger.success('Generated App Store metadata assets.');
  logger.plain(`- ${relativeFromCwd(htmlPath)}`);
  logger.plain(`- ${relativeFromCwd(summaryPath)}`);

  await openGenerated();
}

module.exports = preview;
