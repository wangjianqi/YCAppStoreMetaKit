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

function filterReport(report, locale) {
  if (!locale) return report;
  const filterByLocale = (items) => items.filter(item => !item.locale || item.locale === locale);
  const errors = filterByLocale(report.errors);
  const warnings = filterByLocale(report.warnings);
  const passed = filterByLocale(report.passed);
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    passed,
    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
      passedCount: passed.length
    }
  };
}

async function runCheck(options = {}) {
  const metadata = await loadMetadata(process.cwd());
  const fullReport = validateMetadata(metadata);
  const report = filterReport(fullReport, options.locale);
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
