// 声音配置 - 英音/美音白名单
// 根据安全要点文档，限制可用的声音选项

export const VOICE_CONFIG = {
  // 美式英语声音
  'us': {
    label: '美式英语',
    voices: {
      'male': {
        id: 'en-US-GuyNeural',
        name: 'Guy (男声)',
        description: '自然流畅的美式男声'
      },
      'female': {
        id: 'en-US-JennyNeural', 
        name: 'Jenny (女声)',
        description: '清晰友好的美式女声'
      }
    }
  },
  
  // 英式英语声音
  'gb': {
    label: '英式英语',
    voices: {
      'male': {
        id: 'en-GB-RyanNeural',
        name: 'Ryan (男声)',
        description: '标准的英式男声'
      },
      'female': {
        id: 'en-GB-SoniaNeural',
        name: 'Sonia (女声)', 
        description: '优雅的英式女声'
      }
    }
  }
};

// 获取所有可用的声音ID列表（用于后端验证）
export const getAllowedVoiceIds = () => {
  const voiceIds = [];
  Object.values(VOICE_CONFIG).forEach(accent => {
    Object.values(accent.voices).forEach(voice => {
      voiceIds.push(voice.id);
    });
  });
  return voiceIds;
};

// 根据accent和gender获取声音ID
export const getVoiceId = (accent, gender) => {
  const accentConfig = VOICE_CONFIG[accent];
  if (!accentConfig) {
    throw new Error(`Unsupported accent: ${accent}`);
  }
  
  const voice = accentConfig.voices[gender];
  if (!voice) {
    throw new Error(`Unsupported gender for ${accent}: ${gender}`);
  }
  
  return voice.id;
};

// 获取声音的显示名称
export const getVoiceName = (accent, gender) => {
  const accentConfig = VOICE_CONFIG[accent];
  if (!accentConfig) return 'Unknown Voice';
  
  const voice = accentConfig.voices[gender];
  if (!voice) return 'Unknown Voice';
  
  return voice.name;
};

// 验证声音组合是否有效
export const isValidVoiceCombination = (accent, gender) => {
  try {
    getVoiceId(accent, gender);
    return true;
  } catch {
    return false;
  }
};

// 默认声音设置
export const DEFAULT_VOICE = {
  accent: 'us',
  gender: 'female'
};