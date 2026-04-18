import { useApp } from '../../store/AppContext'
import Markdown from 'react-markdown'
import { FileText, Download, RotateCcw, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function TestPlanStep() {
  const { state, dispatch } = useApp()
  const [copied, setCopied] = useState(false)

  if (state.isGeneratingPlan) {
    return (
      <div className="card">
        <div className="loading-overlay">
          <div className="spinner dark" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
          <h3 style={{ color: 'var(--gray-700)', fontSize: 'var(--font-lg)' }}>Generating Test Plan...</h3>
          <p>Our AI is analyzing your requirements and creating a comprehensive test plan. This may take a minute.</p>
        </div>
      </div>
    )
  }

  if (!state.testPlan) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={28} />
          </div>
          <h3>No test plan generated yet</h3>
          <p>Complete the previous steps to generate your test plan</p>
        </div>
      </div>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(state.testPlan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Test plan copied to clipboard!' } })
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([state.testPlan], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-plan-${state.fetchConfig.projectKey || 'export'}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Test plan downloaded!' } })
  }

  function handleDownloadHTML() {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Plan - ${state.fetchConfig.projectKey}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #1e293b; line-height: 1.7; }
    h1 { color: #0f172a; border-bottom: 2px solid #bfdbfe; padding-bottom: 12px; }
    h2 { color: #1e40af; margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    h3 { color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f1f5f9; font-weight: 600; text-align: left; padding: 10px 14px; border: 1px solid #e2e8f0; }
    td { padding: 10px 14px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  ${state.testPlan.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</body>
</html>`
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-plan-${state.fetchConfig.projectKey || 'export'}-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleNewPlan() {
    dispatch({ type: 'RESET_WIZARD' })
  }

  return (
    <div>
      {/* Actions bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-5)',
      }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--gray-900)' }}>
          📋 Generated Test Plan
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadMarkdown}>
            <Download size={14} /> Markdown
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadHTML}>
            <Download size={14} /> HTML
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleNewPlan}>
            <RotateCcw size={14} /> New Plan
          </button>
        </div>
      </div>

      {/* Test plan content */}
      <div className="test-plan-output">
        <Markdown>{state.testPlan}</Markdown>
      </div>
    </div>
  )
}
