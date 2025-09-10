// src/utils/xmlUtils.js
export function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSSML(text = "", voice = "zh-CN-XiaoxiaoNeural") {
  const safe = escapeXml(text);
  return `
    <speak version="1.0" xml:lang="zh-CN">
      <voice name="${voice}">${safe}</voice>
    </speak>
  `.trim();
}

// 兼容不同导入写法
export const toSSML = buildSSML;
export default { escapeXml, buildSSML, toSSML };
