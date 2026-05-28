const LIMITS = Object.freeze({
  name: { min: 2, max: 30, unit: 'characters' },
  subtitle: { max: 30, unit: 'characters' },
  promotional_text: { max: 170, unit: 'characters' },
  description: { max: 4000, unit: 'characters' },
  keywords: { max: 100, unit: 'utf8-bytes' },
  whats_new: { max: 4000, unit: 'characters' },
  review_notes: { max: 4000, unit: 'utf8-bytes' }
});

const SCREENSHOT_LIMITS = Object.freeze({
  title: { max: 30, unit: 'characters' },
  subtitle: { max: 45, unit: 'characters' }
});

const VALID_PLATFORMS = ['ios', 'macos', 'tvos', 'visionos'];

const VALID_SCREENSHOT_SETS = [
  'iphone_6_9',
  'iphone_6_7',
  'ipad_13',
  'ipad_11',
  'ipad_pro_13',
  'ipad_pro_12'
];

const REQUIRED_CONFIG_PATHS = [
  'app.internal_name',
  'app.app_store_name',
  'app.bundle_id',
  'app.sku',
  'app.version',
  'app.platform',
  'company.name',
  'company.copyright',
  'store.primary_language',
  'store.default_locale',
  'store.locales'
];

const REQUIRED_LOCALE_METADATA_FIELDS = [
  'name',
  'subtitle',
  'promotional_text',
  'description',
  'keywords',
  'whats_new'
];

module.exports = {
  LIMITS,
  SCREENSHOT_LIMITS,
  VALID_PLATFORMS,
  VALID_SCREENSHOT_SETS,
  REQUIRED_CONFIG_PATHS,
  REQUIRED_LOCALE_METADATA_FIELDS
};
