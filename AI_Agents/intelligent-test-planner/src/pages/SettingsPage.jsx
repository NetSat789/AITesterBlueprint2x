import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { testLLMConnection } from '../services/llmService'
import { Settings as SettingsIcon, Zap, Check, Server, Key, Brain } from 'lucide-react'

const LLM_PROVIDERS = [
  { id: 'ollama', name: 'Ollama', icon: '🦙', description: 'Local LLM — Run models on your machine' },
  { id: 'groq', name: 'GROQ', icon: '⚡', description: 'Ultra-fast inference — Cloud API' },
  { id: 'grok', name: 'Grok', icon: '🤖', description: 'xAI\'s Grok — Cloud API' },
]

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]

const GROK_MODELS = [
  'grok-2',
  'grok-beta',
]

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function handleProviderChange(provider) {
    dispatch({ type: 'SET_LLM_CONFIG', payload: { provider } })
    setTestResult(null)
  }

  function handleConfigChange(provider, field, value) {
    dispatch({
      type: 'SET_LLM_PROVIDER_CONFIG',
      payload: { provider, config: { [field]: value } },
    })
  }

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)

    const result = await testLLMConnection(state.llmConfig)
    
    setTesting(false)
    setTestResult(result)

    if (result.success) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: result.message || 'LLM connected successfully!' } })
    } else {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: result.error || 'Connection failed' } })
    }
  }

  function handleSave() {
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Settings saved successfully!' } })
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
          <SettingsIcon size={24} style={{ display: 'inline-block', verticalAlign: '-4px', marginRight: '8px' }} />
          Settings
        </h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '4px' }}>
          Configure your AI provider and application preferences
        </p>
      </div>

      {/* LLM Configuration */}
      <div className="card">
        <div className="card-header">
          <h2>
            <Brain size={20} style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: '8px', color: 'var(--primary-500)' }} />
            LLM Configuration
          </h2>
          <p>Select and configure your AI provider for test plan generation</p>
        </div>

        {/* Provider Selection */}
        <div className="form-group">
          <label className="form-label">Select Provider</label>
          <div className="radio-group">
            {LLM_PROVIDERS.map(provider => (
              <div
                key={provider.id}
                className={`radio-option ${state.llmConfig.provider === provider.id ? 'selected' : ''}`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <span className="radio-dot"></span>
                <span>{provider.icon}</span>
                <span>{provider.name}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="card-divider" />

        {/* Provider-specific config */}
        <div className="settings-grid">
          {/* Ollama */}
          <div className={`llm-provider-card ${state.llmConfig.provider === 'ollama' ? 'active' : ''}`}>
            <div className="llm-provider-header">
              <h3>🦙 Ollama Settings</h3>
              {state.llmConfig.provider === 'ollama' && (
                <span className="integration-status available">Active</span>
              )}
            </div>
            <div className="llm-provider-fields">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <Server size={14} style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '4px' }} />
                  Base URL
                </label>
                <input
                  className="form-input"
                  placeholder="http://localhost:11434"
                  value={state.llmConfig.ollama.baseUrl}
                  onChange={(e) => handleConfigChange('ollama', 'baseUrl', e.target.value)}
                  disabled={state.llmConfig.provider !== 'ollama'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Model</label>
                <input
                  className="form-input"
                  placeholder="llama3"
                  value={state.llmConfig.ollama.model}
                  onChange={(e) => handleConfigChange('ollama', 'model', e.target.value)}
                  disabled={state.llmConfig.provider !== 'ollama'}
                />
              </div>
            </div>
          </div>

          {/* GROQ */}
          <div className={`llm-provider-card ${state.llmConfig.provider === 'groq' ? 'active' : ''}`}>
            <div className="llm-provider-header">
              <h3>⚡ GROQ Settings</h3>
              {state.llmConfig.provider === 'groq' && (
                <span className="integration-status available">Active</span>
              )}
            </div>
            <div className="llm-provider-fields">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <Key size={14} style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '4px' }} />
                  API Key
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="gsk_..."
                  value={state.llmConfig.groq.apiKey}
                  onChange={(e) => handleConfigChange('groq', 'apiKey', e.target.value)}
                  disabled={state.llmConfig.provider !== 'groq'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Model</label>
                <select
                  className="form-select"
                  value={state.llmConfig.groq.model}
                  onChange={(e) => handleConfigChange('groq', 'model', e.target.value)}
                  disabled={state.llmConfig.provider !== 'groq'}
                >
                  {GROQ_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grok */}
          <div className={`llm-provider-card ${state.llmConfig.provider === 'grok' ? 'active' : ''}`}>
            <div className="llm-provider-header">
              <h3>🤖 Grok Settings</h3>
              {state.llmConfig.provider === 'grok' && (
                <span className="integration-status available">Active</span>
              )}
            </div>
            <div className="llm-provider-fields">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <Key size={14} style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '4px' }} />
                  API Key
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="xai-..."
                  value={state.llmConfig.grok.apiKey}
                  onChange={(e) => handleConfigChange('grok', 'apiKey', e.target.value)}
                  disabled={state.llmConfig.provider !== 'grok'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Model</label>
                <select
                  className="form-select"
                  value={state.llmConfig.grok.model}
                  onChange={(e) => handleConfigChange('grok', 'model', e.target.value)}
                  disabled={state.llmConfig.provider !== 'grok'}
                >
                  {GROK_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            background: testResult.success ? 'var(--success-50)' : 'var(--error-50)',
            border: `1px solid ${testResult.success ? 'var(--success-500)' : 'var(--error-500)'}`,
            color: testResult.success ? 'var(--success-700)' : 'var(--error-600)',
            fontSize: 'var(--font-sm)',
          }}>
            {testResult.success ? (
              <>✅ {testResult.message} {testResult.models && `Available models: ${testResult.models.slice(0, 5).join(', ')}`}</>
            ) : (
              <>❌ {testResult.error}</>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <><div className="spinner dark" /> Testing...</>
            ) : (
              <><Zap size={16} /> Test Connection</>
            )}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
