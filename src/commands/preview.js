const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const { printReport } = require('../utils/reportPrinter');
const build = require('./build');
const openGenerated = require('./open');
const logger = require('../utils/logger');

async function preview() {
  const metadata = await loadMetadata(process.cwd());
  const report = await validateMetadata(metadata);
  printReport(report);
  if (!report.ok) {
    logger.error('Preview stopped because ycmeta check found blocking errors.');
    const err = new Error('Validation failed');
    err.exitCode = 1;
    throw err;
  }

  await build({});
  await openGenerated();
}

module.exports = preview;
