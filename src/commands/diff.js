const { loadMetadata } = require('../core/loadMetadata');
const logger = require('../utils/logger');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function diffFields(a, b) {
  const fields = [
    'metadata.name',
    'metadata.subtitle',
    'metadata.promotional_text',
    'metadata.description',
    'metadata.keywords',
    'metadata.whats_new',
    'review.notes',
    'compliance.privacy_summary',
    'compliance.demo_content_notice'
  ];
  const results = [];

  for (const dotted of fields) {
    const parts = dotted.split('.');
    const getVal = (obj) => {
      let current = obj;
      for (const p of parts) {
        current = current?.[p];
      }
      return current;
    };
    const va = getVal(a);
    const vb = getVal(b);
    const aBlank = isBlank(va);
    const bBlank = isBlank(vb);

    if (aBlank && bBlank) {
      results.push({ field: dotted, status: 'both_empty' });
    } else if (aBlank) {
      results.push({ field: dotted, status: 'only_in_right' });
    } else if (bBlank) {
      results.push({ field: dotted, status: 'only_in_left' });
    } else if (String(va) !== String(vb)) {
      results.push({ field: dotted, status: 'different', left: String(va), right: String(vb) });
    } else {
      results.push({ field: dotted, status: 'same' });
    }
  }

  return results;
}

async function diff(localeA, localeB, options = {}) {
  if (!localeA || !localeB) {
    const err = new Error('Two locale codes are required. Usage: ycmeta diff <localeA> <localeB>');
    err.exitCode = 1;
    throw err;
  }

  const metadata = await loadMetadata(process.cwd());
  const dataA = metadata.locales[localeA];
  const dataB = metadata.locales[localeB];

  if (!dataA) {
    const err = new Error(`Locale "${localeA}" not found. Available: ${metadata.configuredLocales.join(', ')}`);
    err.exitCode = 1;
    throw err;
  }
  if (!dataB) {
    const err = new Error(`Locale "${localeB}" not found. Available: ${metadata.configuredLocales.join(', ')}`);
    err.exitCode = 1;
    throw err;
  }

  const results = diffFields(dataA, dataB);

  if (options.json) {
    process.stdout.write(JSON.stringify({ localeA, localeB, diff: results }, null, 2) + '\n');
    return;
  }

  logger.plain(`Diff: ${localeA} ↔ ${localeB}`);
  logger.plain('');

  const same = results.filter(r => r.status === 'same');
  const different = results.filter(r => r.status === 'different');
  const onlyInLeft = results.filter(r => r.status === 'only_in_left');
  const onlyInRight = results.filter(r => r.status === 'only_in_right');
  const bothEmpty = results.filter(r => r.status === 'both_empty');

  if (different.length) {
    logger.error('Different');
    for (const r of different) {
      logger.plain(`- ${r.field}`);
      logger.plain(`  [${localeA}]: ${String(r.left).substring(0, 80)}${String(r.left).length > 80 ? '...' : ''}`);
      logger.plain(`  [${localeB}]: ${String(r.right).substring(0, 80)}${String(r.right).length > 80 ? '...' : ''}`);
    }
    logger.plain('');
  }

  if (onlyInLeft.length) {
    logger.warn(`Only in ${localeA} (missing in ${localeB})`);
    for (const r of onlyInLeft) logger.plain(`- ${r.field}`);
    logger.plain('');
  }

  if (onlyInRight.length) {
    logger.warn(`Only in ${localeB} (missing in ${localeA})`);
    for (const r of onlyInRight) logger.plain(`- ${r.field}`);
    logger.plain('');
  }

  if (bothEmpty.length) {
    logger.dim('Both empty');
    for (const r of bothEmpty) logger.plain(`- ${r.field}`);
    logger.plain('');
  }

  if (same.length) {
    logger.success('Identical');
    for (const r of same) logger.plain(`- ${r.field}`);
  }

  logger.plain('');
  logger.plain(`Summary: ${different.length} different, ${onlyInLeft.length + onlyInRight.length} missing, ${same.length} identical, ${bothEmpty.length} both empty`);
}

module.exports = diff;
