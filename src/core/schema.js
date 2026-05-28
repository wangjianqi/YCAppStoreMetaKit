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
  'iphone_6_1',
  'ipad_13',
  'ipad_11',
  'ipad_pro_13',
  'ipad_pro_12'
];

const SCREENSHOT_RESOLUTIONS = Object.freeze({
  iphone_6_9: { portrait: [1290, 2796], landscape: [2796, 1290] },
  iphone_6_7: { portrait: [1284, 2778], landscape: [2778, 1284] },
  iphone_6_1: { portrait: [1170, 2532], landscape: [2532, 1170] },
  ipad_13:    { portrait: [2048, 2732], landscape: [2732, 2048] },
  ipad_11:    { portrait: [1668, 2388], landscape: [2388, 1668] },
  ipad_pro_13: { portrait: [2048, 2732], landscape: [2732, 2048] },
  ipad_pro_12: { portrait: [2048, 2732], landscape: [2732, 2048] }
});

const SCREENSHOT_CONSTRAINTS = Object.freeze({
  minCount: 1,
  maxCount: 10,
  maxFileSizeMB: 8,
  acceptedExtensions: ['.png', '.jpg', '.jpeg']
});

const VIDEO_CONSTRAINTS = Object.freeze({
  minDurationSec: 15,
  maxDurationSec: 30,
  maxFileSizeMB: 500,
  maxCountPerSet: 3,
  acceptedExtensions: ['.mov', '.m4v', '.mp4']
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
  SCREENSHOT_LIMITS,
  VALID_PLATFORMS,
  VALID_SCREENSHOT_SETS,
  SCREENSHOT_RESOLUTIONS,
  SCREENSHOT_CONSTRAINTS,
  VIDEO_CONSTRAINTS,
  REQUIRED_CONFIG_PATHS,
  REQUIRED_LOCALE_METADATA_FIELDS
};
