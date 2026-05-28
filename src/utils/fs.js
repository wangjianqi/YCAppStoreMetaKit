const fs = require('fs-extra');
const path = require('path');

async function writeFileIfAbsent(filePath, content, options = {}) {
  const { force = false, mode } = options;
  await fs.ensureDir(path.dirname(filePath));
  const exists = await fs.pathExists(filePath);
  if (exists && !force) {
    return { filePath, status: 'skipped' };
  }
  await fs.writeFile(filePath, content, 'utf8');
  if (mode) await fs.chmod(filePath, mode);
  return { filePath, status: exists ? 'overwritten' : 'created' };
}

async function copyFileIfAbsent(from, to, options = {}) {
  const content = await fs.readFile(from, 'utf8');
  return writeFileIfAbsent(to, content, options);
}

async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function writeText(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

function relativeFromCwd(filePath) {
  return path.relative(process.cwd(), filePath) || '.';
}

module.exports = {
  writeFileIfAbsent,
  copyFileIfAbsent,
  readText,
  writeText,
  relativeFromCwd
};
