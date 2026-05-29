const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const { printReport } = require('../utils/reportPrinter');

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
  const fullReport = await validateMetadata(metadata);
  const report = filterReport(fullReport, options.locale);
  if (options.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    printReport(report);
  }
  if (!report.ok) {
    const err = new Error('Validation failed');
    err.exitCode = 1;
    throw err;
  }
  return report;
}

module.exports = runCheck;
