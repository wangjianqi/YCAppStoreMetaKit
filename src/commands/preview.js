const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const { printReport } = require('./check');
const build = require('./build');
const openGenerated = require('./open');
const logger = require('../utils/logger');

async function preview() {
  const metadata = await loadMetadata(process.cwd());
  const report = validateMetadata(metadata);
  printReport(report);
  if (!report.ok) {
    logger.error('Preview stopped because ycmeta check found blocking errors.');
    process.exitCode = 1;
    return;
  }
  await build();
  await openGenerated();
}

module.exports = preview;
