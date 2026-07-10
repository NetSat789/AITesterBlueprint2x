import { useApp } from '../store/AppContext'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, History, Check } from 'lucide-react'
import SetupStep from '../components/wizard/SetupStep'
import FetchStep from '../components/wizard/FetchStep'
import ReviewStep from '../components/wizard/ReviewStep'
import TestPlanStep from '../components/wizard/TestPlanStep'

const STEPS = [
  { label: 'Setup', number: 1 },
  { label: 'Fetch Issues', number: 2 },
  { label: 'Review', number: 3 },
  { label: 'Test Plan', number: 4 },
]

export default function PlannerPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  function handleStepClick(index) {
    // Allow going back, but not forward past completed steps
    if (index <= state.currentStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: index })
    }
  }

  function renderStep() {
    switch (state.currentStep) {
      case 0:
        return <SetupStep />
      case 1:
        return <FetchStep />
      case 2:
        return <ReviewStep />
      case 3:
        return <TestPlanStep />
      default:
        return <SetupStep />
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon">
            <BookOpenCheck size={24} />
          </div>
          <div>
            <h1>Intelligent Test Planning Agent</h1>
            <p>Generate comprehensive test plans from Jira requirements using AI</p>
          </div>
        </div>
        <button className="btn-view-history" onClick={() => navigate('/history')}>
          <History size={16} />
          View History
        </button>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((step, index) => (
          <div
            key={step.label}
            className={`stepper-step ${index === state.currentStep ? 'active' : ''} ${index < state.currentStep ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <span className="stepper-step-number">
              {index < state.currentStep ? <Check size={14} /> : step.number}
            </span>
            {step.label}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="page-content">
        {renderStep()}
      </div>

      {/* Continue Button (for Setup and Fetch) */}
      {(state.currentStep === 0 && state.activeConnectionId) && (
        <div style={{
          padding: '0 var(--space-8) var(--space-8)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
        }}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: 1 })}
          >
            Continue to Fetch Issues
          </button>
        </div>
      )}
    </>
  )
}
