const logger = require('./logger');

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

module.exports = { printReport };
