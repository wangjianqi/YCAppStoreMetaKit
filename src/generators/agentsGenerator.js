const path = require('path');
const fs = require('fs-extra');
const { templatesDir } = require('../core/paths');

const START = '<!-- YCAPPSTOREMETA:START -->';
const END = '<!-- YCAPPSTOREMETA:END -->';

async function generateAgents(root = process.cwd()) {
  const blockPath = path.join(templatesDir(), 'agents', 'AGENTS.block.md');
  const block = await fs.readFile(blockPath, 'utf8');
  const agentsPath = path.join(root, 'AGENTS.md');
  let current = '';
  if (await fs.pathExists(agentsPath)) {
    current = await fs.readFile(agentsPath, 'utf8');
  }

  let next;
  const startIndex = current.indexOf(START);
  const endIndex = current.indexOf(END);
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    next = current.slice(0, startIndex).trimEnd() + '\n\n' + block.trim() + '\n\n' + current.slice(endIndex + END.length).trimStart();
  } else if (current.trim()) {
    next = current.trimEnd() + '\n\n' + block.trim() + '\n';
  } else {
    next = block.trim() + '\n';
  }
  await fs.writeFile(agentsPath, next, 'utf8');
  return agentsPath;
}

module.exports = {
  generateAgents
};
