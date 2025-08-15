import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OpenedFile } from '../lib/types';
import { BufferService } from '../services/BufferService';

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
  
  // Page selection state
  selectedPages: Set<number>;
  selectionMode: boolean;
  
  // Drawing/Annotation state
  currentTool: 'hand' | 'select' | 'highlight' | 'draw' | 'text' | 'rectangle' | 'circle' | 'arrow';
  highlightColor: string;
  drawColor: string;
  drawWidth: number;
  
  // Toolbar state
  activeToolbar: 'main' | 'pdf';
  activePDFToolbar: 'tools1' | 'tools2';
  
  // Undo/Redo state
  undoStack: Uint8Array[];
  redoStack: Uint8Array[];
  
  // Dialog states
  showTextDialog: boolean;
  showHighlightDialog: boolean;
  showRedactDialog: boolean;
  showMergeDialog: boolean;
  showSignatureDialog: boolean;
  showExtractDialog: boolean;
  showSettingsDialog: boolean;
  showHelpDialog: boolean;
  showFileLocationDialog: boolean;
  
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
  | { type: 'SET_SELECTED_PAGES'; payload: Set<number> }
  | { type: 'SET_SELECTION_MODE'; payload: boolean }
  | { type: 'TOGGLE_PAGE_SELECTION'; payload: number }
  | { type: 'SELECT_ALL_PAGES'; payload: number } // payload is total page count
  | { type: 'CLEAR_PAGE_SELECTION' }
  | { type: 'SET_TEXT_DIALOG'; payload: boolean }
  | { type: 'SET_HIGHLIGHT_DIALOG'; payload: boolean }
  | { type: 'SET_REDACT_DIALOG'; payload: boolean }
  | { type: 'SET_MERGE_DIALOG'; payload: boolean }
  | { type: 'SET_SIGNATURE_DIALOG'; payload: boolean }
  | { type: 'SET_EXTRACT_DIALOG'; payload: boolean }
  | { type: 'SET_SETTINGS_DIALOG'; payload: boolean }
  | { type: 'SET_HELP_DIALOG'; payload: boolean }
  | { type: 'SET_FILE_LOCATION_DIALOG'; payload: boolean }
  | { type: 'SET_CURRENT_TOOL'; payload: 'hand' | 'select' | 'highlight' | 'draw' | 'text' | 'rectangle' | 'circle' | 'arrow' }
  | { type: 'SET_HIGHLIGHT_COLOR'; payload: string }
  | { type: 'SET_DRAW_COLOR'; payload: string }
  | { type: 'SET_DRAW_WIDTH'; payload: number }
  | { type: 'PUSH_UNDO'; payload: Uint8Array }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_UNDO_STACK' }
  | { type: 'SET_ACTIVE_TOOLBAR'; payload: 'main' | 'pdf' }
  | { type: 'SET_ACTIVE_PDF_TOOLBAR'; payload: 'tools1' | 'tools2' }
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
  selectedPages: new Set<number>(),
  selectionMode: false,
  currentTool: 'hand',
  highlightColor: '#ffff00',
  drawColor: '#000000',
  drawWidth: 2,
  activeToolbar: 'main',
  activePDFToolbar: 'tools1',
  undoStack: [],
  redoStack: [],
  showTextDialog: false,
  showHighlightDialog: false,
  showRedactDialog: false,
  showMergeDialog: false,
  showSignatureDialog: false,
  showExtractDialog: false,
  showSettingsDialog: false,
  showHelpDialog: false,
  showFileLocationDialog: false,
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
      // Ensure buffers are always safe copies
      const safeBuffers = action.payload ? BufferService.createSafeBuffer(action.payload) : null;
      return { ...state, buffers: safeBuffers };
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
    case 'SET_SELECTED_PAGES':
      return { ...state, selectedPages: action.payload };
    case 'SET_SELECTION_MODE':
      return { ...state, selectionMode: action.payload };
    case 'TOGGLE_PAGE_SELECTION':
      const newSelectedPages = new Set(state.selectedPages);
      if (newSelectedPages.has(action.payload)) {
        newSelectedPages.delete(action.payload);
      } else {
        newSelectedPages.add(action.payload);
      }
      return { ...state, selectedPages: newSelectedPages };
    case 'SELECT_ALL_PAGES':
      const allPages = new Set<number>();
      for (let i = 0; i < action.payload; i++) {
        allPages.add(i);
      }
      return { ...state, selectedPages: allPages };
    case 'CLEAR_PAGE_SELECTION':
      return { ...state, selectedPages: new Set<number>() };
    case 'SET_TEXT_DIALOG':
      return { ...state, showTextDialog: action.payload };
    case 'SET_HIGHLIGHT_DIALOG':
      return { ...state, showHighlightDialog: action.payload };
    case 'SET_REDACT_DIALOG':
      return { ...state, showRedactDialog: action.payload };
    case 'SET_MERGE_DIALOG':
      return { ...state, showMergeDialog: action.payload };
    case 'SET_SIGNATURE_DIALOG':
      return { ...state, showSignatureDialog: action.payload };
    case 'SET_EXTRACT_DIALOG':
      return { ...state, showExtractDialog: action.payload };
    case 'SET_SETTINGS_DIALOG':
      return { ...state, showSettingsDialog: action.payload };
    case 'SET_HELP_DIALOG':
      return { ...state, showHelpDialog: action.payload };
    case 'SET_FILE_LOCATION_DIALOG':
      return { ...state, showFileLocationDialog: action.payload };
    case 'SET_CURRENT_TOOL':
      return { ...state, currentTool: action.payload };
    case 'SET_HIGHLIGHT_COLOR':
      return { ...state, highlightColor: action.payload };
    case 'SET_DRAW_COLOR':
      return { ...state, drawColor: action.payload };
    case 'SET_DRAW_WIDTH':
      return { ...state, drawWidth: action.payload };
    case 'PUSH_UNDO':
      return { 
        ...state, 
        undoStack: [...state.undoStack.slice(-9), action.payload], // Keep last 10 states
        redoStack: [] // Clear redo stack when new action is performed
      };
    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const lastState = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        buffers: lastState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: state.buffers ? [...state.redoStack, state.buffers] : state.redoStack
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        buffers: nextState,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: state.buffers ? [...state.undoStack, state.buffers] : state.undoStack
      };
    case 'CLEAR_UNDO_STACK':
      return { ...state, undoStack: [], redoStack: [] };
    case 'SET_ACTIVE_TOOLBAR':
      return { ...state, activeToolbar: action.payload };
    case 'SET_ACTIVE_PDF_TOOLBAR':
      return { ...state, activePDFToolbar: action.payload };
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
        showSignatureDialog: false,
        showExtractDialog: false,
        showSettingsDialog: false,
        showHelpDialog: false,
        showFileLocationDialog: false,
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
