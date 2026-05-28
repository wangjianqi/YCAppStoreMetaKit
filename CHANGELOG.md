# Changelog

All notable changes to YCAppStoreMetaKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-28

### Added

- `ycmeta init` — initialize AppStoreMetadata directory structure in an iOS/macOS project
- `ycmeta check` — validate metadata fields, URLs, locales, and App Store limits
- `ycmeta build` — generate static HTML copy panel and summary.md
- `ycmeta open` — open generated HTML copy panel in the default browser
- `ycmeta preview` — run check, build, and open in sequence
- `ycmeta fastlane` — export fastlane metadata files per locale
- `ycmeta doctor` — diagnose AppStoreMetadata structure and configuration
- `ycmeta skill` — generate Claude Code and Codex project skills
- `ycmeta agents` — generate or update YCAppStoreMetaKit rules block in AGENTS.md
- YAML-based source of truth for App Store metadata
- Multi-locale support (en-US, zh-Hans templates included)
- Screenshot copy management per locale
- Review notes and compliance notes support
- HTML copy panel with per-field copy buttons and character/byte counters
- Dark mode support in generated HTML
- Machine-readable JSON output for `check` and `doctor` commands
- Claude Code Skill with field limits, writing rules, and localization rules
- Codex Skill with OpenAI agent YAML
- AGENTS.md managed block for project-level rules
