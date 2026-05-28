const { generateSkills } = require('../generators/skillGenerator');
const logger = require('../utils/logger');
const { relativeFromCwd } = require('../utils/fs');

async function skill(target = 'all', options = {}) {
  const allowed = ['all', 'claude', 'codex'];
  const normalized = target || 'all';
  if (!allowed.includes(normalized)) {
    const err = new Error(`Unknown skill target "${normalized}". Use: ycmeta skill, ycmeta skill claude, ycmeta skill codex, or ycmeta skill all.`);
    err.exitCode = 1;
    throw err;
  }
  const { results, agentsPath } = await generateSkills({ root: process.cwd(), target: normalized, force: !!options.force });
  logger.success('Generated YCAppStoreMetaKit skill assets.');
  for (const r of results) {
    const label = r.status === 'skipped' ? 'Skipped' : r.status === 'overwritten' ? 'Overwritten' : 'Created';
    logger.plain(`- ${label}: ${relativeFromCwd(r.filePath)}`);
  }
  if (agentsPath) logger.plain(`- Updated: ${relativeFromCwd(agentsPath)}`);
}

module.exports = skill;
