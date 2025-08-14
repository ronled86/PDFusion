import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ToolButton } from './ToolButton';

interface PageSelectorProps {
  totalPages: number;
  onRotateSelected: (degrees: number) => void;
}

export const PageSelector: React.FC<PageSelectorProps> = ({ totalPages, onRotateSelected }) => {
  const { state, dispatch } = useAppContext();
  const { selectedPages, selectionMode } = state;

  const toggleSelectionMode = () => {
    dispatch({ type: 'SET_SELECTION_MODE', payload: !selectionMode });
    if (selectionMode) {
      // Clear selection when exiting selection mode
      dispatch({ type: 'CLEAR_PAGE_SELECTION' });
    }
  };

  const selectAllPages = () => {
    dispatch({ type: 'SELECT_ALL_PAGES', payload: totalPages });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_PAGE_SELECTION' });
  };

  const togglePageSelection = (pageIndex: number) => {
    dispatch({ type: 'TOGGLE_PAGE_SELECTION', payload: pageIndex });
  };

  if (!selectionMode) {
    return (
      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl p-3 shadow-sm">
        <ToolButton
          icon="cursor"
          label="Select Pages"
          onClick={toggleSelectionMode}
          variant="glassmorphism"
          size="sm"
          tooltip="Enable page selection mode to rotate multiple pages"
        />
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl p-4 shadow-sm space-y-3">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ToolButton
            icon="cursor"
            label="Exit Selection"
            onClick={toggleSelectionMode}
            variant="secondary"
            size="sm"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedPages.size} of {totalPages} pages selected
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <ToolButton
            icon="cursor"
            label="Select All"
            onClick={selectAllPages}
            variant="glassmorphism"
            size="sm"
          />
          <ToolButton
            icon="cursor"
            label="Clear"
            onClick={clearSelection}
            variant="glassmorphism"
            size="sm"
          />
        </div>
      </div>

      {/* Page Grid */}
      <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => togglePageSelection(i)}
            className={`
              w-10 h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium
              ${selectedPages.has(i)
                ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm text-gray-600'
              }
            `}
            title={`Page ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Rotation Controls */}
      {selectedPages.size > 0 && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Rotate Selected Pages:
            </span>
            <div className="flex items-center space-x-1">
              <ToolButton
                icon="rotateLeft"
                label="Rotate Left"
                onClick={() => onRotateSelected(-90)}
                variant="glassmorphism"
                size="sm"
                tooltip="Rotate selected pages 90° left"
              />
              <ToolButton
                icon="rotateRight"
                label="Rotate Right"
                onClick={() => onRotateSelected(90)}
                variant="glassmorphism"
                size="sm"
                tooltip="Rotate selected pages 90° right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
