function localeYaml(locale) {
  return `locale: "${locale}"

metadata:
  name: ""
  subtitle: ""
  promotional_text: ""
  description: ""
  keywords: ""
  whats_new: ""

review:
  notes: ""

compliance:
  privacy_summary: ""
  demo_content_notice: ""
`;
}

function localeYamlFromSource(locale, sourceData) {
  const m = sourceData.metadata || {};
  return `locale: "${locale}"

metadata:
  name: "${m.name || ''}"
  subtitle: ""
  promotional_text: ""
  description: ""
  keywords: ""
  whats_new: ""

review:
  notes: ""

compliance:
  privacy_summary: ""
  demo_content_notice: ""
`;
}

function screenshotYaml(locale) {
  return `locale: "${locale}"

sets:
  iphone_6_9:
    - title: ""
      subtitle: ""
`;
}

function screenshotYamlFromSource(locale, sourceData) {
  const sets = sourceData.sets || {};
  const setEntries = Object.entries(sets).map(([setName, items]) => {
    const rows = (items || []).map(() => `    - title: ""
      subtitle: ""`).join('\n');
    return `  ${setName}:\n${rows}`;
  }).join('\n');
  return `locale: "${locale}"

sets:
${setEntries}
`;
}

module.exports = {
  localeYaml,
  localeYamlFromSource,
  screenshotYaml,
  screenshotYamlFromSource
};
