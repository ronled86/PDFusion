# PDFusion Module Index

## 📋 Complete Module Reference

This file provides a comprehensive index of all modules in the new PDFusion architecture with their purposes, dependencies, and usage.

## 📁 `/src/contexts/`

### `AppContext.tsx`
- **Purpose**: Centralized application state management
- **Exports**: `AppProvider`, `useAppContext`, `AppState`, `AppAction`
- **Dependencies**: React, OpenedFile type
- **Usage**: Wrap main app, access via `useAppContext()`
- **Key Features**: 
  - State: file, buffers, UI state, dialog states
  - Actions: 20+ typed actions for state updates
  - Provider: Context provider component

## 📁 `/src/services/`

### `BufferService.ts`
- **Purpose**: PDF buffer management and memory safety
- **Exports**: `BufferService` (static class)
- **Dependencies**: OpenedFile type
- **Key Methods**:
  - `createSafeBuffer()`: Detachment-safe buffer copies
  - `getWorkingBuffer()`: Valid buffer retrieval
  - `isBufferValid()`: Buffer accessibility check
  - `createSafeUpdate()`: Safe state updates
- **Usage**: Always use for buffer operations to prevent crashes

### `PDFOperationsService.ts`
- **Purpose**: All PDF manipulation operations
- **Exports**: `PDFOperationsService` (static class)
- **Dependencies**: pdf-lib operations, BufferService, OpenedFile
- **Key Methods**:
  - `rotatePage()`: Page rotation with state preservation
  - `addInkStroke()`: Drawing functionality
  - `addText()`: Text insertion
  - `highlightText()`: Text highlighting with search
  - `extractPages()`: Page extraction
  - `mergePDFs()`: Document merging with position control
- **Error Handling**: All methods throw user-friendly errors

### `PrintService.ts`
- **Purpose**: Print functionality for Electron and browser
- **Exports**: `PrintService` (static class)
- **Dependencies**: BufferService, ElectronAPI types
- **Key Methods**:
  - `handlePrint()`: Main print function with environment detection
  - `handleElectronPrint()`: Native Electron print dialog
  - `handleBrowserPrint()`: Browser print with Hebrew support
  - `generatePrintHTML()`: HTML generation for browser print
- **Features**: Hebrew text support, RTL rendering, automatic environment detection

## 📁 `/src/hooks/`

### `usePDFOperations.ts`
- **Purpose**: Business logic wrapper with state integration
- **Exports**: `usePDFOperations` hook
- **Dependencies**: AppContext, all services, file dialog utilities
- **Returned Functions**:
  - File operations: `openFiles`, `saveFile`, `saveAsFile`
  - PDF operations: `rotatePage`, `addText`, `refreshDocument`
  - System integration: `printFile`, `showFileInFolder`
  - UI feedback: `showNotification`
- **Features**: Automatic error handling, state updates, notifications

### `usePdfDocument.ts` (existing)
- **Purpose**: PDF document loading and management
- **Exports**: `usePdfDocument` hook
- **Dependencies**: pdf.js library
- **Integration**: Works with new state management system
- **Usage**: PDF document object and page count

## 📁 `/src/components/ui/`

### `ToolButton.tsx`
- **Purpose**: Consistent toolbar button component
- **Exports**: `ToolButton` component
- **Dependencies**: Icon constants
- **Props**:
  - `icon`: IconName (typed)
  - `label`: string
  - `onClick`: function
  - `disabled`, `active`: boolean
  - `variant`: 'default' | 'primary' | 'secondary'
  - `size`: 'sm' | 'md' | 'lg'
- **Features**: Multiple variants, states, consistent styling

### `Notification.tsx`
- **Purpose**: Flying notification system
- **Exports**: `Notification` component
- **Props**:
  - `message`: string
  - `type`: 'success' | 'error' | 'warning' | 'info'
  - `onClose`: function
- **Features**: Auto-dismiss, type-based styling, close button

## 📁 `/src/components/toolbar/`

### `MainToolbar.tsx`
- **Purpose**: Main application toolbar for file operations
- **Exports**: `MainToolbar` component
- **Dependencies**: ToolButton
- **Props**: File operation callbacks, optional fileName
- **Features**: 
  - File operations: Open, Save, Save As, Print, Show in Folder
  - Conditional rendering based on file state
  - Center file name display

### `PDFToolsToolbar.tsx`
- **Purpose**: PDF editing tools toolbar
- **Exports**: `PDFToolsToolbar` component
- **Dependencies**: ToolButton
- **Props**: PDF operation callbacks
- **Features**:
  - Editing tools: Text, Highlight, Draw, Sign
  - Document tools: Rotate, Extract, OCR, Redact
  - Utility tools: Refresh
  - Logical grouping with separators

## 📁 `/src/components/viewer/`

### `PDFViewerNavigation.tsx`
- **Purpose**: PDF navigation and viewing controls
- **Exports**: `PDFViewerNavigation` component
- **Dependencies**: SearchBox component
- **Props**:
  - Navigation: pageIndex, pageCount, onPageChange
  - Viewing: zoom, onZoomChange, scrollMode toggle
  - Search: onSearch callback
  - Utility: scrollToPage function
- **Features**:
  - Page navigation with input and buttons
  - Zoom controls (fit width, fit page, zoom in/out)
  - Scroll mode toggle (page vs continuous)
  - Integrated search box
  - Fullscreen toggle

## 📁 `/src/constants/`

### `icons.tsx`
- **Purpose**: Centralized SVG icon definitions
- **Exports**: `IconSVGs` object, `IconName` type
- **Icons Available**:
  - Navigation: cursor, hand
  - Editing: text, marker, pen, signature
  - Operations: rotate, rotateLeft, rotateRight, refresh
  - Document: extract, ocr, redact
- **Features**: Type-safe icon references, consistent SVG styling

## 📁 `/src/types/`

### `electron.d.ts`
- **Purpose**: Electron API type definitions
- **Exports**: `ElectronAPI` interface, Window extension
- **API Methods**:
  - File operations: `openPdf`, `savePdf`, `readFileAsUint8Array`
  - System: `showInFolder`, `printPdf`
  - IPC: `ipcRenderer` methods
- **Usage**: Type safety for window.electronAPI calls

## 📁 `/src/lib/` (existing modules)

### `fileDialogs.ts`
- **Purpose**: File dialog utilities
- **Functions**: `openPdfFiles`, `savePdfFile`, `showInFolder`
- **Integration**: Used by usePDFOperations hook

### `pdfRender.ts`
- **Purpose**: PDF rendering utilities
- **Functions**: `renderPageToCanvas`, `extractTextRects`
- **Integration**: Used by PDF operations and search

### `pdfWrite.ts`
- **Purpose**: PDF manipulation utilities (pdf-lib wrappers)
- **Functions**: All pdf-lib operations
- **Integration**: Used by PDFOperationsService

### `types.ts`
- **Purpose**: Common type definitions
- **Types**: `OpenedFile` interface
- **Usage**: Shared across all modules

### `ocr.ts`, `redact.ts`, `signature.ts`
- **Purpose**: Specialized PDF operations
- **Status**: Existing functionality, needs integration with new architecture

## 📁 Main Application Files

### `AppNew.tsx`
- **Purpose**: New main application component
- **Dependencies**: All contexts, toolbar components, hooks
- **Structure**:
  - AppProvider wrapper
  - Toolbar components
  - PDF viewer area
  - Dialog system
  - Notification system
- **Features**: Keyboard shortcuts, responsive layout, error boundaries

### `App.tsx` (original)
- **Purpose**: Original monolithic component (1910 lines)
- **Status**: To be replaced by AppNew.tsx
- **Contains**: All functionality that's being extracted to new modules

## 🔗 Module Dependencies Graph

```
AppNew.tsx
├── AppContext (contexts)
├── usePDFOperations (hooks)
│   ├── PDFOperationsService (services)
│   │   └── BufferService (services)
│   ├── PrintService (services)
│   │   └── BufferService (services)
│   └── fileDialogs (lib)
├── MainToolbar (components/toolbar)
│   └── ToolButton (components/ui)
├── PDFToolsToolbar (components/toolbar)
│   └── ToolButton (components/ui)
├── PDFViewerNavigation (components/viewer)
│   └── SearchBox (components - legacy)
├── Notification (components/ui)
└── Sidebar (components - legacy)
```

## 📊 Module Completion Status

| Module Category | Completed | Total | Percentage |
|----------------|-----------|-------|------------|
| State Management | 1 | 1 | 100% |
| Services | 3 | 3 | 100% |
| Hooks | 1 | 2 | 50% |
| UI Components | 2 | 4 | 50% |
| Toolbar Components | 2 | 2 | 100% |
| Viewer Components | 1 | 3 | 33% |
| Dialog Components | 0 | 4 | 0% |
| Constants | 1 | 1 | 100% |

## 🎯 Usage Examples

### Basic Component Usage
```typescript
// Using toolbar components
<MainToolbar 
  onOpen={operations.openFiles}
  onSave={operations.saveFile}
  fileName={state.file?.name}
/>

// Using UI components
<ToolButton 
  icon="rotate" 
  label="Rotate Right" 
  onClick={() => operations.rotatePage(90)}
/>

// Using notification
{state.notification && (
  <Notification message={state.notification} />
)}
```

### Service Usage
```typescript
// PDF operations
const result = await PDFOperationsService.rotatePage(
  buffers, file, pageIndex, 90
);

// Buffer management
const safeBuffer = BufferService.getWorkingBuffer(buffers, file);

// Print service
await PrintService.handlePrint(buffers, file, showNotification);
```

### Hook Usage
```typescript
// Operations hook
const operations = usePDFOperations();
await operations.rotatePage(90);

// Context hook
const { state, dispatch } = useAppContext();
dispatch({ type: 'SET_PAGE_INDEX', payload: 5 });
```

This module index provides a complete reference for understanding and working with the new PDFusion architecture.
