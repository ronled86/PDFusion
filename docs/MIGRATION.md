# PDFusion Migration Guide

## 🎯 Overview

This guide documents the migration from the monolithic `App.tsx` (1910 lines) to the new modular architecture. Use this as a reference for completing the transition and understanding what has changed.

## 📊 Migration Status

### ✅ Completed Modules

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| State Management | ✅ Complete | `/contexts/AppContext.tsx` | React Context + useReducer |
| Buffer Management | ✅ Complete | `/services/BufferService.ts` | Handles ArrayBuffer detachment |
| PDF Operations | ✅ Complete | `/services/PDFOperationsService.ts` | All PDF manipulations |
| Print Service | ✅ Complete | `/services/PrintService.ts` | Electron + Browser support |
| Main Operations Hook | ✅ Complete | `/hooks/usePDFOperations.ts` | Business logic wrapper |
| UI Components | ✅ Complete | `/components/ui/` | ToolButton, Notification |
| Toolbar Components | ✅ Complete | `/components/toolbar/` | MainToolbar, PDFToolsToolbar |
| Navigation Component | ✅ Complete | `/components/viewer/PDFViewerNavigation.tsx` | Page controls, zoom, search |
| Icons & Constants | ✅ Complete | `/constants/icons.tsx` | SVG icon definitions |
| Main App Structure | ✅ Complete | `/AppNew.tsx` | New app entry point |

### 🔄 In Progress / Remaining

| Component | Status | Priority | Estimated Effort |
|-----------|--------|----------|------------------|
| Dialog Components | 🔄 Partial | High | 2-3 hours |
| PDF Viewer/Canvas | 🔄 Needs Extract | High | 4-6 hours |
| Search Functionality | 🔄 Needs Extract | Medium | 2-3 hours |
| OCR Integration | ❌ Not Started | Medium | 3-4 hours |
| Signature Feature | ❌ Not Started | Medium | 4-5 hours |
| Advanced Merge | ❌ Not Started | Low | 3-4 hours |
| Settings/Preferences | ❌ Not Started | Low | 2-3 hours |

## 🗺️ Code Mapping: Old vs New

### State Management
**Old Approach:**
```typescript
// In App.tsx - Multiple useState hooks
const [file, setFile] = useState<OpenedFile | undefined>(undefined);
const [buffers, setBuffers] = useState<Uint8Array | null>(null);
const [pageIndex, setPageIndex] = useState(0);
const [zoom, setZoom] = useState(1);
// ... 15+ more state variables
```

**New Approach:**
```typescript
// In AppContext.tsx - Centralized state
const { state, dispatch } = useAppContext();
dispatch({ type: 'SET_PAGE_INDEX', payload: 5 });
dispatch({ type: 'SET_ZOOM', payload: 1.5 });
```

### PDF Operations
**Old Approach:**
```typescript
// In App.tsx - Inline operation logic
const onRotate = async (degrees: number = 90) => {
  // 50+ lines of buffer management and error handling
  const workingData = getWorkingBuffer();
  const out = await rotatePage(workingData, pageIndex, degrees);
  setBuffers(out);
  // ... more state updates
};
```

**New Approach:**
```typescript
// In usePDFOperations.ts - Clean hook interface
const operations = usePDFOperations();
await operations.rotatePage(90); // All complexity handled internally
```

### UI Components
**Old Approach:**
```typescript
// In App.tsx - Inline component definitions
const ToolButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="...">
    <svg>{IconSVGs[icon]}</svg>
    <span>{label}</span>
  </button>
);
```

**New Approach:**
```typescript
// In /components/ui/ToolButton.tsx - Reusable component
<ToolButton 
  icon="rotate" 
  label="Rotate Right" 
  onClick={() => operations.rotatePage(90)}
  variant="primary"
/>
```

## 📋 Step-by-Step Migration Plan

### Phase 1: Complete Dialog Components (HIGH PRIORITY)

**Remaining Dialogs to Extract:**
1. **HighlightDialog** - Extract from old App.tsx lines 1760-1790
2. **RedactDialog** - Extract from old App.tsx lines 1790-1820
3. **MergeDialog** - New sophisticated merge interface

**Template for Dialog Components:**
```typescript
// /components/dialogs/TextDialog.tsx
interface TextDialogProps {
  isOpen: boolean;
  textInput: string;
  onTextChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TextDialog: React.FC<TextDialogProps> = ({
  isOpen, textInput, onTextChange, onConfirm, onCancel
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Dialog content */}
    </div>
  );
};
```

### Phase 2: Extract PDF Viewer Logic (HIGH PRIORITY)

**Components to Create:**
1. **PDFCanvas** - Extract canvas rendering logic
2. **PagePortal** - Extract from old App.tsx lines 1840+
3. **InkDrawing** - Extract drawing functionality

**Key Functions to Extract:**
- `renderPageToCanvas()` - Already in `/lib/pdfRender.ts`
- Canvas event handlers (mouse, wheel)
- Page navigation logic
- Zoom functionality

### Phase 3: Search and Navigation (MEDIUM PRIORITY)

**Components to Enhance:**
1. Update `SearchBox` component integration
2. Extract search highlighting logic
3. Improve keyboard navigation

### Phase 4: Advanced Features (LOW PRIORITY)

1. OCR integration with progress tracking
2. Digital signature workflows
3. Advanced merge with preview
4. Settings and preferences

## 🔧 Technical Migration Details

### Buffer Management Changes

**Old Pattern (Problematic):**
```typescript
// Direct buffer usage - prone to detachment
const workingData = buffers;
const result = await someOperation(workingData);
setBuffers(result);
```

**New Pattern (Safe):**
```typescript
// Service handles all buffer safety
const result = await PDFOperationsService.someOperation(
  state.buffers, state.file, /* params */
);
dispatch({ type: 'SET_BUFFERS', payload: result });
```

### Error Handling Improvements

**Old Pattern:**
```typescript
try {
  // operation
} catch (error) {
  alert("Error: " + error.message); // Poor UX
}
```

**New Pattern:**
```typescript
try {
  // operation
} catch (error) {
  console.error("Operation failed:", error);
  showNotification("User-friendly error message"); // Better UX
}
```

### State Update Patterns

**Old Pattern:**
```typescript
// Multiple setState calls
setFile(newFile);
setBuffers(newBuffer);
setPageIndex(0);
setIsFirstLoad(true);
```

**New Pattern:**
```typescript
// Batched updates through context
React.startTransition(() => {
  dispatch({ type: 'SET_FILE', payload: newFile });
  dispatch({ type: 'SET_BUFFERS', payload: newBuffer });
  dispatch({ type: 'SET_PAGE_INDEX', payload: 0 });
  dispatch({ type: 'SET_FIRST_LOAD', payload: true });
});
```

## 🚀 Activation Steps

### Step 1: Backup Current Implementation
```bash
# Create backup of current App.tsx
cp src/App.tsx src/App.old.tsx
```

### Step 2: Switch to New Architecture
```bash
# Replace App.tsx with new implementation
cp src/AppNew.tsx src/App.tsx
```

### Step 3: Update Imports
Update any external imports that reference the old App structure.

### Step 4: Test Core Functionality
- File opening/loading
- Basic PDF operations (rotate, text)
- Print functionality
- Error handling

### Step 5: Incremental Migration
Add remaining components one by one, testing after each addition.

## 🧪 Testing Strategy

### Unit Tests to Add
1. **BufferService** tests - Verify safe buffer handling
2. **PDFOperationsService** tests - Mock PDF-lib operations
3. **Component** tests - React Testing Library
4. **Hook** tests - Custom hook testing

### Integration Tests
1. **Complete workflows** - Open → Edit → Save
2. **Error scenarios** - Network failures, corrupted files
3. **Cross-platform** - Electron vs Browser differences

## ⚠️ Breaking Changes

### API Changes
- State access now requires `useAppContext()` hook
- Direct buffer access replaced with service calls
- Component props simplified with new interfaces

### File Structure Changes
- Components moved to organized subdirectories
- New service layer introduced
- Constants extracted to separate files

### Dependency Changes
- No new external dependencies added
- Better TypeScript strict mode compliance
- Improved tree-shaking potential

## 📈 Benefits After Migration

### Development Experience
- **Faster development** - Reusable components
- **Better debugging** - Clearer error boundaries
- **Easier testing** - Isolated functionality
- **Team collaboration** - Modular codebase

### Performance Improvements
- **Reduced re-renders** - Better state management
- **Code splitting** - Lazy loading potential
- **Memory efficiency** - Better buffer management

### Maintainability
- **Single responsibility** - Each file has one purpose
- **Loose coupling** - Components don't directly depend on each other
- **High cohesion** - Related functionality grouped together

## 🎯 Next Steps

1. **Complete Phase 1** - Finish dialog components
2. **Test thoroughly** - Ensure no regressions
3. **Add missing features** - OCR, signature, advanced merge
4. **Performance optimization** - Virtual scrolling, web workers
5. **Documentation** - Update user documentation

This migration guide provides a roadmap for completing the architectural transition and maintaining the new codebase going forward.
