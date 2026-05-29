const { loadMetadata } = require('../core/loadMetadata');
const { REQUIRED_LOCALE_METADATA_FIELDS } = require('../core/schema');
const logger = require('../utils/logger');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function getLocaleStatus(localeData) {
  const m = localeData.metadata || {};
  const r = localeData.review || {};
  const c = localeData.compliance || {};
  const fields = {
    'metadata.name': m.name,
    'metadata.subtitle': m.subtitle,
    'metadata.promotional_text': m.promotional_text,
    'metadata.description': m.description,
    'metadata.keywords': m.keywords,
    'metadata.whats_new': m.whats_new,
    'review.notes': r.notes,
    'compliance.privacy_summary': c.privacy_summary,
    'compliance.demo_content_notice': c.demo_content_notice
  };

  const filled = [];
  const empty = [];
  for (const [key, value] of Object.entries(fields)) {
    if (isBlank(value)) empty.push(key);
    else filled.push(key);
  }

  const requiredMissing = REQUIRED_LOCALE_METADATA_FIELDS.filter(f => isBlank(m[f]));

  return { filled, empty, requiredMissing };
}

async function listLocales(options = {}) {
  const metadata = await loadMetadata(process.cwd());
  const configuredLocales = metadata.configuredLocales || [];

  if (options.json) {
    const result = configuredLocales.map(locale => {
      const data = metadata.locales[locale] || {};
      const status = getLocaleStatus(data);
      return { locale, ...status };
    });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  logger.plain('YCAppStoreMetaKit Locales');
  logger.plain('');

  for (const locale of configuredLocales) {
    const data = metadata.locales[locale] || {};
    const status = getLocaleStatus(data);
    const hasFile = !metadata.missingLocaleFiles?.some(f => f.endsWith(`${locale}.yaml`));
    const hasScreenshotFile = !metadata.missingScreenshotFiles?.some(f => f.endsWith(`${locale}.yaml`));

    const icon = status.requiredMissing.length === 0 ? '✅' : '⚠️';
    logger.plain(`${icon} ${locale}`);

    if (!hasFile) {
      logger.error(`  ❌ Missing locale file: locales/${locale}.yaml`);
    }
    if (!hasScreenshotFile) {
      logger.warn(`  ⚠️  Missing screenshot file: screenshots/${locale}.yaml`);
    }

    logger.plain(`  Filled: ${status.filled.length} | Empty: ${status.empty.length} | Required missing: ${status.requiredMissing.length}`);

    if (status.requiredMissing.length) {
      for (const f of status.requiredMissing) {
        logger.plain(`  ❌ metadata.${f} is required but empty`);
      }
    }
    logger.plain('');
  }

  logger.plain(`Total: ${configuredLocales.length} locale(s)`);
}

module.exports = listLocales;
