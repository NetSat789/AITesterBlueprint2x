import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { BookOpenCheck, ArrowRight, History, Settings, Zap, Link2, Brain } from 'lucide-react'

export default function DashboardPage() {
  const { state } = useApp()
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Connections',
      value: state.connections.length,
      icon: <Link2 size={22} />,
      color: 'var(--primary-500)',
      bg: 'var(--primary-50)',
    },
    {
      label: 'Test Plans',
      value: state.history.length,
      icon: <BookOpenCheck size={22} />,
      color: 'var(--success-600)',
      bg: 'var(--success-50)',
    },
    {
      label: 'LLM Provider',
      value: state.llmConfig.provider.toUpperCase(),
      icon: <Brain size={22} />,
      color: '#7c3aed',
      bg: '#f3e8ff',
    },
  ]

  return (
    <div className="page-content" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
          Welcome back 👋
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-md)', marginTop: '4px' }}>
          Your intelligent test planning dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
        {stats.map(stat => (
          <div key={stat.label} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', marginBottom: '4px' }}>{stat.label}</p>
                <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--gray-900)' }}>{stat.value}</h3>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-xl)',
                background: stat.bg,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2>
            <Zap size={20} style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: '8px', color: 'var(--warning-500)' }} />
            Quick Actions
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          <button
            className="btn btn-primary"
            style={{ padding: 'var(--space-5)', flexDirection: 'column', minHeight: '100px' }}
            onClick={() => navigate('/planner')}
          >
            <BookOpenCheck size={24} style={{ marginBottom: '8px' }} />
            Create Test Plan
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: 'var(--space-5)', flexDirection: 'column', minHeight: '100px' }}
            onClick={() => navigate('/history')}
          >
            <History size={24} style={{ marginBottom: '8px' }} />
            View History
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: 'var(--space-5)', flexDirection: 'column', minHeight: '100px' }}
            onClick={() => navigate('/settings')}
          >
            <Settings size={24} style={{ marginBottom: '8px' }} />
            LLM Settings
          </button>
        </div>
      </div>

      {/* Recent History */}
      {state.history.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2>Recent Test Plans</h2>
              <p>Your latest generated test plans</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {state.history.slice(0, 3).map(item => (
            <div key={item.id} className="history-item" onClick={() => navigate('/history')}>
              <div className="history-item-info">
                <h4>{item.title}</h4>
                <p>{new Date(item.date).toLocaleDateString()} · {item.issueCount} issues · {item.platform?.toUpperCase()}</p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--gray-400)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
