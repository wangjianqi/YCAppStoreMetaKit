const { loadMetadata } = require('../core/loadMetadata');
const { generateFastlane } = require('../generators/fastlaneGenerator');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');

async function fastlane() {
  const metadata = await loadMetadata(process.cwd());
  const files = await generateFastlane(metadata);
  logger.success('Generated fastlane metadata files.');
  files.forEach((file) => logger.plain(`- ${relativeFromCwd(file)}`));
}

module.exports = fastlane;
