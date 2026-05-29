const path = require('path');
const fs = require('fs-extra');

function projectRoot() {
  return process.cwd();
}

function metadataDir(root = projectRoot()) {
  return path.join(root, 'AppStoreMetadata');
}

function generatedDir(root = projectRoot()) {
  return path.join(metadataDir(root), 'generated');
}

function assetsDir(root = projectRoot()) {
  return path.join(metadataDir(root), 'assets');
}

function screenshotAssetsDir(root, locale, setName) {
  return path.join(assetsDir(root), locale, setName);
}

function previewAssetsDir(root, locale) {
  return path.join(assetsDir(root), locale, 'previews');
}

function templatesDir() {
  return path.join(__dirname, '..', 'templates');
}

async function requireMetadataDir(root = projectRoot()) {
  const dir = metadataDir(root);
  if (!await fs.pathExists(dir)) {
    const err = new Error('AppStoreMetadata not found. Run `ycmeta init` first.');
    err.exitCode = 1;
    throw err;
  }
  return dir;
}

module.exports = {
  projectRoot,
  metadataDir,
  generatedDir,
  assetsDir,
  screenshotAssetsDir,
  previewAssetsDir,
  templatesDir,
  requireMetadataDir
};
