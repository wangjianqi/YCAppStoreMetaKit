---
name: app-store-metadata
description: Generate, improve, localize, validate, and prepare Apple App Store metadata using AppStoreMetadata and ycmeta. Use for App Store metadata, keywords, descriptions, release notes, review notes, screenshot copy, localization, and App Review compliance.
---

# App Store Metadata Skill

## Purpose

Maintain Apple App Store metadata for this repository using the AppStoreMetadata directory and the ycmeta CLI.

## When to use

Use this skill when working on:
- App Store name, subtitle, promotional text, description, keywords, or release notes
- App Review Notes
- subscription review notes
- Face Data / privacy review responses
- screenshot copy
- App Store metadata localization
- ycmeta check errors
- fastlane metadata export

## Source of truth

Use these files as source files:
- AppStoreMetadata/appstore.config.yaml
- AppStoreMetadata/locales/{locale}.yaml
- AppStoreMetadata/screenshots/{locale}.yaml
- AppStoreMetadata/review/*.md

Do not manually edit:
- AppStoreMetadata/generated/index.html
- AppStoreMetadata/generated/summary.md
- AppStoreMetadata/generated/fastlane/

## Required workflow

1. Read AppStoreMetadata/appstore.config.yaml.
2. Read the relevant locale files under AppStoreMetadata/locales.
3. Modify only AppStoreMetadata source files.
4. Keep App Store copy accurate, conservative, and review-safe.
5. Do not invent app features.
6. Run:

```bash
ycmeta check
```

7. When a preview/copy panel is needed, run:

```bash
ycmeta p
```

8. When fastlane export is needed, run:

```bash
ycmeta f
```

## Field limits

- name: 2 to 30 characters
- subtitle: max 30 characters
- promotional_text: max 170 characters
- description: max 4000 characters
- keywords: max 100 UTF-8 bytes
- whats_new: max 4000 characters
- review.notes: max 4000 UTF-8 bytes

## Writing rules

- Do not exaggerate.
- Do not claim unsupported capabilities.
- Do not mention competitors.
- Avoid absolute claims such as best, guaranteed, perfect, 100% accurate, official, or certified unless explicitly proven.
- For privacy-sensitive apps, prefer wording such as locally, on device, user-selected, designed to, helps, and does not upload.
- Keep legal URLs intact.
- Keep App Store metadata separate from in-app .xcstrings localization.

## Localization rules

- en-US is the default source locale unless appstore.config.yaml says otherwise.
- Preserve meaning during translation.
- Do not add new functionality claims during translation.
- Localize keywords for search relevance, not literal word-for-word translation.
- Always run ycmeta check after changing localized metadata.

## Output rules

When reporting changes:
- Summarize changed files.
- Report remaining ycmeta warnings.
- Mention whether generated/index.html was rebuilt.
- Do not paste full long descriptions unless requested.
