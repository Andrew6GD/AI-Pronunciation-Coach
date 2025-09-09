import React, { useState } from 'react'
import eSpeakService from '../services/eSpeakService.js'

function ESpeakTest() {
  const [testWord, setTestWord] = useState('hello')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [voice, setVoice] = useState('en-us')

  const testESpeak = async () => {
    setLoading(true)
    setResult('')
    
    try {
      await eSpeakService.initialize()
      const ipa = await eSpeakService.textToIPA(testWord, voice)
      setResult(`IPA: ${ipa}`)
    } catch (error) {
      setResult(`Error: ${error.message}`)
      console.error('eSpeak test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>eSpeak-NG 测试</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          测试单词: 
          <input 
            type="text" 
            value={testWord} 
            onChange={(e) => setTestWord(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          语音: 
          <select 
            value={voice} 
            onChange={(e) => setVoice(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="en-us">美式英语 (en-us)</option>
            <option value="en-gb">英式英语 (en-gb)</option>
          </select>
        </label>
      </div>
      
      <button 
        onClick={testESpeak} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '测试中...' : '测试 eSpeak-NG'}
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: result.startsWith('Error') ? '#ffe6e6' : '#e6ffe6',
          border: `1px solid ${result.startsWith('Error') ? '#ff9999' : '#99ff99'}`,
          borderRadius: '4px'
        }}>
          <strong>结果:</strong> {result}
        </div>
      )}
    </div>
  )
}

export default ESpeakTest