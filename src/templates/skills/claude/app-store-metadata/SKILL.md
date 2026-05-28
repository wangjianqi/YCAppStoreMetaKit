---
name: app-store-metadata
description: Generate, improve, localize, validate, and prepare Apple App Store metadata using the AppStoreMetadata directory and ycmeta CLI. Use this when working on App Store name, subtitle, promotional text, description, keywords, release notes, review notes, legal links, screenshots copy, localization, or App Review compliance notes.
---

# App Store Metadata Skill

## Purpose

You help maintain Apple App Store metadata for this project using the AppStoreMetadata directory and the ycmeta CLI.

## When to use

Use this skill when the user asks to:
- generate App Store metadata
- improve App Store description
- write subtitles or promotional text
- generate or optimize keywords
- add a new locale
- translate App Store metadata
- write App Review Notes
- write subscription review notes
- write Face Data or privacy review responses
- prepare screenshot copy
- fix ycmeta check errors
- prepare metadata for App Store Connect

## Source of truth

Use these files as the source of truth:
- AppStoreMetadata/appstore.config.yaml
- AppStoreMetadata/locales/{locale}.yaml
- AppStoreMetadata/screenshots/{locale}.yaml
- AppStoreMetadata/review/*.md

Do not treat AppStoreMetadata/generated as source of truth.

## Required workflow

1. Inspect AppStoreMetadata/appstore.config.yaml.
2. Inspect the relevant locale files under AppStoreMetadata/locales.
3. Modify only source files under AppStoreMetadata, not generated files.
4. Keep all App Store copy accurate and conservative.
5. Do not invent features that are not present in the project or user request.
6. After modifying metadata, run:

```bash
ycmeta check
```

7. If the user asks for preview or copy panel, run:

```bash
ycmeta p
```

8. If the user asks for fastlane export, run:

```bash
ycmeta f
```

## Field limits

Follow these limits:
- name: 2 to 30 characters
- subtitle: max 30 characters
- promotional_text: max 170 characters
- description: max 4000 characters
- keywords: max 100 UTF-8 bytes
- whats_new: max 4000 characters
- review.notes: max 4000 UTF-8 bytes

## Writing rules

- Do not exaggerate.
- Do not claim capabilities that the app does not have.
- Do not mention competitors.
- Do not use absolute marketing claims such as best, guaranteed, perfect, 100% accurate, official, or certified unless explicitly proven.
- For privacy-sensitive apps, prefer language like "designed to", "helps", "locally", "on device", "user-selected", and "does not upload".
- For photo, camera, face, location, or subscription features, use conservative App Review-safe wording.
- Keep legal URLs intact.
- Keep metadata and in-app localization separate. Do not modify .xcstrings unless the user explicitly asks.

## Localization rules

- en-US is the default source locale unless appstore.config.yaml says otherwise.
- Translations must preserve meaning.
- Do not add new features during translation.
- Localized copy should sound natural in the target language.
- Keywords should be localized, not directly translated word-for-word when that would reduce App Store search relevance.
- Always run ycmeta check after localization.

## Output rules

When reporting changes to the user:
- Summarize changed files.
- List any remaining ycmeta check warnings.
- Mention whether generated/index.html was rebuilt.
- Do not paste full long descriptions unless the user asks.
