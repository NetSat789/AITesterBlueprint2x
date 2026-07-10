import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { fetchJiraIssues } from '../../services/jiraService'
import { fetchAdoWorkItems } from '../../services/adoService'
import { Download, ArrowLeft, RefreshCw } from 'lucide-react'

export default function FetchStep() {
  const { state, dispatch } = useApp()
  const activeConnection = state.connections.find(c => c.id === state.activeConnectionId)
  const [fetchError, setFetchError] = useState(null)

  async function handleFetchIssues() {
    if (!activeConnection) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please select a connection first' } })
      return
    }

    if (!state.fetchConfig.projectKey) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Project Key is required' } })
      return
    }

    dispatch({ type: 'SET_LOADING_ISSUES', payload: true })
    setFetchError(null)

    try {
      let issues

      if (activeConnection.platform === 'jira') {
        issues = await fetchJiraIssues(
          activeConnection,
          state.fetchConfig.projectKey,
          state.fetchConfig.sprintVersion
        )
      } else if (activeConnection.platform === 'ado') {
        issues = await fetchAdoWorkItems(
          activeConnection,
          state.fetchConfig.projectKey,
          null
        )
      }

      dispatch({ type: 'SET_ISSUES', payload: issues || [] })
      dispatch({ type: 'SELECT_ALL_ISSUES' })
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'success', message: `Fetched ${issues.length} issues successfully!` }
      })

      // Auto-advance to review step
      if (issues.length > 0) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: 2 })
      }
    } catch (error) {
      setFetchError(error.message)
      dispatch({ type: 'SET_LOADING_ISSUES', payload: false })
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: error.message } })
    }
  }

  if (!activeConnection) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <ArrowLeft size={28} />
          </div>
          <h3>No Connection Selected</h3>
          <p>Please go back to Setup and select or create a connection first.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: 0 })}
          >
            Go to Setup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Fetch {activeConnection.platform === 'jira' ? 'Jira' : 'ADO'} Requirements</h2>
          <p>Enter project details to fetch user stories and requirements</p>
        </div>

        {/* Connected instance info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-5)',
          border: '1px solid var(--gray-200)',
        }}>
          <div>
            <strong style={{ fontSize: 'var(--font-sm)' }}>Connected to:</strong>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)' }}>
              {activeConnection.name} ({activeConnection.url})
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: 0 })}
          >
            Change
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              className="form-input"
              placeholder="e.g., App.vwo.com"
              value={state.fetchConfig.productName}
              onChange={(e) => dispatch({
                type: 'SET_FETCH_CONFIG',
                payload: { productName: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {activeConnection.platform === 'jira' ? 'Project Key' : 'Project Name'} <span className="required">*</span>
            </label>
            <input
              className="form-input"
              placeholder={activeConnection.platform === 'jira' ? 'e.g., VWOAPP' : 'e.g., MyProject'}
              value={state.fetchConfig.projectKey}
              onChange={(e) => dispatch({
                type: 'SET_FETCH_CONFIG',
                payload: { projectKey: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Sprint/Fix Version (Optional)</label>
          <input
            className="form-input"
            placeholder="e.g., Sprint 15 or leave empty for all open issues"
            value={state.fetchConfig.sprintVersion}
            onChange={(e) => dispatch({
              type: 'SET_FETCH_CONFIG',
              payload: { sprintVersion: e.target.value }
            })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Context (Optional)</label>
          <textarea
            className="form-input"
            placeholder="Any additional information about the product, testing goals, or constraints..."
            value={state.fetchConfig.additionalContext}
            onChange={(e) => dispatch({
              type: 'SET_FETCH_CONFIG',
              payload: { additionalContext: e.target.value }
            })}
          />
        </div>

        {fetchError && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--error-50)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--error-600)',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-4)',
          }}>
            {fetchError}
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleFetchIssues}
          disabled={state.isLoadingIssues || !state.fetchConfig.projectKey}
        >
          {state.isLoadingIssues ? (
            <><div className="spinner" /> Fetching Issues...</>
          ) : (
            <><Download size={18} /> Fetch {activeConnection.platform === 'jira' ? 'Jira' : 'ADO'} Issues</>
          )}
        </button>
      </div>
    </div>
  )
}
