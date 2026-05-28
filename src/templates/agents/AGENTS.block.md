<!-- YCAPPSTOREMETA:START -->
# YCAppStoreMetaKit Rules

This project uses YCAppStoreMetaKit for Apple App Store metadata management.

Source files:
- AppStoreMetadata/appstore.config.yaml
- AppStoreMetadata/locales/*.yaml
- AppStoreMetadata/screenshots/*.yaml
- AppStoreMetadata/review/*.md

Generated files:
- AppStoreMetadata/generated/index.html
- AppStoreMetadata/generated/summary.md
- AppStoreMetadata/generated/fastlane/

Rules:
- Edit source files only.
- Do not manually edit AppStoreMetadata/generated files.
- Run `ycmeta check` after changing metadata.
- Run `ycmeta p` when a preview/copy page is needed.
- Run `ycmeta f` when fastlane metadata export is needed.
- Keep App Store copy accurate, conservative, and review-safe.
- Do not invent app features.
- Keep keywords under 100 UTF-8 bytes.
- Keep App Store metadata separate from in-app .xcstrings localization.

Common commands:
- `ycmeta check`
- `ycmeta p`
- `ycmeta f`
<!-- YCAPPSTOREMETA:END -->
