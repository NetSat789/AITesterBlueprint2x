import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/ToastContainer'
import DashboardPage from './pages/DashboardPage'
import PlannerPage from './pages/PlannerPage'
import SettingsPage from './pages/SettingsPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </AppProvider>
  )
}
