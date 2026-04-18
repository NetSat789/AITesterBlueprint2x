import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { testJiraConnection } from '../../services/jiraService'
import { testAdoConnection } from '../../services/adoService'
import { Settings, Plus, Trash2, Check, Loader2, Link2, CloudOff } from 'lucide-react'

const PLATFORMS = [
  { id: 'jira', name: 'Jira', icon: '🔵', status: 'available', description: 'Import requirements and user stories from Atlassian Jira', features: ['Requirements import', 'User stories', 'Acceptance criteria'] },
  { id: 'ado', name: 'Azure DevOps', icon: '🔷', status: 'available', description: 'Import work items from Azure DevOps', features: ['Work items', 'User stories', 'Epics & Features'] },
  { id: 'testrail', name: 'TestRail', icon: '🟧', status: 'coming-soon', description: 'Import existing test cases and test suites from TestRail', features: ['Test cases', 'Test suites', 'Test runs'] },
  { id: 'zephyr', name: 'Zephyr', icon: '🔹', status: 'coming-soon', description: 'Sync test cases from Zephyr Scale or Zephyr Squad', features: ['Test cases', 'Test cycles', 'Test execution'] },
  { id: 'xray', name: 'Xray', icon: '🟩', status: 'coming-soon', description: 'Import test cases and test plans from Xray', features: ['Test cases', 'Test plans', 'Test execution'] },
  { id: 'qase', name: 'Qase', icon: '🟪', status: 'coming-soon', description: 'Import test cases and test plans from Qase', features: ['Test cases', 'Test suites', 'Shared steps'] },
]

export default function SetupStep() {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    platform: 'jira',
    url: '',
    email: '',
    apiToken: '',
    pat: '',
  })
  const [testing, setTesting] = useState(false)

  const activeConnection = state.connections.find(c => c.id === state.activeConnectionId)

  async function handleSaveConnection() {
    if (!formData.name || !formData.url) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please fill in all required fields' } })
      return
    }

    setTesting(true)

    let result
    if (formData.platform === 'jira') {
      result = await testJiraConnection(formData.url, formData.email, formData.apiToken)
    } else if (formData.platform === 'ado') {
      result = await testAdoConnection(formData.url, formData.pat)
    }

    setTesting(false)

    if (result?.success) {
      const newConnection = {
        id: Date.now().toString(),
        name: formData.name,
        platform: formData.platform,
        url: formData.url,
        email: formData.email,
        apiToken: formData.apiToken,
        pat: formData.pat,
        verified: true,
        connectedUser: result.user || 'Connected',
      }

      dispatch({ type: 'ADD_CONNECTION', payload: newConnection })
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `Connected to ${formData.name} successfully!` } })

      setFormData({ name: '', platform: 'jira', url: '', email: '', apiToken: '', pat: '' })
      setShowForm(false)
    } else {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: result?.error || 'Connection failed' } })
    }
  }

  function handleDeleteConnection(id) {
    dispatch({ type: 'DELETE_CONNECTION', payload: id })
    dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: 'Connection removed' } })
  }

  return (
    <div>
      {/* Connection Section */}
      <div className="card">
        <div className="card-header">
          <h2>Platform Connection</h2>
          <p>Connect to your project management tool to fetch requirements</p>
        </div>

        {/* Existing connections */}
        {state.connections.length > 0 && !showForm && (
          <>
            <div className="form-group">
              <label className="form-label">Select Connection</label>
              <select
                className="form-select"
                value={state.activeConnectionId || ''}
                onChange={(e) => dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: e.target.value })}
              >
                <option value="">Choose a connection...</option>
                {state.connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.url}) — {conn.platform.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {activeConnection && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div className="connection-badge">
                  <span className="dot"></span>
                  Connected to {activeConnection.name}
                </div>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteConnection(activeConnection.id)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
          </>
        )}

        {/* Add new connection button / form */}
        {!showForm ? (
          <button className="btn btn-secondary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add New Connection
          </button>
        ) : (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <hr className="card-divider" />

            <div className="form-group">
              <label className="form-label">Platform</label>
              <div className="radio-group">
                <div
                  className={`radio-option ${formData.platform === 'jira' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, platform: 'jira' }))}
                >
                  <span className="radio-dot"></span>
                  🔵 Jira
                </div>
                <div
                  className={`radio-option ${formData.platform === 'ado' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, platform: 'ado' }))}
                >
                  <span className="radio-dot"></span>
                  🔷 Azure DevOps
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Connection Name</label>
              <input
                className="form-input"
                placeholder="e.g., VWO Production"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.platform === 'jira' ? 'Jira URL' : 'Organization URL'}
              </label>
              <input
                className="form-input"
                placeholder={formData.platform === 'jira' ? 'https://yourcompany.atlassian.net' : 'https://dev.azure.com/yourorg'}
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            {formData.platform === 'jira' && (
              <>
                <div className="form-group">
                  <label className="form-label">Jira Email</label>
                  <input
                    className="form-input"
                    placeholder="your-email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">API Token</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Your Jira API token"
                    value={formData.apiToken}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiToken: e.target.value }))}
                  />
                  <p className="form-hint">
                    Generate at: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-500)' }}>https://id.atlassian.com/manage-profile/security/api-tokens</a>
                  </p>
                </div>
              </>
            )}

            {formData.platform === 'ado' && (
              <div className="form-group">
                <label className="form-label">Personal Access Token (PAT)</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Your Azure DevOps PAT"
                  value={formData.pat}
                  onChange={(e) => setFormData(prev => ({ ...prev, pat: e.target.value }))}
                />
                <p className="form-hint">
                  Generate at: Azure DevOps → User Settings → Personal Access Tokens
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveConnection}
                disabled={testing}
              >
                {testing ? (
                  <><div className="spinner" /> Testing...</>
                ) : (
                  <><Link2 size={16} /> Save Connection</>
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import from Test Management Tools */}
      <div className="card">
        <div className="card-header">
          <h2>Import from Test Management Tools</h2>
          <p>Connect to your existing test case repositories and management platforms</p>
        </div>

        <div className="integrations-grid">
          {PLATFORMS.map(platform => {
            const isConnected = state.connections.some(c => c.platform === platform.id && c.verified)
            return (
              <div key={platform.id} className={`integration-card ${isConnected ? 'connected' : ''}`}>
                <div className="integration-card-header">
                  <div>
                    <div className={`integration-card-icon ${platform.id}`}>
                      {platform.icon}
                    </div>
                    <h3>{platform.name}</h3>
                  </div>
                  {isConnected ? (
                    <span className="integration-status connected">
                      <Check size={12} /> Connected
                    </span>
                  ) : (
                    <span className={`integration-status ${platform.status}`}>
                      {platform.status === 'available' ? 'Available' : 'Coming Soon'}
                    </span>
                  )}
                </div>
                <p>{platform.description}</p>
                <div className="integration-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {platform.features.map(f => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                {isConnected ? (
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                    Manage Connection
                  </button>
                ) : platform.status === 'available' ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: 'var(--space-3)' }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, platform: platform.id }))
                      setShowForm(true)
                    }}
                  >
                    <Plus size={14} /> Connect
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                    <CloudOff size={14} /> Notify Me
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
