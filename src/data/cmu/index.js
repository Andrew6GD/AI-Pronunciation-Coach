// CMU词典索引
// 自动生成，请勿手动编辑

// 可用的字母块
export const AVAILABLE_CHUNKS = ["'", 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

// 词典统计信息
export const CMU_STATS = {
  totalWords: 126052,
  totalEntries: 135166,
  chunks: 27,
  generatedAt: '2025-09-08T12:19:54.415Z'
};

// 动态加载函数
export async function loadChunk(letter) {
  try {
    const module = await import(`./cmu-${letter}.js`);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load chunk for letter ${letter}:`, error);
    return {};
  }
}

export default {
  AVAILABLE_CHUNKS,
  CMU_STATS,
  loadChunk
};
