// Netlify Function for Azure TTS API proxy
// This function securely handles TTS requests without exposing API keys to the frontend

// 简单的内存缓存用于频率限制（生产环境建议使用Redis）
const requestCache = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟
const MAX_REQUESTS_PER_WINDOW = 30 // 每分钟最多30次请求
const MAX_TEXT_LENGTH = 500 // 最大文本长度
const MAX_REQUESTS_PER_IP_PER_HOUR = 100 // 每小时每IP最多100次请求

// 频率限制检查
const checkRateLimit = (clientIP) => {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // 清理过期记录
  for (const [key, timestamp] of requestCache.entries()) {
    if (timestamp < windowStart) {
      requestCache.delete(key)
    }
  }
  
  // 检查当前窗口内的请求数
  const recentRequests = Array.from(requestCache.entries())
    .filter(([key, timestamp]) => {
      return key.startsWith(clientIP) && timestamp >= windowStart
    })
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  // 记录当前请求
  const requestKey = `${clientIP}_${now}_${Math.random()}`
  requestCache.set(requestKey, now)
  
  return true
}

// 获取客户端IP
const getClientIP = (event) => {
  return event.headers['x-forwarded-for'] || 
         event.headers['x-real-ip'] || 
         event.requestContext?.identity?.sourceIp || 
         'unknown'
}

exports.handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // 获取客户端IP并检查频率限制
  const clientIP = getClientIP(event)
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute allowed`
      })
    }
  }

  try {
    const { text, voice = 'en-US-JennyNeural', rate = '0%', pitch = '0%' } = JSON.parse(event.body);

    // 输入验证
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text parameter is required and must be a non-empty string' })
      }
    }

    // 文本长度限制
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Text too long',
          message: `Maximum text length is ${MAX_TEXT_LENGTH} characters`,
          currentLength: text.length
        })
      }
    }

    // 内容安全检查 - 防止恶意内容
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /data:text\/html/i
    ]
    
    if (suspiciousPatterns.some(pattern => pattern.test(text))) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid content detected',
          message: 'Text contains potentially harmful content'
        })
      }
    }

    // 声音配置白名单 - 与前端保持一致
    const VOICE_CONFIG = {
      'us': {
        'male': 'en-US-GuyNeural',
        'female': 'en-US-JennyNeural'
      },
      'gb': {
        'male': 'en-GB-RyanNeural', 
        'female': 'en-GB-SoniaNeural'
      }
    }

    // 获取所有允许的声音ID
    const getAllowedVoiceIds = () => {
      const voiceIds = []
      Object.values(VOICE_CONFIG).forEach(accent => {
        Object.values(accent).forEach(voiceId => {
          voiceIds.push(voiceId)
        })
      })
      return voiceIds
    }

    // 根据accent和gender获取声音ID
    const getVoiceId = (accent, gender) => {
      return VOICE_CONFIG[accent]?.[gender]
    }

    // 验证声音组合
    const isValidVoiceCombination = (accent, gender) => {
      return !!getVoiceId(accent, gender)
    }

    // 验证声音参数 - 支持两种格式
    let voiceId
    if (voice) {
      // 直接传入voiceId的情况
      if (!getAllowedVoiceIds().includes(voice)) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Invalid voice parameter',
            allowedVoices: getAllowedVoiceIds()
          })
        }
      }
      voiceId = voice
    } else {
      // 使用默认声音
      voiceId = 'en-US-JennyNeural'
    }

    // Get Azure credentials from environment variables
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastus';

    if (!subscriptionKey) {
      console.error('Azure Speech key not configured');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Service configuration error' })
      };
    }

    // 生成SSML
    const ssml = `<?xml version="1.0"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voiceId}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </prosody>
  </voice>
</speak>`

    // Make request to Azure TTS
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'AI-Pronunciation-Coach'
      },
      body: ssml
    });

    if (!response.ok) {
      console.error('Azure TTS API error:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'TTS service error' })
      };
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify({
        audio: base64Audio,
        contentType: 'audio/mpeg'
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};