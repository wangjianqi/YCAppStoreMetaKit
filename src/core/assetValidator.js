const path = require('path');
const fs = require('fs-extra');
const imageSize = require('image-size');
const { execFile } = require('child_process');
const {
  SCREENSHOT_RESOLUTIONS,
  SCREENSHOT_CONSTRAINTS,
  VIDEO_CONSTRAINTS,
  VALID_SCREENSHOT_SETS
} = require('./schema');
const { push } = require('../utils/reportHelper');

async function validateAssets(assets, screenshotCopy) {
  const result = { errors: [], warnings: [], passed: [] };
  const screenshotAssets = assets.screenshots || {};
  const videoAssets = assets.videos || {};

  for (const locale of Object.keys(screenshotAssets)) {
    for (const setName of Object.keys(screenshotAssets[locale])) {
      await validateScreenshotSet(result, locale, setName, screenshotAssets[locale][setName], screenshotCopy[locale]);
    }
  }

  for (const locale of Object.keys(videoAssets)) {
    for (const setName of Object.keys(videoAssets[locale])) {
      await validateVideoSet(result, locale, setName, videoAssets[locale][setName]);
    }
  }

  for (const locale of Object.keys(screenshotCopy || {})) {
    const copySets = screenshotCopy[locale]?.sets || {};
    for (const setName of Object.keys(copySets)) {
      if (!screenshotAssets[locale]?.[setName] && !videoAssets[locale]?.[setName]) {
        push(result, 'warnings', 'NO_ASSETS_FOR_SET', `${locale} screenshots.${setName} has copy but no image/video files in assets/${locale}/${setName}/.`, { locale, setName });
      }
    }
  }

  return result;
}

async function validateScreenshotSet(result, locale, setName, files, localeCopy) {
  if (!VALID_SCREENSHOT_SETS.includes(setName)) {
    push(result, 'warnings', 'UNKNOWN_SCREENSHOT_SET_DIR', `${locale} assets/${locale}/${setName}/ is not a recognized device type.`, { locale, setName });
    return;
  }

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    if (!SCREENSHOT_CONSTRAINTS.acceptedExtensions.includes(ext)) {
      push(result, 'errors', 'SCREENSHOT_INVALID_FORMAT', `${locale} ${setName}/${path.basename(filePath)}: unsupported format "${ext}". Expected: ${SCREENSHOT_CONSTRAINTS.acceptedExtensions.join(', ')}.`, { locale, setName, filePath });
      continue;
    }
    push(result, 'passed', 'SCREENSHOT_FORMAT_OK', `${locale} ${setName}/${path.basename(filePath)}: format is valid.`, { locale, setName, filePath });
  }

  if (files.length > SCREENSHOT_CONSTRAINTS.maxCount) {
    push(result, 'errors', 'SCREENSHOT_TOO_MANY', `${locale} ${setName} has ${files.length} screenshots; maximum is ${SCREENSHOT_CONSTRAINTS.maxCount}.`, { locale, setName, count: files.length, limit: SCREENSHOT_CONSTRAINTS.maxCount });
  }

  const copyItems = localeCopy?.sets?.[setName] || [];
  if (files.length > 0 && copyItems.length > 0 && files.length !== copyItems.length) {
    push(result, 'warnings', 'SCREENSHOT_COPY_MISMATCH', `${locale} ${setName} has ${files.length} image(s) but ${copyItems.length} copy entry/entries in screenshots YAML.`, { locale, setName, imageCount: files.length, copyCount: copyItems.length });
  }

  for (const filePath of files) {
    await validateScreenshotFile(result, locale, setName, filePath);
  }
}

async function validateScreenshotFile(result, locale, setName, filePath) {
  const basename = path.basename(filePath);

  try {
    const stat = await fs.stat(filePath);
    const sizeMB = stat.size / (1024 * 1024);
    if (sizeMB > SCREENSHOT_CONSTRAINTS.maxFileSizeMB) {
      push(result, 'warnings', 'SCREENSHOT_FILE_TOO_LARGE', `${locale} ${setName}/${basename}: ${sizeMB.toFixed(1)}MB exceeds recommended ${SCREENSHOT_CONSTRAINTS.maxFileSizeMB}MB.`, { locale, setName, filePath, sizeMB });
    } else {
      push(result, 'passed', 'SCREENSHOT_FILE_SIZE_OK', `${locale} ${setName}/${basename}: file size is OK (${sizeMB.toFixed(1)}MB).`, { locale, setName, filePath });
    }
  } catch {
    push(result, 'warnings', 'SCREENSHOT_FILE_STAT_FAILED', `${locale} ${setName}/${basename}: could not read file size.`, { locale, setName, filePath });
    return;
  }

  const resolutions = SCREENSHOT_RESOLUTIONS[setName];
  if (!resolutions) return;

  try {
    const dimensions = imageSize(filePath);
    const { width, height } = dimensions;
    const [pW, pH] = resolutions.portrait;
    const [lW, lH] = resolutions.landscape;
    const isPortrait = (width === pW && height === pH);
    const isLandscape = (width === lW && height === lH);

    if (!isPortrait && !isLandscape) {
      push(result, 'errors', 'SCREENSHOT_RESOLUTION_MISMATCH', `${locale} ${setName}/${basename}: resolution ${width}×${height} does not match expected ${pW}×${pH} (portrait) or ${lW}×${lH} (landscape).`, { locale, setName, filePath, width, height, expectedPortrait: `${pW}×${pH}`, expectedLandscape: `${lW}×${lH}` });
    } else {
      const orientation = isPortrait ? 'portrait' : 'landscape';
      push(result, 'passed', 'SCREENSHOT_RESOLUTION_OK', `${locale} ${setName}/${basename}: ${orientation} ${width}×${height} is valid.`, { locale, setName, filePath, width, height, orientation });
    }
  } catch {
    push(result, 'warnings', 'SCREENSHOT_DIMENSION_READ_FAILED', `${locale} ${setName}/${basename}: could not read image dimensions.`, { locale, setName, filePath });
  }
}

async function validateVideoSet(result, locale, setName, files) {
  if (files.length > VIDEO_CONSTRAINTS.maxCountPerSet) {
    push(result, 'errors', 'VIDEO_TOO_MANY', `${locale} previews/${setName}: ${files.length} videos; maximum is ${VIDEO_CONSTRAINTS.maxCountPerSet}.`, { locale, setName, count: files.length, limit: VIDEO_CONSTRAINTS.maxCountPerSet });
  }

  for (const filePath of files) {
    await validateVideoFile(result, locale, setName, filePath);
  }
}

async function validateVideoFile(result, locale, setName, filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (!VIDEO_CONSTRAINTS.acceptedExtensions.includes(ext)) {
    push(result, 'errors', 'VIDEO_INVALID_FORMAT', `${locale} previews/${basename}: unsupported format "${ext}". Expected: ${VIDEO_CONSTRAINTS.acceptedExtensions.join(', ')}.`, { locale, setName, filePath });
    return;
  }
  push(result, 'passed', 'VIDEO_FORMAT_OK', `${locale} previews/${basename}: format is valid.`, { locale, setName, filePath });

  try {
    const stat = await fs.stat(filePath);
    const sizeMB = stat.size / (1024 * 1024);
    if (sizeMB > VIDEO_CONSTRAINTS.maxFileSizeMB) {
      push(result, 'errors', 'VIDEO_FILE_TOO_LARGE', `${locale} previews/${basename}: ${sizeMB.toFixed(1)}MB exceeds ${VIDEO_CONSTRAINTS.maxFileSizeMB}MB.`, { locale, setName, filePath, sizeMB });
    } else {
      push(result, 'passed', 'VIDEO_FILE_SIZE_OK', `${locale} previews/${basename}: file size is OK (${sizeMB.toFixed(1)}MB).`, { locale, setName, filePath });
    }
  } catch {
    push(result, 'warnings', 'VIDEO_FILE_STAT_FAILED', `${locale} previews/${basename}: could not read file size.`, { locale, setName, filePath });
  }

  try {
    const output = await new Promise((resolve, reject) => {
      execFile('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        filePath
      ], { timeout: 10000 }, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout);
      });
    });
    const info = JSON.parse(output);
    const duration = parseFloat(info?.format?.duration || 0);
    if (duration < VIDEO_CONSTRAINTS.minDurationSec) {
      push(result, 'errors', 'VIDEO_TOO_SHORT', `${locale} previews/${basename}: ${duration.toFixed(1)}s is shorter than ${VIDEO_CONSTRAINTS.minDurationSec}s.`, { locale, setName, filePath, duration });
    } else if (duration > VIDEO_CONSTRAINTS.maxDurationSec) {
      push(result, 'errors', 'VIDEO_TOO_LONG', `${locale} previews/${basename}: ${duration.toFixed(1)}s exceeds ${VIDEO_CONSTRAINTS.maxDurationSec}s.`, { locale, setName, filePath, duration });
    } else {
      push(result, 'passed', 'VIDEO_DURATION_OK', `${locale} previews/${basename}: duration ${duration.toFixed(1)}s is valid.`, { locale, setName, filePath, duration });
    }
  } catch {
    push(result, 'warnings', 'VIDEO_DURATION_UNKNOWN', `${locale} previews/${basename}: ffprobe not available; could not verify duration (must be ${VIDEO_CONSTRAINTS.minDurationSec}–${VIDEO_CONSTRAINTS.maxDurationSec}s).`, { locale, setName, filePath });
  }
}

module.exports = { validateAssets };
