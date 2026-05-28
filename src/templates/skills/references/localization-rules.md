# Localization Rules

- Treat en-US as the default source locale unless appstore.config.yaml specifies another default_locale.
- Keep translations semantically equivalent to the source locale.
- Do not add new feature claims during translation.
- Do not remove legal or privacy language unless the user explicitly requests it.
- Keywords should be localized for App Store search relevance, not translated word-for-word.
- zh-Hans copy should sound natural, concise, and professional.
- Keep legal links accurate for each locale.
- If a locale is missing required fields, copy the structure from the default locale and translate conservatively.
- App Store metadata and in-app .xcstrings localization are separate systems. Do not modify .xcstrings unless explicitly requested.
- Always run `ycmeta check` after localization.
