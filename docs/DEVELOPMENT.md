# PDFusion Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
git clone <repository-url>
cd PDFusion
npm install
npm run dev  # Start development server
npm run electron:dev  # Start Electron development
```

## 🏗️ Project Structure

```
PDFusion/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── dialogs/        # Modal dialogs
│   │   ├── toolbar/        # Toolbar components
│   │   └── viewer/         # PDF viewer components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic
│   ├── lib/                # External library wrappers
│   ├── types/              # TypeScript definitions
│   ├── constants/          # App constants
│   └── utils/              # Utility functions
├── electron/               # Electron main process
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # Architecture overview
│   ├── API.md             # API reference
│   └── MIGRATION.md       # Migration guide
└── README.md
```

## 🧩 Architecture Overview

### State Management
- **React Context + useReducer** for centralized state
- **Custom hooks** for business logic encapsulation
- **Service layer** for PDF operations

### Component Hierarchy
```
App (AppProvider)
├── MainToolbar
├── PDFToolsToolbar  
├── PDFViewerNavigation
├── MainContent
│   ├── Sidebar (thumbnails)
│   └── PDFViewer
└── Dialogs + Notifications
```

## 📝 Development Workflow

### Adding New Features

1. **Define the Feature**
   ```typescript
   // Add types to contexts/AppContext.tsx if needed
   interface AppState {
     // ... existing state
     newFeatureState: boolean;
   }
   ```

2. **Create Service Logic**
   ```typescript
   // services/NewFeatureService.ts
   export class NewFeatureService {
     static async performOperation(params): Promise<result> {
       // Business logic here
     }
   }
   ```

3. **Add Hook Integration**
   ```typescript
   // hooks/useNewFeature.ts or extend usePDFOperations.ts
   export const useNewFeature = () => {
     const { state, dispatch } = useAppContext();
     
     const performAction = useCallback(async () => {
       try {
         const result = await NewFeatureService.performOperation();
         // Update state
       } catch (error) {
         showNotification(error.message);
       }
     }, []);
     
     return { performAction };
   };
   ```

4. **Create UI Components**
   ```typescript
   // components/feature/NewFeatureComponent.tsx
   export const NewFeatureComponent: React.FC<Props> = ({ ... }) => {
     const { performAction } = useNewFeature();
     
     return (
       <ToolButton 
         icon="newIcon" 
         label="New Feature" 
         onClick={performAction} 
       />
     );
   };
   ```

5. **Integrate with Main App**
   ```typescript
   // Update App.tsx to include new component
   ```

### Testing Guidelines

#### Unit Tests
```typescript
// __tests__/services/NewFeatureService.test.ts
describe('NewFeatureService', () => {
  test('should perform operation successfully', async () => {
    const result = await NewFeatureService.performOperation(testParams);
    expect(result).toBeDefined();
  });
});
```

#### Component Tests
```typescript
// __tests__/components/NewFeature.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { NewFeatureComponent } from '../components/feature/NewFeatureComponent';

test('renders and handles click', () => {
  const { getByText } = render(<NewFeatureComponent />);
  fireEvent.click(getByText('New Feature'));
  // Assert expected behavior
});
```

## 🔧 Common Development Tasks

### Adding New PDF Operations

1. **Add to PDFOperationsService**
   ```typescript
   // services/PDFOperationsService.ts
   static async newOperation(
     buffers: Uint8Array | null,
     file: OpenedFile | undefined,
     // ... parameters
   ): Promise<Uint8Array> {
     const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
     if (!workingBuffer) {
       throw new Error("No working buffer available");
     }
     
     try {
       const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
       const result = await pdfLibOperation(freshBuffer, /* params */);
       return BufferService.createSafeBuffer(result);
     } catch (error) {
       console.error("Error in new operation:", error);
       throw error;
     }
   }
   ```

2. **Add to usePDFOperations hook**
   ```typescript
   // hooks/usePDFOperations.ts
   const performNewOperation = useCallback(async (params) => {
     try {
       const result = await PDFOperationsService.newOperation(
         state.buffers, state.file, params
       );
       dispatch({ type: 'SET_BUFFERS', payload: result });
       dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
       showNotification("Operation completed successfully");
     } catch (error) {
       console.error("Error in operation:", error);
       showNotification("Error: " + error.message);
     }
   }, [state.buffers, state.file, dispatch, showNotification]);
   ```

### Adding New UI Components

1. **Create component file**
   ```typescript
   // components/ui/NewComponent.tsx
   interface NewComponentProps {
     // Define props
   }
   
   export const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
     return <div>Component content</div>;
   };
   ```

2. **Add to export index** (if using barrel exports)
   ```typescript
   // components/ui/index.ts
   export { NewComponent } from './NewComponent';
   ```

### Working with State

#### Reading State
```typescript
const { state } = useAppContext();
const currentPage = state.pageIndex;
const isFileLoaded = !!state.file;
```

#### Updating State
```typescript
const { dispatch } = useAppContext();

// Single update
dispatch({ type: 'SET_PAGE_INDEX', payload: 5 });

// Multiple updates (batched)
React.startTransition(() => {
  dispatch({ type: 'SET_PAGE_INDEX', payload: 0 });
  dispatch({ type: 'SET_ZOOM', payload: 1.0 });
});
```

### Error Handling Patterns

#### Service Level
```typescript
try {
  const result = await performOperation();
  return result;
} catch (error) {
  console.error("Service error:", error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

#### Hook Level
```typescript
try {
  await serviceOperation();
  showNotification("Success message");
} catch (error) {
  console.error("Hook error:", error);
  showNotification("User-friendly error message");
}
```

#### Component Level
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    await operation();
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

## 🎨 Styling Guidelines

### Tailwind Classes Organization
```typescript
// Group classes logically
const buttonClasses = `
  // Layout
  flex items-center space-x-2 px-4 py-2
  // Appearance  
  bg-blue-600 text-white rounded-lg
  // States
  hover:bg-blue-700 disabled:opacity-50
  // Transitions
  transition-colors
`;
```

### Component Variants
```typescript
const variants = {
  default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  danger: "bg-red-600 text-white hover:bg-red-700"
};
```

## 🐛 Debugging Tips

### Common Issues

1. **Buffer Detachment Errors**
   ```typescript
   // Always use BufferService for buffer operations
   const safeBuffer = BufferService.getWorkingBuffer(buffers, file);
   if (!safeBuffer) {
     console.error("No valid buffer available");
     return;
   }
   ```

2. **State Not Updating**
   ```typescript
   // Use React DevTools to inspect context state
   // Ensure dispatch calls are correct
   dispatch({ type: 'SET_PAGE_INDEX', payload: newIndex });
   ```

3. **PDF-lib Operations Failing**
   ```typescript
   // Always wrap in try-catch
   // Check buffer validity first
   // Use fresh buffer copies
   ```

### Debug Tools
- **React DevTools** - Component state inspection
- **Redux DevTools** - State changes (if using Redux)
- **Console logging** - Service and hook debugging
- **TypeScript compiler** - Type checking errors

## 📦 Build and Deployment

### Development Build
```bash
npm run dev          # Vite dev server
npm run electron:dev # Electron development
```

### Production Build
```bash
npm run build        # Build for production
npm run electron:build # Package Electron app
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🔄 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes  
- `refactor/component-name` - Code refactoring
- `docs/update-description` - Documentation updates

### Commit Messages
```
type(scope): description

feat(pdf-operations): add page extraction functionality
fix(buffer-service): handle detached buffers gracefully
refactor(components): extract dialog components
docs(api): update service documentation
```

## 📚 Resources

### External Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PDF-lib Documentation](https://pdf-lib.js.org/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Internal Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Migration Guide](./MIGRATION.md)

This development guide provides everything needed to work effectively with the PDFusion codebase.
