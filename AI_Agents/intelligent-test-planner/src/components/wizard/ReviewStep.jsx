import { useApp } from '../../store/AppContext'
import { generateTestPlan } from '../../services/llmService'
import { RefreshCw, Check, Square, CheckSquare, Brain } from 'lucide-react'

export default function ReviewStep() {
  const { state, dispatch } = useApp()
  const activeConnection = state.connections.find(c => c.id === state.activeConnectionId)
  const selectedIssues = state.issues.filter(i => state.selectedIssueIds.includes(i.id))

  async function handleGenerate() {
    if (selectedIssues.length === 0) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please select at least one issue' } })
      return
    }

    // Check LLM config
    const provider = state.llmConfig.provider
    const config = state.llmConfig[provider]
    
    if (provider === 'groq' && !config.apiKey) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please configure your LLM API key in Settings first' } })
      return
    }
    if (provider === 'grok' && !config.apiKey) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'Please configure your Grok API key in Settings first' } })
      return
    }

    dispatch({ type: 'SET_GENERATING_PLAN', payload: true })
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 })

    try {
      const combinedContext = [
        state.fetchConfig.additionalContext,
        state.reviewContext,
      ].filter(Boolean).join('\n\n')

      const plan = await generateTestPlan(
        state.llmConfig,
        selectedIssues,
        null,
        combinedContext
      )

      dispatch({ type: 'SET_TEST_PLAN', payload: plan })
      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: {
          id: Date.now().toString(),
          title: `Test Plan — ${state.fetchConfig.productName || state.fetchConfig.projectKey}`,
          date: new Date().toISOString(),
          issueCount: selectedIssues.length,
          platform: activeConnection?.platform || 'jira',
          content: plan,
        }
      })
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Test plan generated successfully!' } })
    } catch (error) {
      dispatch({ type: 'SET_GENERATING_PLAN', payload: false })
      dispatch({ type: 'SET_CURRENT_STEP', payload: 2 })
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: error.message } })
    }
  }

  function handleRefresh() {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 })
  }

  const allSelected = state.issues.length > 0 && state.selectedIssueIds.length === state.issues.length

  function getTypeBadgeClass(type) {
    const lower = type.toLowerCase()
    if (lower.includes('story') || lower.includes('user story')) return 'story'
    if (lower.includes('bug')) return 'bug'
    return 'task'
  }

  return (
    <div>
      {/* Connection info bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
      }}>
        {activeConnection && (
          <div className="connection-badge">
            <span className="dot"></span>
            {activeConnection.name} ({activeConnection.url})
          </div>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
          <RefreshCw size={14} /> Refresh Issues
        </button>
      </div>

      {/* Additional context */}
      <div className="card">
        <div className="card-header">
          <h2>Additional Context & Notes</h2>
          <p>Add any additional context, special requirements, or constraints</p>
        </div>
        <textarea
          className="form-input"
          placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..."
          value={state.reviewContext}
          onChange={(e) => dispatch({ type: 'SET_REVIEW_CONTEXT', payload: e.target.value })}
          style={{ minHeight: '100px' }}
        />
      </div>

      {/* Issues list */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Review Jira Issues ({state.issues.length})</h2>
            <p>Issues that will be used to generate the test plan</p>
          </div>
          {state.issues.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: allSelected ? 'DESELECT_ALL_ISSUES' : 'SELECT_ALL_ISSUES' })}
            >
              {allSelected ? <><Square size={14} /> Deselect All</> : <><CheckSquare size={14} /> Select All</>}
            </button>
          )}
        </div>

        {state.issues.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <p>No issues fetched yet. Go back to fetch issues first.</p>
          </div>
        ) : (
          <div className="issues-list">
            {state.issues.map(issue => {
              const isSelected = state.selectedIssueIds.includes(issue.id)
              return (
                <div
                  key={issue.id}
                  className={`issue-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_ISSUE_SELECTION', payload: issue.id })}
                >
                  <div className={`issue-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <span className="issue-id">{issue.id}</span>
                      <span className="issue-title">{issue.title}</span>
                    </div>
                    <div className="issue-meta">
                      <span className={`issue-badge ${getTypeBadgeClass(issue.type)}`}>{issue.type}</span>
                      <span className="issue-badge task">{issue.priority}</span>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--gray-400)' }}>{issue.status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-5)' }}>
          <button
            className="btn btn-primary btn-full"
            onClick={handleGenerate}
            disabled={selectedIssues.length === 0 || state.isGeneratingPlan}
          >
            {state.isGeneratingPlan ? (
              <><div className="spinner" /> Generating Test Plan...</>
            ) : (
              <><Brain size={18} /> Generate Test Plan ({selectedIssues.length} issues selected)</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
