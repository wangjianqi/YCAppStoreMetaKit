# YCAppStoreMetaKit

English | [中文](./README.zh-CN.md)

YCAppStoreMetaKit is a local CLI toolkit for managing Apple App Store metadata inside each iOS/macOS project.

It helps you maintain App Store names, subtitles, promotional text, descriptions, keywords, release notes, legal URLs, review notes, screenshot copy, multi-language metadata, fastlane export files, and AI agent skills.

The public CLI command is:

```bash
ycmeta
```

This tool does not log in to App Store Connect, does not upload metadata, and does not submit apps for review. The current version focuses on local management, validation, preview, manual copy, fastlane export, and agent skill generation.

## Installation

From the YCAppStoreMetaKit project directory:

```bash
npm install
npm link
```

Then verify:

```bash
ycmeta --help
```

## Initialize an app project

Run this inside your iOS/macOS project root:

```bash
ycmeta init
```

Short alias:

```bash
ycmeta i
```

Custom locales:

```bash
ycmeta init --locales en-US,ja,ko
```

This creates:

```text
AppStoreMetadata/
├── appstore.config.yaml
├── locales/
│   ├── en-US.yaml
│   └── zh-Hans.yaml
├── screenshots/
│   ├── en-US.yaml
│   └── zh-Hans.yaml
├── generated/
└── README.md
```

## YAML field model

### appstore.config.yaml

Stores project-level App Store information:

- `app.internal_name`
- `app.app_store_name`
- `app.bundle_id`
- `app.sku`
- `app.apple_id`
- `app.version`
- `app.platform`
- `company.name`
- `company.copyright`
- `urls.privacy`
- `urls.terms`
- `urls.support`
- `urls.marketing`
- `store.primary_language`
- `store.default_locale`
- `store.locales`
- `store.primary_category`
- `store.secondary_category`
- `features.*`

### locales/{locale}.yaml

Stores localized App Store metadata:

- `metadata.name`
- `metadata.subtitle`
- `metadata.promotional_text`
- `metadata.description`
- `metadata.keywords`
- `metadata.whats_new`
- `review.notes`
- `compliance.privacy_summary`
- `compliance.demo_content_notice`

### screenshots/{locale}.yaml

Stores localized screenshot copy:

- `sets.iphone_6_9[]`
- `sets.ipad_13[]`

Each item contains:

- `title`
- `subtitle`

## Validation rules

Run:

```bash
ycmeta check
```

Short alias:

```bash
ycmeta c
```

Rules:

| Field | Rule |
|---|---:|
| `metadata.name` | 2 to 30 characters |
| `metadata.subtitle` | max 30 characters |
| `metadata.promotional_text` | max 170 characters |
| `metadata.description` | max 4000 characters |
| `metadata.keywords` | max 100 UTF-8 bytes |
| `metadata.whats_new` | max 4000 characters |
| `review.notes` | max 4000 UTF-8 bytes |
| Privacy URL | required, http/https |
| Support URL | required, http/https |
| Terms URL | recommended, http/https |

Machine-readable output:

```bash
ycmeta check --json
```

Filter by locale:

```bash
ycmeta check --locale en-US
```

## Generate HTML copy panel

```bash
ycmeta build
```

Short alias:

```bash
ycmeta b
```

Generated files:

```text
AppStoreMetadata/generated/index.html
AppStoreMetadata/generated/summary.md
```

The HTML file is fully static and can be opened directly in a browser. It embeds all data in the page and does not request local files.

## Open HTML copy panel

```bash
ycmeta open
```

Short alias:

```bash
ycmeta o
```

## Preview workflow

Recommended daily command:

```bash
ycmeta preview
```

Short alias:

```bash
ycmeta p
```

This runs:

1. `ycmeta check`
2. `ycmeta build`
3. `ycmeta open`

If there are blocking validation errors, preview stops before build/open.

## Copy to App Store Connect

Open:

```text
AppStoreMetadata/generated/index.html
```

Then use the field-level Copy buttons for:

- App Name
- Subtitle
- Promotional Text
- Description
- Keywords
- What's New
- Review Notes
- Legal URLs
- Screenshot Copy

## Export fastlane metadata

```bash
ycmeta fastlane
```

Short alias:

```bash
ycmeta f
```

Generated structure:

```text
AppStoreMetadata/generated/fastlane/metadata/{locale}/
├── name.txt
├── subtitle.txt
├── promotional_text.txt
├── description.txt
├── keywords.txt
├── release_notes.txt
├── support_url.txt
├── marketing_url.txt
└── privacy_url.txt
```

## Add a new locale

1. Add the locale to `AppStoreMetadata/appstore.config.yaml`:

```yaml
store:
  locales:
    - en-US
    - zh-Hans
    - ja
```

2. Create:

```text
AppStoreMetadata/locales/ja.yaml
AppStoreMetadata/screenshots/ja.yaml
```

3. Run:

```bash
ycmeta check
```

## Agent Skills

YCAppStoreMetaKit can generate project-level Skills for Claude Code and Codex.

```bash
ycmeta skill
```

Short alias:

```bash
ycmeta s
```

This generates:

```text
.claude/skills/app-store-metadata/SKILL.md
.agents/skills/app-store-metadata/SKILL.md
.agents/skills/app-store-metadata/agents/openai.yaml
AGENTS.md
```

### Claude Code Skill

Claude Code uses:

```text
.claude/skills/app-store-metadata/SKILL.md
```

Use it when asking Claude Code to generate, improve, translate, or validate App Store metadata.

### Codex Skill

Codex uses:

```text
.agents/skills/app-store-metadata/SKILL.md
```

Codex can also read the generated `AGENTS.md` project rules.

### AGENTS.md

Run:

```bash
ycmeta agents
```

This creates or updates a controlled YCAppStoreMetaKit block in `AGENTS.md` without deleting your existing content.

## Command reference

| Command | Alias | Description |
|---|---|---|
| `ycmeta init` | `ycmeta i` | Initialize AppStoreMetadata |
| `ycmeta check` | `ycmeta c` | Validate metadata |
| `ycmeta build` | `ycmeta b` | Generate HTML and summary.md |
| `ycmeta open` | `ycmeta o` | Open HTML copy panel |
| `ycmeta preview` | `ycmeta p` | Check, build, and open HTML |
| `ycmeta fastlane` | `ycmeta f` | Export fastlane metadata |
| `ycmeta doctor` | `ycmeta d` | Diagnose directory and configuration |
| `ycmeta skill` | `ycmeta s` | Generate Claude Code and Codex Skills |
| `ycmeta skill claude` | | Generate only Claude Code Skill |
| `ycmeta skill codex` | | Generate only Codex Skill |
| `ycmeta skill all` | | Generate all Skills and AGENTS.md |
| `ycmeta agents` | | Generate or update AGENTS.md rules block |
| `ycmeta add-locale <locale>` | | Add a new locale to the project |
| `ycmeta clean` | | Remove generated files |

## Recommended workflow

### First-time setup

```bash
ycmeta init
ycmeta skill
ycmeta p
```

### Daily metadata editing

1. Edit `AppStoreMetadata/locales/*.yaml`
2. Run `ycmeta check`
3. Run `ycmeta p`
4. Copy content from `generated/index.html` to App Store Connect

### AI-assisted editing

1. Run `ycmeta skill`
2. Ask Claude Code or Codex to use the `app-store-metadata` Skill
3. The model should edit only AppStoreMetadata source files
4. The model should run `ycmeta check`
5. Run `ycmeta p` when you need the copy panel

## Local testing

Inside YCAppStoreMetaKit:

```bash
npm install
npm link
mkdir -p /tmp/ycmeta-test
cd /tmp/ycmeta-test
ycmeta init
ycmeta check
ycmeta p
ycmeta skill
ycmeta f
ycmeta doctor
```

## Design decisions

- YAML files are the source of truth.
- Generated files are disposable.
- HTML is for preview and manual copy.
- CLI handles deterministic validation and generation.
- Skills guide AI tools to edit metadata safely.
- App Store metadata and in-app `.xcstrings` localization are separate systems.
- App Store Connect API is intentionally not included in v1.0.
