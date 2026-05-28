const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const logger = require('../utils/logger');

function printReport(report) {
  logger.plain('YCAppStoreMetaKit Check');
  logger.plain('');
  logger.plain(`Errors: ${report.summary.errorCount}`);
  logger.plain(`Warnings: ${report.summary.warningCount}`);
  logger.plain(`Passed: ${report.summary.passedCount}`);
  logger.plain('');

  if (report.errors.length) {
    logger.error('Errors');
    report.errors.forEach((item) => logger.plain(`- ${item.message}`));
    logger.plain('');
  }
  if (report.warnings.length) {
    logger.warn('Warnings');
    report.warnings.forEach((item) => logger.plain(`- ${item.message}`));
    logger.plain('');
  }
  if (!report.errors.length) {
    logger.success('Check completed. No blocking errors.');
  }
}

async function runCheck(options = {}) {
  const metadata = await loadMetadata(process.cwd());
  const report = validateMetadata(metadata);
  if (options.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    printReport(report);
  }
  if (!report.ok) {
    process.exitCode = 1;
  }
  return report;
}

module.exports = runCheck;
module.exports.printReport = printReport;
