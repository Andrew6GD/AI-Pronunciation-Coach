// /netlify/functions/analyze.js

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { type, ...params } = JSON.parse(event.body);
    const apiKey = process.env.GOOGLE_API_KEY;

    let apiUrl = '';
    let payload = {};

    if (type === 'analysis') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const prompt = `Analyze the following English paragraph and provide a detailed breakdown for pronunciation practice. Return the analysis in JSON format with the following structure:

{
  "sentences": [
    {
      "text": "sentence text",
      "words": [
        {
          "text": "word",
          "phonetic": {
            "us": "/wɜːrd/",
            "uk": "/wɜːd/"
          },
          "difficulty": "easy|medium|hard",
          "tips": "pronunciation tips"
        }
      ],
      "rhythm": "description of sentence rhythm and stress patterns",
      "intonation": "description of intonation pattern"
    }
  ],
  "overallDifficulty": "easy|medium|hard",
  "focusAreas": ["list of areas to focus on"],
  "practiceNotes": "general practice recommendations"
}

Paragraph to analyze: ${params.text}`;
      
      payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.3
        }
      };
    } else if (type === 'tts') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const speedPrompts = {
        slow: "Say very slowly and clearly",
        normal: "Say at a normal conversational pace",
        fast: "Say quickly but clearly"
      };
      const accentPrompt = params.accent === 'uk' ? 'in a standard British accent' : 'in a standard American accent';
      const fullPrompt = `${speedPrompts[params.speed]} ${accentPrompt}: ${params.text}`;
      
      payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"]
        }
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google API Error:', errorBody);
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: 'API request failed', details: errorBody })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Proxy Error:', error);
    return { 
      statusCode: 500, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};