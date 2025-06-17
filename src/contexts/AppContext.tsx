import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserProfile, Session, ChatMessage, Assessment } from '../types';

interface AppState {
  currentUser: UserProfile | null;
  currentSession: Session | null;
  sessions: Session[];
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'START_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { sessionId: string; message: ChatMessage } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ASSESSMENT'; payload: Assessment };

const initialState: AppState = {
  currentUser: null,
  currentSession: null,
  sessions: [],
  assessments: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        sessions: [...state.sessions, action.payload],
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        sessions: state.sessions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'ADD_CHAT_MESSAGE':
      const updatedSession = state.currentSession;
      if (updatedSession && updatedSession.id === action.payload.sessionId) {
        updatedSession.progress.chatHistory.push(action.payload.message);
        return {
          ...state,
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      }
      return state;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_ASSESSMENT':
      return { ...state, assessments: [...state.assessments, action.payload] };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}