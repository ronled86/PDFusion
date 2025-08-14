# PDFusion Architecture Documentation

## 📋 Overview

PDFusion is a React + TypeScript PDF editing application that runs in both Electron (desktop) and browser environments. The application was refactored from a monolithic 1910-line `App.tsx` into a modular, maintainable architecture.

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **UI Components**: Pure presentation components
- **Business Logic**: Encapsulated in services and custom hooks
- **State Management**: Centralized with React Context + useReducer
- **Type Safety**: Full TypeScript coverage with proper interfaces

### 2. **Modularity**
- Each feature is self-contained
- Components are reusable and composable
- Services are testable and interchangeable

### 3. **Error Handling**
- Consistent error boundaries
- User-friendly notifications
- Graceful degradation for browser vs Electron features

## 📁 Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── dialogs/        # Modal dialogs
│   ├── toolbar/        # Toolbar components
│   ├── viewer/         # PDF viewer components
│   └── legacy/         # Existing components (Sidebar, SearchBox)
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── lib/                # External library wrappers
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── utils/              # Pure utility functions
└── styles/             # CSS and styling
```

## 🔧 Core Architecture Components

### State Management (`/contexts`)

#### **AppContext.tsx**
- **Purpose**: Centralized application state using React Context + useReducer
- **Responsibilities**:
  - File state management (current file, buffers)
  - UI state (page index, zoom, scroll mode)
  - Dialog visibility states
  - Form input states
  - Notification system

```typescript
interface AppState {
  // File state
  file: OpenedFile | undefined;
  buffers: Uint8Array | null;
  cachedBuffer: Uint8Array | null;
  
  // UI state
  pageIndex: number;
  zoom: number;
  scrollMode: 'page' | 'continuous';
  
  // Dialog states
  showTextDialog: boolean;
  showHighlightDialog: boolean;
  // ... etc
}
```

### Services Layer (`/services`)

#### **BufferService.ts**
- **Purpose**: Handle PDF buffer management and memory safety
- **Key Functions**:
  - `createSafeBuffer()`: Create detachment-safe buffer copies
  - `getWorkingBuffer()`: Get valid buffer handling detachment
  - `isBufferValid()`: Validate buffer accessibility
- **Why Important**: PDF-lib operations can detach ArrayBuffers, this service prevents crashes

#### **PDFOperationsService.ts**
- **Purpose**: Encapsulate all PDF manipulation operations
- **Key Functions**:
  - `rotatePage()`: Page rotation with state preservation
  - `addInkStroke()`: Drawing functionality
  - `addText()`: Text insertion
  - `highlightText()`: Text highlighting
  - `mergePDFs()`: Document merging with position control
- **Error Handling**: Consistent error wrapping and user notifications

#### **PrintService.ts**
- **Purpose**: Handle printing in both Electron and browser environments
- **Features**:
  - Native Electron print dialog integration
  - Browser-based print preview with Hebrew text support
  - Automatic environment detection
- **Hebrew Support**: Proper RTL text rendering and Unicode handling

### Custom Hooks (`/hooks`)

#### **usePDFOperations.ts**
- **Purpose**: Encapsulate all PDF operations with state management
- **Benefits**:
  - Consistent error handling across all operations
  - Automatic notification system integration
  - State updates tied to operations
- **Usage**: Single hook providing all PDF functionality to components

#### **usePdfDocument.ts** (existing)
- **Purpose**: PDF document loading and management
- **Integration**: Works with new state management system

### UI Components (`/components`)

#### **UI Components (`/ui`)**

**ToolButton.tsx**
- **Purpose**: Consistent toolbar button component
- **Features**: Multiple variants, sizes, states (active, disabled)
- **Props**: Icon, label, onClick, variant, size, active, disabled

**Notification.tsx**
- **Purpose**: Flying notification system
- **Features**: Auto-dismiss, multiple types (success, error, warning, info)
- **Usage**: Integrated with global notification state

#### **Toolbar Components (`/toolbar`)**

**MainToolbar.tsx**
- **Purpose**: Main application toolbar (file operations)
- **Features**: Open, Save, Save As, Print, Show in Folder
- **Responsive**: Shows different controls based on file state

**PDFToolsToolbar.tsx**
- **Purpose**: PDF editing tools toolbar
- **Features**: Text, Highlight, Draw, Sign, Rotate, Extract, OCR, Redact
- **Organization**: Logical grouping with separators

#### **Viewer Components (`/viewer`)**

**PDFViewerNavigation.tsx**
- **Purpose**: PDF navigation controls
- **Features**: Page navigation, zoom controls, search, scroll mode toggle
- **Integration**: Works with viewer state and search functionality

### Constants (`/constants`)

#### **icons.tsx**
- **Purpose**: Centralized SVG icon definitions
- **Benefits**: 
  - Type-safe icon references
  - Easy icon updates
  - Consistent styling
- **Usage**: Imported by ToolButton and other components

## 🔄 Data Flow Architecture

### 1. **State Updates**
```
User Action → Hook Function → Service Call → State Dispatch → UI Update
```

### 2. **PDF Operations Flow**
```
Component → usePDFOperations → PDFOperationsService → BufferService → State Update
```

### 3. **Error Handling Flow**
```
Service Error → Hook Catch → showNotification → AppContext → Notification Component
```

## 🔧 Integration Points

### **Electron Integration**
- **Type Definitions**: `src/types/electron.d.ts`
- **API Access**: `window.electronAPI` with proper null checking
- **Features**: Native file dialogs, print, file system access

### **Browser Fallbacks**
- **File Operations**: Download instead of save
- **Print**: HTML print preview instead of native dialog
- **Notifications**: In-app instead of system notifications

### **PDF-lib Integration**
- **Wrapper Services**: All PDF-lib calls go through services
- **Buffer Management**: Safe buffer handling prevents detachment issues
- **Error Handling**: PDF-lib errors converted to user-friendly messages

## 📝 Migration Strategy

### **Completed Components**
✅ State management (AppContext)
✅ Buffer management (BufferService)
✅ PDF operations (PDFOperationsService)
✅ Print functionality (PrintService)
✅ UI components (ToolButton, Notification)
✅ Toolbar components (MainToolbar, PDFToolsToolbar)
✅ Navigation component (PDFViewerNavigation)
✅ Main app structure (AppNew.tsx)

### **Remaining Work**
🔄 Dialog components (TextDialog, HighlightDialog, etc.)
🔄 PDF viewer/canvas rendering
🔄 Search functionality
🔄 OCR integration
🔄 Signature functionality
🔄 Advanced merge dialog
🔄 Settings/preferences

### **Legacy Components**
- `Sidebar.tsx`: Page thumbnails (keep as-is, works with new state)
- `SearchBox.tsx`: Search input (keep as-is, integrate with new search)
- `ThumbnailStrip.tsx`: Thumbnail navigation (evaluate for removal)
- `Toolbar.tsx`: Old toolbar (replace with new toolbar components)

## 🚀 Benefits of New Architecture

### **Developer Experience**
- **IntelliSense**: Full TypeScript support with proper types
- **Debugging**: Easier to trace issues through modular components
- **Testing**: Each service/component can be unit tested
- **Documentation**: Self-documenting code with proper interfaces

### **Maintainability**
- **Single Responsibility**: Each file has one clear purpose
- **Loose Coupling**: Components don't directly depend on each other
- **High Cohesion**: Related functionality is grouped together

### **Performance**
- **Code Splitting**: Components can be lazy-loaded
- **Memoization**: Easier to implement React.memo optimizations
- **State Updates**: More targeted re-renders

### **Scalability**
- **Feature Addition**: New features don't affect existing code
- **Refactoring**: Individual pieces can be updated independently
- **Team Development**: Multiple developers can work on different areas

## 🔍 Key Technical Decisions

### **Why React Context over Redux?**
- **Simplicity**: Less boilerplate for this application size
- **TypeScript**: Better type inference with React Context
- **Bundle Size**: No additional dependencies

### **Why Services Pattern?**
- **Testability**: Pure functions easier to test
- **Reusability**: Services can be used across components
- **Error Handling**: Centralized error management

### **Why Custom Hooks?**
- **Logic Reuse**: Share complex logic between components
- **State Integration**: Seamless integration with React state
- **Component Simplification**: Keep components focused on rendering

## 📋 Development Guidelines

### **Adding New Features**
1. **Define Types**: Start with TypeScript interfaces
2. **Create Service**: Add business logic to appropriate service
3. **Update State**: Add necessary state to AppContext if needed
4. **Create Hook**: Wrap service calls in custom hook
5. **Build Component**: Create UI component using hook
6. **Add Integration**: Wire up to main app

### **Error Handling Standards**
- **Service Level**: Catch and wrap errors with context
- **Hook Level**: Convert to user-friendly messages
- **Component Level**: Display notifications, handle loading states

### **Testing Strategy**
- **Services**: Unit tests for all business logic
- **Hooks**: Test custom hooks with React Testing Library
- **Components**: Test component rendering and interactions
- **Integration**: Test complete user workflows

## 🎯 Future Roadmap

### **Phase 1**: Complete Current Refactor
- Finish dialog components
- Complete PDF viewer integration
- Replace old App.tsx

### **Phase 2**: Advanced Features
- Sophisticated merge dialog with preview
- Enhanced OCR with progress tracking
- Digital signature with certificate management
- Batch operations

### **Phase 3**: Performance & UX
- Virtual scrolling for large documents
- Web Workers for heavy operations
- Improved keyboard shortcuts
- Accessibility improvements

This architecture provides a solid foundation for continued development and maintenance of the PDFusion application.
