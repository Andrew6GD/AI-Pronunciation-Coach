import fs from 'fs';
import path from 'path';

// ARPA到IPA的映射表
const ARPA_TO_IPA = {
  // 元音
  'AA': 'ɑ',    // odd
  'AE': 'æ',    // at
  'AH': 'ʌ',    // hut
  'AO': 'ɔ',    // ought
  'AW': 'aʊ',   // cow
  'AY': 'aɪ',   // hide
  'EH': 'ɛ',    // Ed
  'ER': 'ɝ',    // hurt
  'EY': 'eɪ',   // ate
  'IH': 'ɪ',    // it
  'IY': 'i',    // eat
  'OW': 'oʊ',   // oat
  'OY': 'ɔɪ',   // toy
  'UH': 'ʊ',    // hood
  'UW': 'u',    // two
  
  // 辅音
  'B': 'b',     'CH': 'tʃ',   'D': 'd',     'DH': 'ð',
  'F': 'f',     'G': 'ɡ',     'HH': 'h',    'JH': 'dʒ',
  'K': 'k',     'L': 'l',     'M': 'm',     'N': 'n',
  'NG': 'ŋ',    'P': 'p',     'R': 'r',     'S': 's',
  'SH': 'ʃ',    'T': 't',     'TH': 'θ',    'V': 'v',
  'W': 'w',     'Y': 'j',     'Z': 'z',     'ZH': 'ʒ'
};

// 处理重音标记
function processStress(phoneme) {
  if (phoneme.match(/[0-2]$/)) {
    const stress = phoneme.slice(-1);
    const base = phoneme.slice(0, -1);
    const ipa = ARPA_TO_IPA[base] || base.toLowerCase();
    
    // 添加重音标记
    if (stress === '1') {
      return 'ˈ' + ipa; // 主重音
    } else if (stress === '2') {
      return 'ˌ' + ipa; // 次重音
    } else {
      return ipa; // 无重音
    }
  }
  return ARPA_TO_IPA[phoneme] || phoneme.toLowerCase();
}

// 转换ARPA到IPA
function arpaToIPA(arpaPhonemes) {
  return arpaPhonemes
    .split(' ')
    .map(processStress)
    .join('');
}

// 处理CMU词典文件
function processCMUDict() {
  console.log('开始处理CMU词典文件...');
  
  const inputFile = 'cmudict-0.7b.txt';
  const outputDir = 'src/data/cmu';
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith(';;;'));
  
  console.log(`总共处理 ${lines.length} 行数据`);
  
  const chunks = {}; // 按首字母分组
  let processedCount = 0;
  let totalWords = 0;
  
  for (const line of lines) {
    const match = line.match(/^([^\s]+)\s+(.+)$/);
    if (match) {
      let word = match[1].toLowerCase();
      // 移除词汇变体标记如(2)
      word = word.replace(/\(\d+\)$/, '');
      const arpaPhonemes = match[2];
      const ipaPhonemes = arpaToIPA(arpaPhonemes);
      
      // 按首字母分组
      const firstLetter = word[0].toLowerCase();
      if (!chunks[firstLetter]) {
        chunks[firstLetter] = new Map();
      }
      
      if (!chunks[firstLetter].has(word)) {
        chunks[firstLetter].set(word, []);
        totalWords++;
      }
      
      chunks[firstLetter].get(word).push({
        arpa: arpaPhonemes,
        ipa: ipaPhonemes
      });
      
      processedCount++;
      if (processedCount % 10000 === 0) {
        console.log(`已处理 ${processedCount} 个词汇条目...`);
      }
    }
  }
  
  console.log(`处理完成！总共 ${totalWords} 个唯一词汇，${processedCount} 个条目`);
  
  // 生成分块文件
  console.log('生成分块文件...');
  for (const [letter, wordsMap] of Object.entries(chunks)) {
    const chunkFile = path.join(outputDir, `cmu-${letter}.js`);
    
    // 将Map转换为普通对象
    const wordsObj = {};
    for (const [word, pronunciations] of wordsMap) {
      wordsObj[word] = pronunciations;
    }
    
    const chunkContent = `// CMU词典 - 字母 ${letter.toUpperCase()}\n// 自动生成，请勿手动编辑\n\nexport const CMU_CHUNK_${letter.toUpperCase()} = ${JSON.stringify(wordsObj, null, 2)};\n\nexport default CMU_CHUNK_${letter.toUpperCase()};\n`;
    
    fs.writeFileSync(chunkFile, chunkContent);
    console.log(`生成 ${chunkFile} - ${wordsMap.size} 个词汇`);
  }
  
  // 生成索引文件
  console.log('生成索引文件...');
  const indexContent = `// CMU词典索引\n// 自动生成，请勿手动编辑\n\n// 可用的字母块\nexport const AVAILABLE_CHUNKS = [${Object.keys(chunks).map(l => `'${l}'`).join(', ')}];\n\n// 词典统计信息\nexport const CMU_STATS = {\n  totalWords: ${totalWords},\n  totalEntries: ${processedCount},\n  chunks: ${Object.keys(chunks).length},\n  generatedAt: '${new Date().toISOString()}'\n};\n\n// 动态加载函数\nexport async function loadChunk(letter) {\n  try {\n    const module = await import(\`./cmu-\${letter}.js\`);\n    return module.default;\n  } catch (error) {\n    console.warn(\`Failed to load chunk for letter \${letter}:\`, error);\n    return {};\n  }\n}\n\nexport default {\n  AVAILABLE_CHUNKS,\n  CMU_STATS,\n  loadChunk\n};\n`;
  
  fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent);
  
  console.log('\n=== 处理完成 ===');
  console.log(`总词汇数: ${totalWords}`);
  console.log(`总条目数: ${processedCount}`);
  console.log(`分块数量: ${Object.keys(chunks).length}`);
  console.log(`输出目录: ${outputDir}`);
}

// 运行处理
processCMUDict();