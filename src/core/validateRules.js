const path = require('path');
const utf8ByteLength = require('./byteLength');
const { LIMITS, SCREENSHOT_LIMITS, VALID_PLATFORMS, VALID_SCREENSHOT_SETS, REQUIRED_CONFIG_PATHS, REQUIRED_LOCALE_METADATA_FIELDS, DESCRIPTION_MIN_LENGTH, COMPETITOR_TERMS, APPLE_CATEGORIES } = require('./schema');
const { getLocaleUrl } = require('./loadMetadata');
const { validateAssets } = require('./assetValidator');
const { push } = require('../utils/reportHelper');

function get(obj, dotted) {
  return dotted.split('.').reduce((current, key) => current == null ? undefined : current[key], obj);
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function checkCharMax(result, locale, field, value, max) {
  const count = String(value || '').length;
  if (count > max) {
    push(result, 'errors', 'FIELD_TOO_LONG', `${locale} ${field} is ${count}/${max} characters.`, { locale, field, count, limit: max });
  } else {
    push(result, 'passed', 'FIELD_LENGTH_OK', `${locale} ${field} is ${count}/${max} characters.`, { locale, field, count, limit: max });
  }
}

function checkByteMax(result, locale, field, value, max) {
  const count = utf8ByteLength(value);
  if (count > max) {
    push(result, 'errors', 'FIELD_TOO_LONG_BYTES', `${locale} ${field} is ${count}/${max} UTF-8 bytes.`, { locale, field, count, limit: max });
  } else {
    push(result, 'passed', 'FIELD_BYTES_OK', `${locale} ${field} is ${count}/${max} UTF-8 bytes.`, { locale, field, count, limit: max });
  }
}

async function validateMetadata(metadata) {
  const result = { ok: true, errors: [], warnings: [], passed: [] };
  const config = metadata.config || {};
  const configuredLocales = metadata.configuredLocales || [];

  for (const dotted of REQUIRED_CONFIG_PATHS) {
    const value = get(config, dotted);
    if (Array.isArray(value)) {
      if (value.length === 0) push(result, 'errors', 'REQUIRED_CONFIG_EMPTY', `${dotted} must not be empty.`, { field: dotted });
      else push(result, 'passed', 'REQUIRED_CONFIG_OK', `${dotted} is present.`, { field: dotted });
    } else if (isBlank(value)) {
      push(result, 'errors', 'REQUIRED_CONFIG_MISSING', `${dotted} is required.`, { field: dotted });
    } else {
      push(result, 'passed', 'REQUIRED_CONFIG_OK', `${dotted} is present.`, { field: dotted });
    }
  }

  if (!Array.isArray(configuredLocales) || configuredLocales.length === 0) {
    push(result, 'errors', 'LOCALES_EMPTY', 'store.locales must contain at least one locale.');
  }

  for (const filePath of metadata.missingLocaleFiles || []) {
    const locale = path.basename(filePath, '.yaml');
    push(result, 'errors', 'LOCALE_FILE_MISSING', `Missing locale file: AppStoreMetadata/locales/${locale}.yaml`, { locale, filePath });
  }

  for (const filePath of metadata.missingScreenshotFiles || []) {
    const locale = path.basename(filePath, '.yaml');
    push(result, 'warnings', 'SCREENSHOT_FILE_MISSING', `Missing screenshot file: AppStoreMetadata/screenshots/${locale}.yaml`, { locale, filePath });
  }

  for (const locale of configuredLocales) {
    const localeData = metadata.locales[locale];
    if (!localeData) continue;

    if (localeData.locale !== locale) {
      push(result, 'errors', 'LOCALE_MISMATCH', `Locale field in locales/${locale}.yaml must be "${locale}", got "${localeData.locale}".`, { locale, value: localeData.locale });
    } else {
      push(result, 'passed', 'LOCALE_MATCH_OK', `${locale} locale field matches file name.`, { locale });
    }

    const m = localeData.metadata || {};
    for (const field of REQUIRED_LOCALE_METADATA_FIELDS) {
      if (isBlank(m[field])) {
        push(result, 'errors', 'REQUIRED_METADATA_MISSING', `${locale} metadata.${field} is required.`, { locale, field: `metadata.${field}` });
      } else {
        push(result, 'passed', 'REQUIRED_METADATA_OK', `${locale} metadata.${field} is present.`, { locale, field: `metadata.${field}` });
      }
    }

    const nameLength = String(m.name || '').length;
    if (nameLength < LIMITS.name.min || nameLength > LIMITS.name.max) {
      push(result, 'errors', 'APP_NAME_LENGTH_INVALID', `${locale} metadata.name is ${nameLength}; it must be ${LIMITS.name.min}-${LIMITS.name.max} characters.`, { locale, field: 'metadata.name', count: nameLength, min: LIMITS.name.min, limit: LIMITS.name.max });
    } else {
      push(result, 'passed', 'APP_NAME_LENGTH_OK', `${locale} metadata.name is ${nameLength}/${LIMITS.name.max} characters.`, { locale, field: 'metadata.name', count: nameLength, limit: LIMITS.name.max });
    }

    checkCharMax(result, locale, 'metadata.subtitle', m.subtitle, LIMITS.subtitle.max);
    checkCharMax(result, locale, 'metadata.promotional_text', m.promotional_text, LIMITS.promotional_text.max);
    checkCharMax(result, locale, 'metadata.description', m.description, LIMITS.description.max);
    const descLength = String(m.description || '').length;
    if (descLength > 0 && descLength < DESCRIPTION_MIN_LENGTH) {
      push(result, 'warnings', 'DESCRIPTION_TOO_SHORT', `${locale} metadata.description is only ${descLength} characters. Consider writing a longer description.`, { locale, field: 'metadata.description', count: descLength });
    }
    checkByteMax(result, locale, 'metadata.keywords', m.keywords, LIMITS.keywords.max);
    checkCharMax(result, locale, 'metadata.whats_new', m.whats_new, LIMITS.whats_new.max);
    checkByteMax(result, locale, 'review.notes', localeData?.review?.notes || '', LIMITS.review_notes.max);

    const privacyUrl = getLocaleUrl(config, 'privacy', locale);
    const supportUrl = getLocaleUrl(config, 'support', locale);
    const termsUrl = getLocaleUrl(config, 'terms', locale);

    if (!isHttpUrl(privacyUrl)) {
      push(result, 'errors', 'PRIVACY_URL_INVALID', `${locale} privacy URL is required and must start with http:// or https://.`, { locale, field: 'urls.privacy' });
    } else {
      push(result, 'passed', 'PRIVACY_URL_OK', `${locale} privacy URL is valid.`, { locale, field: 'urls.privacy' });
    }

    if (!isHttpUrl(supportUrl)) {
      push(result, 'errors', 'SUPPORT_URL_INVALID', `${locale} support URL is required and must start with http:// or https://.`, { locale, field: 'urls.support' });
    } else {
      push(result, 'passed', 'SUPPORT_URL_OK', `${locale} support URL is valid.`, { locale, field: 'urls.support' });
    }

    if (!isHttpUrl(termsUrl)) {
      push(result, 'warnings', 'TERMS_URL_RECOMMENDED', `${locale} terms URL is recommended and should start with http:// or https://.`, { locale, field: 'urls.terms' });
    } else {
      push(result, 'passed', 'TERMS_URL_OK', `${locale} terms URL is valid.`, { locale, field: 'urls.terms' });
    }

    const keywords = String(m.keywords || '').toLowerCase();
    const appName = String(m.name || config?.app?.app_store_name || '').toLowerCase();
    const companyName = String(config?.company?.name || '').toLowerCase();
    const suspicious = [];
    if (appName && keywords.includes(appName)) suspicious.push('app name');
    if (companyName && keywords.includes(companyName)) suspicious.push('company name');
    for (const term of COMPETITOR_TERMS) {
      if (keywords.includes(term)) suspicious.push(`possible competitor term: ${term}`);
    }
    if (suspicious.length) {
      push(result, 'warnings', 'KEYWORDS_REVIEW_RECOMMENDED', `${locale} metadata.keywords may include ${suspicious.join(', ')}. Review before submission.`, { locale, field: 'metadata.keywords', suspicious });
    }

    const keywordList = String(m.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const seen = new Set();
    const duplicates = [];
    for (const kw of keywordList) {
      if (seen.has(kw)) duplicates.push(kw);
      seen.add(kw);
    }
    if (duplicates.length) {
      push(result, 'warnings', 'KEYWORDS_DUPLICATE', `${locale} metadata.keywords has duplicate entries: ${duplicates.join(', ')}.`, { locale, field: 'metadata.keywords', duplicates });
    }

    const hasLeadingTrailingSpaces = String(m.keywords || '').split(',').some(k => k !== k.trim());
    if (hasLeadingTrailingSpaces) {
      push(result, 'warnings', 'KEYWORDS_WHITESPACE', `${locale} metadata.keywords has entries with leading or trailing spaces.`, { locale, field: 'metadata.keywords' });
    }
  }

  const platform = config?.app?.platform;
  if (platform && !VALID_PLATFORMS.includes(platform)) {
    push(result, 'errors', 'INVALID_PLATFORM', `app.platform "${platform}" is not valid. Expected one of: ${VALID_PLATFORMS.join(', ')}.`, { field: 'app.platform', value: platform });
  }

  const appleId = config?.app?.apple_id;
  if (appleId && !/^\d+$/.test(String(appleId).trim())) {
    push(result, 'warnings', 'APPLE_ID_FORMAT', `app.apple_id "${appleId}" does not look like a numeric Apple ID.`, { field: 'app.apple_id', value: appleId });
  }

  const primaryCategory = config?.store?.primary_category;
  if (primaryCategory && !APPLE_CATEGORIES.includes(primaryCategory)) {
    push(result, 'errors', 'INVALID_PRIMARY_CATEGORY', `store.primary_category "${primaryCategory}" is not a valid App Store category.`, { field: 'store.primary_category', value: primaryCategory });
  }

  const secondaryCategory = config?.store?.secondary_category;
  if (secondaryCategory && !APPLE_CATEGORIES.includes(secondaryCategory)) {
    push(result, 'errors', 'INVALID_SECONDARY_CATEGORY', `store.secondary_category "${secondaryCategory}" is not a valid App Store category.`, { field: 'store.secondary_category', value: secondaryCategory });
  }

  const version = config?.app?.version;
  if (version && !/^\d+\.\d+(\.\d+)?$/.test(String(version).trim())) {
    push(result, 'warnings', 'VERSION_FORMAT', `app.version "${version}" does not follow semver format (e.g. 1.0.0).`, { field: 'app.version', value: version });
  }

  const bundleId = config?.app?.bundle_id;
  if (bundleId && !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(String(bundleId).trim())) {
    push(result, 'warnings', 'BUNDLE_ID_FORMAT', `app.bundle_id "${bundleId}" does not follow reverse-domain format (e.g. com.example.app).`, { field: 'app.bundle_id', value: bundleId });
  }

  const seenLocales = new Set();
  for (const loc of configuredLocales) {
    if (seenLocales.has(loc)) {
      push(result, 'errors', 'DUPLICATE_LOCALE', `store.locales contains duplicate "${loc}".`, { field: 'store.locales', locale: loc });
    }
    seenLocales.add(loc);
  }

  for (const locale of configuredLocales) {
    const screenshotData = metadata.screenshots[locale];
    if (!screenshotData) continue;
    const sets = screenshotData.sets || {};
    for (const [setName, items] of Object.entries(sets)) {
      if (!VALID_SCREENSHOT_SETS.includes(setName)) {
        push(result, 'warnings', 'UNKNOWN_SCREENSHOT_SET', `${locale} screenshots set "${setName}" is not a recognized Apple device type. Expected one of: ${VALID_SCREENSHOT_SETS.join(', ')}.`, { locale, setName });
      }
      if (!Array.isArray(items)) continue;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const titleLen = String(item.title || '').length;
        if (titleLen > SCREENSHOT_LIMITS.title.max) {
          push(result, 'errors', 'SCREENSHOT_TITLE_TOO_LONG', `${locale} screenshots.${setName}[${i}].title is ${titleLen}/${SCREENSHOT_LIMITS.title.max} characters.`, { locale, setName, index: i, field: 'title', count: titleLen, limit: SCREENSHOT_LIMITS.title.max });
        }
        const subtitleLen = String(item.subtitle || '').length;
        if (subtitleLen > SCREENSHOT_LIMITS.subtitle.max) {
          push(result, 'errors', 'SCREENSHOT_SUBTITLE_TOO_LONG', `${locale} screenshots.${setName}[${i}].subtitle is ${subtitleLen}/${SCREENSHOT_LIMITS.subtitle.max} characters.`, { locale, setName, index: i, field: 'subtitle', count: subtitleLen, limit: SCREENSHOT_LIMITS.subtitle.max });
        }
      }
    }
  }

  if (metadata.assets) {
    const assetResult = await validateAssets(metadata.assets, metadata.screenshots);
    result.errors.push(...assetResult.errors);
    result.warnings.push(...assetResult.warnings);
    result.passed.push(...assetResult.passed);
  }

  result.summary = {
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    passedCount: result.passed.length
  };
  result.ok = result.summary.errorCount === 0;
  return result;
}

module.exports = {
  validateMetadata
};
