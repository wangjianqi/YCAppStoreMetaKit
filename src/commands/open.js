const path = require('path');
const fs = require('fs-extra');
const { generatedDir, requireMetadataDir } = require('../core/paths');
const logger = require('../utils/logger');
const { pathToFileURL } = require('url');
const open = require('open');

async function openGenerated() {
  requireMetadataDir(process.cwd());
  const htmlPath = path.join(generatedDir(process.cwd()), 'index.html');
  if (!await fs.pathExists(htmlPath)) {
    const err = new Error('generated/index.html not found. Run `ycmeta build` or `ycmeta p` first.');
    err.exitCode = 1;
    throw err;
  }
  await open(pathToFileURL(htmlPath).href);
  logger.success('Opened AppStoreMetadata/generated/index.html');
}

module.exports = openGenerated;
