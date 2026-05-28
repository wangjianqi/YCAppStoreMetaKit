# YCAppStoreMetaKit

[English](./README.md) | 中文

YCAppStoreMetaKit 是一个本地 CLI 工具集，用于在每个 iOS/macOS 项目内管理 Apple App Store 元数据。

它帮助你维护 App Store 名称、副标题、促销文本、描述、关键词、更新日志、法律链接、审核备注、截图文案、多语言元数据、fastlane 导出文件以及 AI 代理技能。

CLI 命令为：

```bash
ycmeta
```

本工具不登录 App Store Connect、不上传元数据、不提交审核。当前版本专注于本地管理、校验、预览、手动复制、fastlane 导出和代理技能生成。

## 安装

在 YCAppStoreMetaKit 项目目录下：

```bash
npm install
npm link
```

验证安装：

```bash
ycmeta --help
```

## 初始化应用项目

在 iOS/macOS 项目根目录下运行：

```bash
ycmeta init
```

简写：

```bash
ycmeta i
```

创建的目录结构：

```text
AppStoreMetadata/
├── appstore.config.yaml
├── locales/
│   ├── en-US.yaml
│   └── zh-Hans.yaml
├── screenshots/
│   ├── en-US.yaml
│   └── zh-Hans.yaml
├── review/
│   └── review-notes.en-US.md
├── generated/
└── README.md
```

## YAML 字段模型

### appstore.config.yaml

存储项目级 App Store 信息：

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

存储本地化的 App Store 元数据：

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

存储本地化的截图文案：

- `sets.iphone_6_9[]`
- `sets.ipad_13[]`

每项包含：

- `title`
- `subtitle`

## 校验规则

运行：

```bash
ycmeta check
```

简写：

```bash
ycmeta c
```

规则：

| 字段 | 规则 |
|---|---:|
| `metadata.name` | 2 到 30 个字符 |
| `metadata.subtitle` | 最多 30 个字符 |
| `metadata.promotional_text` | 最多 170 个字符 |
| `metadata.description` | 最多 4000 个字符 |
| `metadata.keywords` | 最多 100 UTF-8 字节 |
| `metadata.whats_new` | 最多 4000 个字符 |
| `review.notes` | 最多 4000 UTF-8 字节 |
| 隐私政策 URL | 必填，http/https |
| 支持 URL | 必填，http/https |
| 条款 URL | 建议填写，http/https |

机器可读输出：

```bash
ycmeta check --json
```

## 生成 HTML 复制面板

```bash
ycmeta build
```

简写：

```bash
ycmeta b
```

生成文件：

```text
AppStoreMetadata/generated/index.html
AppStoreMetadata/generated/summary.md
```

HTML 文件为纯静态页面，可直接在浏览器中打开。所有数据内嵌在页面中，不请求本地文件。

## 打开 HTML 复制面板

```bash
ycmeta open
```

简写：

```bash
ycmeta o
```

## 预览工作流

推荐的日常命令：

```bash
ycmeta preview
```

简写：

```bash
ycmeta p
```

依次执行：

1. `ycmeta check`
2. `ycmeta build`
3. `ycmeta open`

如果存在阻断性校验错误，预览会在 build/open 之前停止。

## 复制到 App Store Connect

打开：

```text
AppStoreMetadata/generated/index.html
```

使用字段级复制按钮复制以下内容：

- 应用名称
- 副标题
- 促销文本
- 描述
- 关键词
- 更新日志
- 审核备注
- 法律链接
- 截图文案

## 导出 fastlane 元数据

```bash
ycmeta fastlane
```

简写：

```bash
ycmeta f
```

生成结构：

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

## 添加新语言

1. 在 `AppStoreMetadata/appstore.config.yaml` 中添加语言：

```yaml
store:
  locales:
    - en-US
    - zh-Hans
    - ja
```

2. 创建文件：

```text
AppStoreMetadata/locales/ja.yaml
AppStoreMetadata/screenshots/ja.yaml
```

3. 运行：

```bash
ycmeta check
```

## AI 代理技能

YCAppStoreMetaKit 可以为 Claude Code 和 Codex 生成项目级技能。

```bash
ycmeta skill
```

简写：

```bash
ycmeta s
```

生成文件：

```text
.claude/skills/app-store-metadata/SKILL.md
.agents/skills/app-store-metadata/SKILL.md
.agents/skills/app-store-metadata/agents/openai.yaml
AGENTS.md
```

### Claude Code 技能

Claude Code 使用：

```text
.claude/skills/app-store-metadata/SKILL.md
```

当你需要 Claude Code 生成、改进、翻译或校验 App Store 元数据时使用。

### Codex 技能

Codex 使用：

```text
.agents/skills/app-store-metadata/SKILL.md
```

Codex 还可以读取生成的 `AGENTS.md` 项目规则。

### AGENTS.md

运行：

```bash
ycmeta agents
```

在 `AGENTS.md` 中创建或更新 YCAppStoreMetaKit 管理的规则块，不会删除已有内容。

## 命令参考

| 命令 | 简写 | 说明 |
|---|---|---|
| `ycmeta init` | `ycmeta i` | 初始化 AppStoreMetadata |
| `ycmeta check` | `ycmeta c` | 校验元数据 |
| `ycmeta build` | `ycmeta b` | 生成 HTML 和 summary.md |
| `ycmeta open` | `ycmeta o` | 打开 HTML 复制面板 |
| `ycmeta preview` | `ycmeta p` | 校验、生成并打开 HTML |
| `ycmeta fastlane` | `ycmeta f` | 导出 fastlane 元数据 |
| `ycmeta doctor` | `ycmeta d` | 诊断目录和配置 |
| `ycmeta skill` | `ycmeta s` | 生成 Claude Code 和 Codex 技能 |
| `ycmeta skill claude` | | 仅生成 Claude Code 技能 |
| `ycmeta skill codex` | | 仅生成 Codex 技能 |
| `ycmeta skill all` | | 生成所有技能和 AGENTS.md |
| `ycmeta agents` | | 生成或更新 AGENTS.md 规则块 |

## 推荐工作流

### 首次设置

```bash
ycmeta init
ycmeta skill
ycmeta p
```

### 日常元数据编辑

1. 编辑 `AppStoreMetadata/locales/*.yaml`
2. 运行 `ycmeta check`
3. 运行 `ycmeta p`
4. 从 `generated/index.html` 复制内容到 App Store Connect

### AI 辅助编辑

1. 运行 `ycmeta skill`
2. 让 Claude Code 或 Codex 使用 `app-store-metadata` 技能
3. 模型只应编辑 AppStoreMetadata 源文件
4. 模型应运行 `ycmeta check`
5. 需要复制面板时运行 `ycmeta p`

## 本地测试

在 YCAppStoreMetaKit 目录下：

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

## 设计决策

- YAML 文件是唯一数据源。
- 生成文件为临时文件，可随时重新生成。
- HTML 用于预览和手动复制。
- CLI 负责确定性校验和生成。
- 技能引导 AI 工具安全地编辑元数据。
- App Store 元数据和应用内 `.xcstrings` 本地化是独立系统。
- v1.0 有意不包含 App Store Connect API。

## 许可证

[MIT](./LICENSE)
