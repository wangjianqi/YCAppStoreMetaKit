const path = require('path');
const { templatesDir } = require('../core/paths');
const { copyFileIfAbsent, writeFileIfAbsent } = require('../utils/fs');
const { generateAgents } = require('./agentsGenerator');

function scriptCheck() {
  return `#!/usr/bin/env bash
set -euo pipefail
ycmeta check
`;
}

function scriptPreview() {
  return `#!/usr/bin/env bash
set -euo pipefail
ycmeta p
`;
}

async function copyReferences(targetBase, force, results) {
  const refBase = path.join(templatesDir(), 'skills', 'references');
  const refs = ['field-limits.md', 'review-notes-patterns.md', 'localization-rules.md'];
  for (const ref of refs) {
    results.push(await copyFileIfAbsent(path.join(refBase, ref), path.join(targetBase, 'references', ref), { force }));
  }
}

async function generateClaudeSkill(root, force) {
  const results = [];
  const base = path.join(root, '.claude', 'skills', 'app-store-metadata');
  results.push(await copyFileIfAbsent(
    path.join(templatesDir(), 'skills', 'claude', 'app-store-metadata', 'SKILL.md'),
    path.join(base, 'SKILL.md'),
    { force }
  ));
  await copyReferences(base, force, results);
  results.push(await writeFileIfAbsent(path.join(base, 'scripts', 'check.sh'), scriptCheck(), { force, mode: 0o755 }));
  results.push(await writeFileIfAbsent(path.join(base, 'scripts', 'preview.sh'), scriptPreview(), { force, mode: 0o755 }));
  return results;
}

async function generateCodexSkill(root, force) {
  const results = [];
  const base = path.join(root, '.agents', 'skills', 'app-store-metadata');
  results.push(await copyFileIfAbsent(
    path.join(templatesDir(), 'skills', 'codex', 'app-store-metadata', 'SKILL.md'),
    path.join(base, 'SKILL.md'),
    { force }
  ));
  results.push(await copyFileIfAbsent(
    path.join(templatesDir(), 'skills', 'codex', 'app-store-metadata', 'agents', 'openai.yaml'),
    path.join(base, 'agents', 'openai.yaml'),
    { force }
  ));
  await copyReferences(base, force, results);
  results.push(await writeFileIfAbsent(path.join(base, 'scripts', 'check.sh'), scriptCheck(), { force, mode: 0o755 }));
  results.push(await writeFileIfAbsent(path.join(base, 'scripts', 'preview.sh'), scriptPreview(), { force, mode: 0o755 }));
  return results;
}

async function generateSkills({ root = process.cwd(), target = 'all', force = false } = {}) {
  const normalized = target || 'all';
  const results = [];
  let agentsPath = null;
  if (normalized === 'all' || normalized === 'claude') {
    results.push(...await generateClaudeSkill(root, force));
  }
  if (normalized === 'all' || normalized === 'codex') {
    results.push(...await generateCodexSkill(root, force));
  }
  if (normalized === 'all') {
    agentsPath = await generateAgents(root);
  }
  return { results, agentsPath };
}

module.exports = {
  generateSkills,
  generateClaudeSkill,
  generateCodexSkill
};
