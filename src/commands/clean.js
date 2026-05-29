const fs = require('fs-extra');
const { generatedDir, requireMetadataDir } = require('../core/paths');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');

async function clean() {
  await requireMetadataDir(process.cwd());
  const dir = generatedDir(process.cwd());
  if (!await fs.pathExists(dir)) {
    logger.warn('generated/ directory does not exist. Nothing to clean.');
    return;
  }
  await fs.remove(dir);
  logger.success('Cleaned generated files.');
  logger.plain(`- Removed: ${relativeFromCwd(dir)}`);
}

module.exports = clean;
