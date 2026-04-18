import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  // Platform connections
  connections: [],
  activeConnectionId: null,

  // LLM settings
  llmConfig: {
    provider: 'groq',
    ollama: { baseUrl: 'http://localhost:11434', model: 'llama3' },
    groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
    grok: { apiKey: '', model: 'grok-2' },
  },

  // Wizard state
  currentStep: 0,
  
  // Fetch issues state
  fetchConfig: {
    productName: '',
    projectKey: '',
    sprintVersion: '',
    additionalContext: '',
  },

  // Fetched issues
  issues: [],
  selectedIssueIds: [],
  isLoadingIssues: false,

  // Review context
  reviewContext: '',

  // Generated test plan
  testPlan: null,
  isGeneratingPlan: false,

  // History
  history: [],

  // Toasts
  toasts: [],
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload],
        activeConnectionId: action.payload.id,
      }
    
    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    
    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(c => c.id !== action.payload),
        activeConnectionId: state.activeConnectionId === action.payload ? null : state.activeConnectionId,
      }
    
    case 'SET_ACTIVE_CONNECTION':
      return { ...state, activeConnectionId: action.payload }
    
    case 'SET_LLM_CONFIG':
      return {
        ...state,
        llmConfig: {
          ...state.llmConfig,
          ...action.payload,
        },
      }
    
    case 'SET_LLM_PROVIDER_CONFIG':
      return {
        ...state,
        llmConfig: {
          ...state.llmConfig,
          [action.payload.provider]: {
            ...state.llmConfig[action.payload.provider],
            ...action.payload.config,
          },
        },
      }
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
    
    case 'SET_FETCH_CONFIG':
      return {
        ...state,
        fetchConfig: { ...state.fetchConfig, ...action.payload },
      }
    
    case 'SET_ISSUES':
      return { ...state, issues: action.payload, isLoadingIssues: false }
    
    case 'SET_LOADING_ISSUES':
      return { ...state, isLoadingIssues: action.payload }
    
    case 'TOGGLE_ISSUE_SELECTION': {
      const id = action.payload
      const isSelected = state.selectedIssueIds.includes(id)
      return {
        ...state,
        selectedIssueIds: isSelected
          ? state.selectedIssueIds.filter(i => i !== id)
          : [...state.selectedIssueIds, id],
      }
    }
    
    case 'SELECT_ALL_ISSUES':
      return {
        ...state,
        selectedIssueIds: state.issues.map(i => i.id),
      }
    
    case 'DESELECT_ALL_ISSUES':
      return { ...state, selectedIssueIds: [] }
    
    case 'SET_REVIEW_CONTEXT':
      return { ...state, reviewContext: action.payload }
    
    case 'SET_TEST_PLAN':
      return { ...state, testPlan: action.payload, isGeneratingPlan: false }
    
    case 'SET_GENERATING_PLAN':
      return { ...state, isGeneratingPlan: action.payload }
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history],
      }
    
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      }
    
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      }
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    
    case 'RESET_WIZARD':
      return {
        ...state,
        currentStep: 0,
        fetchConfig: initialState.fetchConfig,
        issues: [],
        selectedIssueIds: [],
        reviewContext: '',
        testPlan: null,
      }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Load persisted state from localStorage
    try {
      const saved = localStorage.getItem('itp-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...initial,
          connections: parsed.connections || [],
          llmConfig: parsed.llmConfig || initial.llmConfig,
          history: parsed.history || [],
        }
      }
    } catch (e) { /* ignore */ }
    return initial
  })

  // Persist relevant state to localStorage
  React.useEffect(() => {
    const toSave = {
      connections: state.connections,
      llmConfig: state.llmConfig,
      history: state.history,
    }
    localStorage.setItem('itp-state', JSON.stringify(toSave))
  }, [state.connections, state.llmConfig, state.history])

  // Auto-remove toasts
  React.useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id })
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [state.toasts])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
