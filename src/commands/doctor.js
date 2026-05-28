const path = require('path');
const fs = require('fs-extra');
const { metadataDir } = require('../core/paths');
const { loadMetadata } = require('../core/loadMetadata');
const { validateMetadata } = require('../core/validateRules');
const logger = require('../utils/logger');

async function existsResult(filePath, message) {
  const exists = await fs.pathExists(filePath);
  return { ok: exists, message: `${message}: ${exists ? 'OK' : 'Missing'}`, filePath };
}

async function doctor(options = {}) {
  const root = process.cwd();
  const dir = metadataDir(root);
  const checks = [];
  checks.push(await existsResult(dir, 'AppStoreMetadata directory'));
  checks.push(await existsResult(path.join(dir, 'appstore.config.yaml'), 'appstore.config.yaml'));
  checks.push(await existsResult(path.join(dir, 'locales'), 'locales directory'));
  checks.push(await existsResult(path.join(dir, 'screenshots'), 'screenshots directory'));
  checks.push(await existsResult(path.join(dir, 'assets'), 'assets directory'));
  checks.push(await existsResult(path.join(dir, 'generated'), 'generated directory'));
  checks.push(await existsResult(path.join(root, '.claude', 'skills', 'app-store-metadata', 'SKILL.md'), 'Claude Code skill'));
  checks.push(await existsResult(path.join(root, '.agents', 'skills', 'app-store-metadata', 'SKILL.md'), 'Codex skill'));

  let validation = null;
  if (await fs.pathExists(path.join(dir, 'appstore.config.yaml'))) {
    try {
      const metadata = await loadMetadata(root);
      validation = validateMetadata(metadata);
    } catch (error) {
      checks.push({ ok: false, message: `YAML/load error: ${error.message}` });
    }
  }

  const ok = checks.every((x) => x.ok) && (!validation || validation.ok);
  const result = { ok, checks, validation };

  if (options.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    logger.plain('YCAppStoreMetaKit Doctor');
    checks.forEach((check) => {
      if (check.ok) logger.success(`- ${check.message}`);
      else logger.error(`- ${check.message}`);
    });
    if (validation) {
      logger.plain('');
      logger.plain(`Validation errors: ${validation.summary.errorCount}`);
      logger.plain(`Validation warnings: ${validation.summary.warningCount}`);
    }
  }

  if (!ok) process.exitCode = 1;
}

module.exports = doctor;
