# PDFusion API Reference

## 📚 Table of Contents
- [State Management](#state-management)
- [Services](#services)
- [Hooks](#hooks)
- [Components](#components)
- [Types](#types)

## 🏪 State Management

### AppContext

#### State Interface
```typescript
interface AppState {
  // File Management
  file: OpenedFile | undefined;
  buffers: Uint8Array | null;
  cachedBuffer: Uint8Array | null;
  
  // Navigation
  pageIndex: number;
  zoom: number;
  isFirstLoad: boolean;
  viewerDimensions: { width: number; height: number };
  scrollMode: 'page' | 'continuous';
  
  // Dialog States
  showTextDialog: boolean;
  showHighlightDialog: boolean;
  showRedactDialog: boolean;
  showMergeDialog: boolean;
  
  // Form Inputs
  textInput: string;
  highlightInput: string;
  redactInput: string;
  mergeFiles: OpenedFile[];
  mergePosition: 'before' | 'after' | 'replace';
  
  // UI Feedback
  notification: string | null;
}
```

#### Actions
```typescript
type AppAction = 
  | { type: 'SET_FILE'; payload: OpenedFile | undefined }
  | { type: 'SET_BUFFERS'; payload: Uint8Array | null }
  | { type: 'SET_CACHED_BUFFER'; payload: Uint8Array | null }
  | { type: 'SET_PAGE_INDEX'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_VIEWER_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_SCROLL_MODE'; payload: 'page' | 'continuous' }
  | { type: 'SET_NOTIFICATION'; payload: string | null }
  | { type: 'RESET_DIALOGS' }
  // ... dialog actions
```

#### Usage
```typescript
const { state, dispatch } = useAppContext();

// Update page
dispatch({ type: 'SET_PAGE_INDEX', payload: 5 });

// Show notification
dispatch({ type: 'SET_NOTIFICATION', payload: 'Operation completed' });
```

## 🔧 Services

### BufferService

#### Static Methods

**`createSafeBuffer(source: Uint8Array): Uint8Array`**
- Creates a detachment-safe copy of a buffer
- **Throws**: Error if source buffer is corrupted
- **Usage**: Always use when creating buffer copies

**`getWorkingBuffer(buffers: Uint8Array | null, file: OpenedFile | undefined): Uint8Array | null`**
- Returns a valid working buffer, handling detachment
- **Returns**: Valid buffer or null if all buffers are detached
- **Usage**: Use before any PDF operations

**`isBufferValid(buffer: Uint8Array | null): boolean`**
- Checks if a buffer is accessible (not detached)
- **Returns**: true if buffer can be used safely

**`createSafeUpdate(newBuffer: Uint8Array): Uint8Array`**
- Creates safe copy and updates internal cache
- **Returns**: Safe buffer copy
- **Usage**: Use when updating application state

### PDFOperationsService

#### Static Methods

**`rotatePage(buffers, file, pageIndex, degrees): Promise<Uint8Array>`**
- Rotates a specific page by given degrees
- **Parameters**:
  - `buffers`: Current PDF buffer
  - `file`: File metadata
  - `pageIndex`: Zero-based page index
  - `degrees`: Rotation angle (90, -90, 180)
- **Returns**: New PDF buffer with rotated page
- **Throws**: Error with user-friendly message

**`addInkStroke(buffers, file, pageIndex, points, lineWidth): Promise<Uint8Array>`**
- Adds ink drawing to a page
- **Parameters**:
  - `points`: Array of {x, y} coordinates
  - `lineWidth`: Stroke width in points
- **Returns**: Updated PDF buffer

**`addText(buffers, file, pageIndex, text): Promise<Uint8Array>`**
- Adds text box to a page
- **Position**: Fixed at (100, 100) - TODO: make configurable
- **Returns**: Updated PDF buffer

**`highlightText(buffers, file, pdf, pageIndex, searchText): Promise<Uint8Array>`**
- Highlights all instances of text on a page
- **Parameters**:
  - `pdf`: PDF-js document object
  - `searchText`: Text to find and highlight
- **Throws**: Error if text not found

**`mergePDFs(mainBuffer, file, mergeFiles, position): Promise<Uint8Array>`**
- Merges multiple PDF files
- **Parameters**:
  - `mergeFiles`: Array of files to merge
  - `position`: 'before' | 'after' | 'replace'
- **Returns**: Merged PDF buffer

### PrintService

#### Static Methods

**`handlePrint(buffers, file, showNotification): Promise<void>`**
- Main print function supporting both environments
- **Electron**: Uses native print dialog
- **Browser**: Creates print preview with Hebrew support
- **Parameters**:
  - `showNotification`: Callback for user feedback

**`handleElectronPrint(printBuffer, fileName, showNotification): Promise<void>`**
- Electron-specific print implementation
- **Uses**: window.electronAPI.printPdf()

**`handleBrowserPrint(printBuffer, fileName, showNotification): Promise<void>`**
- Browser-specific print with preview window
- **Features**: Hebrew text support, RTL rendering

## 🪝 Hooks

### usePDFOperations

#### Returned Functions

**`openFiles(): Promise<void>`**
- Opens file dialog and loads selected PDF
- **Updates**: file, buffers, pageIndex, firstLoad states
- **Notifications**: Success/error feedback

**`saveFile(): Promise<void>`**
- Saves current document (Electron only)
- **Fallback**: Shows message for browser mode

**`saveAsFile(): Promise<void>`**
- Save As dialog (Electron) or download (Browser)
- **Filename**: Auto-generated with timestamp

**`printFile(): Promise<void>`**
- Delegates to PrintService.handlePrint()

**`showFileInFolder(): Promise<void>`**
- Shows file in system file manager (Electron only)

**`rotatePage(degrees: number): Promise<void>`**
- Rotates current page and updates state
- **Default**: 90 degrees clockwise

**`addText(text: string): Promise<void>`**
- Adds text to current page and updates state

**`refreshDocument(): Promise<void>`**
- Reloads document from file system (Electron only)
- **Preserves**: Current page position

**`showNotification(message: string): void`**
- Shows temporary notification (3 seconds)

## 🧩 Components

### UI Components

#### ToolButton

```typescript
interface ToolButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage**:
```tsx
<ToolButton 
  icon="rotate" 
  label="Rotate Right" 
  onClick={() => rotatePage(90)}
  variant="primary"
/>
```

#### Notification

```typescript
interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}
```

**Usage**:
```tsx
<Notification 
  message="File saved successfully" 
  type="success"
  onClose={() => setNotification(null)}
/>
```

### Toolbar Components

#### MainToolbar

```typescript
interface MainToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onPrint: () => void;
  onShowInFolder: () => void;
  fileName?: string;
}
```

#### PDFToolsToolbar

```typescript
interface PDFToolsToolbarProps {
  onAddText: () => void;
  onHighlight: () => void;
  onSign: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onExtract: () => void;
  onOCR: () => void;
  onRedact: () => void;
  onRefresh: () => void;
}
```

### Viewer Components

#### PDFViewerNavigation

```typescript
interface PDFViewerNavigationProps {
  pageIndex: number;
  pageCount: number;
  zoom: number;
  scrollMode: 'page' | 'continuous';
  onPageChange: (index: number) => void;
  onZoomChange: (zoom: number) => void;
  onScrollModeChange: (mode: 'page' | 'continuous') => void;
  onSearch: (query: string) => void;
  scrollToPage: (index: number) => void;
}
```

## 📋 Types

### Core Types

```typescript
interface OpenedFile {
  name: string;
  path: string;
  data: Uint8Array;
}

type IconName = 
  | 'cursor' | 'hand' | 'text' | 'marker' | 'pen' 
  | 'signature' | 'rotate' | 'rotateLeft' | 'rotateRight'
  | 'refresh' | 'extract' | 'ocr' | 'redact';

interface ElectronAPI {
  openPdf: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  savePdf: (name: string, data: Uint8Array) => Promise<{ canceled: boolean; filePath?: string }>;
  showInFolder: (path: string) => Promise<void>;
  printPdf: (data: Uint8Array, filename: string) => Promise<boolean>;
  readFileAsUint8Array: (filePath: string) => Promise<Uint8Array>;
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => void;
    removeListener: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
}
```

## 🚨 Error Handling

### Service Layer Errors
- All services throw Error objects with user-friendly messages
- Buffer-related errors are caught and handled gracefully
- PDF-lib errors are wrapped with context

### Hook Layer Error Handling
```typescript
try {
  const result = await PDFOperationsService.rotatePage(/* ... */);
  // Update state with result
} catch (error) {
  console.error("Error rotating page:", error);
  showNotification("Error rotating page: " + error.message);
}
```

### Component Error Boundaries
- Consider implementing React Error Boundaries for component-level errors
- Notification system provides user feedback for all errors

## 📖 Usage Examples

### Basic PDF Operations
```typescript
const operations = usePDFOperations();

// Open file
await operations.openFiles();

// Rotate current page
await operations.rotatePage(90);

// Add text
await operations.addText("Hello World");

// Save file
await operations.saveAsFile();
```

### State Management
```typescript
const { state, dispatch } = useAppContext();

// Navigate to page 5
dispatch({ type: 'SET_PAGE_INDEX', payload: 4 });

// Show text dialog
dispatch({ type: 'SET_TEXT_DIALOG', payload: true });

// Update zoom level
dispatch({ type: 'SET_ZOOM', payload: 1.5 });
```

### Custom Components
```typescript
const MyComponent = () => {
  const { state } = useAppContext();
  const operations = usePDFOperations();
  
  return (
    <div>
      <h1>Current File: {state.file?.name}</h1>
      <p>Page: {state.pageIndex + 1}</p>
      <ToolButton 
        icon="rotate" 
        label="Rotate" 
        onClick={() => operations.rotatePage(90)} 
      />
    </div>
  );
};
```

This API reference provides the complete interface for working with the new PDFusion architecture.
