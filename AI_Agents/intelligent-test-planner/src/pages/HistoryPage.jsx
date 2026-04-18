import { useApp } from '../store/AppContext'
import Markdown from 'react-markdown'
import { History, FileText, Download, Trash2, ArrowLeft, Eye, X } from 'lucide-react'
import { useState } from 'react'

export default function HistoryPage() {
  const { state, dispatch } = useApp()
  const [viewingPlan, setViewingPlan] = useState(null)

  function handleDelete(id) {
    dispatch({
      type: 'LOAD_STATE',
      payload: { history: state.history.filter(h => h.id !== id) },
    })
    dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: 'Test plan removed from history' } })
    if (viewingPlan?.id === id) setViewingPlan(null)
  }

  function handleDownload(item) {
    const blob = new Blob([item.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (viewingPlan) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <button className="btn btn-secondary" onClick={() => setViewingPlan(null)}>
            <ArrowLeft size={16} /> Back to History
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(viewingPlan)}>
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {viewingPlan.title}
        </h2>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-5)' }}>
          Generated on {new Date(viewingPlan.date).toLocaleString()} · {viewingPlan.issueCount} issues · {viewingPlan.platform?.toUpperCase()}
        </p>
        <div className="test-plan-output">
          <Markdown>{viewingPlan.content}</Markdown>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
          <History size={24} style={{ display: 'inline-block', verticalAlign: '-4px', marginRight: '8px' }} />
          Test Plan History
        </h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '4px' }}>
          View and manage your previously generated test plans
        </p>
      </div>

      {state.history.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28} />
            </div>
            <h3>No test plans yet</h3>
            <p>Generated test plans will appear here</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {state.history.map(item => (
            <div key={item.id} className="history-item">
              <div className="history-item-info" onClick={() => setViewingPlan(item)}>
                <h4>{item.title}</h4>
                <p>
                  {new Date(item.date).toLocaleDateString()} · {item.issueCount} issues · {item.platform?.toUpperCase()}
                </p>
              </div>
              <div className="history-item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setViewingPlan(item)}>
                  <Eye size={14} /> View
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(item)}>
                  <Download size={14} />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
