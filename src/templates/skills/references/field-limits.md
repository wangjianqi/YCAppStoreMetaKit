# App Store Metadata Field Limits

Use these limits when editing AppStoreMetadata source files.

| Field | Limit |
|---|---:|
| metadata.name | 2 to 30 characters |
| metadata.subtitle | max 30 characters |
| metadata.promotional_text | max 170 characters |
| metadata.description | max 4000 characters |
| metadata.keywords | max 100 UTF-8 bytes |
| metadata.whats_new | max 4000 characters |
| review.notes | max 4000 UTF-8 bytes |
| privacy_url | required, http:// or https:// |
| support_url | required, http:// or https:// |
| terms_url | recommended, http:// or https:// |

Run `ycmeta check` after editing.
