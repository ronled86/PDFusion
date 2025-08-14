import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OpenedFile } from '../lib/types';

// State Types
export interface AppState {
  // File state
  file: OpenedFile | undefined;
  buffers: Uint8Array | null;
  cachedBuffer: Uint8Array | null;
  
  // UI state
  pageIndex: number;
  zoom: number;
  isFirstLoad: boolean;
  viewerDimensions: { width: number; height: number };
  scrollMode: 'page' | 'continuous';
  
  // Dialog states
  showTextDialog: boolean;
  showHighlightDialog: boolean;
  showRedactDialog: boolean;
  showMergeDialog: boolean;
  
  // Input states
  textInput: string;
  highlightInput: string;
  redactInput: string;
  mergeFiles: OpenedFile[];
  mergePosition: 'before' | 'after' | 'replace';
  
  // Notification state
  notification: string | null;
}

// Action Types
export type AppAction = 
  | { type: 'SET_FILE'; payload: OpenedFile | undefined }
  | { type: 'SET_BUFFERS'; payload: Uint8Array | null }
  | { type: 'SET_CACHED_BUFFER'; payload: Uint8Array | null }
  | { type: 'SET_PAGE_INDEX'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_FIRST_LOAD'; payload: boolean }
  | { type: 'SET_VIEWER_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_SCROLL_MODE'; payload: 'page' | 'continuous' }
  | { type: 'SET_TEXT_DIALOG'; payload: boolean }
  | { type: 'SET_HIGHLIGHT_DIALOG'; payload: boolean }
  | { type: 'SET_REDACT_DIALOG'; payload: boolean }
  | { type: 'SET_MERGE_DIALOG'; payload: boolean }
  | { type: 'SET_TEXT_INPUT'; payload: string }
  | { type: 'SET_HIGHLIGHT_INPUT'; payload: string }
  | { type: 'SET_REDACT_INPUT'; payload: string }
  | { type: 'SET_MERGE_FILES'; payload: OpenedFile[] }
  | { type: 'SET_MERGE_POSITION'; payload: 'before' | 'after' | 'replace' }
  | { type: 'SET_NOTIFICATION'; payload: string | null }
  | { type: 'RESET_DIALOGS' };

// Initial State
const initialState: AppState = {
  file: undefined,
  buffers: null,
  cachedBuffer: null,
  pageIndex: 0,
  zoom: 1,
  isFirstLoad: true,
  viewerDimensions: { width: 0, height: 0 },
  scrollMode: 'page',
  showTextDialog: false,
  showHighlightDialog: false,
  showRedactDialog: false,
  showMergeDialog: false,
  textInput: "",
  highlightInput: "",
  redactInput: "",
  mergeFiles: [],
  mergePosition: 'after',
  notification: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, file: action.payload };
    case 'SET_BUFFERS':
      return { ...state, buffers: action.payload };
    case 'SET_CACHED_BUFFER':
      return { ...state, cachedBuffer: action.payload };
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_FIRST_LOAD':
      return { ...state, isFirstLoad: action.payload };
    case 'SET_VIEWER_DIMENSIONS':
      return { ...state, viewerDimensions: action.payload };
    case 'SET_SCROLL_MODE':
      return { ...state, scrollMode: action.payload };
    case 'SET_TEXT_DIALOG':
      return { ...state, showTextDialog: action.payload };
    case 'SET_HIGHLIGHT_DIALOG':
      return { ...state, showHighlightDialog: action.payload };
    case 'SET_REDACT_DIALOG':
      return { ...state, showRedactDialog: action.payload };
    case 'SET_MERGE_DIALOG':
      return { ...state, showMergeDialog: action.payload };
    case 'SET_TEXT_INPUT':
      return { ...state, textInput: action.payload };
    case 'SET_HIGHLIGHT_INPUT':
      return { ...state, highlightInput: action.payload };
    case 'SET_REDACT_INPUT':
      return { ...state, redactInput: action.payload };
    case 'SET_MERGE_FILES':
      return { ...state, mergeFiles: action.payload };
    case 'SET_MERGE_POSITION':
      return { ...state, mergePosition: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'RESET_DIALOGS':
      return {
        ...state,
        showTextDialog: false,
        showHighlightDialog: false,
        showRedactDialog: false,
        showMergeDialog: false,
        textInput: "",
        highlightInput: "",
        redactInput: "",
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
