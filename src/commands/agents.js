const { generateAgents } = require('../generators/agentsGenerator');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');

async function agents() {
  const filePath = await generateAgents(process.cwd());
  logger.success('Generated or updated AGENTS.md YCAppStoreMetaKit rules block.');
  logger.plain(`- ${relativeFromCwd(filePath)}`);
}

module.exports = agents;
