import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, History, Brain, BookOpenCheck } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Brain size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h2>TestPlan AI</h2>
            <span>Testing Platform</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Main</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <History size={18} />
            History
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">🧪 Planning & Strategy</div>
        <nav className="sidebar-nav">
          <NavLink to="/planner" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <BookOpenCheck size={18} />
            Intelligent Test Planner
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}
