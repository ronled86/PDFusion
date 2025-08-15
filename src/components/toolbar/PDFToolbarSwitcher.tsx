import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import PDFToolsToolbar from './PDFToolsToolbar';

interface PDFToolbarSwitcherProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  selectedPagesCount: number;
}

export const PDFToolbarSwitcher: React.FC<PDFToolbarSwitcherProps> = ({
  onRotateLeft,
  onRotateRight,
  selectedPagesCount
}) => {
  const { state, dispatch } = useAppContext();

  const switchPDFToolbar = (toolbar: 'tools1' | 'tools2') => {
    dispatch({ type: 'SET_ACTIVE_PDF_TOOLBAR', payload: toolbar });
  };

  // Keyboard shortcuts for PDF toolbar switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            switchPDFToolbar('tools1');
            break;
          case '2':
            e.preventDefault();
            switchPDFToolbar('tools2');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {/* PDF Toolbar Toggle Buttons */}
      <div className="absolute top-2 right-4 z-30 flex items-center space-x-1 bg-white/90 backdrop-blur-lg border border-white/30 rounded-lg p-1 shadow-lg">
        <button
          onClick={() => switchPDFToolbar('tools1')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group ${
            state.activePDFToolbar === 'tools1'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Annotation Tools (Alt+Shift+1)"
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Annotate
        </button>
        <button
          onClick={() => switchPDFToolbar('tools2')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group ${
            state.activePDFToolbar === 'tools2'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title="Basic Tools (Alt+Shift+2)"
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Basic
        </button>
        {/* Selected pages indicator */}
        {selectedPagesCount > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {selectedPagesCount}
          </span>
        )}
      </div>

      {/* PDF Toolbar Content */}
      <div className="transition-all duration-300 ease-in-out">
        {state.activePDFToolbar === 'tools1' ? (
          <PDFToolsToolbar
            onRotateLeft={onRotateLeft}
            onRotateRight={onRotateRight}
            selectedPagesCount={selectedPagesCount}
          />
        ) : (
          <div>Tools2 content goes here</div>
        )}
      </div>

      {/* Toolbar Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
      <div 
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-12 rounded-t transition-all duration-300 ${
          state.activePDFToolbar === 'tools1' ? 'bg-purple-500' : 'bg-green-500'
        }`}
      ></div>
    </div>
  );
};
