const fs = require('fs-extra');
const path = require('path');
const { SCREENSHOT_CONSTRAINTS, VIDEO_CONSTRAINTS, VALID_SCREENSHOT_SETS } = require('./schema');

const IMAGE_EXTS = new Set(SCREENSHOT_CONSTRAINTS.acceptedExtensions);
const VIDEO_EXTS = new Set(VIDEO_CONSTRAINTS.acceptedExtensions);

async function scanAssets(metadataDir, configuredLocales) {
  const assetsRoot = path.join(metadataDir, 'assets');
  const screenshots = {};
  const videos = {};

  if (!await fs.pathExists(assetsRoot)) {
    return { screenshots, videos };
  }

  for (const locale of configuredLocales) {
    const localeDir = path.join(assetsRoot, locale);
    if (!await fs.pathExists(localeDir)) continue;

    const entries = await fs.readdir(localeDir, { withFileTypes: true });
    screenshots[locale] = {};
    videos[locale] = {};

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const setName = entry.name;

      if (setName === 'previews') {
        const previewDir = path.join(localeDir, 'previews');
        const files = await scanDirectory(previewDir);
        const videoFiles = files.filter(f => VIDEO_EXTS.has(path.extname(f).toLowerCase()));
        if (videoFiles.length) {
          const grouped = groupVideosBySet(videoFiles);
          Object.assign(videos[locale], grouped);
        }
        continue;
      }

      if (VALID_SCREENSHOT_SETS.includes(setName)) {
        const setDir = path.join(localeDir, setName);
        const files = await scanDirectory(setDir);
        const imageFiles = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
        if (imageFiles.length) {
          screenshots[locale][setName] = imageFiles.sort();
        }
      }
    }
  }

  return { screenshots, videos };
}

async function scanDirectory(dir) {
  if (!await fs.pathExists(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}

function groupVideosBySet(videoFiles) {
  const groups = {};
  for (const filePath of videoFiles) {
    const basename = path.basename(filePath);
    const match = basename.match(/^(.+?)_(\d+)\./);
    if (match) {
      const setName = match[1];
      if (!groups[setName]) groups[setName] = [];
      groups[setName].push(filePath);
    } else {
      if (!groups._unmatched) groups._unmatched = [];
      groups._unmatched.push(filePath);
    }
  }
  return groups;
}

module.exports = { scanAssets, scanDirectory, groupVideosBySet };
