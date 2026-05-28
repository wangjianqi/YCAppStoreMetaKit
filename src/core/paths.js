const path = require('path');

function projectRoot() {
  return process.cwd();
}

function metadataDir(root = projectRoot()) {
  return path.join(root, 'AppStoreMetadata');
}

function generatedDir(root = projectRoot()) {
  return path.join(metadataDir(root), 'generated');
}

function templatesDir() {
  return path.join(__dirname, '..', 'templates');
}

function requireMetadataDir(root = projectRoot()) {
  const fs = require('fs-extra');
  const dir = metadataDir(root);
  if (!fs.existsSync(dir)) {
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
  templatesDir,
  requireMetadataDir
};
