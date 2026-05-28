const LIMITS = Object.freeze({
  name: { min: 2, max: 30, unit: 'characters' },
  subtitle: { max: 30, unit: 'characters' },
  promotional_text: { max: 170, unit: 'characters' },
  description: { max: 4000, unit: 'characters' },
  keywords: { max: 100, unit: 'utf8-bytes' },
  whats_new: { max: 4000, unit: 'characters' },
  review_notes: { max: 4000, unit: 'utf8-bytes' }
});

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
  REQUIRED_CONFIG_PATHS,
  REQUIRED_LOCALE_METADATA_FIELDS
};
