import { useApp } from '../store/AppContext'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const { state, dispatch } = useApp()

  const iconMap = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  }

  return (
    <div className="toast-container">
      {state.toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {iconMap[toast.type]}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <X 
            size={16} 
            style={{ cursor: 'pointer', opacity: 0.6 }} 
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
          />
        </div>
      ))}
    </div>
  )
}
